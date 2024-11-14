import { signIn } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const loginForm = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(32)
})

export async function POST(request: NextRequest) {
    const body = await request.json()
    const result = loginForm.safeParse(body)
    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: 400 })
    }
    
    try {
        await signIn("credentials", { email: result.data.email, password: result.data.password, redirect: false })
        return NextResponse.json({ message: "Login successful" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
    }
}
