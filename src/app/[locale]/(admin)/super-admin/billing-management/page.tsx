"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import PageTable, { PageTableRef } from "@/components/page-table"
import { Dialog, DialogContent, DialogFooter, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useEffect, useMemo, useState, useTransition } from "react"
import { FormField, FormLabel, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Form } from "@/components/ui/form"
import { AiFillDelete, AiFillEdit, AiOutlineGlobal, AiOutlinePlus } from "react-icons/ai"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SelectGroup, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { defaultLocale, locales } from "@/lib/languages"
import { Textarea } from "@/components/ui/textarea"
import { TableCell } from "@/components/ui/table"
import moment from "moment"
import { AlertDialog, AlertDialogAction, AlertDialogFooter, AlertDialogCancel, AlertDialogDescription, AlertDialogHeader, AlertDialogContent, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast, useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BsStripe } from "react-icons/bs"
import RoleSelect from "@/components/role-select"
import { AifadianIcon } from "@/components/icons"
import { useSession } from "next-auth/react"
import { SUPER_ADMIN_ROLE } from "@/lib/utils"
import { ADMIN_ROLE } from "@/lib/utils"
import { Role } from "@/lib/role-utils"

interface Billing {
  id: string
  productType: "FREE" | "PRO_MONTHLY" | "PRO_YEARLY" | "PRO_FIXED",
  order: number,
  timeCycle: "NONE" | "WEEKLY" | "MONTHLY" | "YEARLY" | "PERMANENT",
  discount: number,
  role: string,
  locales: {
    [key: string]: LocaleInfo
  },
  stripeInfo?: {
    id: string,
    quantity: number
  },
  aifadianInfo?: {
    planId: string
  }
}

interface LocaleInfo {
  locale: string
  name: string
  description: string
  money: number,
  oldMoney: number,
  supportAbilities: string
  noSupportAbilities: string
}

const validateAddBillingForm = (t: (key: string) => string) => {
  return z.object({
    id: z.string().min(1, { message: t("IdIsRequired") }).max(32, { message: t("IdMustBeLessThan32Characters") }),
    order: z.number().default(0).optional(),
    productType: z.enum(["FREE", "PRO_MONTHLY", "PRO_YEARLY", "PRO_FIXED"], {
      message: t("InvalidProductType")
    }),
    role: z.string().min(1, { message: t("RoleIsRequired") }),
    timeCycle: z.enum(["NONE", "WEEKLY", "MONTHLY", "YEARLY", "PERMANENT"], {
      message: t("InvalidTimeCycle")
    }),
    discount: z.number().default(0)
  })
}

