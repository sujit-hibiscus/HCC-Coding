"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreatableSelect } from "@/components/ui/creatable-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRedux } from "@/hooks/use-redux"
import { cn } from "@/lib/utils"
import type { RootState } from "@/store"
import {
    type Document,
    updateAnalystNotes,
    updateAuditorNotes,
    updateCodeReviewItemStatus,
    updateFormData,
} from "@/store/slices/documentManagementSlice"
import { AnimatePresence, motion } from "framer-motion"
import { Check, CheckCircle, ChevronDown, ChevronUp, Info, Loader2, Search, X, Zap } from "lucide-react"
import { useCallback, useMemo, useState, useTransition } from "react"

interface FormData {
    codesMissed: Array<{ value: string; label: string }>
    codesCorrected: Array<{ value: string; label: string }>
    auditRemarks: string
    rating: number
}

interface FormErrors {
    codesMissed?: string[]
    codesCorrected?: string[]
    auditRemarks?: string
    rating?: string
}

interface AuditorReviewFormProps {
    selectedDocumentId: string | null
    selectedDocument: Document
    formData: FormData
    formErrors: FormErrors
    isSubmitting: boolean
    isCompletingReview: boolean
    onSubmit: () => void
}

interface CodeReviewItem {
    id: string
    icdCode: string
    description: string
    hccCode: string
    evidence: string
    reference: string
    status: "accepted" | "rejected"
    addedAt: number
}

// Sample DX codes for the searchable select
/* const DX_CODES = [
    {
        code: "F32.9",
        description: "Major depressive disorder, single episode",
        hccCode: "HCC 58",
        evidence: "Persistent depressed mood, anhedonia, PHQ-9 score 18.",
        reference: "ICD-10-CM Guidelines Section I.C.5.a.1",
    },
    {
        code: "M79.3",
        description: "Panniculitis, unspecified",
        hccCode: "HCC 40",
        evidence: "Inflammation of subcutaneous fat tissue, localized swelling.",
        reference: "ICD-10-CM Guidelines Section I.C.13.a.1",
    },
    {
        code: "K59.00",
        description: "Constipation, unspecified",
        hccCode: "HCC 6",
        evidence: "Infrequent bowel movements, hard stools, abdominal discomfort.",
        reference: "ICD-10-CM Guidelines Section I.C.11.a.1",
    },
    {
        code: "R50.9",
        description: "Fever, unspecified",
        hccCode: "HCC 2",
        evidence: "Elevated body temperature >100.4°F, documented fever episodes.",
        reference: "ICD-10-CM Guidelines Section I.C.18.a.1",
    },
    {
        code: "Z87.891",
        description: "Personal history of nicotine dependence",
        hccCode: "HCC 54",
        evidence: "Former smoker, quit 2 years ago, 20 pack-year history.",
        reference: "ICD-10-CM Guidelines Section I.C.21.a.1",
    },
] */

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

