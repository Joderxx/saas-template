import {getLocale} from "next-intl/server"
import {defaultLocale} from "@/lib/languages"
import {notFound, redirect,} from "next/navigation"
import {prisma} from "@/lib/prisma"
import {getPage} from "@/lib/notion/notion";
import {getPage as getRawPage} from "@/lib/notion-api";
import {
  previewImagesEnabled,
} from '@/lib/notion/config'
import {NotionPage} from "@/components/notion/notion-page";
import { auth } from "@/lib/auth";
import { Role } from "@/lib/role-utils";

export async function generateStaticParams() {
  const res = await prisma.blog.findMany({
    select: {
      id: true
    }
  })
  return res.map((item) => ({blogId: item.id}))
}

export default async function BlogPage({params}: { params: { blogId: string } }) {
  const locale = await getLocale()
  const blog = await prisma.blog.findUnique({
    where: {
      id: params.blogId || ""
    },
    select: {
      id: true,
      localeContent: true,
      hasAuth: true,
      role: true
    }
  })
  const session = await auth()
  if (!blog || !blog.localeContent) {
    return notFound()
  }
  if (blog.hasAuth && !session) {
    return notFound()
  }
  if (blog.hasAuth && !new Role(session).hasAnyRole(blog.role)) {
    return notFound()
  }
  const id = blog.localeContent[locale] || blog.localeContent[defaultLocale]
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