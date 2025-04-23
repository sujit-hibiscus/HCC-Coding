import { createSlice, createAsyncThunk, type PayloadAction, type AnyAction } from "@reduxjs/toolkit"
import { REHYDRATE } from "redux-persist"

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

interface DocumentManagementState {
    // Documents state
    documents: Document[]
    loading: boolean
    error: string | null

    // UI state
    selectedDocumentId: string | null

    // Timer state
    isRunning: boolean
    elapsedTime: number
    startTime: number | null
}

// Define a type for the rehydrate action payload
interface RehydrateAction extends AnyAction {
    key: string
    payload?: {
        documentManagement?: DocumentManagementState
    }
}

// Mock data fetching function
const fetchDocumentsApi = async () => {
    // Simulate API call
    return [
        {
            id: "1",
            name: "Medical Insurance Claim Q1 2024",
            url: "/pdf/medical_report_user_1.pdf",
            status: "pending",
            assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            timeSpent: 0,
        },
        {
            id: "2",
            name: "Policy Compliance Review 2024",
            url: "/pdf/medical_report_user_2.pdf",
            status: "pending",
            assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            timeSpent: 0,
        },
        {
            id: "3",
            name: "Insurance Claim Documentation 2024",
            url: "/pdf/medical_report_user_3.pdf",
            status: "pending",
            assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            timeSpent: 0,
        },
        {
            id: "4",
            name: "Quarterly Premium Analysis",
            url: "/pdf/medical_report_user_1.pdf",
            status: "pending",
            assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            timeSpent: 0,
        },
        {
            id: "5",
            name: "Annual Insurance Summary 2023",
            url: "/pdf/medical_report_user_2.pdf",
            status: "pending",
            assignedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
            timeSpent: 0,
        },
    ] as Document[]
}

// Async thunks
export const fetchDocuments = createAsyncThunk("documentManagement/fetchDocuments", async (_, { getState }) => {
    // Check if we already have documents in the state
    const state = getState() as { documentManagement: DocumentManagementState }
    if (state.documentManagement.documents.length > 0) {
        return state.documentManagement.documents
    }

    // If not, fetch from API
    const response = await fetchDocumentsApi()
    return response
})

// Initial state
const initialState: DocumentManagementState = {
    // Documents state
    documents: [],
    loading: false,
    error: null,

    // UI state
    selectedDocumentId: null,

    // Timer state
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
}

// Slice
const documentManagementSlice = createSlice({
    name: "documentManagement",
    initialState,
    reducers: {
        // Document actions
        startReview: (state, action: PayloadAction<string>) => {
            const document = state.documents.find((doc) => doc.id === action.payload)
            if (document) {
                document.status = "in_progress"
                document.startTime = Date.now()
            }
        },
        pauseReview: (state, action: PayloadAction<string>) => {
            const document = state.documents.find((doc) => doc.id === action.payload)
            if (document && document.startTime) {
                document.status = "on_hold"
                const pauseTime = Date.now()
                const timeElapsed = Math.floor((pauseTime - document.startTime) / 1000)
                document.timeSpent = (document.timeSpent || 0) + timeElapsed

                // Record pause time
                if (!document.pauseTimes) document.pauseTimes = []
                document.pauseTimes.push({ start: pauseTime, end: 0 })
                document.startTime = undefined
            }
        },
        resumeReview: (state, action: PayloadAction<string>) => {
            const document = state.documents.find((doc) => doc.id === action.payload)
            if (document) {
                document.status = "in_progress"
                document.startTime = Date.now()

                // Update last pause time
                if (document.pauseTimes && document.pauseTimes.length > 0) {
                    const lastPause = document.pauseTimes[document.pauseTimes.length - 1]
                    if (lastPause.end === 0) {
                        lastPause.end = Date.now()
                    }
                }
            }
        },
        completeReview: (state, action: PayloadAction<string>) => {
            const document = state.documents.find((doc) => doc.id === action.payload)
            if (document && document.startTime) {
                document.status = "completed"
                const completeTime = Date.now()
                const timeElapsed = Math.floor((completeTime - document.startTime) / 1000)
                document.timeSpent = (document.timeSpent || 0) + timeElapsed
                document.startTime = undefined

                // Stop the timer
                state.isRunning = false
            }
        },
        updateDocumentTime: (state, action: PayloadAction<{ id: string; time: number }>) => {
            const document = state.documents.find((doc) => doc.id === action.payload.id)
            if (document) {
                document.timeSpent = action.payload.time
            }
        },
        recalculateDocumentTimes: (state) => {
            state.documents.forEach((doc) => {
                if (doc.status === "in_progress" && doc.startTime) {
                    // Recalculate elapsed time for in-progress documents
                    const now = Date.now()
                    const additionalTime = Math.floor((now - doc.startTime) / 1000)
                    doc.timeSpent = (doc.timeSpent || 0) + additionalTime
                    doc.startTime = now // Reset start time to now
                }
            })
        },

        // UI actions
        selectDocument: (state, action: PayloadAction<string | null>) => {
            state.selectedDocumentId = action.payload

            // If we're selecting a document and it's in progress, start the timer
            if (action.payload) {
                const selectedDoc = state.documents.find((doc) => doc.id === action.payload)
                if (selectedDoc && selectedDoc.status === "in_progress") {
                    state.isRunning = true
                    state.startTime = Date.now()
                } else {
                    state.isRunning = false
                }
            } else {
                state.isRunning = false
            }
        },

        // Timer actions
        startTimer: (state) => {
            state.isRunning = true
            state.startTime = Date.now()
        },
        stopTimer: (state) => {
            state.isRunning = false
            if (state.startTime) {
                const now = Date.now()
                const additionalTime = Math.floor((now - state.startTime) / 1000)
                state.elapsedTime += additionalTime
                state.startTime = null
            }
        },
        resetTimer: (state) => {
            state.isRunning = false
            state.elapsedTime = 0
            state.startTime = null
        },
        updateElapsedTime: (state) => {
            if (state.isRunning && state.startTime) {
                const now = Date.now()
                state.elapsedTime = Math.floor((now - state.startTime) / 1000)
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDocuments.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.loading = false
                // Only update if we don't already have documents
                if (state.documents.length === 0) {
                    state.documents = action.payload
                }
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || "Failed to fetch documents"
            })

    },
})

export const {
    // Document actions
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
} = documentManagementSlice.actions

export default documentManagementSlice.reducer
