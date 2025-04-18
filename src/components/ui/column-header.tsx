import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";
import { ArrowUpDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ColumnHeaderProps<TData, TValue> {
    column: Column<TData, TValue>
    title: string
    className?: string
    activeSearch: string | null
    onSearchChange: (value: string) => void
    hasSearch: boolean
}

export function ColumnHeader<TData, TValue>({
    column,
    title,
    className,
    onSearchChange,
    hasSearch,
}: ColumnHeaderProps<TData, TValue>) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    return (
        <div className={cn("flex items-center space-x-2 group", className)}>
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8 data-[state=open]:bg-accent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                <span>{title}</span>
                <ArrowUpDown className={cn("ml-2 h-4 w-4", column.getIsSorted())} />
            </Button>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                            (open || hasSearch) && "opacity-100 text-primary",
                        )}
                    >
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search {title}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-2" align="start" side="bottom">
                    <div className="flex items-center space-x-2">
                        <Input
                            ref={inputRef}
                            placeholder={`Search ${title.toLowerCase()}...`}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                onSearchChange(e.target.value);
                            }}
                            className="h-8"
                        />
                        {value && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                    setValue("");
                                    onSearchChange("");
                                    setOpen(false);
                                }}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Clear search</span>
                            </Button>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