function AddBillingDialog({ onSuccess }: { onSuccess?: () => void }) {

  const t = useTranslations("Admin-BillingManagement")
  const [open, setOpen] = useState(false)
  const [isEditing, startEditing] = useTransition()
  const FormType = validateAddBillingForm(t)
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      id: "",
      order: 0,
      productType: "FREE",
      timeCycle: "NONE",
      discount: 0,
      role: ""
    },
  })

  async function handleSubmitAddBilling(data: z.infer<typeof FormType>) {
    const res = FormType.safeParse({
      id: data.id,
      order: parseInt(data.order + ""),
      productType: data.productType,
      timeCycle: data.timeCycle,
      discount: data.discount,
      role: data.role
    })
    if (!res.success) {
      res.error.errors.forEach((err) => {
        form.setError(err.path[0] as any, { message: err.message })
      })
      return
    }
    startEditing(async () => {
      const res = await fetch("/api/user/super-admin/billing-management", {
        method: "POST",
        body: JSON.stringify({
          id: data.id,
          order: data.order,
          productType: data.productType,
          timeCycle: data.timeCycle,
          discount: data.discount,
          role: data.role
        })
      })
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: t("AddDialogError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: t("AddDialogSuccess")
      })
      if (onSuccess) {
        onSuccess()
      }
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="flex items-center w-30 gap-2 cursor-pointer hover:bg-primary/50 text-secondary p-2 px-5 bg-primary rounded-full">
          <AiOutlinePlus />
          <span>
            {t("Add")}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("AddBilling")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitAddBilling)} autoComplete="off" className="flex flex-col gap-3">
            <FormField control={form.control} name="id" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Id")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Id")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="order" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Order")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Order")} autoComplete="off" type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Role")}</FormLabel>
                <FormControl>
                  <RoleSelect onValueChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="timeCycle" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("TimeCycle")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="focus-visible:shadow-none focus-visible:ring-0">
                      <SelectValue placeholder={t("TimeCycle")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="NONE">{t("NONE")}</SelectItem>
                        <SelectItem value="WEEKLY">{t("WEEKLY")}</SelectItem>
                        <SelectItem value="MONTHLY">{t("MONTHLY")}</SelectItem>
                        <SelectItem value="YEARLY">{t("YEARLY")}</SelectItem>
                        <SelectItem value="PERMANENT">{t("PERMANENT")}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="discount" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Discount")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Discount")} autoComplete="off" type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="productType" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("ProductType")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="focus-visible:shadow-none focus-visible:ring-0">
                      <SelectValue placeholder={t("ProductType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="FREE">{t("FREE")}</SelectItem>
                        <SelectItem value="PRO_MONTHLY">{t("PRO_MONTHLY")}</SelectItem>
                        <SelectItem value="PRO_YEARLY">{t("PRO_YEARLY")}</SelectItem>
                        <SelectItem value="PRO_FIXED">{t("PRO_FIXED")}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />


            <DialogFooter>
              <Button type="submit" className="w-1/2" disabled={isEditing}>{t("Confirm")}</Button>
            </DialogFooter>
          </form>
        </Form>
        <DialogDescription>{t("AddDialogDescription")}</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

const validateUpdateBillingForm = (t: (key: string) => string) => {
  return z.object({
    id: z.string(),
    newId: z.string().min(1, { message: t("IdIsRequired") }).max(32, { message: t("IdMustBeLessThan32Characters") }),
    order: z.number().default(0).optional(),
    productType: z.enum(["FREE", "PRO_MONTHLY", "PRO_YEARLY", "PRO_FIXED"], {
      message: t("InvalidProductType")
    }),
    role: z.string().min(1, { message: t("RoleIsRequired") }),
    timeCycle: z.enum(["NONE", "WEEKLY", "MONTHLY", "YEARLY", "PERMANENT"], {
      message: t("InvalidTimeCycle")
    }),
    discount: z.number().default(0)
  })
}

function UpdateBillingDialog({ table, data }: { table: PageTableRef, data: Billing }) {

  const t = useTranslations("Admin-BillingManagement")
  const [open, setOpen] = useState(false)
  const [isEditing, startEditing] = useTransition()
  const FormType = validateUpdateBillingForm(t)
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      id: data.id,
      newId: data.id,
      order: data.order,
      productType: data.productType,
      timeCycle: data.timeCycle,
      discount: data.discount
    },
  })

  function handleSubmitUpdateBilling(data: z.infer<typeof FormType>) {
    const res = FormType.safeParse({
      id: data.id,
      newId: data.newId,
      order: parseInt(data.order + ""),
      productType: data.productType,
      timeCycle: data.timeCycle,
      discount: data.discount,
      role: data.role
    })
    if (!res.success) {
      res.error.errors.forEach((err) => {
        form.setError(err.path[0] as any, { message: err.message })
      })
      return
    }
    startEditing(async () => {
      const res = await fetch("/api/user/super-admin/billing-management", {
        method: "PUT",
        body: JSON.stringify({
          id: data.id,
          newId: data.newId,
          order: data.order,
          productType: data.productType,
          timeCycle: data.timeCycle,
          discount: data.discount,
          role: data.role
        })
      })
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: t("UpdateDialogError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: t("UpdateDialogSuccess")
      })
      table.update()
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="cursor-pointer text-xl hover:text-blue-500">
          <AiFillEdit />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("UpdateBilling")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitUpdateBilling)} autoComplete="off" className="flex flex-col gap-3">

            <FormField control={form.control} name="newId" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Id")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Id")} autoComplete="off" onChange={(e) => field.onChange(e.target.value)} className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="order" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Order")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Order")} autoComplete="off" type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Role")}</FormLabel>
                <FormControl>
                  <RoleSelect onValueChange={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="timeCycle" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("TimeCycle")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="focus-visible:shadow-none focus-visible:ring-0">
                      <SelectValue placeholder={t("TimeCycle")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="NONE">{t("NONE")}</SelectItem>
                        <SelectItem value="WEEKLY">{t("WEEKLY")}</SelectItem>
                        <SelectItem value="MONTHLY">{t("MONTHLY")}</SelectItem>
                        <SelectItem value="YEARLY">{t("YEARLY")}</SelectItem>
                        <SelectItem value="PERMANENT">{t("PERMANENT")}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="productType" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("ProductType")}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="focus-visible:shadow-none focus-visible:ring-0">
                      <SelectValue placeholder={t("ProductType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="FREE">{t("FREE")}</SelectItem>
                        <SelectItem value="PRO_MONTHLY">{t("PRO_MONTHLY")}</SelectItem>
                        <SelectItem value="PRO_YEARLY">{t("PRO_YEARLY")}</SelectItem>
                        <SelectItem value="PRO_FIXED">{t("PRO_FIXED")}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />


            <DialogFooter>
              <Button type="submit" className="w-1/2" disabled={isEditing}>{t("Confirm")}</Button>
            </DialogFooter>
          </form>
        </Form>
        <DialogDescription>{t("AddDialogDescription")}</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}



const validateBillingLocaleForm = (t: (key: string) => string) => {
  return z.object({
    locale: z.enum([...locales] as [string, ...string[]], { message: t("InvalidLocale") }),
    name: z.string().min(1, { message: t("NameIsRequired") }),
    money: z.number().min(0, { message: t("MoneyIsRequired") }),
    oldMoney: z.number().optional(),
    description: z.string().optional(),
    supportAbilities: z.string().min(1, { message: t("SupportAbilitiesIsRequired") }),
    noSupportAbilities: z.string().optional(),
    role: z.string().min(1, { message: t("RoleIsRequired") })
  })
}

function UpdateBillingLocaleDialog({ table, data }: { table: PageTableRef, data: Billing }) {

  const t = useTranslations("Admin-BillingManagement")
  const [open, setOpen] = useState(false)
  const [isEditing, startEditing] = useTransition()
  const FormType = validateBillingLocaleForm(t)
  const [currentLocale, setCurrentLocale] = useState("")
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      locale: defaultLocale,
      name: (data.locales[defaultLocale] || {}).name,
      money: (data.locales[defaultLocale] || {}).money,
      oldMoney: (data.locales[defaultLocale] || {}).oldMoney,
      description: (data.locales[defaultLocale] || {}).description,
      supportAbilities: (data.locales[defaultLocale] || {}).supportAbilities,
      noSupportAbilities: (data.locales[defaultLocale] || {}).noSupportAbilities,
      role: data.role
    },
  })

  useEffect(() => {
    const locale = currentLocale || defaultLocale
    if (data.locales.hasOwnProperty(locale)) {
      form.setValue("name", (data.locales[locale] || {}).name)
      form.setValue("money", (data.locales[locale] || {}).money)
      form.setValue("oldMoney", (data.locales[locale] || {}).oldMoney)
      form.setValue("description", (data.locales[locale] || {}).description)
      form.setValue("supportAbilities", (data.locales[locale] || {}).supportAbilities)
      form.setValue("noSupportAbilities", (data.locales[locale] || {}).noSupportAbilities)
    } else {
      form.setValue("name", "")
      form.setValue("money", 0)
      form.setValue("oldMoney", 0)
      form.setValue("description", "")
      form.setValue("supportAbilities", "")
      form.setValue("noSupportAbilities", "")
    }
  }, [data, currentLocale, form])

  async function handleSubmitUpdateBillingLocale(formData: z.infer<typeof FormType>) {
    const res = FormType.safeParse(formData)
    if (!res.success) {
      res.error.errors.forEach((err) => {
        form.setError(err.path[0] as any, { message: err.message })
      })
      return
    }
    startEditing(async () => {
      const res = await fetch(`/api/user/super-admin/billing-management/locale?id=${data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          locale: formData.locale,
          name: formData.name,
          money: formData.money,
          oldMoney: formData.oldMoney,
          description: formData.description,
          supportAbilities: formData.supportAbilities,
          noSupportAbilities: formData.noSupportAbilities,
          role: data.role
        })
      })
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: t("UpdateDialogError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: t("UpdateDialogSuccess")
      })
      table.update()
      setOpen(false)
    })
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger>
      <div className="cursor-pointer text-xl hover:text-blue-500">
        <AiOutlineGlobal />
      </div>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>{t("UpdateBillingLocale")} - {data.id}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitUpdateBillingLocale)} autoComplete="off" className="">
          <ScrollArea className="h-[40vh] p-5" >
            <FormField control={form.control} name="locale" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Locale")}</FormLabel>
                <FormControl>
                  <Select onValueChange={value => {
                    field.onChange(value)
                    setCurrentLocale(value)
                  }} defaultValue={field.value}>
                    <SelectTrigger className="focus-visible:shadow-none focus-visible:ring-0 p-2">
                      <SelectValue placeholder={t("Locale")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {locales.map((locale) => (
                          <SelectItem key={locale} value={locale}>{t(locale)}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Name")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Name")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Description")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Description")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="money" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Money")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Money")} autoComplete="off" type="number" step={0.01} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="oldMoney" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("OldMoney")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("OldMoney")} autoComplete="off" type="number" step={0.01} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="supportAbilities" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("SupportAbilities")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("SupportAbilitiesDescription")}
                    className="resize-none"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="noSupportAbilities" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("NoSupportAbilities")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("NoSupportAbilitiesDescription")}
                    className="resize-none"
                    rows={5}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )} />
          </ScrollArea>

          <DialogFooter>
            <Button type="submit" className="w-1/2" disabled={isEditing}>{t("Confirm")}</Button>
          </DialogFooter>
        </form>
      </Form>
      <DialogDescription>{t("AddDialogDescription")}</DialogDescription>
    </DialogContent>
  </Dialog>
}

function BillingDeleteDialog({ data, table }: { data: Billing, table: PageTableRef }) {
  const t = useTranslations("Admin-User")
  const { toast } = useToast()
  const [isDeleting, startDeleting] = useTransition()
  const [open, setOpen] = useState(false)

  async function handleDeleteBilling() {
    startDeleting(async () => {
      const res = await fetch(`/api/user/super-admin/billing-management?id=${data.id}`, {
        method: "DELETE",
        body: JSON.stringify({
          id: data.id
        })
      })
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: t("DeleteDialogError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: t("DeleteDialogSuccess")
      })
      table.update()
      setOpen(false)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <div className="cursor-pointer text-xl hover:text-destructive/50 text-destructive">
          <AiFillDelete />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("DeleteDialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            <p>{t("DeleteDialogDescription")}</p>
            <p className="font-bold text-destructive text-lg text-center">{data.id}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/60" onClick={handleDeleteBilling}>{t("Continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const validateBillingStripeForm = (t: (key: string) => string) => {
  return z.object({
    id: z.string(),
    quantity: z.number().min(0, { message: t("QuantityDescription") }).default(1)
  })
}

function BillingStripeBtn({ data, table }: { data: Billing, table: PageTableRef }) {

  const [isEditing, startEditing] = useTransition()
  const [open, setOpen] = useState(false)
  const t = useTranslations("Admin-BillingManagement")
  const FormType = validateBillingStripeForm(t)
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      id: data.id,
      quantity: data.stripeInfo?.quantity || 1,
    },
  })

  async function handleSubmitUpdateBillingStripe(data: z.infer<typeof FormType>) {
    const res = FormType.safeParse(data)
    if (!res.success) {
      res.error.errors.forEach((err) => {
        form.setError(err.path[0] as any, { message: err.message })
      })
      return
    }
    startEditing(async () => {
      const res = await fetch(`/api/user/super-admin/billing-management/stripe?id=${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: t("UpdateStripeDialogError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: t("UpdateStripeDialogSuccess")
      })
      table.update()
      setOpen(false)
    })
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger>
      <div className="cursor-pointer text-xl hover:text-destructive/50 text-destructive">
        <BsStripe />
      </div>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>{t("StripeConfig")}</DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitUpdateBillingStripe)} autoComplete="off" className="">
          <FormField control={form.control} name="quantity" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Quantity")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("Quantity")} autoComplete="off" type="number" min={0} step={1} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="focus-visible:shadow-none focus-visible:ring-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <DialogFooter className="py-2">
            <Button type="submit" className="w-1/2" disabled={isEditing}>{t("Confirm")}</Button>
          </DialogFooter>
        </form>
      </Form>
      <DialogDescription></DialogDescription>
    </DialogContent>
  </Dialog>
}


