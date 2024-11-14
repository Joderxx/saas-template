import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return new Response("Invalid id", { status: 400 })
  }
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      stripeInfo: true
    }
  })
  if (!product || !product.stripeInfo) {
    return new Response("Product not found", { status: 404 })
  }
  return NextResponse.json(product.stripeInfo)
}

const validateForm = z.object({
  id: z.string(),
  quantity: z.number().min(0).default(1)
})

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const result = validateForm.safeParse(body)
  if (!result.success) {
    return new Response("Invalid data", { status: 400 })
  }

  await prisma.product.update({
    where: {
      id: result.data.id
    },
    data: {
      stripeInfo: {
        quantity: result.data.quantity
      }
    }
  })
  return NextResponse.json({ message: "Success" })
} 
