import type { Column } from "@tanstack/react-table";
import { ChevronDown, FilterIcon } from "lucide-react";
import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface StatusFilterProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>
    title: string
    statusEnum: { [key: string]: string }
}

export function StatusFilter<TData, TValue>({
    column,
    title,
    className,
    statusEnum,
}: StatusFilterProps<TData, TValue>) {
    const facetedFilter = column?.getFacetedUniqueValues();
    const selectedValues = new Set(column?.getFilterValue() as string[]);

    const hasActiveFilter = Boolean(column.getFilterValue());
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghostStatus" size="tableHead" className="-ml-3 h-8 data-[state=open]:bg-transparent">
                        <span>{title}</span>
                        {hasActiveFilter && (
                            // {hasActiveFilter && (
                            <div className="ml-1 text-selectedText px-1.5 py-0 text-xs">
                                <FilterIcon className="h-3 w-3 mr-1" />
                            </div>
                        )}
                        {selectedValues?.size > 0 && (
                            <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal lg:hidden">
                                {selectedValues.size}
                            </Badge>
                        )}
                        <ChevronDown className="ml-2 h-4 w-4" />
                        {/* <Filter className="ml-2 h-4 w-4" /> */}

                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[12.5rem] bg-tabBg">
                    {Object.values(statusEnum).map((status) => {
                        const isSelected = selectedValues?.has(status);
                        return (
                            <DropdownMenuCheckboxItem
                                key={status}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        selectedValues.add(status);
                                    } else {
                                        selectedValues.delete(status);
                                    }
                                    const filterValues = Array.from(selectedValues);
                                    column?.setFilterValue(filterValues.length ? filterValues : undefined);
                                }}
                                className={isSelected ? "bg-selectedText text-white" : ""}
                            >
                                <div className="flex items-center justify-between w-full">
                                    {status}

                                    {facetedFilter?.get(status) && (
                                        <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                                            {facetedFilter.get(status)}
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                    {selectedValues.size > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => column?.setFilterValue(undefined)}
                                className="justify-center text-center"
                            >
                                Clear filters
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

