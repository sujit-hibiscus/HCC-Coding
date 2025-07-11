"use client";

import { useRedux } from "@/hooks/use-redux";
import { startReviewWithApiData } from "@/store/slices/documentManagementSlice";
import { useEffect } from "react";
import PdfViewer from "./pdf-viewer";

export default function DocumentReviewSystem() {
  const { selector, dispatch } = useRedux();
  const { selectedDocumentId, documents, codeReview: allCodeReview,
  } = selector((state) => state.documentManagement);
  const { userType } = selector((state) => state.user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    };

  useEffect(() => {
    if (selectedDocument?.status === "In Review") {
      const hasNonPending = documents.some(item => item.status !== "pending");
      const hasNoDataAvailable = currentCodeReview?.items;
      if (hasNonPending && hasNoDataAvailable?.length === 0) {
        dispatch(startReviewWithApiData({ id: selectedDocument.id, type: userType === "Auditor" ? "Auditor" : "Analyst" }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocument]);


  /* const getSelectedDocumentUrl = (pdfUrl: string, docId: string) => {
    if (pdfUrl?.length > 0 && selectedDocumentId !== docId) {
      const alreadyFetched = fetchedPdfPaths.includes(pdfUrl);

      if (!alreadyFetched) {
        if (!(pdfFileBase64 && pdfFileBase64?.length > 0)) {
          dispatch(fetchPdfFile(pdfUrl));
        }
      }
    }
  }; */


  /*  useEffect(() => {
     if (!selectedDocumentId && documents.length > 0) {
       const inReviewDoc = documents.find((doc) => doc.status === "In Review");
       if (inReviewDoc) {
         getSelectedDocumentUrl(inReviewDoc.url, inReviewDoc.id);
         dispatch(selectDocument(inReviewDoc.id));
         if (inReviewDoc.text_file_path) {
           if (!(textFileContent && textFileContent?.length > 0)) {
             dispatch(fetchTextFile(inReviewDoc.text_file_path));
           }
         }
       } else {
         const firstDoc = documents[0];
         getSelectedDocumentUrl(firstDoc.url, firstDoc.id);
         dispatch(selectDocument(firstDoc.id));
         if (firstDoc.text_file_path) {
           if (!(textFileContent && textFileContent?.length > 0)) {
             dispatch(fetchTextFile(firstDoc.text_file_path));
           }
         }
       }
     }
 
   }, [documents, selectedDocumentId, dispatch]); */


  return (
    <div className="h-full w-full flex flex-col">
      {/* Main content always full width */}
      <div className="flex-1 h-full w-full">
        <PdfViewer />
      </div>
    </div>
  );
}
