import { Session } from "next-auth"
import { roleAdmin, roleUser, superRoleAdmin } from "./init/sql"

export class Role {
  session: Session | null
  constructor(session: Session | null) {
    this.session = session
  }

  private roles = {
    "ANONYMOUS": 0,
    "USER": 1,
    "VIP_1": 2,
    "VIP_2": 3,
    "VIP_3": 4,
    "VIP_4": 5,
    "VIP_5": 6,
    "ADMIN": 9998,
    "SUPER_ADMIN": 9999
  }

  atLeast(role: string) {
    // @ts-ignore
    const currentRole = this.session?.user?.role || "ANONYMOUS"
    return currentRole && this.roles[currentRole] >= this.roles[role]
  }

  lowerThan(role: string) {
    // @ts-ignore
    const currentRole = this.session?.user?.role || "ANONYMOUS"
    return currentRole && this.roles[currentRole] < this.roles[role]
  }

  hasAnyRole(roles: string[]) {
    return roles.some((role) => this.hasRole(role))
  }

  hasRole(role: string) {
    if (!this.session || !role) {
      return false
    }
    // @ts-ignore
    const roles = this.session.user.role as string[]
    return roles.includes(role)
  }

  hasAnyPermission(permissions: string[]) {
    return permissions.some((permission) => this.hasPermission(permission))
  }

  hasPermission(permission: string) {
    if (!this.session || !permission) {
      return false
    }
    // @ts-ignore
    const permissions = this.session.user.permissions as string[]
    return permissions.some((p) => permission.match(p))
  }

  hasAllPermissions(permissions: string[]) {
    return permissions.every((permission) => this.hasPermission(permission))
  }

  // 是否可以替换当前角色
  // 这块代码根据业务定制
  // 在订阅时候使用
  canReplace(role: string): boolean {
    // role
    // @ts-ignore
    const currentRole = this.session?.user.role
    if (!currentRole) {
      return true
    }
    if (currentRole === role) {
      return true
    }
    if (currentRole === roleAdmin.id || currentRole === superRoleAdmin.id) {
      return true
    }
    return this.lowerThan(role)
  }
}

export function hasAnyRole(session: Session | null, roles: string[]) {
  return new Role(session).hasAnyRole(roles)
}

export function hasRole(session: Session | null, role: string) {
  return new Role(session).hasRole(role)
}

export function hasAnyPermission(session: Session | null, permissions: string[]) {
  return new Role(session).hasAnyPermission(permissions)
}

export function hasPermission(session: Session | null, permission: string) {
  return new Role(session).hasPermission(permission)
}

export function hasAllPermissions(session: Session | null, permissions: string[]) {
  return new Role(session).hasAllPermissions(permissions)
}
