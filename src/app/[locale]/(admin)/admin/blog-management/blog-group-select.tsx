import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { blogGroups } from "@/lib/blog-groups";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export default function BlogGroupSelect({ value, onValueChange }: { value: string, onValueChange?: (value: string) => void }) {

  const t = useTranslations("BlogGroup")

  const groups = useMemo(() => blogGroups, [t])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={t("SelectGroup")} />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectItem key={group} value={group}>{group}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}