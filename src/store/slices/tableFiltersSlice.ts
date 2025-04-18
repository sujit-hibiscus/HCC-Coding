import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ColumnFiltersState, SortingState, VisibilityState, PaginationState } from "@tanstack/react-table";

export interface TableFilterState {
    columnFilters: ColumnFiltersState
    sorting: SortingState
    columnVisibility: VisibilityState
    dateRange: [Date | null, Date | null]
    pageCount?: number
    pagination?: PaginationState
    paginationUI?: {
        showCustomInput: boolean
        customPageSize: string
    }
}

interface TableFiltersState {
    [tabKey: string]: TableFilterState
}

const initialState: TableFiltersState = {};

const tableFiltersSlice = createSlice({
    name: "tableFilters",
    initialState,
    reducers: {
        setTabFilters: (
            state,
            action: PayloadAction<{
                tabKey: string
                filters: TableFilterState
            }>,
        ) => {
            const { tabKey, filters } = action.payload;
            state[tabKey] = filters;
        },
        setTabPagination: (
            state,
            action: PayloadAction<{
                tabKey: string
                pagination: PaginationState
            }>,
        ) => {
            const { tabKey, pagination } = action.payload;
            if (state[tabKey]) {
                state[tabKey].pagination = pagination;
            }
        },
        setTabPageCount: (
            state,
            action: PayloadAction<{
                tabKey: string
                pageCount: number
            }>,
        ) => {
            const { tabKey, pageCount } = action.payload;
            if (state[tabKey]) {
                state[tabKey].pageCount = pageCount;
            }
        },
        setTabPaginationUI: (
            state,
            action: PayloadAction<{
                tabKey: string
                paginationUI: {
                    showCustomInput: boolean
                    customPageSize: string
                }
            }>,
        ) => {
            const { tabKey, paginationUI } = action.payload;
            if (state[tabKey]) {
                state[tabKey].paginationUI = paginationUI;
            }
        },
        clearTabFilters: (state, action: PayloadAction<string>) => {
            const tabKey = action.payload;
            if (state[tabKey]) {
                delete state[tabKey];
            }
        },
        clearAllFilters: () => {
            return {};
        },
    },
});

export const {
    setTabFilters,
    setTabPagination,
    setTabPageCount,
    setTabPaginationUI,
    clearTabFilters,
    clearAllFilters,
} = tableFiltersSlice.actions;
export default tableFiltersSlice.reducer;

