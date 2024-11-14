import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { auth, unstable_update } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getEnv } from "@/lib/env-utils"
import { SUPER_ADMIN_ROLE } from "@/lib/utils"

const validateRoleForm = z.object({
  role: z.string().refine((value) => value === SUPER_ADMIN_ROLE, { message: "Invalid role" })
})

export async function POST(request: NextRequest) {
  const env = await getEnv()
  if (!env.dev) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const role = request.nextUrl.searchParams.get("role")
  const result = validateRoleForm.safeParse({ role })
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 })
  }
  const session = await auth()
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user) {
    // @ts-ignore
    session.user.role = result.data.role
    await unstable_update(session)
  }
  await prisma.user.update({
    where: { email: session.user.email },
    data: { roleId: result.data.role }
  })
  return NextResponse.json({ message: "Role changed" }, { status: 200 })
} 

