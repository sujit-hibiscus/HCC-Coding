"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { Loader } from "@/components/ui/Loader";
import { useRedux } from "@/hooks/use-redux";
import { fetchCompletedDocuments } from "@/store/slices/table-document-slice";
import { parse } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { completedDocumentColumns } from "./Admin-columns";

export default function CompletedDocumentsTable() {
    const { selector, dispatch } = useRedux();
    const { completedDocuments } = selector((state) => state.documentTable);
    const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

    const sortedDocuments = [...completedDocuments.data]
        .filter((doc) => !showUnassignedOnly || !doc.Assign)
        .sort((a, b) => {
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
            <motion.div
                className="flex items-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="unassigned-filter"
                        checked={showUnassignedOnly}
                        onCheckedChange={(checked) => setShowUnassignedOnly(!!checked)}
                    />
                    <Label
                        htmlFor="unassigned-filter"
                        className="text-sm select-none font-medium text-gray-700 dark:text-gray-300"
                    >
                        Show Unassigned Charts Only
                    </Label>
                </div>
            </motion.div>

            {
                sortedDocuments.length === 0 && showUnassignedOnly ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="py-8 text-center text-gray-500">No unassigned charts found</div>
                    </div>
                ) :
                    isLoading ? (
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
                    )
            }
        </div>
    );
}
