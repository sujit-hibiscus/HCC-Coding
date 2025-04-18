import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { generateChartData } from "@/components/charts/data-generator";

export interface ChartsFilterState {
  dateRange: [Date | null, Date | null]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: any
  isLoading: boolean
  expandedChart: string[]
  activeFilters: {
    [chartId: string]: string[]
  }
  animationComplete: boolean
  isDirty: boolean
}

const today = new Date();
const defaultStartDate = new Date(today);
defaultStartDate.setDate(today.getDate() - 7);
const defaultEndDate = new Date(today);
defaultEndDate.setDate(today.getDate() + 7);

const initialState: ChartsFilterState = {
  dateRange: [defaultStartDate, defaultEndDate],
  chartData: generateChartData(defaultStartDate, defaultEndDate),
  isLoading: false,
  expandedChart: [],
  activeFilters: {
    HCCIdentified: [
      "V24CarryForward",
      "V28CarryForward",
      "V28Suggested",
      "V24Suggested"
    ],
    chartsVolume: [
      "Draft",
      "Pending",
      "Provider Review",
      "Closed"
    ],
    hccVolume: ["Opportunities", "Carry Forward"],
    topProviders: ["V24", "V28"],
    hccVersions: ["V24", "V28", "Suggested", "Carry Forward"],
  },
  animationComplete: true,
  isDirty: false,
};

const chartsFilterSlice = createSlice({
  name: "chartsFilter",
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<[Date | null, Date | null]>) => {
      state.dateRange = action.payload;
      state.isLoading = true;
      state.animationComplete = false;
      state.isDirty = true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setChartData: (state, action: PayloadAction<any>) => {
      state.chartData = action.payload;
      state.isLoading = false;
      state.animationComplete = true;
    },
    toggleExpandChart: (state, action: PayloadAction<{ isIncluded: boolean; data: string }>) => {
      const { isIncluded, data } = action.payload;

      if (isIncluded) {
        state.expandedChart = state.expandedChart.filter(id => id !== data);
      } else {
        state.expandedChart.push(data);
      }

      state.isDirty = true;
    },
    toggleFilter: (state, action: PayloadAction<{ chartId: string; filter: string }>) => {
      const { chartId, filter } = action.payload;
      const currentFilters = state.activeFilters[chartId] || [];

      if (currentFilters.includes(filter)) {
        state.activeFilters[chartId] = currentFilters.filter((f) => f !== filter);
      } else {
        state.activeFilters[chartId] = [...currentFilters, filter];
      }
      state.isDirty = true;
    },
    resetDashboard: () => {
      return { ...initialState, chartData: initialState.chartData };
    },
  },
});

export const { setDateRange, setChartData, toggleExpandChart, toggleFilter, resetDashboard } = chartsFilterSlice.actions;

export default chartsFilterSlice.reducer;
