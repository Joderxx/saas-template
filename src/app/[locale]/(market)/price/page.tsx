import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PriceBilling } from "./single-billing";
import PricesList from "./prices-list";
import CompareTable from "./compare-table";
import AppFooter from "../app-footer";

export default async function Page() {
  const t = await getTranslations("Price")
  const billings: PriceBilling[] = await getBillings()

  const freeBilling = billings.filter((billing) => billing.id === "Free")[0] as unknown as (PriceBilling | undefined )
  const proBillingMonth = billings.filter((billing) => billing.id === "Pro_Monthly")[0] as unknown as (PriceBilling | undefined)
  // const businessBillingMonth = billings.filter((billing) => billing.id === "Business_Month")[0] as unknown as (PriceBilling | undefined)
  const proBillingYear = billings.filter((billing) => billing.id === "Pro_Yearly")[0] as unknown as (PriceBilling | undefined)
  // const businessBillingYear = billings.filter((billing) => billing.id === "Business_Year")[0] as unknown as (PriceBilling | undefined)

  async function getBillings() {
    const billings = await prisma.product.findMany({
      orderBy: {
        order: "asc"
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
      } as PriceBilling
    })
  }
  return (
    <main className="flex flex-col gap-4">
      <section className="flex flex-col justify-center items-center gap-y-4 py-20">
        <div className="py-4">
          <span className="text-center uppercase text-md bg-gradient-to-r from-pink-500 to-green-500 text-transparent bg-clip-text font-extrabold">{t("Title")}</span>
        </div>
        <div className="flex flex-wrap gap-x-20 gap-y-4">
          <PricesList freeBilling={freeBilling} proBillingMonth={proBillingMonth} proBillingYear={proBillingYear} />
        </div>
      </section>

      <section className="flex flex-col justify-center items-center gap-y-4 py-20">
        <div className="py-4">
          <span className="text-center uppercase text-md bg-gradient-to-r from-pink-500 to-green-500 text-transparent bg-clip-text font-extrabold">{t("Compare")}</span>
        </div>
        <div className="flex flex-wrap gap-x-20 gap-y-4">
          <CompareTable />
        </div>
      </section>
      <AppFooter />
    </main>
  )
}