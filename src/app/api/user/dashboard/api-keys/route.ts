import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

export const GET = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get("start") || "0"
    const offset = searchParams.get("offset") || "10"

    const session = await auth()
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user

    const orderBy: any = {};
    if(searchParams.has("createdAt")) {
        orderBy.createdAt = searchParams.get("createdAt") === "asc" ? "asc" : "desc";
    }

    const apiKeys = await prisma.apiKey.findMany({
        where: {
            userId: user.id
        },
        orderBy: orderBy,
        skip: parseInt(start),
        take: parseInt(offset)
    })

    const total = await prisma.apiKey.count({
        where: {
            userId: user.id
        }
    })

    return NextResponse.json({
        data: apiKeys,
        total: total,
        start: parseInt(start),
        offset: parseInt(offset),
        orderBy: orderBy
    })
}

const validateForm = z.object({
    name: z.string().min(4).max(32),
})

export const POST = async (request: NextRequest) => {
    const body = await request.json()
    const { name } = body

    const { success, error } = validateForm.safeParse({ name })
    if (!success) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const session = await auth()
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user

    const apiKey = await prisma.apiKey.create({
        data: {
            name,
            key: crypto.randomUUID().replace(/-/g, ""),
            userId: user.id || ""
        }
    })

    return NextResponse.json({ message: "API key created", key: apiKey.key }, { status: 200 })
}

export const DELETE = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id") || ""

    const session = await auth()
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user

    await prisma.apiKey.delete({
        where: {
            id,
            userId: user.id || ""
        }
    })

    return NextResponse.json({ message: "API key deleted" }, { status: 200 })
}
