import {getLocale} from "next-intl/server"
import {defaultLocale} from "@/lib/languages"
import {notFound,} from "next/navigation"
import {prisma} from "@/lib/prisma"
import {getPage} from "@/lib/notion/notion";
import {getPage as getRawPage} from "@/lib/notion-api";
import {
  previewImagesEnabled,
} from '@/lib/notion/config'
import {NotionPage} from "@/components/notion/notion-page";
import moment from "moment";
import { Role } from "@/lib/role-utils";
import { auth } from "@/lib/auth";

export async function generateStaticParams() {
  const res = await prisma.docs.findMany({
    select: {
      id: true
    }
  })
  return res.map((item) => ({docsId: item.id}))
}

export default async function DocsPage({params}: { params: { docsId: string } }) {
  const locale = await getLocale()
  const docs = await prisma.docs.findUnique({
    where: {
      id: params.docsId || ""
    },
    select: {
      id: true,
      localeContent: true,
      hasAuth: true,
      role: true
    }
  })
  const session = await auth()
  if (!docs || !docs.localeContent) {
    return notFound()
  }
  if (docs.hasAuth && !session) {
    return notFound()
  }
  if (docs.hasAuth && !new Role(session).hasAnyRole(docs.role)) {
    return notFound()
  }
  if (!docs || !docs.localeContent) {
    return notFound()
  }
  const id = docs.localeContent[locale] || docs.localeContent[defaultLocale]
  if (!id) {
    return notFound()
  }
  const recordMap = await getPage(id)
  const page = await getRawPage(id)

  return (
    <div>
      <NotionPage
        properties={page.properties}
        recordMap={recordMap}
        previewImagesEnabled={previewImagesEnabled}
      />
    </div>
  )
}