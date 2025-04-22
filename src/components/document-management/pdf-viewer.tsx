"use client"

import { Button } from "@/components/ui/button"
import { useRedux } from "@/hooks/use-redux"
import type { RootState } from "@/store"
import {
  completeReview,
  pauseReview,
  resumeReview,
  startReview,
  startTimer,
  stopTimer,
  updateElapsedTime,
} from "@/store/slices/documentManagementSlice"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, Clock, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import PdfUI from "../ui/pdfUI"

export default function PdfViewer() {
  const { dispatch } = useRedux()
  const { documents, selectedDocumentId, isRunning } = useSelector((state: RootState) => state.documentManagement)

  const selectedDocument = documents.find((doc) => doc.id === selectedDocumentId)

  const [showControls, setShowControls] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Reset UI state when document changes
    if (selectedDocument) {
      setShowControls(selectedDocument.status === "in_progress")

      // Set initial time
      if (selectedDocument.startTime && selectedDocument.status === "in_progress") {
        const elapsed = Math.floor((Date.now() - selectedDocument.startTime) / 1000) + (selectedDocument.timeSpent || 0)
        setCurrentTime(elapsed)
      } else if (selectedDocument.timeSpent) {
        setCurrentTime(selectedDocument.timeSpent)
      } else {
        setCurrentTime(0)
      }
    }
  }, [selectedDocumentId, selectedDocument])

  useEffect(() => {
    // Start or stop timer based on isRunning state
    if (isRunning && selectedDocument?.status === "in_progress") {
      timerRef.current = setInterval(() => {
        if (selectedDocument.startTime) {
          const elapsed =
            Math.floor((Date.now() - selectedDocument.startTime) / 1000) + (selectedDocument.timeSpent || 0)
          setCurrentTime(elapsed)
          dispatch(updateElapsedTime())
        }
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, selectedDocument, dispatch])

  if (!selectedDocument) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-xl font-medium">Select a document to review</p>
      </div>
    )
  }

  const handleStart = () => {
    dispatch(startReview(selectedDocument.id))
    dispatch(startTimer())
    setShowControls(true)
  }

  const handlePause = () => {
    dispatch(pauseReview(selectedDocument.id))
    dispatch(stopTimer())
    setShowControls(false)
  }

  const handleResume = () => {
    dispatch(resumeReview(selectedDocument.id))
    dispatch(startTimer())
    setShowControls(true)
  }

  const handleComplete = () => {
    dispatch(completeReview(selectedDocument.id))
    dispatch(stopTimer())
    setShowControls(false)
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const pdfUrl = selectedDocument.url || "/pdf/medical_report_user_1.pdf"

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        {/* PDF Viewer */}
        <div className="w-full h-full bg-gray-100 relative">
          <div className="h-full max-h-[89.2vh] overflow-auto">
            <PdfUI url={pdfUrl} />
          </div>

          <AnimatePresence>
            {!showControls && selectedDocument.status !== "completed" && (
              <motion.div
                key="reviewOverlay"
                className="absolute inset-0 backdrop-blur-sm bg-black/30 flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 mb-4 group"
                    onClick={selectedDocument.status === "on_hold" ? handleResume : handleStart}
                  >
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Play
                        className="text-white transition-all duration-300 ease-in-out"
                        style={{
                          height: "2rem",
                          width: "2rem",
                        }}
                      />
                    </motion.div>
                  </Button>
                </motion.div>
                <p className="text-white font-medium">
                  {selectedDocument.status === "on_hold" ? "Resume Review" : "Start Review"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timer display */}
        <div className="absolute z-50 top-11 right-4 bg-white/80 rounded-[1px] px-3 py-1 flex items-center gap-2 border border-selectedText">
          <Clock className="h-4 w-4" />
          <span className="font-mono">{formatTime(currentTime)}</span>
        </div>
      </div>

      <div className="p-1.5 pr-3 border-t">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{selectedDocument.name}</h3>
            <p className="text-sm text-muted-foreground">Status: {selectedDocument.status.replace("_", " ")}</p>
          </div>

          <div className="flex gap-2">
            {showControls && selectedDocument.status !== "completed" ? (
              <>
                {/*  <Button variant="outline" onClick={handlePause}>
                  <Pause className="h-4 w-4 mr-2" />
                  On Hold
                </Button> */}
                <Button onClick={handleComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
