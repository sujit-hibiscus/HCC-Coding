"use client";

import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

interface DateRangePickerProps {
    value: DateRange | undefined;
    onChange: (date: DateRange | undefined) => void;
    onReset: () => void;
    onApply: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DateRangePicker({
    value,
    onChange,
    onReset,
    onApply,
    isOpen,
    onOpenChange,
}: DateRangePickerProps) {
    const handleDateChange = (dates: [Date | null, Date | null]) => {
        onChange({
            from: dates[0] || undefined,
            to: dates[1] || undefined
        });
    };

    return (
        <div className="grid gap-2">
            <Popover open={isOpen} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        {value?.from ? (
                            value.to ? (
                                <>
                                    {format(value.from, "LLL dd, y")} -{" "}
                                    {format(value.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(value.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        selected={value?.from}
                        onChange={handleDateChange}
                        startDate={value?.from}
                        endDate={value?.to}
                        selectsRange
                        monthsShown={2}
                    />
                    <div className="flex justify-end gap-2 p-3">
                        <Button variant="outline" size="sm" onClick={onReset}>
                            Reset
                        </Button>
                        <Button size="sm" onClick={onApply}>
                            Apply
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
} 