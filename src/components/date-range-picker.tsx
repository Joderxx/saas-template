"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect } from "react"
export function DateRangePicker({
  className,
  start, end, onDateChange
}: React.HTMLAttributes<HTMLDivElement> & {start: Date, end: Date, onDateChange: (start: Date, end: Date) => void}) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 10, 1),
    to: addDays(new Date(2024, 10, 1), 20),
  })

  useEffect(() => {
    setDate({
      from: start,
      to: end
    })
  }, [start, end])

  function handleChange(date: DateRange | undefined) {
    if(date && date.from && date.to) {
      setDate(date)
      onDateChange(date.from , date.to)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "yyyy/MM/dd")} -{" "}
                  {format(date.to, "yyyy/MM/dd")}
                </>
              ) : (
                format(date.from, "yyyy/MM/dd")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
