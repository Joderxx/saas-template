import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { auth, unstable_update } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const validateNameForm =z.object({
  name: z.string().min(4).max(32),
})

export async function POST(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")
  const result = validateNameForm.safeParse({ name })
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 })
  }
  const session = await auth()
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user) {
    session.user.name = result.data.name
    await unstable_update(session)
  }
  await prisma.user.update({
    where: { email: session.user.email },
    data: { name: result.data.name }
  })
  return NextResponse.json({ message: "Name changed" }, { status: 200 })
}
