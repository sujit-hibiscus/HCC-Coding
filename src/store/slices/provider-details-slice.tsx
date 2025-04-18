import { fetchData, postData } from "@/lib/api/api-client";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// Define types
interface ProviderDetail {
    id: string
    first_name: string
    last_name: string
    DOB: string
    DOD: string
    sex: string
    marital_status: string
    company_plan_coinsurance: string
    PCP: string
    home_address: string
    billing_address: string
    status: string
}

export interface ProviderDetailRes {
    data: ProviderDetail
    message: string
}

// New type for progress notes
interface ProgressNote {
    id: string
    doc_title: string
    doc_path: string
    doc_date: string
}

// New type for analysis documents

interface AnalysisDoc {
    text: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: any
    id: string
}

type MedicalCondition = {
    member_documents: {
        doc_file_name: string
        doc_path: string
    }
    concept: string
    category: string
    analyst_review_status: string
    provider_notes: string
    analyst_notes: string
    provider_review_status: string
    hcc_v24: number
    hcc_v28: number
}

export type ChartDetailsData = {
    id: string
    chart_type: string
    analyst: string
    appointment: {
        DOS: string
        facility: string
    }
    member: {
        id: string
        first_name: string
        last_name: string
        DOB: string
        PCP: string
    }
    medical_conditions: MedicalCondition[]
}

type apiDocData = {
    id: string
    doc_title: string
    doc_path: string | null
    doc_date: string
}

type apiResponse = {
    status: "Success" | "Not Found" | "Error"
    message: string
    data: apiDocData[]
}

type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONObject;

interface JSONObject {
    [key: string]: JSONValue;
}
interface jsonEditorData {
    file_name: string,
    text: string,
    json: JSONObject

}

type apiJsonResponse = {
    status: "Success" | "Not Found" | "Error"
    message: string
    data: jsonEditorData[]
}

interface ChartApiResponse {
    data: ChartDetailsData
    status: "Success" | "Not Found" | "Error"
    message: string
}

interface ProviderApiResponse {
    data: ProviderDetail
    status: "Success" | "Not Found" | "Error"
    message: string
}

export interface ChartDetailsRes {
    data: ChartDetailsData
    message: string
}

// Updated state interface to include analysisdocs
interface ProviderDetailState {
    pdfLoading: boolean
    member: {
        [id: string]: {
            data: ProviderDetail | null
            status: "PENDING" | "SUCCEEDED" | "FAILED"
            error?: string | null
            progressNotes?: {
                data: ProgressNote[] | null
                status: "PENDING" | "SUCCEEDED" | "FAILED"
                error?: string | null
                search: string
                pdfData?: {
                    id: string
                    status: "PENDING" | "SUCCEEDED" | "FAILED" | "PDF"
                    pdfUrl: string
                }
            }
            otherDocs?: {
                data: ProgressNote[] | null
                status: "PENDING" | "SUCCEEDED" | "FAILED"
                error?: string | null
                search: string
                pdfData?: {
                    id: string
                    status: "PENDING" | "SUCCEEDED" | "FAILED" | "PDF"
                    pdfUrl: string
                }
            }
            labDocs?: {
                data: ProgressNote[] | null
                status: "PENDING" | "SUCCEEDED" | "FAILED"
                error?: string | null
                search: string
                pdfData?: {
                    id: string
                    status: "PENDING" | "SUCCEEDED" | "FAILED" | "PDF"
                    pdfUrl: string
                }
            }
            // New field for analysis documents
            analysisdocs?: {
                data: AnalysisDoc[] | null
                status: "PENDING" | "SUCCEEDED" | "FAILED"
                error?: string | null
                currentPage: number
                totalPages: number
                message?: string
            }
        }
    }
    chart: {
        [id: string]: {
            data: ChartDetailsData | null
            status: "PENDING" | "SUCCEEDED" | "FAILED"
            error?: string | null
        }
    }
}

const initialState: ProviderDetailState = {
    pdfLoading: false,
    member: {},
    chart: {},
};

// Get member profile
export const getProviderDetail = createAsyncThunk<ProviderDetailRes, string, { rejectValue: string }>(
    "provider/getProviderDetail",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetchData<ProviderApiResponse>(`/get/member-details/${id}/`);
            if (response.data.status === "Success") {
                // toast.success(`${response?.data.message}`)
                return {
                    data: {
                        ...response?.data?.data,
                        id: id,
                    },
                    message: response?.data?.message,
                };
            } else {
                toast.error(`${response?.data.message}`);
                return rejectWithValue("Failed to fetch provider details");
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    },
);

