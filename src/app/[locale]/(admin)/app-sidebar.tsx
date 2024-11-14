import { SidebarGroup, SidebarHeader, SidebarSeparator, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";

import { Sidebar } from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import RoleRoute from "@/components/role-control";
import { RouteGroup } from "./define-routes";
import AppLink from "./app-link";

export default async function AppSidebar({ routes }: { routes: RouteGroup[] }) {
  const t = await getTranslations("Navbar")

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-x-2 w-[200px]">
            <Logo />
          <h1 className="font-bold text-xl">{t("ProductName")}</h1>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {routes.map((routeGroup) => (
          <SidebarGroup key={`Group-${routeGroup.name}`}>
            <SidebarHeader>
              <span className="text-xs text-muted-foreground">{routeGroup.name}</span>
            </SidebarHeader>
            <div className="flex flex-col gap-y-1 px-4">
              {routeGroup.routes.map((route) => (
                <RoleRoute authFunction={route.auth} key={`Item-${routeGroup.name}-${route.name}`}>
                  <AppLink name={route.name} path={route.path} icon={route.icon} />
                </RoleRoute>

              ))}
            </div>

          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>

      </SidebarFooter>
    </Sidebar>
  )
}