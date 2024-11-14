
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

export default function TestNotionPage({ pageId }: { pageId: string }) {
  const t = useTranslations("General")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleClick() {
    fetch(`/api/user/admin/notion/test-locale-support?id=${pageId}`)
      .then(res => res.json())
      .then(data => {
        toast({
          title: t("SupportLocale"),
          description: (
            <div className="flex flex-col gap-y-2">
              <div>{t("SupportLocaleNumber")}: {Object.keys(data.data).filter(key => data.data[key]).length}</div>
              <div>
                {Object.keys(data.data).filter(key => data.data[key]).join(", ")}
              </div>
            </div>
          )
        })
      })
  }
  return (
    <Button disabled={isPending} onClick={() => startTransition(handleClick)}>
      {t("Test")}
    </Button>
  )
}