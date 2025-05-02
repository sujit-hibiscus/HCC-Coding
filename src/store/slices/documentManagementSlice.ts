import { postData } from "@/lib/api/api-client";
import { formatToMMDDYYYYIfNeeded, maskFileName } from "@/lib/utils";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// Types
export interface Document {
    id: string
    name: string
    url: string
    status: "pending" | "in_progress" | "on_hold" | "completed"
    assignedAt: string
    assignId: string
    timeSpent: number
    startTime?: number
    pauseTimes?: { start: number; end: number }[]
}

export interface FormData {
    codesMissed: Array<{ value: string; label: string }>
    codesCorrected: Array<{ value: string; label: string }>
    auditRemarks: string
    rating: number
}

interface DocumentManagementState {
    documents: Document[]
    loading: boolean
    error: string | null

    selectedDocumentId: string | null
    pdfUrl: string | null
    pdfLoading: boolean
    fetchedPdfPaths: string[] // Add this to track fetched PDF paths

    isRunning: boolean
    elapsedTime: number
    startTime: number | null

    // Form data for each document
    formData: Record<string, FormData>
}

type AnalystAssignment = {
    id: number
    assigned_date: string
    chart_start: string
}
type auditor_assignments = {
    id: number
    assigned_date: string
    chart_start: string
}

type DataItem = {
    id: number
    title: string
    file_size: number
    file_path: string
    status: number
    analyst_assignments?: AnalystAssignment[]
    auditor_assignments?: auditor_assignments[]
}

interface ApiResponse {
    data: DataItem[]
    status: "Success" | "Not Found" | "Error"
    message: string
}

