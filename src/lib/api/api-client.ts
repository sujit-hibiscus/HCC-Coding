import store, { resetReduxStore } from "@/store";
import toast from "react-hot-toast";
import { logout } from "../utils";

export interface ExtendedRequestInit extends RequestInit {
    baseURL?: string
    timeout?: number
    params?: Record<string, string>
    responseType?: "json" | "text" | "blob" | "arrayBuffer" | "formData"
    withCredentials?: boolean
}

export interface ApiResponse<T> {
    data: T
    status: number
    headers: Headers
    ok: boolean
}

export class FetchError extends Error {
    status?: number;
    statusText?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    response?: Response;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message: string, response?: Response, data?: any) {
        super(message);
        this.name = "FetchError";
        this.response = response;
        this.status = response?.status;
        this.statusText = response?.statusText;
        this.data = data;
    }
}

export const TokenManager = {
    getToken: (): string | null => {
        if (typeof window === "undefined") return null;

        const token = localStorage.getItem("authToken");
        if (token) return token;

        return getCookie("authToken");
    },

    setToken: (token: string): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem("authToken", token);
    },

    removeToken: (): void => {
        if (typeof window === "undefined") return;
        localStorage.removeItem("authToken");
        document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },

    useStaticToken: (): string => {
        return "static-token-for-development";
    },
};

