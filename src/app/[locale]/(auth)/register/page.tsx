"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { MdSend } from "react-icons/md"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"

const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validateForm = (t: (key: string) => string) => {
    return z.object({
        username: z.string().min(4, { message: t("UsernameIsRequired") }),
        email: z.string().email({ message: t("InvalidEmail") }),
        password: z.string().min(8, { message: t("PasswordMustBeMoreThan8Characters") }).max(32, { message: t("PasswordMustBeLessThan32Characters") }),
        confirmPassword: z.string().min(8, { message: t("PasswordMustBeMoreThan8Characters") }).max(32, { message: t("PasswordMustBeLessThan32Characters") }),
        validateCode: z.string().length(6, { message: t("ValidateCodeIsRequired") })
    }).refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: t("PasswordsNotMatch")
    })
}

export default function Register() {
    const t = useTranslations("Register")
    const { toast } = useToast()
    const [isPending, startTransition] = useTransition()
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        if (cooldown > 0) {
            setTimeout(() => setCooldown(cooldown - 1), 1000)
        }
    }, [cooldown])

    const FormType = validateForm(t)
    const form = useForm<z.infer<typeof FormType>>({
        resolver: zodResolver(FormType),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            validateCode: ""
        },
    })

    async function handleSendValidateCode(email: string) {
        if (cooldown > 0) {
            toast({
                title: "Error",
                description: t("Cooldown"),
                variant: "destructive"
            })
            return
        }
        if (!email || !validateEmail(email)) {
            form.setError("email", { message: t("InvalidEmail") })
            return
        }
        setCooldown(60)
        await fetch(`/api/email-valid?email=${email}&type=register`)
    }

    const router = useRouter()

    async function handleRegister(formData: z.infer<typeof FormType>) {
        const username = formData.username
        const email = formData.email
        const password = formData.password
        const confirmPassword = formData.confirmPassword
        const code = formData.validateCode
        const result = validateForm(t).safeParse({ username, email, password, confirmPassword, validateCode: code })
        if (!result.success) {
            return
        }
        const resp = await fetch(`/api/valid-code?email=${email}&code=${code}&type=register`)
        if (resp.status !== 200) {
            form.setError("validateCode", { message: t("InvalidCode") })
            return
        }
        startTransition(async () => {
            const resp = await fetch(`/api/auth-user/register`, {
                method: "POST",
                body: JSON.stringify({ username, email, password, validateCode: code })
            })
            if (!resp.ok) {
                toast({
                    title: t("RegisterFailed"),
                    description: t("RegisterFailedDescription"),
                })
                return
            }
            toast({
                title: t("Success"),
                description: t("RegisterSuccess"),
            })
            setTimeout(() => {
                router.push("/login")
            }, 1000)
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
                            <form onSubmit={form.handleSubmit(handleRegister)} className="flex flex-col gap-3">
                                <FormField control={form.control} name="username" render={({ field }) => (
                                    <FormItem>
                                        <Input {...field} placeholder={t("Name")} className="focus-visible:shadow-none focus-visible:ring-0" />
                                        <FormMessage />
                                    </FormItem>
                                )} />
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
                                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                    <FormItem>
                                        <Input {...field} placeholder={t("ConfirmPassword")} type="password" className="focus-visible:shadow-none focus-visible:ring-0" />
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="validateCode" render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-center items-center">
                                            <Input {...field} placeholder={t("ValidateCode")} className="focus-visible:shadow-none focus-visible:ring-0" />
                                            <Button type="button" variant="outline" onClick={() => handleSendValidateCode(form.getValues().email)} disabled={cooldown > 0}>
                                                {cooldown > 0 ? `${cooldown}s` : <MdSend />}
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" disabled={isPending}>{t("Register")}</Button>
                            </form>
                        </Form>

                    </div>

                    <div className="w-full text-sm flex justify-center items-center gap-x-5">
                        <Link href="/login" className="hover:underline">{t("Login")}</Link>
                        <Link href="/forgot-password" className="hover:underline">{t("ForgotPassword")}</Link>
                    </div>
                </CardContent>

            </Card>
        </div>
    )
}