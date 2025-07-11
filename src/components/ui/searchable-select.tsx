"use client";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
    label: string
    value: string
}

interface SearchableSelectProps {
    options: SearchableSelectOption[]
    value?: string
    onValueChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    className?: string
    disabled?: boolean
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    className,
    disabled = false,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Filter options based on search
    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchValue.toLowerCase()));

    // Get selected option
    const selectedOption = options.find((option) => option.value === value);

    // Reset search when opening/closing
    useEffect(() => {
        if (open) {
            setSearchValue("");
        }
    }, [open]);

    // Handle option selection
    const handleSelect = (optionValue: string) => {
        onValueChange?.(optionValue);
        setOpen(false);
        setSearchValue("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    ref={triggerRef}
                    type="button"
                    className={cn(
                        "w-full flex items-center justify-between border border-input-border bg-background px-1.5 py-1 text-sm shadow-sm focus:outline-none focus:ring-0",
                        selectedOption ? "text-foreground" : "text-muted-foreground",
                        disabled && "opacity-50 cursor-not-allowed",
                        className,
                    )}
                    disabled={disabled}
                    onClick={() => setOpen((v) => !v)}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 rounded-none" style={{ width: triggerRef.current?.offsetWidth || "100%" }}>
                <div className="p-1">
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="h-9"
                        autoFocus
                    />
                </div>
                <ScrollArea className="max-h-48 overflow-y-auto">
                    <div className="p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-2 px-3 text-sm text-muted-foreground">No options found.</div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center rounded-none px-3 py-1 text-sm outline-none transition-colors hover:bg-selectedText/90 hover:text-accent-foreground",
                                        value === option.value && "bg-selectedText text-accent-foreground",
                                    )}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                                    {option.label}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
