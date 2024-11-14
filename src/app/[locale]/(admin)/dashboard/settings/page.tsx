"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { useEffect, useState, useTransition } from "react"
import { getEnv } from "@/lib/env-utils"
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { MdSend } from "react-icons/md"
import { useToast } from "@/hooks/use-toast"
import { sendValidateCode } from "@/lib/user"
import { useRouter } from "next/navigation"
import RoleSelect from "@/components/role-select"

const validateCodeForm = (t: (key: string) => string) => {
  return z.object({
    validateCode: z.string().length(6, { message: t("ValidateCodeIsRequired") })
  })
}

const validateNameForm = (t: (key: string) => string) => {
  return z.object({
    username: z.string().min(4, { message: t("UsernameMustBeMoreThan4Characters") }).max(32, { message: t("UsernameMustBeLessThan32Characters") }),
  })
}

const hideEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+/;

  if (!emailRegex.test(email)) {
    return ""
  }

  const [username, domain] = email.split('@');

  const usernameHidden = username.length <= 4 ? username : username.substring(0, 4) + '*'.repeat(username.length - 2) + username.slice(-1);

  return `${usernameHidden}@${domain}`;
}

export default function Page() {

  const { data: session, update } = useSession()
  const [role, setRole] = useState("USER")

  const [isProduction, setIsProduction] = useState(true)
  const t = useTranslations("Dashboard-Settings")
  const NameFormType = validateNameForm(t)
  const form = useForm<z.infer<typeof NameFormType>>({
    resolver: zodResolver(NameFormType),
    defaultValues: {
      username: session?.user?.name || "",
    },
  })


  const CodeFormType = validateCodeForm(t)
  const codeForm = useForm<z.infer<typeof CodeFormType>>({
    resolver: zodResolver(CodeFormType),
    defaultValues: {
      validateCode: ""
    },
  })

  useEffect(() => {
    getEnv().then((res) => {
      setIsProduction(!res.dev)
    })
  }, [])

  useEffect(() => {
    form.reset({
      username: session?.user?.name || "",

    })
    // @ts-ignore
    setRole(session?.user?.role)
  }, [session])

  const [cooldown, setCooldown] = useState(0)
  const { toast } = useToast()

  async function handleSendValidateCode(email: string) {
    if (cooldown > 0) {
      toast({
        title: "Error",
        description: t("Cooldown"),
        variant: "destructive"
      })
      return
    }

    setCooldown(60)
    await sendValidateCode(email, "deleteAccount")
  }

  const [isChangingName, startChangingName] = useTransition()
  const [isChangingRole, startChangingRole] = useTransition()
  const [isDeletingAccount, startDeletingAccount] = useTransition()

  const onSubmitName = async (data: z.infer<typeof NameFormType>) => {
    const username = data.username
    const result = validateNameForm(t).safeParse({ username })
    if (!result.success) {
      return
    }

    startChangingName(async () => {
      const res = await fetch(`/api/user/dashboard/settings/change-name?name=${username}`, {
        method: "POST",
      })
      if (res.ok) {
        await update(session)
        router.refresh()
        toast({
          title: t("Success"),
          description: t("ChangeNameSuccess"),
        })
      }
    })
  }

  const handleSubmitRole = async (formData: FormData) => {
    const role = formData.get("role") as string
    if (!role) {
      return
    }
    // @ts-ignore
    if (role === session?.user?.role) {
      return
    }
    startChangingRole(async () => {
      const res = await fetch(`/api/user/dashboard/settings/change-role?role=${role}`, {
        method: "POST",
      })
      if (res.ok) {
        await update(session)
        router.refresh()
        toast({
          title: t("Success"),
          description: t("ChangeRoleSuccess"),
        })
      }
    })
  }

  const router = useRouter()

  const handleSubmitDeleteAccount = (data: z.infer<typeof CodeFormType>) => {
    const code = data.validateCode
    const result = validateCodeForm(t).safeParse({ validateCode: code })
    if (!result.success) {
      return
    }
    startDeletingAccount(async () => {
      const resp = await fetch(`/api/user/dashboard/settings/delete-account?code=${code}`, {
        method: "DELETE",
      })
      if (resp.ok) {
        toast({
          title: t("Success"),
          description: t("DeleteAccountSuccess"),
        })
        router.push("/")
      }
    })
  }

  return (
    <div className="flex flex-col gap-y-10">
      <h1 className="text-2xl font-bold">{t("Title")}</h1>

      <div className="flex flex-col gap-y-10">

        <div className="flex flex-col gap-y-2 m-auto w-1/2">
          <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmitName)} className="w-full">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <Input {...field} placeholder={t("Username")} className="focus-visible:shadow-none focus-visible:ring-0" />
                      <Button type="submit" disabled={isChangingName}>{t("ChangeName")}</Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <p className="text-sm text-muted-foreground">{t("UsernameDescription")}</p>
        </div>
        {
          !isProduction && (

            <div className="flex flex-col gap-y-2 m-auto w-1/2">
              <form action={handleSubmitRole} className="w-full">
                <div className="flex items-center">
                  <RoleSelect name="role" value={role} onValueChange={(value) => {
                    setRole(value)
                  }} />
                  <Button type="submit" disabled={isChangingRole}>{t("ChangeRole")}</Button>
                </div>
              </form>
              <p className="text-sm text-muted-foreground">{t("RoleDescription")}</p>
            </div>
          )
        }

        <div className="flex flex-col gap-y-2 m-auto w-1/2 border-red-600 border rounded-xl p-5">
          <h1 className="text-2xl font-bold">{t("AreYouSureYouWantToDeleteYourAccount")}</h1>
          <p className="text-sm text-muted-foreground">{t("DeleteAccountDescription")}</p>
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={isDeletingAccount}>{t("DeleteAccount")}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t("DeleteAccount")}</DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-col gap-y-2">
                      <p>{t("DeleteAccountDescription")}{t("SendToEmailDescription")} {hideEmail(session?.user?.email || "")}</p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <Form {...codeForm}>
                  <form onSubmit={codeForm.handleSubmit(handleSubmitDeleteAccount)} className="flex flex-col gap-3">

                    <FormField control={codeForm.control} name="validateCode" render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-center items-center">
                          <Input {...field} placeholder={t("ValidateCode")} className="focus-visible:shadow-none focus-visible:ring-0" />
                          <Button type="button" variant="outline" onClick={() => handleSendValidateCode(session?.user?.email || "")} disabled={cooldown > 0}>
                            {cooldown > 0 ? `${cooldown}s` : <MdSend />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter>
                      <Button type="submit" variant="destructive" disabled={isDeletingAccount} className="w-1/2">{t("Confirm")}</Button>
                    </DialogFooter>
                  </form>
                </Form>

              </DialogContent>
            </Dialog>

          </div>
        </div>

      </div>
    </div>
  )
}
