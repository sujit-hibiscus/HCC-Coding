"use client"

import { DataTable } from "@/components/common/data-table/data-table"
import { Loader } from "@/components/ui/Loader"
import { useRedux } from "@/hooks/use-redux"
import { fetchPendingDocuments, setSelectedDocuments } from "@/store/slices/table-document-slice"
import { useEffect } from "react"
import { pendingDocumentColumns } from "./Admin-columns"

export default function PendingDocumentsTable() {
    const { selector, dispatch } = useRedux()
    const { pendingDocuments, selectedDocuments } = selector((state) => state.documentTable)

    useEffect(() => {
        dispatch(fetchPendingDocuments())
    }, [dispatch])

    const handleRowSelectionChange = (selectedRowIds: string[]) => {
        dispatch(setSelectedDocuments({ tabKey: "pending", documentIds: selectedRowIds }))
    }

    const isLoading = pendingDocuments.status === "loading"

    const tableLoader = (
        <div className="py-8 flex h-[85vh] flex-col items-center justify-center">
            <Loader variant="table" size="md" text="" className="mb-4" />
            <div className="w-full max-w-3xl">
                <Loader variant="skeleton" />
            </div>
        </div>
    )

    return (
        <div className="h-full relative">
            {isLoading ? (
                tableLoader
            ) : (
                <DataTable
                    columns={pendingDocumentColumns()}
                    data={pendingDocuments.data}
                    dateKey="received"
                    onAction={() => { }}
                    defaultPageSize={20}
                    isRefreshing={isLoading}
                    handleRefresh={() => { }}
                // handleRefresh={() => dispatch(fetchPendingDocuments())}
                />
            )}
        </div>
    )
}
