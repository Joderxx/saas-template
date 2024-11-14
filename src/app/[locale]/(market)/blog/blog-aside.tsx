import { blogGroups } from "@/lib/blog-groups";
import { getTranslations } from "next-intl/server";
import { LiaAngellist, LiaBlogSolid } from "react-icons/lia";
import BlogAsideLink from "./blog-aside-link";


export default async function BlogAside() {
  const t = await getTranslations("BlogGroup")
  return (
    <aside className="sticky top-20">
      <div className="flex flex-col gap-4 min-h-64 p-4">
        <div className="p-2 flex items-center gap-2">
          <BlogAsideLink href="/blog/categories/All" icon={<LiaBlogSolid size={20} className="text-red-400" />}>{t("All")}</BlogAsideLink>
        </div>
        {blogGroups.map(e => (
          <div key={e} className="p-2 flex items-center gap-2">
            <BlogAsideLink href={`/blog/categories/${e}`} icon={<LiaAngellist size={20} className="text-cyan-400" />}>{t(e)}</BlogAsideLink>
          </div>
        ))}
      </div>
    </aside>
  )
}