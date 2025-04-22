import { createSlice } from "@reduxjs/toolkit"

interface TimerState {
  isRunning: boolean
  startTime: number | null
  elapsedTime: number
}

const initialState: TimerState = {
  isRunning: false,
  startTime: null,
  elapsedTime: 0,
}

const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    startTimer: (state) => {
      if (!state.isRunning) {
        state.isRunning = true
        state.startTime = Date.now()
      }
    },
    stopTimer: (state) => {
      if (state.isRunning && state.startTime) {
        state.isRunning = false
        state.elapsedTime += Math.floor((Date.now() - state.startTime) / 1000)
        state.startTime = null
      }
    },
    resetTimer: (state) => {
      state.isRunning = false
      state.startTime = null
      state.elapsedTime = 0
    },
    updateElapsedTime: (state) => {
      if (state.isRunning && state.startTime) {
        const currentElapsed = Math.floor((Date.now() - state.startTime) / 1000)
        state.elapsedTime = currentElapsed
      }
    },
  },
})

export const { startTimer, stopTimer, resetTimer, updateElapsedTime } = timerSlice.actions

export default timerSlice.reducer
