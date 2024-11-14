import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { defaultLocale } from "@/lib/languages"
import { parseProductType, parseTimeCycle } from "@/lib/prisma-enums"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const start = parseInt(searchParams.get("start") || "0")
    const offset = parseInt(searchParams.get("offset") || "10")

    const orderBy: any = {}
    if (searchParams.has("order")) {
        orderBy.order = searchParams.get("order") === "asc" ? "asc" : "desc"
    }
    if (searchParams.has("updatedAt")) {
        orderBy.updatedAt = searchParams.get("updatedAt") === "asc" ? "asc" : "desc"
    }
    if (searchParams.has("productType")) {
        orderBy.productType = searchParams.get("productType") === "asc" ? "asc" : "desc"
    }
    if (searchParams.has("createdAt")) {
        orderBy.createdAt = searchParams.get("createdAt") === "asc" ? "asc" : "desc"
    }

    const data = await prisma.product.findMany({
        orderBy: orderBy,
        skip: start,
        take: offset,
        select: {
            id: true,
            locales: true,
            productType: true,
            timeCycle: true,
            discount: true,
            createdAt: true,
            updatedAt: true,
            stripeInfo: true,
            aifadianInfo: true,
            role: true,
            order: true
        }
    })

    return NextResponse.json({
        data: data,
        total: await prisma.product.count(),
        start: start,
        offset: offset,
        orderBy: orderBy,
    })
}

const validateAddBillingForm = z.object({
    id: z.string().min(1).max(32),
    order: z.number().default(0).optional(),
    productType: z.enum(["FREE", "PRO_MONTHLY", "PRO_YEARLY", "PRO_FIXED"]),
    timeCycle: z.enum(["NONE", "WEEKLY", "MONTHLY", "YEARLY", "PERMANENT"]),
    discount: z.number().default(0)
})

interface LocaleInfo {
    locale: string
    name: string
    description: string
    money: number
    oldMoney?: number
    supportAbilities: string
    noSupportAbilities: string
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const { data, success } = validateAddBillingForm.safeParse(body)

    if (!success) {
        return NextResponse.json({
            message: "Invalid request"
        }, { status: 400 })
    }

    await prisma.product.create({
        data: {
            id: data.id,
            order: data.order,
            productType: parseProductType(data.productType),
            timeCycle: parseTimeCycle(data.timeCycle),
            discount: data.discount || 0,
            locales: {
                [defaultLocale]: {
                    name: "",
                    description: "",
                    money: 0,
                    oldMoney: 0,
                    supportAbilities: "",
                    noSupportAbilities: ""
                } as LocaleInfo
            } as any
        }
    })
    return NextResponse.json({
        message: "Add billing success"
    }, { status: 200 })
}

const validateUpdateBillingForm = z.object({
    id: z.string().min(1).max(32),
    newId: z.string().min(1).max(32),
    order: z.number().default(0).optional(),
    productType: z.enum(["FREE", "PRO_MONTHLY", "PRO_YEARLY", "PRO_FIXED"]),
    timeCycle: z.enum(["NONE", "WEEKLY", "MONTHLY", "YEARLY", "PERMANENT"]),
    discount: z.number().default(0),
    role: z.string().min(1)
})

export async function PUT(request: NextRequest) {
    const body = await request.json()
    const { data, success } = validateUpdateBillingForm.safeParse(body)
    if (!success) {
        return NextResponse.json({
            message: "Invalid request"
        }, { status: 400 })
    }
    const product = await prisma.product.findUnique({
        where: {
            id: data.id
        }
    })
    if (!product) {
        return NextResponse.json({
            message: "Product not found"
        }, { status: 404 })
    }
    const checkNewId = await prisma.product.count({
        where: {
            id: data.newId,
            createdAt: {
                not: product.createdAt
            }
        }
    }) > 0
    if (checkNewId) {
        return NextResponse.json({
            message: "New id already exists"
        }, { status: 400 })
    }
    await prisma.product.update({
        where: {
            id: data.id
        },
        data: {
            id: data.newId,
            order: data.order,
            productType: parseProductType(data.productType),
            timeCycle: parseTimeCycle(data.timeCycle),
            discount: data.discount || 0,
            role: data.role
        }
    })
    return NextResponse.json({
        message: "Update billing success"
    }, { status: 200 })
}


export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id") || ""

    if (id === "") {
        return NextResponse.json({
            message: "Id is required"
        }, { status: 400 })
    }

    await prisma.product.delete({
        where: {
            id: id
        }
    })

    return NextResponse.json({
        message: "Success"
    })
}