export default function AuditorReviewForm({
    selectedDocumentId,
    selectedDocument,
    formData,
    formErrors,
    isSubmitting,
    isCompletingReview,
    onSubmit,
}: AuditorReviewFormProps) {
    const { dispatch, selector } = useRedux()
    const { codeReview } = selector((state: RootState) => state.documentManagement)
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [localSearchTerm, setLocalSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

    // Get current document's code review data
    const currentCodeReview = useMemo(() => {
        return selectedDocumentId && codeReview[selectedDocumentId]
            ? codeReview[selectedDocumentId]
            : {
                items: [],
                analystNotes: "",
                auditorNotes: "",
                searchTerm: "",
            }
    }, [selectedDocumentId, codeReview])

    // Optimized filtering with better performance
    const filteredItems = useMemo(() => {
        let items = [...currentCodeReview.items]

        // Apply status filter first (most selective)
        if (filterStatus !== "all") {
            items = items.filter((item) => item.status === filterStatus)
        }

        // Apply search filter
        const searchTerm = localSearchTerm.toLowerCase().trim()
        if (searchTerm) {
            items = items.filter((item) => {
                return (
                    item.icdCode.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm) ||
                    item.hccCode.toLowerCase().includes(searchTerm) ||
                    item.evidence.toLowerCase().includes(searchTerm)
                )
            })
        }

        return items
    }, [currentCodeReview.items, filterStatus, localSearchTerm])

    // Optimized status counts
    const statusCounts = useMemo(() => {
        return currentCodeReview.items.reduce(
            (acc: Record<string, number>, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1
                return acc
            },
            { accepted: 0, rejected: 0 } as Record<string, number>,
        )
    }, [currentCodeReview.items])

    // Optimized handlers
    const handleSearchChange = useCallback((value: string) => {
        setLocalSearchTerm(value)
    }, [])

    const handleFilterChange = useCallback((value: string) => {
        startTransition(() => {
            setFilterStatus(value)
        })
    }, [])

    /*   const handleAddCode = useCallback(
            (codeItem: {
                code: string
                description: string
                hccCode: string
                evidence: string
                reference: string
            }) => {
                if (!selectedDocumentId) return
    
                // Check if code already exists
                const exists = currentCodeReview.items.some((item) => item.icdCode === codeItem.code)
                if (exists) return
    
                const newCode: CodeReviewItem = {
                    id: `${codeItem.code}-${Date.now()}`,
                    icdCode: codeItem.code,
                    description: codeItem.description,
                    hccCode: codeItem.hccCode,
                    evidence: codeItem.evidence,
                    reference: codeItem.reference,
                    status: "accepted",
                    addedAt: Date.now(),
                }
    
                dispatch(addCodeReviewItem({ documentId: selectedDocumentId, item: newCode }))
                setOpen(false)
                setLocalSearchTerm("")
            },
            [selectedDocumentId, currentCodeReview.items, dispatch],
        ) */

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
                setTimeout(() => setUpdatingItemId(null), 300)
            }
        },
        [selectedDocumentId, dispatch, updatingItemId],
    )

    const handleFormDataUpdate = useCallback(
        (data: Partial<FormData>) => {
            if (selectedDocumentId) {
                dispatch(updateFormData({ documentId: selectedDocumentId, data }))
            }
        },
        [selectedDocumentId, dispatch],
    )

    const handleAnalystNotesChange = useCallback(
        (notes: string) => {
            if (selectedDocumentId) {
                dispatch(updateAnalystNotes({ documentId: selectedDocumentId, notes }))
            }
        },
        [selectedDocumentId, dispatch],
    )

    const handleAuditorNotesChange = useCallback(
        (notes: string) => {
            if (selectedDocumentId) {
                dispatch(updateAuditorNotes({ documentId: selectedDocumentId, notes }))
            }
        },
        [selectedDocumentId, dispatch],
    )

    return (
        <TooltipProvider>
            <motion.div
                className="w-full flex flex-col md:w-[40rem] h-full border-t md:border-t-0 md:border-l overflow-hidden bg-gradient-to-br from-slate-50 to-white"
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
                            Audit Review
                        </h3>
                    </div>

                    <div className="flex gap-2">
                        <AnimatedCounter
                            value={statusCounts.accepted}
                            label="Accepted"
                            color="bg-emerald-100 text-emerald-800 border border-emerald-500"
                        />
                        <AnimatedCounter
                            value={statusCounts.rejected}
                            label="Rejected"
                            color="bg-rose-100 text-rose-800 border border-rose-500"
                        />
                    </div>
                </div>

                <div className="flex flex-col h-full px-2 pb-1 space-y-3 overflow-y-auto">
                    {/* Optimized Form Fields */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="codes-missed" className="text-xs font-medium">
                                    Codes Missed
                                </Label>
                                <div className="relative">
                                    <CreatableSelect
                                        id="codes-missed"
                                        isMulti
                                        placeholder="Add missed codes..."
                                        value={formData.codesMissed}
                                        onChange={(newValue) => {
                                            handleFormDataUpdate({
                                                codesMissed: newValue as { value: string; label: string }[],
                                            })
                                        }}
                                        className={cn(
                                            "text-xs",
                                            formErrors.codesMissed && !(formData.codesMissed?.length > 0) && "border-red-500",
                                        )}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor:
                                                    formErrors.codesMissed && !(formData.codesMissed?.length > 0) ? "#ef4444" : base.borderColor,
                                                "&:hover": {
                                                    borderColor:
                                                        formErrors.codesMissed && !(formData.codesMissed?.length > 0)
                                                            ? "#b91c1c"
                                                            : base.borderColor,
                                                },
                                                boxShadow:
                                                    formErrors.codesMissed && !(formData.codesMissed?.length > 0)
                                                        ? "0 0 0 1px #ef4444"
                                                        : base.boxShadow,
                                            }),
                                        }}
                                    />
                                    {formErrors.codesMissed && !(formData.codesMissed?.length > 0) && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500">
                                                    <Info className="h-4 w-4" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="bg-red-500 text-white">
                                                <p className="text-xs">{formErrors.codesMissed}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="codes-corrected" className="text-xs font-medium">
                                    Codes Corrected
                                </Label>
                                <div className="relative">
                                    <CreatableSelect
                                        id="codes-corrected"
                                        isMulti
                                        placeholder="Add corrected codes..."
                                        value={formData.codesCorrected}
                                        onChange={(newValue) => {
                                            handleFormDataUpdate({
                                                codesCorrected: newValue as { value: string; label: string }[],
                                            })
                                        }}
                                        className="text-xs"
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor:
                                                    formErrors.codesCorrected && !(formData.codesCorrected?.length > 0)
                                                        ? "#ef4444"
                                                        : base.borderColor,
                                                "&:hover": {
                                                    borderColor:
                                                        formErrors.codesCorrected && !(formData.codesCorrected?.length > 0)
                                                            ? "#b91c1c"
                                                            : base.borderColor,
                                                },
                                                boxShadow:
                                                    formErrors.codesCorrected && !(formData.codesCorrected?.length > 0)
                                                        ? "0 0 0 1px #ef4444"
                                                        : base.boxShadow,
                                            }),
                                        }}
                                    />
                                    {formErrors.codesCorrected && !(formData.codesCorrected?.length > 0) && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500">
                                                    <Info className="h-4 w-4" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="bg-red-500 text-white">
                                                <p className="text-xs">{formErrors.codesCorrected}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full items-start bg-red gap-3">
                            <div className="space-y-2 w-full">
                                <Label htmlFor="audit-remarks" className="text-xs font-medium">
                                    Audit Remarks
                                </Label>
                                <div className="relative">
                                    <Textarea
                                        id="audit-remarks"
                                        placeholder="Enter audit remarks..."
                                        value={formData.auditRemarks}
                                        onChange={(e) => {
                                            handleFormDataUpdate({ auditRemarks: e.target.value })
                                        }}
                                        rows={2}
                                        className={cn(
                                            "text-xs transition-all duration-200 focus:ring-2 focus:ring-blue-200 max-h-[60px]",
                                            formErrors.auditRemarks &&
                                            !(formData.auditRemarks?.length >= 10) &&
                                            "border-red-500 focus:border-red-500",
                                        )}
                                    />
                                    {formErrors.auditRemarks && !(formData.auditRemarks?.length >= 10) && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="absolute right-2 top-2 text-red-500">
                                                    <Info className="h-4 w-4" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="bg-red-500 text-white">
                                                <p className="text-xs">{formErrors.auditRemarks}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 pr-2 whitespace-nowrap">
                                <Label htmlFor="rating" className="text-xs font-medium">
                                    Quality Rating
                                </Label>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Input
                                            id="rating"
                                            type="number"
                                            min={0}
                                            max={100}
                                            step={1}
                                            value={formData.rating || 0}
                                            onChange={(e) => {
                                                const value = Number.parseFloat(e.target.value)
                                                handleFormDataUpdate({ rating: value })
                                            }}
                                            className={cn(
                                                "h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-blue-200",
                                                formErrors.rating && "border-red-500 focus:border-red-500",
                                            )}
                                        />
                                        {formErrors.rating && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500">
                                                        <Info className="h-4 w-4" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="bg-red-500 text-white">
                                                    <p className="text-xs">{formErrors.rating}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Optimized Search and Filter */}
                    <div className="flex gap-2">
                        {/* Add Code Dropdown */}
                        {/* <div className="flex-1">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between text-xs h-8 transition-all duration-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-200"
                                    >
                                        <div className="flex items-center">
                                            <Plus className="mr-2 h-3 w-3 shrink-0 opacity-50" />
                                            Add DX code...
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search DX code..." />
                                        <CommandList>
                                            <CommandEmpty>No codes found.</CommandEmpty>
                                            <CommandGroup>
                                                {DX_CODES.slice(0, 10).map((item) => {
                                                    const exists = currentCodeReview.items.some((code) => code.icdCode === item.code)

                                                    return (
                                                        <CommandItem
                                                            key={item.code}
                                                            value={`${item.code} ${item.description}`}
                                                            onSelect={() => {
                                                                if (!exists) {
                                                                    handleAddCode(item)
                                                                }
                                                            }}
                                                            disabled={exists}
                                                            className={cn(
                                                                "flex items-center justify-between transition-colors",
                                                                exists && "opacity-50 cursor-not-allowed",
                                                            )}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm">{item.code}</span>
                                                                    <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">
                                                                        {item.hccCode}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                                                            </div>
                                                            {exists ? (
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
                        </div> */}

                        {/* Search Filter */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                <Input
                                    placeholder="Search codes..."
                                    value={localSearchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-7 h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="w-32">
                            <Select value={filterStatus} onValueChange={handleFilterChange}>
                                <SelectTrigger className="h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-blue-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
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
                    <div className="flex-1 min-h-0">
                        <div className="h-full space-y-2 pr-1 overflow-y-auto overflow-x-hidden max-h-[470px]">
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 0 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 0 }}
                                        transition={{
                                            duration: 0.2,
                                            delay: Math.min(index * 0.02, 0.1),
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

                            {/* Empty State */}
                            {filteredItems.length === 0 && !isPending && (
                                <motion.div
                                    className="flex flex-col items-center justify-center py-8 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
                                        <Search className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">No codes found</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {localSearchTerm || filterStatus !== "all"
                                            ? "Try adjusting your filters"
                                            : "Add codes using the dropdown above"}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Optimized Notes */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-700">Analyst Notes</Label>
                                <Textarea
                                    placeholder="Analyst notes..."
                                    value={selectedDocument?.analystNote}
                                    onChange={(e) => handleAnalystNotesChange(e.target.value)}
                                    rows={2}
                                    disabled
                                    className="text-xs resize-none !opacity-80 transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-700">Auditor Notes</Label>
                                <Textarea
                                    placeholder="Auditor notes..."
                                    value={currentCodeReview.auditorNotes}
                                    onChange={(e) => handleAuditorNotesChange(e.target.value)}
                                    rows={2}
                                    className="text-xs resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting || isCompletingReview}
                        className="w-full text-white shadow-lg transition-all duration-200"
                    >
                        {isSubmitting || isCompletingReview ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Submit Audit Review
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </TooltipProvider>
    )
}
