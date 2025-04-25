"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatusFilter } from "@/components/admin/StatusHeader";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type UserTypes, USERTYPES } from "@/lib/types/chartsTypes";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";

interface ChartsActionHandlers {
    onDelete: (chartId: string) => void
    onEdit: (chartId: string) => void
}

export const UserTableColumns = (
    actionHandlers: ChartsActionHandlers,
): (ColumnDef<UserTypes> & { isDragable?: boolean })[] => {
    return [
        {
            isDragable: false,
            accessorKey: "id",
            header: ({ column }) => <DataTableColumnHeader searchType={"text"} column={column} title="ID" />,
            cell: ({ row }) => {
                const chartId = row?.original?.id;
                return <div className="min-w-[3rem] cursor-default truncate">{+chartId}</div>;
            },
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            },
            sortingFn: (rowA, rowB, columnId) => {
                const valueA = rowA.getValue(columnId) as number;
                const valueB = rowB.getValue(columnId) as number;

                return valueA - valueB;
            },
            enableSorting: true,
            enableHiding: false,
        },

        {
            accessorKey: "Fname",
            header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="First Name" />,
            cell: ({ row }) => {
                const firstName = row?.original?.Fname || "";
                const fullName = `${firstName}`.trim();
                return <div className="min-w-[5rem] w-full cursor-pointer truncate">{fullName}</div>;
            },
            filterFn: (row, id, value) => {
                const firstName = String(row.original.Fname || "").toLowerCase();

                const fullName = `${firstName}`.trim();
                const filterValue = String(value)?.trim().toLowerCase();

                return fullName.includes(filterValue);
            },
            sortingFn: (rowA, rowB) => {
                const rowAName = `${rowA.original.Fname}`.trim();
                const rowBName = `${rowB.original.Fname}`.trim();

                return rowAName.localeCompare(rowBName);
            },
        },
        {
            accessorKey: "Lname",
            header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Last Name" />,
            cell: ({ row }) => {
                const lastName = row?.original?.Lname || "";
                const fullName = `${lastName}`.trim();
                return <div className="min-w-[5rem] w-full cursor-pointer truncate">{fullName}</div>;
            },
            isDragable: true,
            filterFn: (row, id, value) => {
                const lastName = String(row.original.Lname || "").toLowerCase();

                const fullName = `${lastName}`.trim();
                const filterValue = String(value)?.trim().toLowerCase();

                return fullName.includes(filterValue);
            },
            sortingFn: (rowA, rowB) => {
                const rowAName = `${rowA.original.Lname}`.trim();
                const rowBName = `${rowB.original.Lname}`.trim();

                return rowAName.localeCompare(rowBName);
            },
        },
        {
            accessorKey: "email",
            header: ({ column }) => <DataTableColumnHeader searchType={"text"} column={column} title="Email" />,
            cell: ({ row }) => (
                <div className="min-w-[4.25rem] truncate">
                    <span className="lowercase"> {row.getValue("email")}</span>
                </div>
            ),
            isDragable: true,
        },
        /* custom status */
        {
            isDragable: true,
            accessorKey: "profile_type",
            header: ({ column }) => <StatusFilter column={column} title="User-Type" statusEnum={USERTYPES} />,
            cell: ({ row }) => {
                const status: USERTYPES = row.getValue("profile_type");
                return (
                    <div className="min-w-[4.25rem] max-w-[6rem] whitespace-nowrap">
                        <StatusBadge status={status} />
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "target",
            header: ({ column }) => <DataTableColumnHeader searchType={"text"} column={column} title="Target Details" />,
            cell: ({ row }) => {
                const target = row.original.target;
                const profile = row.getValue("profile_type") as string;
                const needsTarget = profile === "Analyst" || profile === "Auditor";

                if (!needsTarget) {
                    return (
                        <div className="min-w-[4.25rem] truncate">
                            <span className="text-muted-foreground text-xs">Not available</span>
                        </div>
                    );
                }

                if (!target) {
                    return (
                        <div className="min-w-[4.25rem] truncate">
                            <span className="text-amber-500 text-xs font-medium">No targets set</span>
                        </div>
                    );
                }
                return (
                    (<div className="flex justify-center">
                        <TooltipProvider>
                            <div className="flex items-center gap-3">
                                <PillValue
                                    current={target.dailyChartTarget || 0}
                                    label="Daily"
                                    color="bg-green-600"
                                />
                                <PillValue
                                    current={target.maxAssignments || 0}
                                    label="Max"
                                    color="bg-blue-600"
                                />
                            </div>
                        </TooltipProvider>
                    </div>
                    )
                );
            },
            isDragable: true,
        },
        {
            accessorKey: "action",
            enableSorting: false,
            enableHiding: true,
            isDragable: false,
            header: () => (
                <div className="w-full flex justify-center">
                    <button>Action</button>
                </div>
            ),
            cell: ({ row }) => {
                const chartId = row?.original?.id;

                return (
                    <div className="flex items-center justify-end gap-1 min-w-[5rem]">
                        <TooltipProvider>
                            {/* Edit */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-selectedText hover:text-tabBg animate-smooth"
                                        onClick={() => actionHandlers.onEdit(`${chartId}`)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Edit</p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Delete */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-red-500 hover:text-white animate-smooth"
                                        onClick={() => actionHandlers.onDelete(`${chartId}`)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
    ];
};

const PillValue = ({
    current,
    label,
    color = "bg-green-500",
}: {
    current: number;
    label: string;
    color?: string;
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    className={cn(
                        "relative w-20 h-7 rounded-sm flex  gap-2 justify-center items-center text-white text-xs font-semibold cursor-pointer",
                        color
                    )}
                >
                    <span className="text-sm tabular-nums">{current}</span>
                    <span className="text-[10px] ">{label}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent className="text-sm shadow-md p-2 rounded">
                <div><strong>{label}:</strong> {current}</div>
            </TooltipContent>
        </Tooltip>
    );
};