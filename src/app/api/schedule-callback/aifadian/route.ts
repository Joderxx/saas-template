import { decrypt } from "@/lib/aifadian/aifadian-api"
import { serverEvent } from "@/lib/app-event"
import { roleAdmin } from "@/lib/init/sql"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    const body = await request.json()
    if (body.ec !== 200) {
        return NextResponse.json({ "ec": 400, "em": "error" }, { status: 400 })
    }
    const remark = body.data.order.remark
    const { email, productId, increaseDay } = decrypt(remark)
    const orderId = body.data.order.custom_order_id || body.data.order.out_trade_no
    const price = parseFloat(body.data.order.total_amount)
    let order = await prisma.order.findUnique({
        where: {
            orderId
        }
    })
    if (order) {
        return NextResponse.json({ "ec": 200, "em": "success" })
    }
    if (email && productId) {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            return NextResponse.json({ "ec": 200, "em": "success" })
        }
        serverEvent.emit("user-charge", { user, price })
        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        })
        if (!product) return NextResponse.json({ "ec": 200, "em": "success" })
        const role = user.roleId === roleAdmin.id ? roleAdmin.id : product.role
        const addEndSubscriptionTime = increaseDay === 0 ? 0 : new Date().getTime() + increaseDay * 24 * 60 * 60 * 1000
        const endSubscriptionAt = user.endSubscriptionAt && user.endSubscriptionAt >= new Date() ?
            new Date(user.endSubscriptionAt.getTime() + addEndSubscriptionTime)
            : new Date(new Date().getTime() + addEndSubscriptionTime)
        // 修改角色
        await prisma.user.update({
            where: { email },
            data: {
                roleId: role,
                endSubscriptionAt: endSubscriptionAt
            }
        })
    }

    //添加订单
    await prisma.order.create({
        data: {
            email: email || "",
            orderId: orderId || "",
            productId: productId || "",
            createdAt: new Date(),
            type: "aifadian",
            price: price,
            simulate: false
        }
    })

    return NextResponse.json({ "ec": 200, "em": "success" })
}