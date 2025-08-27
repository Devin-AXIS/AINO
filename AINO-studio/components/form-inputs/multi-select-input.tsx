"use client"

import { useState } from "react"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { FieldModel } from "@/lib/store"

export function MultiSelectInput({
  field,
  value,
  onChange,
}: {
  field: FieldModel
  value: any
  onChange: (v: any) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedValues = new Set(Array.isArray(value) ? value : [])

  const handleSelect = (optionValue: string) => {
    const newSelected = new Set(selectedValues)
    if (newSelected.has(optionValue)) {
      newSelected.delete(optionValue)
    } else {
      newSelected.add(optionValue)
    }
    onChange(Array.from(newSelected))
  }

  const handleUnselect = (optionValue: string) => {
    const newSelected = new Set(selectedValues)
    newSelected.delete(optionValue)
    onChange(Array.from(newSelected))
  }

  return (
    <div>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between h-auto min-h-10 bg-white"
      >
        <div className="flex gap-1 flex-wrap">
          {selectedValues.size > 0 ? (
            Array.from(selectedValues).map((val) => (
              <Badge
                variant="secondary"
                key={val}
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnselect(val)
                }}
                className="cursor-pointer"
              >
                {val}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">选择选项...</span>
          )}
        </div>
        <X className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="w-(--radix-popover-trigger-width) p-0">
          <div>
            <Input placeholder="搜索选项..." />
            <div>
              {(field.options || []).map((option) => (
                <div key={option} value={option} onClick={() => handleSelect(option)}>
                  {selectedValues.has(option) && <Check className="mr-2 h-4 w-4 opacity-100" />}
                  {!selectedValues.has(option) && <Check className="mr-2 h-4 w-4 opacity-0" />}
                  {option}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
