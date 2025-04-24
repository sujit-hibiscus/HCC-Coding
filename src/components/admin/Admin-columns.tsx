"use client"

import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DOCUMENT_STATUS,
    type PendingDocument,
    type AssignedDocument,
    type AuditDocument,
} from "@/store/slices/table-document-slice"
import type { ColumnDef } from "@tanstack/react-table"
import { StatusFilter } from "./StatusHeader"
import { StatusBadge } from "./StatusBadge"

// Status enums for filtering
const PENDING_STATUSES = {
    PENDING: DOCUMENT_STATUS.PENDING,
    IN_PROGRESS: DOCUMENT_STATUS.IN_PROGRESS,
    ON_HOLD: DOCUMENT_STATUS.ON_HOLD,
}

const ASSIGNED_STATUSES = {
    PENDING: DOCUMENT_STATUS.PENDING,
    IN_PROGRESS: DOCUMENT_STATUS.IN_PROGRESS,
    ON_HOLD: DOCUMENT_STATUS.ON_HOLD,
}

const AUDIT_STATUSES = {
    PENDING: DOCUMENT_STATUS.PENDING,
    IN_PROGRESS: DOCUMENT_STATUS.IN_PROGRESS,
    ON_HOLD: DOCUMENT_STATUS.ON_HOLD,
    COMPLETED: DOCUMENT_STATUS.COMPLETED,
}

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
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,

    },
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="SL #" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div>{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "received",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Received" />,
        cell: ({ row }) => <div>{row.getValue("received")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "fileSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => <div>{row.getValue("fileSize")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Category" />,
        cell: ({ row }) => <div>{row.getValue("category")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "action",
        header: () => <div className="text-center">Action</div>,
        cell: () => <div className="text-center">Assign</div>,
        enableSorting: false,
    },
]

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
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="SL #" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
        isDragable: true
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div>{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "received",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Received" />,
        cell: ({ row }) => <div>{row.getValue("received")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "fileSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => <div>{row.getValue("fileSize")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "assignedTo",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Assigned To" />,
        cell: ({ row }) => <div>{row.getValue("assignedTo")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Category" />,
        cell: ({ row }) => <div>{row.getValue("category")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "status",
        header: ({ column }) => <StatusFilter column={column} title="Status" statusEnum={ASSIGNED_STATUSES} />,
        cell: ({ row }) => (
            <div>
                <StatusBadge status={row.getValue("status")} />
            </div>
        ),
        enableSorting: true,
    },
]

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
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="SL #" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
        enableSorting: true,
        enableHiding: false,
        isDragable: true
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Title" />,
        cell: ({ row }) => <div>{row.getValue("title")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "received",
        header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="Received" />,
        cell: ({ row }) => <div>{row.getValue("received")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "fileSize",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="File Size" />,
        cell: ({ row }) => <div>{row.getValue("fileSize")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "category",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Category" />,
        cell: ({ row }) => <div>{row.getValue("category")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "analyst",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Analyst" />,
        cell: ({ row }) => <div>{row.getValue("analyst")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "auditor",
        header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Auditor" />,
        cell: ({ row }) => <div>{row.getValue("auditor")}</div>,
        enableSorting: true,
        isDragable: true
    },
    {
        accessorKey: "status",
        header: ({ column }) => <StatusFilter column={column} title="Status" statusEnum={AUDIT_STATUSES} />,
        cell: ({ row }) => (
            <div>
                <StatusBadge status={row.getValue("status")} />
            </div>
        ),
        enableSorting: true,
    },
]