const getCookie = (name: string): string | null => {
    if (typeof window === "undefined") return null;

    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((row) => row.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

const createFetchClient = () => {
    const baseURL = "http://localhost:3000/";
    const defaultTimeout = 30000;

    const requestInterceptor = (options: ExtendedRequestInit): ExtendedRequestInit => {
        if (typeof window !== "undefined") {
            const token = TokenManager.getToken() || store.getState().user.token;
            if (token) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${token}`
                };
            }
        }
        return {
            ...options,
            cache: "no-store",
            next: { revalidate: 0 },
        };
    };

    const responseInterceptor = async (response: Response): Promise<Response> => {
        if (response.status === 401) {
            if (typeof window !== "undefined") {
                toast.error("Your session has expired or the token is invalid. Please log in again.");
                TokenManager.removeToken();
                await logout();
                await resetReduxStore();
                window.location.href = "/";
            }
        }
        return response;
    };

    // Parse response based on responseType
    const parseResponse = async <T>(response: Response, responseType?: string): Promise<T> => {
        switch (responseType) {
            case "text":
                return await response.text() as unknown as T;
            case "blob":
                return await response.blob() as unknown as T;
            case "arrayBuffer":
                return await response.arrayBuffer() as unknown as T;
            case "formData":
                return await response.formData() as unknown as T;
            case "json":
            default:
                return await response.json() as T;
        }
    };

    // Main fetch function with timeout and caching options
    const fetchWithTimeout = async <T>(
        url: string,
        options: ExtendedRequestInit = {}
    ): Promise<ApiResponse<T>> => {
        const fullUrl = url.startsWith("http")
            ? url
            : `${options.baseURL || baseURL}${url}`;

        const urlWithParams = options.params
            ? `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}${new URLSearchParams(options.params)}`
            : fullUrl;

        const interceptedOptions = requestInterceptor(options);

        const timeout = options.timeout || defaultTimeout;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            if (options.method === "GET" || !options.method) {
                if (!("cache" in interceptedOptions)) {
                    interceptedOptions.cache = "force-cache";
                }

                if (!("next" in interceptedOptions) && !options.next) {
                    interceptedOptions.next = { revalidate: 3600 }; // Default to 1 hour
                }
            }

            // Handle credentials
            if (options.withCredentials) {
                interceptedOptions.credentials = "include";
            }

            let headers: Record<string, string> = {};

            if (interceptedOptions.headers instanceof Headers) {
                headers = Object.fromEntries(
                    Array.from(interceptedOptions.headers.entries())
                ) as Record<string, string>;
            } else if (interceptedOptions.headers && typeof interceptedOptions.headers === "object") {
                headers = { ...interceptedOptions.headers } as Record<string, string>;
            }

            if (!(interceptedOptions.body instanceof FormData)) {
                headers["Content-Type"] = "application/json";
            }


            const response = await fetch(urlWithParams, {
                ...interceptedOptions,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const interceptedResponse = await responseInterceptor(response);

            /* if (!interceptedResponse.ok) {
                await handleFetchError(interceptedResponse);
            } */

            const data = await parseResponse<T>(interceptedResponse, options.responseType);

            return {
                data,
                status: interceptedResponse.status,
                headers: interceptedResponse.headers,
                ok: interceptedResponse.ok,
            };
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof DOMException && error.name === "AbortError") {
                console.error(`❌ Fetch request timed out after ${timeout}ms`, error);
                toast.error(`⏳ Request timed out after ${timeout}ms. Please try again.`);
            }

            throw error;
        }

    };

    return {
        get: <T>(url: string, options: ExtendedRequestInit = {}): Promise<ApiResponse<T>> =>
            fetchWithTimeout<T>(url, { ...options, method: "GET" }),

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        post: <T>(url: string, data?: any, options: ExtendedRequestInit = {}): Promise<ApiResponse<T>> =>
            fetchWithTimeout<T>(url, {
                ...options,
                method: "POST",
                body: data instanceof FormData ? data : JSON.stringify(data),
            }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        put: <T>(url: string, data?: any, options: ExtendedRequestInit = {}): Promise<ApiResponse<T>> =>
            fetchWithTimeout<T>(url, {
                ...options,
                method: "PUT",
                body: data instanceof FormData ? data : JSON.stringify(data),
            }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        patch: <T>(url: string, data?: any, options: ExtendedRequestInit = {}): Promise<ApiResponse<T>> =>
            fetchWithTimeout<T>(url, {
                ...options,
                method: "PATCH",
                body: data instanceof FormData ? data : JSON.stringify(data),
            }),

        delete: <T>(url: string, options: ExtendedRequestInit = {}): Promise<ApiResponse<T>> =>
            fetchWithTimeout<T>(url, { ...options, method: "DELETE" }),

        // FormData specific methods
        postForm: <T>(url: string, formData: FormData, options: ExtendedRequestInit = {}): Promise<ApiResponse<T>> =>
            fetchWithTimeout<T>(url, {
                ...options,
                method: "POST",
                body: formData,
            }),

        putForm: <T>(url: string, formData: FormData, options: ExtendedRequestInit = {}): Promise<ApiResponse<T>> =>
            fetchWithTimeout<T>(url, {
                ...options,
                method: "PUT",
                body: formData,
            }),

        patchForm: <T>(url: string, formData: FormData, options: ExtendedRequestInit = {}): Promise<ApiResponse<T>> =>
            fetchWithTimeout<T>(url, {
                ...options,
                method: "PATCH",
                body: formData,
            }),

        // Download file
        downloadFile: async (url: string, options: ExtendedRequestInit = {}): Promise<Blob> => {
            const response = await fetchWithTimeout<Blob>(url, {
                ...options,
                method: "GET",
                responseType: "blob",
                cache: "no-cache"
            });
            return response.data;
        },

        // Upload file with progress tracking
        uploadFile: async <T>(
            url: string,
            file: File,
            onProgress?: (progress: number) => void,
            options: ExtendedRequestInit = {}
        ): Promise<ApiResponse<T>> => {
            // If browser supports XMLHttpRequest with upload progress
            if (typeof XMLHttpRequest !== "undefined" && onProgress) {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    const formData = new FormData();
                    formData.append("file", file);

                    // Add any additional fields from options.body if it exists and is an object
                    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        Object.entries(options.body as Record<string, any>).forEach(([key, value]) => {
                            formData.append(key, value);
                        });
                    }

                    xhr.open("POST", url, true);

                    // Add headers
                    const token = TokenManager.getToken();
                    if (token) {
                        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                    }

                    if (options.headers) {
                        Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
                            xhr.setRequestHeader(key, value);
                        });
                    }

                    // Track progress
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const progress = Math.round((e.loaded / e.total) * 100);
                            onProgress(progress);
                        }
                    };

                    xhr.onload = function () {
                        if (this.status >= 200 && this.status < 300) {
                            let data;
                            try {
                                data = JSON.parse(xhr.responseText);
                            } catch (e) {
                                console.info("🚀 ~ error ~ e:", e);
                                data = xhr.responseText;
                            }

                            resolve({
                                data,
                                status: xhr.status,
                                headers: new Headers(xhr.getAllResponseHeaders().split("\r\n").reduce<Record<string, string>>((result, current) => {
                                    const [name, value] = current.split(": ");
                                    if (name) result[name] = value;
                                    return result;
                                }, {})),
                                ok: true
                            });
                        } else {
                            reject(new FetchError(`Error ${xhr.status}: ${xhr.statusText}`, undefined, xhr.responseText));
                        }
                    };


                    xhr.onerror = function () {
                        reject(new FetchError("Network error occurred", undefined));
                    };

                    xhr.send(formData);
                });
            } else {
                // Fallback to regular fetch if XMLHttpRequest not available or no progress needed
                const formData = new FormData();
                formData.append("file", file);

                // Add any additional fields from options.body if it exists and is an object
                if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    Object.entries(options.body as Record<string, any>).forEach(([key, value]) => {
                        formData.append(key, value);
                    });
                }

                return fetchWithTimeout<T>(url, {
                    ...options,
                    method: "POST",
                    body: formData,
                });
            }
        }
    };
};

const fetchClient = createFetchClient();

export const fetchData = <T>(url: string, options?: ExtendedRequestInit): Promise<ApiResponse<T>> => {
    return fetchClient.get<T>(url, options);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const postData = <T>(url: string, data?: any, options?: ExtendedRequestInit): Promise<ApiResponse<T>> => {
    return fetchClient.post<T>(url, data, options);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const putData = <T>(url: string, data?: any, options?: ExtendedRequestInit): Promise<ApiResponse<T>> => {
    return fetchClient.put<T>(url, data, options);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const patchData = <T>(url: string, data?: any, options?: ExtendedRequestInit): Promise<ApiResponse<T>> => {
    return fetchClient.patch<T>(url, data, options);
};

export const deleteData = <T>(url: string, options?: ExtendedRequestInit): Promise<ApiResponse<T>> => {
    return fetchClient.delete<T>(url, options);
};

export const postFormData = <T>(url: string, formData: FormData, options?: ExtendedRequestInit): Promise<ApiResponse<T>> => {
    return fetchClient.postForm<T>(url, formData, options);
};

export const putFormData = <T>(url: string, formData: FormData, options?: ExtendedRequestInit): Promise<ApiResponse<T>> => {
    return fetchClient.putForm<T>(url, formData, options);
};

export const patchFormData = <T>(url: string, formData: FormData, options?: ExtendedRequestInit): Promise<ApiResponse<T>> => {
    return fetchClient.patchForm<T>(url, formData, options);
};

export const downloadFile = (url: string, options?: ExtendedRequestInit): Promise<Blob> => {
    return fetchClient.downloadFile(url, options);
};

export const uploadFile = <T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    options?: ExtendedRequestInit
): Promise<ApiResponse<T>> => {
    return fetchClient.uploadFile<T>(url, file, onProgress, options);
};

export default fetchClient;
