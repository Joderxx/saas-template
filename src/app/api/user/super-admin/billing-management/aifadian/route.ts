import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get("id")
    if (!id) {
        return new Response("Invalid id", { status: 400 })
    }
    const product = await prisma.product.findUnique({
        where: { id },
        select: {
            aifadianInfo: true
        }
    })
    if (!product || !product.aifadianInfo) {
        return new Response("Product not found", { status: 404 })
    }
    return NextResponse.json(product.aifadianInfo)
}

const validateForm = z.object({
    id: z.string(),
    planId: z.string(),
})

export async function PUT(request: NextRequest) {
    const body = await request.json()
    const result = validateForm.safeParse(body)
    if (!result.success) {
        return new Response("Invalid data", { status: 400 })
    }

    await prisma.product.update({
        where: {
            id: result.data.id
        },
        data: {
            aifadianInfo: {
                planId: result.data.planId
            }
        }
    })
    return NextResponse.json({ message: "Success" })
} 