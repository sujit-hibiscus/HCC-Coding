"use client"

import { Button } from "@/components/ui/button"
import { useRedux } from "@/hooks/use-redux"
import { SubmissionFormSchema } from "@/lib/schemas"
import type { RootState } from "@/store"
import {
  completeReviewAuditorWithAPI,
  completeReviewWithAPI,
  fetchDocuments,
  resetCodeReview,
  resetFormData,
  resumeReview,
  startReviewAuditorWithApi,
  startReviewWithApi,
  updateElapsedTime,
  updateFormData,
} from "@/store/slices/documentManagementSlice"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { PreventSaveProvider } from "../layout/prevent-save-provider"
import PdfUI from "../ui/pdfUI"
import AuditorReviewForm from "./auditor-review-form"
import ImprovedCodeReviewForm from "./code-cart-form"

export default function PdfViewer({
  onReviewComplete,
  toggleFullScreen,
  isFullScreenMode = false,
}: {
  onReviewComplete?: () => void
  isFullScreenMode?: boolean
  toggleFullScreen?: () => void
}) {
  const { dispatch, selector } = useRedux()
  const {
    documents,
    selectedDocumentId,
    isRunning,
    pdfUrl = "",
    pdfLoading,
    formData: allFormData,
    codeReview: allCodeReview,
  } = selector((state: RootState) => state.documentManagement)
  const { userType } = selector((state) => state.user)

  const selectedDocument = documents
    ?.filter((item: { status: string }) => item?.status !== "completed")
    .find((doc: { id: string }) => doc.id === selectedDocumentId)

  const isSidebar = selectedDocument?.status === "In Review"

  const [showControls, setShowControls] = useState(false)
  const [, setCurrentTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [showSidebar, setShowSidebar] = useState(false)

  // Get form data for the selected document from Redux store
  const currentFormData = selectedDocumentId ? allFormData[selectedDocumentId] : null

  // Get code review data for the selected document
  const currentCodeReview = selectedDocumentId
    ? allCodeReview[selectedDocumentId] || {
      items: [],
      analystNotes: "",
      auditorNotes: "",
      searchTerm: "",
    }
    : {
      items: [],
      analystNotes: "",
      auditorNotes: "",
      searchTerm: "",
    }

  const [formErrors, setFormErrors] = useState<{
    codesMissed?: string[]
    codesCorrected?: string[]
    auditRemarks?: string
    rating?: string
  }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStartingReview, setIsStartingReview] = useState(false)
  const [isCompletingReview, setIsCompletingReview] = useState(false)

  useEffect(() => {
    if (selectedDocument) {
      setShowControls(selectedDocument.status === "In Review")

      if (selectedDocument.startTime && selectedDocument.status === "In Review") {
        const elapsed = Math.floor((Date.now() - selectedDocument.startTime) / 1000) + (selectedDocument.timeSpent || 0)
        setCurrentTime(elapsed)
      } else if (selectedDocument.timeSpent) {
        setCurrentTime(selectedDocument.timeSpent)
      } else {
        setCurrentTime(0)
      }
    }
  }, [selectedDocumentId, selectedDocument])

  // Initialize form data for the selected document if it doesn't exist
  useEffect(() => {
    if (selectedDocumentId && !allFormData[selectedDocumentId] && userType === "Auditor") {
      dispatch(
        updateFormData({
          documentId: selectedDocumentId,
          data: {
            codesMissed: [],
            codesCorrected: [],
            auditRemarks: "",
            rating: 0,
          },
        }),
      )
    }
  }, [selectedDocumentId, allFormData, dispatch, userType])

  useEffect(() => {
    if (isRunning && selectedDocument?.status === "In Review" && !showSidebar) {
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
  }, [isRunning, selectedDocument, dispatch, showSidebar])

  useEffect(() => {
    if (showSidebar && isRunning) {
      // Pause the timer when sidebar opens
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    } else if (!showSidebar && selectedDocument?.status === "In Review") {
      // Resume the timer when sidebar closes if document is still in progress
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          if (selectedDocument.startTime) {
            const elapsed =
              Math.floor((Date.now() - selectedDocument.startTime) / 1000) + (selectedDocument.timeSpent || 0)
            setCurrentTime(elapsed)
            dispatch(updateElapsedTime())
          }
        }, 1000)
      }
    }
  }, [showSidebar, isRunning, selectedDocument, dispatch])

  if (!selectedDocument) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-xl font-medium">
            {!(documents?.length > 0) ? "No documents available!" : "Select a document to review"}
          </p>
          <p className="text-gray-400 text-sm">
            {!(documents?.length > 0)
              ? "Check back later for new assignments"
              : "Choose from the document list to get started"}
          </p>
        </motion.div>
      </div>
    )
  }

  const handleStart = async () => {
    setIsStartingReview(true)
    if (userType === "Auditor") {
      try {
        const resultAction = await dispatch(startReviewAuditorWithApi(selectedDocument))
        if (startReviewAuditorWithApi.fulfilled.match(resultAction)) {
          dispatch(fetchDocuments())
          setShowControls(true)
        }
      } catch (error) {
        console.error("Error starting review:", error)
      } finally {
        setIsStartingReview(false)
      }
    } else {
      try {
        const resultAction = await dispatch(startReviewWithApi(selectedDocument))
        if (startReviewWithApi.fulfilled.match(resultAction)) {
          dispatch(fetchDocuments())
          setShowControls(true)
        }
      } catch (error) {
        console.error("Error starting review:", error)
      } finally {
        setIsStartingReview(false)
      }
    }
  }

  const handleResume = () => {
    setIsStartingReview(true)
    try {
      dispatch(resumeReview(selectedDocument.id))
      setShowControls(true)
    } catch (error) {
      console.error("Error resuming review:", error)
    } finally {
      setIsStartingReview(false)
    }
  }

  const handleComplete = () => {
    if (userType === "Auditor") {
      setShowSidebar(true)
    } else {
      setIsCompletingReview(true)
      submitChartApiCall()
    }
    if (onReviewComplete) {
      onReviewComplete()
    }
  }

  const validateForm = () => {
    if (!currentFormData) return false

    const result = SubmissionFormSchema.safeParse(currentFormData)

    if (!result.success) {
      const formattedErrors = result.error.format()
      setFormErrors({
        codesMissed: formattedErrors.codesMissed?._errors,
        codesCorrected: formattedErrors.codesCorrected?._errors,
        auditRemarks: formattedErrors.auditRemarks?._errors?.[0],
        rating: formattedErrors.rating?._errors?.[0],
      })
      return false
    }

    setFormErrors({})
    return true
  }

  const submitChartApiCall = async () => {
    setIsCompletingReview(true)
    try {
      // Include code review data in the API call
      const resultAction = await dispatch(
        completeReviewWithAPI({
          ...selectedDocument,
          // This would be sent to the API if needed
          reviewData: currentCodeReview,
        }),
      )
      if (completeReviewWithAPI.fulfilled.match(resultAction)) {
        dispatch(fetchDocuments())
        setShowControls(false)
        // Reset code review data after successful completion
        if (selectedDocumentId) {
          dispatch(resetCodeReview(selectedDocumentId))
        }
        if (onReviewComplete) {
          onReviewComplete()
        }
      }
    } catch (error) {
      console.error("Error completing review:", error)
    } finally {
      setIsCompletingReview(false)
    }
  }

  const submitChartAuditorApiCall = async () => {
    setIsCompletingReview(true)

    const bodyData = {
      codes_corrected: formData.codesCorrected?.map((item) => item.value) || [],
      codes_missed: formData.codesMissed?.map((item) => item.value) || [],
      rating: formData.rating || "0",
      audit_remarks: formData.auditRemarks || "",
    } as {
      codes_corrected: string[]
      codes_missed: string[]
      rating: number | string
      audit_remarks: string
    }
    try {
      const resultAction = await dispatch(completeReviewAuditorWithAPI({ doc: selectedDocument, body: bodyData }))
      if (completeReviewAuditorWithAPI.fulfilled.match(resultAction)) {
        dispatch(fetchDocuments())
        setShowControls(false)
        if (onReviewComplete) {
          onReviewComplete()
        }
      }
    } catch (error) {
      console.error("Error completing review:", error)
    } finally {
      setIsCompletingReview(false)
    }
  }

  const submitReview = () => {
    setIsSubmitting(true)

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    submitChartAuditorApiCall()

    if (selectedDocumentId) {
      dispatch(resetFormData(selectedDocumentId))
    }

    setShowSidebar(false)
    setIsSubmitting(false)

    if (onReviewComplete) {
      onReviewComplete()
    }
  }

  // Create a default empty form data object if currentFormData is null
  const formData = currentFormData || {
    codesMissed: [],
    codesCorrected: [],
    auditRemarks: "",
    rating: 0,
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Enhanced Fullscreen Toggle */}
      <div className="flex-1 relative flex flex-col md:flex-row">
        {/* PDF Viewer Section */}
        <motion.div
          className={`${userType === "Auditor" && showSidebar ? "w-full md:w-full" : "w-full"
            } h-full bg-white relative transition-all duration-300 shadow-sm`}
          layout
        >
          <div
            className={`h-full overflow-auto ${userType === "Auditor" ? "max-h-[89.2vh]" : "max-h-[94.2vh]"
              } rounded-lg`}
          >
            {pdfLoading && selectedDocument.status === "In Review" ? (
              <motion.div
                className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Loader2 className="h-12 w-12 text-blue-600" />
                </motion.div>
                <motion.span
                  className="ml-2 text-lg font-medium text-gray-700 mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Loading PDF...
                </motion.span>
              </motion.div>
            ) : (
              <PreventSaveProvider>
                {(pdfUrl as string)?.length > 0 ? (
                  <PdfUI url={pdfUrl as string} />
                ) : (
                  <div className="h-full w-full flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <motion.div
                      className="text-center space-y-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No Document Available</p>
                    </motion.div>
                  </div>
                )}
              </PreventSaveProvider>
            )}
          </div>

          {/* Enhanced Start Review Overlay */}
          <AnimatePresence>
            {!showControls && selectedDocument.status !== "completed" && (
              <motion.div
                key="reviewOverlay"
                className="absolute inset-0 backdrop-blur-md bg-gradient-to-br from-black/20 to-black/40 flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <motion.div
                  className="text-center space-y-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.div
                    whileHover={{ scale: isStartingReview ? 1 : 1.1 }}
                    whileTap={{ scale: isStartingReview ? 1 : 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="rounded-full w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl border-4 border-white/20"
                      onClick={() => {
                        if (userType === "Auditor") {
                          setShowSidebar(true)
                          if (selectedDocument.status === "on_hold") {
                            handleResume()
                          } else {
                            handleStart()
                          }
                        } else {
                          if (selectedDocument.status === "on_hold") {
                            handleResume()
                          } else {
                            handleStart()
                          }
                        }
                      }}
                      disabled={isStartingReview}
                    >
                      <motion.div
                        className="flex items-center justify-center"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: isStartingReview ? 1 : 1.2 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {isStartingReview ? (
                          <Loader2 className="text-white animate-spin h-8 w-8" />
                        ) : (
                          <Play className="text-white h-8 w-8 ml-1" />
                        )}
                      </motion.div>
                    </Button>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-white font-semibold text-xl">
                      {isStartingReview
                        ? "Starting Review..."
                        : selectedDocument.status === "on_hold"
                          ? "Resume Review"
                          : "Start Review"}
                    </p>
                    <p className="text-white/80 text-sm">
                      {selectedDocument.status === "on_hold"
                        ? "Continue where you left off"
                        : "Begin analyzing this document"}
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Right-side Review Panel */}
        <AnimatePresence mode="wait">
          {isSidebar &&
            (userType !== "Auditor" ? (
              <AuditorReviewForm
                selectedDocumentId={selectedDocumentId}
                formData={formData}
                formErrors={formErrors}
                isSubmitting={isSubmitting}
                isCompletingReview={isCompletingReview}
                onSubmit={submitReview}
              />
            ) : (
              <ImprovedCodeReviewForm
                selectedDocumentId={selectedDocumentId}
                currentCodeReview={currentCodeReview}
                selectedDocument={selectedDocument}
                showSidebar={showSidebar}
                isCompletingReview={isCompletingReview}
                onComplete={handleComplete}
              />
            ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
