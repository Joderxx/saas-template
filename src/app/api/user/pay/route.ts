import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createStripeConsumer, createStripeSubscriptionSessionMonthly, createStripeSubscriptionSessionYearly, createStripeFixedSession } from "@/lib/pay/stripe-session";
import { JsonObject } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/lib/role-utils";
import { ProductType, TimeCycle } from "@prisma/client";
import { createOrderUrl } from "@/lib/aifadian/aifadian-api";
export async function GET(request: NextRequest) {
    const session = await auth()
    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 401 })
    }
    const searchParams = request.nextUrl.searchParams
    const product_id = searchParams.get("product_id")
    if (!product_id) {
        return new Response("Product ID is required", { status: 400 })
    }
    const type = searchParams.get("type") as "stripe" | "paypal" | "aifadian"
    if (!type) {
        return new Response("Type is required", { status: 400 })
    }
    const product = await prisma.product.findUnique({
        where: {
            id: product_id
        },
        select: {
            stripeInfo: true,
            role: true,
            productType: true,
            timeCycle: true,
            aifadianInfo: true
        }
    })
    if (!product) {
        return new Response("Product not found", { status: 404 })
    }
    // 高级角色不能替换低级角色
    if (!new Role(session).canReplace(product.role)) {
        return new Response("Role not allowed", { status: 400 })
    }
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })
    if (!user) {
        return new Response("User not found", { status: 400 })
    }
    if (!user.stripeCustomerId) {
        const stripeCustomer = await createStripeConsumer(session.user.email as string)
        user.stripeCustomerId = stripeCustomer.id
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                stripeCustomerId: stripeCustomer.id
            },
        })
    }
    if (type === "stripe") {
        if (!product.stripeInfo) {
            return new Response("Stripe info not found", { status: 400 })
        }
        const quantity = (product.stripeInfo as JsonObject).quantity as number
        const callbackUrl = "/"
        if (product.productType === ProductType.PRO_MONTHLY) {
            const ret = await createStripeSubscriptionSessionMonthly(user.stripeCustomerId as string, quantity, session.user.email as string || "", product_id, callbackUrl)
            return NextResponse.json({ sessionId: ret.id, type: "stripe" })
        } else if (product.productType === ProductType.PRO_YEARLY) {
            const ret = await createStripeSubscriptionSessionYearly(user.stripeCustomerId as string, quantity, session.user.email as string || "", product_id, callbackUrl)
            return NextResponse.json({ sessionId: ret.id, type: "stripe" })
        } else {
            // 一次性收费
            const day = product.timeCycle === TimeCycle.NONE ? 0 : product.timeCycle === TimeCycle.PERMANENT ? 99999 : product.timeCycle === TimeCycle.WEEKLY ? 7 : product.timeCycle === TimeCycle.MONTHLY ? 30 : product.timeCycle === TimeCycle.YEARLY ? 365 : 0
            const ret = await createStripeFixedSession(user.stripeCustomerId as string, quantity, session.user.email as string || "", product_id, callbackUrl, day)
            return NextResponse.json({ sessionId: ret.id, type: "stripe" })
        }

    } else if (type === "paypal") {
        // todo
    } else if (type === "aifadian") {
        if (!product.aifadianInfo) {
            return new Response("Aifadian info not found", { status: 400 })
        }
        const orderId = `aifadian_${product_id}_${new Date().getTime()}`
        const day = product.timeCycle === TimeCycle.NONE ? 0 : product.timeCycle === TimeCycle.PERMANENT ? 99999 : product.timeCycle === TimeCycle.WEEKLY ? 7 : product.timeCycle === TimeCycle.MONTHLY ? 30 : product.timeCycle === TimeCycle.YEARLY ? 365 : 0
        const url = createOrderUrl((product.aifadianInfo as JsonObject)?.planId as string, orderId, session.user.email as string || "", product_id, day, 0)
        return NextResponse.json({ url, type: "aifadian" })
    }
}
