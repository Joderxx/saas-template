import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

export default async function Page() {
  const t = await getTranslations("Dashboard-Product")
  const products = await prisma.downloadProductInfo.findMany()

  return (
    <div className="flex flex-col gap-2 p-4">
      <h1 className="text-2xl font-bold">{t("Title")}</h1>
      <div className="flex flex-wrap gap-5 p-4">
        {
          products.map((product) => (
            <div key={product.id} className="flex flex-col gap-2 p-4 w-64 border shadow-sm rounded-lg hover:shadow-md hover:scale-105 transition-scall transition-shadow duration-300">
              <h2 className="text-lg font-bold">{product.name}</h2>
              <p className="text-sm text-foreground/50">{product.description}</p>
              <Button>
                <Link href={`/api/user/product/download?id=${product.id}`} target="_blank">{t("Download")}</Link>
              </Button>
            </div>
          ))
        }
      </div>
    </div>
  )
}