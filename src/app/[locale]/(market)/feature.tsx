"use client"
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/lib/routing";

export default function Feature({ title, description, docs, icon }: { title: string, description: string, docs: string, icon: React.ReactNode }) {

    const t = useTranslations("Home")
    const locale = useLocale()
    const router = useRouter()

    function handleToDocs() {
        //@ts-ignore
        router.push({ pathname: docs }, { locale: locale })
    }

    return (
        <div className="flex flex-col rounded-xl border p-5 gap-y-10 max-w-xs">
            <div>
                {icon}
            </div>
            <div className="flex flex-col gap-y-2">
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-md text-muted-foreground">{description}</p>
            </div>

            <div className="flex justify-end">
                <Button className="w-full rounded-lg" variant={"outline"} onClick={handleToDocs}>
                    {t("ToDocs")}
                    <ArrowRight />
                </Button>
            </div>
        </div>
    )
}