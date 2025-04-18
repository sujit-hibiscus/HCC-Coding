"use client";

import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTabs } from "@/hooks/use-tabs";
import { ReviewDataTypes, REVIEWSTATUS } from "@/lib/types/PrevisitTypes";
import { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import { StatusFilter } from "../AppointmentStatusHeaderFilter";
import { StatusBadge } from "../StatusBadge";
import { useApiCall } from "../ApiCall";

interface PrevisitActionHandlers {
    onViewLog: (chartId: string) => void;
}


export const ReviewPrevisitColumns = (
    actionHandlers: PrevisitActionHandlers
): (ColumnDef<ReviewDataTypes> & { isDragable?: boolean })[] => {
    const { addChartId, addProfile } = useTabs();
    const { getProviderDetails } = useApiCall();

    const handleAddTab = (chartId: string) => {
        const stringChartId = `${chartId}`;
        setTimeout(() => {
            getProviderDetails(stringChartId, "chart");
        });
        addChartId({ chartId: stringChartId, chartType: "review" });
    };

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
            header: ({ column }) => (
                <DataTableColumnHeader searchType="date" column={column} title="DOS" />
            ),
            cell: ({ row }) => (
                <div className="min-w-[4.5rem] max-w-[.5rem] truncate capitalize">
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
                    <div onClick={() => openProfile(id, fullName)} className="min-w-[7rem] hover:underline !text-start text-selectedText w-full cursor-pointer font-medium truncate">
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
            isDragable: true,
        },
        {
            accessorKey: "pcp",
            header: ({ column }) => (
                <DataTableColumnHeader searchType={"text"} column={column} title="Provider" />
            ),
            cell: ({ row }) => (
                <div className="min-w-[12.375rem] !text-start truncate">
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
            isDragable: true,
            accessorKey: "status",
            header: ({ column }) => (
                <StatusFilter column={column} title="Status" statusEnum={REVIEWSTATUS} />
            ),
            cell: ({ row }) => {
                const status: REVIEWSTATUS = row.getValue("status");

                return (

                    <div className="min-w-[6.25rem] max-w-[8.75rem] whitespace-nowrap">
                        <StatusBadge status={status} />
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            }
        },

        {
            accessorKey: "newSuggestion",
            isDragable: true,
            header: ({ column }) => (
                <DataTableColumnHeader searchType={"text"} column={column} title="New Suggestion" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="truncate w-[2.5rem] items-center">
                        <span className="capitalize"> {row.getValue("newSuggestion")}</span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            }

        },
        {
            accessorKey: "carryForward",
            isDragable: true,
            header: ({ column }) => (
                <DataTableColumnHeader searchType={"text"} column={column} title="Carry Forward" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="truncate w-[2.5rem] items-center">
                        <span className="capitalize"> {row.getValue("carryForward")}</span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                const rowValue = String(row.getValue(id)).toLowerCase();
                const filterValue = String(value)?.trim().toLowerCase();
                return rowValue.includes(filterValue);
            }
        },

        /* custom action */
        /* custom action */
        {
            enableSorting: false,
            enableHiding: true,
            accessorKey: "action",
            header: () => (
                <div className=" w-full flex justify-center">
                    <button>Action</button>
                    {/* <DataTableColumnHeader column={column} title="Action" /> */}
                </div>
            ),
            cell: ({ row }) => {
                const chartId = row?.original?.chartId;
                return (
                    <div className="flex max-w-[5rem] w-auto items-center justify-end gap-[2px]">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-selectedText hover:text-tabBg animate-smooth "
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
            }
        }
    ];
};