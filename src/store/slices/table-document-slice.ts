import { fetchData, postData } from "@/lib/api/api-client";
import { formatToMMDDYYYYIfNeeded } from "@/lib/utils";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { differenceInDays, format, isValid, parse, parseISO } from "date-fns";
import toast from "react-hot-toast";

// Document Types
export enum DOCUMENT_STATUS {
    PENDING = "Pending",
    In_Review = "In Review",
    ON_HOLD = "Done",
    COMPLETED = "QA Review",
    ERROR = "Closed",
}

// Document Data Types
export interface DocumentBase {
    id: string
    title: string
    received: string
    fileSize: string
    category: string
    status: DOCUMENT_STATUS
}

export interface PendingDocument extends DocumentBase {
    action?: string
    PendingDocument?: string
}

export interface AssignedDocument extends DocumentBase {
    assignedTo: string;
    assignedDate: string;
}

export interface AuditDocument extends DocumentBase {
    analyst: string
    auditor: string
    endDate: string;
}

export interface CompletedDocument extends DocumentBase {
    startDate: string
    endDate: string
    age?: string
    auditor?: string
    Assign?: string
}

// API Response Types
type ApiResponse = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[]
    status: "Success" | "Not Found" | "Error"
    message: string
}

// Fetch Status Enum
enum FetchStatus {
    IDLE = "idle",
    LOADING = "loading",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
}

// State Interface
interface DocumentState {
    pendingDocuments: {
        data: PendingDocument[]
        status: FetchStatus
        error: string | null
    }
    assignedDocuments: {
        data: AssignedDocument[]
        status: FetchStatus
        error: string | null
    }
    auditDocuments: {
        data: AuditDocument[]
        status: FetchStatus
        error: string | null
    }
    completedDocuments: {
        data: CompletedDocument[]
        status: FetchStatus
        error: string | null
    }
    selectedPendingAnalyst: string | null
    selectedAnalyst: string | null
    selectedAuditor: string | null
    selectedDocuments: {
        pending: string[]
        assigned: string[]
        audit: string[]
        completed: string[]
    },
    selectedDocumentsId: {
        pending: string[]
        assigned: string[]
        audit: string[]
        completed: string[]
    },
    selectedDocumentsNames: {
        pending: string[]
        assigned: string[]
        audit: string[]
        completed: string[]
    }
    isAssigning: boolean
}

// Format date helper
export const formatDate = (date: string): string => {
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const parsedDate = parseISO(date);
        return isValid(parsedDate) ? format(parsedDate, "MM/dd/yyyy") : date;
    }
    return date?.replace(/\//g, "-") || "";
};

export const calculateAge = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return "N/A";

    try {
        const format = "MM-dd-yyyy";

        const start = parse(startDate, format, new Date());
        const end = parse(endDate, format, new Date());

        if (!isValid(start) || !isValid(end)) return "N/A";

        const days = differenceInDays(end, start);
        return days === 1 ? `${days} day` : `${days} days`;
    } catch (error) {
        console.error("🚀 ~ calculateAge ~ error:", error);
        return "N/A";
    }
};


// Initial State
const initialState: DocumentState = {
    pendingDocuments: {
        data: [],
        status: FetchStatus.IDLE,
        error: null,
    },
    assignedDocuments: {
        data: [],
        status: FetchStatus.IDLE,
        error: null,
    },
    auditDocuments: {
        data: [],
        status: FetchStatus.IDLE,
        error: null,
    },
    completedDocuments: {
        data: [],
        status: FetchStatus.IDLE,
        error: null,
    },
    selectedAnalyst: null,
    selectedPendingAnalyst: null,
    selectedAuditor: null,
    selectedDocuments: {
        pending: [],
        assigned: [],
        audit: [],
        completed: [],
    },
    selectedDocumentsId: {
        pending: [],
        assigned: [],
        audit: [],
        completed: [],
    },
    selectedDocumentsNames: {
        pending: [],
        assigned: [],
        audit: [],
        completed: [],
    },
    isAssigning: false,
};

interface pendingItem {
    "id": number | string,
    "title": string,
    "file_size": number,
    "status": number,
    "received_date": string
}
interface pendingApiResponse {
    data: pendingItem[]
    status: "Success" | "Not Found" | "Error"
    message: string
}

