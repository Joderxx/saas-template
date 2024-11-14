"use server"
import { prisma } from "@/lib/prisma"
import SingleBilling, { Billing } from "./single-billing"
import { getTranslations } from "next-intl/server"
import { getEnv } from "@/lib/env-utils"
export default async function Page() {
  const t = await getTranslations("Dashboard-Billing")

  const billings: Billing[] = await getBillings()
  const isDev = (await getEnv()).dev

  async function getBillings() {
    const billings = await prisma.product.findMany({
      orderBy: {
        order: "asc"
      },
      select: {
        id: true,
        timeCycle: true,
        locales: true,
        aifadianInfo: true,
        stripeInfo: true,
        createdAt: true,
        updatedAt: true
      }
    })
    return billings.map((billing) => {
      const locales = billing.locales as any
      for (const locale in locales) {
        locales[locale] = {
          ...locales[locale],
          supportAbilities: locales[locale].supportAbilities.split("\n"),
          noSupportAbilities: locales[locale].noSupportAbilities.split("\n")
        }
      }
      return {
        ...billing,
        createdAt: billing.createdAt,
        updatedAt: billing.updatedAt,
        locales: locales
      } as Billing
    })
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t("Title")}</h1>
      <div className="flex flex-wrap gap-4 justify-center">
        {billings.map((billing) => (
          <SingleBilling data={billing} key={billing.id} />
        ))}
      </div>
      <div className="flex flex-col justify-center items-center gap-4">
        {isDev && <p className="text-sm text-red-500">{t("TestNotice")}</p>}
        {isDev && <p className="text-sm text-red-500">{t("StripeTestNotice")}</p>}
      </div>
    </div>
  )
}
