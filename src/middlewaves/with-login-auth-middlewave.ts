"use server"
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CustomMiddleware } from './chain';



export function withLoginAuthMiddleware(middleware: CustomMiddleware) {

    return async (
        request: NextRequest,
        response: NextResponse
    ) => {
        const path = response.headers.get("x-actual-path") || "/";
        const role = response.headers.get("x-role");    
        if(path.startsWith("/dashboard") || path.startsWith("/super-admin") || path.startsWith("/admin")) {
            if(role === "ANONYMOUS") { // not login
                return NextResponse.redirect(new URL("/login", request.url));
            } else {
                return middleware(request, response);
            }
        } else if(path.startsWith("/api/user")) {
            if(role === "ANONYMOUS") {// not login
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