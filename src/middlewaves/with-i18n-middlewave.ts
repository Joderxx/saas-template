"use server"
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CustomMiddleware } from './chain';
import {routing} from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";

export function withI18nMiddleware(middleware: CustomMiddleware) {

    return async (
        request: NextRequest,
        response: NextResponse
    ) => {
        const path = request.nextUrl.pathname;
        if(path.match("/((?!api|_next|icon|image|logo|favicon.ico|placeholder.svg|images).*)") && !path.startsWith("/api")) {
            return middleware(request, createMiddleware(routing)(request));
        }
        return middleware(request, response);
    };

}