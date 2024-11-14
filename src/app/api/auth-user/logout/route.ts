import { signOut } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  await signOut()
  return NextResponse.json({ message: "Logout" })
}