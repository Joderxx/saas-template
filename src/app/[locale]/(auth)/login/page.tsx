"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { GithubIcon, GoogleIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, FormMessage, FormItem, Form } from "@/components/ui/form";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast"
import { useTransition } from "react"


const validateForm = (t: (key: string) => string) => {
  return z.object({
    email: z.string().email({ message: t("InvalidEmail") }),
    password: z.string().min(8, { message: t("PasswordMustBeMoreThan8Characters") }).max(32, { message: t("PasswordMustBeLessThan32Characters") }),
  })
}

export default function Page() {
  const t = useTranslations("Login")
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const FormType = validateForm(t)
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    update(session)
      .then(sess => {
        if (sess && sess?.user?.id) {
          router.push("/")
        }
      })
  }, [session, router])

  const handleLogin = async (data: z.infer<typeof FormType>) => {
    const email = data.email
    const password = data.password
    const result = validateForm(t).safeParse({ email, password })
    if (!result.success) {
      return
    }
    startTransition(async () => {
      const response = await fetch("/api/auth-user/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      })
      if (!response.ok) {
        toast({
          title: t("LoginFailed"),
          description: t("LoginFailedDescription"),
        })
        return
      }

      await update(session)
      router.push("/")
      toast({
        title: t("LoginSuccess"),
        description: t("LoginSuccessDescription"),
      })
    })
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="text-center">{t("Title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center gap-4">
          <div className="w-full flex flex-col gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="flex flex-col gap-3">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <Input {...field} placeholder={t("Email")} className="focus-visible:shadow-none focus-visible:ring-0" />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <Input {...field} placeholder={t("Password")} type="password" className="focus-visible:shadow-none focus-visible:ring-0" />
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" disabled={isPending}>{t("Login")}</Button>
              </form>
            </Form>
          </div>
          <div className="w-full flex gap-2 justify-center items-center py-5">
            <Button className="w-full" variant="outline" onClick={() => signIn("github")}>
              <GithubIcon />
              <span className="ml-2">
                Github
              </span>
            </Button>
            <Button className="w-full" variant="outline" onClick={() => signIn("google")}>
              <GoogleIcon className="mr-2" />
              <span className="ml-2">
                Google
              </span>
            </Button>
          </div>
          <div className="w-full text-sm flex justify-center items-center gap-x-5">
            <Link href="/register" unselectable="on" className="hover:underline">{t("Register")}</Link>
            <Link href="/forgot-password" unselectable="on" className="hover:underline">{t("ForgotPassword")}</Link>
          </div>
        </CardContent>

      </Card>
    </div>
  )
}