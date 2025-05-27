import { postData } from "@/lib/api/api-client"
import { formatToMMDDYYYYIfNeeded, maskFileName } from "@/lib/utils"
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import toast from "react-hot-toast"

export interface Document {
    id: string
    name: string
    url: string
    status: "pending" | "In Review" | "on_hold" | "completed"
    assignedAt: string
    assignId: string
    timeSpent: number
    startTime?: number
    pauseTimes?: { start: number; end: number }[]
    fileSize?: number | string
}

// Define the CodeCartItem interface
export interface CodeCartItem {
    code: string
    description: string
}

// Define the CodeCart interface
export interface CodeCart {
    items: CodeCartItem[]
    notes: string
    searchTerm: string
}

// New interfaces for code management
export interface CodeManagementItem {
    id: string
    code: string
    description: string
    status: "pending" | "accepted" | "rejected"
    addedAt: number
}

export interface CodeManagementData {
    codes: CodeManagementItem[]
    analystNotes: string
    auditorNotes: string
    searchTerm: string
}

export interface FormData {
    codesMissed: Array<{ value: string; label: string }>
    codesCorrected: Array<{ value: string; label: string }>
    auditRemarks: string
    rating: number
    codeCart?: CodeCart // Add the codeCart property to FormData
}

interface DocumentManagementState {
    documents: Document[]
    loading: boolean
    documentLoading: boolean
    error: string | null

    selectedDocumentId: string | null
    pdfUrl: string | null
    pdfLoading: boolean
    fetchedPdfPaths: string[]

    isRunning: boolean
    elapsedTime: number
    startTime: number | null

    formData: Record<string, FormData>
    staticCartItems: CodeCartItem[]

    // New state for code management
    codeManagement: Record<string, CodeManagementData>
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
    const state = getState() as {
        documentManagement: DocumentManagementState
        user: {
            userType: "Analyst" | "Auditor"
            userId: string
        }
    }
    const userType = state.user.userType
    const userID = state.user.userId

    const api = await postData("get_charts/", {
        id: +userID,
        role: userType,
    })
    const apiRes = api.data as ApiResponse

    if (apiRes.status === "Success") {
        const response = apiRes?.data?.map((item) => {
            const { id = "", title = "", file_path = "", status } = item
            return {
                id,
                name: maskFileName(title),
                url: file_path,
                assignId:
                    userType === "Analyst"
                        ? (item.analyst_assignments?.[0]?.id ?? "")
                        : (item.auditor_assignments?.[0]?.id ?? ""),
                status:
                    status === (userType === "Analyst" ? 1 : 3)
                        ? "pending"
                        : status === (userType === "Analyst" ? 2 : 4)
                            ? "In Review"
                            : "completed",
                assignedAt: formatToMMDDYYYYIfNeeded(
                    userType === "Analyst"
                        ? (item.analyst_assignments?.[0]?.assigned_date ?? "")
                        : (item?.auditor_assignments?.[0]?.assigned_date ?? ""),
                ),
                timeSpent: 0,
                fileSize: item.file_size,
            } as Document
        })
        return response
    } else {
        toast.error(`${apiRes.message}`)
        return []
    }
})

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
            })
            return response
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to start review"
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

