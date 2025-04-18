import { fetchData } from "@/lib/api/api-client";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


interface HccMasterItem {
    id: number;
    hcc: string;
    category_name: string;
    version: string | null;
}

interface HccMasterResponse {
    status: string;
    message: string;
    data: HccMasterItem[];
}

interface MasterDataState {
    hccMaster: HccMasterItem[];
    loading: boolean;
    error: string | null;
}

const initialState: MasterDataState = {
    hccMaster: [],
    loading: false,
    error: null,
};

export const getHccMasterData = createAsyncThunk<
    HccMasterItem[],
    void,
    { rejectValue: string }
>(
    "hcc/getHccMasterData",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchData<HccMasterResponse>("/get/hcc_master/");
            if (response.data.status === "Success") {
                return response.data.data || [];
            } else {
                return rejectWithValue(response.data.message);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Something went wrong");
        }
    }
);

const masterDataSlice = createSlice({
    name: "master",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getHccMasterData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getHccMasterData.fulfilled, (state, action) => {
                state.loading = false;
                state.hccMaster = action.payload;
            })
            .addCase(getHccMasterData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch HCC master data";
            });
    },
});

export default masterDataSlice.reducer;
