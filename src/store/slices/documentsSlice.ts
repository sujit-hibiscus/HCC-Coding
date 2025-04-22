import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

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

interface DocumentsState {
  documents: Document[]
  loading: boolean
  error: string | null
}

// Mock data fetching function
const fetchDocumentsApi = async () => {
  // Simulate API call
  return [
    {
      id: "1",
      name: "Financial Report Q1 2023",
      url: "/pdf/medical_report_user_1.pdf",
      status: "pending",
      assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      timeSpent: 0,
    },
    {
      id: "2",
      name: "Compliance Audit 2023",
      url: "/pdf/medical_report_user_2.pdf",
      status: "pending",
      assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      timeSpent: 0,
    },
    {
      id: "3",
      name: "Tax Documentation 2023",
      url: "/pdf/medical_report_user_3.pdf",
      status: "pending",
      assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      timeSpent: 0,
    },
    {
      id: "4",
      name: "Quarterly Budget Review",
      url: "/pdf/medical_report_user_1.pdf",
      status: "pending",
      assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      timeSpent: 0,
    },
    {
      id: "5",
      name: "Annual Report 2022",
      url: "/pdf/medical_report_user_2.pdf",
      status: "pending",
      assignedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      timeSpent: 0,
    },
  ] as Document[]
}

// Async thunks
export const fetchDocuments = createAsyncThunk("documents/fetchDocuments", async () => {
  const response = await fetchDocumentsApi()
  return response
})

// Initial state
const initialState: DocumentsState = {
  documents: [],
  loading: false,
  error: null,
}

// Slice
const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
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
      }
    },
    updateDocumentTime: (state, action: PayloadAction<{ id: string; time: number }>) => {
      const document = state.documents.find((doc) => doc.id === action.payload.id)
      if (document) {
        document.timeSpent = action.payload.time
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
        state.documents = action.payload
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch documents"
      })
  },
})

export const { startReview, pauseReview, resumeReview, completeReview, updateDocumentTime } = documentsSlice.actions

export default documentsSlice.reducer
