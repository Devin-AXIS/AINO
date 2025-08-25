"use client"
import { useState } from "react"
import type { DateRange } from "date-fns"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import type { FieldModel } from "@/lib/store"

export function ModernDateInput({
  field,
  value,
  onChange,
}: { field: FieldModel; value: any; onChange: (v: any) => void }) {
  const [open, setOpen] = useState(false)
  const mode = field.dateMode || "single"

  if (mode === "range") {
    const date: DateRange | undefined =
      Array.isArray(value) && (value[0] || value[1])
        ? {
            from: value[0] ? new Date(value[0]) : undefined,
            to: value[1] ? new Date(value[1]) : undefined,
          }
        : undefined

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-white",
              !date?.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "yyyy-MM-dd")} - {format(date.to, "yyyy-MM-dd")}
                </>
              ) : (
                format(date.from, "yyyy-MM-dd")
              )
            ) : (
              <span>选择日期范围</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              if (range) {
                onChange([
                  range.from ? range.from.toISOString().split("T")[0] : null,
                  range.to ? range.to.toISOString().split("T")[0] : null,
                ])
              } else {
                onChange([null, null])
              }
              if (range?.from && range?.to) {
                setOpen(false)
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    )
  }

  if (mode === "multiple") {
    const dates: Date[] = Array.isArray(value) ? value.filter(Boolean).map((d) => new Date(d)) : []

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-white",
              !dates.length && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dates.length > 0 ? <span>{dates.length} 个日期已选择</span> : <span>选择多个日期</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="multiple"
            selected={dates}
            onSelect={(selectedDates) => {
              if (selectedDates) {
                onChange(selectedDates.map((date) => date.toISOString().split("T")[0]))
              } else {
                onChange([])
              }
            }}
          />
        </PopoverContent>
      </Popover>
    )
  }

  const date = typeof value === "string" && value ? new Date(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal bg-white", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy-MM-dd") : <span>选择日期</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              onChange(selectedDate.toISOString().split("T")[0])
            } else {
              onChange(null)
            }
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
