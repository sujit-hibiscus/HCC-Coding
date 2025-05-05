"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRedux } from "@/hooks/use-redux";
import { fetchDocuments, fetchPdfFile, selectDocument } from "@/store/slices/documentManagementSlice";
import { motion } from "framer-motion";
import { Calendar, RefreshCw, Search } from "lucide-react";
import { useState } from "react";

export default function DocumentList() {
  const { dispatch, selector } = useRedux();
  const { documents, selectedDocumentId, fetchedPdfPaths } = selector((state) => state.documentManagement);
  const [searchTerm, setSearchTerm] = useState("");

  const totalDocuments = documents.length;

  const filteredDocuments = documents.filter((doc: { name: string }) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-500";
      case "in_progress":
        return "bg-sky-100 text-sky-800 border-sky-700";
      case "on_hold":
        return "bg-orange-100 text-orange-800 border-orange-700";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-700";
      default:
        return "bg-slate-100 text-slate-800 border-slate-700";
    }
  };

  const getSelectedDocumentUrl = (pdfUrl: string, docId: string) => {
    if (pdfUrl?.length > 0 && selectedDocumentId !== docId) {
      const alreadyFetched = fetchedPdfPaths.includes(pdfUrl);

      if (!alreadyFetched) {
        dispatch(fetchPdfFile(pdfUrl));
      }
    }
  };

  const handleRefresh = () => {
    // Implement refresh functionality here
    // This could be fetching documents again from the API
    dispatch(fetchDocuments());
    // Example: dispatch(fetchDocuments());
  };

  const formatFileSize = (fileSizeInKB: number) => {
    if (fileSizeInKB < 1024) {
      return `${fileSizeInKB.toFixed(2)} KB`;
    } else {
      return `${(fileSizeInKB / 1024).toFixed(2)} MB`;
    }
  };

  return (
    <div className="h-full flex flex-col py-1.5 px-1.5 max-h-[calc(100vh-2.9rem)]">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium">
          <span>{totalDocuments}</span> total documents
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleRefresh}
          title="Refresh documents"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative mb-2 flex-shrink-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-8 h-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2 overflow-y-auto flex-grow min-h-0">
        {filteredDocuments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">No documents found</p>
        ) : (
          [...filteredDocuments]
            ?.filter((item) => item?.status !== "completed")
            .map((doc) => {
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0.8, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    if (selectedDocumentId !== doc.id) {
                      getSelectedDocumentUrl(doc.url, doc.id);
                      dispatch(selectDocument(doc.id));
                    }
                  }}
                >
                  <Card
                    className={`cursor-pointer border overflow-hidden ${selectedDocumentId === doc.id ? "shadow-md" : "hover:shadow-sm"
                      }`}
                  >
                    <div
                      className={`p-3 relative ${selectedDocumentId === doc.id ? "bg-slate-200 dark:bg-slate-900" : ""}`}
                    >
                      {selectedDocumentId === doc.id && (
                        <motion.div
                          className={`absolute left-0 top-0 bottom-0 w-1 border-[3px] ${getStatusColor(doc.status)}`}
                          initial={{ height: 0 }}
                          animate={{ height: "100%" }}
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm truncate">{doc.name}</h3>
                          <TooltipProvider>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {/* Assigned Date Tooltip */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center cursor-default">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(doc.assignedAt).toLocaleDateString()}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  Assigned: {new Date(doc.assignedAt).toLocaleDateString()}
                                </TooltipContent>
                              </Tooltip>
                              {doc.fileSize && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center cursor-default">
                                      <span className="text-xs text-muted-foreground ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                                        {formatFileSize(+doc.fileSize)}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    File size
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TooltipProvider>
                        </div>
                        <Badge
                          className={`text-xs capitalize px-2 py-0.5 h-5 ${getStatusColor(
                            doc.status,
                          )} first-letter:uppercase`}
                        >
                          {doc.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
        )}
      </div>
    </div>
  );
}
