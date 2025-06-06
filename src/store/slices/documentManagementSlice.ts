import { fetchData, postData } from "@/lib/api/api-client"
import { formatToMMDDYYYYIfNeeded, maskFileName } from "@/lib/utils"
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import toast from "react-hot-toast"

export interface Document {
    id: string
    name: string
    url: string
    analystNote: string
    auditorNote: string;
    status: "pending" | "In Review" | "on_hold" | "completed"
    assignedAt: string
    assignId: string
    timeSpent: number
    startTime?: number
    pauseTimes?: { start: number; end: number }[]
    fileSize?: number | string
}

// Code Review interfaces (replacing old code-cart)
export interface CodeReviewItem {
    id: string
    icdCode: string
    diagnosis: string;
    description: string
    hccCode: string
    hccV28Code: string
    evidence: string
    reference: string
    status: "accepted" | "rejected"
    addedAt: number
}

export interface CodeReviewData {
    items: CodeReviewItem[]
    analystNotes: string
    auditorNotes: string
    searchTerm: string
}

export interface FormData {
    codesMissed: Array<{ value: string; label: string }>
    codesCorrected: Array<{ value: string; label: string }>
    auditRemarks: string
    rating: number
}

// Medical Condition interface based on the sample response
export interface MedicalCondition {
    id: number
    json_file_path: string
    diagnosis: string
    icd10_code: string
    code_type: string
    guideline_reference: string
    code_explanation: string
    criteria_met: string
    confidence: number
    document_section: string
    V28HCC: string | null
    RxHCC: string | null
    IsAcceptedbyAnalyst: boolean
    IsAcceptedbyQA: boolean
    created_at: string
    chart_id: number
}

