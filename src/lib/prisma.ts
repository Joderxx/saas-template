import { PrismaClient } from "@prisma/client"
import {init } from "@/lib/init/sql";
import { once } from "./utils";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient, init: boolean }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

const initSql = once(() => {
  console.log("init sql...")
  init(prisma).catch((err: Error) => console.error(err))
})  

if (!globalForPrisma.init) {
  globalForPrisma.init = true
  initSql()
}