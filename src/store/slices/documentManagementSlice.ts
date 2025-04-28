import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Types
export interface Document {
    id: string
    name: string
    url: string
    status: "pending" | "in_progress" | "on_hold" | "completed"
    assignedAt: string
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

    isRunning: boolean
    elapsedTime: number
    startTime: number | null

    // Form data for each document
    formData: Record<string, FormData>
}

const fetchDocumentsApi = async () => {
    return [
        {
            id: "1",
            name: "Medical Insurance Claim Q1 2024",
            url: "/pdf/medical_report_user_1.pdf",
            status: "pending",
            assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 0,
        },
        {
            id: "2",
            name: "Policy Compliance Review 2024",
            url: "/pdf/medical_report_user_2.pdf",
            status: "pending",
            assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 0,
        },
        {
            id: "3",
            name: "Insurance Claim Documentation 2024",
            url: "/pdf/medical_report_user_3.pdf",
            status: "pending",
            assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 0,
        },
        {
            id: "4",
            name: "Quarterly Premium Analysis",
            url: "/pdf/medical_report_user_1.pdf",
            status: "pending",
            assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 0,
        },
        {
            id: "5",
            name: "Annual Insurance Summary 2023",
            url: "/pdf/medical_report_user_2.pdf",
            status: "pending",
            assignedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpent: 0,
        },
    ] as Document[];
};

// Async thunks
export const fetchDocuments = createAsyncThunk("documentManagement/fetchDocuments", async (_, { getState }) => {
    const state = getState() as { documentManagement: DocumentManagementState };
    if (state.documentManagement.documents.length > 0) {
        return state.documentManagement.documents;
    }

    const response = await fetchDocumentsApi();
    return response;
});

const initialState: DocumentManagementState = {
    documents: [],
    loading: false,
    error: null,
    selectedDocumentId: null,
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
    formData: {},
};

const documentManagementSlice = createSlice({
    name: "documentManagement",
    initialState,
    reducers: {
        startReview: (state, action: PayloadAction<string>) => {
            const document = state.documents.find((doc) => doc.id === action.payload);
            if (document) {
                document.status = "in_progress";
                document.startTime = Date.now();
            }
        },
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
        completeReview: (state, action: PayloadAction<string>) => {
            const document = state.documents.find((doc) => doc.id === action.payload);
            if (document && document.startTime) {
                document.status = "completed";
                const completeTime = Date.now();
                const timeElapsed = Math.floor((completeTime - document.startTime) / 1000);
                document.timeSpent = (document.timeSpent || 0) + timeElapsed;
                document.startTime = undefined;

                state.isRunning = false;
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
        startTimer: (state) => {
            state.isRunning = true;
            state.startTime = Date.now();
        },
        stopTimer: (state) => {
            state.isRunning = false;
            if (state.startTime) {
                const now = Date.now();
                const additionalTime = Math.floor((now - state.startTime) / 1000);
                state.elapsedTime += additionalTime;
                state.startTime = null;
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
                if (state.documents.length === 0) {
                    state.documents = action.payload;
                }
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch documents";
            });
    },
});

export const {
    startReview,
    pauseReview,
    resumeReview,
    completeReview,
    updateDocumentTime,
    recalculateDocumentTimes,
    selectDocument,
    startTimer,
    stopTimer,
    resetTimer,
    updateElapsedTime,
    pauseTimerOnly,
    // Export new actions
    updateFormData,
    resetFormData,
} = documentManagementSlice.actions;

export default documentManagementSlice.reducer;
