"use client";

import TabsComponent from "@/components/common/CommonTab";
import { PreventSaveProvider } from "@/components/layout/prevent-save-provider";
import { Button } from "@/components/ui/button";
import PdfUI from "@/components/ui/pdfUI";
import { useRedux } from "@/hooks/use-redux";
import useToast from "@/hooks/use-toast";
import { postDataNoTimeout } from "@/lib/api/api-client";
import { SubmissionFormSchema } from "@/lib/schemas";
import {
  completeReviewAuditorWithAPI,
  completeReviewWithAPI,
  fetchDocuments,
  fetchPdfFile,
  fetchTextFile,
  resetCodeReview,
  resetFormData,
  resumeReview,
  setActiveDocTab,
  setRegenerating,
  startReviewAuditorWithApi,
  startReviewWithApi,
  startReviewWithApiData,
  updateElapsedTime,
  updateFormData,
} from "@/store/slices/documentManagementSlice";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Menu, Play, RotateCcw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import AuditorReviewForm from "./auditor-review-form";
import ImprovedCodeReviewForm from "./code-cart-form";
import DocumentList from "./document-list";
import PromptDisplay from "./prompt-display";

export default function PdfViewer({
  onReviewComplete,
}: {
  onReviewComplete?: () => void
  isFullScreenMode?: boolean
  toggleFullScreen?: () => void
}) {
  // Sheet open state
  const [open, setOpen] = useState(false);
  const { dispatch, selector } = useRedux();
  const { configuration } = selector((state) => state.dashboard);
  const isPromptVisible = configuration?.find((i) => i?.key === "show-analysis")?.value === "True";

  const {
    documents,
    selectedDocumentId,
    isRunning,
    pdfFileBase64 = "",
    pdfLoadingById,
    formData: allFormData,
    codeReview: allCodeReview,
    activeDocTab: currentTab = "document",
    textFileContent,
    textLoadingById,
    regeneratingById,
  } = selector((state) => state.documentManagement);
  const { userType } = selector((state) => state.user);
  const { success, error } = useToast();

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
    };

  const [formErrors, setFormErrors] = useState<{
    codesMissed?: string[]
    codesCorrected?: string[]
    auditRemarks?: string
    rating?: string
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingReview, setIsStartingReview] = useState(false);
  const [isCompletingReview, setIsCompletingReview] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const [displayPdfUrl, setDisplayPdfUrl] = useState<string | null>(null);

  // Per-document loading states
  const isRegenerating = selectedDocumentId ? regeneratingById[selectedDocumentId] : false;
  const isPdfLoading = selectedDocumentId ? pdfLoadingById[selectedDocumentId] : false;
  const isTextLoading = selectedDocumentId ? textLoadingById[selectedDocumentId] : false;


  // Add ref for PromptDisplay to access search function
  const promptDisplayRef = useRef<{ openSearch: () => void } | null>(null);

  const tabs = [
    { value: "document", label: "Document" },
    { value: "prompt", label: "Summary" },
  ];

  const handleTabChange = (tabId: string) => {
    dispatch(setActiveDocTab(tabId as "document" | "prompt"));
  };

  const handleSearchClick = () => {
    if (promptDisplayRef.current) {
      promptDisplayRef.current.openSearch();
    }
  };

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
            codesMissed: [{ label: "N18.6", value: "N18.6" }],
            codesCorrected: [
              { label: "N18.6", value: "N18.6" },
              { label: "Z99.2", value: "Z99.2" },
            ],
            auditRemarks:
              "Added N18.6 and Z99.2 as per documentation. Patient undergoing hemodialysis 3 times weekly for ESRD. Documentation confirms CKD stage 5 with dialysis dependency",
            rating: 90,
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

  useEffect(() => {
    if (pdfFileBase64) {
      const byteCharacters = atob(pdfFileBase64.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      setDisplayPdfUrl(url);

      return () => URL.revokeObjectURL(url);
    } else {
      setDisplayPdfUrl(null);
    }
  }, [pdfFileBase64]);

  if (!selectedDocument) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative">
        <div className="absolute top-0 left-2">
          <div className=" top-2 left-0 z-50 md:top-[47px] md:left-[3.2rem]">
            <Sheet open={open} onOpenChange={setOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button
                        variant="blue"
                        size="icon"
                        className="shadow-lg !rounded-none w-8 h-8 md:w-[35px] md:h-[35px] flex items-center justify-center"
                      >
                        <Menu className="w-8 h-8" />
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  {/*   <TooltipContent side="right" align="center">
                  Open Document List
                </TooltipContent> */}
                </Tooltip>
              </TooltipProvider>
            </Sheet>
          </div>
          {open && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetContent side="left" className="p-0 max-w-xs w-[22rem]">
                <VisuallyHidden>
                  <SheetTitle>Document List</SheetTitle>
                </VisuallyHidden>
                <div className="h-full flex flex-col">
                  <DocumentList
                    onClose={() => {
                      setOpen(false);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-100 rounded-full flex items-center justify-center">
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
            {!(documents?.length > 0) ? "" : "Choose from the document list to get started"}
          </p>
        </motion.div>
      </div>
    );
  }

  const handleStart = async () => {
    setIsStartingReview(true);
    setApiLoading(true);
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
        setApiLoading(false);
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
        setApiLoading(false);
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
      setApiLoading(true);
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
    setApiLoading(true);
    try {
      // Include code review data in the API call
      const resultAction = await dispatch(
        completeReviewWithAPI({
          ...selectedDocument,
          reviewData: currentCodeReview,
          bodyData: {
            mc_ids: currentCodeReview?.items?.filter((i) => i.status === "rejected")?.map((i) => +i.id),
            notes: currentCodeReview?.analystNotes,
          },
        }),
      );
      if (completeReviewWithAPI.fulfilled.match(resultAction)) {
        dispatch(fetchDocuments());
        setShowControls(false);
        if (selectedDocumentId) {
          dispatch(resetCodeReview(selectedDocumentId));
        }
        if (onReviewComplete) {
          onReviewComplete();
        }
      }
    } catch (error) {
      console.error("Error completing review:", error);
    } finally {
      setIsCompletingReview(false);
      setApiLoading(false);
    }
  };

  const submitChartAuditorApiCall = async () => {
    setIsCompletingReview(true);
    setApiLoading(true);

    const bodyData = {
      codes_corrected: formData.codesCorrected?.map((item) => item.value) || [],
      codes_missed: formData.codesMissed?.map((item) => item.value) || [],
      rating: formData.rating || "0",
      audit_remarks: formData.auditRemarks || "",
      mc_ids: currentCodeReview?.items?.filter((i) => i.status === "rejected")?.map((i) => +i.id),
      notes: currentCodeReview?.auditorNotes,
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
      setIsSubmitting(false);
      setIsCompletingReview(false);
      setApiLoading(false);
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

  const handleRegenerate = async () => {
    if (!selectedDocumentId) return;
    dispatch(setRegenerating({ docId: selectedDocumentId, value: true }));
    const bodyData = {
      chart_id: +selectedDocument.id,
    };
    try {
      const apiData = await postDataNoTimeout<{ status: "Success" | "Not Found" | "Error"; message: string }>(
        "regenerate_charts/",
        bodyData,
      );

      if (apiData?.data?.status === "Success") {
        dispatch(setRegenerating({ docId: selectedDocumentId, value: false }));
        dispatch(
          startReviewWithApiData({ id: selectedDocument.id, type: userType === "Auditor" ? "Auditor" : "Analyst" }),
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        selectedDocument.text_file_path &&
          selectedDocument.text_file_path?.length > 0 &&
          dispatch(fetchTextFile(selectedDocument.text_file_path));
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        selectedDocument.url && selectedDocument.url?.length > 0 && dispatch(fetchPdfFile(selectedDocument.url));
        success({ message: "Charts successfully regenerated" });
        // success({ message: apiData?.data.message });
      } else {
        dispatch(setRegenerating({ docId: selectedDocumentId, value: false }));
        error({ message: apiData?.data.message });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch(setRegenerating({ docId: selectedDocumentId, value: false }));
      error({ message: err?.message || "Something went wrong" });
    }
  };
  return (
    <PreventSaveProvider>
      <div
        className={`h-full flex flex-col bg-gray-50 overflow-hidden
      `}
      >
        {!showControls && selectedDocument.status !== "completed" && (
          <div className="absolute z-20 top-0 left-2">
            <div className=" top-2 left-0 z-50 md:top-[47px] md:left-[3.2rem]">
              <Sheet open={open} onOpenChange={setOpen}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SheetTrigger asChild>
                        <Button
                          variant="blue"
                          size="icon"
                          className="shadow-lg !rounded-none w-8 h-8 md:w-[35px] md:h-[35px] flex items-center justify-center"
                        >
                          <Menu className="w-8 h-8" />
                        </Button>
                      </SheetTrigger>
                    </TooltipTrigger>
                    {/*   <TooltipContent side="right" align="center">
                  Open Document List
                </TooltipContent> */}
                  </Tooltip>
                </TooltipProvider>
              </Sheet>
            </div>
            {open && (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="p-0 max-w-xs w-[22rem]">
                  <VisuallyHidden>
                    <SheetTitle>Document List</SheetTitle>
                  </VisuallyHidden>
                  <div className="h-full flex flex-col">
                    <DocumentList
                      onClose={() => {
                        setOpen(false);
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        )}
        {/* Enhanced Fullscreen Toggle */}
        <div className="flex-1 relative flex flex-col md:flex-row">
          <motion.div
            className={`${userType === "Auditor" && showSidebar ? "w-full md:w-full" : "w-full"} h-[calc(100vh-2.9rem)] bg-white relative transition-all duration-300 shadow-sm`}
            layout
          >
            <div className="flex h-full flex-col">
              {isPromptVisible ? (
                <>
                  {!showControls && selectedDocument.status !== "completed" && (
                    <div className="flex items-center py-2">
                      <Button
                        size="sm"
                        className="rounded-full h-12 w-16"
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
                        Start Review
                      </Button>
                    </div>
                  )}
                  <div className="border-b pb-1 ">
                    <div className="flex gap-1.5 h-full">
                      <div className="pl-1.5 h-full">
                        <Sheet open={open} onOpenChange={setOpen}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <SheetTrigger asChild>
                                  <Button
                                    variant="blue"
                                    size="icon"
                                    className="shadow-lg !rounded-none h-full md:w-[35px] md:h-[35px] flex items-center justify-center"
                                  >
                                    <Menu className="w-8 h-8" />
                                  </Button>
                                </SheetTrigger>
                              </TooltipTrigger>
                            </Tooltip>
                          </TooltipProvider>
                        </Sheet>
                      </div>
                      <div className="flex justify-between w-full">
                        <TabsComponent
                          countLoading={false}
                          tabs={tabs}
                          currentTab={currentTab}
                          handleTabChange={handleTabChange}
                        />
                        <div className="flex gap-1.5">
                          {currentTab === "prompt" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleSearchClick}
                              className="w-full max-w-[140px] flex gap-0 px-3 h-[35px] sm:w-auto !rounded-none"
                            >
                              <Search className="mr-2" />
                              Search
                            </Button>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleRegenerate}
                            className="w-full max-w-[140px] flex gap-0 px-3 h-[35px] sm:w-auto !rounded-none"
                            disabled={isRegenerating || isPdfLoading || isTextLoading}
                          >
                            {isRegenerating ? (
                              <Loader2 className="mr-2 animate-spin" />
                            ) : (
                              <RotateCcw className="mr-2" />
                            )}
                            {isRegenerating ? "Regenerating..." : "Regenerate"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {currentTab === "document" &&
                      (isPdfLoading && selectedDocument.status === "In Review" ? (
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
                        <>
                          <PreventSaveProvider>
                            {(displayPdfUrl as string)?.length > 0 ? (
                              <PdfUI url={displayPdfUrl as string} />
                            ) : (
                              <div className="h-full w-full flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <motion.div
                                  className="text-center space-y-4"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-8 h-8 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
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
                        </>
                      ))}
                    {currentTab === "prompt" && selectedDocument?.text_file_path && (
                      <div className="px-2 pt-2 bg-white h-full rounded-md">
                        {isTextLoading ? (
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
                              Loading text document...
                            </motion.span>
                          </motion.div>
                        ) : (
                          <PreventSaveProvider>
                            {textFileContent ? (
                              <PromptDisplay
                                ref={promptDisplayRef}
                                content={textFileContent || "No summery available."}
                              />
                            ) : (
                              <div className="h-full w-full flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100">
                                <motion.div
                                  className="text-center space-y-4"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                                    <svg
                                      className="w-8 h-8 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                                      />
                                    </svg>
                                  </div>
                                  <p className="text-gray-500 font-medium">No summery available.</p>
                                </motion.div>
                              </div>
                            )}
                          </PreventSaveProvider>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : isPdfLoading && selectedDocument.status === "In Review" ? (
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
                  {(displayPdfUrl as string)?.length > 0 ? (
                    <div className="h-full flex flex-col">
                      <div className="flex justify-between z-10 pb-1 gap-1.5">
                        <div className="pl-1.5 h-full">
                          <Sheet open={open} onOpenChange={setOpen}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <SheetTrigger asChild>
                                    <Button
                                      variant="blue"
                                      size="icon"
                                      className="shadow-lg !rounded-none h-full md:w-[35px] md:h-[35px] flex items-center justify-center"
                                    >
                                      <Menu className="w-8 h-8" />
                                    </Button>
                                  </SheetTrigger>
                                </TooltipTrigger>
                              </Tooltip>
                            </TooltipProvider>
                          </Sheet>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleRegenerate}
                          className="w-full max-w-[140px] flex gap-0 px-3 h-[35px] sm:w-auto !rounded-none"
                          disabled={isRegenerating || isPdfLoading || isTextLoading}
                        >
                          {isRegenerating ? <Loader2 className="mr-2 animate-spin" /> : <RotateCcw className="mr-2" />}
                          {isRegenerating ? "Regenerating..." : "Regenerate"}
                        </Button>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <PdfUI url={displayPdfUrl as string} />
                      </div>
                    </div>
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
                  className="absolute z-10 inset-0 backdrop-blur-md bg-gradient-to-br from-black/20 to-black/40 flex flex-col items-center justify-center"
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
                        size="sm"
                        className="rounded-full h-12 w-16"
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
                          className="flex items-center  h-full w-full p-2 justify-center"
                          initial={{ scale: 1 }}
                          whileHover={{ scale: isStartingReview ? 1 : 1.2 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          {isStartingReview ? (
                            <Loader2 className="text-white animate-spin h-[25px] w-[25px]" />
                          ) : (
                            <Play className="text-white h-[25px] w-[25px] ml-1" />
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
              (userType === "Auditor" ? (
                <AuditorReviewForm
                  selectedDocument={selectedDocument}
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
                  apiLoading={apiLoading}
                  onComplete={handleComplete}
                />
              ))}
          </AnimatePresence>
        </div>
        {open && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="p-0 max-w-xs w-[22rem]">
              <VisuallyHidden>
                <SheetTitle>Document List</SheetTitle>
              </VisuallyHidden>
              <div className="h-full flex flex-col">
                <DocumentList
                  onClose={() => {
                    setOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </PreventSaveProvider>
  );
}
