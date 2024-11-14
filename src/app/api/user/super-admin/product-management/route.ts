import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get("start") || "0"
  const offset = searchParams.get("offset") || "10"

  const orderBy: any = {};
  if (searchParams.has("createdAt")) {
    orderBy.createdAt = searchParams.get("createdAt") === "asc" ? "asc" : "desc";
  }

  const apiKeys = await prisma.downloadProductInfo.findMany({
    orderBy: orderBy,
    skip: parseInt(start),
    take: parseInt(offset)
  })

  const total = await prisma.downloadProductInfo.count()

  return NextResponse.json({
    data: apiKeys,
    total: total,
    start: parseInt(start),
    offset: parseInt(offset),
    orderBy: orderBy
  })
}

const validateForm = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().url()
})

export const POST = async (request: NextRequest) => {
  const body = await request.json()
  const { name, description, url } = body

  const { data, success, error } = validateForm.safeParse({ name, description, url })
  if (!success) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const product = await prisma.downloadProductInfo.create({
    data: {
      name: data.name,
      description: data.description,
      url: data.url
    }
  })

  return NextResponse.json({ message: "Product created", id: product.id }, { status: 200 })
}

export const DELETE = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id") || ""

  await prisma.downloadProductInfo.delete({
    where: {
      id
    }
  })

  return NextResponse.json({ message: "Product deleted" }, { status: 200 })
}
