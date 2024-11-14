import crypto from "crypto"

const baseUrl = process.env.AIFADIAN_URL
const appId = process.env.AIFADIAN_USER_ID
const token = process.env.AIFADIAN_TOKEN

export function createOrderUrl(planId: string, customOrderId: string, email: string, productId: string, increaseDay: number = 0, productType: number = 0) {
    const url = new URL(`/order/create`, baseUrl)
    url.searchParams.set("plan_id", planId)
    url.searchParams.set("product_type", productType.toString())
    url.searchParams.set("custom_order_id", customOrderId)
    url.searchParams.set("remark", encrypt({ email, productId, increaseDay, orderId: customOrderId }))
    return url.toString()
}

type RequestInfo = {
    user_id: string
    ts: number
    params: string,
    sign: string
}

function sign(params: string) {
    const ts = Math.floor(Date.now() / 1000)
    const toSign = `${token}params${params}ts${ts}user_id${appId}`;
    const sign = crypto.createHash('md5').update(toSign).digest('hex');
    return {
        user_id: appId,
        ts,
        params,
        sign,
    } as RequestInfo;
}

export async function testPing(): Promise<PingResponse> {
    const url = new URL(`/api/open/ping`, baseUrl)
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(sign(JSON.stringify({}))),
    })
    return await response.json()
}

export enum ErrorCode {
    Success = 200,
    ParamsIncomplete = 400001,
    TimeExpired = 400002,
    ParamsNotValid = 400003,
    NoValidTokenFound = 400004,
    SignValidationFailed = 400005,
}

export type BaseResponse = {
    ec: number
    em: string
}

export type PingResponse = BaseResponse & {
    data: {
        [key: string]: any
    }
}

export async function getOrders(page: number, outTradeNos?: string[], size: number = 50): Promise<OrdersResponse> {
    const url = new URL(`/api/open/query-order`, baseUrl)
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(sign(JSON.stringify({
            page,
            out_trade_no: outTradeNos?.join(","),
            per_page: size,
        }))),
    })
    return await response.json()
}

export type OrdersResponse = BaseResponse & {
    data: {
        list: {
            out_trade_no: string
            custom_order_id: string
            user_id: string
            user_private_id: string
            plan_id: string
            month: number
            total_amount: string
            show_amount: string
            status: number
            remark: string
            redeem_id: string
            product_type: number
            discount: string
            sku_detail: {
                sku_id: string
                count: number
                name: string
                album_id: string
                pic: string
            }[]
            address_person: string
            address_phone: string
            address_address: string
        }[],
        total_count: number
        total_page: number
    }
}


export async function getSponsors(page: number, userIds?: string[], size: number = 50): Promise<SponsorsResponse> {
    const url = new URL(`/api/open/query-sponsor`, baseUrl)
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(sign(JSON.stringify({
            page,
            user_id: userIds?.join(","),
            per_page: size,
        }))),
    })
    return await response.json()
}

export type SponsorsResponse = BaseResponse & {
    data: {
        total_count: number
        total_page: number
        list: {
            plan_id: string
            rank: number
            user_id: string
            status: number
            name: string
            pic: string
            desc: string
            price: string
            update_time: number
            pay_month: number
            show_price: string
            independent: number
            permanent: number
            can_buy_hide: number
            need_address: number
            product_type: number
            sale_limit_count: number
            need_invite_code: boolean
            expire_time: number
            sku_processed: []
            rankType: number
        }[],
        sponsor_plans: {
            plan_id: string
            rank: number
            user_id: string
            status: number
            name: string
            pic: string
            desc: string
            price: string
            update_time: number
            pay_month: number
            show_price: string
            independent: number
            permanent: number
            can_buy_hide: number
            need_address: number
            product_type: number
            sale_limit_count: number
            need_invite_code: boolean
            expire_time: number
            sku_processed: []
            rankType: number
        }
    }[],
    current_plan: {
        plan_id: string
        rank: number
        user_id: string
        status: number
        name: string
        pic: string
        desc: string
        price: string
        update_time: number
        pay_month: number
        show_price: string
        independent: number
        permanent: number
        can_buy_hide: number
        need_address: number
        product_type: number
        sale_limit_count: number
        need_invite_code: boolean
        expire_time: number
        sku_processed: []
        rankType: number
    },
    all_sum_amount: string
    first_pay_time: number
    last_pay_time: number
    user: {
        user_id: string
        name: string
        avatar: string
    }
}

function aes_encrypt(key: string, msg: string) {
    key = key.padEnd(32, '0')
    const iv = crypto.createHash('md5').update(key).digest('hex').padEnd(16, '0').substring(0, 16)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(msg, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function aes_decrypt(key: string, encrypted: string) {
    key = key.padEnd(32, '0')
    const iv = crypto.createHash('md5').update(key).digest('hex').padEnd(16, '0').substring(0, 16)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function encrypt({ email, productId, increaseDay, orderId }: { email: string, productId: string, increaseDay: number, orderId: string }): string {
    return aes_encrypt(process.env.AIFADIAN_ENCRYPT_KEY as string, JSON.stringify({ email, productId, increaseDay, orderId }))
}

export function decrypt(data: string): { email: string, productId: string, increaseDay: number, orderId: string } {
    if (!data) return { email: "", productId: "", increaseDay: 0, orderId: "" }
    try {
        return JSON.parse(aes_decrypt(process.env.AIFADIAN_ENCRYPT_KEY as string, data))
    } catch (e) {
        return { email: "", productId: "", increaseDay: 0, orderId: "" }
    }
}