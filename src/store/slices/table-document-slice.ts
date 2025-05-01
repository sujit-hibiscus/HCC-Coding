import { fetchData } from "@/lib/api/api-client";
import { formatToMMDDYYYYIfNeeded } from "@/lib/utils";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { differenceInDays, format, isValid, parseISO } from "date-fns";
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

// Calculate age helper
export const calculateAge = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return "N/A";

    try {
        // Convert dates to standard format if they're in MM-DD-YYYY format
        const standardizeDate = (dateStr: string) => {
            if (dateStr.includes("-")) {
                const [month, day, year] = dateStr.split("-");
                return `${year}-${month}-${day}`;
            }
            return dateStr;
        };

        const start = parseISO(standardizeDate(startDate));
        const end = parseISO(standardizeDate(endDate));

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
    isAssigning: false,
};

// Mock data for development
/* const mockPendingDocuments: PendingDocument[] = [
    {
        id: "SL001",
        title: "Medical Report 2025",
        received: "04-28-2025",
        fileSize: "2.4 MB",
        category: "Medical",
        status: DOCUMENT_STATUS.PENDING,
    },
    {
        id: "SL002",
        title: "Insurance Claim Form",
        received: "04-29-2025",
        fileSize: "1.2 MB",
        category: "Insurance",
        status: DOCUMENT_STATUS.PENDING,
    },
    {
        id: "SL003",
        title: "Patient History",
        received: "04-30-2025",
        fileSize: "3.7 MB",
        category: "Medical",
        status: DOCUMENT_STATUS.PENDING,
    },
]; */

const mockAssignedDocuments: AssignedDocument[] = [
    {
        id: "SL004",
        title: "Lab Results 2025",
        received: "04-28-2025",
        fileSize: "1800 KB",
        category: "Medical",
        status: DOCUMENT_STATUS.IN_PROGRESS,
        assignedTo: "John Doe",
        assignedDate: "04-12-2025",
    },
    {
        id: "SL005",
        title: "Prescription Records",
        received: "04-29-2025",
        fileSize: "450 KB",
        category: "Pharmacy",
        status: DOCUMENT_STATUS.ON_HOLD,
        assignedTo: "Jane Smith",
        assignedDate: "04-13-2025",
    },
];

/* const mockAuditDocuments: AuditDocument[] = [
    {
        id: "SL006",
        title: "Annual Checkup Report",
        received: "04-29-2025",
        endDate: "04-20-2025",
        fileSize: "2.1 MB",
        category: "Medical",
        status: DOCUMENT_STATUS.COMPLETED,
        analyst: "John Doe",
        auditor: "Sarah Johnson",
    },
    {
        id: "SL007",
        title: "Specialist Consultation",
        received: "04-30-2025",
        fileSize: "1.5 MB",
        category: "Medical",
        endDate: "04-22-2025",
        status: DOCUMENT_STATUS.IN_PROGRESS,
        analyst: "Jane Smith",
        auditor: "Mike Wilson",
    },
]; */

const mockCompletedDocuments: CompletedDocument[] = [
    {
        id: "SL008",
        title: "Annual Physical Examination",
        received: "04-28-2025",
        fileSize: "1500 KB",
        category: "Medical",
        status: DOCUMENT_STATUS.COMPLETED,
        startDate: "04-22-2025",
        endDate: "04-25-2025",
        auditor: "Michael Thompson",
        Assign: "",
    },
    {
        id: "SL009",
        title: "Cardiology Consultation",
        received: "04-29-2025",
        fileSize: "450 KB",
        category: "Cardiology",
        status: DOCUMENT_STATUS.COMPLETED,
        startDate: "04-23-2025",
        endDate: "04-26-2025",
        auditor: "Mike Wilson",
        Assign: "Daniel Martinez",
    },
    {
        id: "SL010",
        title: "Diabetes Management Plan",
        received: "04-30-2025",
        fileSize: "800 KB",
        category: "Endocrinology",
        status: DOCUMENT_STATUS.COMPLETED,
        startDate: "04-24-2025",
        endDate: "",
        auditor: "Ashley Davis",
        Assign: "",
    },
    {
        id: "SL011",
        title: "Orthopedic Surgery Report",
        received: "05-01-2025",
        fileSize: "320 KB",
        category: "Orthopedics",
        status: DOCUMENT_STATUS.COMPLETED,
        startDate: "04-25-2025",
        endDate: "04-28-2025",
        auditor: "Sarah Johnson",
        Assign: "Sarah Robinson",
    },
];