/* get chart details */
export const getChartDetails = createAsyncThunk<ChartDetailsRes, string, { rejectValue: string }>(
    "provider/getChartDetails",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetchData<ChartApiResponse>(`/get/chart-details/${id}/`);
            if (response.data.status === "Success") {
                // toast.success(`${response?.data.message}`)
            } else {
                toast.error(`${response?.data.message}`);
            }
            return {
                data: { ...response?.data?.data, id: id },
                message: response?.data?.message,
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    },
);

export const getMemberProgressNotes = createAsyncThunk<
    { chartId: string; progressNotes: ProgressNote[] },
    { chartId: string; memberId: string },
    { rejectValue: string }
>("provider/getMemberProgressNotes", async ({ chartId, memberId }, { rejectWithValue }) => {
    try {
        const response = await postData<apiResponse>("/get/member_docs/progress_notes/", {
            member_id: memberId,
        });

        if (response.data.status === "Success") {
            // toast.success(`${response?.data.message}`)
            const allAPIData = response?.data.status === "Success" ? response?.data?.data : [];
            return {
                chartId,
                progressNotes: allAPIData as ProgressNote[],
                message: response.data.message,
            };
        } else {
            toast.error(`${response?.data.message}`);
            return rejectWithValue("Failed to fetch progress notes");
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
        return rejectWithValue("Something went wrong");
    }
});

export const getOtherDocs = createAsyncThunk<
    { chartId: string; otherDocs: ProgressNote[] },
    { chartId: string; memberId: string },
    { rejectValue: string }
>("provider/getOtherDocs", async ({ chartId, memberId }, { rejectWithValue }) => {
    try {
        const response = await postData<apiResponse>("/get/member_docs/other_docs/", {
            member_id: memberId,
        });
        if (response.data.status === "Success") {
            // toast.success(`${response?.data.message}`)
        } else {
            toast.error(`${response?.data.message}`);
        }
        const allAPIData = response?.data.status === "Success" ? response?.data?.data : [];
        return {
            chartId,
            otherDocs: allAPIData as ProgressNote[],
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
        return rejectWithValue("Something went wrong");
    }
});

export const getLabDocs = createAsyncThunk<
    { chartId: string; labDocs: ProgressNote[] },
    { chartId: string; memberId: string },
    { rejectValue: string }
>("provider/getLabDocs", async ({ chartId, memberId }, { rejectWithValue }) => {
    try {
        const response = await postData<apiResponse>("/get/member_docs/lab_result/", {
            member_id: memberId,
        });

        if (response.data.status === "Success") {
            // toast.success(`${response?.data.message}`)
        } else {
            toast.error(`${response?.data.message}`);
        }
        const allAPIData = response?.data.status === "Success" ? response?.data?.data : [];
        return {
            chartId,
            labDocs: allAPIData as ProgressNote[],
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
        return rejectWithValue("Something went wrong");
    }
});

export const getAnalysisDocuments = createAsyncThunk<
    { memberId: string; analysisData: AnalysisDoc[], message: string },
    { member_id: string, file_name: string },
    { rejectValue: string }
>("provider/getAnalysisDocuments", async ({ member_id }, { rejectWithValue }) => {
    try {
        const bodyData = {
            "member_id": "110035980",
            "file_name": "Follow_Up_2_11_2025"
        };
        /*   const bodyData = {
              "member_id": member_id,
              "file_name": file_name
          } */

        const response = await postData<apiJsonResponse>("/get/member_progress_files/", bodyData);
        if (response.data.status === "Success") {
            const analysisData: AnalysisDoc[] = response.data.data?.map(item => ({ ...item, id: item?.file_name }));
            return {
                memberId: member_id,
                analysisData,
                message: response.data.message
            };
        } else {
            toast.error(`${response?.data.message}`);
            return {
                memberId: member_id,
                analysisData: [],
                message: response.data.message
            };
        }

    } catch (error: unknown) {
        if (error instanceof Error) {
            return rejectWithValue(error.message);
        }
        return rejectWithValue("Something went wrong");
    }
});

export const fetchPdfFile = createAsyncThunk<string, string>(
    "pdf/fetchPdfFile",
    async (pdfFilePath, { rejectWithValue }) => {
        try {
            const response = await postData<Blob>("/get/view-pdf/", { pdf_file_path: pdfFilePath }, { responseType: "blob" });

            const blobUrl = `${URL.createObjectURL(response.data)}__${pdfFilePath}`;

            await new Promise((resolve) => setTimeout(resolve, 1000));

            return blobUrl;
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    },
);

type SetLoadingProgressNotePayload = {
    ID: string
    pdfData: {
        id: string
        status: "PENDING" | "SUCCEEDED" | "FAILED" | "PDF"
        pdfUrl: string
    }
}

const providerDetailSlice = createSlice({
    name: "providerDetail",
    initialState,
    reducers: {
        setLoadingProgressNoteDoc(state, action: PayloadAction<SetLoadingProgressNotePayload>) {
            const { ID, pdfData } = action.payload;

            if (state.member[ID]) {
                if (state.member[ID].progressNotes) {
                    state.member[ID].progressNotes!.pdfData = pdfData;
                }
            }
        },
        setLoadingOtherDoc(state, action: PayloadAction<SetLoadingProgressNotePayload>) {
            const { ID, pdfData } = action.payload;

            if (state.member[ID]) {
                if (state.member[ID].otherDocs) {
                    state.member[ID].otherDocs!.pdfData = pdfData;
                }
            }
        },
        setLoadingLabDoc(state, action: PayloadAction<SetLoadingProgressNotePayload>) {
            const { ID, pdfData } = action.payload;

            if (state.member[ID]) {
                if (state.member[ID].labDocs) {
                    state.member[ID].labDocs!.pdfData = pdfData;
                }
            }
        },
        storeProgressNoteSearch(state, action: PayloadAction<{ ID: string; searchTerm: string }>) {
            const { ID, searchTerm } = action.payload;

            if (state.member[ID]) {
                if (state.member[ID].progressNotes) {
                    state.member[ID].progressNotes.search = searchTerm;
                }
            }
        },
        storeLabDocsSearch(state, action: PayloadAction<{ ID: string; searchTerm: string }>) {
            const { ID, searchTerm } = action.payload;

            if (state.member[ID]) {
                if (state.member[ID].labDocs) {
                    state.member[ID].labDocs.search = searchTerm;
                }
            }
        },
        storeOtherDocSearch(state, action: PayloadAction<{ ID: string; searchTerm: string }>) {
            const { ID, searchTerm } = action.payload;

            if (state.member[ID]) {
                if (state.member[ID].otherDocs) {
                    state.member[ID].otherDocs.search = searchTerm;
                }
            }
        },
        // New reducer for changing analysis document page
        changeAnalysisPage(state, action: PayloadAction<{ memberId: string; page: number }>) {
            const { memberId, page } = action.payload;

            if (state.member[memberId]?.analysisdocs) {
                const totalPages = state.member[memberId].analysisdocs?.data?.length || 0;

                if (page >= 0 && page < totalPages) {
                    // Create a new object to ensure immutability
                    state.member[memberId] = {
                        ...state.member[memberId],
                        analysisdocs: {
                            ...state.member[memberId].analysisdocs!,
                            currentPage: page,
                        },
                    };
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProviderDetail.pending, (state, action) => {
                const id = action.meta.arg;
                state.member[id] = { data: null, status: "PENDING", error: null };
            })
            .addCase(getProviderDetail.fulfilled, (state, action) => {
                const id = action.payload.data.id;
                state.member[id] = {
                    ...state.member[id],
                    data: action.payload.data,
                    status: "SUCCEEDED",
                    error: null,
                };
            })
            .addCase(getProviderDetail.rejected, (state, action) => {
                const id = action.meta.arg;
                state.member[id] = {
                    ...state.member[id],
                    data: null,
                    status: "FAILED",
                    error: action.payload || "An error occurred",
                };
            })
            .addCase(getChartDetails.pending, (state, action) => {
                const id = action.meta.arg;
                state.chart[id] = { data: null, status: "PENDING", error: null };
            })
            .addCase(getChartDetails.fulfilled, (state, action) => {
                const id = action.payload.data.id;
                state.chart[id] = { data: action.payload.data, status: "SUCCEEDED", error: null };
            })
            .addCase(getChartDetails.rejected, (state, action) => {
                const id = action.meta.arg;
                state.chart[id] = { data: null, status: "FAILED", error: action.payload || "An error occurred" };
            })
            /* Progress Notes */
            .addCase(getMemberProgressNotes.pending, (state, action) => {
                const id = action.meta.arg.chartId; // Use chartId as actual ID for state
                if (!state.member[id]) {
                    state.member[id] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        progressNotes: {
                            search: "",
                            data: null, // Explicitly set to null instead of undefined
                            status: "PENDING",
                            error: null,
                        },
                    };
                } else {
                    state.member[id] = {
                        ...state.member[id],
                        progressNotes: {
                            ...(state.member[id].progressNotes || {}),
                            data: null, // Explicitly set to null instead of undefined
                            status: "PENDING",
                            search: "",
                            error: null,
                        },
                    };
                }
            })
            .addCase(getMemberProgressNotes.fulfilled, (state, action) => {
                const { chartId, progressNotes } = action.payload;

                if (!state.member[chartId]) {
                    state.member[chartId] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        progressNotes: {
                            search: "",
                            data: progressNotes,
                            status: "PENDING",
                            error: null,
                        },
                    };
                } else {
                    state.member[chartId] = {
                        ...state.member[chartId],
                        progressNotes: {
                            ...(state.member[chartId].progressNotes || {}),
                            data: progressNotes,
                            status: "SUCCEEDED",
                            error: null,
                            search: "",
                        },
                    };
                }
            })
            .addCase(getMemberProgressNotes.rejected, (state, action) => {
                const id = action.meta.arg.chartId;
                if (!state.member[id]) {
                    state.member[id] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        progressNotes: {
                            data: null,
                            search: "",
                            status: "FAILED",
                            error: action.payload || "An error occurred",
                        },
                    };
                } else {
                    state.member[id] = {
                        ...state.member[id],
                        progressNotes: {
                            ...(state.member[id].progressNotes || {}),
                            data: null,
                            status: "FAILED",
                            error: action.payload || "An error occurred",
                            search: "",
                        },
                    };
                }
            })
            /* Other Docs */
            .addCase(getOtherDocs.pending, (state, action) => {
                const id = action.meta.arg.chartId;
                if (!state.member[id]) {
                    state.member[id] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        otherDocs: {
                            search: "",
                            data: null,
                            status: "PENDING",
                            error: null,
                        },
                    };
                } else {
                    state.member[id] = {
                        ...state.member[id],
                        otherDocs: {
                            ...(state.member[id].otherDocs || {}),
                            data: null,
                            status: "PENDING",
                            search: "",
                            error: null,
                        },
                    };
                }
            })
            .addCase(getOtherDocs.fulfilled, (state, action) => {
                const { chartId, otherDocs } = action.payload;

                if (!state.member[chartId]) {
                    state.member[chartId] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        otherDocs: {
                            search: "",
                            data: otherDocs,
                            status: "SUCCEEDED",
                            error: null,
                        },
                    };
                } else {
                    state.member[chartId] = {
                        ...state.member[chartId],
                        otherDocs: {
                            ...(state.member[chartId].otherDocs || {}),
                            data: otherDocs,
                            status: "SUCCEEDED",
                            error: null,
                            search: "",
                        },
                    };
                }
            })
            .addCase(getOtherDocs.rejected, (state, action) => {
                const id = action.meta.arg.chartId;
                if (!state.member[id]) {
                    state.member[id] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        otherDocs: {
                            data: null,
                            search: "",
                            status: "FAILED",
                            error: action.payload || "An error occurred",
                        },
                    };
                } else {
                    state.member[id] = {
                        ...state.member[id],
                        otherDocs: {
                            ...(state.member[id].otherDocs || {}),
                            data: null,
                            status: "FAILED",
                            error: action.payload || "An error occurred",
                            search: "",
                        },
                    };
                }
            })
            /* Lab Docs */
            .addCase(getLabDocs.pending, (state, action) => {
                const id = action.meta.arg.chartId;
                if (!state.member[id]) {
                    state.member[id] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        labDocs: {
                            search: "",
                            data: null,
                            status: "PENDING",
                            error: null,
                        },
                    };
                } else {
                    state.member[id] = {
                        ...state.member[id],
                        labDocs: {
                            ...(state.member[id].labDocs || {}),
                            data: null,
                            status: "PENDING",
                            search: "",
                            error: null,
                        },
                    };
                }
            })
            .addCase(getLabDocs.fulfilled, (state, action) => {
                const { chartId, labDocs } = action.payload;

                if (!state.member[chartId]) {
                    state.member[chartId] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        labDocs: {
                            search: "",
                            data: labDocs,
                            status: "SUCCEEDED",
                            error: null,
                        },
                    };
                } else {
                    state.member[chartId] = {
                        ...state.member[chartId],
                        labDocs: {
                            ...(state.member[chartId].labDocs || {}),
                            data: labDocs,
                            status: "SUCCEEDED",
                            error: null,
                            search: "",
                        },
                    };
                }
            })
            .addCase(getLabDocs.rejected, (state, action) => {
                const id = action.meta.arg.chartId;
                if (!state.member[id]) {
                    state.member[id] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        labDocs: {
                            data: null,
                            search: "",
                            status: "FAILED",
                            error: action.payload || "An error occurred",
                        },
                    };
                } else {
                    state.member[id] = {
                        ...state.member[id],
                        labDocs: {
                            ...(state.member[id].labDocs || {}),
                            data: null,
                            status: "FAILED",
                            error: action.payload || "An error occurred",
                            search: "",
                        },
                    };
                }
            })
            /* Analysis Documents */
            .addCase(getAnalysisDocuments.pending, (state, action) => {
                const id = action?.meta?.arg?.member_id || "";
                if (!state.member[id]) {
                    state.member[id] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        analysisdocs: {
                            data: null,
                            status: "PENDING",
                            error: null,
                            currentPage: 0,
                            totalPages: 0,
                        },
                    };
                } else {
                    // Create a new object to ensure immutability
                    state.member[id] = {
                        ...state.member[id],
                        analysisdocs: {
                            ...(state.member[id].analysisdocs || {}),
                            data: null,
                            status: "PENDING",
                            error: null,
                            currentPage: 0,
                            totalPages: 0,
                        },
                    };
                }
            })
            .addCase(getAnalysisDocuments.fulfilled, (state, action) => {
                const { memberId, analysisData, message } = action.payload;


                if (!state.member[memberId]) {
                    state.member[memberId] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        analysisdocs: {
                            data: [...analysisData],
                            status: "SUCCEEDED",
                            message: message,
                            error: null,
                            currentPage: 0,
                            totalPages: analysisData.length,
                        },
                    };
                } else {
                    // Create a new object to ensure immutability
                    state.member[memberId] = {
                        ...state.member[memberId],
                        analysisdocs: {
                            ...(state.member[memberId].analysisdocs || {}),
                            data: [...analysisData],
                            status: "SUCCEEDED",
                            message: message,
                            error: null,
                            currentPage: 0,
                            totalPages: analysisData.length,
                        },
                    };
                }
            })
            .addCase(getAnalysisDocuments.rejected, (state, action) => {
                const id = action?.meta?.arg?.member_id || "";
                if (!state.member[id]) {
                    state.member[id] = {
                        data: null,
                        status: "SUCCEEDED",
                        error: null,
                        analysisdocs: {
                            data: null,
                            status: "FAILED",
                            error: action.payload || "An error occurred",
                            currentPage: 0,
                            totalPages: 0,
                        },
                    };
                } else {
                    // Create a new object to ensure immutability
                    state.member[id] = {
                        ...state.member[id],
                        analysisdocs: {
                            ...(state.member[id].analysisdocs || {}),
                            data: null,
                            status: "FAILED",
                            error: action.payload || "An error occurred",
                            currentPage: 0,
                            totalPages: 0,
                        },
                    };
                }
            })
            .addCase(fetchPdfFile.pending, (state) => {
                state.pdfLoading = true;
            })
            .addCase(fetchPdfFile.fulfilled, (state) => {
                state.pdfLoading = false;
            })
            .addCase(fetchPdfFile.rejected, (state) => {
                state.pdfLoading = false;
            });
    },
});

export const {
    setLoadingProgressNoteDoc,
    setLoadingLabDoc,
    storeLabDocsSearch,
    storeProgressNoteSearch,
    storeOtherDocSearch,
    setLoadingOtherDoc,
    changeAnalysisPage,
} = providerDetailSlice.actions;

export default providerDetailSlice.reducer;
