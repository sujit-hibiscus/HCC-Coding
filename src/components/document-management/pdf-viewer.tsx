"use client";

import { Button } from "@/components/ui/button";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Label } from "@/components/ui/label";
import { Rating } from "@/components/ui/rating";
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
} from "@/store/slices/documentManagementSlice";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader2, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import PdfUI from "../ui/pdfUI";
import { PreventSaveProvider } from "../layout/prevent-save-provider";

export default function PdfViewer() {
  const { dispatch, selector } = useRedux();
  const {
    documents,
    selectedDocumentId,
    isRunning,
    pdfUrl,
    pdfLoading,
    formData: allFormData,
  } = selector((state: RootState) => state.documentManagement);
  const { userType } = selector((state) => state.user);

  const selectedDocument = documents
    ?.filter((item: { status: string; }) => item?.status !== "completed")
    .find((doc: { id: string; }) => doc.id === selectedDocumentId);

  console.log("🚀 ~ PdfViewer ~ pdfUrl:", selectedDocument?.status);
  const isSidebar = selectedDocument?.status === "in_progress";

  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  console.info("🚀 ~ PdfViewer ~ currentTime:", currentTime);
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

  useEffect(() => {
    if (selectedDocument) {
      setShowControls(selectedDocument.status === "in_progress");

      if (selectedDocument.startTime && selectedDocument.status === "in_progress") {
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
    if (isRunning && selectedDocument?.status === "in_progress" && !showSidebar) {
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
    } else if (!showSidebar && selectedDocument?.status === "in_progress") {
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
      const resultAction = await dispatch(completeReviewWithAPI(selectedDocument));
      if (completeReviewWithAPI.fulfilled.match(resultAction)) {
        dispatch(fetchDocuments());
        setShowControls(false);
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
      codes_corrected: formData.codesCorrected?.map(item => item.value) || [],
      codes_missed: formData.codesMissed?.map(item => item.value) || [],
      rating: formData.rating || "0",
      audit_remarks: formData.auditRemarks || ""
    } as {
      codes_corrected: string[];
      codes_missed: string[];
      rating: number | string;
      audit_remarks: string;
    };
    try {
      const resultAction = await dispatch(completeReviewAuditorWithAPI({ doc: selectedDocument, body: bodyData }));
      if (completeReviewAuditorWithAPI.fulfilled.match(resultAction)) {
        dispatch(fetchDocuments());
        setShowControls(false);
      }
    } catch (error) {
      console.error("Error completing review:", error);
    } finally {
      setIsCompletingReview(false);
    }
  };

  const submitReview = () => {
    console.log(formData, "daxfk");

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
  };

  // Create a default empty form data object if currentFormData is null
  const formData = currentFormData || {
    codesMissed: [],
    codesCorrected: [],
    auditRemarks: "",
    rating: 0,
  };

  console.log("Current form data for document:", selectedDocumentId, formData);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative flex flex-col md:flex-row">
        <div
          className={`${userType === "Auditor" && showSidebar ? "w-full md:w-full" : "w-full"
            } h-full bg-gray-100 relative transition-all duration-300`}
        >
          <div className={`h-full overflow-auto ${userType === "Auditor" ? "max-h-[89.2vh]" : "max-h-[89.2vh]"}`}>
            {pdfLoading && selectedDocument.status === "in_progress" ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span className="ml-2 text-lg font-medium">Loading PDF...</span>
              </div>
            ) : (
              <>
                <PreventSaveProvider>
                  <PdfUI url={pdfUrl as string} />
                </PreventSaveProvider>
              </>
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
          {userType === "Auditor" && isSidebar && (
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
                    <Rating
                      key={`rating-${selectedDocumentId}`}
                      value={formData.rating || 0}
                      onChange={(value) => {
                        if (selectedDocumentId) {
                          console.log("Setting rating to:", value);
                          dispatch(
                            updateFormData({
                              documentId: selectedDocumentId,
                              data: { rating: value },
                            }),
                          );
                        }
                      }}
                      allowHalf={true}
                    />
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
          )}
        </AnimatePresence>
      </div>

      {showControls && userType !== "Auditor" && (
        <div className="p-1.5 pr-3 border-t">
          <div className="flex justify-end gap-2">
            {selectedDocument.status !== "completed" && !showSidebar && (
              <Button onClick={handleComplete} disabled={isCompletingReview}>
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
      )}
    </div>
  );
}
