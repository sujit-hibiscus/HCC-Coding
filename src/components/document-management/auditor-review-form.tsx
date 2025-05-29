"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreatableSelect } from "@/components/ui/creatable-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useRedux } from "@/hooks/use-redux"
import {
    updateFormData,
    addCodeToTable,
    updateCodeStatus,
    updateAnalystNotes,
    updateAuditorNotes,
} from "@/store/slices/documentManagementSlice"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Loader2, Search, Plus, Check, X, TrendingUp, ChevronsUpDown } from "lucide-react"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { RootState } from "@/store"

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
    formData: FormData
    formErrors: FormErrors
    isSubmitting: boolean
    isCompletingReview: boolean
    onSubmit: () => void
}

interface CodeItem {
    id: string
    code: string
    description: string
    status: "pending" | "accepted" | "rejected"
    addedAt: number
}

// Sample DX codes for the searchable select
const DX_CODES = [
    { code: "I10.20", description: "Lorem Epsum" },
    { code: "I20.20", description: "PQR SQL" },
    { code: "I10.10", description: "ABC XYZ" },
    { code: "J18.20", description: "Lobar pneumonia, unspecified organism" },
    { code: "J20.9", description: "Acute bronchitis, unspecified" },
    { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
    { code: "J44.1", description: "Chronic obstructive pulmonary disease with acute exacerbation" },
    { code: "N18.6", description: "End stage renal disease" },
    { code: "F32.9", description: "Major depressive disorder, single episode, unspecified" },
    { code: "M79.3", description: "Panniculitis, unspecified" },
]

export default function AuditorReviewForm({
    selectedDocumentId,
    formData,
    formErrors,
    isSubmitting,
    isCompletingReview,
    onSubmit,
}: AuditorReviewFormProps) {
    const { dispatch, selector } = useRedux()
    const { codeManagement } = selector((state: RootState) => state.documentManagement)

    const [open, setOpen] = useState(false)
    const [selectedCode, setSelectedCode] = useState<{ code: string; description: string } | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    // Get current document's code management data
    const currentData =
        selectedDocumentId && codeManagement[selectedDocumentId]
            ? codeManagement[selectedDocumentId]
            : {
                codes: [],
                analystNotes: "",
                auditorNotes: "",
                searchTerm: "",
            }

    // Filter codes based on search term for table display
    const filteredCodes = useMemo(() => {
        if (!searchTerm.trim()) return currentData.codes
        return currentData.codes.filter(
            (code) =>
                code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                code.description.toLowerCase().includes(searchTerm.toLowerCase()),
        )
    }, [searchTerm, currentData.codes])

    // Calculate quality metrics
    const qualityMetrics = useMemo(() => {
        const codes = currentData.codes
        const accepted = codes.filter((code) => code.status === "accepted").length
        const rejected = codes.filter((code) => code.status === "rejected").length
        const total = codes.length
        const added = total
        const removed = rejected

        // Calculate quality score percentage
        const qualityScore = total > 0 ? Math.round((accepted / total) * 100) : 0

        return { accepted, added, removed, qualityScore, total }
    }, [currentData.codes])

    const handleAddCode = (codeItem: { code: string; description: string }) => {
        if (!selectedDocumentId) return

        // Check if code already exists
        const exists = currentData.codes.some((item) => item.code === codeItem.code)
        if (exists) return

        const newCode: CodeItem = {
            id: `${codeItem.code}-${Date.now()}`,
            code: codeItem.code,
            description: codeItem.description,
            status: "pending",
            addedAt: Date.now(),
        }

        dispatch(addCodeToTable({ documentId: selectedDocumentId, code: newCode }))
        setSelectedCode(null)
        setOpen(false)
    }

    const handleStatusUpdate = (codeId: string, status: "accepted" | "rejected") => {
        if (!selectedDocumentId) return
        dispatch(updateCodeStatus({ documentId: selectedDocumentId, codeId, status }))
    }

    const handleAnalystNotesChange = (notes: string) => {
        if (!selectedDocumentId) return
        dispatch(updateAnalystNotes({ documentId: selectedDocumentId, notes }))
    }

    const handleAuditorNotesChange = (notes: string) => {
        if (!selectedDocumentId) return
        dispatch(updateAuditorNotes({ documentId: selectedDocumentId, notes }))
    }

    return (
        <motion.div
            className="w-full flex flex-col md:w-[32rem] h-full border-t md:border-t-0 md:border-l overflow-y-auto bg-white p-2"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
                velocity: 2,
            }}
        >
            <h3 className="text-lg font-semibold mb-4">Audit Review</h3>

            <div className="flex flex-col justify-between h-full">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto max-h-[84vh] pr-1">
                    <div className="space-y-4">
                        {/* Original Form Fields */}
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="codes-missed" className="text-sm font-medium">
                                    Codes Missed
                                </Label>
                                <CreatableSelect
                                    id="codes-missed"
                                    isMulti
                                    placeholder="Add codes that were missed..."
                                    value={formData.codesMissed}
                                    onChange={(newValue) => {
                                        if (selectedDocumentId) {
                                            dispatch(
                                                updateFormData({
                                                    documentId: selectedDocumentId,
                                                    data: { codesMissed: newValue as { value: string; label: string }[] },
                                                }),
                                            )
                                        }
                                    }}
                                />
                                {formErrors.codesMissed && !(formData.codesMissed?.length > 0) && (
                                    <p className="text-xs text-red-500 mt-1">{formErrors.codesMissed}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="codes-corrected" className="text-sm font-medium">
                                    Codes Corrected
                                </Label>
                                <CreatableSelect
                                    id="codes-corrected"
                                    isMulti
                                    placeholder="Add codes that were corrected..."
                                    value={formData.codesCorrected}
                                    onChange={(newValue) => {
                                        if (selectedDocumentId) {
                                            dispatch(
                                                updateFormData({
                                                    documentId: selectedDocumentId,
                                                    data: { codesCorrected: newValue as { value: string; label: string }[] },
                                                }),
                                            )
                                        }
                                    }}
                                />
                                {formErrors.codesCorrected && !(formData.codesCorrected?.length > 0) && (
                                    <p className="text-xs text-red-500 mt-1">{formErrors.codesCorrected}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="audit-remarks" className="text-sm font-medium">
                                    Audit Remarks
                                </Label>
                                <Textarea
                                    id="audit-remarks"
                                    placeholder="Enter your audit remarks here..."
                                    value={formData.auditRemarks}
                                    onChange={(e) => {
                                        if (selectedDocumentId) {
                                            dispatch(
                                                updateFormData({
                                                    documentId: selectedDocumentId,
                                                    data: { auditRemarks: e.target.value },
                                                }),
                                            )
                                        }
                                    }}
                                    rows={4}
                                    className="text-sm"
                                />
                                {formErrors.auditRemarks && !(formData.auditRemarks?.length >= 10) && (
                                    <p className="text-xs text-red-500 mt-1">{formErrors.auditRemarks}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="rating" className="text-sm font-medium">
                                    Quality Rating (Required)
                                </Label>
                                <div className="flex items-center">
                                    <Input
                                        id="rating"
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={formData.rating || 0}
                                        onChange={(e) => {
                                            if (selectedDocumentId) {
                                                const value = Number.parseFloat(e.target.value)
                                                dispatch(
                                                    updateFormData({
                                                        documentId: selectedDocumentId,
                                                        data: { rating: value },
                                                    }),
                                                )
                                            }
                                        }}
                                        className="w-20 h-9 text-sm"
                                    />
                                    {/* <span className="ml-2 text-sm text-muted-foreground">%</span> */}
                                </div>
                                {formErrors.rating && <p className="text-xs text-red-500 mt-1">{formErrors.rating}</p>}
                            </div>

                            {/* Enhanced Code Management Section */}
                            <div className="border-gray-200">
                                <div className="space-y-3">
                                    {/* Enhanced Searchable Select */}
                                    <div className="space-y-2">
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    className="w-full !rounded-none justify-between text-sm h-9"
                                                >
                                                    <div className="flex items-center">
                                                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                        {selectedCode ? (
                                                            <span className="truncate">
                                                                {selectedCode.code} - {selectedCode.description}
                                                            </span>
                                                        ) : (
                                                            "Search DX code..."
                                                        )}
                                                    </div>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-none" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search DX code..." />
                                                    <CommandList>
                                                        <CommandEmpty>No codes found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {DX_CODES.slice(0, 10).map((item) => {
                                                                const exists = currentData.codes.some((code) => code.code === item.code)

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
                                                                            "flex items-center justify-between",
                                                                            exists && "opacity-50 cursor-not-allowed",
                                                                        )}
                                                                    >
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-medium text-sm">{item.code}</div>
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
                                    </div>

                                    {/* Filter Input */}
                                    <div>
                                        <Input
                                            placeholder="Filter codes in table..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>


                                    {/* Enhanced Table Design */}
                                    {currentData.codes.length > 0 && (
                                        <div className="border border-gray-300 rounded-none overflow-hidden">
                                            <div className="bg-selectedText text-white text-sm font-medium">
                                                <div className="grid grid-cols-12 gap-2 p-3">
                                                    <div className="col-span-3">Code</div>
                                                    <div className="col-span-6">Description</div>
                                                    <div className="col-span-3 text-center">Actions</div>
                                                </div>
                                            </div>
                                            <div className="max-h-40 overflow-y-auto">
                                                <AnimatePresence>
                                                    {filteredCodes.map((code, index) => (
                                                        <motion.div
                                                            key={code.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 20 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="grid grid-cols-12 gap-2 p-3 border-b border-gray-200 text-sm hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className="col-span-3 font-mono text-xs font-medium">{code.code}</div>
                                                            <div className="col-span-6 text-xs" title={code.description}>
                                                                <div className="truncate">{code.description}</div>
                                                            </div>
                                                            <div className="col-span-3 flex justify-center gap-2">
                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                    <Button
                                                                        size="sm"
                                                                        variant={code.status === "accepted" ? "default" : "outline"}
                                                                        onClick={() => handleStatusUpdate(code.id, "accepted")}
                                                                        className={cn(
                                                                            "h-7 w-7 p-0 transition-all",
                                                                            code.status === "accepted" && "bg-green-600 hover:bg-green-700 text-white",
                                                                        )}
                                                                    >
                                                                        <Check className="h-3 w-3" />
                                                                    </Button>
                                                                </motion.div>
                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                    <Button
                                                                        size="sm"
                                                                        variant={code.status === "rejected" ? "destructive" : "outline"}
                                                                        onClick={() => handleStatusUpdate(code.id, "rejected")}
                                                                        className="h-7 w-7 p-0 transition-all"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </motion.div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {currentData.codes.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-gray-300 rounded-lg">
                                            <div className="text-gray-400 mb-2">
                                                <Search className="w-8 h-8 mx-auto" />
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">No codes added yet</p>
                                            <p className="text-xs text-gray-400 mt-1">Use the search above to add DX codes</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="grid gap-2">
                                <Label htmlFor="analyst-notes" className="text-sm font-medium">
                                    Analyst Notes
                                </Label>
                                <Textarea
                                    id="analyst-notes"
                                    placeholder="Enter analyst notes here..."
                                    value={currentData.analystNotes}
                                    onChange={(e) => handleAnalystNotesChange(e.target.value)}
                                    rows={3}
                                    className="resize-none text-sm"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="auditor-notes" className="text-sm font-medium">
                                    Auditor Notes
                                </Label>
                                <Textarea
                                    id="auditor-notes"
                                    placeholder="Enter auditor notes here..."
                                    value={currentData.auditorNotes}
                                    onChange={(e) => handleAuditorNotesChange(e.target.value)}
                                    rows={3}
                                    className="resize-none text-sm"
                                />
                            </div>

                            {/* Enhanced Quality Score Card */}
                            {currentData.codes.length > 0 && (
                                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-sm">
                                    <div className="p-2">
                                        <CardTitle className="flex items-center gap-2 text-blue-900 text-base">
                                            <TrendingUp className="h-5 w-5" />
                                            Quality Score
                                        </CardTitle>
                                    </div>
                                    <div className="py-2 p-1">
                                        <div className="grid grid-cols-3 gap-4">
                                            <motion.div
                                                className="text-center p-1 bg-white/60 rounded-lg border border-green-100 cursor-pointer"
                                                // whileHover={{ scale: 1.02, y: -2 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <div className="text-2xl font-bold text-green-600">{qualityMetrics.accepted}</div>
                                                <div className="text-xs text-muted-foreground font-medium">Accepted</div>
                                            </motion.div>

                                            <motion.div
                                                className="text-center p-1 bg-white/60 rounded-lg border border-blue-100 cursor-pointer"
                                                // whileHover={{ scale: 1.02, y: -2 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <div className="text-2xl font-bold text-blue-600">{qualityMetrics.added}</div>
                                                <div className="text-xs text-muted-foreground font-medium">Total Added</div>
                                            </motion.div>

                                            <motion.div
                                                className="text-center p-1 bg-white/60 rounded-lg border border-red-100 cursor-pointer"
                                                // whileHover={{ scale: 1.02, y: -2 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <div className="text-2xl font-bold text-red-600">{qualityMetrics.removed}</div>
                                                <div className="text-xs text-muted-foreground font-medium">Rejected</div>
                                            </motion.div>
                                        </div>

                                        {/* Enhanced Progress Bar */}
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                                <span className="font-medium">Quality Progress</span>
                                                <span className="font-bold">{qualityMetrics.qualityScore}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full shadow-sm"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${qualityMetrics.qualityScore}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fixed Submit Button at Bottom */}
                <div className="flex justify-end gap-3 pt-4 border-t bg-white">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={onSubmit}
                            disabled={isSubmitting || isCompletingReview}
                            type="submit"
                            className="text-white px-6"
                        >
                            {isSubmitting || isCompletingReview ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            {isSubmitting || isCompletingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
