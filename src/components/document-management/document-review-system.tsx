"use client"

import DocumentList from "@/components/document-management/document-list"
import { fetchDocuments, recalculateDocumentTimes } from "@/store/slices/documentManagementSlice"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import PdfViewer from "./pdf-viewer"

export default function DocumentReviewSystem() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Fetch documents
    dispatch(fetchDocuments() as any)

    // Recalculate document times after rehydration
    dispatch(recalculateDocumentTimes())

    // Set up an interval to periodically recalculate times
    const interval = setInterval(() => {
      dispatch(recalculateDocumentTimes())
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [dispatch])

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
  )
}
