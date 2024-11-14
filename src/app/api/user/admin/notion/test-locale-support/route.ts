import { locales } from "@/lib/languages";
import { getPage } from "@/lib/notion-api";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get("id")

    if (!id) {
        return NextResponse.json({
            message: "Invalid id"
        }, { status: 400 })
    }

    const data: PageObjectResponse = await getPage(id)

    const supportLocale = {}

    locales.forEach(locale => {
        const property = data.properties[locale]
        if (property) {
            if (property.type === "relation") {
                supportLocale[locale] = property.relation.map(relation => relation.id).length > 0
            }
        }
    })

    return NextResponse.json({
        data: supportLocale
    })
}