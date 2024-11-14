"use client"
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover"
import { ScrollArea } from "./ui/scroll-area"
import { Input } from "./ui/input"
import { FaCheck } from "react-icons/fa"
import { useState, useEffect, useMemo } from "react"

export type MultiSelectItem = {
  label: string
  value: string
}

export default function MultiSelect({ value, items, onValueChange }: { value: string[], items: MultiSelectItem[] | string[], onValueChange?: (value: string[]) => void }) {

  const [selected, setSelected] = useState<string[]>(value)

  useEffect(() => {
    setSelected(value)
  }, [value])

  function handleSelect(value: string) {
    let newSelected = [...selected]
    if (selected.includes(value)) {
      newSelected = selected.filter(item => item !== value)
      setSelected(newSelected)
    } else {
      newSelected = [...selected, value]
      setSelected(newSelected)
    }
    onValueChange?.(newSelected)
  }

  const showText = useMemo(() => "选中" + ` ( ${selected.length} ) `, [selected])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Input value={showText} className="w-full" />
      </PopoverTrigger>
      <PopoverContent className="w-full bg-popover p-2 rounded-lg border shadow-md">
        <ScrollArea className="h-[200px] px-3 w-full">
          <div className="grid gap-1">
            {items.map((item) => (
              <div 
              className="flex flex-between text-sm text-primary/80 justify-between items-center gap-2 cursor-pointer hover:bg-primary/10 px-3 py-1 rounded-md min-w-28" 
              onClick={() => handleSelect(typeof item === "string" ? item : item.value)}
              key={typeof item === "string" ? item : item.value}
              >
                <div>{typeof item === "string" ? item : item.label}</div>
                {selected.includes(typeof item === "string" ? item : item.value) && <FaCheck />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>

  )
}