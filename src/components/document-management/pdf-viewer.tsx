"use client"

import { Button } from "@/components/ui/button"
import { CreatableSelect } from "@/components/ui/creatable-select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

// Add interface for form data
interface SubmissionFormData {
  codesMissed: { value: string; label: string }[]
  codesCorrected: { value: string; label: string }[]
  auditRemarks: string
}

export default function PdfViewer() {
  const { dispatch, selector } = useRedux()
  const { documents, selectedDocumentId, isRunning } = useSelector((state: RootState) => state.documentManagement);
  const { userType } = selector(state => state.user);

  const selectedDocument = documents.find((doc) => doc.id === selectedDocumentId)

  const [showControls, setShowControls] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Add state for modal
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<SubmissionFormData>({
    codesMissed: [],
    codesCorrected: [],
    auditRemarks: "",
  })

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

  const handleComplete = (showModal = true) => {
    if (showModal) {
      setShowModal(true)
    } else {
      submitReview()
    }
  }

  const submitReview = () => {
    dispatch(completeReview(selectedDocument.id))
    dispatch(stopTimer())
    setShowControls(false)

    // Log the form data
    console.log("Submission data:", formData)

    // Reset form data
    setFormData({
      codesMissed: [],
      codesCorrected: [],
      auditRemarks: "",
    })

    // Close modal if open
    setShowModal(false)

    // API call would go here (commented out)
    /*
    const submitData = async () => {
      try {
        const response = await fetch('/api/document-review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: selectedDocument.id,
            reviewData: formData
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit review');
        }
        
        const data = await response.json();
        console.log('Review submitted successfully:', data);
      } catch (error) {
        console.error('Error submitting review:', error);
      }
    };
    
    submitData();
    */
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
                <Button onClick={() => handleComplete(userType === "Auditor")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        <Dialog open={showModal} onOpenChange={setShowModal} >
          <DialogContent className="sm:max-w-[600px] p-3">
            <DialogHeader>
              <DialogTitle>Document Review Submission</DialogTitle>
            </DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-4 py-2"
            >
              <div className="grid gap-2">
                <Label htmlFor="codes-missed">Codes Missed</Label>
                <CreatableSelect
                  id="codes-missed"
                  isMulti
                  placeholder="Add codes that were missed..."
                  value={formData.codesMissed}
                  onChange={(newValue) =>
                    setFormData((prev) => ({ ...prev, codesMissed: newValue as { value: string; label: string }[] }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="codes-corrected">Codes Corrected</Label>
                <CreatableSelect
                  id="codes-corrected"
                  isMulti
                  placeholder="Add codes that were corrected..."
                  value={formData.codesCorrected}
                  onChange={(newValue) =>
                    setFormData((prev) => ({ ...prev, codesCorrected: newValue as { value: string; label: string }[] }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="audit-remarks">Audit Remarks</Label>
                <Textarea
                  id="audit-remarks"
                  placeholder="Enter your audit remarks here..."
                  value={formData.auditRemarks}
                  onChange={(e) => setFormData((prev) => ({ ...prev, auditRemarks: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={submitReview}>Submit Review</Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </div>
  )
}
