import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DateRangeState {
    startDate: string | null;
    endDate: string | null;
    filteredCounts: {
        Pending: number;
        Assigned: number;
        Audit: number;
        Completed: number;
    };
}

const initialState: DateRangeState = {
    startDate: null,
    endDate: null,
    filteredCounts: {
        Pending: 0,
        Assigned: 0,
        Audit: 0,
        Completed: 0
    }
};

const dateRangeSlice = createSlice({
    name: "dateRange",
    initialState,
    reducers: {
        setDateRange: (state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) => {
            state.startDate = action.payload.startDate;
            state.endDate = action.payload.endDate;
        },
        updateFilteredCounts: (state, action: PayloadAction<{ key: keyof DateRangeState["filteredCounts"]; count: number }>) => {
            const { key, count } = action.payload;
            state.filteredCounts[key] = count;
        },
        resetDateRange: (state) => {
            state.startDate = null;
            state.endDate = null;
            state.filteredCounts = {
                Pending: 0,
                Assigned: 0,
                Audit: 0,
                Completed: 0
            };
        }
    }
});

export const { setDateRange, updateFilteredCounts, resetDateRange } = dateRangeSlice.actions;
export default dateRangeSlice.reducer; 