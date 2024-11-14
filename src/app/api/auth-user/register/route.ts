import { prisma } from "@/lib/prisma"
import { hashPassword, USER_ROLE } from "@/lib/utils"
import { del } from "@/lib/redis"
import { validateCode } from "@/lib/user"
import { ProductType, User } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { signIn } from "@/lib/auth"


const validateRegisterForm = z.object({
    username: z.string().min(4),
    email: z.string().email(),
    password: z.string().min(8).max(32),
    validateCode: z.string().min(6)
}).refine((data) => {
    if (!data.email || !validateCode(data.email, "register", data.validateCode)) {
        return false
    }
    return true
}, {
    path: ["email"]
})

export async function POST(request: NextRequest) {
    const body = await request.json()
    const result = validateRegisterForm.safeParse(body)
    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: 400 })
    }
    let user = await prisma.user.findUnique({where: {email: result.data.email}})
    if (user) {
        if (!user.password) {
            user.password = hashPassword(result.data.password)
            await prisma.user.update({ where: { email: result.data.email }, data: user })
            await del(`validate_code:${result.data.email}:register`)
            return NextResponse.json({ message: "User updated" }, { status: 200 })
        } else {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }
    }
    const password = hashPassword(result.data.password)

    user = {
        email: result.data.email,
        password: password,
        name: result.data.username,
        emailVerified: null,
        image: null,
        roleId: USER_ROLE,
        hasChangedPassword: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        endSubscriptionAt: new Date(9999, 1, 1),
        productType: ProductType.FREE,
        totalMoney: 0,
        monthlyMoney: 0,
        totalActualMoney: 0,
        monthlyActualMoney: 0,
        forbidden: false
    } as User
    await prisma.user.create({ data: user })
    await del(`validate_code:${result.data.email}:register`)
    await signIn("credentials", { email: result.data.email, password: result.data.password, redirect: false })
    return NextResponse.json({ message: "User created" }, { status: 200 })
}