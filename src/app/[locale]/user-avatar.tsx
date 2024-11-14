"use client"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

export default function UserAvatar() {
  const t = useTranslations("Navbar");
  const {data: session} = useSession();
  const locale = useLocale()
  const router = useRouter()

  async function handleLogout() {
    const res = await fetch("/api/auth-user/logout")
    if (res.ok) {
      router.push("/login")
    }
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer hover:bg-primary/10 rounded-3xl">
              <Avatar>
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback>{session?.user?.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {t("UserInfo")}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Button asChild variant="ghost">
            <Link href="/forgot-password" locale={locale} className="w-full">{t("ChangePassword")}</Link>
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button className="w-full" type="submit" variant="ghost" onClick={handleLogout}>{t("Logout")}</Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}