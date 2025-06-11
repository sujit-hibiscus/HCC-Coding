"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { useRedux } from "@/hooks/use-redux"
import { cn } from "@/lib/utils"
import { updateAnalystNotes, updateCodeReviewItemStatus } from "@/store/slices/documentManagementSlice"
import { AnimatePresence, motion } from "framer-motion"
import { Check, CheckCircle, ChevronDown, ChevronUp, FileText, Loader2, Search, X } from "lucide-react"
import { useCallback, useMemo, useState, useTransition } from "react"

// Interfaces
interface CodeReviewItem {
    id: string
    icdCode: string
    diagnosis: string
    description: string
    hccCode: string
    evidence: string
    hccV28Code: string
    icd10_desc: string
    reference: string
    status: "accepted" | "rejected"
    addedAt: number
}

interface CodeReviewData {
    items: CodeReviewItem[]
    analystNotes: string
    searchTerm: string
}

interface Document {
    id: string
    status: string
}

interface CodeReviewFormProps {
    selectedDocumentId: string | null
    currentCodeReview: CodeReviewData
    selectedDocument: Document
    showSidebar: boolean
    isCompletingReview: boolean
    apiLoading?: boolean
    onComplete: () => void
}

export default function ImprovedCodeReviewForm({
    selectedDocumentId,
    currentCodeReview,
    selectedDocument,
    showSidebar,
    isCompletingReview,
    apiLoading = false,
    onComplete,
}: CodeReviewFormProps) {
    const { dispatch, selector } = useRedux()
    const isCodeLoading = selector((state) => state.documentManagement.medicalConditionsLoading)
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [localSearchTerm, setLocalSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

    // New state for checkbox filters
    const [showRxHcc, setShowRxHcc] = useState(false)
    const [showHcc, setShowHcc] = useState(false)

    const filteredItems = useMemo(() => {
        let items = [...currentCodeReview.items]

        // Filter by status
        if (filterStatus !== "all") {
            items = items.filter((item) => item.status === filterStatus)
        }

        // Filter by code type checkboxes
        items = items.filter((item) => {
            const hasRxHcc = item.hccCode && item.hccCode.trim() !== ""
            const hasHcc = item.hccV28Code && item.hccV28Code.trim() !== ""

            // If both checkboxes are checked or both are unchecked, show all items
            if ((showRxHcc && showHcc) || (!showRxHcc && !showHcc)) {
                return true
            }

            // If only Rx-HCC is checked, show items with Rx-HCC codes
            if (showRxHcc && !showHcc) {
                return hasRxHcc
            }

            // If only HCC is checked, show items with HCC codes
            if (!showRxHcc && showHcc) {
                return hasHcc
            }

            return true
        })

        // Filter by search term
        const searchTerm = localSearchTerm.toLowerCase().trim()
        if (searchTerm) {
            items = items.filter((item) => {
                return (
                    (item.icdCode || "").toLowerCase().includes(searchTerm) ||
                    (item.description || "").toLowerCase().includes(searchTerm) ||
                    (item.hccCode || "").toLowerCase().includes(searchTerm) ||
                    (item.evidence || "").toLowerCase().includes(searchTerm) ||
                    (item.diagnosis || "").toLowerCase().includes(searchTerm)
                )
            })
        }

        return items
    }, [currentCodeReview.items, filterStatus, localSearchTerm, showRxHcc, showHcc])

    const handleSearchChange = useCallback((value: string) => {
        setLocalSearchTerm(value)
    }, [])

    // Optimized filter change handler
    const handleFilterChange = useCallback((value: string) => {
        startTransition(() => {
            setFilterStatus(value)
        })
    }, [])

    const handleStatusUpdate = useCallback(
        async (itemId: string, status: "accepted" | "rejected") => {
            if (selectedDocumentId && !updatingItemId) {
                setUpdatingItemId(itemId)

                // Add a small delay to prevent rapid clicking and ensure smooth transition
                await new Promise((resolve) => setTimeout(resolve, 150))

                startTransition(() => {
                    dispatch(updateCodeReviewItemStatus({ documentId: selectedDocumentId, itemId, status }))
                })

                // Clear the updating state after a brief moment
                setTimeout(() => {
                    setUpdatingItemId(null)
                }, 300)
            }
        },
        [selectedDocumentId, dispatch, updatingItemId],
    )

    const handleNotesUpdate = useCallback(
        (notes: string) => {
            if (selectedDocumentId) {
                dispatch(updateAnalystNotes({ documentId: selectedDocumentId, notes }))
            }
        },
        [selectedDocumentId, dispatch],
    )

    return (
        <TooltipProvider>
            <motion.div
                className="w-full flex flex-col md:w-[45rem] h-full border-t md:border-t-0 md:border-l overflow-hidden bg-gradient-to-br from-slate-50 to-white"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                }}
            >
                <div className="flex flex-col h-full px-2 pb-1 space-y-3 overflow-hidden">
                    {/* Search and Filter Section */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search medical condition..."
                                value={localSearchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 text-sm h-8 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        {/* Checkbox Filters */}
                        <div className="flex items-center gap-4 px-1">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="rx-hcc-filter"
                                    checked={showRxHcc}
                                    onCheckedChange={(checked) => setShowRxHcc(checked as boolean)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="rx-hcc-filter" className="text-base font-medium cursor-pointer select-none">
                                    Rx-HCC
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hcc-filter"
                                    checked={showHcc}
                                    onCheckedChange={(checked) => setShowHcc(checked as boolean)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="hcc-filter" className="text-base font-medium cursor-pointer select-none">
                                    HCC
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Loading indicator */}
                    {isPending && (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                    )}

                    {/* Optimized Code Cards */}
                    <div className="flex-1 overflow-hidden">
                        <div className="h-full max-h-[calc(100vh-18rem)] space-y-2 pr-1 overflow-y-auto overflow-x-hidden">
                            {apiLoading || isCodeLoading ? (
                                <motion.div
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Loading medical conditions
                                        <span className="animate-pulse">...</span>
                                    </p>
                                </motion.div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredItems.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            layout="position"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 0.2,
                                                delay: Math.min(index * 0.01, 0.05),
                                                layout: { duration: 0.3, ease: "easeInOut" },
                                            }}
                                        >
                                            <Card
                                                className={cn(
                                                    "border transition-all duration-200 overflow-hidden",
                                                    item.status === "accepted" && "border-emerald-200 bg-emerald-50/30",
                                                    item.status === "rejected" && "border-rose-200 bg-rose-50/30",
                                                    expandedCard === item.id && "ring-2 ring-blue-200 shadow-md",
                                                )}
                                            >
                                                <CardContent className="p-2 flex gap-2.5 items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        {/* Header Row */}
                                                        <div className="flex items-start justify-between gap-3 mb-3">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                {item.icdCode && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                                                            >
                                                                                ICD:{item.icdCode}
                                                                            </Badge>
                                                                        </TooltipTrigger>
                                                                        {item.icd10_desc && item.icd10_desc?.length > 0 && (
                                                                            <TooltipContent>{item.icd10_desc}</TooltipContent>
                                                                        )}
                                                                    </Tooltip>
                                                                )}
                                                                {item.hccCode && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="font-mono text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                                                            >
                                                                                RX-HCC:{item.hccCode}
                                                                            </Badge>
                                                                        </TooltipTrigger>
                                                                    </Tooltip>
                                                                )}
                                                                {item.hccV28Code && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="font-mono text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                                            >
                                                                                HCC:{item.hccV28Code}
                                                                            </Badge>
                                                                        </TooltipTrigger>
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Main Content */}
                                                        <div className="space-y-2">
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{item.diagnosis}</h3>
                                                                <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                                                            </div>

                                                            {/* Evidence Section */}
                                                            <div className="bg-gray-50 p-1.5 border rounded">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div
                                                                            className={cn(
                                                                                "overflow-hidden transition-all duration-300",
                                                                                expandedCard === item.id ? "max-h-none" : "max-h-12",
                                                                            )}
                                                                        >
                                                                            <p className="text-xs text-gray-700 leading-relaxed">
                                                                                <span className="font-medium text-gray-900">Evidence:</span> {item.evidence}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {item.evidence.length > 100 && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
                                                                            className="h-6 px-2 text-xs shrink-0"
                                                                        >
                                                                            {expandedCard === item.id ? (
                                                                                <ChevronUp className="h-3 w-3" />
                                                                            ) : (
                                                                                <ChevronDown className="h-3 w-3" />
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Reference */}
                                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                                <span className="font-medium">Ref: {item.reference}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-1.5 shrink-0">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant={item.status === "accepted" ? "default" : "outline"}
                                                                    onClick={() => handleStatusUpdate(item.id, "accepted")}
                                                                    disabled={updatingItemId === item.id}
                                                                    className={cn(
                                                                        "h-10 w-10 p-0 !rounded-none transition-all",
                                                                        item.status === "accepted"
                                                                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                            : "hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700",
                                                                    )}
                                                                >
                                                                    {updatingItemId === item.id && item.status !== "accepted" ? (
                                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                                    ) : (
                                                                        <Check className="h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Accept</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant={item.status === "rejected" ? "destructive" : "outline"}
                                                                    onClick={() => handleStatusUpdate(item.id, "rejected")}
                                                                    disabled={updatingItemId === item.id}
                                                                    className={cn(
                                                                        "h-10 w-10 p-0 !rounded-none transition-all",
                                                                        item.status !== "rejected" &&
                                                                        "hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700",
                                                                    )}
                                                                >
                                                                    {updatingItemId === item.id && item.status !== "rejected" ? (
                                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                                    ) : (
                                                                        <X className="h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Reject</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}

                            {/* Empty State - only show when not loading */}
                            {!isCodeLoading && filteredItems.length === 0 && !isPending && (
                                <motion.div
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">No codes found</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {localSearchTerm || (!showRxHcc && !showHcc)
                                            ? "Try adjusting your filters"
                                            : "No codes available for review"}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Notes
                        </Label>
                        <Textarea
                            placeholder="Add your analysis notes..."
                            value={currentCodeReview.analystNotes}
                            onChange={(e) => handleNotesUpdate(e.target.value)}
                            rows={3}
                            className="text-sm resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-200 min-h-[100px]"
                        />
                    </div>

                    {/* Submit Button */}
                    {selectedDocument.status !== "completed" && !showSidebar && (
                        <Button onClick={onComplete} disabled={isCompletingReview} className="w-full transition-all duration-200">
                            {isCompletingReview ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete Review
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </motion.div>
        </TooltipProvider>
    )
}
