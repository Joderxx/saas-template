"use server"

import { prisma } from "@/lib/prisma";

export async function subscribe(email: string) {
    if (!email) return;
    if (await prisma.subscribe.findUnique({ where: { email: email as string } })) {
        return;
    }
    await prisma.subscribe.create({
        data: {
            email: email as string
        }
    })
}