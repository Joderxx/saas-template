"use server"
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CustomMiddleware } from './chain';
import { auth } from '@/lib/auth';



export function withAuthMiddleware(middleware: CustomMiddleware) {

    return async (
        request: NextRequest,
        response: NextResponse
    ) => {
        const session = await auth();
        if (!session || !session.user) {
            response.headers.set("x-role", "ANONYMOUS");
        } else {
            // @ts-ignore
            response.headers.set("x-role", session.user.role as string);
        }
        // @ts-ignore
        if (session?.user?.permissions) {
            // @ts-ignore
            response.headers.set("x-permissions", session.user.permissions.join(","));
        }
        const resp = await middleware(request, response);
        resp?.headers.delete("x-permissions");
        return resp;
    };

}