"use client";

import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { exportFilteredTableToCSV } from "@/lib/export";

interface TasksTableToolbarActionsProps<TData> {
    table: Table<TData>
}

export function TasksTableToolbarActions<TData>({ table }: TasksTableToolbarActionsProps<TData>) {
    const pathname = usePathname();
    const fileName = pathname
        .split("/")
        .slice(-2)
        .map((s, i) => (i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s))
        .join("-");

    const handleExport = () => {
        const sortedAndFilteredRows = table.getRowModel().rows;

        const visibleColumns = table.getAllColumns().filter((column) => column.getIsVisible() && column.id !== "action");

        exportFilteredTableToCSV(sortedAndFilteredRows, visibleColumns, {
            filename: fileName,
            excludeColumns: ["select", "actions"],
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2 border-input-border dark:border-tabBg"
            >
                <Download className="size-4" aria-hidden="true" />
                Export
            </Button>
        </div>
    );
}

