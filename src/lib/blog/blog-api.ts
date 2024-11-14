import { getLocale } from "next-intl/server"
import { prisma } from "../prisma"
import { defaultLocale } from "../languages"
import { getPage } from "../notion-api"
import { Role } from "../role-utils"
import { auth } from "../auth"

export type BlogItemInfo = {
  id: string
  title: string
  description: string
  category: string
  createdAt: Date
  cover: string
  tags: string[]
  top: boolean,
  hasAuth: boolean
}

export async function getBlogList(type: string, start: number, offset: number = 10) {
  if (start > 30) {
    return []
  }
  const locale = await getLocale()
  const where: any = {}
  if (type !== "All") {
    where.group = type
  }
  const blogs = await prisma.blog.findMany({
    where: where,
    orderBy: [
      {
        top: "desc"
      },
      {
        createdAt: "desc"
      }
    ],
    take: offset,
    skip: start,
  })
  const ret: BlogItemInfo[] = []
  const session = await auth()
  for (const blog of blogs) {
    if (blog.hasAuth) {
      if (!session) {
        continue
      }
      if (!new Role(session).hasAnyRole(blog.role)) {
        continue
      }
    }
    const pageId = blog.localeContent?.[locale] || blog.localeContent?.[defaultLocale]
    if (!pageId) {
      continue
    }
    const page = await getPage(pageId)
    // @ts-ignore
    const title = page.properties["Title"]?.title?.[0]?.plain_text
    // @ts-ignore
    const description = page.properties["Description"]?.rich_text?.[0]?.plain_text
    // @ts-ignore
    const cover = page.properties["Cover"]?.files?.[0]?.name || ""
    // @ts-ignore
    const tags = page.properties["Tags"]?.multi_select?.map((tag: any) => tag.name as string)

    ret.push({
      id: blog.id,
      title: title || "",
      description: description || "",
      category: blog.group,
      createdAt: blog.createdAt,
      cover: cover || "",
      tags: tags || [],
      top: blog.top,
      hasAuth: blog.hasAuth
    } as BlogItemInfo)
  }
  return ret
}