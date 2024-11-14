"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SingleBilling from "./single-billing";
import { PriceBilling } from "./single-billing";
import { useState } from "react";
import { useTranslations } from "next-intl";
type PricesListProps = {
  freeBilling: PriceBilling | undefined
  proBillingMonth: PriceBilling | undefined
  proBillingYear: PriceBilling | undefined
}

export default function PricesList({ freeBilling, proBillingMonth, proBillingYear}: PricesListProps) {
  const t = useTranslations("Price")
  const [value, setValue] = useState("monthly")

  return (
    <Tabs className="container gap-y-2" value={value} onValueChange={setValue}>
      <div className="flex justify-center items-center mb-10">
        <TabsList>
          <TabsTrigger value="monthly" className="w-32">{t("Monthly")}</TabsTrigger>
          <TabsTrigger value="yearly" className="w-32">{t("Yearly")}</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="monthly">
        <div className="flex flex-wrap gap-x-20 gap-y-4">
          {freeBilling && <SingleBilling data={freeBilling} />}
          {proBillingMonth && <SingleBilling data={proBillingMonth} />}
          {/* {businessBillingMonth && <SingleBilling data={businessBillingMonth} />} */}
        </div>
      </TabsContent>
      <TabsContent value="yearly">
        <div className="flex flex-wrap gap-x-20 gap-y-4">
          {freeBilling && <SingleBilling data={freeBilling} />}
          {proBillingYear && <SingleBilling data={proBillingYear} />}
          {/* {businessBillingYear && <SingleBilling data={businessBillingYear} />} */}
        </div>
      </TabsContent>
    </Tabs>
  )
}