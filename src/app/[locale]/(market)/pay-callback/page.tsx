"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function PayCallback() {
    const searchParams = useSearchParams()
    const t = useTranslations("General")
    const status = searchParams.get("status")
    const callbackUrl = searchParams.get("callbackUrl")
    return <div className="flex flex-col gap-4 justify-center items-center h-screen">
        <h1 className="text-2xl font-bold">{status === "success" ? t("PaySuccess") : t("PayFailed")}</h1>
        <Button className="w-16">
            <Link href={decodeURI(callbackUrl as string)}>{t("Return")}</Link>
        </Button>
    </div>
}