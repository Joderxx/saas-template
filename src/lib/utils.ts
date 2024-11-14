import { type ClassValue, clsx } from "clsx"
import { sha256 } from "js-sha256"
import { twMerge } from "tailwind-merge"

export const SUPER_ADMIN_ROLE = "SUPER_ADMIN"
export const ADMIN_ROLE = "ADMIN"
export const USER_ROLE = "USER"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hashPassword(password: string) {
  return sha256(password + process.env.AUTH_SECRET as string)
}


export function once(fn: () => void) {
  let called = false
  return () => {
    if (!called) {
      called = true
      fn()
    }
  }
}