export const completeReviewWithAPI = createAsyncThunk(
    "documentManagement/completeReviewWithApi",
    async (document: Document & { cartData?: CodeCart }, { rejectWithValue }) => {
        try {
            // Include cart data in the API call if needed
            const payload = {
                id: document.id,
                assignment_id: document.assignId || "",
                status: 3,
                start_time: "False",
                end_time: "True",
            }

            // If you need to send cart data to the API, you can add it here
            // if (document.cartData) {
            //     payload.cart_items = document.cartData.items;
            //     payload.cart_notes = document.cartData.notes;
            // }

            const response = await postData("update_analyst_charts/", payload)
            const apiRes = response.data as ApiResponse
            return apiRes
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to start review"
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

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
            })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to start review"
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

interface AuditorReviewPayload {
    doc: Document
    body: {
        codes_corrected: string[]
        codes_missed: string[]
        rating: number | string
        audit_remarks: string
    }
}

export const completeReviewAuditorWithAPI = createAsyncThunk<
    ApiResponse,
    AuditorReviewPayload,
    { rejectValue: string }
>("documentManagement/completeReviewWithApi", async ({ doc, body }, { rejectWithValue }) => {
    try {
        const response = await postData("update_auditor_charts/", {
            id: doc.id,
            assignment_id: doc.assignId || "",
            status: 5,
            start_time: "False",
            end_time: "True",
            ...body,
        })

        return response.data as ApiResponse
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to start review"
        toast.error(errorMessage)
        return rejectWithValue(errorMessage)
    }
})

// Update fetchPdfFile to check if we've already fetched this PDF
export const fetchPdfFile = createAsyncThunk<string, string>(
    "pdf/fetchPdfFile",
    async (pdfFilePath, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { documentManagement: DocumentManagementState }
            const { fetchedPdfPaths } = state.documentManagement

            if (fetchedPdfPaths.includes(pdfFilePath) && state.documentManagement.pdfUrl) {
                return state.documentManagement.pdfUrl
            }

            const response = await postData<Blob>("view_pdf/", { file_path: pdfFilePath }, { responseType: "blob" })
            const blobUrl = `${URL.createObjectURL(response.data)}__${pdfFilePath}`
            return blobUrl
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message)
            }
            return rejectWithValue("Something went wrong")
        }
    },
)

interface AutoAssignPayload {
    target: "pending" | "assigned" | "audit" | "completed"
    selectedDocumentIds: (string | number)[]
}

