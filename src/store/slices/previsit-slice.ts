import { fetchData } from "@/lib/api/api-client";
import { type DraftDataTypes, DRAFTSTATUS, PENDINGSTATUS, type PrevisitDataTypes, ProviderReviewDataTypes, ReviewDataTypes, REVIEWSTATUS } from "@/lib/types/PrevisitTypes";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { format, isValid, parseISO } from "date-fns";
import toast from "react-hot-toast";


type Status = {
    status: string;
};

type Member = {
    id: string;
    first_name: string;
    last_name: string;
    DOB: string;
    company_plan_coinsurance: string;
    PCP: string;
};

type ChartDetails = {
    "id": string,
    "carry_forward": [
        {
            "id": string,
            "doc_type": string,
            "doc_date": string
        },
        {
            "id": string,
            "doc_type": string,
            "doc_date": string
        }
    ],
    "suggested": [
        {
            "id": string,
            "doc_type": string,
            "doc_date": string
        },
        {
            "id": string,
            "doc_type": string,
            "doc_date": string
        }
    ]
}

type Record = {
    id: string;
    member: Member;
    DOS: string;
    facility: string;
    analyst: string;
    status: Status;
    chart?: ChartDetails
};

export const formatDOS = (DOS: string): string => {
    if (typeof DOS === "string" && /^\d{4}-\d{2}-\d{2}$/.test(DOS)) {
        const parsedDate = parseISO(DOS);
        return isValid(parsedDate) ? format(parsedDate, "MM/dd/yyyy") : DOS;
    }
    return DOS?.replace(/\//g, "-");
};

// Function to map API response to expected DraftDataTypes
const mapPendingResponse = (data: Record): PrevisitDataTypes => {
    const { id = "", DOS = "", analyst = "", member, facility = "", status } = data;
    const { id: mID = "", first_name = "", last_name = "", DOB = "", PCP = "", company_plan_coinsurance: insurance = "" } = member;
    return ({
        chartId: `${id}`,
        mID: member.id,
        dos: DOS ? formatDOS(DOS)?.replace(/\//g, "-") : "",
        memberId: mID,
        firstName: first_name,
        lastName: last_name,
        dob: DOB?.replace(/\//g, "-"),
        pcp: PCP,
        facility: facility,
        insurance,
        status: status?.status?.toLowerCase() === "error" ? PENDINGSTATUS.ERROR : status?.status === "Doc Retrival" ? PENDINGSTATUS.DOCRETRIEVAL : PENDINGSTATUS.PENDINGSTATUSSTATUS,
        assignTo: analyst
    });
};
// Function to map API response to expected DraftDataTypes
const mapDraftResponse = (data: Record): DraftDataTypes => {
    const { id = "", DOS = "", chart, analyst = "", member, facility = "", status } = data;
    const { id: mID = "", first_name = "", last_name = "", DOB = "", PCP = "", company_plan_coinsurance: insurance = "" } = member;
    return ({
        appId: `${id}`,
        chartId: (`${chart?.id}` || ""),
        mID: member.id,
        dos: DOS ? formatDOS(DOS)?.replace(/\//g, "-") : "",
        memberId: mID,
        firstName: first_name,
        lastName: last_name,
        dob: DOB?.replace(/\//g, "-"),
        pcp: PCP,
        facility: facility,
        insurance,
        status: status?.status?.toLowerCase() === "processing" ? DRAFTSTATUS.PROCESSING : status?.status?.toLowerCase() === "queue" ? DRAFTSTATUS.QUEUE : DRAFTSTATUS.ERROR,
        assignTo: analyst,
    });
};

const mapProviderReviewResponse = (data: Record): ProviderReviewDataTypes => {
    const { id = "", DOS = "", analyst = "", chart, member, facility = "" } = data;
    const { id: mID = "", first_name = "", last_name = "", DOB = "", PCP = "", company_plan_coinsurance: insurance = "" } = member;
    return ({
        chartId: (`${chart?.id}` || ""),
        appId: `${id}`,
        mID: member.id,
        dos: DOS ? formatDOS(DOS)?.replace(/\//g, "-") : "",
        memberId: mID,
        firstName: first_name,
        lastName: last_name,
        dob: DOB?.replace(/\//g, "-"),
        pcp: PCP,
        facility: facility,
        insurance,
        status: REVIEWSTATUS.RFR,
        assignTo: analyst,
        newSuggestion: chart?.suggested?.length || 0,
        carryForward: chart?.carry_forward?.length || 0
    });
};
// Function to map API response to expected DraftDataTypes
const mapReviewResponse = (data: Record): ReviewDataTypes => {
    const { id = "", DOS = "", chart, analyst = "", member, facility = "", status } = data;
    const { id: mID = "", first_name = "", last_name = "", DOB = "", PCP = "", company_plan_coinsurance: insurance = "" } = member;
    return ({
        chartId: (`${chart?.id}` || ""),
        appId: `${id}`,
        mID: member.id,
        dos: DOS ? formatDOS(DOS)?.replace(/\//g, "-") : "",
        memberId: mID,
        firstName: first_name,
        lastName: last_name,
        dob: DOB?.replace(/\//g, "-"),
        pcp: PCP,
        facility: facility,
        insurance,
        status: status?.status === "In Progress" ? REVIEWSTATUS.INPROGRESS : REVIEWSTATUS.RFR,
        assignTo: analyst,
        newSuggestion: chart?.suggested?.length || 0,
        carryForward: chart?.carry_forward?.length || 0,
    });
};
// Define API response structure
interface ApiResponse {
    data: Record[],
    status: "Success" | "Not Found" | "Error"; // Assuming status could be "Failure" too
    message: string;
}

// Enum for Fetch Status
enum FetchStatus {
    IDLE = "idle",
    LOADING = "loading",
    SUCCEEDED = "succeeded",
    FAILED = "failed",
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}



// Redux State
interface PrevisitState {
    draftData: {
        data: DraftDataTypes[]
        status: FetchStatus
        error: string | null
    }
    pendingData: {
        data: PrevisitDataTypes[]
        status: FetchStatus
        error: string | null
    }
    reviewData: {
        data: ReviewDataTypes[]
        status: FetchStatus
        error: string | null
    }
    providerReview: {
        data: ProviderReviewDataTypes[]
        status: FetchStatus
        error: string | null
    }
    allData: {
        data: (DraftDataTypes | PrevisitDataTypes | ReviewDataTypes | ProviderReviewDataTypes)[]
        status: FetchStatus
        error: string | null
    }
}

// Initial State
const initialState: PrevisitState = {
    draftData: {
        data: [],
        status: FetchStatus.IDLE,
        error: null,
    },
    reviewData: {
        data: [],
        status: FetchStatus.IDLE,
        error: null
    },
    providerReview: {
        data: [],
        status: FetchStatus.IDLE,
        error: null
    },
    pendingData: {
        data: [],
        status: FetchStatus.IDLE,
        error: null,
    },
    allData: {
        data: [],
        status: FetchStatus.IDLE,
        error: null,
    },
};


// Async Thunk for fetching Pending Data
export const getAllPendingData = createAsyncThunk<PrevisitDataTypes[], void, { rejectValue: string }>(
    "previsit/getAllPendingData",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchData<ApiResponse>("/get/pending_appointments/?stage=PENDING");
            if (response.data.status === "Success") {
                // toast.success(`${response?.data.message}`)
            } else {
                toast.error(`${response?.data.message}`);
            }
            const records: Record[] = Array.isArray(response?.data?.data) ? response?.data?.data : [];
            return records.map(mapPendingResponse);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    },
);
export const getAllDraftData = createAsyncThunk<DraftDataTypes[], void, { rejectValue: string }>(
    "previsit/getAllDraftData",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchData<ApiResponse>("/get/pending_appointments/?stage=Draft");
            if (response.data.status === "Success") {
                // toast.success(`${response?.data.message}`)
            } else {
                toast.error(`${response?.data.message}`);
            }
            const records: Record[] = Array.isArray(response?.data?.data) ? response.data?.data : [];
            return records.map(mapDraftResponse);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    }
);

export const getAllReviewData = createAsyncThunk<ReviewDataTypes[], void, { rejectValue: string }>(
    "previsit/getAllReviewData",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchData<ApiResponse>("/get/review_appointments/?stage=Review");
            if (response.data.status === "Success") {
                // toast.success(`${response?.data.message}`)
            } else {
                toast.error(`${response?.data.message}`);
            }
            const records: Record[] = Array.isArray(response?.data?.data) ? response.data?.data : [];
            return records.map(mapReviewResponse);

        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    }
);
export const getAllProviderReviewData = createAsyncThunk<ProviderReviewDataTypes[], void, { rejectValue: string }>(
    "previsit/getAllProviderReviewData",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchData<ApiResponse>("/get/review_appointments/?stage=Provider Review");
            if (response.data.status === "Success") {
                // toast.success(`${response?.data.message}`)
            } else {
                toast.error(`${response?.data.message}`);
            }
            const records: Record[] = Array.isArray(response?.data?.data) ? response.data?.data : [];

            return records.map(mapProviderReviewResponse);
            return [];
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    }
);

const previsitSlice = createSlice({
    name: "previsit",
    initialState,
    reducers: {
        clearPendingData: (state) => {
            state.pendingData.data = [];
            state.pendingData.status = FetchStatus.IDLE;
            state.pendingData.error = null;
            state.allData.data = [...state.draftData.data];
        },
        clearDraftData: (state) => {
            state.draftData.data = [];
            state.draftData.status = FetchStatus.IDLE;
            state.draftData.error = null;
            state.allData.data = [...state.pendingData.data];
        },
        clearAllData: (state) => {
            state.allData.data = [];
            state.allData.status = FetchStatus.IDLE;
            state.allData.error = null;
        },
    },
    extraReducers: (builder) => {
        // Draft Data Handling
        builder
            .addCase(getAllDraftData.pending, (state) => {
                state.draftData.status = FetchStatus.LOADING;
                state.draftData.error = null;
            })
            .addCase(getAllDraftData.fulfilled, (state, action: PayloadAction<DraftDataTypes[]>) => {
                state.draftData.status = FetchStatus.SUCCEEDED;
                state.draftData.data = action.payload;
                state.allData.data = [...state.pendingData.data, ...action.payload];
            })
            .addCase(getAllDraftData.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.draftData.status = FetchStatus.FAILED;
                state.draftData.error = action.payload || "Failed to fetch draft data";
            });

        // Pending Data Handling
        builder
            .addCase(getAllPendingData.pending, (state) => {
                state.pendingData.status = FetchStatus.LOADING;
                state.pendingData.error = null;
            })
            .addCase(getAllPendingData.fulfilled, (state, action: PayloadAction<PrevisitDataTypes[]>) => {
                state.pendingData.status = FetchStatus.SUCCEEDED;
                state.pendingData.data = action.payload;
                state.allData.data = [...state.draftData.data, ...action.payload];
            })
            .addCase(getAllPendingData.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.pendingData.status = FetchStatus.FAILED;
                state.pendingData.error = action.payload || "Failed to fetch pending data";
            });
        // Review Data Handling
        builder
            .addCase(getAllReviewData.pending, (state) => {
                state.reviewData.status = FetchStatus.LOADING;
                state.reviewData.error = null;
            })
            .addCase(getAllReviewData.fulfilled, (state, action: PayloadAction<ReviewDataTypes[]>) => {
                state.reviewData.status = FetchStatus.SUCCEEDED;
                state.reviewData.data = action.payload;
                state.allData.data = [...state.draftData.data, ...action.payload];
            })
            .addCase(getAllReviewData.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.reviewData.status = FetchStatus.FAILED;
                state.reviewData.error = action.payload || "Failed to fetch pending data";
            });
        // Provider Data Handling
        builder
            .addCase(getAllProviderReviewData.pending, (state) => {
                state.providerReview.status = FetchStatus.LOADING;
                state.providerReview.error = null;
            })
            .addCase(getAllProviderReviewData.fulfilled, (state, action: PayloadAction<ProviderReviewDataTypes[]>) => {
                state.providerReview.status = FetchStatus.SUCCEEDED;
                state.providerReview.data = action.payload;
                state.allData.data = [...state.draftData.data, ...action.payload];
            })
            .addCase(getAllProviderReviewData.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.providerReview.status = FetchStatus.FAILED;
                state.providerReview.error = action.payload || "Failed to fetch pending data";
            });
    },
});

export const { clearPendingData, clearDraftData, clearAllData } = previsitSlice.actions;
export default previsitSlice.reducer;

