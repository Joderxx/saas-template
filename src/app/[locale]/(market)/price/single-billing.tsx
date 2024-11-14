"use client"

import { Button } from "@/components/ui/button"
import { defaultLocale } from "@/lib/languages"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
export type PriceBilling = {
  id: string
  order: number
  productType: "FREE" | "PRO_MONTHLY" | "PRO_YEARLY"
  timeCycle: "NONE" | "WEEKLY" | "MONTHLY" | "YEARLY" | "PERMANENT"
  discount: number
  createdAt: Date
  updatedAt: Date
  locales: {
    [key: string]: {
      name: string
      money: number
      description: string
      supportAbilities: string[]
      noSupportAbilities: string[]
    }
  }
}

export default function SingleBilling({ data }: { data: PriceBilling }) {
  const t = useTranslations("Dashboard-Billing")

  const locale = useLocale()
  const { data: session } = useSession()

  const info = useMemo(() => {
    return data.locales.hasOwnProperty(locale) ? data.locales[locale] : data.locales[defaultLocale]
  }, [data, locale])

  function formatTimeCycle(timeCycle: string) {
    return timeCycle === "NONE" || timeCycle === "PERMANENT" ? t("NoLimit") : timeCycle === "WEEKLY" ? t("Week") : timeCycle === "MONTHLY" ? t("Month") : timeCycle === "YEARLY" ? t("Year") : ""
  }

  return (
    <div className="flex flex-col flex-between gap-4 rounded-xl border w-64 hover:scale-105 transition-all duration-300">
      <div className="flex flex-col ">
        <div className="flex flex-col gap-2 bg-foreground/5 p-5">
          <h3 className="text-xl font-semibold text-primary/50">{info.name}</h3>
          <h1>
            {data.discount > 0 && <span className={`text-3xl text-foreground/50 line-through pr-4`}>${info.money}</span>}
            {data.discount > 0 ? (
              <span className="text-3xl text-primary font-semibold">${info.money * (1 - data.discount / 100)}</span>
            ) : (
              <span className="text-3xl text-primary font-semibold">${info.money}</span>
            )}
            <span className="text-sm text-foreground/50"> / {formatTimeCycle(data.timeCycle)}</span>
          </h1>
          <p className="text-sm text-foreground/50 h-8 flex items-center">{info.description}</p>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4 items-center h-96">
          <ul>
            {info.supportAbilities.map((ability) => <li key={ability} className="text-md text-foreground">{ability}</li>)}
          </ul>
          <ul>
            {info.noSupportAbilities.map((ability) => <li key={ability} className="text-md text-foreground/50 line-through">{ability}</li>)}
          </ul>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 items-center justify-end">
        {info.money > 0 && (
          session ? (<Button className="rounded-full w-full" asChild>
            <Link href={`/dashboard/billing`}>{t("Subscribe")}</Link>
          </Button>)
            : (<Button className="rounded-full w-full" asChild>
              <Link href={`/login`}>{t("Login")}</Link>
            </Button>)
        )}
      </div>
    </div>
  )
}
