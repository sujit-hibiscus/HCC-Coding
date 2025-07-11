"use client";

import { Button } from "@/components/ui/button";
import { ConditionCommonCard } from "@/components/ui/condition-common-card";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRedux } from "@/hooks/use-redux";
import { cn } from "@/lib/utils";
import type { RootState } from "@/store";
import {
    type Document,
    setCurrentCodeReviewTab,
    updateAnalystNotes,
    updateCodeReviewItemStatus,
    updateFormData
} from "@/store/slices/documentManagementSlice";
import { motion } from "framer-motion";
import { Asterisk, Check, CheckCircle, FileText, Info, Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import TabsComponent from "../common/CommonTab";
import { IcdSuggestionIconSimple } from "../common/icd-suggestion-icon";
import { Checkbox } from "../ui/checkbox";
import { UpdateIcdCodeModal } from "./UpdateIcdModal";

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

export default function AuditorReviewForm({
    selectedDocumentId,
    selectedDocument,
    formData,
    formErrors,
    isSubmitting,
    isCompletingReview,
    onSubmit,
}: AuditorReviewFormProps) {
    const { dispatch, selector } = useRedux();
    const [showRxHcc, setShowRxHcc] = useState(false);
    const [showHcc, setShowHcc] = useState(false);
    const { codeReview } = selector((state: RootState) => state.documentManagement);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [localSearchTerm, setLocalSearchTerm] = useState("");
    const [isPending, startTransition] = useTransition();
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
    const isCodeLoading = selector((state) => state.documentManagement.medicalConditionsLoading);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [updateIcdModal, setUpdateIcdModal] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });
    const [icdLoadingId, setIcdLoadingId] = useState<string | null>(null);
    const currentTab = selector((state) => state.documentManagement.currentCodeReviewTab);
    const codeCardScrollRef = useRef<HTMLDivElement>(null);

    // Get current document's code review data
    const currentCodeReview = useMemo(() => {
        return selectedDocumentId && codeReview[selectedDocumentId]
            ? codeReview[selectedDocumentId]
            : {
                items: [],
                analystNotes: "",
                auditorNotes: "",
                searchTerm: "",
            };
    }, [selectedDocumentId, codeReview]);

    // 1. Apply search and HCC/Rx-HCC filters first
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                keysToSearch.some((key) => ((item as any)[key] ?? "").toString().toLowerCase().includes(lowerSearchTerm))
            );
        }
        return items;
    }, [currentCodeReview.items, localSearchTerm, showRxHcc, showHcc]);

    // 2. Divide filtered data into tab groups
    const documentedItems = useMemo(() => filteredBySearchAndHcc.filter(item => item?.code_status?.toLowerCase() === "documented"), [filteredBySearchAndHcc]);
    const opportunitiesItems = useMemo(() => filteredBySearchAndHcc.filter(item => item?.code_status?.toLowerCase() !== "documented"), [filteredBySearchAndHcc]);

    // 3. Use tab to select which group to show
    const filteredItems = useMemo(() => currentTab === "Documented" ? documentedItems : opportunitiesItems, [currentTab, documentedItems, opportunitiesItems]);

    // 4. Tabs and counts reflect filtered data
    const tabs = [
        { value: "Documented", label: "Documented", count: documentedItems.length },
        { value: "Opportunities", label: "Opportunities", count: opportunitiesItems.length },
    ];

    const handleTabChange = (tabId: string) => {
        dispatch(setCurrentCodeReviewTab(tabId));
        // Remove the immediate scroll reset to prevent flashing
        // Scroll will be handled by the layout animation
    };

    // Add a stable key for the content area to prevent re-mounting
    const contentKey = useMemo(() => `${currentTab}-${filteredItems.length}`, [currentTab, filteredItems.length]);

    // Handle smooth scroll after tab change animation completes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (codeCardScrollRef.current) {
                codeCardScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
            }
        }, 300); // Wait for animation to complete

        return () => clearTimeout(timer);
    }, [currentTab]);

    // Optimized handlers
    const handleSearchChange = useCallback((value: string) => {
        setLocalSearchTerm(value);
    }, []);

    const handleStatusUpdate = useCallback(
        async (itemId: string, status: "accepted" | "rejected") => {
            if (selectedDocumentId && !updatingItemId) {
                setUpdatingItemId(itemId);

                await new Promise((resolve) => setTimeout(resolve, 150));

                startTransition(() => {
                    dispatch(updateCodeReviewItemStatus({ documentId: selectedDocumentId, itemId, status }));
                });

                setTimeout(() => setUpdatingItemId(null), 300);
            }
        },
        [selectedDocumentId, dispatch, updatingItemId],
    );

    const handleFormDataUpdate = useCallback(
        (data: Partial<FormData>) => {
            if (selectedDocumentId) {
                dispatch(updateFormData({ documentId: selectedDocumentId, data }));
            }
        },
        [selectedDocumentId, dispatch],
    );

    const handleAnalystNotesChange = useCallback(
        (notes: string) => {
            if (selectedDocumentId) {
                dispatch(updateAnalystNotes({ documentId: selectedDocumentId, notes }));
            }
        },
        [selectedDocumentId, dispatch],
    );

    return (
        <TooltipProvider>
            <motion.div
                className="w-full bg-red-200 flex flex-col min-w-[30rem] md:w-[50vw] h-full border-t md:border-t-0 md:border-l overflow-hidden bg-gradient-to-br from-slate-50 to-white"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                }}
            >
                <div className="flex flex-col h-full px-2 pb-1 space-y-3 max-h-[calc(100vh-2.9rem)] overflow-y-auto">

                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codes-missed" className="text-xs font-medium">
                                        Codes Missed
                                    </Label>
                                    {(formErrors.codesMissed && !(formData.codesMissed?.length > 0)) ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-red-500">
                                                    <Info className="h-3 w-3" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="bg-red-500 text-white">
                                                <p className="text-xs">{formErrors.codesMissed}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : <div className="text-red-500">
                                        <Asterisk className="h-3 w-3" />
                                    </div>}
                                </div>
                                <div className="relative">
                                    <CreatableSelect
                                        id="codes-missed"
                                        isMulti
                                        placeholder="Add missed codes..."
                                        value={formData.codesMissed}
                                        onChange={(newValue) => {
                                            handleFormDataUpdate({
                                                codesMissed: newValue as { value: string; label: string }[],
                                            });
                                        }}
                                        isError={formErrors.codesMissed && !(formData.codesMissed?.length > 0)}
                                        className={cn(
                                            "text-xs",
                                            formErrors.codesMissed && !(formData.codesMissed?.length > 0) && "border-red-500",
                                        )}
                                        styles={{
                                            control: (base) => ({
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
                                                        ? "0 0 0 0.1px #ef4444"
                                                        : base.boxShadow,
                                            }),
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="codes-corrected" className="text-xs font-medium">
                                        Codes Corrected
                                    </Label>
                                    {formErrors.codesCorrected && !(formData.codesCorrected?.length > 0) ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-red-500">
                                                    <Info className="h-3 w-3" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="bg-red-500 text-white">
                                                <p className="text-xs">{formErrors.codesCorrected}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : <div className="text-red-500">
                                        <Asterisk className="h-3 w-3" />
                                    </div>}
                                </div>
                                <div className="relative">
                                    <CreatableSelect
                                        id="codes-corrected"
                                        isMulti
                                        placeholder="Add corrected codes..."
                                        value={formData.codesCorrected}
                                        onChange={(newValue) => {
                                            handleFormDataUpdate({
                                                codesCorrected: newValue as { value: string; label: string }[],
                                            });
                                        }}
                                        isError={formErrors.codesCorrected && !(formData.codesCorrected?.length > 0)}
                                        className="text-xs"
                                        styles={{
                                            control: (base) => ({
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
                                                        ? "0 0 0 0.1px #ef4444"
                                                        : base.boxShadow,
                                            }),
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex w-full items-start bg-red gap-3">
                                <div className="space-y-2 w-full">
                                    <div className="flex items-center gap-1">
                                        <Label htmlFor="audit-remarks" className="text-xs font-medium">
                                            Audit Remarks
                                        </Label>
                                        {formErrors.auditRemarks && !(formData.auditRemarks?.length >= 150) ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="text-red-500">
                                                        <Info className="h-3 w-3" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="bg-red-500 text-white">
                                                    <p className="text-xs">{formErrors.auditRemarks}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : <div className="text-red-500">
                                            <Asterisk className="h-3 w-3" />
                                        </div>}
                                    </div>
                                    <div className="relative">
                                        <Textarea
                                            id="audit-remarks"
                                            placeholder="Enter audit remarks..."
                                            value={formData.auditRemarks}
                                            onChange={(e) => {
                                                handleFormDataUpdate({ auditRemarks: e.target.value });
                                            }}
                                            rows={2}
                                            className={cn(
                                                "text-xs p-0.5 transition-all duration-200 focus:ring-2 focus:ring-blue-200 max-h-[60px]",
                                                formErrors.auditRemarks &&
                                                !(formData.auditRemarks?.length >= 150) &&
                                                "border-red-500 focus:border-red-500",
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 min-w-[100px] pr-2 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                    <Label htmlFor="rating" className="text-xs font-medium">
                                        Quality Rating (0-100)
                                    </Label>
                                    {(formErrors.rating && !(formData.rating > 0 && formData.rating <= 100)) ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-red-500">
                                                    <Info className="h-3 w-3" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="bg-red-500 text-white">
                                                <p className="text-xs">
                                                    {!(formData.rating > 0) ? "Rating must be at least 1" : "Rating must not exceed 100"}
                                                    {/*  {formErrors.rating == "Rating must be a number" ? "Rating must be at least 1" : formErrors.rating} */}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ) : <div className="text-red-500">
                                        <Asterisk className="h-3 w-3" />
                                    </div>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Input
                                            id="rating"
                                            type="string"
                                            // min={0}
                                            // max={100}
                                            placeholder="0"
                                            step={1}
                                            value={`${formData.rating || ""}`}
                                            onChange={(e) => {
                                                const value = Number.parseFloat(e.target.value);
                                                handleFormDataUpdate({ rating: value });
                                            }}
                                            className={cn(
                                                "h-8 text-xs transition-all placeholder:text-black duration-200 focus:ring-2 focus:ring-blue-200",
                                                (formErrors.rating && !(formData.rating > 0 && formData.rating <= 100)) && "border-red-500 focus:border-red-500",
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="w-full">
                        {/* Search and Filter Section */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
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
                    </div>


                    {isPending && (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                    )}


                    <div className="flex items-center justify-between gap-2">
                        <TabsComponent
                            countLoading={isCodeLoading}
                            tabs={tabs}
                            currentTab={currentTab}
                            handleTabChange={handleTabChange}
                        />
                    </div>
                    <div className="flex-1 min-h-0">

                        <div className="h-full space-y-2 pr-1 overflow-y-auto overflow-x-hidden" ref={codeCardScrollRef}>
                            {isCodeLoading ? (
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
                                <motion.div
                                    key={contentKey}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-2"
                                >
                                    {filteredItems.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.2,
                                                delay: Math.min(index * 0.02, 0.1),
                                            }}
                                        >
                                            <ConditionCommonCard
                                                status={item.status}
                                                expanded={expandedCard === item.id}
                                                onExpand={item.evidence.length > 230 ? () => setExpandedCard(expandedCard === item.id ? null : item.id) : undefined}
                                                icdCode={item.icdCode}
                                                hccV28Code={item.hccV28Code}
                                                hccCode={item.hccCode}
                                                icd10_desc={item.icd10_desc}
                                                diagnosis={item.diagnosis}
                                                description={item.description}
                                                evidence={item.evidence}
                                                query={item.query}
                                                V24HCC={item?.V24HCC}
                                                code_status={item?.code_status}
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
                                </motion.div>
                            )}


                            {/* Empty State */}
                            {(!isCodeLoading && filteredItems.length === 0 && !isPending) && (
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
                                        {(localSearchTerm || (!showRxHcc && !showHcc)) ?
                                            (localSearchTerm?.length > 0 ? "Try adjusting your filters" : "No codes available for review")
                                            : "No codes available for review"}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1">
                                <Label className="text-sm font-medium flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    Analyst Notes
                                </Label>
                                <Textarea
                                    placeholder="Analyst notes..."
                                    value={selectedDocument?.analystNote}
                                    onChange={(e) => handleAnalystNotesChange(e.target.value)}
                                    rows={2}
                                    disabled
                                    className="text-sm resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-200 min-h-[100px]"
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
    );
}
