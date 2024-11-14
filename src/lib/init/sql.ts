import { ProductType, User, UserRole } from "@prisma/client"
import { hashPassword, USER_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE, once } from "../utils"
import { prisma } from "../prisma"


// @ts-ignore
export let roleUser: UserRole = {
  id: USER_ROLE,
  name: USER_ROLE,
  permissions: ["USER_*"],
  createdAt: new Date(),
  updatedAt: new Date()
}


export let superRoleAdmin: UserRole = {
  id: SUPER_ADMIN_ROLE,
  name: SUPER_ADMIN_ROLE,
  permissions: ["*"],
  createdAt: new Date(),
  updatedAt: new Date()
}

export let roleAdmin: UserRole = {
  id: ADMIN_ROLE,
  name: ADMIN_ROLE,
  permissions: ["*"],
  createdAt: new Date(),
  updatedAt: new Date()
}

// @ts-ignore
export const defaultAdmin: User = {
  email: "",
  password: "",
  name: "admin",
  emailVerified: null,
  image: null,
  roleId: roleAdmin.id,
  hasChangedPassword: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
  endSubscriptionAt: new Date(2099, 1, 1),
  productType: ProductType.PRO_YEARLY,
  totalMoney: 0,
  monthlyMoney: 0,
  totalActualMoney: 0,
  monthlyActualMoney: 0,
  forbidden: false
}

// @ts-ignore
export const defaultSuperAdmin: User = {
  email: "",
  password: "",
  name: "superadmin",
  emailVerified: null,
  image: null,
  roleId: superRoleAdmin.id,
  hasChangedPassword: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
  endSubscriptionAt: new Date(2099, 1, 1), //don't too long
  productType: ProductType.PRO_YEARLY,
  totalMoney: 0,
  monthlyMoney: 0,
  totalActualMoney: 0,
  monthlyActualMoney: 0,
  forbidden: false
}

function initUser() {
  defaultAdmin.email = process.env.DEFAULT_ADMIN_EMAIL as string
  defaultAdmin.password = hashPassword(process.env.DEFAULT_ADMIN_PASSWORD as string)

  defaultSuperAdmin.email = process.env.DEFAULT_SUPER_ADMIN_EMAIL as string
  defaultSuperAdmin.password = hashPassword(process.env.DEFAULT_SUPER_ADMIN_PASSWORD as string)
}  

export async function init(prisma: any) {
  initUser()
  const chain: (() => Promise<void>)[] = []
  chain.push(async () => {
    if (!await prisma.userRole.findUnique({ where: { id: USER_ROLE } })) {
      roleUser = await prisma.userRole.create({ data: roleUser })
    }
  })
  chain.push(async () => {
    if (!await prisma.userRole.findUnique({ where: { id: ADMIN_ROLE } })) {
      roleAdmin = await prisma.userRole.create({ data: roleAdmin })
    }
  })
  chain.push(async () => {
    if (!await prisma.userRole.findUnique({ where: { id: SUPER_ADMIN_ROLE } })) {
      superRoleAdmin = await prisma.userRole.create({ data: superRoleAdmin })
    }
  })
  chain.push(async () => {
    if (!await prisma.user.findUnique({ where: { email: defaultSuperAdmin.email } })) {
      await prisma.user.create({ data: defaultSuperAdmin })
    } else {
      defaultSuperAdmin.roleId = superRoleAdmin.id
      await prisma.user.update({ where: { email: defaultSuperAdmin.email }, data: defaultSuperAdmin })
    }
  })
  chain.push(async () => {
    if (!await prisma.user.findUnique({ where: { email: defaultAdmin.email } })) {
      await prisma.user.create({ data: defaultAdmin })
    } else {
      defaultAdmin.roleId = roleAdmin.id
      await prisma.user.update({ where: { email: defaultAdmin.email }, data: defaultAdmin })
    }
  })
  for (const fn of chain) {
    await fn()
  }
}