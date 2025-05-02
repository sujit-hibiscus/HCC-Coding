/* eslint-disable @typescript-eslint/no-require-imports */
"use client";

import { TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/Typography";
import useFullPath from "@/hooks/use-fullpath";
import { useRedux } from "@/hooks/use-redux";
import { setStoreColumnOrder } from "@/store/slices/DashboardSlice";
import { setSelectedRows, setTabFilters } from "@/store/slices/tableFiltersSlice";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { isWithinInterval } from "date-fns";
import * as React from "react";
import { useEffect, useState } from "react";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { SortableHeader } from "./sortable-header";
import { cn, EndDateFilter, StartDateFilter } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  dateKey: string
  onAction: (action: string, row: TData) => void
  defaultPageSize?: number
  isFloating?: boolean
  handleRefresh?: () => void | undefined
  isRefreshing: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  dateKey,
  onAction,
  isRefreshing,
  handleRefresh,
  isFloating = true,
  defaultPageSize = 20,
}: DataTableProps<TData, TValue>) {
  const { dispatch, selector } = useRedux();
  const { charts = "", target = "" } = useFullPath();
  const tabKey = `${charts}${target}`;
  const storedFilters = selector((state) => state.tableFilters[tabKey]);

  const initialRowSelection = React.useMemo(() => {
    if (storedFilters?.selectedRows && Array.isArray(storedFilters.selectedRows)) {
      return storedFilters.selectedRows.reduce((acc: Record<string, boolean>, id: string) => {
        acc[id] = true;
        return acc;
      }, {});
    }
    return {};
  }, [storedFilters?.selectedRows]);

  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>(initialRowSelection);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(storedFilters?.columnVisibility || {});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(storedFilters?.columnFilters || []);
  const [sorting, setSorting] = React.useState<SortingState>(storedFilters?.sorting || []);
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>(storedFilters?.dateRange || [StartDateFilter, EndDateFilter]);

  const { fullPath: urlKey = "default" } = useFullPath();
  const columnOrder = selector((state) => state.dashboard.columnOrders[urlKey || "default"]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (tabKey) {
      dispatch(
        setTabFilters({
          tabKey,
          filters: {
            columnFilters,
            sorting,
            columnVisibility,
            dateRange,
          },
        }),
      );
    }
  }, [columnFilters, sorting, columnVisibility, dateRange, tabKey, dispatch]);

  useEffect(() => {
    if (tabKey) {
      const selectedRowIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
      dispatch(
        setSelectedRows({
          tabKey,
          selectedRows: selectedRowIds,
        }),
      );

      if (tabKey.includes("pending") || tabKey.includes("assigned") || tabKey.includes("audit")) {
        const tabType = tabKey.includes("pending") ? "pending" : tabKey.includes("assigned") ? "assigned" : "audit";

        try {
          const { setSelectedDocuments } = require("@/store/slices/table-document-slice");
          dispatch(
            setSelectedDocuments({
              tabKey: tabType,
              documentIds: selectedRowIds,
            }),
          );
        } catch (error) {
          console.error("Error updating document selection:", error);
        }
      }
    }
  }, [rowSelection, tabKey, dispatch]);

  useEffect(() => {
    if (storedFilters?.selectedRows && Array.isArray(storedFilters.selectedRows)) {
      const newRowSelection = storedFilters.selectedRows.reduce((acc: Record<string, boolean>, id: string) => {
        acc[id] = true;
        return acc;
      }, {});

      if (JSON.stringify(newRowSelection) !== JSON.stringify(rowSelection)) {
        setRowSelection(newRowSelection);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedFilters?.selectedRows]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const allColumns = table.getAllLeafColumns();
    const activeColumn = allColumns.find((col) => col.id === active.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isDragEnable = (activeColumn?.columnDef as any).isDragable;
    const overColumn = allColumns.find((col) => col.id === over.id);

    if (!activeColumn || !overColumn) return;

    if (!isDragEnable) return;

    const oldIndex = allColumns.findIndex((col) => col.id === active.id);
    const newIndex = allColumns.findIndex((col) => col.id === over.id);

    const isMovingForward = newIndex > oldIndex;
    const columnsInBetween = allColumns.slice(
      isMovingForward ? oldIndex + 1 : newIndex,
      isMovingForward ? newIndex + 1 : oldIndex,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasNonDraggableInPath = columnsInBetween.some((col) => (col.columnDef as any).isDragable === false);
    if (hasNonDraggableInPath) return;

    if (!isDragEnable) return;

    const newColumnOrder = arrayMove(
      allColumns.map((col) => col.id),
      oldIndex,
      newIndex,
    );

    dispatch(setStoreColumnOrder({ key: urlKey, order: newColumnOrder }));
  };

  const [filteredData, setFilteredData] = useState<TData[]>(data);
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnOrder,
    },
    enableRowSelection: true,
    onRowSelectionChange: (updatedRowSelection) => {
      setRowSelection(updatedRowSelection);
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    // onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
  });

  const filterTableByDateRange = (range: [Date | null, Date | null]) => {
    if (!range[0] && !range[1]) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedItem = item as Record<string, any>;
      if (!typedItem || !typedItem[dateKey]) return false;

      try {
        const dateStr = typedItem[dateKey] as string;
        const [month, day, year] = dateStr.split("-").map(Number);

        if (!month || !day || !year) return false;

        const rowDate = new Date(year, month - 1, day);

        if (range[0] && range[1]) {
          return isWithinInterval(rowDate, { start: range[0], end: range[1] });
        }
      } catch (error) {
        console.error("Error parsing date:", error);
        return false;
      }

      return true;
    });
    setFilteredData(filtered);
  };

  useEffect(() => {
    if (dateKey && (dateRange[0] || dateRange[1])) {
      filterTableByDateRange(dateRange);
    } else {
      setFilteredData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dateKey, dateRange]);

  return (
    <div className="flex h-full flex-col space-y">
      {isFloating ? (
        <div className="xs:relative xs:top-0 xs:right-0 lg:fixed lg:top-[2.9rem] lg:right-3">
          <DataTableToolbar
            loading={isRefreshing}
            handleRefresh={handleRefresh}
            table={table}
            setSorting={setSorting}
            dateRange={dateRange}
            dateKey={dateKey}
            setDateRange={setDateRange}
          />
        </div>
      ) : (
        <DataTableToolbar
          loading={isRefreshing}
          handleRefresh={handleRefresh}
          table={table}
          dateRange={dateRange}
          dateKey={dateKey}
          setSorting={setSorting}
          setDateRange={setDateRange}
        />
      )}
      <div className="relative flex-1 min-h-0 border">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="absolute inset-0 flex flex-col border border-gray-300">
            <div className="flex-1 min-h-0 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              <table className="w-full text-sm border-collapse">
                <TableHeader className="sticky top-0 bg-primary text-background z-10">
                  <TableRow className="bg-primary text-background">
                    <SortableContext
                      items={table.getAllLeafColumns().map((col) => col.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {table
                        .getHeaderGroups()
                        .map((headerGroup) =>
                          headerGroup.headers.map((header) => <SortableHeader key={header.id} header={header} />),
                        )}
                    </SortableContext>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => {
                      const fileSizeRaw = row.getValue<string>("fileSize");
                      const fileSizeNumber = Number.parseFloat(fileSizeRaw);
                      const isLargeFile = fileSizeNumber > 500;
                      return (
                        <TableRow
                          key={row.id + index}
                          data-state={row.getIsSelected() && "selected"}
                          className={cn(`
                          hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-900
                          ${row.getIsSelected() ? "bg-gray-100 dark:bg-gray-800" : ""}
                        `, isLargeFile &&
                          `bg-[#fcff00]/50 hover:bg-[#fcff00]/80 dark:bg-[#fcff00] ${row.getIsSelected() ? "!bg-[#fcff00]" : ""
                          }`)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, {
                                ...cell.getContext(),
                                onAction: (action: string) => onAction(action, row.original),
                              })}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={table.getAllColumns().length} className="text-center h-[70vh]">
                        <Typography variant="card-title">No data available</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </table>
            </div>
          </div>
        </DndContext>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}

export default DataTable;
