"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConditionCommonCard } from "@/components/ui/condition-common-card"
import { Option as ICDOption } from "@/components/ui/creatable-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRedux } from "@/hooks/use-redux"
import { cn } from "@/lib/utils"
import { setCurrentCodeReviewTab, updateAnalystNotes, updateCodeReviewItemStatus } from "@/store/slices/documentManagementSlice"
import { AnimatePresence, motion } from "framer-motion"
import { Check, CheckCircle, FileText, Loader2, Search, X } from "lucide-react"
import { useCallback, useMemo, useRef, useState, useTransition } from "react"
import TabsComponent from "../common/CommonTab"
import { IcdSuggestionIconSimple } from "../common/icd-suggestion-icon"
import { UpdateIcdCodeModal } from "./UpdateIcdModal"
// Interfaces
interface CodeReviewItem {
    id: string
    icdCode: string
    V24HCC: string
    diagnosis: string
    description: string
    hccCode: string
    evidence: string
    hccV28Code: string
    icd10_desc: string
    reference: string
    query?: string | null
    status: "accepted" | "rejected"
    addedAt: number
    code_status?: string | null
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
    const currentTab = selector((state) => state.documentManagement.currentCodeReviewTab)
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [localSearchTerm, setLocalSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

    const [showHcc, setShowHcc] = useState(false)
    const [showRxHcc, setShowRxHcc] = useState(false)

    const [updateIcdModal, setUpdateIcdModal] = useState<{ open: boolean; item: CodeReviewItem | null }>({ open: false, item: null })
    const [icdLoadingId, setIcdLoadingId] = useState<string | null>(null)

    const filteredBySearchAndHcc = useMemo(() => {
        let items = [...currentCodeReview.items];
        items = items.filter((item) => {
            const hasRxHcc = item.hccCode && item.hccCode.trim() !== "";
            const hasV28 = item.hccV28Code && item.hccV28Code.trim() !== "";
            const hasV24 = item.V24HCC && item.V24HCC.trim() !== "";
            if (!showRxHcc && !showHcc) return true;
            if (showRxHcc && showHcc) return hasRxHcc || hasV28 || hasV24;
            if (showRxHcc && !showHcc) return hasRxHcc;
            if (!showRxHcc && showHcc) return hasV28 || hasV24;
            return true;
        });
        const searchTerm = localSearchTerm.toLowerCase().trim();
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const keysToSearch = [
                "icdCode", "hccCode", "V24HCC", "hccV28Code", "evidence", "diagnosis", "description", "query", "icd10_desc", "code_status"
            ];
            items = items.filter((item) =>
                keysToSearch.some((key) => ((item as any)[key] ?? "").toString().toLowerCase().includes(lowerSearchTerm))
            );
        }
        return items;
    }, [currentCodeReview.items, localSearchTerm, showRxHcc, showHcc]);

    const documentedItems = useMemo(() => filteredBySearchAndHcc.filter(item => item?.code_status?.toLowerCase() === "documented"), [filteredBySearchAndHcc]);
    const opportunitiesItems = useMemo(() => filteredBySearchAndHcc.filter(item => item?.code_status?.toLowerCase() !== "documented"), [filteredBySearchAndHcc]);

    const filteredItems = useMemo(() => currentTab === "Documented" ? documentedItems : opportunitiesItems, [currentTab, documentedItems, opportunitiesItems]);

    const tabs = [
        { value: "Documented", label: `Documented`, count: documentedItems.length },
        { value: "Opportunities", label: `Opportunities`, count: opportunitiesItems.length },
    ];

    const handleSearchChange = useCallback((value: string) => {
        setLocalSearchTerm(value)
    }, [])

    const handleStatusUpdate = useCallback(
        async (itemId: string, status: "accepted" | "rejected") => {
            if (selectedDocumentId && !updatingItemId) {
                setUpdatingItemId(itemId)
                await new Promise((resolve) => setTimeout(resolve, 150))

                startTransition(() => {
                    dispatch(updateCodeReviewItemStatus({ documentId: selectedDocumentId, itemId, status }))
                })

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

    const codeCardScrollRef = useRef<HTMLDivElement>(null);

    const handleTabChange = (tabId: string) => {
        dispatch(setCurrentCodeReviewTab(tabId));
        if (codeCardScrollRef.current) {
            codeCardScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <TooltipProvider>
            <motion.div
                className="w-full flex flex-col min-w-[30rem] md:w-[50vw] h-full border-t md:border-t-0 md:border-l overflow-hidden bg-gradient-to-br from-slate-50 to-white"
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
                                    id="hcc-filter"
                                    checked={showHcc}
                                    onCheckedChange={(checked) => setShowHcc(checked as boolean)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="hcc-filter" className="text-base font-medium cursor-pointer select-none">
                                    HCC
                                </Label>
                            </div>
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
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <TabsComponent
                            countLoading={isCodeLoading}
                            tabs={tabs}
                            currentTab={currentTab}
                            handleTabChange={handleTabChange}
                        />
                        {/*  <span className="text-xs md:text-sm whitespace-nowrap font-semibold text-gray-500 mr-2">Total: {documentedItems.length + opportunitiesItems?.length}</span> */}
                    </div>
                    {/* Optimized Code Cards */}
                    <div className="flex-1 overflow-hidden">
                        <div ref={codeCardScrollRef} className="h-full max-h-[calc(100vh-18rem)] space-y-2 pr-1 overflow-y-auto overflow-x-hidden">
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
                                            <ConditionCommonCard
                                                status={item.status}
                                                expanded={expandedCard === item.id}
                                                onExpand={item.evidence.length > 230 ? () => setExpandedCard(expandedCard === item.id ? null : item.id) : undefined}
                                                icdCode={item.icdCode}
                                                V24HCC={item?.V24HCC}
                                                code_status={item?.code_status}
                                                hccV28Code={item.hccV28Code}
                                                hccCode={item.hccCode}
                                                icd10_desc={item.icd10_desc}
                                                diagnosis={item.diagnosis}
                                                description={item.description}
                                                evidence={item.evidence}
                                                query={item.query}
                                                actionButtons={
                                                    <>
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
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setUpdateIcdModal({ open: true, item })}
                                                                    className="h-10 w-10 p-0 !rounded-none transition-all"
                                                                    aria-label="Suggest ICD"
                                                                >
                                                                    {icdLoadingId === item.id ? (
                                                                        <Loader2 className="h-10 w-10 animate-spin text-selectedText" />
                                                                    ) : (
                                                                        <IcdSuggestionIconSimple className="h-10 w-10 text-selectedText" />
                                                                    )}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Suggest ICD</TooltipContent>
                                                        </Tooltip>
                                                    </>
                                                }
                                            />
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
                                        {(localSearchTerm || (!showRxHcc && !showHcc)) ?
                                            (localSearchTerm?.length > 0 ? "Try adjusting your filters" : "No codes available for review")
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

            <UpdateIcdCodeModal
                open={updateIcdModal.open}
                onClose={() => setUpdateIcdModal({ open: false, item: null })}
                item={updateIcdModal.item}
                onUpdateIcdLoading={(id) => {
                    setIcdLoadingId(id);
                    setTimeout(() => setIcdLoadingId(null), 3000);
                }}
            />
        </TooltipProvider>
    )
}
