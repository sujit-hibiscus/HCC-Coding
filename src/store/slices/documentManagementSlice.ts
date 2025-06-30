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
    text_file_path?: string
}

// Code Review interfaces (replacing old code-cart)
export interface CodeReviewItem {
    id: string
    icdCode: string
    diagnosis: string;
    description: string
    hccCode: string
    icd10_desc: string
    hccV28Code: string
    evidence: string
    reference: string
    status: "accepted" | "rejected"
    addedAt: number
    query?: string | null
    V24HCC: string
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
    text_file_path?: string | null


    code_type: string

    icd10_desc: string

    confidence?: number

    document_section: string
    V28HCC: string | null
    RxHCC: string | null
    IsAcceptedbyAnalyst: boolean
    IsAcceptedbyQA: boolean
    created_at: string
    chart_id: number


    /* Conditional code */
    icd10_code?: string
    icd_code?: string

    reference?: string;
    guideline_reference?: string

    code_explanation: string
    reasoning?: string;

    V24HCC?: string;

    condition_name?: string;
    diagnosis?: string
    icd_description?: string;

    criteria_met?: string
    clinical_indicators?: string
    query?: string | null
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
    pdfFileBase64: string | null
    pdfLoading: boolean
    pdfLoadingById: Record<string, boolean>
    fetchedPdfPaths: string[]

    isRunning: boolean
    elapsedTime: number
    startTime: number | null

    formData: Record<string, FormData>
    codeReview: Record<string, CodeReviewData>
    medicalConditionsData: Record<string, MedicalCondition[]>
    medicalConditionsLoading: boolean
    medicalConditionsLoadingById: Record<string, boolean>

    activeDocTab: "document" | "prompt"

    textFileContent: string | null;
    textLoading: boolean
    textLoadingById: Record<string, boolean>
    fetchedTextPaths: string[];

