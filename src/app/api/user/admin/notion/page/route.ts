import { getDatabase, getPage } from "@/lib/notion-api";
import { NextRequest, NextResponse } from "next/server";

// test notionHerf can be accessed
export async function GET(request: NextRequest) {
    const notionHerf = request.nextUrl.searchParams.get("notionHerf")

    if (!notionHerf) {
        return NextResponse.json({
            message: "Invalid notionHerf"
        }, { status: 400 })
    }

    const data = await getPage(notionHerf)

    return NextResponse.json(data)
}