"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRedux } from "@/hooks/use-redux";
import { SubmissionFormSchema } from "@/lib/schemas";
import type { RootState } from "@/store";
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
  updateCodeCart,
  removeCartItem,
  removeStaticCartItem,
} from "@/store/slices/documentManagementSlice";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, Play, Trash2 } from "lucide-react";
import PdfUI from "../ui/pdfUI";
import { PreventSaveProvider } from "../layout/prevent-save-provider";

export default function PdfViewer({
  onReviewComplete,
  toggleFullScreen,
}: {
  onReviewComplete?: () => void
  isFullScreenMode?: boolean
  toggleFullScreen?: () => void
}) {
  const { dispatch, selector } = useRedux();
  const {
    documents,
    selectedDocumentId,
    isRunning,
    pdfUrl = "",
    pdfLoading,
    formData: allFormData,
    staticCartItems,
  } = selector((state: RootState) => state.documentManagement);
  const { userType } = selector((state) => state.user);

  const selectedDocument = documents
    ?.filter((item: { status: string }) => item?.status !== "completed")
    .find((doc: { id: string }) => doc.id === selectedDocumentId);

  const isSidebar = selectedDocument?.status === "In Review";

  const [showControls, setShowControls] = useState(false);
  const [, setCurrentTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [showSidebar, setShowSidebar] = useState(false);

  // Get form data for the selected document from Redux store
  const currentFormData = selectedDocumentId ? allFormData[selectedDocumentId] : null;

  const [formErrors, setFormErrors] = useState<{
    codesMissed?: string[]
    codesCorrected?: string[]
    auditRemarks?: string
    rating?: string
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingReview, setIsStartingReview] = useState(false);
  const [isCompletingReview, setIsCompletingReview] = useState(false);

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    index: number
    type: "static" | "dynamic"
  } | null>(null);

  const currentCodeCart =
    selectedDocumentId && currentFormData?.codeCart
      ? currentFormData.codeCart
      : {
        items: [],
        notes: "",
        searchTerm: "",
      };

  // Filter static items based on search term
  const filteredStaticItems = staticCartItems.filter(
    (item) =>
      item.code.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()),
  );

  // Filter dynamic items based on search term
  const filteredDynamicItems = currentCodeCart.items.filter(
    (item) =>
      item.code.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (selectedDocument) {
      setShowControls(selectedDocument.status === "In Review");

      if (selectedDocument.startTime && selectedDocument.status === "In Review") {
        const elapsed = Math.floor((Date.now() - selectedDocument.startTime) / 1000) + (selectedDocument.timeSpent || 0);
        setCurrentTime(elapsed);
      } else if (selectedDocument.timeSpent) {
        setCurrentTime(selectedDocument.timeSpent);
      } else {
        setCurrentTime(0);
      }
    }
  }, [selectedDocumentId, selectedDocument]);

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
      );
    }
  }, [selectedDocumentId, allFormData, dispatch, userType]);

  useEffect(() => {
    if (isRunning && selectedDocument?.status === "In Review" && !showSidebar) {
      timerRef.current = setInterval(() => {
        if (selectedDocument.startTime) {
          const elapsed =
            Math.floor((Date.now() - selectedDocument.startTime) / 1000) + (selectedDocument.timeSpent || 0);
          setCurrentTime(elapsed);
          dispatch(updateElapsedTime());
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, selectedDocument, dispatch, showSidebar]);

  useEffect(() => {
    if (showSidebar && isRunning) {
      // Pause the timer when sidebar opens
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (!showSidebar && selectedDocument?.status === "In Review") {
      // Resume the timer when sidebar closes if document is still in progress
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          if (selectedDocument.startTime) {
            const elapsed =
              Math.floor((Date.now() - selectedDocument.startTime) / 1000) + (selectedDocument.timeSpent || 0);
            setCurrentTime(elapsed);
            dispatch(updateElapsedTime());
          }
        }, 1000);
      }
    }
  }, [showSidebar, isRunning, selectedDocument, dispatch]);

  if (!selectedDocument) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-xl font-medium">
          {!(documents?.length > 0) ? "No Document available!" : "Select a document to review"}
        </p>
      </div>
    );
  }

  const handleStart = async () => {
    setIsStartingReview(true);
    if (userType === "Auditor") {
      try {
        const resultAction = await dispatch(startReviewAuditorWithApi(selectedDocument));
        if (startReviewAuditorWithApi.fulfilled.match(resultAction)) {
          dispatch(fetchDocuments());
          setShowControls(true);
        }
      } catch (error) {
        console.error("Error starting review:", error);
      } finally {
        setIsStartingReview(false);
      }
    } else {
      try {
        const resultAction = await dispatch(startReviewWithApi(selectedDocument));
        if (startReviewWithApi.fulfilled.match(resultAction)) {
          dispatch(fetchDocuments());
          setShowControls(true);
        }
      } catch (error) {
        console.error("Error starting review:", error);
      } finally {
        setIsStartingReview(false);
      }
    }
  };

  const handleResume = () => {
    setIsStartingReview(true);
    try {
      dispatch(resumeReview(selectedDocument.id));
      setShowControls(true);
    } catch (error) {
      console.error("Error resuming review:", error);
    } finally {
      setIsStartingReview(false);
    }
  };

  const handleComplete = () => {
    if (userType === "Auditor") {
      setShowSidebar(true);
    } else {
      setIsCompletingReview(true);
      submitChartApiCall();
    }
    if (onReviewComplete) {
      onReviewComplete();
    }
  };

  const validateForm = () => {
    if (!currentFormData) return false;

    const result = SubmissionFormSchema.safeParse(currentFormData);

    if (!result.success) {
      const formattedErrors = result.error.format();
      setFormErrors({
        codesMissed: formattedErrors.codesMissed?._errors,
        codesCorrected: formattedErrors.codesCorrected?._errors,
        auditRemarks: formattedErrors.auditRemarks?._errors?.[0],
        rating: formattedErrors.rating?._errors?.[0],
      });
      return false;
    }

    setFormErrors({});
    return true;
  };

  const submitChartApiCall = async () => {
    setIsCompletingReview(true);
    try {
      // Include cart data in the API call
      const resultAction = await dispatch(
        completeReviewWithAPI({
          ...selectedDocument,
          // This would be sent to the API if needed
          cartData: currentCodeCart,
        }),
      );
      if (completeReviewWithAPI.fulfilled.match(resultAction)) {
        dispatch(fetchDocuments());
        setShowControls(false);
        if (onReviewComplete) {
          onReviewComplete();
        }
      }
    } catch (error) {
      console.error("Error completing review:", error);
    } finally {
      setIsCompletingReview(false);
    }
  };

  const submitChartAuditorApiCall = async () => {
    setIsCompletingReview(true);

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
    };
    try {
      const resultAction = await dispatch(completeReviewAuditorWithAPI({ doc: selectedDocument, body: bodyData }));
      if (completeReviewAuditorWithAPI.fulfilled.match(resultAction)) {
        dispatch(fetchDocuments());
        setShowControls(false);
        if (onReviewComplete) {
          onReviewComplete();
        }
      }
    } catch (error) {
      console.error("Error completing review:", error);
    } finally {
      setIsCompletingReview(false);
    }
  };

  const submitReview = () => {
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    submitChartAuditorApiCall();

    if (selectedDocumentId) {
      dispatch(resetFormData(selectedDocumentId));
    }

    setShowSidebar(false);
    setIsSubmitting(false);

    if (onReviewComplete) {
      onReviewComplete();
    }
  };

  // Create a default empty form data object if currentFormData is null
  const formData = currentFormData || {
    codesMissed: [],
    codesCorrected: [],
    auditRemarks: "",
    rating: 0,
  };

  const handleRemoveCartItem = (index: number) => {
    if (selectedDocumentId) {
      dispatch(removeCartItem({ documentId: selectedDocumentId, index }));
    }
  };

  const handleRemoveStaticItem = (index: number) => {
    if (selectedDocumentId) {
      dispatch(removeStaticCartItem({ documentId: selectedDocumentId, index }));
    }
  };

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
                        setShowSidebar(true);
                        if (selectedDocument.status === "on_hold") {
                          handleResume();
                        } else {
                          handleStart();
                        }
                      } else {
                        if (selectedDocument.status === "on_hold") {
                          handleResume();
                        } else {
                          handleStart();
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

        {/* Right-side Review Panel for Auditors */}
        <AnimatePresence>
          {isSidebar &&
            (userType !== "Auditor" ? (
              <motion.div
                className="w-full flex flex-col md:w-[32rem] h-full border-t md:border-t-0 md:border-l overflow-y-auto bg-white p-2"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                  velocity: 2,
                }}
              >
                <h3 className="text-lg font-semibold mb-4">Audit Review</h3>

                <div className="flex flex-col justify-between h-full">
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="codes-missed">Codes Missed</Label>
                      <CreatableSelect
                        id="codes-missed"
                        isMulti
                        placeholder="Add codes that were missed..."
                        value={formData.codesMissed}
                        onChange={(newValue) => {
                          if (selectedDocumentId) {
                            dispatch(
                              updateFormData({
                                documentId: selectedDocumentId,
                                data: { codesMissed: newValue as { value: string; label: string }[] },
                              }),
                            );
                          }
                        }}
                      />
                      {formErrors.codesMissed && !(formData.codesMissed?.length > 0) && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.codesMissed}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="codes-corrected">Codes Corrected</Label>
                      <CreatableSelect
                        id="codes-corrected"
                        isMulti
                        placeholder="Add codes that were corrected..."
                        value={formData.codesCorrected}
                        onChange={(newValue) => {
                          if (selectedDocumentId) {
                            dispatch(
                              updateFormData({
                                documentId: selectedDocumentId,
                                data: { codesCorrected: newValue as { value: string; label: string }[] },
                              }),
                            );
                          }
                        }}
                      />
                      {formErrors.codesCorrected && !(formData.codesCorrected?.length > 0) && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.codesCorrected}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="audit-remarks">Audit Remarks</Label>

                      <Textarea
                        id="audit-remarks"
                        placeholder="Enter your audit remarks here..."
                        value={formData.auditRemarks}
                        onChange={(e) => {
                          if (selectedDocumentId) {
                            dispatch(
                              updateFormData({
                                documentId: selectedDocumentId,
                                data: { auditRemarks: e.target.value },
                              }),
                            );
                          }
                        }}
                        rows={4}
                      />
                      {formErrors.auditRemarks && !(formData.auditRemarks?.length >= 10) && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.auditRemarks}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="rating" className="text-base">
                        Quality Rating (Required)
                      </Label>
                      <div className="flex items-center">
                        <Input
                          id="rating"
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={formData.rating || 0}
                          onChange={(e) => {
                            if (selectedDocumentId) {
                              const value = Number.parseFloat(e.target.value);
                              dispatch(
                                updateFormData({
                                  documentId: selectedDocumentId,
                                  data: { rating: value },
                                }),
                              );
                            }
                          }}
                          className="w-24"
                        />
                      </div>
                      {formErrors.rating && <p className="text-xs text-red-500 mt-1">{formErrors.rating}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button onClick={submitReview} disabled={isSubmitting || isCompletingReview} type="submit">
                      {isSubmitting || isCompletingReview ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      {isSubmitting || isCompletingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="w-full flex flex-col md:w-[32rem] h-full border-t md:border-t-0 md:border-l overflow-y-auto bg-white p-2"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                  velocity: 2,
                }}
              >
                <h3 className="text-lg font-semibold mb-4">Code cart</h3>

                <div className="flex flex-col justify-between h-full">
                  {/* Here create design as per image */}
                  <div className="flex flex-col h-full">
                    {/* Search Input */}
                    <div className="mb-3">
                      <Input
                        placeholder="Search DX code"
                        value={currentCodeCart.searchTerm}
                        onChange={(e) => {
                          if (selectedDocumentId) {
                            dispatch(
                              updateCodeCart({
                                documentId: selectedDocumentId,
                                cartData: { searchTerm: e.target.value },
                              }),
                            );
                          }
                        }}
                        className="text-sm"
                      />
                    </div>

                    {/* Table */}
                    <div className="flex-1 border border-gray-300 rounded mb-3">
                      <div className="bg-selectedText text-white text-sm font-medium">
                        <div className="grid grid-cols-12 gap-2 p-2">
                          <div className="col-span-4">ICD-CMS-10</div>
                          <div className="col-span-7">Description</div>
                          <div className="col-span-1"></div>
                        </div>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">
                        {/* Show filtered static items first */}
                        {filteredStaticItems.map((item, index) => (
                          <div
                            key={`static-${index}`}
                            className="grid grid-cols-12 gap-2 p-2 border-b border-gray-200 text-sm"
                          >
                            <div className="col-span-4 font-medium">{item.code}</div>
                            <div className="col-span-7">{item.description}</div>
                            <div className="col-span-1">
                              <button
                                onClick={() => setDeleteConfirmation({ isOpen: true, index, type: "static" })}
                                className="text-red-500 hover:text-red-700"
                                aria-label="Delete item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {/* Then show filtered dynamic items from the cart */}
                        {filteredDynamicItems.map((item, index) => (
                          <div
                            key={`dynamic-${index}`}
                            className="grid grid-cols-12 gap-2 p-2 border-b border-gray-200 text-sm"
                          >
                            <div className="col-span-4 font-medium">{item.code}</div>
                            <div className="col-span-7">{item.description}</div>
                            <div className="col-span-1">
                              <button
                                onClick={() => setDeleteConfirmation({ isOpen: true, index, type: "dynamic" })}
                                className="text-red-500 hover:text-red-700"
                                aria-label="Delete item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Show message when no items match the filter */}
                        {filteredStaticItems.length === 0 &&
                          filteredDynamicItems.length === 0 &&
                          currentCodeCart.searchTerm && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <div className="text-gray-400 mb-2">
                                <svg
                                  className="w-12 h-12 mx-auto"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                  />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-500 font-medium">No items found</p>
                            </div>
                          )}

                        {/* Show message when there are no items at all */}
                        {filteredStaticItems.length === 0 &&
                          filteredDynamicItems.length === 0 &&
                          !currentCodeCart.searchTerm && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <div className="text-gray-400 mb-2">
                                <svg
                                  className="w-12 h-12 mx-auto"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-500 font-medium">No items in cart</p>
                              <p className="text-xs text-gray-400 mt-1">Add some codes to get started</p>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Notes</Label>
                      <Textarea
                        placeholder="Enter notes..."
                        value={currentCodeCart.notes}
                        onChange={(e) => {
                          if (selectedDocumentId) {
                            dispatch(
                              updateCodeCart({
                                documentId: selectedDocumentId,
                                cartData: { notes: e.target.value },
                              }),
                            );
                          }
                        }}
                        rows={4}
                        className="text-sm max-h-[100px]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    {selectedDocument.status !== "completed" && !showSidebar && (
                      <Button onClick={handleComplete} disabled={isCompletingReview} className="text-white">
                        {isCompletingReview ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {isCompletingReview ? "Submitting..." : "Submit"}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
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
                          handleRemoveStaticItem(deleteConfirmation.index);
                        } else {
                          handleRemoveCartItem(deleteConfirmation.index);
                        }
                        setDeleteConfirmation(null);
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
  );
}
