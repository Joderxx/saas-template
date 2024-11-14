import { Client } from "@notionhq/client"
import { PageObjectResponse, PartialDatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { locales } from "./languages"

export const notionApi = new Client({
  auth: process.env.NOTION_API_KEY
})

export const getDatabase = async () => {
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) {
    return null
  }

  const response = await notionApi.databases.query({
    database_id: databaseId
  })

  return response.results as PartialDatabaseObjectResponse[]
}

export const getPage = async (pageId: string) => {
  const response = await notionApi.pages.retrieve({
    page_id: pageId
  })
  return response as PageObjectResponse
}

export const getPageLocaleContent = async (pageId: string) => {
  const page = await getPage(pageId)
  const localeContent: any = {}
  for (const locale of locales) {
    const content = page.properties[locale]
    if (content && content.type === "relation") {
      const list = content.relation.map((item) => item.id)
      if (list.length > 0) {
        localeContent[locale] = list[0]
      }
    }
  }
  return localeContent
}
