"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateRangePickerProps {
  dateRange: [Date | null, Date | null]
  onChange: (range: [Date | null, Date | null]) => void
  className?: string
}

export function DateRangePicker({ dateRange, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  // Create a safe copy of the date range to avoid invalid dates
  const safeInitialRange: [Date | null, Date | null] = [
    dateRange[0] && !isNaN(dateRange[0].getTime()) ? new Date(dateRange[0]) : null,
    dateRange[1] && !isNaN(dateRange[1].getTime()) ? new Date(dateRange[1]) : null,
  ];

  const [localDateRange, setLocalDateRange] = useState<[Date | null, Date | null]>(safeInitialRange);

  // Safely format date with fallback
  const formatDate = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return "";
    try {
      return format(date, "dd-MMM-yyyy");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  // Sync local state with props, ensuring valid dates
  useEffect(() => {
    if (!dateRange) return;

    const validatedRange: [Date | null, Date | null] = [
      dateRange[0] && !isNaN(dateRange[0].getTime()) ? new Date(dateRange[0]) : null,
      dateRange[1] && !isNaN(dateRange[1].getTime()) ? new Date(dateRange[1]) : null,
    ];

    setLocalDateRange(validatedRange);
  }, [dateRange]);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    // Validate dates before setting
    const [start, end] = dates;
    const validStart = start && !isNaN(start.getTime()) ? new Date(start) : null;
    const validEnd = end && !isNaN(end.getTime()) ? new Date(end) : null;

    const newRange: [Date | null, Date | null] = [validStart, validEnd];
    setLocalDateRange(newRange);

    // Only call onChange when both dates are selected and valid
    if (validStart && validEnd) {
      onChange(newRange);
      setOpen(false);
    }
  };

  // Determine the default month to show in the calendar
  const startDate = localDateRange[0] && !isNaN(localDateRange[0].getTime()) ? new Date(localDateRange[0]) : null;
  const endDate = localDateRange[1] && !isNaN(localDateRange[1].getTime()) ? new Date(localDateRange[1]) : null;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !localDateRange[0] || !localDateRange[1] ? "text-muted-foreground" : "",
            )}
            size="sm"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {localDateRange[0] && localDateRange[1] ? (
              <>
                {formatDate(localDateRange[0])} - {formatDate(localDateRange[1])}
              </>
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <ReactDatePicker
              selectsRange
              inline
              startDate={startDate}
              endDate={endDate}
              onChange={(update: [Date | null, Date | null]) => handleDateChange(update)}
              monthsShown={2}
              calendarClassName="w-full"
            />
          </div>
        </PopoverContent>
      </Popover>
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
