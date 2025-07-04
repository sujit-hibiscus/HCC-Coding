"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useFullPath from "@/hooks/use-fullpath";
import { useRedux } from "@/hooks/use-redux";
import { ChartTab } from "@/lib/types/chartsTypes";
import {
    assignPendingDocuments,
    assignToAuditor,
    changeAssignment,
    setSelectedAnalyst,
    setSelectedAuditor,
    setSelectedPendingAnalyst,
} from "@/store/slices/table-document-slice";
import { setSelectedRows } from "@/store/slices/tableFiltersSlice";
import { fetchChartCounts } from "@/store/slices/user-slice";
import { UserPlus, X } from "lucide-react";

interface AssignmentControlsProps {
    currentTab: string
    userType: string
}



export default function AssignmentControls({ currentTab, userType, }: AssignmentControlsProps) {
    const { selector, dispatch } = useRedux();
    const { charts = "", target = "" } = useFullPath();
    const tabKey = `${charts}${target}`;

    const { analystUsers: analysts = [], auditorUsers: auditors = [] } = selector(state => state.dashboard);
    const selectedUser = selector((state) => state.user.userId);
    const { selectedAnalyst, selectedPendingAnalyst, selectedAuditor, selectedDocumentsId: selectedDocuments, isAssigning } = selector((state) => state.documentTable);

    const getSelectedDocuments = () => {
        if (!selectedDocuments) return [];

        switch (currentTab) {
            case ChartTab.Pending:
                return selectedDocuments.pending || [];
            case ChartTab.Assigned:
                return selectedDocuments.assigned || [];
            case ChartTab.Audit:
                return selectedDocuments.audit || [];
            default:
                return [];
        }
    };

    const selectedDocumentIds = getSelectedDocuments();
    const hasSelectedDocuments = Array.isArray(selectedDocumentIds) && selectedDocumentIds.length > 0;

    const handleAssign = () => {
        if (!selectedDocumentIds || selectedDocumentIds.length === 0) {
            return;
        }

        const currentAssignee = currentTab === ChartTab.Audit ? selectedAuditor : currentTab === ChartTab.Pending ? selectedPendingAnalyst : selectedAnalyst;
        const hasSelectedDocs = Array.isArray(selectedDocumentIds) && selectedDocumentIds.length > 0;


        if (!currentAssignee || !hasSelectedDocs || isAssigning) {
            return;
        }

        if (currentTab === ChartTab.Pending && selectedPendingAnalyst) {
            dispatch(
                assignPendingDocuments({
                    documentIds: selectedDocumentIds,
                    analystId: currentAssignee,
                    "request_user_id": selectedUser,
                }),
            ).then(() => {
                clearSelectedValue();
                dispatch(
                    setSelectedRows({
                        tabKey,
                        selectedRows: [],
                    }),
                );
                dispatch(fetchChartCounts());

            });
        } else if (currentTab === ChartTab.Assigned && selectedAnalyst) {
            dispatch(
                changeAssignment({
                    documentIds: selectedDocumentIds,
                    analystId: currentAssignee,
                    "request_user_id": selectedUser,
                }),
            ).then(() => {
                clearSelectedValue();
                dispatch(
                    setSelectedRows({
                        tabKey,
                        selectedRows: [],
                    }),
                );
                dispatch(fetchChartCounts());
            });
        } else if (currentTab === ChartTab.Audit && selectedAuditor) {
            dispatch(
                assignToAuditor({
                    documentIds: selectedDocumentIds,
                    analystId: currentAssignee,
                    "request_user_id": selectedUser,
                }),
            ).then(() => {
                clearSelectedValue();
                dispatch(
                    setSelectedRows({
                        tabKey,
                        selectedRows: [],
                    }),
                );
            });
        }
    };

    if (userType === "Provider") return null;

    let options: { id: string | number; name: string }[] = [];
    let placeholder = "";
    let buttonText = "";
    let selectedValue = "";
    let setSelectedValue: (value: string) => void = () => { };
    let clearSelectedValue: () => void = () => { };

    if (currentTab === ChartTab.Pending) {
        options = analysts;
        placeholder = "Select analyst";
        buttonText = "Assign";
        selectedValue = selectedPendingAnalyst || "";
        setSelectedValue = (value) => dispatch(setSelectedPendingAnalyst(value));
        clearSelectedValue = () => dispatch(setSelectedPendingAnalyst(""));
    } else if (currentTab === ChartTab.Assigned) {
        options = analysts;
        placeholder = "Select analyst";
        buttonText = "Change Assignment";
        selectedValue = selectedAnalyst || "";
        setSelectedValue = (value) => dispatch(setSelectedAnalyst(value));
        clearSelectedValue = () => dispatch(setSelectedAnalyst(""));
    } else if (currentTab === ChartTab.Audit) {
        options = auditors;
        placeholder = "Select auditor";
        buttonText = "Change Assignment";
        selectedValue = selectedAuditor || "";
        setSelectedValue = (value) => dispatch(setSelectedAuditor(value));
        clearSelectedValue = () => dispatch(setSelectedAuditor(""));
    }

    const shouldEnableButton = Boolean(
        (currentTab === ChartTab.Audit ? selectedAuditor : currentTab === ChartTab?.Pending ? selectedPendingAnalyst : selectedAnalyst) && hasSelectedDocuments && !isAssigning,
    );

    return (
        <div className="flex items-center gap-4 ml-auto">
            <div className="relative w-[250px]">
                <Select
                    disabled={selectedDocumentIds.length === 0}
                    value={selectedValue} onValueChange={setSelectedValue}>
                    <SelectTrigger className="w-full rounded-sm pr-8">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options?.length > 0 ? options.map((option) => (
                            <SelectItem key={option.id} value={`${option.id}`}>
                                {option.name}
                            </SelectItem>
                        )) : <div className="flex items-center justify-center h-5 text-sm">
                            No {currentTab === ChartTab.Audit ? "auditors" : "analysts"} available
                        </div>}
                    </SelectContent>
                </Select>
                {selectedValue && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            clearSelectedValue();
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted"
                        aria-label="Clear selection"
                    >
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                )}
            </div>
            <Button onClick={handleAssign} disabled={!shouldEnableButton} className={shouldEnableButton ? "" : "opacity-70"}>
                <UserPlus />
                {isAssigning ? "Assigning..." : buttonText}
            </Button>
        </div>
    );
}
