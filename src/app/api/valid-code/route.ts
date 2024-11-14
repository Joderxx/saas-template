import { get } from "@/lib/redis"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const code = searchParams.get("code")
    const type = searchParams.get("type")
    if (!email || !code || !type) {
        return new Response("Invalid request", { status: 400 })
    }
    const result = await get(`validate_code:${email}:${type}`)
    if (result === code) {
        return new Response("OK", { status: 200 })
    }
    return new Response("Invalid code", { status: 400 })
}