"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { RootState } from "@/store";
import { selectDocument } from "@/store/slices/documentManagementSlice";
import { motion } from "framer-motion";
import { Calendar, Search } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Define the Document type with the missing 'status' property
/* interface Document {
  id: string
  name: string
  assignedAt: string
  startTime?: number
  timeSpent?: number
  status: "pending" | "in_progress" | "on_hold" | "completed"
} */

export default function DocumentList() {
  const dispatch = useDispatch();
  const { documents, selectedDocumentId } = useSelector((state: RootState) => state.documentManagement);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocuments = documents.filter((doc) => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

  /*  const getFileAge = (doc: Document) => {
     if (doc.startTime && doc.status === "in_progress") {
       const elapsedSeconds = Math.floor((Date.now() - doc.startTime) / 1000);
       return formatTime(elapsedSeconds + (doc.timeSpent || 0));
     } else if (doc.timeSpent) {
       return formatTime(doc.timeSpent);
     }
     return "Not started";
   }; */

  /*  const formatTime = (seconds: number) => {
     const hrs = Math.floor(seconds / 3600);
     const mins = Math.floor((seconds % 3600) / 60);
     const secs = seconds % 60;
     return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
   }; */

  const maskFileName = (name: string): string => {
    if (!name) return "";

    const parts = name.split(" ");
    const extension = parts.length > 1 ? parts.pop() : "";
    const baseName = parts.join(" ");

    if (baseName.length <= 6) {
      return `${baseName} ${extension}`;
    }

    const start = baseName.slice(0, 2);
    const end = baseName.slice(-2);

    const middleIndex = Math.floor(baseName.length / 2);
    const middle = baseName.slice(middleIndex - 1, middleIndex + 1);

    const generateHash = (str: string, seed: number): string => {
      let hash = seed;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36).substring(0, 4);
    };

    const hash1 = generateHash(baseName, 1);
    const hash2 = generateHash(baseName, 2);

    const maskedName = `${start}_${hash1}_${middle}_${hash2}_${end}`;

    return `${maskedName}_${extension}`;
  };


  return (
    <div className="h-full flex flex-col py-1.5 px-1.5 max-h-[calc(100vh-2.9rem)]">
      <div className="relative mb-2 flex-shrink-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-8 h-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2 overflow-y-auto flex-grow  min-h-0">
        {filteredDocuments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">No documents found</p>
        ) : (
          [...filteredDocuments]?.filter(item => item?.status !== "completed").map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0.8, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                if (selectedDocumentId) {
                  // dispatch(pauseReview(selectedDocumentId));
                }
                dispatch(selectDocument(doc.id));
              }}
            >
              <Card
                className={`cursor-pointer border overflow-hidden ${selectedDocumentId === doc.id ? "shadow-md" : "hover:shadow-sm"
                  }
                  `}
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
                      <h3 className="font-medium text-sm truncate">{maskFileName(doc.name)}</h3>
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

                          {/* File Age Tooltip */}
                          {/* <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-default">
                                <Clock className="h-3 w-3 mr-1" />
                                {getFileAge(doc)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              File age: {getFileAge(doc)}
                            </TooltipContent>
                          </Tooltip> */}
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
          ))
        )}
      </div>
    </div>
  );
}
