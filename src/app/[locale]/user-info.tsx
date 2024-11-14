"use client"

import { Button } from "@/components/ui/button";
import Link from "next/link";
import * as React from "react";
import UserAvatar from "@/app/[locale]/user-avatar";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";


  export default function UserInfo({pathname}: {pathname: string}) {
  const locale = useLocale()
  const t = useTranslations("Navbar");
  const {data: session} = useSession()

  return (
    <div>
      <div className="flex justify-center items-center gap-x-4">
        {
          session ? (
            <>
              <UserAvatar />
              {(!pathname.startsWith("/dashboard") && !pathname.startsWith("/admin")) && <Button asChild>
                <Link href="/dashboard" locale={locale}>{t("Dashboard")}</Link>
              </Button>}
            </>
          ) : (
            <Button asChild>
              <Link href="/login" locale={locale}>{t("Login")}</Link>
            </Button>
          )
        }
      </div>
    </div>
  )
}