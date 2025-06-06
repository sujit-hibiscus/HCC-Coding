"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRedux } from "@/hooks/use-redux"
import { cn } from "@/lib/utils"
import {
    addCodeReviewItem,
    updateAnalystNotes,
    updateCodeReviewItemStatus,
} from "@/store/slices/documentManagementSlice"
import { AnimatePresence, motion } from "framer-motion"
import { Check, CheckCircle, ChevronDown, ChevronUp, FileText, Info, Loader2, Search, X, Zap } from "lucide-react"
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

// Optimized Animated Counter Component
const AnimatedCounter = ({ value, label, color }: { value: number; label: string; color: string }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <motion.div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${color} cursor-pointer`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                >
                    <span>{value}</span>
                </motion.div>
            </TooltipTrigger>
            <TooltipContent
                variant={label === "Pending" ? "warning" : label === "Accepted" ? "success" : "error"}
                side={label === "Rejected" ? "left" : "top"}
            >
                <p className="text-xs">
                    {value} {label}
                </p>
            </TooltipContent>
        </Tooltip>
    )
}

// Optimized Status Badge
const StatusBadge = ({ status }: { status: string }) => {
    const colorMap = {
        pending: "bg-amber-500",
        accepted: "bg-emerald-500",
        rejected: "bg-rose-500",
    }

    return (
        <div
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${colorMap[status as keyof typeof colorMap]}`}
        />
    )
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
    const isCodeLoading = selector(state => state.documentManagement.medicalConditionsLoading)
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [localSearchTerm, setLocalSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
    // const [apiLoading, setApiLoading] = useState(false)

    // Optimized filtering with better performance
    const filteredItems = useMemo(() => {
        let items = [...currentCodeReview.items]

        // Apply status filter first (most selective)
        if (filterStatus !== "all") {
            items = items.filter((item) => item.status === filterStatus)
        }

        // Apply search filter with null checks
        const searchTerm = localSearchTerm.toLowerCase().trim()
        if (searchTerm) {
            items = items.filter((item) => {
                return (
                    (item.icdCode || "").toLowerCase().includes(searchTerm) ||
                    (item.description || "").toLowerCase().includes(searchTerm) ||
                    (item.hccCode || "").toLowerCase().includes(searchTerm) ||
                    (item.evidence || "").toLowerCase().includes(searchTerm)
                )
            })
        }

        return items
    }, [currentCodeReview.items, filterStatus, localSearchTerm])

    // Optimized search handler
    const handleSearchChange = useCallback((value: string) => {
        setLocalSearchTerm(value)
    }, [])

    // Optimized filter change handler
    const handleFilterChange = useCallback((value: string) => {
        startTransition(() => {
            setFilterStatus(value)
        })
    }, [])

    /*  const handleAddCode = useCallback(
         (item: {
             code: string
             description: string
             hccCode: string
             evidence: string
             reference: string
         }) => {
             if (selectedDocumentId) {
                 // Check if item already exists in cart
                 const existsInCart = currentCodeReview.items.some((cartItem) => cartItem.icdCode === item.code)
 
                 if (!existsInCart) {
                     const newItem: CodeReviewItem = {
                         id: `${item.code}-${Date.now()}`,
                         icdCode: item.code,
                         description: item.description,
                         hccCode: item.hccCode,
                         evidence: item.evidence,
                         reference: item.reference,
                         status: "accepted",
                         addedAt: Date.now(),
                     }
                     dispatch(addCodeReviewItem({ documentId: selectedDocumentId, item: newItem }))
                 }
 
                 // Clear search
                 setLocalSearchTerm("")
             }
         },
         [selectedDocumentId, currentCodeReview.items, dispatch],
     ) */

    const handleStatusUpdate = useCallback(
        async (itemId: string, status: "accepted" | "rejected") => {
            if (selectedDocumentId && !updatingItemId) {
                setUpdatingItemId(itemId)
                // setApiLoading(true)

                // Add a small delay to prevent rapid clicking and ensure smooth transition
                await new Promise((resolve) => setTimeout(resolve, 150))

                startTransition(() => {
                    dispatch(updateCodeReviewItemStatus({ documentId: selectedDocumentId, itemId, status }))
                })

                // Clear the updating state after a brief moment
                setTimeout(() => {
                    setUpdatingItemId(null)
                    // setApiLoading(false)
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

    // Optimized status counts
    const statusCounts = useMemo(() => {
        return currentCodeReview.items.reduce(
            (acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1
                return acc
            },
            { accepted: 0, rejected: 0 } as Record<string, number>,
        )
    }, [currentCodeReview.items])

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
                {/* Optimized Header */}
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                        <motion.div
                            className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center"
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Zap className="w-4 h-4 text-white" />
                        </motion.div>
                        <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Code cart
                        </h3>
                    </div>

                    <div className="flex gap-2">
                        <AnimatedCounter
                            value={statusCounts.accepted}
                            label="Accepted"
                            color="bg-emerald-100 border border-emerald-500 text-emerald-800"
                        />
                        <AnimatedCounter
                            value={statusCounts.rejected}
                            label="Rejected"
                            color="bg-rose-100 text-rose-800 border border-rose-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col h-full px-2 pb-1 space-y-3 overflow-hidden">
                    {/* Compact Search and Filter */}

                    {/*      <motion.div
                                                className="flex gap-2"
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <div className="relative flex-1">
                                                    <Popover open={open} onOpenChange={setOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={open}
                                                                className="w-full justify-between text-sm h-9 border-gray-200 focus:border-blue-400 transition-colors"
                                                            >
                                                                <div className="flex items-center">
                                                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                                    {selectedCode ? (
                                                                        <span className="truncate">
                                                                            {selectedCode.icdCode} - {selectedCode.description}
                                                                        </span>
                                                                    ) : (
                                                                        "Search DX code..."
                                                                    )}
                                                                </div>
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                            <Command>
                                                                <CommandInput
                                                                    placeholder="Search DX code..."
                                                                    value={currentCodeReview.searchTerm}
                                                                    onValueChange={handleSearchChange}
                                                                />
                                                                <CommandList>
                                                                    <CommandEmpty>No codes found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {availableCodes
                                                                            .filter(
                                                                                (item) =>
                                                                                    item.code.toLowerCase().includes(currentCodeReview.searchTerm.toLowerCase()) ||
                                                                                    item.description.toLowerCase().includes(currentCodeReview.searchTerm.toLowerCase()),
                                                                            )
                                                                            .slice(0, 10)
                                                                            .map((item) => {
                                                                                const existsInCart = currentCodeReview.items.some(
                                                                                    (cartItem) => cartItem.icdCode === item.code,
                                                                                )
                                                                                const isDisabled = existsInCart
                                                                                return (
                                                                                    <CommandItem
                                                                                        key={item.code}
                                                                                        value={`${item.code} ${item.description}`}
                                                                                        onSelect={() => {
                                                                                            if (!isDisabled) {
                                                                                                handleAddCode(item)
                                                                                            }
                                                                                        }}
                                                                                        disabled={isDisabled}
                                                                                        className={cn(
                                                                                            "flex items-center justify-between",
                                                                                            isDisabled && "opacity-50 cursor-not-allowed",
                                                                                        )}
                                                                                    >
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="font-medium text-sm">{item.code}</span>
                                                                                                <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">
                                                                                                    {item.hccCode}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="text-xs truncate">{item.description}</div>
                                                                                        </div>
                                                                                        {isDisabled ? (
                                                                                            <Check className="ml-2 h-4 w-4 text-green-600" />
                                                                                        ) : (
                                                                                            <Plus className="ml-2 h-4 w-4" />
                                                                                        )}
                                                                                    </CommandItem>
                                                                                )
                                                                            })}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <motion.select
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value)}
                                                    className="h-9 px-3 border border-gray-200 rounded-md text-sm focus:border-blue-400 focus:outline-none transition-colors"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <option value="all">All</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="accepted">Accepted</option>
                                                    <option value="rejected">Rejected</option>
                                                </motion.select>
                                            </motion.div> */}
                    {/* Optimized Search and Filter */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Filter cart items..."
                                value={localSearchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10 text-sm h-9 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <div className="w-32">
                            <Select value={filterStatus} onValueChange={handleFilterChange}>
                                <SelectTrigger className="h-9 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
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
                        <div className="h-full max-h-[calc(100vh-21rem)] space-y-2 pr-1 overflow-y-auto overflow-x-hidden">
                            {(apiLoading || isCodeLoading) ? (
                                <motion.div
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">Loading medical conditions
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
                                            <TooltipProvider>
                                                <Card
                                                    className={cn(
                                                        "border transition-all duration-200 overflow-hidden",
                                                        item.status === "accepted" && "border-emerald-200 bg-emerald-50/30",
                                                        item.status === "rejected" && "border-rose-200 bg-rose-50/30",
                                                        expandedCard === item.id && "ring-2 ring-blue-200 shadow-md",
                                                    )}
                                                >
                                                    <CardContent className="p-2 flex gap-2.5 items-center justify-between">
                                                        <div>
                                                            {/* Header Row */}
                                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    {/* <StatusBadge status={item.status} /> */}
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
                                                                            <TooltipContent>ICD Code</TooltipContent>
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
                                                                            <TooltipContent>HCC Code</TooltipContent>
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
                                                                <div className="bg-gray-50 p-1.5 border">
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
                                                                            "h-10 w-10 p-0 !rounded-none  transition-all",
                                                                            item.status !== "rejected" && "hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700",
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
                                            </TooltipProvider>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}

                            {/* Empty State - only show when not loading */}
                            {(!isCodeLoading) && filteredItems.length === 0 && !isPending && (
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
                                        {localSearchTerm || filterStatus !== "all"
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
