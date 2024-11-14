import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { NextRequest } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get("start")
  const offset = req.nextUrl.searchParams.get("offset")
  const total = await prisma.userRole.count()
  const roles = await prisma.userRole.findMany({
    skip: start ? parseInt(start) : 0,
    take: offset ? parseInt(offset) : 10,
    orderBy: {
      id: "asc"
    }
  })
  return NextResponse.json({ total, data: roles, offset: offset ? parseInt(offset) : 10, start: start ? parseInt(start) : 0 })
}

const ValidRole = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  permissions: z.array(z.string())
})

export async function POST(req: NextRequest) {
  const data = await req.json()
  const res = ValidRole.safeParse(data)
  if (!res.success) {
    return NextResponse.json({ error: res.error.message }, { status: 400 })
  }
  if (await prisma.userRole.findUnique({ where: { id: res.data.id } })) {
    return NextResponse.json({ error: "Role already exists" }, { status: 400 })
  }
  await prisma.userRole.create({ data: res.data })
  return NextResponse.json({ message: "Success" })
}

export async function PUT(req: NextRequest) {
  const data = await req.json()
  const res = ValidRole.safeParse(data)
  if (!res.success) {
    return NextResponse.json({ error: res.error.message }, { status: 400 })
  }
  await prisma.userRole.update({ where: { id: res.data.id }, data: res.data })
  return NextResponse.json({ message: "Success" })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }
  await prisma.userRole.delete({ where: { id } })
  return NextResponse.json({ message: "Success" })
}

