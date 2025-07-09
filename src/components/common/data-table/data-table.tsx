"use client"

import { TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Typography } from "@/components/ui/Typography"
import useFullPath from "@/hooks/use-fullpath"
import { useRedux } from "@/hooks/use-redux"
import { cn, EndDateFilter, StartDateFilter } from "@/lib/utils"
import { setStoreColumnOrder } from "@/store/slices/DashboardSlice"
import { setSelectedDocuments } from "@/store/slices/table-document-slice"
import { setSelectedRows, setTabFilters, setTabPagination } from "@/store/slices/tableFiltersSlice"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
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
} from "@tanstack/react-table"
import { isWithinInterval, startOfDay } from "date-fns"
import * as React from "react"
import { useEffect, useState } from "react"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { DragMonitor } from "./drag-monitor"
import { SortableHeader } from "./sortable-header"

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
  defaultPageSize = 25,
}: DataTableProps<TData, TValue>) {
  const { dispatch, selector } = useRedux()
  const { charts = "", target = "" } = useFullPath()
  const tabKey = `${charts}${target}`
  const storedFilters = selector((state) => state.tableFilters[tabKey])
  const isHandlingFilterChange = React.useRef(false)

  const initialRowSelection = React.useMemo(() => {
    if (storedFilters?.selectedRows && Array.isArray(storedFilters.selectedRows)) {
      return storedFilters.selectedRows.reduce((acc: Record<string, boolean>, id: string) => {
        acc[id] = true
        return acc
      }, {})
    }
    return {}
  }, [storedFilters?.selectedRows])

  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>(initialRowSelection)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(storedFilters?.columnVisibility || {})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(storedFilters?.columnFilters || [])
  const [sorting, setSorting] = React.useState<SortingState>(storedFilters?.sorting || [])
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>(
    storedFilters?.dateRange || [StartDateFilter, EndDateFilter],
  )
  const [, setColumnOrder] = React.useState<string[]>(() =>
    columns.map((col) => (typeof col.id === "string" ? col.id : "")),
  )

  const { fullPath: urlKey = "default" } = useFullPath()
  const columnOrder = selector((state) => state.dashboard.columnOrders[urlKey || "default"])
  const { configuration } = selector(state => state.dashboard)
  const targetConfiguration = configuration?.find(i => i.key === "file-size-limit")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Restore filters on mount
  React.useEffect(() => {
    if (storedFilters) {
      if (storedFilters.columnFilters) {
        setColumnFilters(storedFilters.columnFilters)
      }
      if (storedFilters.sorting) {
        setSorting(storedFilters.sorting)
      }
      if (storedFilters.columnVisibility) {
        setColumnVisibility(storedFilters.columnVisibility)
      }
      if (storedFilters.dateRange) {
        setDateRange(storedFilters.dateRange)
      }
      if (storedFilters.columnOrder) {
        setColumnOrder(storedFilters.columnOrder)
      }
    }
  }, [storedFilters])

  // Persist filters on change
  React.useEffect(() => {
    if (tabKey && !isHandlingFilterChange.current) {
      const currentFilters = {
        columnFilters,
        sorting,
        columnVisibility,
        dateRange,
        pagination: storedFilters?.pagination || { pageIndex: 0, pageSize: defaultPageSize },
      };

      // Only dispatch if there are actual changes
      const hasChanges =
        JSON.stringify(currentFilters.columnFilters) !== JSON.stringify(storedFilters?.columnFilters) ||
        JSON.stringify(currentFilters.sorting) !== JSON.stringify(storedFilters?.sorting) ||
        JSON.stringify(currentFilters.columnVisibility) !== JSON.stringify(storedFilters?.columnVisibility) ||
        JSON.stringify(currentFilters.dateRange) !== JSON.stringify(storedFilters?.dateRange) ||
        JSON.stringify(currentFilters.pagination) !== JSON.stringify(storedFilters?.pagination);

      if (hasChanges) {
        dispatch(
          setTabFilters({
            tabKey,
            filters: currentFilters,
          }),
        );
      }
    }
  }, [columnFilters, sorting, columnVisibility, dateRange, tabKey, dispatch, storedFilters?.pagination, defaultPageSize]);

  // Add global styles for dragging
  React.useEffect(() => {
    // Add a style tag for cursor styles
    const styleTag = document.createElement("style")
    styleTag.innerHTML = `
      .cursor-grabbing {
        cursor: grabbing !important;
      }
      .cursor-grabbing * {
        cursor: grabbing !important;
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      
      .column-drag-preview {
        animation: pulse 1.5s infinite ease-in-out;
        background-color: var(--selected-text-color);
        color: var(--tab-bg-color);
        padding: 0.75rem;
        border-radius: 0.375rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        font-weight: 600;
        text-transform: capitalize;
      }
    `
    document.head.appendChild(styleTag)

    return () => {
      document.head.removeChild(styleTag)
    }
  }, [])

  useEffect(() => {
    if (storedFilters?.selectedRows && Array.isArray(storedFilters.selectedRows)) {
      const newRowSelection = storedFilters.selectedRows.reduce((acc: Record<string, boolean>, id: string) => {
        acc[id] = true
        return acc
      }, {})

      if (JSON.stringify(newRowSelection) !== JSON.stringify(rowSelection)) {
        setRowSelection(newRowSelection)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedFilters?.selectedRows])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const allColumns = table.getAllLeafColumns()
    const activeColumn = allColumns.find((col) => col.id === active.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isDragEnable = (activeColumn?.columnDef as any).isDragable
    const overColumn = allColumns.find((col) => col.id === over.id)

    if (!activeColumn || !overColumn) return

    if (!isDragEnable) return

    const oldIndex = allColumns.findIndex((col) => col.id === active.id)
    const newIndex = allColumns.findIndex((col) => col.id === over.id)

    const isMovingForward = newIndex > oldIndex
    const columnsInBetween = allColumns.slice(
      isMovingForward ? oldIndex + 1 : newIndex,
      isMovingForward ? newIndex + 1 : oldIndex,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasNonDraggableInPath = columnsInBetween.some((col) => (col.columnDef as any).isDragable === false)
    if (hasNonDraggableInPath) return

    if (!isDragEnable) return

    const newColumnOrder = arrayMove(
      allColumns.map((col) => col.id),
      oldIndex,
      newIndex,
    )

    setColumnOrder(newColumnOrder)
    dispatch(setStoreColumnOrder({ key: urlKey, order: newColumnOrder }))
  }

  const [filteredData, setFilteredData] = useState<TData[]>(data)
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnOrder,
      pagination: storedFilters?.pagination || { pageIndex: 0, pageSize: defaultPageSize },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(table.getState().pagination) : updater
      dispatch(
        setTabPagination({
          tabKey,
          pagination: newPagination,
        }),
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: storedFilters?.pagination || {
        pageSize: defaultPageSize,
        pageIndex: 0,
      },
    },
  })

  React.useEffect(() => {
    if (tabKey) {
      const selectedRowIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

      const selectedRowsDataId = selectedRowIds.map((id) => {
        const rowId = id ? (table.getRow(id)?.original as { id: string })?.id : null
        const original = table.getRow(id)?.original as any
        const assigned = original?.assignedTo || original?.auditor || ""
        return { id: rowId, assigned }
      })


      dispatch(
        setSelectedRows({
          tabKey,
          selectedRows: selectedRowIds,
        }),
      )

      if (tabKey.includes("pending") || tabKey.includes("assigned") || tabKey.includes("audit")) {
        const tabType = tabKey.includes("pending") ? "pending" : tabKey.includes("assigned") ? "assigned" : "audit"

        try {
          dispatch(
            setSelectedDocuments({
              tabKey: tabType,
              documentIds: selectedRowIds,
              selectedRowsDataId: selectedRowsDataId as {
                id: string,
                assigned: string
              }[],
            }),
          )
        } catch (error) {
          console.error("Error updating document selection:", error)
        }
      }
    }
  }, [rowSelection, tabKey, dispatch, table])

  const filterTableByDateRange = (range: [Date | null, Date | null]) => {
    if (!range[0] && !range[1]) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedItem = item as Record<string, any>
      if (!typedItem || !typedItem[dateKey]) return false

      try {
        const dateStr = typedItem[dateKey] as string
        const [month, day, year] = dateStr.split("-").map(Number)

        if (!month || !day || !year) return false

        const rowDate = startOfDay(new Date(year, month - 1, day))

        const startDate = range[0] ? startOfDay(range[0]) : null
        const endDate = range[1] ? startOfDay(range[1]) : null

        if (startDate && endDate) {
          return isWithinInterval(rowDate, { start: startDate, end: endDate })
        } else if (startDate) {
          return rowDate >= startDate
        } else if (endDate) {
          return rowDate <= endDate
        }
      } catch (error) {
        console.error("Error parsing date:", error)
        return false
      }

      return true
    })
    setFilteredData(filtered)
  }

  React.useEffect(() => {
    if (dateKey && (dateRange[0] || dateRange[1])) {
      filterTableByDateRange(dateRange)
    } else {
      setFilteredData(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dateKey, dateRange])

  const routeKeyMap: Record<string, string> = {
    pending: "Pending",
    assigned: "Assigned",
    audit: "Audit",
    completed: "Completed",
  }
  const activeTabKey = routeKeyMap[target.split("/").pop() || ""] || ""

  /* React.useEffect(() => {
    if (activeTabKey) {
      dispatch(
        updateCountByKey({
          key: activeTabKey,
          count: table.getRowModel().rows.length,
        }),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getRowModel(), activeTabKey]) */

  const [activeId, setActiveId] = useState<string | null>(null)

  // This effect saves pagination state to Redux when it changes
  const pagination = table.getState().pagination;
  useEffect(() => {
    if (tabKey && storedFilters && !isHandlingFilterChange.current) {
      const currentPagination = {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize
      };

      const storedPagination = storedFilters.pagination || { pageIndex: 0, pageSize: 25 };

      // Only dispatch if there are actual changes
      if (currentPagination.pageIndex !== storedPagination.pageIndex ||
        currentPagination.pageSize !== storedPagination.pageSize) {
        dispatch(
          setTabPagination({
            tabKey,
            pagination: currentPagination,
          }),
        );
      }
    }
  }, [pagination.pageIndex, pagination.pageSize, tabKey, dispatch, storedFilters]);

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
        >
          <DragMonitor setActiveId={setActiveId} />
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
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const fileSizeRaw = (row?.original as any)?.fileSize ?? 0
                      const fileSizeNumber = Number.parseFloat(fileSizeRaw)
                      let limitInKB = +(targetConfiguration?.value || 0);
                      const comments = (targetConfiguration?.comments || '').toLowerCase().replace(/\s/g, '');
                      if (comments.includes('mb')) {
                        limitInKB = limitInKB * 1024;
                      }
                      const isLargeFile = fileSizeNumber > limitInKB;



                      return (
                        <TableRow
                          key={row.id + index}
                          data-state={row.getIsSelected() && "selected"}
                          className={cn(
                            `
                          hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-900
                          ${row.getIsSelected() ? "bg-gray-100 dark:bg-gray-800" : ""}
                        `,
                            isLargeFile &&
                            `bg-[#fcff00]/50 hover:bg-[#fcff00]/80 dark:bg-[#fcff00] ${row.getIsSelected() ? "!bg-[#fcff00]" : ""
                            }`,
                          )}
                        >
                          {row.getVisibleCells().map((cell) => {

                            return (
                              <TableCell className={`${(cell?.id?.includes("formattedSize") && isLargeFile) ? "text-red-500 font-semibold" : ""}`} key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, {
                                  ...cell.getContext(),
                                  onAction: (action: string) => onAction(action, row.original),
                                })}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
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
          <DragOverlay adjustScale={true} zIndex={1000}>
            {activeId ? <div className="">{""}</div> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}

export default DataTable
