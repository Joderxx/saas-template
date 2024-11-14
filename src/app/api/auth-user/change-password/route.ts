import { del } from "@/lib/redis"
import { validateCode } from "@/lib/user"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { hashPassword } from "@/lib/utils"

const changePasswordForm = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(32),
    validateCode: z.string().min(6)
}).refine((data) => {
    if (!data.email || !validateCode(data.email, "resetPassword", data.validateCode)) {
        return false
    }
    return true
}, {
    path: ["email"]
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const result = changePasswordForm.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 })
  }
  const user = await prisma.user.findUnique({where: {email: result.data.email}})
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 400 })
  }
  const newPassword = hashPassword(result.data.password)
  await prisma.user.update({where: {email: result.data.email}, data: {password: newPassword}})
  await del(`validate_code:${result.data.email}:resetPassword`)
  return NextResponse.json({ message: "Password changed" }, { status: 200 })
}