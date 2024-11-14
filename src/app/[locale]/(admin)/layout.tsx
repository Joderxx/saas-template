import { SidebarProvider, SIDEBAR_COOKIE_NAME } from "@/components/ui/sidebar";
import ToTop from "@/components/to-top";
import AppSidebar from "./app-sidebar";
import { routes } from "./define-routes";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getPathnameInServer } from "@/lib/path-utils";
import { RouteGroup } from "./define-routes";
import { redirect } from "next/navigation";
import AppNavbar from "./app-navbar";
import UserInfo from "../user-info";
import { DashboardStoreProvider } from "./dashboard-store-provider";
import { Role } from "@/lib/role-utils";
function hasPath(pathname: string, paths: RouteGroup[]) {
  return paths.some((routeGroup) => routeGroup.routes.some((route) => {
    return route.path === pathname
  }))
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("Dashboard")
  const session = await auth()

  const filteredRoutes = routes(t).map((routeGroup) => ({
    ...routeGroup,
    routes: routeGroup.routes.filter((route) => route.auth(new Role(session)))
  }))

  const pathname = await getPathnameInServer()

  if (!hasPath(pathname, filteredRoutes) && pathname !== "/dashboard") {
    redirect("/dashboard")
  }

  return <>
    <SidebarProvider>
      <DashboardStoreProvider>
        <div className="flex w-full">
          <div>
            <AppSidebar routes={filteredRoutes} />
          </div>
          <main className="flex-1 w-full">
            <AppNavbar serverRender={<UserInfo pathname={pathname} />} />
            <div className="p-4 w-full mt-14">
              {children}
            </div>
            <ToTop />
          </main>
        </div>
      </DashboardStoreProvider>
    </SidebarProvider >
  </>
}