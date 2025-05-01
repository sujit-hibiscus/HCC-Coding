"use client";

import DocumentList from "@/components/document-management/document-list";
import PdfViewer from "./pdf-viewer";

export default function DocumentReviewSystem() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-[30rem] h-full overflow-hidden border-r">
          <DocumentList />
        </div>
        <div className="w-full md:w-full h-full overflow-hidden">
          <PdfViewer />
        </div>
      </div>
    </div>
  );
}
