import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { del } from "@/lib/redis"
import { validateCode } from "@/lib/user"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const validateCodeForm = z.object({
  code: z.string().length(6)
})

export async function DELETE(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const result = validateCodeForm.safeParse({ code })
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 })
  }
  const session = await auth()
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!await validateCode(session.user.email, "deleteAccount", result.data.code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 })
  }
  await prisma.user.delete({
    where: {
      email: session.user.email
    }
  })
  await del(`validate_code:${session.user.email}:deleteAccount`)
  await signOut()
  return NextResponse.json({ message: "Account deleted" }, { status: 200 })
}

