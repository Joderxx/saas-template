"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AppLink({ path, name, icon }: { path: string, name: string, icon?: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <Link href={path} className={cn("flex items-center gap-x-2 p-2  rounded-md hover:bg-muted ", pathname.endsWith(path) ? " text-red-500 hover:text-red-500/50" : "text-primary hover:text-primary/60")}>
      <div className="w-5 h-5 flex items-center justify-center">
        {!!icon && icon}
      </div>
      <span>
        {name}
      </span>
    </Link>

  )
}