"use client";

import { useState, useEffect } from "react";
import DocumentList from "@/components/document-management/document-list";
import PdfViewer from "./pdf-viewer";
import { useRedux } from "@/hooks/use-redux";
import { startReviewWithApiData } from "@/store/slices/documentManagementSlice";

export default function DocumentReviewSystem() {
  const { selector, dispatch } = useRedux();
  const { selectedDocumentId, documents } = selector((state) => state.documentManagement);
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);

  const { userType } = selector((state) => state.user)
  const selectedDocument = documents?.find((doc: { id: any; }) => doc.id === selectedDocumentId);


  useEffect(() => {
    if (selectedDocument?.status === "In Review") {
      setIsFullScreenMode(true);

      const hasNonPending = documents.some(item => item.status !== "pending");
      if (hasNonPending) {
        dispatch(startReviewWithApiData({ id: selectedDocument.id, type: userType === "Auditor" ? "Auditor" : "Analyst" }))
      }
    } else {
      setIsFullScreenMode(false);
    }
  }, [selectedDocument]);

  // Function to toggle full-screen mode
  const toggleFullScreen = () => {
    setIsFullScreenMode((prev) => !prev);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        <div
          className={`${isFullScreenMode ? "hidden md:hidden" : "w-full md:w-[30rem]"
            } h-full overflow-hidden border-r transition-all duration-300`}
        >
          <DocumentList />
        </div>
        <div
          className={`${isFullScreenMode ? "w-full" : "w-full md:w-full"
            } h-full overflow-hidden transition-all duration-300`}
        >
          <PdfViewer
            onReviewComplete={() => setIsFullScreenMode(false)}
            isFullScreenMode={isFullScreenMode}
            toggleFullScreen={toggleFullScreen}
          />
        </div>
      </div>
    </div>
  );
}