export const autoAssign = createAsyncThunk(
    "documentManagement/assign",
    async ({ target, selectedDocumentIds }: AutoAssignPayload, { rejectWithValue }) => {
        try {
            const bodyData = {
                chart_ids: selectedDocumentIds?.map((item) => +item),
            }

            const response =
                target === "pending" || target === "assigned"
                    ? await postData("assign_charts_analyst/", bodyData)
                    : await postData("assign_charts_auditor/", bodyData)

            const responseData = response.data as { status: string; message: string }

            if (responseData.status === "Success") {
                toast.success(responseData.message)
                return responseData
            } else {
                toast.error(responseData.message)
                return "Failed to assign charts"
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to start review"
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

const initialState: DocumentManagementState = {
    documents: [],
    documentLoading: false,
    loading: false,
    error: null,
    selectedDocumentId: null,
    pdfUrl: null,
    pdfLoading: false,
    fetchedPdfPaths: [],
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
    formData: {},
    staticCartItems: [
        { code: "J18.20", description: "Lobar pneumonia, unspecified organism" },
        { code: "J20.9", description: "Acute bronchitis, unspecified" },
        { code: "I10", description: "Essential (primary) hypertension" },
        { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
        { code: "J44.1", description: "Chronic obstructive pulmonary disease with acute exacerbation" },
        { code: "N18.6", description: "End stage renal disease" },
        { code: "F32.9", description: "Major depressive disorder, single episode, unspecified" },
        { code: "M79.3", description: "Panniculitis, unspecified" },
    ],
    // Initialize new code management state
    codeManagement: {},
}

const documentManagementSlice = createSlice({
    name: "documentManagement",
    initialState,
    reducers: {
        pauseReview: (state, action: PayloadAction<string>) => {
            const document = state.documents.find((doc) => doc.id === action.payload)
            if (document && document.startTime) {
                document.status = "on_hold"
                const pauseTime = Date.now()
                const timeElapsed = Math.floor((pauseTime - document.startTime) / 1000)
                document.timeSpent = (document.timeSpent || 0) + timeElapsed

                if (!document.pauseTimes) document.pauseTimes = []
                document.pauseTimes.push({ start: pauseTime, end: 0 })
                document.startTime = undefined
            }
        },
        resumeReview: (state, action: PayloadAction<string>) => {
            const document = state.documents.find((doc) => doc.id === action.payload)
            if (document) {
                document.status = "In Review"
                document.startTime = Date.now()

                if (document.pauseTimes && document.pauseTimes.length > 0) {
                    const lastPause = document.pauseTimes[document.pauseTimes.length - 1]
                    if (lastPause.end === 0) {
                        lastPause.end = Date.now()
                    }
                }
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
                if (doc.status === "In Review" && doc.startTime) {
                    const now = Date.now()
                    const additionalTime = Math.floor((now - doc.startTime) / 1000)
                    doc.timeSpent = (doc.timeSpent || 0) + additionalTime
                    doc.startTime = now
                }
            })
        },

        selectDocument: (state, action: PayloadAction<string | null>) => {
            state.selectedDocumentId = action.payload
            if (action.payload) {
                const selectedDoc = state.documents.find((doc) => doc.id === action.payload)
                if (selectedDoc && selectedDoc.status === "In Review") {
                    state.isRunning = true
                    state.startTime = Date.now()
                } else {
                    state.isRunning = false
                }
            } else {
                state.isRunning = false
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
        pauseTimerOnly: (state) => {
            state.isRunning = false
            if (state.startTime) {
                const now = Date.now()
                const additionalTime = Math.floor((now - state.startTime) / 1000)
                state.elapsedTime += additionalTime
                state.startTime = null
            }
        },
        // Existing form data reducers
        updateFormData: (state, action: PayloadAction<{ documentId: string; data: Partial<FormData> }>) => {
            const { documentId, data } = action.payload

            if (!state.formData[documentId]) {
                state.formData[documentId] = {
                    codesMissed: [],
                    codesCorrected: [],
                    auditRemarks: "",
                    rating: 0,
                    codeCart: {
                        items: [],
                        notes: "",
                        searchTerm: "",
                    },
                }
            }

            state.formData[documentId] = {
                ...state.formData[documentId],
                ...data,
            }
        },
        resetFormData: (state, action: PayloadAction<string>) => {
            const documentId = action.payload
            if (state.formData[documentId]) {
                state.formData[documentId] = {
                    codesMissed: [],
                    codesCorrected: [],
                    auditRemarks: "",
                    rating: 0,
                    codeCart: {
                        items: [],
                        notes: "",
                        searchTerm: "",
                    },
                }
            }
        },
        // Existing code cart reducers
        updateCodeCart: (state, action: PayloadAction<{ documentId: string; cartData: Partial<CodeCart> }>) => {
            const { documentId, cartData } = action.payload

            if (!state.formData[documentId]) {
                state.formData[documentId] = {
                    codesMissed: [],
                    codesCorrected: [],
                    auditRemarks: "",
                    rating: 0,
                    codeCart: {
                        items: [],
                        notes: "",
                        searchTerm: "",
                    },
                }
            }

            if (!state.formData[documentId].codeCart) {
                state.formData[documentId].codeCart = {
                    items: [],
                    notes: "",
                    searchTerm: "",
                }
            }

            state.formData[documentId].codeCart = {
                ...state.formData[documentId].codeCart!,
                ...cartData,
            }
        },
        addCartItem: (state, action: PayloadAction<{ documentId: string; item: CodeCartItem }>) => {
            const { documentId, item } = action.payload

            if (!state.formData[documentId]) {
                state.formData[documentId] = {
                    codesMissed: [],
                    codesCorrected: [],
                    auditRemarks: "",
                    rating: 0,
                    codeCart: {
                        items: [],
                        notes: "",
                        searchTerm: "",
                    },
                }
            }

            if (!state.formData[documentId].codeCart) {
                state.formData[documentId].codeCart = {
                    items: [],
                    notes: "",
                    searchTerm: "",
                }
            }

            state.formData[documentId].codeCart!.items.push(item)
        },
        removeCartItem: (state, action: PayloadAction<{ documentId: string; index: number }>) => {
            const { documentId, index } = action.payload

            if (
                state.formData[documentId] &&
                state.formData[documentId].codeCart &&
                state.formData[documentId].codeCart!.items.length > index
            ) {
                state.formData[documentId].codeCart!.items.splice(index, 1)
            }
        },
        removeStaticCartItem: (state, action: PayloadAction<{ documentId: string; index: number }>) => {
            const { index } = action.payload
            if (state.staticCartItems.length > index) {
                state.staticCartItems.splice(index, 1)
            }
        },

        // NEW CODE MANAGEMENT REDUCERS
        updateCodeManagement: (state, action: PayloadAction<{ documentId: string; data: Partial<CodeManagementData> }>) => {
            const { documentId, data } = action.payload

            if (!state.codeManagement[documentId]) {
                state.codeManagement[documentId] = {
                    codes: [],
                    analystNotes: "",
                    auditorNotes: "",
                    searchTerm: "",
                }
            }

            state.codeManagement[documentId] = {
                ...state.codeManagement[documentId],
                ...data,
            }
        },

        addCodeToTable: (state, action: PayloadAction<{ documentId: string; code: CodeManagementItem }>) => {
            const { documentId, code } = action.payload

            if (!state.codeManagement[documentId]) {
                state.codeManagement[documentId] = {
                    codes: [],
                    analystNotes: "",
                    auditorNotes: "",
                    searchTerm: "",
                }
            }

            state.codeManagement[documentId].codes.push(code)
        },

        updateCodeStatus: (
            state,
            action: PayloadAction<{ documentId: string; codeId: string; status: "accepted" | "rejected" }>,
        ) => {
            const { documentId, codeId, status } = action.payload

            if (state.codeManagement[documentId]) {
                const code = state.codeManagement[documentId].codes.find((c) => c.id === codeId)
                if (code) {
                    code.status = status
                }
            }
        },

        updateAnalystNotes: (state, action: PayloadAction<{ documentId: string; notes: string }>) => {
            const { documentId, notes } = action.payload

            if (!state.codeManagement[documentId]) {
                state.codeManagement[documentId] = {
                    codes: [],
                    analystNotes: "",
                    auditorNotes: "",
                    searchTerm: "",
                }
            }

            state.codeManagement[documentId].analystNotes = notes
        },

        updateAuditorNotes: (state, action: PayloadAction<{ documentId: string; notes: string }>) => {
            const { documentId, notes } = action.payload

            if (!state.codeManagement[documentId]) {
                state.codeManagement[documentId] = {
                    codes: [],
                    analystNotes: "",
                    auditorNotes: "",
                    searchTerm: "",
                }
            }

            state.codeManagement[documentId].auditorNotes = notes
        },

        removeCodeFromTable: (state, action: PayloadAction<{ documentId: string; codeId: string }>) => {
            const { documentId, codeId } = action.payload

            if (state.codeManagement[documentId]) {
                state.codeManagement[documentId].codes = state.codeManagement[documentId].codes.filter(
                    (code) => code.id !== codeId,
                )
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDocuments.pending, (state) => {
                state.documentLoading = true
                state.error = null
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.documentLoading = false
                state.documents = action.payload
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.documentLoading = false
                state.error = action.error.message || "Failed to fetch documents"
            })
            .addCase(fetchPdfFile.pending, (state) => {
                state.pdfLoading = true
                state.error = null
            })
            .addCase(fetchPdfFile.fulfilled, (state, action) => {
                state.pdfLoading = false
                state.pdfUrl = action.payload

                const pdfPath = action.meta.arg
                if (!state.fetchedPdfPaths.includes(pdfPath)) {
                    state.fetchedPdfPaths.push(pdfPath)
                }
            })
            .addCase(fetchPdfFile.rejected, (state, action) => {
                state.pdfLoading = false
                state.error = action.error.message || "Failed to fetch PDF file"
                toast.error("Failed to load PDF file")
            })
    },
})

export const {
    pauseReview,
    resumeReview,
    updateDocumentTime,
    recalculateDocumentTimes,
    selectDocument,
    resetTimer,
    updateElapsedTime,
    pauseTimerOnly,
    updateFormData,
    resetFormData,
    // Export existing actions
    updateCodeCart,
    addCartItem,
    removeCartItem,
    removeStaticCartItem,
    // Export new code management actions
    updateCodeManagement,
    addCodeToTable,
    updateCodeStatus,
    updateAnalystNotes,
    updateAuditorNotes,
    removeCodeFromTable,
} = documentManagementSlice.actions

export default documentManagementSlice.reducer
