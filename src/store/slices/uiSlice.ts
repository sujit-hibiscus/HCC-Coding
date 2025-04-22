import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface UiState {
  selectedDocumentId: string | null
  isFullscreen: boolean
}

const initialState: UiState = {
  selectedDocumentId: null,
  isFullscreen: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    selectDocument: (state, action: PayloadAction<string>) => {
      state.selectedDocumentId = action.payload
    },
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen
    },
  },
})

export const { selectDocument, toggleFullscreen } = uiSlice.actions

export default uiSlice.reducer
