import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
export default async function Page() {
  const t = await getTranslations("Dashboard")
  const session = await auth()
  if (!session || !session.user) {
    redirect("/login")
  }
  return (
    <div>
      
    </div>
  )
}