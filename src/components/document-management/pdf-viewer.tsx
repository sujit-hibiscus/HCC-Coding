"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRedux } from "@/hooks/use-redux"
import { SubmissionFormSchema } from "@/lib/schemas"
import type { RootState } from "@/store"
import {
  completeReviewAuditorWithAPI,
  completeReviewWithAPI,
  fetchDocuments,
  resetFormData,
  resumeReview,
  startReviewAuditorWithApi,
  startReviewWithApi,
  updateElapsedTime,
  updateFormData,
  removeCartItem,
  removeStaticCartItem,
} from "@/store/slices/documentManagementSlice"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Play, Trash2 } from "lucide-react"
import PdfUI from "../ui/pdfUI"
import { PreventSaveProvider } from "../layout/prevent-save-provider"
import CodeCartForm from "./code-cart-form"
import AuditorReviewForm from "./auditor-review-form"

export default function PdfViewer({
  onReviewComplete,
  toggleFullScreen,
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
    staticCartItems,
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

  const [formErrors, setFormErrors] = useState<{
    codesMissed?: string[]
    codesCorrected?: string[]
    auditRemarks?: string
    rating?: string
  }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStartingReview, setIsStartingReview] = useState(false)
  const [isCompletingReview, setIsCompletingReview] = useState(false)

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    index: number
    type: "static" | "dynamic"
  } | null>(null)

  const currentCodeCart =
    selectedDocumentId && currentFormData?.codeCart
      ? currentFormData.codeCart
      : {
        items: [],
        notes: "",
        searchTerm: "",
      }

  // Filter static items based on search term
  const filteredStaticItems = staticCartItems.filter(
    (item) =>
      item.code.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()),
  )

  // Filter dynamic items based on search term
  const filteredDynamicItems = currentCodeCart.items.filter(
    (item) =>
      item.code.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()),
  )

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
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-xl font-medium">
          {!(documents?.length > 0) ? "No Document available!" : "Select a document to review"}
        </p>
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
      // Include cart data in the API call
      const resultAction = await dispatch(
        completeReviewWithAPI({
          ...selectedDocument,
          // This would be sent to the API if needed
          cartData: currentCodeCart,
        }),
      )
      if (completeReviewWithAPI.fulfilled.match(resultAction)) {
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

  const handleRemoveCartItem = (index: number) => {
    if (selectedDocumentId) {
      dispatch(removeCartItem({ documentId: selectedDocumentId, index }))
    }
  }

  const handleRemoveStaticItem = (index: number) => {
    if (selectedDocumentId) {
      dispatch(removeStaticCartItem({ documentId: selectedDocumentId, index }))
    }
  }

  return (
    <div className="h-full flex flex-col">
      {toggleFullScreen && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 border shadow-sm"
            onClick={toggleFullScreen}
          ></Button>
        </div>
      )}
      <div className="flex-1 relative flex flex-col md:flex-row">
        <div
          className={`${userType === "Auditor" && showSidebar ? "w-full md:w-full" : "w-full"
            } h-full bg-gray-100 relative transition-all duration-300`}
        >
          <div
            className={`h-full overflow-auto ${userType === "Auditor" ? "max-h-[89.2vh]" : "max-h-[94.2vh] bg-red"}`}
          >
            {pdfLoading && selectedDocument.status === "In Review" ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span className="ml-2 text-lg font-medium">Loading PDF...</span>
              </div>
            ) : (
              <PreventSaveProvider>
                {(pdfUrl as string)?.length > 0 ? (
                  <PdfUI url={pdfUrl as string} />
                ) : (
                  <div className="h-full w-full flex justify-center items-center">{"No Document available"}</div>
                )}
              </PreventSaveProvider>
            )}
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
                <motion.div whileHover={{ scale: isStartingReview ? 1 : 1.1 }}>
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 mb-4 group"
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
                        <Loader2
                          className="text-white animate-spin"
                          style={{
                            height: "2rem",
                            width: "2rem",
                          }}
                        />
                      ) : (
                        <Play
                          className="text-white transition-all duration-300 ease-in-out"
                          style={{
                            height: "2rem",
                            width: "2rem",
                          }}
                        />
                      )}
                    </motion.div>
                  </Button>
                </motion.div>
                <p className="text-white font-medium">
                  {isStartingReview
                    ? "Starting..."
                    : selectedDocument.status === "on_hold"
                      ? "Resume Review"
                      : "Start Review"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right-side Review Panel */}
        <AnimatePresence>
          {isSidebar && (userType !== "Auditor" ? (
            <>
              <AuditorReviewForm
                selectedDocumentId={selectedDocumentId}
                formData={formData}
                formErrors={formErrors}
                isSubmitting={isSubmitting}
                isCompletingReview={isCompletingReview}
                onSubmit={submitReview}
              />

            </>
          ) : <>
            <CodeCartForm
              selectedDocumentId={selectedDocumentId}
              currentCodeCart={currentCodeCart}
              staticCartItems={staticCartItems}
              selectedDocument={selectedDocument}
              showSidebar={showSidebar}
              isCompletingReview={isCompletingReview}
              onComplete={handleComplete}
              onRemoveCartItem={handleRemoveCartItem}
              onRemoveStaticItem={handleRemoveStaticItem}
              deleteConfirmation={deleteConfirmation}
              setDeleteConfirmation={setDeleteConfirmation}
            />
          </>)}

        </AnimatePresence>
      </div>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation?.isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmation(null)}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Confirm Delete</h4>
                </div>

                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this item? This action cannot be undone.
                </p>

                <div className="flex justify-end space-x-3 pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" size="sm" onClick={() => setDeleteConfirmation(null)} className="px-4">
                      Cancel
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (deleteConfirmation.type === "static") {
                          handleRemoveStaticItem(deleteConfirmation.index)
                        } else {
                          handleRemoveCartItem(deleteConfirmation.index)
                        }
                        setDeleteConfirmation(null)
                      }}
                      className="px-4"
                    >
                      Delete
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
