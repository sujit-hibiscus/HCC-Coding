"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { updateElapsedTime } from "@/store/slices/timerSlice"

export default function TimerDisplay() {
  const dispatch = useDispatch()
  const { isRunning, elapsedTime } = useSelector((state: RootState) => state.timer)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        dispatch(updateElapsedTime())
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, dispatch])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return <div className="font-mono text-sm">{formatTime(elapsedTime)}</div>
}
