import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/pay/stripe-session"
import { prisma } from "@/lib/prisma"
import { roleAdmin } from "@/lib/init/sql"
import { serverEvent } from "@/lib/app-event"
export async function POST(request: NextRequest) {
    const confusion = request.nextUrl.pathname.split("/").pop()
    if (confusion !== process.env.RECHARGE_CONFUSION) {
        return NextResponse.json({ "ec": 404, "em": "error" }, { status: 404 })
    }
    const body = await request.text()
    try {
        const event = stripe.webhooks.constructEvent(body, request.headers.get("stripe-signature") as string, process.env.STRIPE_WEBHOOK_SECRET as string)
        if (event.type === "customer.subscription.updated") {
            await handleCustomerSubscriptionUpdate(event.id, event.data)
        } else if (event.type === "charge.updated") {
            await handleChargeUpdated(event.id, event.data)
        }
        return NextResponse.json({ received: true }, { status: 200 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }
}

async function handleChargeUpdated(id: string, event: any) {
    const order = await prisma.order.findUnique({
        where: {
            orderId: id
        }
    })
    if (!order) return
    const email = event.object.metadata.email
    const productId = event.object.metadata.productId
    const price = parseFloat(event.object.metadata.price)
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (!user) return
    const product = await prisma.product.findUnique({
        where: {
            id: productId
        }
    })
    if (!product) return
    serverEvent.emit("user-charge", { user, price })
    // 添加订单
    await prisma.order.create({
        data: {
            email,
            orderId: id,
            productId,
            createdAt: new Date(),
            type: "stripe",
            price: price,
            simulate: false
        }
    })
    const role = user.roleId === roleAdmin.id ? roleAdmin.id : product.role
    const addEndSubscriptionTime = event.object.metadata.increaseDay === 0 ? 0 : new Date().getTime() + event.object.metadata.increaseDay * 24 * 60 * 60 * 1000
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

async function handleCustomerSubscriptionUpdate(id: string, event: any) {
    const endSubscriptionAt = new Date(event.object.current_period_end * 1000)
    // const customerId = event.object.customer
    // const stripeCustomer = await stripe.customers.retrieve(customerId)  
    // if (!("email" in stripeCustomer)) return
    const order = await prisma.order.findUnique({
        where: {
            orderId: id
        }
    })
    if (!order) return

    const subscriptionId = event.object.id
    const subscriptionItem = await stripe.subscriptions.retrieve(subscriptionId)
    const email = subscriptionItem.metadata.email
    const productId = subscriptionItem.metadata.productId
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (!user) return

    const price = parseFloat(subscriptionItem.metadata.price)

    const product = await prisma.product.findUnique({
        where: {
            id: productId
        }
    })
    if (!product) return
    serverEvent.emit("user-charge", { user, price })
    // 添加订单
    await prisma.order.create({
        data: {
            email,
            productId,
            createdAt: new Date(),
            type: "stripe",
            price: price,
            simulate: false,
            orderId: id,
        }
    })
    const role = user.roleId === roleAdmin.id ? roleAdmin.id : product.role

    // 修改角色
    await prisma.user.update({
        where: { email },
        data: { roleId: role, endSubscriptionAt: endSubscriptionAt }
    })

}
