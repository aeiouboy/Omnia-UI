"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { DayPicker, type DayPickerProps, type MonthCaptionProps, useDayPicker } from "react-day-picker"
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type EnhancedCalendarProps = DayPickerProps & {
  onToday?: () => void
}

// Custom MonthCaption component with combined month/year dropdown and integrated navigation arrows
function CustomMonthCaption({ calendarMonth, onMonthChange }: MonthCaptionProps & { onMonthChange?: (date: Date) => void }) {
  const [open, setOpen] = useState(false)
  const monthLabel = format(calendarMonth.date, "MMMM yyyy")

  // Use DayPicker context for navigation
  const { goToMonth, nextMonth, previousMonth } = useDayPicker()

  // Generate year options (2020-2030)
  const years = useMemo(() => {
    const result = []
    for (let year = 2020; year <= 2030; year++) {
      result.push(year)
    }
    return result
  }, [])

  // Generate month options
  const months = useMemo(() => {
    return [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
  }, [])

  const currentMonth = calendarMonth.date.getMonth()
  const currentYear = calendarMonth.date.getFullYear()

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex, 1)
    onMonthChange?.(newDate)
    setOpen(false)
  }

  const handleYearSelect = (year: number) => {
    const newDate = new Date(year, currentMonth, 1)
    onMonthChange?.(newDate)
    setOpen(false)
  }

  const handlePrevious = () => {
    if (previousMonth) {
      goToMonth(previousMonth)
    }
  }

  const handleNext = () => {
    if (nextMonth) {
      goToMonth(nextMonth)
    }
  }

  return (
    <div className="flex items-center justify-between w-full">
      {/* Month/Year Dropdown Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              "hover:bg-accent rounded-md px-2 py-1",
              "transition-colors cursor-pointer"
            )}
          >
            {monthLabel}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Year Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Year</label>
              <div className="grid grid-cols-4 gap-1">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={cn(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      year === currentYear
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Selection */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Month</label>
              <div className="grid grid-cols-3 gap-1">
                {months.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    className={cn(
                      "text-xs py-1.5 px-2 rounded-md transition-colors",
                      index === currentMonth
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Horizontal Navigation Arrows - FAR RIGHT */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!previousMonth}
          className={cn(
            "h-7 w-7 p-0 flex items-center justify-center rounded hover:bg-accent",
            "opacity-70 hover:opacity-100 transition-opacity",
            !previousMonth && "opacity-30 cursor-not-allowed hover:opacity-30"
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!nextMonth}
          className={cn(
            "h-7 w-7 p-0 flex items-center justify-center rounded hover:bg-accent",
            "opacity-70 hover:opacity-100 transition-opacity",
            !nextMonth && "opacity-30 cursor-not-allowed hover:opacity-30"
          )}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  onToday,
  month: controlledMonth,
  onMonthChange,
  ...props
}: EnhancedCalendarProps) {
  const [internalMonth, setInternalMonth] = useState<Date>(controlledMonth || new Date())

  const currentMonth = controlledMonth || internalMonth

  const handleMonthChange = (newMonth: Date) => {
    setInternalMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  // Calculate current week for highlighting
  const today = new Date()
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 })
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 0 })

  // Custom modifiers for current week highlighting
  const modifiers = useMemo(() => ({
    currentWeek: (date: Date) => {
      return isWithinInterval(date, { start: currentWeekStart, end: currentWeekEnd })
    },
    ...props.modifiers,
  }), [currentWeekStart, currentWeekEnd, props.modifiers])

  const modifiersClassNames = useMemo(() => ({
    currentWeek: "bg-blue-50 dark:bg-blue-950/30",
    ...props.modifiersClassNames,
  }), [props.modifiersClassNames])

  const footer = (
    <div className="flex items-center justify-center pt-3 mt-3 border-t border-border">
      <button
        type="button"
        onClick={onToday}
        className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer text-sm font-medium"
      >
        Today
      </button>
    </div>
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={currentMonth}
      onMonthChange={handleMonthChange}
      startMonth={new Date(2020, 0)}
      endMonth={new Date(2030, 11)}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center gap-1 w-full",
        caption_label: "text-sm font-medium hidden",
        dropdowns: "hidden",
        nav: "flex items-center",
        button_previous: "hidden",
        button_next: "hidden",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2",
        day: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected])]:bg-accent",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground rounded-md",
        outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Nav: () => <></>, // Hide default nav - arrows are in MonthCaption now
        MonthCaption: (props) => (
          <CustomMonthCaption {...props} onMonthChange={handleMonthChange} />
        ),
      }}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      footer={footer}
      {...props}
    />
  )
}
EnhancedCalendar.displayName = "EnhancedCalendar"

export { EnhancedCalendar }
