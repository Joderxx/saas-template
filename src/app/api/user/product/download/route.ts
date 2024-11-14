import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { ADMIN_ROLE } from "@/lib/utils"
import { Role } from "@/lib/role-utils"
import { SUPER_ADMIN_ROLE } from "@/lib/utils"
export const GET = async (request: NextRequest) => {

    const user = await auth()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!new Role(user).hasAnyRole(["VIP_1", ADMIN_ROLE, SUPER_ADMIN_ROLE])) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    const product = await prisma.downloadProductInfo.findUnique({
        where: { id: id || "" }
    })

    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.redirect(product.url)
}