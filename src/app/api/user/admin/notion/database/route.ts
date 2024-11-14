import { getDatabase } from "@/lib/notion-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {    
    const data = await getDatabase()

    return NextResponse.json(data)
}