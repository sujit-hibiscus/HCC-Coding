"use client"

import { DataTable } from "@/components/common/data-table/data-table"
import { Loader } from "@/components/ui/Loader"
import { useRedux } from "@/hooks/use-redux"
import { fetchAuditDocuments, setSelectedDocuments } from "@/store/slices/table-document-slice"
import { useEffect } from "react"
import { auditDocumentColumns } from "./Admin-columns"

export default function AuditDocumentsTable() {
    const { selector, dispatch } = useRedux()
    const { auditDocuments } = selector((state) => state.documentTable)

    useEffect(() => {
        dispatch(fetchAuditDocuments())
    }, [dispatch])

    const handleRowSelectionChange = (selectedRowIds: string[]) => {
        dispatch(setSelectedDocuments({ tabKey: "audit", documentIds: selectedRowIds }))
    }

    const isLoading = auditDocuments.status === "loading"

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
                    columns={auditDocumentColumns()}
                    data={auditDocuments.data}
                    dateKey="received"
                    onAction={() => { }}
                    defaultPageSize={20}
                    isRefreshing={isLoading}
                    handleRefresh={() => { }}
                // handleRefresh={() => dispatch(fetchAuditDocuments())}
                />
            )}
        </div>
    )
}
