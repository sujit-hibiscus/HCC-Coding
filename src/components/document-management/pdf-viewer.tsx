"use client";

import { Button } from "@/components/ui/button";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Label } from "@/components/ui/label";
import { Rating } from "@/components/ui/rating";
import { Textarea } from "@/components/ui/textarea";
import { useRedux } from "@/hooks/use-redux";
import { SubmissionFormSchema, type SubmissionFormData } from "@/lib/schemas";
import type { RootState } from "@/store";
import {
  completeReview,
  resumeReview,
  startReview,
  startTimer,
  stopTimer,
  updateElapsedTime,
} from "@/store/slices/documentManagementSlice";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PdfUI from "../ui/pdfUI";
import { PreventSaveProvider } from "../layout/prevent-save-provider";

export default function PdfViewer() {
  const { dispatch, selector } = useRedux();
  const { documents, selectedDocumentId, isRunning } = useSelector((state: RootState) => state.documentManagement);
  const { userType } = selector((state) => state.user);

  const selectedDocument = documents.find((doc) => doc.id === selectedDocumentId);

  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  console.info("🚀 ~ PdfViewer ~ currentTime:", currentTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [formData, setFormData] = useState<SubmissionFormData>({
    codesMissed: [],
    codesCorrected: [],
    auditRemarks: "",
    rating: 0,
  });

  const [formErrors, setFormErrors] = useState<{
    codesMissed?: string[]
    codesCorrected?: string[]
    auditRemarks?: string
    rating?: string
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <p className="text-muted-foreground text-xl font-medium">Select a document to review</p>
      </div>
    );
  }

  const handleStart = () => {
    dispatch(startReview(selectedDocument.id));
    dispatch(startTimer());
    setShowControls(true);
  };

  const handleResume = () => {
    dispatch(resumeReview(selectedDocument.id));
    dispatch(startTimer());
    setShowControls(true);
  };

  const handleComplete = () => {
    if (userType === "Auditor") {
      setShowSidebar(true);

      dispatch(stopTimer());
    } else {
      dispatch(completeReview(selectedDocument.id));
      dispatch(stopTimer());
      setShowControls(false);
    }
  };

  const validateForm = () => {
    const result = SubmissionFormSchema.safeParse(formData);

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

  const submitReview = () => {
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    dispatch(completeReview(selectedDocument.id));
    dispatch(stopTimer());
    setShowControls(false);

    setFormData({
      codesMissed: [],
      codesCorrected: [],
      auditRemarks: "",
      rating: 0,
    });

    setShowSidebar(false);
    setIsSubmitting(false);

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
  };

  /* const handleCancel = () => {
    setShowSidebar(false);

    // Resume the timer if document is still in progress
    if (selectedDocument.status === "in_progress") {
      dispatch(startTimer());
    }

    // Reset form data and errors
    setFormData({
      codesMissed: [],
      codesCorrected: [],
      auditRemarks: "",
      rating: 0,
    });
    setFormErrors({});
  }; */

  const pdfUrl = selectedDocument.url || "/pdf/medical_report_user_1.pdf";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative flex flex-col md:flex-row">
        {/* PDF Viewer */}
        <div
          className={`${userType === "Auditor" && showSidebar ? "w-full md:w-full" : "w-full"
            } h-full bg-gray-100 relative transition-all duration-300`}
        >
          <div className={`h-full  overflow-auto ${userType === "Auditor" ? "" : "max-h-[89.2vh]"}`}>
            <PreventSaveProvider>
              <PdfUI url={pdfUrl} />
            </PreventSaveProvider>
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
                    onClick={() => {
                      if (userType === "Auditor") {

                        setShowSidebar(true);
                        dispatch(stopTimer());
                        if (selectedDocument.status === "on_hold") {
                          handleResume();
                        } else {
                          handleStart();
                        };
                      } else {
                        if (selectedDocument.status === "on_hold") {
                          handleResume();
                        } else {
                          handleStart();
                        };
                      }
                    }}
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

        {/* Right-side Review Panel for Auditors */}
        <AnimatePresence>
          {userType === "Auditor" && showSidebar && (
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
                      onChange={(newValue) =>
                        setFormData((prev) => ({ ...prev, codesMissed: newValue as { value: string; label: string }[] }))
                      }
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
                      onChange={(newValue) =>
                        setFormData((prev) => ({
                          ...prev,
                          codesCorrected: newValue as { value: string; label: string }[],
                        }))
                      }
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, auditRemarks: e.target.value }))}
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
                      value={formData.rating || 0}
                      onChange={(value) => setFormData((prev) => ({ ...prev, rating: value }))}
                      allowHalf={true}
                    />
                    {formErrors.rating && <p className="text-xs text-red-500 mt-1">{formErrors.rating}</p>}
                  </div>

                </div>
                <div className="flex justify-end gap-3">
                  {/*   <Button variant="outline" onClick={handleCancel} type="button">
                    Cancel
                  </Button> */}
                  <Button onClick={submitReview} disabled={isSubmitting} type="submit">
                    <CheckCircle className="mr-1" />
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showControls && userType !== "Auditor" && <div className="p-1.5 pr-3 border-t">
        <div className="flex justify-end gap-2">
          {selectedDocument.status !== "completed" && !showSidebar && (
            <Button onClick={handleComplete}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit
            </Button>
          )}
        </div>
      </div>}
    </div>
  );
}
