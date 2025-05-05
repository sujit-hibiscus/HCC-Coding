"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { Loader } from "@/components/ui/Loader";
import { useRedux } from "@/hooks/use-redux";
import { ChartTab } from "@/lib/types/chartsTypes";
import { fetchPendingDocuments } from "@/store/slices/table-document-slice";
import { parse } from "date-fns";
import { pendingDocumentColumns } from "./Admin-columns";
import AssignmentControls from "./Assignment-controls";

export default function PendingDocumentsTable() {
    const { selector, dispatch } = useRedux();
    const { pendingDocuments } = selector((state) => state.documentTable);
    const { userType = "" } = selector((state) => state.user);

    const sortedDocuments = [...pendingDocuments.data].sort((a, b) => {
        const dateA = parse(a.received, "MM-dd-yyyy", new Date());
        const dateB = parse(b.received, "MM-dd-yyyy", new Date());
        return dateB.getTime() - dateA.getTime();
    });


    const isLoading = pendingDocuments.status === "loading";

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
                        <AssignmentControls currentTab={ChartTab.Pending} userType={userType as string} />
                    </div>
                    <DataTable
                        columns={pendingDocumentColumns()}
                        data={sortedDocuments}
                        dateKey="received"
                        onAction={() => { }}
                        defaultPageSize={20}
                        isRefreshing={isLoading}
                        handleRefresh={() => {
                            setTimeout(() => {
                                dispatch(fetchPendingDocuments());
                            });
                        }}
                    />
                </div>
            )}
        </div>
    );
}
