"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import useFullPath from "@/hooks/use-fullpath"; // Import useFullPath
import { useRedux } from "@/hooks/use-redux";
import { cn, DateToFormattedDate } from "@/lib/utils";
import { setTabFilters } from "@/store/slices/tableFiltersSlice";
import type { Column } from "@tanstack/react-table";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon, FilterIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Icons } from "../Icons";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  searchType?: "text" | "date" | null
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  searchType,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { dispatch, selector } = useRedux();
  const { charts = "", target = "" } = useFullPath();
  const compositeTabKey = `${charts}${target}`;
  const storedData = selector((state) => state.tableFilters[compositeTabKey]);

  const storedColumnFilter = storedData?.columnFilters?.find((filter) => filter.id === column.id);
  const storedFilterValue = storedColumnFilter?.value;


  const [value, setValue] = useState<Date | string | null>(searchType === "date" ? null : "");

  const convertDate = (dateValue: string | Date | null) => {
    if (!dateValue) return null;

    if (dateValue instanceof Date) {
      return dateValue;
    }

    const dateString = String(dateValue);

    const parsedDate = parse(dateString, "MM-dd-yyyy", new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }

    const directDate = new Date(dateString);
    return isValid(directDate) ? directDate : null;
  };
  useEffect(() => {
    if (!storedFilterValue) {
      setValue("");
    } else if (searchType === "date" && storedFilterValue) {
      const dateValue = convertDate(storedFilterValue as string);
      setValue(dateValue || "");
    } else {
      setValue(storedFilterValue as string);
    }
  }, [storedFilterValue, searchType]);

  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  /*   const initialLoadRef = useRef(true);
  
    useEffect(() => {
      if (initialLoadRef.current && storedFilterValue) {
        column.setFilterValue(storedFilterValue);
        initialLoadRef.current = false;
      }
    }, [column, storedFilterValue]); */

  useEffect(() => {
    if (compositeTabKey && storedData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = (column as any).table;

      if (table) {
        const columnFilters = table.getState().columnFilters;
        const sorting = table.getState().sorting;
        const columnVisibility = table.getState().columnVisibility;

        dispatch(
          setTabFilters({
            tabKey: compositeTabKey,
            filters: {
              ...storedData,
              columnFilters,
              sorting,
              columnVisibility,
              dateRange: storedData.dateRange || [null, null],
            },
          }),
        );
      }
    }
  }, [column, dispatch, compositeTabKey, storedData]);

  const handleDateChange = (date: Date | null) => {
    try {
      if (!date) {
        column.setFilterValue("");
        setValue("");
        return;
      }
      const formattedDate = DateToFormattedDate(date);
      setValue(date);
      column.setFilterValue(formattedDate);
      setOpen(false);
    } catch (error) {
      console.error("Invalid date format:", error);
    }
  };

  const hasActiveFilter = Boolean(column.getFilterValue());

  const isSorted = column.getIsSorted();

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex w-full items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="thead"
            size="tableHead"
            className="h-8 w-full data-[state=open]:bg-transparent truncate flex gap-0 justify-between pr-4 text-[15px] pl-0"
          >
            <div className="w-full justify-center  flex items-center gap-1">
              {title}
              {hasActiveFilter && (
                <div className="ml-1 text-selectedText px-1.5 py-0 text-xs">
                  <FilterIcon className="h-3 w-3 mr-1" />
                </div>
              )}
            </div>
            {column.getIsSorted() === "desc" ? (
              <Icons.arrowDown className=" h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <Icons.arrowUp className="h-4 w-4" />
            ) : (
              <Icons.caretSort className=" h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="bg-tabBg">
          <DropdownMenuItem
            className={cn("", column.getIsSorted() === "asc" && "bg-selectedText text-tabBg hover:bg-selectedText")}
            onClick={() => column.toggleSorting(false)}
          >
            <Icons.arrowUp className="mr-2 h-3.5 w-3.5 " />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              "hover:bg-red-300",
              column.getIsSorted() === "desc" && "bg-selectedText text-tabBg hover:bg-selectedText",
            )}
            onClick={() => column.toggleSorting(true)}
          >
            <Icons.arrowDown className="mr-2 h-3.5 w-3.5" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <Icons.eyeNone className="mr-2 h-3.5 w-3.5" />
            Hide
          </DropdownMenuItem>
          {searchType && (
            <>
              <DropdownMenuSeparator />
              <div className="p-0.5">
                {searchType === "date" ? (
                  <div className="flex flex-col space-y-2">
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start bg-tabBg border-input-border dark:border-tabBg text-left font-normal",
                            !value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {value ? (
                            value instanceof Date ? (
                              format(value, "PPP")
                            ) : typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/) ? (
                              format(new Date(value), "PPP")
                            ) : (
                              value
                            )
                          ) : (
                            <span className="">
                              Pick a date
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar selected={value instanceof Date ? value : null} onSelect={handleDateChange} />
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <Input
                    ref={inputRef}
                    type={"text"}
                    placeholder={`Filter ${title.toLowerCase()}...`}
                    value={value as string}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newValue = e.target.value;
                      setValue(newValue);
                      column.setFilterValue(newValue);
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "a" ||
                        e.key === "d" ||
                        e.key === "h" ||
                        e.key === "A" ||
                        e.key === "D" ||
                        e.key === "H"
                      ) {
                        e.stopPropagation();
                      }
                    }}
                    className="h-8 placeholder:capitalize"
                  />
                )}
                {(value || isSorted) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      column.setFilterValue("");
                      column.clearSorting();
                      setValue("");
                      setOpen(false);
                    }}
                    className="mt-2 w-full"
                  >
                    <X className="mr-2 h-3.5 w-3.5" />
                    Clear filter
                  </Button>
                )}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}