// Medical Conditions API Response
export interface MedicalConditionsResponse {
    status: "Success" | "Not Found" | "Error"
    message: string
    data: MedicalCondition[]
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
    codeReview: Record<string, CodeReviewData>
    medicalConditionsData: Record<string, MedicalCondition[]>
    medicalConditionsLoading: boolean
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
    QA_notes: string | null,
    analyst_notes: string | null
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

// Initial static data for code review
const getInitialCodeReviewData = (documentId: string): CodeReviewData => ({
    items: [],
    analystNotes: "",
    auditorNotes: "",
    searchTerm: "",
})

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
            const { id = "", analyst_notes = "", QA_notes = "", title = "", file_path = "", status } = item
            return {
                id,
                name: maskFileName(title),
                url: file_path,
                assignId:
                    userType === "Analyst"
                        ? (item.analyst_assignments?.[0]?.id ?? "")
                        : (item.auditor_assignments?.[0]?.id ?? ""),
                status: false ? "pending" :
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
                analystNote: analyst_notes ? analyst_notes : "",
                auditorNote: QA_notes ? QA_notes : "",
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
    async (document: Document, { dispatch, rejectWithValue }) => {
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


export interface conditionData {
    id: number | string,
    type: "Auditor" | "Analyst"
}

export const startReviewWithApiData = createAsyncThunk(
    "documentManagement/startReviewWithApi/data",
    async (conditionData: conditionData, { rejectWithValue }) => {
        try {
            // const response = await fetchData(`get_medical_conditions/?chart_id=172`)
            const response = await fetchData(`get_medical_conditions/?chart_id=${conditionData?.id}`)
            const medicalConditionsResponse = (response.data as MedicalConditionsResponse)
            const convertedFormat = medicalConditionsResponse.data?.map(i => {
                const { icd10_code = "", diagnosis = "", RxHCC = "", code_explanation = "", IsAcceptedbyAnalyst = true, IsAcceptedbyQA = true, criteria_met = "", guideline_reference = "", id = "", V28HCC = "", created_at = "" } = i
                return {
                    id: `${id}`,
                    icdCode: icd10_code,
                    diagnosis: diagnosis,
                    description: code_explanation,
                    hccCode: RxHCC ? RxHCC : "",
                    hccV28Code: V28HCC ? V28HCC : "",
                    evidence: criteria_met,
                    reference: guideline_reference,
                    status: (conditionData?.type === "Analyst" ? IsAcceptedbyAnalyst : IsAcceptedbyQA) ? "accepted" : "rejected",
                    addedAt: new Date(created_at).getTime(),
                }

            })

            await new Promise(resolve => setTimeout(resolve, 3000));

            return {
                data: convertedFormat || [],
                documentId: conditionData?.id,
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch medical conditions"
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

export const completeReviewWithAPI = createAsyncThunk(
    "documentManagement/completeReviewWithApi",
    async (document: Document & {
        reviewData?: CodeReviewData, bodyData: {
            mc_ids: number[],
            notes: string
        }
    }, { rejectWithValue }) => {
        try {
            const payload = {
                id: document.id,
                assignment_id: document.assignId || "",
                status: 3,
                start_time: "False",
                end_time: "True",
                ...document.bodyData
            }
            const response = await postData("update_analyst_charts/", payload)
            const apiRes = response.data as ApiResponse
            return apiRes
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to complete review"
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)



export const startReviewAuditorWithApi = createAsyncThunk(
    "documentManagement/startReviewAuditorWithApi",
    async (document: Document, { rejectWithValue }) => {
        try {
            // Call the main API
            await postData("update_auditor_charts/", {
                id: document.id,
                assignment_id: document.assignId || "",
                status: 4,
                start_time: "True",
                end_time: "False",
            })

            return document.id
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
>("documentManagement/completeReviewAuditorWithApi", async ({ doc, body }, { rejectWithValue }) => {
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
        const errorMessage = error instanceof Error ? error.message : "Failed to complete review"
        toast.error(errorMessage)
        return rejectWithValue(errorMessage)
    }
})

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
            const errorMessage = error instanceof Error ? error.message : "Failed to assign charts"
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
    codeReview: {},
    medicalConditionsData: {},
    medicalConditionsLoading: false,
}

const documentManagementSlice = createSlice({
    name: "documentManagement",
    initialState,
    reducers: {
        // Document and timer reducers
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

                // Initialize code review data with static data if it doesn't exist
                if (!state.codeReview[action.payload]) {
                    state.codeReview[action.payload] = getInitialCodeReviewData(action.payload)
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

        // Form data reducers
        updateFormData: (state, action: PayloadAction<{ documentId: string; data: Partial<FormData> }>) => {
            const { documentId, data } = action.payload

            if (!state.formData[documentId]) {
                state.formData[documentId] = {
                    codesMissed: [],
                    codesCorrected: [],
                    auditRemarks: "",
                    rating: 0,
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
                }
            }
        },

        // Code Review reducers
        updateSearchTerm: (state, action: PayloadAction<{ documentId: string; searchTerm: string }>) => {
            const { documentId, searchTerm } = action.payload

            if (!state.codeReview[documentId]) {
                state.codeReview[documentId] = getInitialCodeReviewData(documentId)
            }

            state.codeReview[documentId].searchTerm = searchTerm
        },

        updateCodeReviewItemStatus: (
            state,
            action: PayloadAction<{ documentId: string; itemId: string; status: "accepted" | "rejected" }>,
        ) => {
            const { documentId, itemId, status } = action.payload

            if (state.codeReview[documentId]) {
                const item = state.codeReview[documentId].items.find((item) => item.id === itemId)
                if (item) {
                    item.status = status
                }
            }
        },

        updateAnalystNotes: (state, action: PayloadAction<{ documentId: string; notes: string }>) => {
            const { documentId, notes } = action.payload

            if (!state.codeReview[documentId]) {
                state.codeReview[documentId] = getInitialCodeReviewData(documentId)
            }

            state.codeReview[documentId].analystNotes = notes
        },

        updateAuditorNotes: (state, action: PayloadAction<{ documentId: string; notes: string }>) => {
            const { documentId, notes } = action.payload

            if (!state.codeReview[documentId]) {
                state.codeReview[documentId] = getInitialCodeReviewData(documentId)
            }

            state.codeReview[documentId].auditorNotes = notes
        },

        addCodeReviewItem: (state, action: PayloadAction<{ documentId: string; item: CodeReviewItem }>) => {
            const { documentId, item } = action.payload

            if (!state.codeReview[documentId]) {
                state.codeReview[documentId] = getInitialCodeReviewData(documentId)
            }

            const existingItem = state.codeReview[documentId].items.find((existing) => existing.id === item.id)
            if (!existingItem) {
                state.codeReview[documentId].items.push(item)
            }
        },

        removeCodeReviewItem: (state, action: PayloadAction<{ documentId: string; itemId: string }>) => {
            const { documentId, itemId } = action.payload

            if (state.codeReview[documentId]) {
                state.codeReview[documentId].items = state.codeReview[documentId].items.filter((item) => item.id !== itemId)
            }
        },

        resetCodeReview: (state, action: PayloadAction<string>) => {
            const documentId = action.payload
            if (state.codeReview[documentId]) {
                state.codeReview[documentId] = getInitialCodeReviewData(documentId)
            }
        },

        bulkUpdateCodeReviewStatus: (
            state,
            action: PayloadAction<{ documentId: string; itemIds: string[]; status: "accepted" | "rejected" }>,
        ) => {
            const { documentId, itemIds, status } = action.payload

            if (state.codeReview[documentId]) {
                state.codeReview[documentId].items.forEach((item) => {
                    if (itemIds.includes(item.id)) {
                        item.status = status
                    }
                })
            }
        },

        updateCodeReviewData: (state, action: PayloadAction<{ documentId: string; data: Partial<CodeReviewData> }>) => {
            const { documentId, data } = action.payload

            if (!state.codeReview[documentId]) {
                state.codeReview[documentId] = getInitialCodeReviewData(documentId)
            }

            state.codeReview[documentId] = {
                ...state.codeReview[documentId],
                ...data,
            }
        },

        // Medical conditions reducers
        updateMedicalConditionStatus: (
            state,
            action: PayloadAction<{ documentId: string | number; conditionId: number; isAccepted: boolean }>,
        ) => {
            const { documentId, conditionId, isAccepted } = action.payload
            const docId = documentId.toString()

            if (state.medicalConditionsData[docId]) {
                const condition = state.medicalConditionsData[docId].find((c) => c.id === conditionId)
                if (condition) {
                    condition.IsAcceptedbyQA = isAccepted
                }
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
            .addCase(startReviewWithApi.fulfilled, (state, action) => {
                const documentId = action.meta.arg.id
                const document = state.documents.find((doc) => doc.id === documentId)
                if (document) {
                    document.status = "In Review"
                    document.startTime = Date.now()
                }
            })
            .addCase(completeReviewWithAPI.fulfilled, (state, action) => {
                const documentId = action.meta.arg.id
                const document = state.documents.find((doc) => doc.id === documentId)
                if (document) {
                    document.status = "completed"
                    if (document.startTime) {
                        const completionTime = Date.now()
                        const additionalTime = Math.floor((completionTime - document.startTime) / 1000)
                        document.timeSpent = (document.timeSpent || 0) + additionalTime
                        document.startTime = undefined
                    }
                }
            })
            .addCase(startReviewAuditorWithApi.fulfilled, (state, action) => {
                const documentId = action.payload
                const document = state.documents.find((doc) => doc.id === documentId)
                if (document) {
                    document.status = "In Review"
                    document.startTime = Date.now()
                }
            })
            .addCase(startReviewWithApiData.pending, (state) => {
                state.medicalConditionsLoading = true
            })
            .addCase(startReviewWithApiData.fulfilled, (state, action) => {
                state.medicalConditionsLoading = false
                if (action.payload) {
                    const { documentId, data } = action.payload
                    // Create a proper CodeReviewData structure
                    state.codeReview[documentId] = {
                        items: data as CodeReviewItem[],
                        analystNotes: "",
                        auditorNotes: "",
                        searchTerm: "",
                    }
                }
            })
            .addCase(startReviewWithApiData.rejected, (state, action) => {
                state.medicalConditionsLoading = false
                state.error = action.error.message || "Failed to fetch medical conditions"
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
    updateSearchTerm,
    updateCodeReviewItemStatus,
    updateAnalystNotes,
    updateAuditorNotes,
    addCodeReviewItem,
    removeCodeReviewItem,
    resetCodeReview,
    bulkUpdateCodeReviewStatus,
    updateCodeReviewData,
    updateMedicalConditionStatus,
} = documentManagementSlice.actions

export default documentManagementSlice.reducer