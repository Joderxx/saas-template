"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState, useTransition } from "react"
import PageTable, { PageTableRef } from "@/components/page-table"
import { AiFillDelete } from "react-icons/ai"
import { TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogDescription, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { FormControl, FormLabel, FormItem, FormField, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { AiFillEdit, AiOutlinePlus } from "react-icons/ai"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogDescription, AlertDialogTitle, AlertDialogHeader, AlertDialogContent, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/date-range-picker"
import { docsGroup } from "@/lib/docs-group"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select"
import MultiRoleSelect from "@/components/multi-role-select"
import TestNotionPage from "@/components/test-notion-page"
import moment from "moment"
import { Group } from "@radix-ui/react-select"
import { SUPER_ADMIN_ROLE } from "@/lib/utils"
import { Role } from "@/lib/role-utils"
import { useSession } from "next-auth/react"

interface DocsInfo {
  id: string
  description: string
  notionHerf: string
  group: string
  order: number
  createdAt: Date
  updatedAt: Date
  hasAuth: boolean
  role: string[]
}

const ValidDocs = (t: (key: string) => string) => {
  return z.object({
    description: z.string().min(1, { message: t("DescriptionRequired") }),
    notionHerf: z.string().min(1, { message: t("NotionHerfRequired") }),
    group: z.string().min(1, { message: t("GroupRequired") }),
    order: z.number().default(0).optional(),
    hasAuth: z.boolean().default(false).optional(),
    role: z.array(z.string()).default([]).optional()
  })
}

function AddDocsBtn({ onUpdate }: { onUpdate: () => void }) {
  const t = useTranslations("Admin-DocsManagement")
  const dt = useTranslations("DocsGroup")
  const [open, setOpen] = useState(false)
  const [isAdding, startAdding] = useTransition()
  const FormType = ValidDocs(t)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      description: "",
      notionHerf: "",
      group: "",
      order: 0,
      hasAuth: false,
      role: []
    },
  })

  const docsGroups = useMemo(() => docsGroup, [dt])

  async function handleSubmitAddDocs(data: z.infer<typeof FormType>) {
    const res = FormType.safeParse(data)
    if (!res.success) {
      res.error.errors.forEach(error => {
        form.setError(error.path[0] as any, { message: error.message })
      })
      return
    }
    startAdding(async () => {
      const resp = await fetch("/api/user/admin/docs", {
        method: "POST",
        body: JSON.stringify(res.data)
      })
      if (!resp.ok) {
        toast({
          title: t("Error"),
          description: t("AddDocsError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: t("AddDocsSuccess")
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
        <DialogTitle>{t("AddDocs")}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitAddDocs)} className="space-y-4">
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Description")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("Description")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="notionHerf" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("NotionHerf")}</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input {...field} placeholder={t("NotionHerf")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
                  <TestNotionPage pageId={field.value} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="group" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Group")}</FormLabel>
              <FormControl>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Group")} />
                  </SelectTrigger>
                  <SelectContent>
                    {docsGroups.map(group => (
                      <SelectItem key={group} value={group}>{dt(group)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )} />


          <FormField control={form.control} name="order" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Order")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("Order")} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="hasAuth" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("HasAuth")}</FormLabel>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />

          {form.getValues("hasAuth") && <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Role")}</FormLabel>
              <FormControl>
                <MultiRoleSelect value={field.value as string[]} onValueChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />}

          <DialogFooter>
            <Button type="submit" className="w-1/2" disabled={isAdding}>{t("Confirm")}</Button>
          </DialogFooter>
        </form>
      </Form>
      <DialogDescription />
    </DialogContent>
  </Dialog>
}

const ValidUpdateDocs = (t: (key: string) => string) => {
  return z.object({
    id: z.string().min(1, { message: t("IdRequired") }),
    description: z.string().min(1, { message: t("DescriptionRequired") }),
    notionHerf: z.string().min(1, { message: t("NotionHerfRequired") }),
    order: z.number().default(0).optional(),
    top: z.boolean().default(false).optional(),
    group: z.string().min(1, { message: t("GroupRequired") }),
    hasAuth: z.boolean().default(false).optional(),
    role: z.array(z.string()).default([]).optional()
  })
}

function UpdateDocsBtn({ docs, table }: { docs: DocsInfo, table: PageTableRef }) {
  const t = useTranslations("Admin-DocsManagement")
  const dt = useTranslations("DocsGroup")
  const [open, setOpen] = useState(false)
  const FormType = ValidUpdateDocs(t)
  const { toast } = useToast()
  const [isUpdating, startUpdating] = useTransition()
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      id: docs.id,
      description: docs.description,
      notionHerf: docs.notionHerf,
      group: docs.group,
      order: docs.order,
      hasAuth: docs.hasAuth,
      role: docs.role
    },
  })
  const docsGroups = useMemo(() => docsGroup, [dt])

  async function handleSubmitUpdateDocs(data: z.infer<typeof FormType>) {
    const res = FormType.safeParse(data)
    if (!res.success) {
      res.error.errors.forEach(error => {
        form.setError(error.path[0] as any, { message: error.message })
      })
      return
    }
    startUpdating(async () => {
      const resp = await fetch("/api/user/admin/docs", {
        method: "PUT",
        body: JSON.stringify(res.data)
      })
      if (!resp.ok) {
        toast({
          title: t("Error"),
          description: t("UpdateDocsError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: t("UpdateDocsSuccess")
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
        <DialogTitle>{t("UpdateDocs")}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitUpdateDocs)} className="space-y-4">
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Description")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("Description")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="notionHerf" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("NotionHerf")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("NotionHerf")} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="group" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Group")}</FormLabel>
              <FormControl>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Group")} />
                  </SelectTrigger>
                  <SelectContent>
                    {docsGroups.map(group => (
                      <SelectItem key={group} value={group}>{dt(group)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )} />

          <FormField control={form.control} name="order" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Order")}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t("Order")} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} autoComplete="off" className="focus-visible:shadow-none focus-visible:ring-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="hasAuth" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("HasAuth")}</FormLabel>
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />

          {form.getValues("hasAuth") && <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Role")}</FormLabel>
              <FormControl>
                <MultiRoleSelect value={field.value as string[]} onValueChange={field.onChange} />
              </FormControl>
            </FormItem>
          )} />}

          <DialogFooter>
            <Button type="submit" className="w-1/2" disabled={isUpdating}>{t("Confirm")}</Button>
          </DialogFooter>
        </form>
      </Form>
      <DialogDescription />
    </DialogContent>
  </Dialog>
}

function DocsDeleteDialog({ docs, table }: { docs: DocsInfo, table: PageTableRef }) {
  const t = useTranslations("Admin-DocsManagement")
  const { toast } = useToast()
  const [isDeleting, startDeleting] = useTransition()
  const [open, setOpen] = useState(false)

  async function handleDeleteDocs() {
    startDeleting(async () => {
      const resp = await fetch(`/api/user/admin/docs?id=${docs.id}`, {
        method: "DELETE"
      })
      if (!resp.ok) {
        toast({
          title: t("Error"),
          description: t("DeleteDocsError")
        })
        return
      }
      toast({
        title: t("Success"),
        description: t("DeleteDocsSuccess")
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
          <AlertDialogTitle>{t("DeleteDocs")}</AlertDialogTitle>
          <AlertDialogDescription>
            <p>{t("DeleteDocsDescription")}</p>
            <p className="font-bold text-destructive text-lg text-center">{docs.description}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/60" onClick={handleDeleteDocs}>{t("Continue")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function DocsManagement() {

  const t = useTranslations("Admin-DocsManagement")
  const dt = useTranslations("DocsGroup")
  const [start, setStart] = useState(0)
  const [offset, setOffset] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, startLoading] = useTransition()
  const [data, setData] = useState<DocsInfo[]>([])

  const { data: session } = useSession()

  const columns = useMemo(() => [
    {
      key: "description",
      label: t("Description")
    },
    {
      key: "notionHerf",
      label: t("NotionHerf")
    },
    {
      key: "order",
      label: t("Order")
    },
    {
      key: "group",
      label: t("Group"),
      dataRender: (data: DocsInfo) => (
        <TableCell key={`group-${data.id}`}>
          {dt(data.group)}
        </TableCell>
      )
    },
    {
      key: "createdAt",
      label: t("CreatedAt"),
      dataRender: (data: DocsInfo) => (
        <TableCell key={`createdAt-${data.id}`}>
          {moment(data.createdAt).format("YYYY-MM-DD HH:mm")}
        </TableCell>
      )
    },
    {
      key: "action",
      label: t("Action"),
      dataRender: (data: DocsInfo, table: PageTableRef) => (
        <TableCell key={data.id}>
          <div className="flex items-center gap-2">
            <UpdateDocsBtn docs={data} table={table} />
            {
              session?.user && new Role(session).hasAnyRole([SUPER_ADMIN_ROLE]) && <DocsDeleteDialog docs={data} table={table} />
            }
            
          </div>
        </TableCell>
      )
    }
  ], [])

  const [startCreatedAt, setStartCreatedAt] = useState<Date>(new Date(2024, 9, 1))
  const [endCreatedAt, setEndCreatedAt] = useState<Date>(new Date())
  const [isCreatedAtChecked, setIsCreatedAtChecked] = useState<boolean>(false)
  const [notionHerf, setNotionHerf] = useState<string>("")
  const [isNotionHerfChecked, setIsNotionHerfChecked] = useState<boolean>(false)

  async function handleUpdate() {
    startLoading(async () => {
      const searchParams = new URLSearchParams()
      searchParams.set("start", start.toString())
      searchParams.set("offset", offset.toString())
      if (isCreatedAtChecked) {
        searchParams.set("startCreatedAt", startCreatedAt.toISOString())
        searchParams.set("endCreatedAt", endCreatedAt.toISOString())
      }
      if (isNotionHerfChecked) {
        searchParams.set("notionHerf", notionHerf)
      }
      const resp = await fetch(`/api/user/admin/docs?${searchParams.toString()}`)
      if (!resp.ok) {
        return
      }
      const data = await resp.json()
      setData(data.data)
      setTotal(data.total)
    })
  }

  useEffect(() => {
    handleUpdate().then()
  }, [])

  return <div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold">{t("Title")}</h1>
    <div className="flex justify-between items-center gap-x-3 py-8">
      <div className="flex items-center gap-x-3  mb-2">
        <div className="flex flex-col items-start gap-y-2 w-32">
          <Label htmlFor="notionHerf" className="flex items-center gap-x-2">
            {t("NotionHerf")} <Checkbox checked={isNotionHerfChecked} onCheckedChange={(checked) => setIsNotionHerfChecked(!!checked)} />
          </Label>
          {isNotionHerfChecked && <Input id="notionHerf" className="w-32" placeholder={t("NotionHerf")} value={notionHerf} onChange={(e) => setNotionHerf(e.target.value)} />}
        </div>
        <div className="flex flex-col items-start gap-y-2 w-[300px]">
          <Label htmlFor="createdAt" className="flex items-center gap-x-2 ">
            {t("CreatedAt")} <Checkbox checked={isCreatedAtChecked} onCheckedChange={(checked) => setIsCreatedAtChecked(!!checked)} />
          </Label>
          {isCreatedAtChecked && <DateRangePicker id="createdAt" start={startCreatedAt} end={endCreatedAt} onDateChange={(start, end) => {
            setStartCreatedAt(start)
            setEndCreatedAt(end)
          }} />}
        </div>
      </div>
      <div className="flex justify-end items-center gap-x-3">
        <Button variant={"outline"} onClick={() => {
          handleUpdate().then()
        }}>{t("Refresh")}</Button>
        <AddDocsBtn onUpdate={handleUpdate} />
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
