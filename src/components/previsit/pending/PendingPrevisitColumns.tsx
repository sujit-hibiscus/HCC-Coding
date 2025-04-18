"use client";

import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PENDINGSTATUS, PrevisitDataTypes } from "@/lib/types/PrevisitTypes";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, RefreshCw, Upload } from "lucide-react";
import { StatusFilter } from "../AppointmentStatusHeaderFilter";
import { StatusBadge } from "../StatusBadge";
import { useTabs } from "@/hooks/use-tabs";
import { useApiCall } from "../ApiCall";
interface PrevisitActionHandlers {
    onManualUpload: (chartId: string) => void;
    onRetry: (chartId: string) => void;
    onViewLog: (chartId: string) => void;
}

export const PendingPrevisitColumns = (
    actionHandlers: PrevisitActionHandlers
): (ColumnDef<PrevisitDataTypes> & { isDragable?: boolean })[] => {
    const { addProfile } = useTabs();
    const { getProviderDetails } = useApiCall();
    const openProfile = (mID: string, provider: string) => {
        setTimeout(() => {
            getProviderDetails(provider, "member", mID);
        });
        addProfile({ provider, tabType: "profile", id: mID });
    };
    return [
        {
            isDragable: false,
            accessorKey: "chartId",
            header: ({ column }) => <DataTableColumnHeader searchType={"text"} column={column} title="Apt Id" />,
            cell: ({ row }) => {
                const chartId = row?.original?.chartId;
                return <div className="min-w-[3rem] cursor-default truncate">{`${chartId?.split("_")[0]}...`}</div>;
            },
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            },
            sortingFn: (rowA, rowB, columnId) => {
                // Extract the numeric part before '_' and convert to number for proper numeric sorting
                const valueA = rowA.getValue(columnId) as string;
                const valueB = rowB.getValue(columnId) as string;

                const numA = Number.parseInt(valueA.split("_")[0], 10);
                const numB = Number.parseInt(valueB.split("_")[0], 10);
                return numA - numB;
            },
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: "dos",
            header: ({ column }) => (
                <DataTableColumnHeader searchType="date" column={column} title="DOS" />
            ),
            cell: ({ row }) => (
                <div className="min-w-[5.25rem] cell-center max-w-[5.125rem] truncate capitalize">
                    {row.getValue("dos")}
                </div>
            ),
            isDragable: true,
        },
        {
            accessorKey: "memberId",
            header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Subscriber Id" />,
            cell: ({ row }) => (
                <div className="min-w-[5rem] max-w-[8rem] truncate">
                    <span className="capitalize">{row.getValue("memberId")}</span>
                </div>
            ),
            isDragable: true,
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            },
            sortingFn: (rowA, rowB, memberId) => {
                const valueA = rowA.getValue(memberId) as string;
                const valueB = rowB.getValue(memberId) as string;

                const numA = Number.parseInt(valueA.split("_")[0], 10);
                const numB = Number.parseInt(valueB.split("_")[0], 10);
                return numA - numB;
            },
        },
        {
            accessorKey: "Name",
            header: ({ column }) => (
                <DataTableColumnHeader searchType="text" column={column} title="Name" />
            ),
            cell: ({ row }) => {
                const firstName = row?.original?.firstName || "";
                const lastName = row?.original?.lastName || "";
                const fullName = `${firstName} ${lastName}`.trim();
                const memberId = `${"mID" in row?.original ? row?.original?.mID : row.getValue("chartId")}` || "";
                const id = memberId ? memberId : row.getValue("chartId") as string;

                return (
                    <div onClick={() => openProfile(id, fullName)} className="min-w-[5rem] hover:underline !text-start text-selectedText w-full cursor-pointer font-medium truncate">
                        {fullName}
                    </div>
                );
            },
            isDragable: true,
            filterFn: (row, id, value) => {
                const firstName = String(row.original.firstName || "").toLowerCase();
                const lastName = String(row.original.lastName || "").toLowerCase();
                const fullName = `${firstName} ${lastName}`.trim();
                const filterValue = String(value)?.trim().toLowerCase();

                return fullName.includes(filterValue);
            },
            sortingFn: (rowA, rowB) => {
                const rowAName = `${rowA.original.firstName} ${rowA.original.lastName}`.trim();
                const rowBName = `${rowB.original.firstName} ${rowB.original.lastName}`.trim();

                return rowAName.localeCompare(rowBName);
            }
        },
        {
            accessorKey: "dob",
            header: ({ column }) => (
                <DataTableColumnHeader searchType={"date"} column={column} title="DOB" />
            ),
            cell: ({ row }) => (
                <div className="min-w-[4.25rem] truncate">
                    <span className="capitalize"> {row.getValue("dob")}</span>
                </div>
            ),
            filterFn: (row, id, value) => {
                const targetDate = row.original.dob;
                return value === targetDate;
            },
            isDragable: true,
        },
        {
            accessorKey: "pcp",
            header: ({ column }) => (
                <DataTableColumnHeader searchType={"text"} column={column} title="Provider" />
            ),
            cell: ({ row }) => (
                <div className="min-w-[6.375rem] !text-start truncate">
                    <span className="capitalize"> {row.getValue("pcp")}</span>
                </div>
            ),
            isDragable: true,
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            }
        },
        {
            accessorKey: "facility",
            header: ({ column }) => (
                <DataTableColumnHeader searchType={"text"} column={column} title="Facility" />
            ),
            cell: ({ row }) => (
                <div className="min-w-[13.125rem] !text-start truncate">
                    <span className="capitalize"> {row.getValue("facility")}</span>
                </div>
            ),
            isDragable: true,
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            }
        },
        {
            accessorKey: "insurance",
            header: ({ column }) => (
                <DataTableColumnHeader searchType={"text"} column={column} title="Payor" />
            ),
            cell: ({ row }) => (
                <div className="min-w-[10rem] !text-start max-w-full truncate">
                    <span className="capitalize"> {row.getValue("insurance")}</span>
                </div>
            ),
            isDragable: true,
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            }
        },

        {
            accessorKey: "status",
            header: ({ column }) => (
                <StatusFilter column={column} title="Status" statusEnum={PENDINGSTATUS} />
            ),
            cell: ({ row }) => (
                <div className="min-w-[4.25rem] max-w-[6rem] whitespace-nowrap">
                    <StatusBadge status={row.getValue("status")} />
                </div>
            ),
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
            isDragable: true,
        },
        {
            accessorKey: "assignTo",
            header: ({ column }) => (
                <DataTableColumnHeader className="max-w-[6.9rem]" searchType={"text"} column={column} title="Assign To" />
            ),
            cell: ({ row }) => (
                <div className="min-w-[5rem] !text-start  truncate">
                    <span className="capitalize"> {row.getValue("assignTo")}</span>
                </div>
            ),
            isDragable: true,
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            }
        },
        {
            accessorKey: "action",
            enableSorting: false,
            enableHiding: true,
            isDragable: false,
            header: () => (
                <div className=" w-full flex justify-center">
                    <button>Action</button>
                    {/* <DataTableColumnHeader column={column} title="Action" /> */}
                </div>
            ),
            cell: ({ row }) => {
                const chartId = row?.original?.chartId;
                const status = row?.original?.status;
                return (
                    <div className="flex items-center justify-end  min-w-[2.5rem]">
                        {status === PENDINGSTATUS?.ERROR && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-selectedText  hover:text-tabBg "
                                            onClick={() => actionHandlers.onManualUpload(chartId)}
                                        >
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Manual Document Upload</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {status === PENDINGSTATUS?.ERROR && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-selectedText  hover:text-tabBg "
                                            onClick={() => actionHandlers.onRetry(chartId)}
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Retry</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-selectedText  hover:text-tabBg "
                                        onClick={() => actionHandlers.onViewLog(chartId)}
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View Log</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            },
        },
    ];
};