"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../darkmode-switcher";
import { LanguageSwitcher } from "../language-switcher";

export default function AppNavbar({ serverRender }: { serverRender: React.ReactNode }) {

  const { open, isMobile } = useSidebar()


  return <div className={cn("flex items-center justify-between p-4 h-14 border-b fixed top-0 right-0 z-[9999]", !open || isMobile ? "left-0 w-screen" : "left-64 w-[calc(100vw-16rem)]")}>
    <div className="flex flex-1 items-center gap-x-2">
      <SidebarTrigger />
    </div>
    <div className="flex justify-end items-center gap-x-2">
      <ModeToggle />
      <LanguageSwitcher />
      {serverRender}
    </div>
  </div>
}