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

const ASSIGNED_STATUSES = {
    PENDING: DOCUMENT_STATUS.PENDING,
    IN_PROGRESS: DOCUMENT_STATUS.IN_PROGRESS,
    ON_HOLD: DOCUMENT_STATUS.ON_HOLD,
};

const AUDIT_STATUSES = {
    PENDING: DOCUMENT_STATUS.PENDING,
    IN_PROGRESS: DOCUMENT_STATUS.IN_PROGRESS,
    ON_HOLD: DOCUMENT_STATUS.ON_HOLD,
    COMPLETED: DOCUMENT_STATUS.COMPLETED,
    CLOSED: DOCUMENT_STATUS.ERROR,
};

// Pending Documents Columns
export const pendingDocumentColumns = (): (ColumnDef<PendingDocument> & { isDragable?: boolean })[] => [
    // export const pendingDocumentColumns = (): ColumnDef<PendingDocument>[] => [
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
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="SL #" />,
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
        isDragable: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "received",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Received" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("received")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "fileSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => {
            const fileSizeRaw = row.getValue<string>("fileSize"); // example: "1.2 MB"
            const fileSizeNumber = Number.parseFloat(fileSizeRaw); // extracts 1.2
            const isLargeFile = fileSizeNumber > 500;

            return <div className={cn(isLargeFile ? "text-red-500 font-semibold" : "", "text-center")}>{fileSizeRaw}</div>;
        },
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Category" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("category")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    /* {
        accessorKey: "action",
        header: () => <div className="text-center">Action</div>,
        cell: () => <div className="text-start">Assign</div>,
        enableSorting: false,
        isDragable: false,
    }, */
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
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="SL #" />,
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
        isDragable: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "received",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Received" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("received")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "fileSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => {
            const fileSizeRaw = row.getValue<string>("fileSize"); // example: "1.2 MB"
            const fileSizeNumber = Number.parseFloat(fileSizeRaw); // extracts 1.2
            const isLargeFile = fileSizeNumber > 500;

            return <div className={cn(isLargeFile ? "font-semibold text-red-500" : "", "text-center")}>{fileSizeRaw}</div>;
        },
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "assignedTo",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Assigned To" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("assignedTo")}</div>,
        enableSorting: true,
        isDragable: true,
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
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="SL #" />,
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
        isDragable: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "received",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Received" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("received")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "fileSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => {
            const fileSizeRaw = row.getValue<string>("fileSize"); // example: "1.2 MB"
            const fileSizeNumber = Number.parseFloat(fileSizeRaw); // extracts 1.2
            const isLargeFile = fileSizeNumber > 500;

            return <div className={cn(isLargeFile ? "font-semibold text-red-500" : "", "text-center")}>{fileSizeRaw}</div>;
        },
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Category" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("category")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "analyst",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Analyst" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("analyst")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "auditor",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Auditor" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("auditor")}</div>,
        enableSorting: true,
        isDragable: true,
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
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="SL #" />,
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
        isDragable: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "auditor",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Auditor" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("auditor")}</div>,
        enableSorting: true,
        isDragable: true,
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
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Assign" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("Assign")}</div>,
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "fileSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => {
            const fileSizeRaw = row.getValue<string>("fileSize"); // example: "1.2 MB"
            const fileSizeNumber = Number.parseFloat(fileSizeRaw); // extracts 1.2
            const isLargeFile = fileSizeNumber > 500;

            return <div className={cn(isLargeFile ? "font-semibold text-red-500" : "", "text-center")}>{fileSizeRaw}</div>;
        },
        enableSorting: true,
        isDragable: true,
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Category" />,
        cell: ({ row }) => <div className="text-center">{row.getValue("category")}</div>,
        enableSorting: true,
        isDragable: true,
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
