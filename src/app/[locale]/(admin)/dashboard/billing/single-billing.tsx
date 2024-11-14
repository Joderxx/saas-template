"use client"

import { Button } from "@/components/ui/button"
import { defaultLocale } from "@/lib/languages"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useMemo, useState, useTransition } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { useToast } from "@/hooks/use-toast"
import { FaCcStripe } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { AifadianIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
export type Billing = {
  id: string
  order: number
  productType: "FREE" | "PRO_MONTHLY" | "PRO_YEARLY"
  timeCycle: "NONE" | "WEEKLY" | "MONTHLY" | "YEARLY" | "PERMANENT"
  discount: number
  createdAt: Date
  updatedAt: Date
  stripeInfo: any
  aifadianInfo: any
  locales: {
    [key: string]: {
      name: string
      money: number
      oldMoney: number
      description: string
      supportAbilities: string[]
      noSupportAbilities: string[]
    }
  }
}

export default function SingleBilling({ data }: { data: Billing }) {
  const t = useTranslations("Dashboard-Billing")

  const locale = useLocale()

  const info = useMemo(() => {
    return data.locales.hasOwnProperty(locale) ? data.locales[locale] : data.locales[defaultLocale]
  }, [data, locale])

  function formatTimeCycle(timeCycle: string) {
    console.log(timeCycle)
    return timeCycle === "NONE" || timeCycle === "PERMANENT" ? t("NoLimit") : timeCycle === "WEEKLY" ? t("Week") : timeCycle === "MONTHLY" ? t("Month") : timeCycle === "YEARLY" ? t("Year") : ""
  }

  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
  const [type, setType] = useState("stripe")

  useEffect(() => {
    if(data.stripeInfo && data.stripeInfo.quantity > 0) {
      setType("stripe")
    } else if(data.aifadianInfo && data.aifadianInfo.planId) {
      setType("aifadian")
    }
  }, [data]) 

  async function handleSubscribe() {
    startTransition(async () => {
      const stripe = await stripePromise;
      if (!stripe) {
        toast({
          title: t("Error"),
          description: t("StripeError"),
          variant: "destructive",
        })
        return
      }
      const res = await fetch("/api/user/pay?product_id=" + data.id + "&type=" + type)
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: t("StripeError"),
          variant: "destructive",
        })
        return
      }
      const resp = await res.json()
      if (resp.type === "stripe") {
        const { sessionId } = resp
        const result = await stripe.redirectToCheckout({
          sessionId: sessionId,
        });
        if (result?.error) {
          toast({
            title: t("Error"),
            description: result.error.message,
            variant: "destructive",
          })
        }
        toast({
          title: t("Success"),
          description: t("SubscribeSuccess"),
        })
      } else if (resp.type === "aifadian") {
        const { url } = resp
        router.push(url)
      }

    })
  }

  return (
    <div className="flex flex-col flex-between gap-4 rounded-xl border w-64 hover:scale-105 transition-all duration-300">
      <div className="flex flex-col ">
        <div className="flex flex-col gap-2 bg-foreground/5 p-5">
          <h3 className="text-xl font-semibold text-primary/50">{info.name}</h3>
          <h1>
            {info.oldMoney > 0 && info.oldMoney !== info.money && <span className={`text-3xl text-foreground/50 line-through pr-4`}>${info.oldMoney}</span>}
            <span className="text-3xl text-primary font-semibold">${info.money}</span>
            <span className="text-sm text-foreground/50"> / {formatTimeCycle(data.timeCycle)}</span>
          </h1>
          <p className="text-sm text-foreground/50 h-8 flex items-center">{info.description}</p>
          <div className="text-xs text-foreground/50">{t("ChoosePaymentMethod")}</div>
          <div className="flex gap-2 justify-center items-center">       
            {data.stripeInfo && data.stripeInfo.quantity > 0 && <FaCcStripe size={24} className={cn("text-blue-500 cursor-pointer", type === "stripe" ? "text-primary border border-red-500" : "text-foreground/50")} onClick={() => setType("stripe")} />}
            {data.aifadianInfo && data.aifadianInfo.planId && <AifadianIcon className={cn("cursor-pointer", type === "aifadian" ? "text-primary border border-red-500" : "text-foreground/50")} onClick={() => setType("aifadian")} />}
          </div>
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
        {info.money > 0 && <Button className="rounded-full w-full" onClick={handleSubscribe} disabled={isPending}>{t("Subscribe")}</Button>}
      </div>
    </div>
  )
}
