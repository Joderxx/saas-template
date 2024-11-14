"use client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BlogAsideLink({ href, children, icon }: { href: string, children: React.ReactNode, icon: React.ReactNode }) {
  const pathname = usePathname()
  return <Link href={href} className={cn(pathname.endsWith(href) ? "text-red-400 hover:text-red-400/50" : "text-primary hover:text-primary/50")}>
    <div className="flex justify-center gap-2">
      <div className="flex items-center justify-center w-6 h-6">
        {icon}
      </div>
      {children}
    </div>
  </Link>
}