import { auth } from "@/lib/auth"
import { Role } from "@/lib/role-utils"


export default async function RoleControl({ children, authFunction }: { children: React.ReactNode, authFunction: (user: Role) => boolean }) {
  const session = await auth()
  return <>{!authFunction(new Role(session)) ? null : children}</>
}