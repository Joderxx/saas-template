"use client"

import PageTable, { PageTableRef } from "@/components/page-table";
import { Button } from "@/components/ui/button";
import { TableCell, TableHead } from "@/components/ui/table";
import { useEffect, useState, useTransition } from "react";
import { AiFillEdit, AiFillDelete, AiOutlinePlus } from "react-icons/ai";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";
import moment from "moment";
import { Select, SelectValue, SelectTrigger, SelectGroup, SelectContent } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { ADMIN_ROLE, cn, SUPER_ADMIN_ROLE } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { UserError } from "@/lib/rest-error";
import { RiLock2Fill, RiLockUnlockFill } from "react-icons/ri";
import currency from "currency.js"
import RoleSelect from "@/components/role-select";
interface User {
  id: number
  name: string
  email: string
  role: string
  lastLoginAt: number
  productType: "FREE" | "PRO_MONTHLY" | "PRO_YEARLY"
  endSubscriptionAt: number
  money: number,
  forbbiden: boolean
}

const validateAddUserForm = (t: (key: string) => string) => {
  return z.object({
    username: z.string().min(4, { message: t("UsernameIsRequired") }).max(32, { message: t("UsernameMustBeLessThan32Characters") }),
    email: z.string().email({ message: t("InvalidEmail") }),
    password: z.string().min(8, { message: t("PasswordMustBeMoreThan8Characters") }).max(32, { message: t("PasswordMustBeLessThan32Characters") }),
    role: z.string(),
    productType: z.enum(["FREE", "PRO_MONTHLY", "PRO_YEARLY"], {
      message: t("InvalidProductType")
    }),
    endSubscriptionAt: z.date()
  })
}


