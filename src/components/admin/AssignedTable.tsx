"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { Loader } from "@/components/ui/Loader";
import { useRedux } from "@/hooks/use-redux";
import { fetchAssignedDocuments } from "@/store/slices/table-document-slice";
import { useEffect } from "react";
import { assignedDocumentColumns } from "./Admin-columns";
import AssignmentControls from "./Assignment-controls";
import { analystsData, auditorsData, ChartTab } from "@/lib/types/chartsTypes";

export default function AssignedDocumentsTable() {
    const { selector, dispatch } = useRedux();
    const { assignedDocuments } = selector((state) => state.documentTable);
    const { userType = "" } = selector((state) => state.user);

    useEffect(() => {
        dispatch(fetchAssignedDocuments());
    }, [dispatch]);

    const isLoading = assignedDocuments.status === "loading";

    const tableLoader = (
        <div className="py-8 flex h-[85vh] flex-col items-center justify-center">
            <Loader variant="table" size="md" text="" className="mb-4" />
            <div className="w-full max-w-3xl">
                <Loader variant="skeleton" />
            </div>
        </div>
    );

    return (
        <div className="h-full relative">
            {isLoading ? (
                tableLoader
            ) : (
                <div className="flex  h-full flex-col gap-1">
                    <div className="flex justify-end pr-2">
                        <AssignmentControls currentTab={ChartTab.Assigned} userType={userType as string} analysts={analystsData} auditors={auditorsData} />
                    </div>

                    <DataTable
                        columns={assignedDocumentColumns()}
                        data={assignedDocuments.data}
                        dateKey="received"
                        onAction={() => { }}
                        defaultPageSize={20}
                        isRefreshing={isLoading}
                        handleRefresh={() => {
                            setTimeout(() => {
                                dispatch(fetchAssignedDocuments());
                            });
                        }}
                    />
                </div>
            )}
        </div>
    );
}
