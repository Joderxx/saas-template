"use client"

import MultiSelect from "@/components/multi-select"
import PageTable, { PageTableRef } from "@/components/page-table"
import { AlertDialog, AlertDialogDescription, AlertDialogTitle, AlertDialogHeader, AlertDialogContent, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { FormControl, FormField, FormLabel, FormItem, FormMessage, Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { TableCell } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { permissions } from "@/lib/permissions"
import { Role } from "@/lib/role-utils"
import { ADMIN_ROLE, SUPER_ADMIN_ROLE, USER_ROLE } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { AiFillDelete, AiFillEdit, AiOutlinePlus } from "react-icons/ai"
import { z } from "zod"

interface RoleInfo {
  id: string
  name: string
  permissions: string[]
}

const ValidPermissions = (t: (key: string) => string) => {
  return z.object({
    id: z.string().min(1, { message: t("IdRequired") }),
    name: z.string().min(1, { message: t("NameRequired") }),
    permissions: z.array(z.string())
  })
}

function AddRoleBtn({ onUpdate }: { onUpdate: () => void }) {
  const t = useTranslations("Admin-Role")
  const pt = useTranslations("Permissions")
  const [open, setOpen] = useState(false)
  const [isAdding, startAdding] = useTransition()
  const FormType = ValidPermissions(t)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      id: "",
      name: "",
      permissions: []
    },
  })

  const permissionList = useMemo(() => permissions(pt), [pt])

  async function handleSubmitAddRole(data: z.infer<typeof FormType>) {
    const res = FormType.safeParse(data)
    if (!res.success) {
      res.error.errors.forEach(error => {
        form.setError(error.path[0] as any, { message: error.message })
      })
      return
    }
    startAdding(async () => {
      const resp = await fetch("/api/user/admin/roles", {
        method: "POST",
        body: JSON.stringify(res.data)
      })
      if (!resp.ok) {
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
      setOpen(false)
      onUpdate()
    })
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger>
      <div className="flex items-center w-30 gap-2 cursor-pointer hover:bg-primary/50 text-secondary p-2 px-5 bg-primary rounded-full">
        <AiOutlinePlus />
        <span>
          {t("Add")}
        </span>
      </div>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t("AddRole")}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitAddRole)} className="space-y-4">
          <FormField control={form.control} name="id" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Id")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("Id")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
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

          <FormField control={form.control} name="permissions" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Permissions")}</FormLabel>
              <FormControl>
                <MultiSelect value={field.value} onValueChange={field.onChange} items={permissionList} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <DialogFooter>
            <Button type="submit" className="w-1/2" disabled={isAdding}>{t("Confirm")}</Button>
          </DialogFooter>
        </form>
      </Form>
      <DialogDescription />
    </DialogContent>
  </Dialog>
}


function UpdateRoleBtn({ role, table }: { role: RoleInfo, table: PageTableRef }) {
  const t = useTranslations("Admin-Role")
  const pt = useTranslations("Permissions")

  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const FormType = ValidPermissions(t)
  const [isUpdating, startUpdating] = useTransition()
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      id: role.id || "",
      name: role.name || "",
      permissions: role.permissions || []
    },
  })

  const permissionList = useMemo(() => permissions(pt), [pt])

  async function handleSubmitAddRole(data: z.infer<typeof FormType>) {
    const res = FormType.safeParse(data)
    if (!res.success) {
      res.error.errors.forEach(error => {
        form.setError(error.path[0] as any, { message: error.message })
      })
      return
    }
    startUpdating(async () => {
      const resp = await fetch("/api/user/admin/roles", {
        method: "PUT",
        body: JSON.stringify(res.data)
      })
      if (!resp.ok) {
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

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger>
      <div className="cursor-pointer text-xl hover:text-blue-500">
        <AiFillEdit />
      </div>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t("AddRole")}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitAddRole)} className="space-y-4">
          <FormField control={form.control} name="id" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Id")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("Id")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
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

          <FormField control={form.control} name="permissions" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Permissions")}</FormLabel>
              <FormControl>
                <MultiSelect value={field.value} onValueChange={field.onChange} items={permissionList} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <DialogFooter>
            <Button type="submit" className="w-1/2" disabled={isUpdating}>{t("Confirm")}</Button>
          </DialogFooter>
        </form>
      </Form>
      <DialogDescription />
    </DialogContent>
  </Dialog>
}

function RoleDeleteDialog({ role, table }: { role: RoleInfo, table: PageTableRef }) {
  const t = useTranslations("Admin-User")
  const { toast } = useToast()
  const [isDeleting, startDeleting] = useTransition()
  const [open, setOpen] = useState(false)

  async function handleDeleteRole() {
    startDeleting(async () => {
      const resp = await fetch(`/api/user/admin/roles?id=${role.id}`, {
        method: "DELETE"
      })
      if (!resp.ok) {
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
            <p className="font-bold text-destructive text-lg text-center">{role.name}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/60" onClick={handleDeleteRole}>{t("Continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function RolePage() {
  const t = useTranslations("Admin-Role")
  const [loading, startTransition] = useTransition()
  const [start, setStart] = useState(0)
  const [offset, setOffset] = useState(10)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<RoleInfo[]>([])

  const { toast } = useToast()
  const { data: session } = useSession()

  const columns = useMemo(() => [
    {
      key: "id",
      label: t("Id")
    },
    {
      key: "name",
      label: t("Name")
    },
    {
      key: "permissions",
      label: t("Permissions"),
      dataRender: (data: RoleInfo) => (

        data.permissions.length > 5 ? (
          <TableCell key={data.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-72 text-ellipsis overflow-hidden whitespace-nowrap">{data.permissions.map((p: string) => p).join(", ")}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-72 p-4">{data.permissions.map((p: string) => p).join(", ")}</p>
              </TooltipContent>
            </Tooltip>
          </TableCell>
        ) : (
          <TableCell key={data.id}>
            <div className="">{data.permissions.map((p: string) => p).join(", ")}</div>
          </TableCell>
        )

      )
    },
    {
      key: "action",
      label: t("Action"),
      dataRender: (data: any, table: PageTableRef) => (
        <TableCell key={data.id}>
          <div className="flex justify-end items-center gap-2">
            {data.id != ADMIN_ROLE && data.id != USER_ROLE && <UpdateRoleBtn role={data} table={table} />}
            {data.id != ADMIN_ROLE && data.id != USER_ROLE && session?.user && new Role(session).hasAnyRole([SUPER_ADMIN_ROLE])
              && <RoleDeleteDialog role={data} table={table} />
            }
          </div>
        </TableCell>
      )
    }
  ], [])

  useEffect(() => {
    handleUpdate().then()
  }, [])

  async function handleUpdate() {
    startTransition(async () => {
      const resp = await fetch(`/api/user/admin/roles?start=${start}&offset=${offset}`)
      if (!resp.ok) {
        toast({
          title: t("Error"),
          description: t("FetchDialogError")
        })
        return
      }
      const res = await resp.json()
      if (res.error) {
        toast({
          title: t("Error"),
          description: res.error
        })
        return
      }
      setData(res.data)
      setTotal(res.total)
    })
  }

  return <div className="flex flex-col">
    <h1 className="text-2xl font-bold">{t("Title")}</h1>
    <div className="flex justify-between items-center gap-x-3 py-8">
      <div className="flex items-center gap-x-3  mb-2">

      </div>
      <div className="flex justify-end items-center gap-x-3">
        <Button variant={"outline"} onClick={() => {
          handleUpdate().then()
        }}>{t("Refresh")}</Button>
        <AddRoleBtn onUpdate={handleUpdate} />
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
