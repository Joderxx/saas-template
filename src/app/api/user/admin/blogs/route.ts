import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { z } from "zod"
import { getPageLocaleContent } from "@/lib/notion-api"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get("start")
    const offset = searchParams.get("offset")
    const where: any = {}

    if (searchParams.has("hasAuth")) {
        where.hasAuth = searchParams.get("hasAuth") === "true"
    }
    if (searchParams.has("startCreateAt") && searchParams.has("endCreateAt")) {
        where.createAt = {
            gte: new Date(searchParams.get("startCreateAt") || "0"),
            lte: new Date(searchParams.get("endCreateAt") || "0")
        }
    }
    if (searchParams.has("startUpdateAt") && searchParams.has("endUpdateAt")) {
        where.updateAt = {
            gte: new Date(searchParams.get("startUpdateAt") || "0"),
            lte: new Date(searchParams.get("endUpdateAt") || "0")
        }
    }
    if (searchParams.has("notionHerf")) {
        where.notionHerf = searchParams.get("notionHerf")
    }
    const orderBy: any = {}
    if (searchParams.has("order")) {
        orderBy.order = searchParams.get("order") === "asc" ? "asc" : "desc"
    }

    const blogs = await prisma.blog.findMany({
        where,
        orderBy,
        skip: Number(start),
        take: Number(offset)
    })

    return NextResponse.json({
        data: blogs,
        total: await prisma.blog.count({ where }),
        start: Number(start),
        offset: Number(offset),
        orderBy
    })
}

const ValidBlog = z.object({
    description: z.string().min(1),
    notionHerf: z.string().min(1),
    order: z.number().default(0).optional(),
    group: z.string().default("").optional(),
    top: z.boolean().default(false).optional(),
    hasAuth: z.boolean().default(false).optional(),
    role: z.array(z.string()).default([]).optional()
})

export async function POST(request: NextRequest) {
    const body = await request.json()
    const { data, success } = ValidBlog.safeParse(body)

    if (!success) {
        return NextResponse.json({
            message: "Invalid data"
        }, { status: 400 })
    }

    await prisma.blog.create({
        data: {
            ...data,
            localeContent: await getPageLocaleContent(data.notionHerf)
        }
    })

    return NextResponse.json({
        message: "Create blog success"
    })
}

const ValidBlogUpdate = z.object({
    id: z.string().min(1),
    description: z.string().min(1),
    notionHerf: z.string().min(1),
    order: z.number().default(0).optional(),
    group: z.string().default("").optional(),
    hasAuth: z.boolean().default(false).optional(),
    role: z.array(z.string()).default([]).optional()
})

export async function PUT(request: NextRequest) {
    const body = await request.json()
    const { data, success } = ValidBlogUpdate.safeParse(body)

    if (!success) {
        return NextResponse.json({
            message: "Invalid data"
        }, { status: 400 })
    }

    await prisma.blog.update({
        where: {
            id: data.id
        },
        data: {
            ...data,
            localeContent: await getPageLocaleContent(data.notionHerf)
        }
    })

    return NextResponse.json({
        message: "Update blog success"
    })
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
        return NextResponse.json({
            message: "Invalid id"
        }, { status: 400 })
    }

    await prisma.blog.delete({
        where: { id }
    })

    return NextResponse.json({
        message: "Delete blog success"
    })
}

