"use server"
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CustomMiddleware } from './chain';
import { locales } from '@/lib/languages';



export function withSetPathMiddleware(middleware: CustomMiddleware) {

    return async (
        request: NextRequest,
        response: NextResponse
    ) => {
        response.headers.set("x-current-path", request.nextUrl.pathname);
        if(request.nextUrl.pathname.match("/((?!api|_next|icon|image|logo|favicon.ico|placeholder.svg|images).*)")) {
            for(const locale of locales) {
                if(request.nextUrl.pathname.startsWith(`/${locale}`)) {
                    const pathname = request.nextUrl.pathname.substring(locale.length + 1)
                    response.headers.set("x-actual-path", pathname);
                    break;
                }
            }
        } else {
            response.headers.set("x-actual-path", request.nextUrl.pathname);
        }
        return middleware(request, response);


    };

}