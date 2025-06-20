"use client";

import { useRedux } from "@/hooks/use-redux";
import { fetchPdfFile, fetchTextFile, selectDocument, startReviewWithApiData } from "@/store/slices/documentManagementSlice";
import { useEffect } from "react";
import PdfViewer from "./pdf-viewer";

export default function DocumentReviewSystem() {
  const { selector, dispatch } = useRedux();
  const { selectedDocumentId, fetchedPdfPaths, documents, codeReview: allCodeReview, } = selector((state) => state.documentManagement);
  console.log("🚀 ~ DocumentReviewSystem ~ documents:", documents, selectedDocumentId)
  const { userType } = selector((state) => state.user)
  const selectedDocument = documents?.find((doc: { id: any; }) => doc.id === selectedDocumentId);
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

  useEffect(() => {
    if (selectedDocument?.status === "In Review") {
      const hasNonPending = documents.some(item => item.status !== "pending");
      const hasNoDataAvailable = currentCodeReview?.items
      if (hasNonPending && hasNoDataAvailable?.length === 0) {
        dispatch(startReviewWithApiData({ id: selectedDocument.id, type: userType === "Auditor" ? "Auditor" : "Analyst" }))
      }
    }
  }, [selectedDocument]);


  const getSelectedDocumentUrl = (pdfUrl: string, docId: string) => {
    if (pdfUrl?.length > 0 && selectedDocumentId !== docId) {
      const alreadyFetched = fetchedPdfPaths.includes(pdfUrl);

      if (!alreadyFetched) {
        dispatch(fetchPdfFile(pdfUrl));
      }
    }
  };


  useEffect(() => {
    if (!selectedDocumentId && documents.length > 0) {
      const inReviewDoc = documents.find((doc) => doc.status === "In Review");

      if (inReviewDoc) {
        getSelectedDocumentUrl(inReviewDoc.url, inReviewDoc.id);
        dispatch(selectDocument(inReviewDoc.id));
        if (inReviewDoc.text_file_path) {
          dispatch(fetchTextFile(inReviewDoc.text_file_path));
        }
      } else {
        const firstDoc = documents[0];
        getSelectedDocumentUrl(firstDoc.url, firstDoc.id);
        dispatch(selectDocument(firstDoc.id));
        if (firstDoc.text_file_path) {
          dispatch(fetchTextFile(firstDoc.text_file_path));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, selectedDocumentId, dispatch]);


  return (
    <div className="h-full w-full flex flex-col">
      {/* Main content always full width */}
      <div className="flex-1 h-full w-full">
        <PdfViewer />
      </div>
    </div>
  );
}
