"use client";

import { useState, useEffect } from "react";
import DocumentList from "@/components/document-management/document-list";
import PdfViewer from "./pdf-viewer";
import { useRedux } from "@/hooks/use-redux";

export default function DocumentReviewSystem() {
  const { selector } = useRedux();
  const { selectedDocumentId, documents } = selector((state) => state.documentManagement);
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);

  const selectedDocument = documents?.find((doc) => doc.id === selectedDocumentId);

  // Set full-screen mode when a document is in review
  useEffect(() => {
    if (selectedDocument?.status === "in_progress") {
      setIsFullScreenMode(true);
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
