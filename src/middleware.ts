

import { NextRequest, NextResponse } from "next/server";
import { chain } from "./middlewaves/chain";
import { withI18nMiddleware } from "./middlewaves/with-i18n-middlewave";
import { withSetPathMiddleware } from "./middlewaves/with-set-path-middlewave";
import { withAuthMiddleware } from "./middlewaves/with-auth-middlewave";
import { withLoginAuthMiddleware } from "./middlewaves/with-login-auth-middlewave";
import { withAdminAuthMiddleware } from "./middlewaves/with-admin-auth-middlewave";

export const config = {
  matcher: ["/", "/((?!api|_next|icon|image|logo|favicon.ico|placeholder.svg|images).*)", "/api/:path*"],
};

export function middleware(request: NextRequest) {
  return chain([
    // i18n must first
    withI18nMiddleware, withSetPathMiddleware, withAuthMiddleware,
    withLoginAuthMiddleware, withAdminAuthMiddleware
  ])(request, NextResponse.next());
}