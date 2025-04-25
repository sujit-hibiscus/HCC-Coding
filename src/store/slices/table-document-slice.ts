import { fetchData } from "@/lib/api/api-client";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { format, isValid, parseISO } from "date-fns";
import toast from "react-hot-toast";

// Document Types
export enum DOCUMENT_STATUS {
    PENDING = "Pending",
    IN_PROGRESS = "In Progress",
    ON_HOLD = "On Hold",
    COMPLETED = "Completed",
    ERROR = "Error",
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
}

export interface AssignedDocument extends DocumentBase {
    assignedTo: string
}

export interface AuditDocument extends DocumentBase {
    analyst: string
    auditor: string
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
    selectedPendingAnalyst: string | null
    selectedAnalyst: string | null
    selectedAuditor: string | null
    selectedDocuments: {
        pending: string[]
        assigned: string[]
        audit: string[]
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
    selectedAnalyst: null,
    selectedPendingAnalyst: null,
    selectedAuditor: null,
    selectedDocuments: {
        pending: [],
        assigned: [],
        audit: [],
    },
    isAssigning: false,
};

// Mock data for development
const mockPendingDocuments: PendingDocument[] = [
    {
        id: "SL001",
        title: "Medical Report 2023",
        received: "04-15-2023",
        fileSize: "2.4 MB",
        category: "Medical",
        status: DOCUMENT_STATUS.PENDING,
    },
    {
        id: "SL002",
        title: "Insurance Claim Form",
        received: "04-18-2023",
        fileSize: "1.2 MB",
        category: "Insurance",
        status: DOCUMENT_STATUS.PENDING,
    },
    {
        id: "SL003",
        title: "Patient History",
        received: "04-20-2023",
        fileSize: "3.7 MB",
        category: "Medical",
        status: DOCUMENT_STATUS.PENDING,
    },
];

const mockAssignedDocuments: AssignedDocument[] = [
    {
        id: "SL004",
        title: "Lab Results 2023",
        received: "04-22-2023",
        fileSize: "1.8 MB",
        category: "Medical",
        status: DOCUMENT_STATUS.IN_PROGRESS,
        assignedTo: "John Doe",
    },
    {
        id: "SL005",
        title: "Prescription Records",
        received: "04-25-2023",
        fileSize: "0.9 MB",
        category: "Pharmacy",
        status: DOCUMENT_STATUS.ON_HOLD,
        assignedTo: "Jane Smith",
    },
];

const mockAuditDocuments: AuditDocument[] = [
    {
        id: "SL006",
        title: "Annual Checkup Report",
        received: "04-28-2023",
        fileSize: "2.1 MB",
        category: "Medical",
        status: DOCUMENT_STATUS.COMPLETED,
        analyst: "John Doe",
        auditor: "Sarah Johnson",
    },
    {
        id: "SL007",
        title: "Specialist Consultation",
        received: "05-01-2023",
        fileSize: "1.5 MB",
        category: "Medical",
        status: DOCUMENT_STATUS.IN_PROGRESS,
        analyst: "Jane Smith",
        auditor: "Mike Wilson",
    },
];

// Async Thunks
export const fetchPendingDocuments = createAsyncThunk<PendingDocument[], void, { rejectValue: string }>(
    "documents/fetchPendingDocuments",
    async (_, { rejectWithValue }) => {
        try {
            // For development, return mock data
            await new Promise(resolve => setTimeout(resolve, 1000));
            return mockPendingDocuments;

            /*  const response = await fetchData<ApiResponse>("/api/documents/pending")
             if (response.data.status === "Success") {
                 return response.data.data as PendingDocument[]
             } else {
                 toast.error(response.data.message)
                 return []
             } */
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Failed to fetch pending documents");
        }
    },
);

export const fetchAssignedDocuments = createAsyncThunk<AssignedDocument[], void, { rejectValue: string }>(
    "documents/fetchAssignedDocuments",
    async (_, { rejectWithValue }) => {
        try {

            await new Promise(resolve => setTimeout(resolve, 1000));
            return mockAssignedDocuments;
            /* const response = await fetchData<ApiResponse>("/api/documents/assigned")
            if (response.data.status === "Success") {
                return response.data.data as AssignedDocument[]
            } else {
                toast.error(response.data.message)
                return []
            } */
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Failed to fetch assigned documents");
        }
    },
);

export const fetchAuditDocuments = createAsyncThunk<AuditDocument[], void, { rejectValue: string }>(
    "documents/fetchAuditDocuments",
    async (_, { rejectWithValue }) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return mockAuditDocuments;

            /* const response = await fetchData<ApiResponse>("/api/documents/audit")
            if (response.data.status === "Success") {
                return response.data.data as AuditDocument[]
            } else {
                toast.error(response.data.message)
                return []
            } */
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Failed to fetch audit documents");
        }
    },
);

