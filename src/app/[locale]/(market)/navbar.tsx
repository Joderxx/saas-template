"use client"
import {useLocale, useTranslations} from "next-intl";
import {Logo} from "@/components/icons";
import Link from "next/link";
import {LanguageSwitcher} from "@/app/[locale]/language-switcher";
import UserInfo from "@/app/[locale]/user-info";
import { ModeToggle } from "../darkmode-switcher";
import { useEffect, useState } from "react";

export default function Navbar({pathname}: {pathname: string}) {
  const locale = useLocale()
  const t = useTranslations("Navbar")

  const [isScrolled, setIsScrolled] = useState(false)

  function handleScroll() {
    setIsScrolled(window.scrollY > 0)
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <nav className={`flex items-center w-full h-16 border-gray-50 fixed bg-primary-foreground z-[9999] ${isScrolled ? "shadow-md border-b-2" : ""}`}>
      <div className="flex container flex-shrink justify-center items-center">
        <div className="flex-1 flex">
          <div className="flex items-center gap-x-2 w-[200px]">
            <Logo/>
            <Link href="/" locale={locale}>
              <h1 className="font-bold text-xl">{t("ProductName")}</h1>
            </Link>
          </div>
          <div className="flex ml-2 justify-center items-center gap-x-8">
            <div className="flex justify-center items-center cursor-pointer hover:text-primary/50">
              <Link href="/price" locale={locale}>
                {t("Price")}
              </Link>
            </div>
            <div className="flex justify-center items-center cursor-pointer hover:text-primary/50">
              <Link href="/blog" locale={locale}>
                {t("Blog")}
              </Link>
            </div>
            <div className="flex justify-center items-center cursor-pointer hover:text-primary/50">
              <Link href="/docs" locale={locale}>
                {t("Document")}
              </Link>
            </div>
          </div>
        </div>
        <div className="flex gap-x-2">
          <ModeToggle/>
          <LanguageSwitcher/>
          <UserInfo pathname={pathname} />
        </div>
      </div>
    </nav>
  )
}