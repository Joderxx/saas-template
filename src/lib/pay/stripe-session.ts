import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

// 订阅/月度
export async function createStripeSubscriptionSessionMonthly(customerId: string, quantity: number, email: string, productId: string, callbackUrl: string) {
    const price = parseFloat(process.env.NEXT_PUBLIC_STRIPE_BASE_PRICE_MONTHLY!) * quantity

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price: process.env.NEXT_PUBLIC_STRIPE_BASE_PRICE_ID_SCHEDULE_MONTHLY,
            quantity: quantity
        }],
        mode: 'subscription',
        customer: customerId,
        subscription_data: {
            metadata: {
                productId: productId,
                email: email,
                price: price,
                type: "monthly"
            }
        },
        success_url: getSuccessUrl(callbackUrl),
        cancel_url: getCancelUrl(callbackUrl),
    });
    return session
}

// 订阅/年度
export async function createStripeSubscriptionSessionYearly(customerId: string, quantity: number, email: string, productId: string, callbackUrl: string) {
    const price = parseFloat(process.env.NEXT_PUBLIC_STRIPE_BASE_PRICE_YEARLY!) * quantity

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price: process.env.NEXT_PUBLIC_STRIPE_BASE_PRICE_ID_SCHEDULE_YEARLY,
            quantity: quantity
        }],
        mode: 'subscription',
        customer: customerId,
        subscription_data: {
            metadata: {
                productId: productId,
                email: email,
                price: price,
                type: "yearly"
            }
        },
        success_url: getSuccessUrl(callbackUrl),
        cancel_url: getCancelUrl(callbackUrl),
    });
    return session
}

// 一次性收费
export async function createStripeFixedSession(customerId: string, quantity: number, email: string, productId: string, callbackUrl: string, increaseDay: number) {
    const price = parseFloat(process.env.NEXT_PUBLIC_STRIPE_BASE_PRICE_FIXED!) * quantity

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price: process.env.NEXT_PUBLIC_STRIPE_BASE_PRICE_ID_FIXED,
            quantity: quantity
        }],
        mode: "payment",
        customer: customerId,
        payment_intent_data: {
            metadata: {
                productId: productId,
                email: email,
                price: price,
                type: "fixed",
                increaseDay: increaseDay
            }
        },
        success_url: getSuccessUrl(callbackUrl),
        cancel_url: getCancelUrl(callbackUrl),
    });
    return session
}

export async function expireStripeSession(id: string) {
    await stripe.checkout.sessions.expire(id)
}


function getSuccessUrl(callbackUrl: string) {
    const redirectURL = new URL("/pay-callback", process.env.NEXT_PUBLIC_APP_URL!)

    const status = "success"
    redirectURL.searchParams.set("status", status)
    redirectURL.searchParams.set("callbackUrl", encodeURI(new URL(callbackUrl, process.env.NEXT_PUBLIC_APP_URL!).toString()))
    return redirectURL.toString()
}

export function getCancelUrl(callbackUrl: string) {
    const redirectURL = new URL("/pay-callback", process.env.NEXT_PUBLIC_APP_URL!)

    const status = "cancel"
    redirectURL.searchParams.set("status", status)
    redirectURL.searchParams.set("callbackUrl", encodeURI(new URL(callbackUrl, process.env.NEXT_PUBLIC_APP_URL!).toString()))
    return redirectURL.toString()
}

export async function createStripeConsumer(email: string) {
    const customer = await stripe.customers.search({
        query: `email: "${email}"`,
        limit: 1,
    })
    if (customer.data.length > 0) {
        return customer.data[0]
    }
    return stripe.customers.create({
        email: email,
    })
}

