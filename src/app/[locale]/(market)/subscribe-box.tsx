"use client"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { subscribe } from "./subscribe";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";


export default function SubscribeBox() {
    const t = useTranslations("Home");

    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            await subscribe(formData.get("email") as string);
            toast({
                title: t("SubscribeSuccess"),
                description: t("SubscribeSuccessDescription")
            });
        });
    }


    return (
        <form className="flex flex-col gap-y-4 w-80" action={handleSubmit}>
            <h3 className="text-md ">{t("SubscribeTitle")}</h3>
            <div className="flex items-center">
                <Input name="email" placeholder={t("Email")} />
                <Button className="p-4 rounded-r-3xl" type="submit" disabled={isPending}>{t("Subscribe")}</Button>
            </div>
        </form>
    )
}