function AddUserDialog({ onSuccess }: { onSuccess: () => void }) {

  const t = useTranslations("Admin-User")
  const { toast } = useToast()
  const [isEditing, startEditing] = useTransition()
  const [open, setOpen] = useState(false)

  const FormType = validateAddUserForm(t)
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "USER",
      productType: "FREE",
      endSubscriptionAt: new Date()
    },
  })

  async function handleSubmitAddUser(data: z.infer<typeof FormType>) {

    const result = FormType.safeParse(data)
    if (!result.success) {
      result.error.errors.forEach(error => {
        form.setError(error.path[0] as any, { message: error.message })
      })
      return;
    }
    startEditing(async () => {
      const res = await fetch("/api/user/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: data.username,
          email: data.email,
          password: data.password,
          role: data.role,
          productType: data.productType,
          endSubscriptionAt: data.endSubscriptionAt.getTime()
        })
      })
      if (!res.ok) {
        const resData = await res.json()
        if (resData.status === UserError.USER_ALREADY_EXISTS) {
          form.setError("email", { message: t("UserAlreadyExists") })
        } else {
          toast({
            title: t("Error"),
            description: t("AddDialogError")
          })
          return;
        }
      }
      toast({
        title: t("Success"),
        description: t("AddDialogSuccess")
      })
      setOpen(false)
      onSuccess()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="flex items-center w-30 gap-2 cursor-pointer hover:bg-primary/50 text-secondary p-2 px-5 bg-primary rounded-full">
          <AiOutlinePlus />
          <span>
            {t("AddUser")}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("AddUser")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitAddUser)} autoComplete="off" className="flex flex-col gap-3">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Username")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Username")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Email")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Password")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Password")} type="password" autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Role")}</FormLabel>
                <FormControl>
                  <RoleSelect value={field.value} onValueChange={field.onChange} />
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
                        <SelectItem value="FREE">{t("Free")}</SelectItem>
                        <SelectItem value="PRO_MONTHLY">{t("ProMonthly")}</SelectItem>
                        <SelectItem value="PRO_YEARLY">{t("ProYearly")}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="endSubscriptionAt" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("EndSubscriptionAt")}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          moment(field.value).format("YYYY-MM-DD")
                        ) : (
                          <span>{t("PickADate")}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                      disabled={(date: Date) =>
                        date < new Date("2024-10-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="submit" className="w-1/2" disabled={isEditing}>{t("Confirm")}</Button>
            </DialogFooter>
          </form>
        </Form>
        <DialogDescription>{t("EditDialogDescription")}</DialogDescription>
      </DialogContent>
    </Dialog>

  )
}


const validateForm = (t: (key: string) => string) => {
  return z.object({
    username: z.string().min(4, { message: t("UsernameIsRequired") }).max(32, { message: t("UsernameMustBeLessThan32Characters") }),
    role: z.string(),
    productType: z.enum(["FREE", "PRO_MONTHLY", "PRO_YEARLY"], {
      message: t("InvalidProductType")
    }),
    endSubscriptionAt: z.date()
  })
}

function UserEditDialog({ user, table }: { user: User, table: PageTableRef }) {

  const t = useTranslations("Admin-User")
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isUpdating, startUpdating] = useTransition()

  const FormType = validateForm(t)
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      username: user.name,
      role: user.role,
      productType: user.productType,
      endSubscriptionAt: new Date(user.endSubscriptionAt)
    },
  })

  async function handleSubmitEditUser(data: z.infer<typeof FormType>) {

    const result = FormType.safeParse(data)
    if (!result.success) {
      result.error.errors.forEach(error => {
        form.setError(error.path[0] as any, { message: error.message })
      })
      return;
    }
    startUpdating(async () => {
      const res = await fetch(`/api/user/admin/users`, {
        method: "PUT",
        body: JSON.stringify({
          email: user.email,
          name: data.username,
          role: data.role,
          productType: data.productType,
          endSubscriptionAt: data.endSubscriptionAt.getTime()
        })
      })
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: t("EditDialogError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: t("EditDialogSuccess")
      })
      setOpen(false)
      table.update()
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
          <DialogTitle>{t("EditUser")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitEditUser)} autoComplete="off" className="flex flex-col gap-3">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Username")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("Username")} className="focus-visible:shadow-none focus-visible:ring-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Role")}</FormLabel>
                <FormControl>
                  <RoleSelect value={field.value} onValueChange={field.onChange} />
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
                        <SelectItem value="FREE">{t("Free")}</SelectItem>
                        <SelectItem value="PRO_MONTHLY">{t("ProMonthly")}</SelectItem>
                        <SelectItem value="PRO_YEARLY">{t("ProYearly")}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="endSubscriptionAt" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("EndSubscriptionAt")}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          moment(field.value).format("YYYY-MM-DD")
                        ) : (
                          <span>{t("PickADate")}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                      disabled={(date: Date) =>
                        date < new Date("2024-10-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="submit" className="w-1/2" disabled={isUpdating}>{t("Confirm")}</Button>
            </DialogFooter>
          </form>
        </Form>
        <DialogDescription>{t("EditDialogDescription")}</DialogDescription>
      </DialogContent>
    </Dialog>

  )
}

function UserDeleteDialog({ user, table }: { user: User, table: PageTableRef }) {
  const t = useTranslations("Admin-User")
  const { toast } = useToast()
  const [isDeleting, startDeleting] = useTransition()
  const [open, setOpen] = useState(false)

  async function handleDeleteUser() {
    startDeleting(async () => {
      const res = await fetch(`/api/user/admin/users?email=${user.email}`, {
        method: "DELETE"
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
      setOpen(false)
      table.update()
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
            <p className="font-bold text-destructive text-lg text-center">{user.name}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/60" onClick={handleDeleteUser}>{t("Continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function UserForbiddenDialog({ user, table }: { user: User, table: PageTableRef }) {
  const t = useTranslations("Admin-User")
  const { toast } = useToast()
  const [isDeleting, startDeleting] = useTransition()
  const [open, setOpen] = useState(false)

  async function handleForbiddenUser(value: boolean) {
    startDeleting(async () => {
      const res = await fetch(`/api/user/admin/users/forbidden?email=${user.email}&state=${value}`, {
        method: "POST"
      })
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: value ? t("ForbiddenDialogError") : t("UnforbiddenDialogError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: value ? t("ForbiddenDialogSuccess") : t("UnforbiddenDialogSuccess")
      })
      setOpen(false)
      table.update()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <div className="cursor-pointer text-xl hover:text-destructive/50 text-destructive">
          {user.forbbiden ? <RiLockUnlockFill className="text-primary" /> : <RiLock2Fill className="text-destructive" />}
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("ForbiddenDialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            <p>{!user.forbbiden ? t("ForbiddenDialogDescription") : t("UnforbiddenDialogDescription")}</p>
            <p className="font-bold text-destructive text-lg text-center">{user.name}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/60" onClick={() => handleForbiddenUser(!user.forbbiden)}>{t("Continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function Page() {

  const [columns, setColumns] = useState<any[]>([])
  const [data, setData] = useState<User[]>([])
  const t = useTranslations("Admin-User")
  const { data: session } = useSession()

  useEffect(() => {
    setColumns([
      { key: "name", label: t("Name") },
      { key: "email", label: t("Email") },
      { key: "role", label: t("Role") },
      {
        key: "lastLoginAt", label: t("LastLoginAt"),
        dataRender: (data: any) => {
          return (
            <TableCell key={`lastLoginAt-${data.id}`} className="w-64">
              <span className="text-muted-foreground">{moment(data.lastLoginAt).format("YYYY-MM-DD HH:mm")}</span>
            </TableCell>
          )
        }
      },
      { key: "productType", label: t("ProductType") },
      {
        key: "endSubscriptionAt", label: t("EndSubscriptionAt"),
        dataRender: (data: any) => {
          return (
            <TableCell key={`endSubscriptionAt-${data.id}`} className="w-80">
              <span>{data.endSubscriptionAt ? moment(data.endSubscriptionAt).format("YYYY-MM-DD HH:mm") : "-"}</span>
            </TableCell>
          )
        }
      },
      {
        key: "forbidden",
        label: t("Forbidden"),
        dataRender: (data: any) => {
          return (
            <TableCell key={`forbidden-${data.id}`} className="w-80">
              <span>{data.forbbiden ? t("Yes") : t("No")}</span>
            </TableCell>
          )
        }
      },
      {
        key: "money", label: t("Money"),
        dataRender: (data: any) => {
          return (
            <TableCell key={`money-${data.id}`} className="w-80">
              <span>{currency(data.money / 100.0, { symbol: "$", precision: 2 }).format()}</span>
            </TableCell>
          )
        }
      },
      {
        key: "action",
        label: t("Action"),
        dataRender: (data: any, table: PageTableRef) => (
          <TableCell key={data.id}>
            <div className="flex justify-end items-center gap-2">

              {data.role === ADMIN_ROLE || data.role === SUPER_ADMIN_ROLE ? null : <UserForbiddenDialog user={data} table={table} />}
              {session?.user?.id !== data.id && <UserEditDialog user={data} table={table} />}
              {session?.user?.id === data.id || data.role === ADMIN_ROLE || data.role === SUPER_ADMIN_ROLE ? null : (
                <>
                  <UserDeleteDialog user={data} table={table} />
                </>
              )}

            </div>
          </TableCell>
        )
      }
    ])
  }, [])

  const [start, setStart] = useState(0)
  const [offset, setOffset] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, startLoading] = useTransition()
  const [startLastLoginAt, setStartLastLoginAt] = useState<Date>(new Date(2024, 9, 1))
  const [endLastLoginAt, setEndLastLoginAt] = useState<Date>(new Date())
  const [startEndSubscriptionAt, setStartEndSubscriptionAt] = useState<Date>(new Date(2024, 10, 1))
  const [endEndSubscriptionAt, setEndEndSubscriptionAt] = useState<Date>(new Date())
  const [role, setRole] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [productType, setProductType] = useState<string>("FREE")
  const [isEmailChecked, setIsEmailChecked] = useState<boolean>(false)
  const [isRoleChecked, setIsRoleChecked] = useState<boolean>(false)
  const [isProductTypeChecked, setIsProductTypeChecked] = useState<boolean>(false)
  const [isLastLoginAtChecked, setIsLastLoginAtChecked] = useState<boolean>(false)
  const [isEndSubscriptionAtChecked, setIsEndSubscriptionAtChecked] = useState<boolean>(false)

  useEffect(() => {
    handleUpdate().then()
  }, [])

  async function handleUpdate() {
    startLoading(async () => {
      const params = new URLSearchParams()
      params.set("start", start.toString())
      params.set("offset", offset.toString())
      if (isEmailChecked) {
        params.set("email", email)
      }
      if (isRoleChecked) {
        params.set("role", role)
      }
      if (isProductTypeChecked) {
        params.set("productType", productType)
      }
      if (isLastLoginAtChecked) {
        params.set("startLastLoginAt", startLastLoginAt.getTime().toString())
        params.set("endLastLoginAt", endLastLoginAt.getTime().toString())
      }
      if (isEndSubscriptionAtChecked) {
        params.set("startEndSubscriptionAt", startEndSubscriptionAt.getTime().toString())
        params.set("endEndSubscriptionAt", endEndSubscriptionAt.getTime().toString())
      }
      const res = await fetch(`/api/user/admin/users?${params.toString()}`)

      if (!res.ok) {
        return
      }
      const resData = await res.json()
      setData(resData.data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.roleId,
        lastLoginAt: user.lastLoginAt,
        productType: user.productType,
        endSubscriptionAt: user.endSubscriptionAt,
        money: user.totalActualMoney
      } as User)))
      setTotal(resData.data.total)
    })
  }

  return <div>
    <h1 className="text-2xl font-bold">{t("Title")}</h1>
    <div className="flex justify-between items-center gap-x-3 py-8">
      <div className="flex items-center gap-x-3  mb-2">
        <div className="flex flex-col items-start gap-y-2 w-32">
          <Label htmlFor="email" className="flex items-center gap-x-2">
            {t("Email")} <Checkbox checked={isEmailChecked} onCheckedChange={(checked) => setIsEmailChecked(!!checked)} />
          </Label>
          {isEmailChecked && <Input id="email" className="w-32" placeholder={t("Email")} value={email} onChange={(e) => setEmail(e.target.value)} />}
        </div>
        <div className="flex flex-col items-start gap-y-2 w-32">
          <Label htmlFor="role" className="flex items-center gap-x-2">
            {t("Role")} <Checkbox checked={isRoleChecked} onCheckedChange={(checked) => setIsRoleChecked(!!checked)} />
          </Label>
          {isRoleChecked && <RoleSelect value={role} onValueChange={(value) => setRole(value)} />}
        </div>
        <div className="flex flex-col items-start gap-y-2 w-32">
          <Label htmlFor="productType" className="flex items-center gap-x-2">
            {t("ProductType")} <Checkbox checked={isProductTypeChecked} onCheckedChange={(checked) => setIsProductTypeChecked(!!checked)} />
          </Label>
          {isProductTypeChecked && <Select value={productType} onValueChange={(value) => setProductType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue id="productType" placeholder={t("ProductType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">{t("Free")}</SelectItem>
              <SelectItem value="PRO_MONTHLY">{t("ProMonthly")}</SelectItem>
              <SelectItem value="PRO_YEARLY">{t("ProYearly")}</SelectItem>
            </SelectContent>
          </Select>
          }
        </div>
        <div className="flex flex-col items-start gap-y-2 w-[300px]">
          <Label htmlFor="lastLoginAt" className="flex items-center gap-x-2 ">
            {t("LastLoginAt")} <Checkbox checked={isLastLoginAtChecked} onCheckedChange={(checked) => setIsLastLoginAtChecked(!!checked)} />
          </Label>
          {isLastLoginAtChecked && <DateRangePicker id="lastLoginAt" start={startLastLoginAt} end={endLastLoginAt} onDateChange={(start, end) => {
            setStartLastLoginAt(start)
            setEndLastLoginAt(end)
          }} />}
        </div>
        <div className="flex flex-col items-start gap-y-2 w-[300px]">
          <Label htmlFor="endSubscriptionAt" className="flex items-center gap-x-2">
            {t("EndSubscriptionAt")} <Checkbox checked={isEndSubscriptionAtChecked} onCheckedChange={(checked) => setIsEndSubscriptionAtChecked(!!checked)} />
          </Label>
          {isEndSubscriptionAtChecked && <DateRangePicker id="endSubscriptionAt" start={startEndSubscriptionAt} end={endEndSubscriptionAt} onDateChange={(start, end) => {
            setStartEndSubscriptionAt(start)
            setEndEndSubscriptionAt(end)
          }} />}
        </div>
      </div>
      <div className="flex justify-end items-center gap-x-3">
        <Button variant={"outline"} onClick={() => {
          handleUpdate().then()
        }}>{t("Refresh")}</Button>
        <AddUserDialog onSuccess={handleUpdate} />
      </div>
    </div>
    <div className="mt-4 px-5">
      <PageTable columns={columns} defaultPageSize={10} data={data} start={start} totalSize={total} loading={loading} onPageChange={(start1, offset1) => {
        if (start1 != start || offset1 != offset) {
          setStart(start1)
          setOffset(offset1)
          handleUpdate().then()
        }
      }} onUpdate={handleUpdate} />
    </div>
  </div>
}