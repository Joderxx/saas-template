import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { locales } from "@/lib/languages"
import { prisma } from "@/lib/prisma"

const validateUpdateBillingForm = z.object({
    locale: z.enum([...locales] as [string, ...string[]]),
    name: z.string().min(1),
    money: z.number().min(0),
    oldMoney: z.number().optional(),
    description: z.string().optional(),
    supportAbilities: z.string().min(1),
    noSupportAbilities: z.string().optional(),
})

export async function PUT(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id") || ""
    const body = await request.json()
    const { data, success } = validateUpdateBillingForm.safeParse(body)
    if (!success) {
        return NextResponse.json({
            message: "Invalid request"
        }, { status: 400 })
    }
    const product = await prisma.product.findUnique({
        where: {
            id: id
        }
    })
    if (!product) {
        return NextResponse.json({
            message: "Product not found"
        }, { status: 404 })
    }
    const locales = {
        ...(product.locales as any || {}),
        [data.locale]: {
            name: data.name,
            money: data.money,
            oldMoney: data.oldMoney || data.money,
            description: data.description,
            supportAbilities: data.supportAbilities,
            noSupportAbilities: data.noSupportAbilities
        }
    }
    await prisma.product.update({
        where: {
            id: id
        },
        data: {
            locales: locales
        }
    })
    return NextResponse.json({
        message: "Update locale success"
    }, { status: 200 })
}