    // NEW: Per-document regenerating state
    regeneratingById: Record<string, boolean>;
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
    text_file_path: string;
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
            const { id = "", text_file_path = "", analyst_notes = "", QA_notes = "", title = "", file_path = "", status } = item
            return {
                id,
                name: title,
                // name: maskFileName(title),
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
                text_file_path: text_file_path,
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
            const response = await fetchData(`get_medical_conditions/?chart_id=${conditionData?.id}`)
            const medicalConditionsResponse = (response.data as MedicalConditionsResponse)
            const convertedFormat = medicalConditionsResponse.data?.map(i => {
                const {
                    icd10_code = "", icd_code = "",
                    guideline_reference = "", reference = "",
                    criteria_met = "", clinical_indicators = "",
                    reasoning = "",
                    query = "NA",
                    text_file_path = "",
                    diagnosis = "", condition_name = "",
                    V24HCC = "",
                    icd_description = "",
                    RxHCC = "", code_explanation = "", IsAcceptedbyAnalyst = true, IsAcceptedbyQA = true, icd10_desc = "", id = "", V28HCC = "", created_at = "" } = i

                return {
                    id: `${id}`,
                    icdCode: icd10_code || icd_code || "",
                    hccCode: RxHCC || "",
                    V24HCC: V24HCC || "",
                    hccV28Code: V28HCC || "",
                    reference: guideline_reference?.length || reference || "",
                    evidence: criteria_met || clinical_indicators || "",
                    status: (conditionData?.type === "Analyst" ? IsAcceptedbyAnalyst : IsAcceptedbyQA) ? "accepted" : "rejected",
                    addedAt: new Date(created_at).getTime(),
                    // diagnosis: diagnosis || condition_name || "",
                    diagnosis: icd_description || "",
                    description: code_explanation || reasoning || "",
                    text_file_path: text_file_path,
                    icd10_desc: icd10_desc,//not coming?
                    query: query || "NA"
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

// Helper function to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to convert blob to base64"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const fetchPdfFile = createAsyncThunk(
    "documentManagement/fetchPdfFile",
    async (pdfFilePath: string, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { documentManagement: DocumentManagementState }
            // const { fetchedPdfPaths } = state.documentManagement

            /*  if (fetchedPdfPaths.includes(pdfFilePath) && state.documentManagement.pdfFileBase64) {
                 return state.documentManagement.pdfFileBase64 // Return persisted Base64 if already fetched
             } */

            const response = await postData<Blob>("view_pdf/", { file_path: pdfFilePath }, { responseType: "blob" })
            const blob = response.data;
            const base64 = await blobToBase64(blob); // Convert blob to base64
            return base64; // Store base64 string
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch PDF"
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
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

export const fetchTextFile = createAsyncThunk(
    "documentManagement/fetchTextFile",
    async (textFilePath: string, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { documentManagement: DocumentManagementState };
            const { fetchedTextPaths } = state.documentManagement;
            if (fetchedTextPaths.includes(textFilePath) && state.documentManagement.textFileContent) {
                return state.documentManagement.textFileContent;
            }

            /*  const response = await fetch("/pdf/Sample-text-file.txt");
             const text = await response.text();
             return text */
            const response = await postData<string>("view_pdf/", { file_path: textFilePath }, { responseType: "text" });
            return response.data;
            /*  if (response.ok) {
                 return response.data;
             } else {
                 const response = await fetch("/pdf/Sample-text-file.txt");
                 const text = await response.text();
                 return text
             } */
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch text file";
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

const initialState: DocumentManagementState = {
    documents: [],
    documentLoading: false,
    loading: false,
    error: null,
    selectedDocumentId: null,
    pdfFileBase64: null,
    pdfLoading: false,
    pdfLoadingById: {},
    fetchedPdfPaths: [],
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
    formData: {},
    codeReview: {},
    medicalConditionsData: {},
    medicalConditionsLoading: false,
    medicalConditionsLoadingById: {},
    activeDocTab: "document",
    textFileContent: null,
    textLoading: false,
    textLoadingById: {},
    fetchedTextPaths: [],
    // NEW: Per-document regenerating state
    regeneratingById: {},
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
            if (state.isRunning && state.selectedDocumentId) {
                const doc = state.documents.find((d) => d.id === state.selectedDocumentId)
                if (doc && doc.startTime) {
                    doc.timeSpent = (doc.timeSpent || 0) + 1
                }
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

        setActiveDocTab: (state, action: PayloadAction<"document" | "prompt">) => {
            state.activeDocTab = action.payload
        },

        setRegenerating: (state, action: PayloadAction<{ docId: string; value: boolean }>) => {
            const { docId, value } = action.payload;
            state.regeneratingById[docId] = value;
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
            .addCase(fetchPdfFile.pending, (state, action) => {
                state.pdfLoading = true
                state.error = null
                const pdfPath = action.meta.arg
                const doc = state.documents.find(doc => doc.url === pdfPath)
                if (doc) {
                    state.pdfLoadingById[doc.id] = true
                }
            })
            .addCase(fetchPdfFile.fulfilled, (state, action) => {
                state.pdfLoading = false
                state.pdfFileBase64 = action.payload
                const pdfPath = action.meta.arg
                if (!state.fetchedPdfPaths.includes(pdfPath)) {
                    state.fetchedPdfPaths.push(pdfPath)
                }
                const doc = state.documents.find(doc => doc.url === pdfPath)
                if (doc) {
                    state.pdfLoadingById[doc.id] = false
                }
            })
            .addCase(fetchPdfFile.rejected, (state, action) => {
                state.pdfLoading = false
                state.error = action.error.message || "Failed to fetch PDF file"
                toast.error("Failed to load PDF file")
                const pdfPath = action.meta.arg
                const doc = state.documents.find(doc => doc.url === pdfPath)
                if (doc) {
                    state.pdfLoadingById[doc.id] = false
                }
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
            .addCase(startReviewWithApiData.pending, (state, action) => {
                state.medicalConditionsLoading = true
                const docId = action.meta.arg.id?.toString?.() ?? action.meta.arg.id
                if (docId) {
                    state.medicalConditionsLoadingById[docId] = true
                }
            })
            .addCase(startReviewWithApiData.fulfilled, (state, action) => {
                state.medicalConditionsLoading = false
                if (action.payload) {
                    const { documentId, data } = action.payload
                    state.codeReview[documentId] = {
                        items: data as CodeReviewItem[],
                        analystNotes: "",
                        auditorNotes: "",
                        searchTerm: "",
                    }
                    if (documentId) {
                        state.medicalConditionsLoadingById[documentId] = false
                    }
                }
            })
            .addCase(startReviewWithApiData.rejected, (state, action) => {
                state.medicalConditionsLoading = false
                state.error = action.error.message || "Failed to fetch medical conditions"
                const docId = action.meta.arg.id?.toString?.() ?? action.meta.arg.id
                if (docId) {
                    state.medicalConditionsLoadingById[docId] = false
                }
            })
            .addCase(fetchTextFile.pending, (state, action) => {
                state.textLoading = true;
                const textPath = action.meta.arg
                const doc = state.documents.find(doc => doc.text_file_path === textPath)
                if (doc) {
                    state.textLoadingById[doc.id] = true
                }
            })
            .addCase(fetchTextFile.fulfilled, (state, action) => {
                state.textLoading = false;
                state.textFileContent = action.payload;
                const textPath = action.meta.arg
                const doc = state.documents.find(doc => doc.text_file_path === textPath)
                if (doc) {
                    state.textLoadingById[doc.id] = false
                }
            })
            .addCase(fetchTextFile.rejected, (state, action) => {
                state.textLoading = false;
                state.textFileContent = null;
                const textPath = action.meta.arg
                const doc = state.documents.find(doc => doc.text_file_path === textPath)
                if (doc) {
                    state.textLoadingById[doc.id] = false
                }
            });
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
    setActiveDocTab,
    setRegenerating,
} = documentManagementSlice.actions

export default documentManagementSlice.reducer