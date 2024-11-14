import { getBlogList } from "@/lib/blog/blog-api"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || ""
  const start = searchParams.get("start") || "0"
  const offset = searchParams.get("offset") || "10"
  const blogList = await getBlogList(type, parseInt(start), parseInt(offset))
  return NextResponse.json(blogList)
}