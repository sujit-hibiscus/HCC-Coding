"use client";

import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type DraftDataTypes, DRAFTSTATUS } from "@/lib/types/PrevisitTypes";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Upload, X } from "lucide-react";
import { StatusFilter } from "../AppointmentStatusHeaderFilter";
import { StatusBadge } from "../StatusBadge";
import { useTabs } from "@/hooks/use-tabs";
import { useApiCall } from "../ApiCall";

interface PrevisitActionHandlers {
    onManualUpload: (chartId: string) => void
    onViewLog: (chartId: string) => void
    onArchive: (chartId: string) => void
}

export const DraftPrevisitColumns = (
    actionHandlers: PrevisitActionHandlers,
): (ColumnDef<DraftDataTypes> & { isDragable?: boolean })[] => {
    const { addProfile, addChartId } = useTabs();
    const { getProviderDetails } = useApiCall();
    const openProfile = (mID: string, provider: string) => {
        setTimeout(() => {
            getProviderDetails(provider, "member", mID);
        });
        addProfile({ provider, tabType: "profile", id: mID });
    };

    const handleAddTab = (chartId: string) => {
        const stringChartId = `${chartId}`;
        setTimeout(() => {
            getProviderDetails(stringChartId, "chart");
        });
        addChartId({ chartId: stringChartId, chartType: "review" });
    };
    return [
        {
            isDragable: false,
            accessorKey: "chartId",
            header: ({ column }) => (
                <DataTableColumnHeader searchType={"text"} column={column} title="Chart Id" />
            ),
            cell: ({ row }) => (
                <button onClick={() => handleAddTab(row.getValue("chartId"))} className="min-w-[5rem] hover:underline hover:text-selectedText font-bold truncate">
                    {row.getValue("chartId")}
                </button>
            ),
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
            accessorKey: "appointmentId",
            header: ({ column }) => (
                <DataTableColumnHeader searchType={"text"} column={column} title="Apt Id" />
            ),
            cell: ({ row }) => {
                const chartId = row?.original?.appId;
                return (
                    <div className="min-w-[3rem] cursor-default truncate">
                        {`${chartId?.toString().slice(0, 9)}...`}
                    </div>
                );
            },
            enableSorting: true,
            enableHiding: false,
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            }
        },
        {
            accessorKey: "dos",
            header: ({ column }) => <DataTableColumnHeader searchType="date" column={column} title="DOS" />,
            cell: ({ row }) => (
                <div className="min-w-[5.25rem] cell-center max-w-[5.125rem] truncate capitalize">{row.getValue("dos")}</div>
            ),
            isDragable: true,
        },
        {
            accessorKey: "memberId",
            header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Subscriber Id" />,
            cell: ({ row }) => (
                <div className="min-w-[5rem] max-w-[6rem] truncate">
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
            header: ({ column }) => <DataTableColumnHeader searchType="text" column={column} title="Name" />,
            cell: ({ row }) => {
                const firstName = row?.original?.firstName || "";
                const lastName = row?.original?.lastName || "";
                const fullName = `${firstName} ${lastName}`.trim();
                const memberId = `${row?.original?.mID}` || "";
                const id = memberId ? memberId : (row.getValue("chartId") as string);
                return (
                    <div
                        onClick={() => openProfile(id, fullName)}
                        className="min-w-[5rem] !text-start hover:underline text-selectedText w-full cursor-pointer font-medium truncate"
                    >
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
            header: ({ column }) => <DataTableColumnHeader searchType={"date"} column={column} title="DOB" />,
            cell: ({ row }) => (
                <div className="min-w-[4.25rem] truncate">
                    <span className="capitalize"> {row.getValue("dob")}</span>
                </div>
            ),
            isDragable: true,
        },
        {
            accessorKey: "pcp",
            header: ({ column }) => <DataTableColumnHeader searchType={"text"} column={column} title="Provider" />,
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
            },
        },
        {
            accessorKey: "facility",
            header: ({ column }) => <DataTableColumnHeader searchType={"text"} column={column} title="Facility" />,
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
            },
        },
        {
            accessorKey: "insurance",
            header: ({ column }) => <DataTableColumnHeader searchType={"text"} column={column} title="Payor" />,
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
            },
        },

        /* custom status */
        {
            isDragable: true,
            accessorKey: "status",
            header: ({ column }) => <StatusFilter column={column} title="Status" statusEnum={DRAFTSTATUS} />,
            cell: ({ row }) => {
                return (
                    <div className="min-w-[4.25rem] max-w-[6rem] whitespace-nowrap">
                        <StatusBadge status={row.getValue("status")} />
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "assignTo",
            header: ({ column }) => <DataTableColumnHeader searchType={"text"} column={column} title="Assign To" />,
            cell: ({ row }) => (
                <div className="min-w-[4rem] !text-start truncate">
                    <span className="capitalize"> {row.getValue("assignTo")}</span>
                </div>
            ),
            isDragable: true,
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            },
        },
        /* custom action */
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
                    <div className="flex items-center justify-end gap-0.5  min-w-[2.5rem]">
                        {(
                            // {status === DRAFTSTATUS?.ERROR && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-selectedText  hover:text-tabBg  animate-smooth "
                                            onClick={() => actionHandlers.onManualUpload(chartId)}
                                        >
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Prepare manually</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {status === DRAFTSTATUS?.ERROR && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-red-700  text-red-600 hover:text-white  animate-smooth "
                                            onClick={() => actionHandlers.onArchive(chartId)}
                                        >
                                            <X className="h-4 w-4 " />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent variant="error">
                                        <p>Archive</p>
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
                                        className="hover:bg-selectedText  hover:text-tabBg  animate-smooth "
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
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
    ];
};

