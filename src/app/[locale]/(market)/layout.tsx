import { ReactNode } from "react";
import Navbar from "./navbar";
import ToTop from "@/components/to-top";
import { getPathnameInServer } from "@/lib/path-utils";

export default async function Layout({ children }: { children: ReactNode }) {
  const pathname = await getPathnameInServer()
  return (
    <div className="flex flex-col">
      <div>
        <Navbar pathname={pathname} />
      </div>
      <div>
        {children}
        <ToTop />
      </div>
    </div>
  )
}