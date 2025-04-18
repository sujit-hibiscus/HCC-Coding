import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Define the filter state interface
export interface PdfFilterState {
    zoom?: number
    currentPage?: number
    searchText?: string
    isDarkTheme?: boolean
    // Add any other filter options you need
}

// Define the state structure with PDF URLs as keys
interface PdfFiltersState {
    [pdfUrl: string]: PdfFilterState
}

const initialState: PdfFiltersState = {};

export const pdfFiltersSlice = createSlice({
    name: "pdfFilters",
    initialState,
    reducers: {
        updatePdfFilters: (state, action: PayloadAction<{ pdfUrl: string; filters: PdfFilterState }>) => {
            const { pdfUrl, filters } = action.payload;
            // Create or update filters for this PDF
            state[pdfUrl] = {
                ...state[pdfUrl],
                ...filters,
            };
        },
        resetPdfFilters: (state, action: PayloadAction<string>) => {
            // Reset filters for a specific PDF
            delete state[action.payload];
        },
        resetAllPdfFilters: () => {
            // Reset all filters
            return initialState;
        },
    },
});

export const { updatePdfFilters, resetPdfFilters, resetAllPdfFilters } = pdfFiltersSlice.actions;

export default pdfFiltersSlice.reducer;