// Process completed documents to add age
const processedCompletedDocuments = mockCompletedDocuments.map((doc) => ({
    ...doc,
    age: calculateAge(doc.startDate, doc.endDate),
}));

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
    DOCUMENT_STATUS.IN_PROGRESS, //1
    DOCUMENT_STATUS.ON_HOLD, //2
    DOCUMENT_STATUS.COMPLETED, //3
    DOCUMENT_STATUS.ERROR,// 4
];

const getDocumentStatusFromNumber = (num: number): DOCUMENT_STATUS | undefined => {
    return statusByIndex[num];
};

// Async Thunks
export const fetchPendingDocuments = createAsyncThunk<PendingDocument[], void, { rejectValue: string }>(
    "documents/fetchPendingDocuments",
    async (_, { rejectWithValue }) => {
        try {
            // For development, return mock data
            const pendingData = await fetchData("admin_pending_charts/");
            const apiRes = pendingData.data as pendingApiResponse;
            console.log(apiRes, "apiRes");

            if (apiRes.status === "Success") {
                const response = apiRes?.data?.map((item) => {
                    return {
                        id: String(item.id),
                        title: item.title,
                        received: formatToMMDDYYYYIfNeeded(item.received_date),
                        fileSize: `${item.file_size} KB`,
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
                        title: item?.title,
                        received: formatToMMDDYYYYIfNeeded(item?.received_date),
                        fileSize: `${item.file_size} KB`,
                        category: "Medical",
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
            return mockAssignedDocuments;
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

interface auditItem {
    id: number;
    title: string;
    file_size: number;
    status: number;
    received_date: string;
    assigned_to: AuditTo;
    assigned_date: string;
    analyst: string;
    auditor: string;
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
                    console.log("🚀 ~ response ~ item:", item);
                    return {
                        id: item?.id.toString(),
                        title: item?.title,
                        received: item?.received_date ? formatToMMDDYYYYIfNeeded(item?.received_date) : "",
                        endDate: item?.end_date ? formatToMMDDYYYYIfNeeded(item?.received_date) : "",
                        fileSize: `${item.file_size} KB`,
                        category: "Medical",
                        status: getDocumentStatusFromNumber(item.status) || DOCUMENT_STATUS.PENDING,
                        analyst: item?.analyst,
                        auditor: item?.auditor,
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
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return processedCompletedDocuments;

            /* const response = await fetchData<ApiResponse>("/api/documents/completed")
                  if (response.data.status === "Success") {
                      const documents = response.data.data as CompletedDocument[]
                      // Process documents to add age
                      return documents.map(doc => ({
                        ...doc,
                        age: calculateAge(doc.startDate, doc.endDate)
                      }))
                  } else {
                      toast.error(response.data.message)
                      return []
                  } */
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
    { documentIds: string[]; analystId: string },
    { rejectValue: string }
>("documents/assignPendingDocuments", async ({ documentIds, analystId }, { rejectWithValue, dispatch }) => {
    try {
        dispatch(setIsAssigning(true));

        // For development, simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Success response
        toast.success(`Successfully assigned ${documentIds.length} documents to analyst`);
        dispatch(clearSelectedDocuments("pending"));
        dispatch(fetchPendingDocuments());
        dispatch(fetchAssignedDocuments());
        return { success: true, message: "Documents assigned successfully" };
        if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_TEST === "true") {
            // Simulate API delay
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
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Success response
        toast.success(`Successfully reassigned ${documentIds.length} documents`);
        dispatch(clearSelectedDocuments("assigned"));
        dispatch(fetchAssignedDocuments());
        return { success: true, message: "Documents reassigned successfully" };
        if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_TEST === "true") {
            // Simulate API delay
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
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Success response
        toast.success(`Successfully assigned ${documentIds.length} documents to auditor`);
        dispatch(clearSelectedDocuments("audit"));
        dispatch(fetchAuditDocuments());
        return { success: true, message: "Documents assigned to auditor successfully" };
        if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_TEST === "true") {
            // Simulate API delay
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
                tabKey: "pending" | "assigned" | "audit" | "completed"
                documentIds: string[]
            }>,
        ) => {
            const { tabKey, documentIds } = action.payload;
            state.selectedDocuments[tabKey] = documentIds;
        },
        clearSelectedDocuments: (state, action: PayloadAction<"pending" | "assigned" | "audit" | "completed">) => {
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