// Async thunks
export const fetchDocuments = createAsyncThunk("documentManagement/fetchDocuments", async (_, { getState }) => {
    const state = getState() as { documentManagement: DocumentManagementState; user: { userType: "Analyst" | "Auditor" } };
    const userType = state.user.userType;

    const api = await postData("get_charts/", {
        id: userType === "Analyst" ? 3 : 4,
        role: userType,
    });
    const apiRes = api.data as ApiResponse;

    if (apiRes.status === "Success") {
        const response = apiRes?.data?.map((item) => {
            const { id = "", title = "", file_path = "", status } = item;
            return {
                id,
                name: maskFileName(title),
                url: file_path,
                assignId: userType === "Analyst" ? item.analyst_assignments?.[0]?.id ?? "" : item.auditor_assignments?.[0]?.id ?? "",
                status: status === (userType === "Analyst" ? 1 : 3) ? "pending" : status === (userType === "Analyst" ? 2 : 4) ? "in_progress" : "completed",
                assignedAt: formatToMMDDYYYYIfNeeded(userType === "Analyst" ? item.analyst_assignments?.[0]?.assigned_date ?? "" : item?.auditor_assignments?.[0]?.assigned_date ?? ""),
                timeSpent: 0,
            } as Document;
        });
        return response;
    } else {
        toast.error(`${apiRes.message}`);
        return [];
    }
});
export const startReviewWithApi = createAsyncThunk(
    "documentManagement/startReviewWithApi",
    async (document: Document, { rejectWithValue }) => {
        try {
            const response = await postData("update_analyst_charts/", {
                id: document.id,
                assignment_id: document.assignId || "",
                status: 2,
                start_time: "True",
                end_time: "False",
            });
            return response;

            // Check if the response indicates success
            /*  if (response.status === "Success") {
                       // You can return any data you want to use in the reducer
                       return {
                           documentId: document.id,
                           timestamp: Date.now(),
                       };
                   } else {
                       // If the API returns an error status
                       toast.error(response.message || "Failed to start review");
                       return rejectWithValue(response.message || "Failed to start review");
                   } */
        } catch (error) {
            // Handle any exceptions during the API call
            const errorMessage = error instanceof Error ? error.message : "Failed to start review";
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    },
);
export const completeReviewWithAPI = createAsyncThunk(
    "documentManagement/completeReviewWithApi",
    async (document: Document, { rejectWithValue }) => {
        try {
            const response = await postData("update_analyst_charts/", {
                id: document.id,
                assignment_id: document.assignId || "",
                status: 3,
                start_time: "False",
                end_time: "True",
            });
            const apiRes = response.data as ApiResponse;
            return apiRes;

            // Check if the response indicates success
            /*  if (response.status === "Success") {
                       // You can return any data you want to use in the reducer
                       return {
                           documentId: document.id,
                           timestamp: Date.now(),
                       };
                   } else {
                       // If the API returns an error status
                       toast.error(response.message || "Failed to start review");
                       return rejectWithValue(response.message || "Failed to start review");
                   } */
        } catch (error) {
            // Handle any exceptions during the API call
            const errorMessage = error instanceof Error ? error.message : "Failed to start review";
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    },
);
export const startReviewAuditorWithApi = createAsyncThunk(
    "documentManagement/startReviewWithApi",
    async (document: Document, { rejectWithValue }) => {
        try {
            await postData("update_auditor_charts/", {
                id: document.id,
                assignment_id: document.assignId || "",
                status: 4,
                start_time: "True",
                end_time: "False",
            });

            // Check if the response indicates success
            /*  if (response.status === "Success") {
                             // You can return any data you want to use in the reducer
                             return {
                                 documentId: document.id,
                                 timestamp: Date.now(),
                             };
                         } else {
                             // If the API returns an error status
                             toast.error(response.message || "Failed to start review");
                             return rejectWithValue(response.message || "Failed to start review");
                         } */
        } catch (error) {
            // Handle any exceptions during the API call
            const errorMessage = error instanceof Error ? error.message : "Failed to start review";
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    },
);

interface AuditorReviewPayload {
    doc: Document;
    body: {
        codes_corrected: string[];
        codes_missed: string[];
        rating: number | string;
        audit_remarks: string;
    };
}
export const completeReviewAuditorWithAPI = createAsyncThunk<
    ApiResponse, // return type
    AuditorReviewPayload, // argument type
    { rejectValue: string } // reject value type
>(
    "documentManagement/completeReviewWithApi",
    async ({ doc, body }, { rejectWithValue }) => {
        try {
            const response = await postData("update_auditor_charts/", {
                id: doc.id,
                assignment_id: doc.assignId || "",
                status: 5,
                start_time: "False",
                end_time: "True",
                ...body,
            });

            return response.data as ApiResponse;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to start review";
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);
// Update fetchPdfFile to check if we've already fetched this PDF
export const fetchPdfFile = createAsyncThunk<string, string>(
    "pdf/fetchPdfFile",
    async (pdfFilePath, { rejectWithValue, getState }) => {
        try {
            // Check if we've already fetched this PDF
            const state = getState() as { documentManagement: DocumentManagementState };
            const { fetchedPdfPaths } = state.documentManagement;

            // If we've already fetched this PDF, return the existing URL
            if (fetchedPdfPaths.includes(pdfFilePath) && state.documentManagement.pdfUrl) {
                return state.documentManagement.pdfUrl;
            }

            const response = await postData<Blob>("view_pdf/", { file_path: pdfFilePath }, { responseType: "blob" });
            const blobUrl = `${URL.createObjectURL(response.data)}__${pdfFilePath}`;
            return blobUrl;
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    },
);

export const autoAssign = createAsyncThunk("documentManagement/assign", async (_, { rejectWithValue }) => {
    try {
        const response = await postData("assign_charts_analyst/");
        const responseData = response.data as { status: string; message: string };
        if (responseData.status === "Success") {
            toast.success(responseData?.message);
        } else {
            toast.error(responseData?.message);
        }
    } catch (error) {
        // Handle any exceptions during the API call
        const errorMessage = error instanceof Error ? error.message : "Failed to start review";
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
    }
});

const initialState: DocumentManagementState = {
    documents: [],
    loading: false,
    error: null,
    selectedDocumentId: null,
    pdfUrl: null,
    pdfLoading: false,
    fetchedPdfPaths: [], // Initialize the array to track fetched PDFs
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
    formData: {},
};

const documentManagementSlice = createSlice({
    name: "documentManagement",
    initialState,
    reducers: {
        /*  startReview: (state, action: PayloadAction<string>) => {
                 const document = state.documents.find((doc) => doc.id === action.payload);
                 if (document) {
                     document.status = "in_progress";
                     document.startTime = Date.now();
                 }
             }, */
        pauseReview: (state, action: PayloadAction<string>) => {
            const document = state.documents.find((doc) => doc.id === action.payload);
            if (document && document.startTime) {
                document.status = "on_hold";
                const pauseTime = Date.now();
                const timeElapsed = Math.floor((pauseTime - document.startTime) / 1000);
                document.timeSpent = (document.timeSpent || 0) + timeElapsed;

                if (!document.pauseTimes) document.pauseTimes = [];
                document.pauseTimes.push({ start: pauseTime, end: 0 });
                document.startTime = undefined;
            }
        },
        resumeReview: (state, action: PayloadAction<string>) => {
            const document = state.documents.find((doc) => doc.id === action.payload);
            if (document) {
                document.status = "in_progress";
                document.startTime = Date.now();

                if (document.pauseTimes && document.pauseTimes.length > 0) {
                    const lastPause = document.pauseTimes[document.pauseTimes.length - 1];
                    if (lastPause.end === 0) {
                        lastPause.end = Date.now();
                    }
                }
            }
        },
        updateDocumentTime: (state, action: PayloadAction<{ id: string; time: number }>) => {
            const document = state.documents.find((doc) => doc.id === action.payload.id);
            if (document) {
                document.timeSpent = action.payload.time;
            }
        },
        recalculateDocumentTimes: (state) => {
            state.documents.forEach((doc) => {
                if (doc.status === "in_progress" && doc.startTime) {
                    const now = Date.now();
                    const additionalTime = Math.floor((now - doc.startTime) / 1000);
                    doc.timeSpent = (doc.timeSpent || 0) + additionalTime;
                    doc.startTime = now;
                }
            });
        },

        selectDocument: (state, action: PayloadAction<string | null>) => {
            state.selectedDocumentId = action.payload;
            if (action.payload) {
                const selectedDoc = state.documents.find((doc) => doc.id === action.payload);
                if (selectedDoc && selectedDoc.status === "in_progress") {
                    state.isRunning = true;
                    state.startTime = Date.now();
                } else {
                    state.isRunning = false;
                }
            } else {
                state.isRunning = false;
            }
        },
        resetTimer: (state) => {
            state.isRunning = false;
            state.elapsedTime = 0;
            state.startTime = null;
        },
        updateElapsedTime: (state) => {
            if (state.isRunning && state.startTime) {
                const now = Date.now();
                state.elapsedTime = Math.floor((now - state.startTime) / 1000);
            }
        },
        pauseTimerOnly: (state) => {
            state.isRunning = false;
            if (state.startTime) {
                const now = Date.now();
                const additionalTime = Math.floor((now - state.startTime) / 1000);
                state.elapsedTime += additionalTime;
                state.startTime = null;
            }
        },
        // New reducers for form data
        updateFormData: (state, action: PayloadAction<{ documentId: string; data: Partial<FormData> }>) => {
            const { documentId, data } = action.payload;

            if (!state.formData[documentId]) {
                state.formData[documentId] = {
                    codesMissed: [],
                    codesCorrected: [],
                    auditRemarks: "",
                    rating: 0,
                };
            }

            state.formData[documentId] = {
                ...state.formData[documentId],
                ...data,
            };
        },
        resetFormData: (state, action: PayloadAction<string>) => {
            const documentId = action.payload;
            if (state.formData[documentId]) {
                state.formData[documentId] = {
                    codesMissed: [],
                    codesCorrected: [],
                    auditRemarks: "",
                    rating: 0,
                };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDocuments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = action.payload;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch documents";
            })
            .addCase(fetchPdfFile.pending, (state) => {
                state.pdfLoading = true;
                state.error = null;
            })
            .addCase(fetchPdfFile.fulfilled, (state, action) => {
                state.pdfLoading = false;
                state.pdfUrl = action.payload;

                // Get the PDF path from the action payload
                const pdfPath = action.meta.arg;

                // Add this path to our tracking array if it's not already there
                if (!state.fetchedPdfPaths.includes(pdfPath)) {
                    state.fetchedPdfPaths.push(pdfPath);
                }
            })
            .addCase(fetchPdfFile.rejected, (state, action) => {
                state.pdfLoading = false;
                state.error = action.error.message || "Failed to fetch PDF file";
                toast.error("Failed to load PDF file");
            });
    },
});

export const {
    pauseReview,
    resumeReview,
    updateDocumentTime,
    recalculateDocumentTimes,
    selectDocument,
    resetTimer,
    updateElapsedTime,
    pauseTimerOnly,
    // Export new actions
    updateFormData,
    resetFormData,
} = documentManagementSlice.actions;

export default documentManagementSlice.reducer;
