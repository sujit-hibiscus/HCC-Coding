"use client";

import * as React from "react";
import ReactDatePicker from "react-datepicker";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type CalendarProps = React.ComponentProps<typeof ReactDatePicker> & {
  className?: string
  classNames?: Record<string, string>
  showOutsideDays?: boolean
}

function Calendar({ className, ...props }: CalendarProps) {
  const years = Array.from({ length: 116 }, (_, i) => 1910 + i);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [monthOpen, setMonthOpen] = React.useState(false);
  const [yearOpen, setYearOpen] = React.useState(false);
  const [yearSearch, setYearSearch] = React.useState("");

  // Filter years based on exact match when 4 digits are entered
  const filteredYears = React.useMemo(() => {
    if (!yearSearch) return years;

    // If user has typed exactly 4 digits, only show exact matches
    if (/^\d{4}$/.test(yearSearch)) {
      return years.filter((year) => year.toString() === yearSearch);
    }

    // Otherwise, show years that start with the search string
    return years.filter((year) => year.toString().startsWith(yearSearch));
  }, [years, yearSearch]);

  return (
    <ReactDatePicker
      inline
      calendarClassName={cn("p-0 w-full max-w-[25rem] mx-auto", className)}
      wrapperClassName="w-full"
      showPopperArrow={false}
      renderCustomHeader={({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
        changeYear,
        changeMonth,
      }) => {
        // Validate that date is a valid Date object
        const isValidDate = date && date instanceof Date && !isNaN(date.getTime());

        // Use fallback values if date is invalid
        const currentMonth = isValidDate ? date.getMonth() : new Date().getMonth();
        const currentYear = isValidDate ? date.getFullYear() : new Date().getFullYear();

        return (
          <div className="flex flex-col sm:flex-row items-center gap-2 px-2 py-2">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              type="button"
              title="Prev"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex-shrink-0",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex flex-1 gap-2 min-w-0">
              <Popover open={monthOpen} onOpenChange={setMonthOpen}>
                <PopoverTrigger asChild>
                  <button
                    title="search"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full sm:w-[8.75rem] justify-start text-left font-normal",
                    )}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {months[currentMonth]}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-full sm:w-[12.5rem]">
                  <Command>
                    <CommandInput placeholder="Search month..." />
                    <CommandList>
                      <CommandEmpty>No month found.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-y-auto">
                        {months.map((month, index) => (
                          <CommandItem
                            key={month}
                            value={month}
                            onSelect={() => {
                              if (typeof changeMonth === "function") {
                                changeMonth(index);
                                setMonthOpen(false);
                              }
                            }}
                          >
                            {month}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Popover
                open={yearOpen}
                onOpenChange={(open) => {
                  setYearOpen(open);
                  if (!open) {
                    // Reset search when closing the popover
                    setYearSearch("");
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <button
                    title="year"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full sm:w-[6.25rem] justify-start text-left font-normal",
                    )}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {currentYear}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-full sm:w-[12.5rem]">
                  <Command>
                    <CommandInput placeholder="Search year..." value={yearSearch} onValueChange={setYearSearch} />
                    <CommandList>
                      {filteredYears.length === 0 && <CommandEmpty>No year found.</CommandEmpty>}
                      <CommandGroup className="max-h-[200px] overflow-y-auto">
                        {filteredYears.map((year) => (
                          <CommandItem
                            key={year}
                            value={year.toString()}
                            onSelect={() => {
                              if (typeof changeYear === "function") {
                                changeYear(year);
                                setYearOpen(false);
                                setYearSearch("");
                              }
                            }}
                          >
                            {year}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              type="button"
              title="Next"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex-shrink-0",
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        );
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

