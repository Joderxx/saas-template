import { getTranslations } from "next-intl/server"

export default async function NotFound() {
  const t = await getTranslations("General")
  return <div className="w-full flex flex-col gap-4 justify-center items-center h-96">
    <h1 className="text-2xl font-bold">{t("NotFoundTitle")}</h1>
    <p className="text-md text-primary/50">{t("NotFoundDescription")}</p>
  </div>
}