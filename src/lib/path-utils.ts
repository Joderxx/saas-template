import { headers } from "next/headers";

export async function getPathnameInServer() {
  const headerList = headers();
  return headerList.get("x-actual-path") || "/"
}