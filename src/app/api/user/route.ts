import { NextRequest } from "next/server"

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (session?.user) {
    return NextResponse.json(session.user)
  }
  return NextResponse.json({error: "Unauthorized"}, {status: 401})
}