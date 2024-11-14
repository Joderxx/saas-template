import { prisma } from "@/lib/prisma"
import { SUPER_ADMIN_ROLE } from "@/lib/utils"

import { NextResponse } from "next/server"

import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
    const data = await prisma.userRole.findMany({
        where: {
            id: {
                not: SUPER_ADMIN_ROLE
            }
        }
    })
    return NextResponse.json({data: data})
}