import { sendValidateCode } from "@/lib/user"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const emailValidForm = z.object({
    email: z.string().email(),
    type: z.enum(["register", "resetPassword", "deleteAccount"])
})

// send validate code to user's email
export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get("email")
    const type = request.nextUrl.searchParams.get("type")
    const result = emailValidForm.safeParse({ email, type })
    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: 400 })
    }
    await sendValidateCode(result.data.email, result.data.type)
    return NextResponse.json({ message: "Email sent" }, { status: 200 })
}