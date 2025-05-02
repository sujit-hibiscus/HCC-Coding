import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DashboardData } from "@/lib/types/dashboard";
import { generateDashboardData } from "@/components/dashboard/data-generator";

export interface DashboardFilters3State {
    dateRange: [Date | null, Date | null]
    dashboardData: DashboardData | null
    isLoading: boolean
    isDirty: boolean
    activeChartSeries: {
        charts: boolean
        audits: boolean
    }
    filtersApplied: boolean
}

const today = new Date();
const defaultStartDate = new Date(today);
defaultStartDate.setDate(today.getDate() - 30); // Default to one month
const defaultEndDate = new Date(today);

const initialState: DashboardFilters3State = {
    dateRange: [defaultStartDate, defaultEndDate],
    dashboardData: generateDashboardData(defaultStartDate, defaultEndDate),
    isLoading: false,
    isDirty: false,
    activeChartSeries: {
        charts: true,
        audits: true,
    },
    filtersApplied: false,
};

const dashboardFilters3Slice = createSlice({
    name: "dashboardFilters3",
    initialState,
    reducers: {
        setDateRange: (state, action: PayloadAction<[Date | null, Date | null]>) => {
            if (action.payload[0] && action.payload[1]) {
                state.dateRange = action.payload;
                state.isDirty = true;
                state.filtersApplied = true;
            }
        },
        loadDashboardData: (state) => {
            if (state.dateRange[0] && state.dateRange[1]) {
                state.isLoading = true;
            }
        },
        setDashboardData: (state, action: PayloadAction<DashboardData>) => {
            state.dashboardData = action.payload;
            state.isLoading = false;
            state.isDirty = false;
        },
        toggleChartSeries: (state, action: PayloadAction<"charts" | "audits">) => {
            state.activeChartSeries[action.payload] = !state.activeChartSeries[action.payload];
            state.filtersApplied = true;
        },
        resetDashboard: (state) => {
            state.dateRange = [defaultStartDate, defaultEndDate];
            state.dashboardData = generateDashboardData(defaultStartDate, defaultEndDate);
            state.isLoading = false;
            state.isDirty = false;
            state.activeChartSeries = {
                charts: true,
                audits: true,
            };
            state.filtersApplied = false;
        },
    },
});

export const { setDateRange, setDashboardData, resetDashboard, toggleChartSeries, loadDashboardData } =
    dashboardFilters3Slice.actions;

export default dashboardFilters3Slice.reducer;
