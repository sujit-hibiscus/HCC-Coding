"use client"

import { DataTable } from "@/components/common/data-table/data-table"
import { Loader } from "@/components/ui/Loader"
import { useRedux } from "@/hooks/use-redux"
import { fetchAssignedDocuments, setSelectedDocuments } from "@/store/slices/table-document-slice"
import { useEffect } from "react"
import { assignedDocumentColumns } from "./Admin-columns"

export default function AssignedDocumentsTable() {
    const { selector, dispatch } = useRedux()
    const { assignedDocuments } = selector((state) => state.documentTable)

    useEffect(() => {
        dispatch(fetchAssignedDocuments())
    }, [dispatch])

    const handleRowSelectionChange = (selectedRowIds: string[]) => {
        dispatch(setSelectedDocuments({ tabKey: "assigned", documentIds: selectedRowIds }))
    }

    const isLoading = assignedDocuments.status === "loading"

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
                    columns={assignedDocumentColumns()}
                    data={assignedDocuments.data}
                    dateKey="received"
                    onAction={() => { }}
                    defaultPageSize={20}
                    isRefreshing={isLoading}
                    // handleRefresh={() => dispatch(fetchAssignedDocuments())}
                    handleRefresh={() => { }}
                />
            )}
        </div>
    )
}
