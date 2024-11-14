"use server"
import { docsGroup } from "@/lib/docs-group"
import { getPage } from "@/lib/notion-api"
import { prisma } from "@/lib/prisma"
import { getLocale, getTranslations } from "next-intl/server"
import Link from "next/link"
import { getPathnameInServer } from "@/lib/path-utils";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth"
import { Role } from "@/lib/role-utils"

interface Docs {
  id: string
  group: string
  title: string
  order: number
}

export default async function DocsSidebar() {

  const dt = await getTranslations("DocsGroup")
  const locale = await getLocale()

  const docsGroups = docsGroup
  const docs = await getDocs()
  const pathname = await getPathnameInServer()
  const session = await auth()
  async function getDocs() {
    const docs = await prisma.docs.findMany({})
    const dict = {}
    for (const doc of docs) {
      if (doc.hasAuth) {
        if (!session) {
          continue
        }
        if (!new Role(session).hasAnyRole(doc.role)) {
          continue
        }
      }
      if (!dict[doc.group]) dict[doc.group] = []

      dict[doc.group].push({
        id: doc.id,
        group: doc.group,
        title: await getDocsTitle(doc),
        order: doc.order
      })
    }
    Object.keys(dict).forEach((key) => {
      dict[key].sort((a: Docs, b: Docs) => a.order - b.order)
    })
    return dict
  }

  async function getDocsTitle(docs: any) {
    const page = await getPage(docs.localeContent[locale])
    if (!page) return docs.description
    const title = page.properties["Title"]

    if (title.type === "title") {
      return title.title[0].plain_text
    }
    return docs.description
  }

  return (
    <aside className="sticky top-20">
      <div className="flex flex-col gap-4 min-h-64 p-4">
        {docsGroups.map((group) => (
          <div key={group}>
            {
              docs[group] && docs[group].length > 0 ? (
                <div key={group}>
                  <h3 className="text-md font-semibold">{dt(group)}</h3>
                  <div className="flex flex-col gap-2 pl-3">
                    {
                      docs[group] && docs[group].map((doc) => (
                        <Link href={`/docs/${doc.id}`} key={doc.id} locale={locale} className={cn("text-sm", pathname === `/docs/${doc.id}` ? "text-red-500" : "")}>{doc.title}</Link>
                      ))
                    }
                  </div>
                </div>
              ) : null
            }
          </div>
        ))}
      </div>
    </aside>
  )
}