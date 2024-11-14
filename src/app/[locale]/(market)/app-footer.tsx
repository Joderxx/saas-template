import Link from "next/link";
import SubscribeBox from "./subscribe-box";
import { useTranslations } from "next-intl";

export default function AppFooter() {
  const t = useTranslations("Home")
  return (
    <footer className="flex flex-col bg-primary-foreground border-t-2  w-full">
      <div className="flex container max-w-6xl py-12">
        <div className="flex flex-1">
          <div className="flex-col flex gap-y-4 w-36">
            <h3>{t("Company")}</h3>
            <Link href="/" className="text-primary/50 hover:text-primary/30 capitalize">{t("About")}</Link>
            <Link href="/" className="text-primary/50 hover:text-primary/30 capitalize">{t("Terms")}</Link>
            <Link href="/" className="text-primary/50 hover:text-primary/30 capitalize">{t("Privacy")}</Link>
          </div>
          <div className="flex-col flex gap-y-4 w-36">
            <h3>{t("Product")}</h3>
            <Link href="/" className="text-primary/50 hover:text-primary/30 capitalize">{t("Security")}</Link>
            <Link href="/" className="text-primary/50 hover:text-primary/30 capitalize">{t("Customers")}</Link>
            <Link href="/" className="text-primary/50 hover:text-primary/30 capitalize">{t("Changelog")}</Link>
          </div>
          <div className="flex-col flex gap-y-4 w-36">
            <h3>{t("Docs")}</h3>
            <Link href="/" className="text-primary/50 hover:text-primary/30 capitalize">{t("Introduction")}</Link>
            <Link href="/" className="text-primary/50 hover:text-primary/30 capitalize">{t("Installation")}</Link>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <SubscribeBox />
        </div>
      </div>
      <div className="border-t-2">
        <p className="container py-3 text-sm max-w-6xl text-primary/60">
          &copy; {new Date().getFullYear()} {t("ProductName")}. All rights reserved. Built by Joder
        </p>
      </div>
    </footer>
  )
}