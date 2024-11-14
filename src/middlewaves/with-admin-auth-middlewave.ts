"use server"
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CustomMiddleware } from './chain';
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from '@/lib/utils';

export function withAdminAuthMiddleware(middleware: CustomMiddleware) {

    return async (
        request: NextRequest,
        response: NextResponse
    ) => {
        const path = response.headers.get("x-actual-path") || "/";
        const role = response.headers.get("x-role");    
        if(path.startsWith("/super-admin")) {
            if(role !== SUPER_ADMIN_ROLE) {
                return NextResponse.redirect(new URL("/login", request.url));
            }
        } else if(path.startsWith("/api/user/super-admin")) {
            if(role !== SUPER_ADMIN_ROLE) {
                return NextResponse.json({
                    message: "Unauthorized"
                }, {status: 401});
            } else {
                return middleware(request, response);
            }
        }else if(path.startsWith("/admin")) {
            if(role !== ADMIN_ROLE && role !== SUPER_ADMIN_ROLE) {
                return NextResponse.redirect(new URL("/login", request.url));
            } else {
                return middleware(request, response);
            }
        } else if(path.startsWith("/api/user/admin")) {
            if(role !== ADMIN_ROLE && role !== SUPER_ADMIN_ROLE) {
                return NextResponse.json({
                    message: "Unauthorized"
                }, {status: 401});
            } else {
                return middleware(request, response);
            }
        } else {
            return middleware(request, response);
        }

    };

}