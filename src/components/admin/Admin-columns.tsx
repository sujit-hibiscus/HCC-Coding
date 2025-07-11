"use client";

import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DOCUMENT_STATUS,
    type AssignedDocument,
    type AuditDocument,
    type CompletedDocument,
    type PendingDocument,
} from "@/store/slices/table-document-slice";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "./StatusBadge";
import { StatusFilter } from "./StatusHeader";
import { cn } from "@/lib/utils";
import { NumFilter, stringFilter } from "@/types/tableFilters";

const ASSIGNED_STATUSES = {
    PENDING: DOCUMENT_STATUS.PENDING,
    In_Review: DOCUMENT_STATUS.In_Review,
};

const AUDIT_STATUSES = {
    ON_HOLD: DOCUMENT_STATUS.ON_HOLD,
    COMPLETED: DOCUMENT_STATUS.COMPLETED,
};

// Pending Documents Columns
export const pendingDocumentColumns = (): (ColumnDef<PendingDocument> & { isDragable?: boolean })[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className=""
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="my-1.5"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        isDragable: false,
    },
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="ID" />,
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
        isDragable: false,
        filterFn: NumFilter
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "received",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Received" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("received")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "formattedSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => {
            const fileSizeRaw = row.getValue<string>("formattedSize");
            return <div className={cn(false ? "text-red-500 font-semibold" : "", "text-center")}>{fileSizeRaw}</div>;
        },
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Category" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("category")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },

];

// Assigned Documents Columns
export const assignedDocumentColumns = (): (ColumnDef<AssignedDocument> & { isDragable?: boolean })[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="my-1.5"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        isDragable: false,
    },
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="ID" />,
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
        isDragable: false,
        filterFn: NumFilter
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "received",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Received" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("received")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "formattedSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => {
            const fileSizeRaw = row.getValue<string>("formattedSize");
            return <div className={cn(false ? "font-semibold text-red-500" : "", "text-center")}>{fileSizeRaw}</div>;
        },
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },

    {
        accessorKey: "assignedTo",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Assigned To" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("assignedTo")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "assignedDate",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Assigned Date" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("assignedDate")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Category" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("category")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "status",
        header: ({ column }) => <StatusFilter column={column} title="Status" statusEnum={ASSIGNED_STATUSES} />,
        cell: ({ row }) => (
            <div className="text-center">
                <StatusBadge status={row.getValue("status")} />
            </div>
        ),
        enableSorting: true,
        isDragable: false,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
];

// Audit Documents Columns
export const auditDocumentColumns = (): (ColumnDef<AuditDocument> & { isDragable?: boolean })[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="my-1.5"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        isDragable: false,
    },
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="ID" />,
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
        isDragable: false,
        filterFn: NumFilter
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "received",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Received" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("received")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "formattedSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => {
            const fileSizeRaw = row.getValue<string>("formattedSize"); // example: "1.2 MB"

            return <div className={cn(false ? "font-semibold text-red-500" : "", "text-center")}>{fileSizeRaw}</div>;
        },
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Category" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("category")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "analyst",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Analyst" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("analyst")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "auditor",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Auditor" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("auditor")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    /*  {
         accessorKey: "endDate",
         header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="End Date" />,
         cell: ({ row }) => <div className="text-center">{row.getValue("endDate")}</div>,
         enableSorting: true,
         isDragable: true,
     }, */
    {
        accessorKey: "status",
        header: ({ column }) => <StatusFilter column={column} title="Status" statusEnum={AUDIT_STATUSES} />,
        cell: ({ row }) => (
            <div className="text-center">
                <StatusBadge status={row.getValue("status")} />
            </div>
        ),
        enableSorting: true,
        isDragable: false,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
];

// Completed Documents Columns
export const completedDocumentColumns = (): (ColumnDef<CompletedDocument> & { isDragable?: boolean })[] => [
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="ID" />,
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
        isDragable: false,
        filterFn: NumFilter
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "auditor",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Auditor" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("auditor")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "received",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Received" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("received")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "Assign",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Assign" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("Assign")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "formattedSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => {
            const fileSizeRaw = row.getValue<string>("formattedSize");
            return <div className={cn(false ? "font-semibold text-red-500" : "", "text-center")}>{fileSizeRaw}</div>;
        },
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Category" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("category")}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "endDate",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="End Date" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("endDate")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "age",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Age" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("age") || "N/A"}</div>,
        enableSorting: true,
        isDragable: true,
        filterFn: stringFilter
    },
    {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => (
            <div>
                <StatusBadge status={row.getValue("status")} />
            </div>
        ),
        enableSorting: true,
        isDragable: false,
    },
];
