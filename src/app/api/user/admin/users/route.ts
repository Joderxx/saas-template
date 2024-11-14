import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { User} from "@prisma/client";
import { hashPassword, SUPER_ADMIN_ROLE } from "@/lib/utils";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { UserError } from "@/lib/rest-error";
import { getDayStart } from "@/lib/time-utils";
import { getDayEnd } from "@/lib/time-utils";
import { roleAdmin } from "@/lib/init/sql";
import { parseProductType } from "@/lib/prisma-enums";
import { I } from "@upstash/redis/zmscore-Dc6Llqgr";
import { Role } from "@/lib/role-utils";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get("start") || "0";
    const offset = searchParams.get("offset") || "10";
    const role = searchParams.get("role") || "";
    const email = searchParams.get("email") || "";
    const where: any = {};
    
    
    if(role) {
        where.roleId = role;
    }
    if(email) {
        where.email = email;
    }
    if(searchParams.has("startLoginAt") && searchParams.has("endLoginAt")) {
        where.lastLoginAt = {
            gte: getDayStart(parseInt(searchParams.get("startLoginAt") || "0")),
            lte: getDayEnd(parseInt(searchParams.get("endLoginAt") || "0"))
        }
    }
    if(searchParams.has("startEndSubscriptionAt") && searchParams.has("endEndSubscriptionAt")) {
        where.endSubscriptionAt = {
            gte: getDayStart(parseInt(searchParams.get("startEndSubscriptionAt") || "0")),
            lte: getDayEnd(parseInt(searchParams.get("endEndSubscriptionAt") || "0"))
        }
    }

    const orderBy: any = {};
    if(searchParams.has("endSubscriptionAt")) {
        orderBy.endSubscriptionAt = searchParams.get("endSubscriptionAt") === "asc" ? "asc" : "desc";
    }
    if(searchParams.has("lastLoginAt")) {
        orderBy.lastLoginAt = searchParams.get("lastLoginAt") === "asc" ? "asc" : "desc";
    }
    if(searchParams.has("createdAt")) {
        orderBy.createdAt = searchParams.get("createdAt") === "asc" ? "asc" : "desc";
    }
    if(searchParams.has("updatedAt")) {
        orderBy.updatedAt = searchParams.get("updatedAt") === "asc" ? "asc" : "desc";
    }
    if(searchParams.has("totalMoney")) {
        orderBy.totalMoney = searchParams.get("totalMoney") === "asc" ? "asc" : "desc";
    }
    if(searchParams.has("totalActualMoney")) {
        orderBy.totalActualMoney = searchParams.get("totalActualMoney") === "asc" ? "asc" : "desc";
    }
    if(searchParams.has("monthlyActualMoney")) {
        orderBy.monthlyActualMoney = searchParams.get("monthlyActualMoney") === "asc" ? "asc" : "desc";
    }
    if(searchParams.has("monthlyMoney")) {
        orderBy.monthlyMoney = searchParams.get("monthlyMoney") === "asc" ? "asc" : "desc";
    }

    const count = await prisma.user.count({where: where});
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            lastLoginAt: true,
            productType: true,
            createdAt: true,
            endSubscriptionAt: true,
            totalActualMoney: true,
            monthlyActualMoney: true,
            forbidden: true,
            roleId: true
        },
        where: where,
        orderBy: orderBy,
        skip: parseInt(start),
        take: parseInt(offset)
    });
    return NextResponse.json({
        data: users, 
        total: count, 
        start: parseInt(start), 
        offset: parseInt(offset),
        orderBy: orderBy
    });
}

const validateForCreate = z.object({
    email: z.string().email(),
    name: z.string(),
    role: z.string(),
    password: z.string(),
    productType: z.enum(["PRO_MONTHLY", "PRO_YEARLY", "FREE"]),
    endSubscriptionAt: z.number()
})

export async function POST(request: NextRequest) {
    const body = await request.json();
    const {data, success} = validateForCreate.safeParse(body);
    if(!success) {
        return NextResponse.json({status: UserError.INVALID_USER_DATA, message: "Invalid user data"}, {status: 400});
    }
    if(data.role === SUPER_ADMIN_ROLE) {
        const session = await auth();
        if(!session || !session.user || !session.user.email || !new Role(session).hasAnyRole([SUPER_ADMIN_ROLE])) {
            return NextResponse.json({status: UserError.FORBIDDEN, message: "Forbidden"}, {status: 403});
        }
    }
    const userCount = await prisma.user.count({where: {email: data.email}});
    if(userCount > 0) {
        return NextResponse.json({status: UserError.USER_ALREADY_EXISTS, message: "User already exists"}, {status: 400});
    }
    const newUser = {
        email: data.email,
        name: data.name,
        roleId: data.role,
        password: hashPassword(data.password || "12345678"),
        productType: parseProductType(data.productType),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        endSubscriptionAt: getDayEnd(data.endSubscriptionAt),
        totalMoney: 0,
        monthlyMoney: 0,
        totalActualMoney: 0,
        monthlyActualMoney: 0,
        forbidden: false
    } as User;
    await prisma.user.create({data: newUser});
    return NextResponse.json({status: UserError.SUCCESS, message: "success"});
}

const validateForUpdate = z.object({
    email: z.string().email(),
    name: z.string(),
    role: z.string(),
    productType: z.enum(["PRO_MONTHLY", "PRO_YEARLY", "FREE"]),
    endSubscriptionAt: z.number()
})

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const {data, success} = validateForUpdate.safeParse(body);
    if(!success) {
        return NextResponse.json({status: UserError.INVALID_USER_DATA, message: "Invalid user data"}, {status: 400});
    }

    // forbid user to update self data
    const loginUser = await auth();
    if(!loginUser?.user?.email || loginUser.user.email === body.email) {
        return NextResponse.json({status: UserError.FORBIDDEN, message: "Forbidden"}, {status: 403});
    }
    if(data.role === SUPER_ADMIN_ROLE) { 
        if(!new Role(loginUser).hasAnyRole([SUPER_ADMIN_ROLE])) {
            return NextResponse.json({status: UserError.FORBIDDEN, message: "Forbidden"}, {status: 403});
        }
    }
    const user = await prisma.user.findUnique({where: {email: body.email}});
    if(!user) {
        return NextResponse.json({status: UserError.USER_NOT_FOUND, message: "User not found"}, {status: 404});
    }
    // change admin role
    if(user.roleId === roleAdmin.id && body.role !== roleAdmin.id) {
        // todo: send email to admins
    }
    await prisma.user.update({
        where: {email: body.email},
        data: {
            name: data.name,
            roleId: data.role,
            productType: parseProductType(data.productType),
            endSubscriptionAt: getDayEnd(data.endSubscriptionAt)
        }
    })
    return NextResponse.json({status: UserError.SUCCESS, message: "success"});
}

export async function DELETE(request: NextRequest) {
    const email = request.nextUrl.searchParams.get("email") || "";
    const user = await prisma.user.findUnique({where: {email: email}});
    if(!user) {
        return NextResponse.json({status: UserError.USER_NOT_FOUND, message: "User not found"}, {status: 404});
    }
    if(user.roleId === roleAdmin.id) {
        return NextResponse.json({status: UserError.FORBIDDEN, message: "Forbidden"}, {status: 403});
    }
    await prisma.user.delete({where: {email: email}});
    return NextResponse.json({status: UserError.SUCCESS, message: "success"});
}

