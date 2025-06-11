import { EndDateFilter, StartDateFilter } from "@/lib/utils";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ColumnFiltersState, PaginationState, SortingState, VisibilityState } from "@tanstack/react-table";

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
    selectedRows?: string[]
    columnOrder?: string[]
}

interface TableFiltersState {
    [tabKey: string]: TableFilterState
}

const initialState: TableFiltersState = {
    pending: {
        columnFilters: [],
        sorting: [],
        columnVisibility: {},
        dateRange: [StartDateFilter, EndDateFilter],
        pagination: { pageIndex: 0, pageSize: 25 },
        selectedRows: [],
        columnOrder: [],
    },
    assigned: {
        columnFilters: [],
        sorting: [],
        columnVisibility: {},
        dateRange: [StartDateFilter, EndDateFilter],
        pagination: { pageIndex: 0, pageSize: 25 },
        selectedRows: [],
        columnOrder: [],
    },
    audit: {
        columnFilters: [],
        sorting: [],
        columnVisibility: {},
        dateRange: [StartDateFilter, EndDateFilter],
        pagination: { pageIndex: 0, pageSize: 25 },
        selectedRows: [],
        columnOrder: [],
    },
    completed: {
        columnFilters: [],
        sorting: [],
        columnVisibility: {},
        dateRange: [StartDateFilter, EndDateFilter],
        pagination: { pageIndex: 0, pageSize: 25 },
        selectedRows: [],
        columnOrder: [],
    },
};

const tableFiltersSlice = createSlice({
    name: "tableFilters",
    initialState,
    reducers: {
        setTabFilters: (
            state,
            action: PayloadAction<{
                tabKey: string
                filters: Partial<TableFilterState>
            }>,
        ) => {
            const { tabKey, filters } = action.payload;

            if (!state[tabKey]) {
                state[tabKey] = {
                    columnFilters: [],
                    sorting: [],
                    columnVisibility: {},
                    dateRange: [StartDateFilter, EndDateFilter],
                    pagination: { pageIndex: 0, pageSize: 25 },
                    selectedRows: [],
                    columnOrder: [],
                };
            }
            state[tabKey] = { ...state[tabKey], ...filters };
        },
        setTabPagination: (
            state,
            action: PayloadAction<{
                tabKey: string
                pagination: PaginationState
            }>,
        ) => {
            const { tabKey, pagination } = action.payload;
            if (!state[tabKey]) {
                state[tabKey] = {
                    columnFilters: [],
                    sorting: [],
                    columnVisibility: {},
                    dateRange: [StartDateFilter, EndDateFilter],
                    pagination: { pageIndex: 0, pageSize: 25 },
                    selectedRows: [],
                    columnOrder: [],
                };
            }
            state[tabKey].pagination = pagination;
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
        setSelectedRows: (
            state,
            action: PayloadAction<{
                tabKey: string
                selectedRows: string[]
            }>,
        ) => {
            const { tabKey, selectedRows } = action.payload;
            if (!state[tabKey]) {
                state[tabKey] = {
                    columnFilters: [],
                    sorting: [],
                    columnVisibility: {},
                    dateRange: [null, null],
                    selectedRows: [],
                    columnOrder: [],
                };
            }
            state[tabKey].selectedRows = selectedRows;
        },
        clearTabFilters: (state, action: PayloadAction<string>) => {
            const tabKey = action.payload;
            if (state[tabKey]) {
                state[tabKey] = {
                    columnFilters: [],
                    sorting: [],
                    columnVisibility: {},
                    dateRange: [StartDateFilter, EndDateFilter],
                    pagination: { pageIndex: 0, pageSize: 25 },
                    selectedRows: [],
                    columnOrder: [],
                };
            }
        },
        clearAllFilters: () => {
            return initialState;
        },
    },
});

export const {
    setTabFilters,
    setTabPagination,
    setTabPageCount,
    setTabPaginationUI,
    setSelectedRows,
    clearTabFilters,
    clearAllFilters,
} = tableFiltersSlice.actions;
export default tableFiltersSlice.reducer;
