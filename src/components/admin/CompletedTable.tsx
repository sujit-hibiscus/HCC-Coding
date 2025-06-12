"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { Loader } from "@/components/ui/Loader";
import { useRedux } from "@/hooks/use-redux";
import { fetchCompletedDocuments } from "@/store/slices/table-document-slice";
import { parse } from "date-fns";
import { completedDocumentColumns } from "./Admin-columns";

export default function CompletedDocumentsTable() {
    const { selector, dispatch } = useRedux();
    const { completedDocuments } = selector((state) => state.documentTable);

    const sortedDocuments = [...completedDocuments.data].sort((a, b) => {
        const dateA = parse(a.received, "MM-dd-yyyy", new Date());
        const dateB = parse(b.received, "MM-dd-yyyy", new Date());
        return dateB.getTime() - dateA.getTime();
    });

    const isLoading = completedDocuments.status === "loading";

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
                <div className="flex h-full flex-col gap-1">
                    <DataTable
                        columns={completedDocumentColumns()}
                        data={sortedDocuments}
                        dateKey="received"
                        onAction={() => { }}
                        defaultPageSize={25}
                        isRefreshing={isLoading}
                        handleRefresh={() => {
                            setTimeout(() => {
                                dispatch(fetchCompletedDocuments());
                            });
                        }}
                    />
                </div>
            )}
        </div>
    );
}
