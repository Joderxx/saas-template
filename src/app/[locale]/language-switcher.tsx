"use client";
import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {locales} from "@/lib/languages";
import {I18nIcon} from "@/components/icons";
import {useParams} from "next/navigation";
import {useTransition} from "react";
import {useRouter, usePathname} from "@/lib/routing";

export function LanguageSwitcher() {

  const t = useTranslations("Languages")
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function setLanguage(language: string) {
    startTransition(() => {
      router.replace(
        //@ts-ignore
        {pathname, params},
        {locale: language}
      );
    });
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer rounded-md hover:bg-primary/10 p-3">
              <I18nIcon size={20} className="text-primary/90"/>
            </div>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {t("Change Language")}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end">
        {
          locales.map(e => (
            <DropdownMenuItem key={e} onClick={() => setLanguage(e)}>
            {t(e)}
            </DropdownMenuItem>
          ))
        }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
