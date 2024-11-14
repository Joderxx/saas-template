"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const t = useTranslations("DarkMode")

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer rounded-md hover:bg-primary/10 flex items-center justify-center text-center p-3">
              <Sun className={cn("h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0", theme === "dark" ? "hidden" : "block")}/>
              <Moon
                className={cn("h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100", theme === "dark" ? "block" : "hidden")}/>
            </div>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {t("Change Theme")}
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t("Light")}
        </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            {t("Dark")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
