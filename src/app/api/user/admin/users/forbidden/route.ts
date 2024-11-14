import { NextRequest, NextResponse } from "next/server";
import { UserError } from "@/lib/rest-error";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from "@/lib/utils";

export const POST = async (request: NextRequest) => {
    const email = request.nextUrl.searchParams.get("email") || "";
    const state = request.nextUrl.searchParams.get("state") === "true";
    if(!email) {
        return NextResponse.json({status: UserError.INVALID_USER_DATA, message: "Invalid user data"}, {status: 400});
    }
    const user = await prisma.user.findUnique({where: {email: email}});
    if(!user) {
        return NextResponse.json({status: UserError.USER_NOT_FOUND, message: "User not found"}, {status: 404});
    }
    if(user.roleId === ADMIN_ROLE || user.roleId === SUPER_ADMIN_ROLE) {
        return NextResponse.json({status: UserError.FORBIDDEN, message: "Forbidden"}, {status: 403});
    }
    await prisma.user.update({where: {email: email}, data: {forbidden: state}});
    return NextResponse.json({status: UserError.SUCCESS, message: "Success"}, {status: 200});
}
