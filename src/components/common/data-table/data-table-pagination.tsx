/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type { Table } from "@tanstack/react-table";
import { useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Icons } from "../Icons";
import { useRedux } from "@/hooks/use-redux";
import { setTabPagination } from "@/store/slices/tableFiltersSlice";
import useFullPath from "@/hooks/use-fullpath";

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const {
    chevronLeft: ChevronLeftIcon,
    chevronRight: ChevronRightIcon,
    doubleArrowLeft: DoubleArrowLeftIcon,
    doubleArrowRight: DoubleArrowRightIcon,
  } = Icons;

  const { dispatch, selector } = useRedux();
  const { charts = "", target = "" } = useFullPath();
  const compositeTabKey = `${charts}${target}`;
  const storedData = selector((state) => state.tableFilters[compositeTabKey]);
  const initializedRef = useRef(false);

  const defaultPageSize = `${table.getState().pagination.pageSize}`;
  const [customPageSize, setCustomPageSize] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [availablePages] = useState<number[]>([25, 30, 40, 50]);

  // This effect runs once to initialize pagination from stored data
  useEffect(() => {
    if (storedData?.pagination && !initializedRef.current) {

      initializedRef.current = true;
      table.setPagination(storedData.pagination);

      const storedPageSize = storedData.pagination?.pageSize;
      if (!availablePages?.includes(storedPageSize)) {
        setShowCustomInput(true);
        setCustomPageSize(`${storedPageSize}`);
      }
    }
  }, [storedData, table, availablePages]);

  useEffect(() => {
    if (storedData?.pagination?.pageSize === 25) {
      setShowCustomInput(false);
      setCustomPageSize("");
      table.setPageSize(25);
    }
  }, [storedData?.pagination?.pageSize]);


  // This effect saves pagination state to Redux when it changes
  const pagination = table.getState().pagination;
  useEffect(() => {

    if (compositeTabKey && storedData) {
      dispatch(
        setTabPagination({
          tabKey: compositeTabKey,
          pagination,
        }),
      );
    }
  }, [
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    compositeTabKey,
    dispatch,
    storedData,
  ]);

  const handlePageSizeChange = (value: string) => {
    if (value === "custom") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      table.setPageSize(Number(value));
    }
  };

  const handleCustomPageSizeChange = (value: string) => {
    setCustomPageSize(value);
    const newSize = Number.parseInt(value, 10);
    if (!isNaN(newSize) && newSize > 0) {
      table.setPageSize(newSize);
    }
  };

  const resetToSelect = () => {
    setShowCustomInput(false);
    setCustomPageSize("");
    table.setPageSize(25);
  };

  // const changePageByButton = (pageCount: number) => { };

  return (
    <div className="flex items-center pt-1 justify-between px-2">
      <div className="flex items-center space-x-6 lg:space-x-8 justify-between w-full">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium white hidden lg:block">Rows per page</p>
          <p className="text-sm font-medium white block lg:hidden">Rows</p>
          {showCustomInput ? (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="1"
                value={customPageSize}
                onChange={(e) => handleCustomPageSizeChange(e.target.value)}
                className="h-8 w-[5rem]"
                placeholder="Page"
              />
              <Button variant="outline" className="h-8" onClick={resetToSelect}>
                Reset
              </Button>
            </div>
          ) : (
            <Select value={defaultPageSize} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="h-8 w-[5rem]">
                <SelectValue placeholder={defaultPageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {availablePages.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex w-[6.25rem] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {storedData?.pageCount || table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
