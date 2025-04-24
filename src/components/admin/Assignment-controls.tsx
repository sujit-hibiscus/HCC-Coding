"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useFullPath from "@/hooks/use-fullpath"
import { useRedux } from "@/hooks/use-redux"
import { ChartTab } from "@/lib/types/chartsTypes"
import {
    assignPendingDocuments,
    assignToAuditor,
    changeAssignment,
    setSelectedAnalyst,
    setSelectedAuditor,
} from "@/store/slices/table-document-slice"
import { setSelectedRows } from "@/store/slices/tableFiltersSlice"
import { X } from "lucide-react"
import { useEffect } from "react"

interface AssignmentControlsProps {
    currentTab: string
    userType: string
    analysts: { id: string; name: string }[]
    auditors: { id: string; name: string }[]
}

export default function AssignmentControls({ currentTab, userType, analysts, auditors }: AssignmentControlsProps) {
    const { selector, dispatch } = useRedux();
    const { charts = "", target = "" } = useFullPath()
    const tabKey = `${charts}${target}`

    const { selectedAnalyst, selectedAuditor, selectedDocuments, isAssigning } = selector((state) => state.documentTable)

    const getSelectedDocuments = () => {
        if (!selectedDocuments) return []

        switch (currentTab) {
            case ChartTab.Pending:
                return selectedDocuments.pending || []
            case ChartTab.Assigned:
                return selectedDocuments.assigned || []
            case ChartTab.Audit:
                return selectedDocuments.audit || []
            default:
                return []
        }
    }

    const selectedDocumentIds = getSelectedDocuments()
    const hasSelectedDocuments = Array.isArray(selectedDocumentIds) && selectedDocumentIds.length > 0

    useEffect(() => {
        const selectedDocumentIds = getSelectedDocuments()
        const currentAssignee = currentTab === ChartTab.Audit ? selectedAuditor : selectedAnalyst

        const isEnabled =
            Boolean(currentAssignee) && Array.isArray(selectedDocumentIds) && selectedDocumentIds.length > 0 && !isAssigning


        console.log("Assignment state updated:", {
            currentTab,
            hasSelectedDocuments: Array.isArray(selectedDocumentIds) && selectedDocumentIds.length > 0,
            documentCount: selectedDocumentIds.length,
            currentAssignee,
            isAssigning,
            isEnabled,
            selectedDocuments,
        })
    }, [currentTab, selectedAnalyst, selectedAuditor, selectedDocuments, isAssigning])

    const handleAssign = () => {
        const selectedDocumentIds = getSelectedDocuments()
        if (!selectedDocumentIds || selectedDocumentIds.length === 0) {
            return
        }

        const currentAssignee = currentTab === ChartTab.Audit ? selectedAuditor : selectedAnalyst
        const hasSelectedDocs = Array.isArray(selectedDocumentIds) && selectedDocumentIds.length > 0

        if (!currentAssignee || !hasSelectedDocs || isAssigning) {
            return
        }

        if (currentTab === ChartTab.Pending && selectedAnalyst) {
            dispatch(
                assignPendingDocuments({
                    documentIds: selectedDocumentIds,
                    analystId: selectedAnalyst,
                }),
            ).then(() => {
                clearSelectedValue();
                dispatch(
                    setSelectedRows({
                        tabKey,
                        selectedRows: [],
                    }),
                )
            })
        } else if (currentTab === ChartTab.Assigned && selectedAnalyst) {
            dispatch(
                changeAssignment({
                    documentIds: selectedDocumentIds,
                    assigneeId: selectedAnalyst,
                }),
            )
        } else if (currentTab === ChartTab.Audit && selectedAuditor) {
            dispatch(
                assignToAuditor({
                    documentIds: selectedDocumentIds,
                    auditorId: selectedAuditor,
                }),
            )
        }
    }

    if (userType === "Provider") return null

    let options: { id: string; name: string }[] = []
    let placeholder = ""
    let buttonText = ""
    let selectedValue = ""
    let setSelectedValue: (value: string) => void = () => { }
    let clearSelectedValue: () => void = () => { }

    if (currentTab === ChartTab.Pending) {
        options = analysts
        placeholder = "Drop down (analysts)"
        buttonText = "Assign"
        selectedValue = selectedAnalyst || ""
        setSelectedValue = (value) => dispatch(setSelectedAnalyst(value))
        clearSelectedValue = () => dispatch(setSelectedAnalyst(""))
    } else if (currentTab === ChartTab.Assigned) {
        options = analysts
        placeholder = "Drop down (analysts)"
        buttonText = "Change Assignment"
        selectedValue = selectedAnalyst || ""
        setSelectedValue = (value) => dispatch(setSelectedAnalyst(value))
        clearSelectedValue = () => dispatch(setSelectedAnalyst(""))
    } else if (currentTab === ChartTab.Audit) {
        options = auditors
        placeholder = "Drop down (Auditors)"
        buttonText = "Change Assignment"
        selectedValue = selectedAuditor || ""
        setSelectedValue = (value) => dispatch(setSelectedAuditor(value))
        clearSelectedValue = () => dispatch(setSelectedAuditor(""))
    }

    const shouldEnableButton = Boolean(
        (currentTab === ChartTab.Audit ? selectedAuditor : selectedAnalyst) && hasSelectedDocuments && !isAssigning,
    )

    return (
        <div className="flex items-center gap-4 ml-auto">
            <div className="relative w-[250px]">
                <Select value={selectedValue} onValueChange={setSelectedValue}>
                    <SelectTrigger className="w-full pr-8">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedValue && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            clearSelectedValue()
                        }}
                        className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
                        aria-label="Clear selection"
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                )}
            </div>
            <Button onClick={handleAssign} disabled={!shouldEnableButton} className={shouldEnableButton ? "" : "opacity-70"}>
                {isAssigning ? "Processing..." : buttonText}
            </Button>

        </div>
    )
}
