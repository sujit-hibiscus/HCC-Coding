"use client";

import { addDays, format, startOfDay, setMonth, setYear, isSameDay } from "date-fns";
import { CalendarIcon, ChevronDown, Download, XIcon, Check } from "lucide-react";
import { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import "react-datepicker/dist/react-datepicker.css";

interface CalendarDateRangePickerProps {
    dateRange: [Date | null, Date | null]
    setDateRange: (range: [Date | null, Date | null]) => void
    className?: string
    onReset?: () => void
    onExport?: () => void
}

export function CalendarDateRangePicker({
    dateRange,
    setDateRange,
    className,
    onReset,
    onExport,
}: CalendarDateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

    // State for comboboxes
    const [monthOpen, setMonthOpen] = useState(false);
    const [yearOpen, setYearOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(calendarDate.getMonth().toString());
    const [selectedYear, setSelectedYear] = useState(calendarDate.getFullYear().toString());
    const [yearFilter, setYearFilter] = useState("");

    // Generate month options
    const months = [
        { value: "0", label: "January" },
        { value: "1", label: "February" },
        { value: "2", label: "March" },
        { value: "3", label: "April" },
        { value: "4", label: "May" },
        { value: "5", label: "June" },
        { value: "6", label: "July" },
        { value: "7", label: "August" },
        { value: "8", label: "September" },
        { value: "9", label: "October" },
        { value: "10", label: "November" },
        { value: "11", label: "December" },
    ];

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 20;
    const endYear = currentYear + 30;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
        value: (startYear + i).toString(),
        label: (startYear + i).toString(),
    }));

    const filteredYears = yearFilter ? years.filter((year) => year.label === yearFilter) : years;

    const presets = [
        {
            label: "Today",
            dates: [startOfDay(new Date()), startOfDay(new Date())] as [Date, Date],
        },
        {
            label: "Yesterday",
            dates: [startOfDay(addDays(new Date(), -1)), startOfDay(addDays(new Date(), -1))] as [Date, Date],
        },
        {
            label: "Last 7 days",
            dates: [startOfDay(addDays(new Date(), -6)), startOfDay(new Date())] as [Date, Date],
        },
        {
            label: "Last 30 days",
            dates: [startOfDay(addDays(new Date(), -29)), startOfDay(new Date())] as [Date, Date],
        },
        {
            label: "Last 90 days",
            dates: [startOfDay(addDays(new Date(), -89)), startOfDay(new Date())] as [Date, Date],
        },
        {
            label: "Last 120 days",
            dates: [startOfDay(addDays(new Date(), -119)), startOfDay(new Date())] as [Date, Date],
        },
    ];

    useEffect(() => {
        const [start, end] = dateRange;

        if (start instanceof Date && end instanceof Date) {
            const matchingPreset = presets.find(
                (preset) =>
                    isSameDay(preset.dates[0], start) &&
                    isSameDay(preset.dates[1], end)
            );

            if (matchingPreset) {
                setSelectedPreset(matchingPreset.label);
            } else {
                setSelectedPreset(null);
            }
        } else {
            setSelectedPreset(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange]);


    const handleMonthChange = (value: string) => {
        setSelectedMonth(value);
        const newDate = setMonth(calendarDate, Number.parseInt(value));
        setCalendarDate(newDate);
        setMonthOpen(false);
    };

    const handleYearChange = (value: string) => {
        setSelectedYear(value);
        const newDate = setYear(calendarDate, Number.parseInt(value));
        setCalendarDate(newDate);
        setYearOpen(false);
    };

    // Custom day rendering to ensure today's date has green background
    const renderDayContents = (day: number, date: Date) => {
        const today = new Date();
        const isToday = isSameDay(date, today);

        return <div className={isToday ? "today-date" : undefined}>{day}</div>;
    };

    return (
        <div className={cn("grid w-full md:w-auto gap-2 pt-2", className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        size={"sm"}
                        variant="outline"
                        className={cn(
                            "justify-between border-input-border dark:border-tabBg text-left font-normal text-input-placeholder dark:text-tabBg hover:text-tabBg",
                            !dateRange[0] && "text-input-placeholder dark:text-tabBg hover:text-selectedText",
                        )}
                    >
                        <div className="flex text-black  items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {dateRange[0] ? (
                                dateRange[1] ? (
                                    <>
                                        {format(dateRange[0], "LLL dd, yyyy")} - {format(dateRange[1], "LLL dd, yyyy")}
                                    </>
                                ) : (
                                    format(dateRange[0], "LLL dd, yyyy")
                                )
                            ) : (
                                <span className="">Pick a date range</span>
                            )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-black " />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-none" align="start">
                    <div className="flex overflow-hidden">
                        <div className="w-48 ">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant={selectedPreset === preset.label ? "default" : "ghost"}
                                    className={cn(
                                        "w-full justify-start font-normal",
                                        selectedPreset === preset.label && "bg-primary text-primary-foreground hover:text-tabBg",
                                    )}
                                    onClick={() => {
                                        setDateRange(preset.dates);
                                        setSelectedPreset(preset.label);
                                        setIsOpen(false);
                                    }}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                        <div className="flex flex-col pt-1 pb-1 px-2 dark:bg-slate-900 bg-white">
                            <div className="flex justify-center items-center gap-2 pb-1">
                                {/* Month Combobox */}
                                <Popover open={monthOpen} onOpenChange={setMonthOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={monthOpen}
                                            className="w-[120px] justify-between"
                                        >
                                            {selectedMonth ? months.find((month) => month.value === selectedMonth)?.label : "Select month"}
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] rounded-none p-0">
                                        <Command>
                                            <CommandInput placeholder="Search month..." />
                                            <CommandList>
                                                <CommandEmpty>No month found.</CommandEmpty>
                                                <CommandGroup>
                                                    {months.map((month) => (
                                                        <CommandItem
                                                            key={month.value}
                                                            value={month.label}
                                                            onSelect={() => handleMonthChange(month.value)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedMonth === month.value ? "opacity-100" : "opacity-0",
                                                                )}
                                                            />
                                                            {month.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>

                                {/* Year Combobox */}
                                <Popover open={yearOpen} onOpenChange={setYearOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={yearOpen}
                                            className="w-[100px] justify-between"
                                        >
                                            {selectedYear || "Select year"}
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] rounded-none p-0">
                                        <Command>
                                            <CommandInput placeholder="Enter exact year" value={yearFilter} onValueChange={setYearFilter} />
                                            <CommandList>
                                                <CommandEmpty>No exact match found.</CommandEmpty>
                                                <CommandGroup className="max-h-[200px] overflow-auto">
                                                    {(yearFilter ? filteredYears : years).map((year) => (
                                                        <CommandItem
                                                            key={year.value}
                                                            value={year.label}
                                                            onSelect={() => handleYearChange(year.value)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedYear === year.value ? "opacity-100" : "opacity-0",
                                                                )}
                                                            />
                                                            {year.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <ReactDatePicker
                                selectsRange
                                inline
                                startDate={dateRange[0]}
                                endDate={dateRange[1]}
                                onChange={(update) => {
                                    setDateRange(update);
                                    if (update[0] && update[1]) setIsOpen(false);
                                }}
                                monthsShown={2}
                                selected={calendarDate}
                                onMonthChange={(date) => {
                                    setCalendarDate(date);
                                    setSelectedMonth(date.getMonth().toString());
                                    setSelectedYear(date.getFullYear().toString());
                                }}
                                renderDayContents={renderDayContents}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2">
                {onReset && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs hover:bg-muted/50 dark:hover:bg-slate-800"
                        onClick={onReset}
                    >
                        Reset
                        <XIcon className="ml-2 h-3 w-3" />
                    </Button>
                )}
                {onExport && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs hover:bg-muted/50 dark:hover:bg-slate-800"
                        onClick={onExport}
                    >
                        Export
                        <Download className="ml-2 h-3 w-3" />
                    </Button>
                )}
            </div>
            <style jsx global>{`
  .react-datepicker {
    font-family: inherit;
    font-size: 0.9rem;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    border: none;
    display: inline-block;
    position: relative;
  }

  .react-datepicker__header {
    text-align: center;
    background-color: hsl(var(--background));
    border-bottom: 1px solid hsl(var(--border));
    padding-top: 0.62rem;
    position: relative;
    color: hsl(var(--foreground));
  }

  .react-datepicker__day-names,
  .react-datepicker__week {
    display: flex;
    justify-content: space-around;
  }

  .react-datepicker__day-name,
  .react-datepicker__day {
    width: 2rem;
    line-height: 2rem;
    margin: 0.2rem;
    display: inline-block;
    text-align: center;
    color: hsl(var(--foreground));
  }

  /* Ensure today's date styling has highest specificity */
  .react-datepicker__day.react-datepicker__day--today,
  .react-datepicker__day--today {
    background-color: #22c55e !important; /* Green background */
    color: white !important; /* White text */
    font-weight: bold !important;
    border-radius: 0.3rem !important;
  }

  /* Additional styling for our custom today element */
  .today-date {
    background-color: #22c55e !important;
    color: white !important;
    font-weight: bold !important;
    border-radius: 0.3rem !important;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .react-datepicker__day--selected,
  .react-datepicker__day--in-selecting-range,
  .react-datepicker__day--in-range,
  .react-datepicker__day--keyboard-selected {
    background-color: hsl(var(--primary)) !important;
    color: hsl(var(--primary-foreground)) !important;
  }

  .react-datepicker__day:hover {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }

  .dark .react-datepicker__day:hover {
    background-color: white !important;
    color: black !important;
  }

  .react-datepicker__day--outside-month {
    color: hsl(var(--muted-foreground));
    background-color: transparent !important;
  }

  .react-datepicker__navigation {
    top: 3px;
  }

  .react-datepicker__navigation--previous {
    left: 0px;
  }

  .react-datepicker__navigation--next {
    right: 0px;
  }

  .react-datepicker__month-container {
    float: left;
  }

  .react-datepicker__month {
    margin: 0.4rem;
  }

  .react-datepicker__current-month {
    font-size: 1rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: hsl(var(--foreground));
  }

  .react-datepicker__day--keyboard-selected:hover {
    background-color: hsl(var(--primary)) !important;
    color: hsl(var(--primary-foreground)) !important;
  }

  .react-datepicker__triangle {
    display: none;
  }
`}</style>
        </div>
    );
}