// Assignment Thunks
export const assignPendingDocuments = createAsyncThunk<
    { success: boolean; message: string },
    { documentIds: string[]; analystId: string },
    { rejectValue: string }
>("documents/assignPendingDocuments", async ({ documentIds, analystId }, { rejectWithValue, dispatch }) => {
    try {
        dispatch(setIsAssigning(true));

        // For development, simulate API call
        if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_TEST === "true") {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Success response
            toast.success(`Successfully assigned ${documentIds.length} documents to analyst`);
            dispatch(clearSelectedDocuments("pending"));
            dispatch(fetchPendingDocuments());
            dispatch(fetchAssignedDocuments());
            return { success: true, message: "Documents assigned successfully" };
        }

        // Actual API call
        const response = await fetchData<ApiResponse>("/api/documents/assign", {
            method: "POST",
            body: JSON.stringify({ documentIds, analystId }),
        });

        if (response.data.status === "Success") {
            toast.success(response.data.message);
            dispatch(clearSelectedDocuments("pending"));
            dispatch(fetchPendingDocuments());
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
        return rejectWithValue("Failed to assign documents");
    } finally {
        dispatch(setIsAssigning(false));
    }
});

export const changeAssignment = createAsyncThunk<
    { success: boolean; message: string },
    { documentIds: string[]; assigneeId: string },
    { rejectValue: string }
>("documents/changeAssignment", async ({ documentIds, assigneeId }, { rejectWithValue, dispatch }) => {
    try {
        dispatch(setIsAssigning(true));

        // For development, simulate API call
        if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_TEST === "true") {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Success response
            toast.success(`Successfully reassigned ${documentIds.length} documents`);
            dispatch(clearSelectedDocuments("assigned"));
            dispatch(fetchAssignedDocuments());
            return { success: true, message: "Documents reassigned successfully" };
        }

        // Actual API call
        const response = await fetchData<ApiResponse>("/api/documents/reassign", {
            method: "POST",
            body: JSON.stringify({ documentIds, assigneeId }),
        });

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
    { documentIds: string[]; auditorId: string },
    { rejectValue: string }
>("documents/assignToAuditor", async ({ documentIds, auditorId }, { rejectWithValue, dispatch }) => {
    try {
        dispatch(setIsAssigning(true));

        // For development, simulate API call
        if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_TEST === "true") {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Success response
            toast.success(`Successfully assigned ${documentIds.length} documents to auditor`);
            dispatch(clearSelectedDocuments("audit"));
            dispatch(fetchAuditDocuments());
            return { success: true, message: "Documents assigned to auditor successfully" };
        }

        // Actual API call
        const response = await fetchData<ApiResponse>("/api/documents/assign-auditor", {
            method: "POST",
            body: JSON.stringify({ documentIds, auditorId }),
        });

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
                tabKey: "pending" | "assigned" | "audit"
                documentIds: string[]
            }>,
        ) => {
            const { tabKey, documentIds } = action.payload;
            state.selectedDocuments[tabKey] = documentIds;
        },
        clearSelectedDocuments: (state, action: PayloadAction<"pending" | "assigned" | "audit">) => {
            state.selectedDocuments[action.payload] = [];
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
} = documentSlice.actions;

export default documentSlice.reducer;