const validateBillingAifadianForm = (t: (key: string) => string) => {
  return z.object({
    id: z.string(),
    planId: z.string(),
  })
}

function BillingAifadianBtn({ data, table }: { data: Billing, table: PageTableRef }) {

  const [isEditing, startEditing] = useTransition()
  const [open, setOpen] = useState(false)
  const t = useTranslations("Admin-BillingManagement")
  const FormType = validateBillingAifadianForm(t)
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      id: data.id,
      planId: data.aifadianInfo?.planId,
    },
  })

  async function handleSubmitUpdateBillingAifadian(data: z.infer<typeof FormType>) {
    const res = FormType.safeParse(data)
    if (!res.success) {
      res.error.errors.forEach((err) => {
        form.setError(err.path[0] as any, { message: err.message })
      })
      return
    }
    startEditing(async () => {
      const res = await fetch(`/api/user/super-admin/billing-management/aifadian?id=${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: t("UpdateAifadianDialogError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: t("UpdateAifadianDialogSuccess")
      })
      table.update()
      setOpen(false)
    })
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger>
      <div className="cursor-pointer text-xl hover:text-destructive/50 text-destructive">
        <AifadianIcon />
      </div>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>{t("Aifadian")}</DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitUpdateBillingAifadian)} autoComplete="off" className="">
          <FormField control={form.control} name="planId" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("PlanId")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("PlanId")} autoComplete="off" type="text" className="focus-visible:shadow-none focus-visible:ring-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <DialogFooter className="py-2">
            <Button type="submit" className="w-1/2" disabled={isEditing}>{t("Confirm")}</Button>
          </DialogFooter>
        </form>
      </Form>
      <DialogDescription></DialogDescription>
    </DialogContent>
  </Dialog>
}

export default function Page() {

  const [data, setData] = useState<Billing[]>([])
  const [start, setStart] = useState(0)
  const [offset, setOffset] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, startLoading] = useTransition()

  const t = useTranslations("Admin-BillingManagement")
  const { data: session } = useSession()

  const columns = useMemo(() => [
    { key: "id", label: t("Id") },
    { key: "productType", label: t("ProductType") },
    { key: "order", label: t("Order") },
    {
      key: "updatedAt", label: t("UpdatedAt"),
      dataRender: (data: any) => {
        return <TableCell key={`updatedAt-${data.id}`}>
          <span>{moment(data.updatedAt).format("YYYY-MM-DD HH:mm")}</span>
        </TableCell>
      }
    },
    {
      key: "discount", label: t("Discount"),
      dataRender: (data: any) => {
        return <TableCell key={`discount-${data.id}`}>
          <span>{data.discount}%</span>
        </TableCell>
      }
    },
    {
      key: "timeCycle", label: t("TimeCycle"),
      dataRender: (data: any) => {
        return <TableCell key={`timeCycle-${data.id}`}>
          <span>{t(data.timeCycle)}</span>
        </TableCell>
      }
    },
    {
      key: "role", label: t("Role"),
    },
    {
      key: "actions", label: t("Actions"),
      dataRender: (data: any, table: PageTableRef) => (
        <TableCell key={`actions-${data.id}`}>
          <div className="flex items-center gap-2">
            <UpdateBillingDialog table={table} data={data} />
            <BillingStripeBtn data={data} table={table} />
            <BillingAifadianBtn data={data} table={table} />
            <UpdateBillingLocaleDialog table={table} data={data} />
            {
              session?.user && new Role(session).hasAnyRole([SUPER_ADMIN_ROLE]) && <BillingDeleteDialog data={data} table={table} />
            }

          </div>
        </TableCell>
      )
    }
  ], [t])

  useEffect(() => {
    handleUpdate().then()
  }, [])

  async function handleUpdate() {

    startLoading(async () => {
      const res = await fetch(`/api/user/super-admin/billing-management?start=${start}&offset=${offset}`)
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: t("FetchDataError")
        })
        return
      }
      const data = await res.json()
      setData(data.data)
      setTotal(data.total)
    })
  }

  return <div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold">{t("Title")}</h1>
    <div className="flex justify-between items-center gap-x-3 py-8">
      <div></div>
      <div className="flex justify-end items-center gap-x-3">
        <Button variant={"outline"} onClick={() => {
          handleUpdate().then()
        }}>{t("Refresh")}</Button>
        <AddBillingDialog onSuccess={handleUpdate} />
      </div>
    </div>
    <div className="mt-4 px-5">
      <PageTable columns={columns} defaultPageSize={10} data={data} start={start} totalSize={total} loading={loading} onPageChange={(start1, offset1) => {
        if (start1 != start || offset1 != offset) {
          setStart(start1)
          setOffset(offset1)
          handleUpdate().then()
        }
      }} onUpdate={() => handleUpdate} />
    </div>
  </div>
}