const statusByIndex: DOCUMENT_STATUS[] = [
    DOCUMENT_STATUS.PENDING,//0
    DOCUMENT_STATUS.PENDING,//1
    DOCUMENT_STATUS.In_Review, //2
    DOCUMENT_STATUS.ON_HOLD, //3
    DOCUMENT_STATUS.COMPLETED, //4
    DOCUMENT_STATUS.ERROR,// 5
];

const getDocumentStatusFromNumber = (num: number): DOCUMENT_STATUS | undefined => {
    return statusByIndex[num];
};


const formatSizeFromKB = (kb: number): string => {
    if (kb >= 1024 * 1024) {
        return `${(kb / (1024 * 1024)).toFixed(2)} GB`;
    } else if (kb >= 1024) {
        return `${(kb / 1024).toFixed(2)} MB`;
    } else {
        return `${kb} KB`;
    }
};
// Async Thunks
export const fetchPendingDocuments = createAsyncThunk<PendingDocument[], void, { rejectValue: string }>(
    "documents/fetchPendingDocuments",
    async (_, { rejectWithValue }) => {
        try {
            // For development, return mock data
            const pendingData = await fetchData("admin_pending_charts/");
            const apiRes = pendingData.data as pendingApiResponse;
            if (apiRes.status === "Success") {
                const response = apiRes?.data?.map((item) => {
                    return {
                        id: String(item.id),
                        title: item.title?.replace(/^dev-/, ""),
                        received: formatToMMDDYYYYIfNeeded(item.received_date),
                        fileSize: `${item.file_size} KB`,
                        formattedSize: item.file_size ? formatSizeFromKB(+item.file_size) : "",
                        category: "Medical",
                        status: getDocumentStatusFromNumber(item.status) || DOCUMENT_STATUS.PENDING,
                    };
                });
                return response;
            } else {
                toast.error(`${apiRes.message}`);
                return [];
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Failed to fetch pending documents");
        }
    },
);

export interface AssignedTo {
    first_name: string;
    last_name: string;
}
interface assignItem {
    id: number;
    title: string;
    file_size: number;
    status: number; // or use DOCUMENT_STATUS if you're mapping later
    received_date: string; // ISO string format
    assigned_to: AssignedTo;
    assigned_date: string; // ISO string format
}
interface assignApiResponse {
    data: assignItem[]
    status: "Success" | "Not Found" | "Error"
    message: string
}

export const fetchAssignedDocuments = createAsyncThunk<AssignedDocument[], void, { rejectValue: string }>(
    "documents/fetchAssignedDocuments",
    async (_, { rejectWithValue }) => {
        try {

            const pendingData = await fetchData("admin_assigned_charts/");
            const apiRes = pendingData.data as assignApiResponse;
            if (apiRes.status === "Success") {
                const response = apiRes?.data?.map((item) => {
                    return {
                        id: item?.id.toString(),
                        title: item?.title?.replace(/^dev-/, ""),
                        received: formatToMMDDYYYYIfNeeded(item?.received_date),
                        fileSize: `${item.file_size} KB`,
                        category: "Medical",
                        formattedSize: item.file_size ? formatSizeFromKB(+item.file_size) : "",
                        status: getDocumentStatusFromNumber(item.status) || DOCUMENT_STATUS.PENDING,
                        assignedTo: `${item?.assigned_to?.first_name} ${item?.assigned_to?.last_name}`,
                        assignedDate: item?.assigned_date ? formatToMMDDYYYYIfNeeded(item?.assigned_date) : "",
                    };
                });
                return response;
            } else {
                toast.error(`${apiRes.message}`);
                return [];
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Failed to fetch assigned documents");
        }
    },
);

interface AuditTo {
    first_name: string;
    last_name: string;
}


export interface Assignment {
    first_name: string;
    last_name: string;
    assigned_date: string; // ISO timestamp string
    chart_end?: string
    chart_start?: string
}

interface auditItem {
    id: number;
    title: string;
    file_size: number;
    status: number;
    received_date: string;
    assigned_to: AuditTo;
    assigned_date: string;
    analyst_assignments: Assignment[];
    auditor_assignments: Assignment[];
    end_date: string;
}

interface auditApiResponse {
    data: auditItem[];
    status: "Success" | "Not Found" | "Error";
    message: string;
}

export interface AuditDocument {
    id: string;
    title: string;
    received: string;
    endDate: string;
    fileSize: string;
    category: string;
    status: DOCUMENT_STATUS;
    analyst: string;
    auditor: string;
}

export const fetchAuditDocuments = createAsyncThunk<AuditDocument[], void, { rejectValue: string }>(
    "documents/fetchAuditDocuments",
    async (_, { rejectWithValue }) => {
        try {
            const auditData = await fetchData("admin_audit_charts/");
            const apiRes = auditData.data as auditApiResponse;

            if (apiRes.status === "Success") {
                const response = apiRes.data.map((item) => {
                    const analystFname = item?.analyst_assignments[0]?.first_name;
                    const analystLname = item?.analyst_assignments[0]?.last_name;
                    const analystName = `${analystFname?.length > 0 ? analystFname : ""} ${analystLname?.length > 0 ? analystLname : ""}`;
                    const auditorFname = item?.auditor_assignments[0]?.first_name;
                    const auditorLname = item?.auditor_assignments[0]?.last_name;
                    const auditorName = `${auditorFname?.length > 0 ? auditorFname : ""} ${auditorLname?.length > 0 ? auditorLname : ""}`;
                    return {
                        id: item?.id.toString(),
                        title: item?.title?.replace(/^dev-/, ""),
                        received: item?.received_date ? formatToMMDDYYYYIfNeeded(item?.received_date) : "",
                        endDate: item?.end_date ? formatToMMDDYYYYIfNeeded(item?.received_date) : "",
                        fileSize: `${item.file_size} KB`,
                        formattedSize: item.file_size ? formatSizeFromKB(+item.file_size) : "",
                        category: "Medical",
                        status: getDocumentStatusFromNumber(item.status) || DOCUMENT_STATUS.PENDING,
                        analyst: analystName || "",
                        auditor: auditorName || "",
                    };
                });
                return response;
            } else {
                toast.error(apiRes.message);
                return [];
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Failed to fetch audit documents");
        }
    }
);



export const fetchCompletedDocuments = createAsyncThunk<CompletedDocument[], void, { rejectValue: string }>(
    "documents/fetchCompletedDocuments",
    async (_, { rejectWithValue }) => {
        try {

            const auditData = await fetchData("admin_completed_charts/");
            const apiRes = auditData.data as auditApiResponse;

            if (apiRes.status === "Success") {
                const response = apiRes.data.map((item) => {
                    const startDate = item?.analyst_assignments[0]?.chart_start ? formatToMMDDYYYYIfNeeded(item?.analyst_assignments[0]?.chart_start) : "";
                    const endDate = item?.auditor_assignments[0]?.chart_end ? formatToMMDDYYYYIfNeeded(item?.auditor_assignments[0]?.chart_end) : "";
                    return {
                        id: item?.id.toString(),
                        title: item?.title?.replace(/^dev-/, ""),
                        received: item?.received_date ? formatToMMDDYYYYIfNeeded(item?.received_date) : "",
                        fileSize: `${item.file_size} KB`,
                        formattedSize: item.file_size ? formatSizeFromKB(+item.file_size) : "",
                        category: "Medical",
                        status: getDocumentStatusFromNumber(item.status) || DOCUMENT_STATUS.PENDING,
                        startDate: item?.assigned_date ? formatToMMDDYYYYIfNeeded(item?.assigned_date) : "",
                        endDate,
                        auditor: item?.auditor_assignments[0]?.first_name || "",
                        Assign: item?.analyst_assignments[0]?.first_name || "",
                        age: calculateAge(startDate, endDate),
                    };
                });
                return response;
            } else {
                toast.error(apiRes.message);
                return [];
            }

        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Failed to fetch completed documents");
        }
    },
);

// Assignment Thunks
export const assignPendingDocuments = createAsyncThunk<
    { success: boolean; message: string },
    { documentIds: string[]; analystId: string, request_user_id: string },
    { rejectValue: string }
>("documents/assignPendingDocuments", async ({ documentIds, analystId, request_user_id }, { rejectWithValue, dispatch }) => {
    try {
        dispatch(setIsAssigning(true));

        const bodyData = {
            "chart_ids": documentIds?.map(item => +item),
            "request_user_id": +request_user_id,
            "analyst_id": +analystId
        };


        const response = await postData<ApiResponse>("manual/assign_pending_charts/", bodyData);

        if (response.data.status === "Success") {
            toast.success(response.data.message);

            dispatch(clearSelectedDocuments("pending"));
            dispatch(fetchPendingDocuments());
            return { success: true, message: response.data.message };
        } else {
            toast.error(response.data.message);
            return rejectWithValue(response.data.message);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
        return rejectWithValue("Failed to assign documents");
    } finally {
        dispatch(setIsAssigning(false));
    }
});

export const changeAssignment = createAsyncThunk<
    { success: boolean; message: string },
    { documentIds: string[]; analystId: string, request_user_id: string },
    { rejectValue: string }
>("documents/changeAssignment", async ({ documentIds, analystId, request_user_id }, { rejectWithValue, dispatch }) => {
    try {
        dispatch(setIsAssigning(true));

        const bodyData = {
            "chart_ids": documentIds?.map(item => +item),
            "request_user_id": +request_user_id,
            "analyst_id": +analystId
        };

        const response = await postData<ApiResponse>("manual/reassign_charts_analyst/", bodyData);

        if (response.data.status === "Success") {
            toast.success(response.data.message);

            dispatch(clearSelectedDocuments("assigned"));
            dispatch(fetchAssignedDocuments());
            return { success: true, message: response.data.message };
        } else {
            toast.error(response.data.message);
            return rejectWithValue(response.data.message);
        }

    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
        return rejectWithValue("Failed to reassign documents");
    } finally {
        dispatch(setIsAssigning(false));
    }
});

export const assignToAuditor = createAsyncThunk<
    { success: boolean; message: string },
    { documentIds: string[]; analystId: string, request_user_id: string },

    { rejectValue: string }
>("documents/assignToAuditor", async ({ documentIds, analystId, request_user_id }, { rejectWithValue, dispatch }) => {
    try {
        dispatch(setIsAssigning(true));

        const bodyData = {
            "chart_ids": documentIds?.map(item => +item),
            "request_user_id": +request_user_id,
            "auditor_id": +analystId
        };

        const response = await postData<ApiResponse>("manual/reassign_charts_auditor/", bodyData);

        if (response.data.status === "Success") {
            toast.success(response.data.message);

            dispatch(clearSelectedDocuments("audit"));
            dispatch(fetchAuditDocuments());
            return { success: true, message: response.data.message };
        } else {
            toast.error(response.data.message);
            return rejectWithValue(response.data.message);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
        return rejectWithValue("Failed to assign documents to auditor");
    } finally {
        dispatch(setIsAssigning(false));
    }
});

// Document Slice
const documentSlice = createSlice({
    name: "documents",
    initialState,
    reducers: {
        setSelectedPendingAnalyst: (state, action: PayloadAction<string | null>) => {
            state.selectedPendingAnalyst = action.payload;
        },
        setSelectedAnalyst: (state, action: PayloadAction<string | null>) => {
            state.selectedAnalyst = action.payload;
        },
        setSelectedAuditor: (state, action: PayloadAction<string | null>) => {
            state.selectedAuditor = action.payload;
        },
        setSelectedDocuments: (
            state,
            action: PayloadAction<{
                tabKey: "pending" | "assigned" | "audit" | "completed"
                documentIds: string[]
                selectedRowsDataId: {
                    id: string,
                    assigned: string
                }[]
            }>,
        ) => {
            const { tabKey, documentIds, selectedRowsDataId } = action.payload;
            state.selectedDocuments[tabKey] = documentIds;
            state.selectedDocumentsId[tabKey] = selectedRowsDataId?.map(i => i.id);
            state.selectedDocumentsNames[tabKey] = selectedRowsDataId?.map(i => i.assigned);
        },
        clearSelectedDocuments: (state, action: PayloadAction<"pending" | "assigned" | "audit" | "completed">) => {
            state.selectedDocuments[action.payload] = [];
            state.selectedDocumentsId[action.payload] = [];
        },
        setIsAssigning: (state, action: PayloadAction<boolean>) => {
            state.isAssigning = action.payload;
        },
        clearPendingDocuments: (state) => {
            state.pendingDocuments.data = [];
            state.pendingDocuments.status = FetchStatus.IDLE;
            state.pendingDocuments.error = null;
        },
        clearAssignedDocuments: (state) => {
            state.assignedDocuments.data = [];
            state.assignedDocuments.status = FetchStatus.IDLE;
            state.assignedDocuments.error = null;
        },
        clearAuditDocuments: (state) => {
            state.auditDocuments.data = [];
            state.auditDocuments.status = FetchStatus.IDLE;
            state.auditDocuments.error = null;
        },
        clearCompletedDocuments: (state) => {
            state.completedDocuments.data = [];
            state.completedDocuments.status = FetchStatus.IDLE;
            state.completedDocuments.error = null;
        },
    },
    extraReducers: (builder) => {
        // Pending Documents
        builder
            .addCase(fetchPendingDocuments.pending, (state) => {
                state.pendingDocuments.status = FetchStatus.LOADING;
                state.pendingDocuments.error = null;
            })
            .addCase(fetchPendingDocuments.fulfilled, (state, action: PayloadAction<PendingDocument[]>) => {
                state.pendingDocuments.status = FetchStatus.SUCCEEDED;
                state.pendingDocuments.data = action.payload;
            })
            .addCase(fetchPendingDocuments.rejected, (state, action) => {
                state.pendingDocuments.status = FetchStatus.FAILED;
                state.pendingDocuments.error = action.payload || "Failed to fetch pending documents";
            });

        // Assigned Documents
        builder
            .addCase(fetchAssignedDocuments.pending, (state) => {
                state.assignedDocuments.status = FetchStatus.LOADING;
                state.assignedDocuments.error = null;
            })
            .addCase(fetchAssignedDocuments.fulfilled, (state, action: PayloadAction<AssignedDocument[]>) => {
                state.assignedDocuments.status = FetchStatus.SUCCEEDED;
                state.assignedDocuments.data = action.payload;
            })
            .addCase(fetchAssignedDocuments.rejected, (state, action) => {
                state.assignedDocuments.status = FetchStatus.FAILED;
                state.assignedDocuments.error = action.payload || "Failed to fetch assigned documents";
            });

        // Audit Documents
        builder
            .addCase(fetchAuditDocuments.pending, (state) => {
                state.auditDocuments.status = FetchStatus.LOADING;
                state.auditDocuments.error = null;
            })
            .addCase(fetchAuditDocuments.rejected, (state, action) => {
                state.auditDocuments.status = FetchStatus.FAILED;
                state.auditDocuments.error = action.payload || "Failed to fetch audit documents";
            })
            .addCase(fetchAuditDocuments.fulfilled, (state, action: PayloadAction<AuditDocument[]>) => {
                state.auditDocuments.status = FetchStatus.SUCCEEDED;
                state.auditDocuments.data = action.payload;
            });

        // Completed Documents
        builder
            .addCase(fetchCompletedDocuments.pending, (state) => {
                state.completedDocuments.status = FetchStatus.LOADING;
                state.completedDocuments.error = null;
            })
            .addCase(fetchCompletedDocuments.fulfilled, (state, action: PayloadAction<CompletedDocument[]>) => {
                state.completedDocuments.status = FetchStatus.SUCCEEDED;
                state.completedDocuments.data = action.payload;
            })
            .addCase(fetchCompletedDocuments.rejected, (state, action) => {
                state.completedDocuments.status = FetchStatus.FAILED;
                state.completedDocuments.error = action.payload || "Failed to fetch completed documents";
            });
    },
});

export const {
    setSelectedAnalyst,
    setSelectedPendingAnalyst,
    setSelectedAuditor,
    setSelectedDocuments,
    clearSelectedDocuments,
    setIsAssigning,
    clearPendingDocuments,
    clearAssignedDocuments,
    clearAuditDocuments,
    clearCompletedDocuments,
} = documentSlice.actions;

export default documentSlice.reducer;
