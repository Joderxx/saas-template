"use client"

import PageTable, { PageTableRef } from "@/components/page-table";
import { AlertDialog, AlertDialogCancel, AlertDialogFooter, AlertDialogDescription, AlertDialogTitle, AlertDialogHeader, AlertDialogContent, AlertDialogTrigger, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TableCell, TableHead } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { AiFillDelete, AiOutlineCopy, AiOutlinePlus } from "react-icons/ai";
import { z } from "zod";
import moment from "moment";

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: number
}

const validateForm = (t: (key: string) => string) => {
  return z.object({
    name: z.string().min(4, { message: t("NameIsRequired") }).max(32, { message: t("NameMustBeLessThan32Characters") }),
  })
}

function AddApiKeyDialog({ onSuccess }: { onSuccess?: () => void }) {

  const t = useTranslations("Admin-ApiKey")
  const FormType = validateForm(t)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof FormType>>({
    resolver: zodResolver(FormType),
    defaultValues: {
      name: ""
    }
  })

  const [isEditing, startTransition] = useTransition()

  async function handleSubmitAddApiKey(data: z.infer<typeof FormType>) {
    const { name } = data
    const { success, error } = FormType.safeParse({ name })
    if (!success) {
      form.setError("name", { message: error.message })
      return
    }
    startTransition(async () => {
      const res = await fetch("/api/user/dashboard/api-keys", {
        method: "POST",
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const resData = await res.json()
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
      onSuccess && onSuccess()
      setOpen(false)
    })
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger>
      <div className="flex items-center gap-2 cursor-pointer hover:bg-primary/50 text-secondary p-2 px-5 bg-primary rounded-full">
        <AiOutlinePlus />
        <span>
          {t("Add")}
        </span>
      </div>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{t("Add")}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitAddApiKey)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Name")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter className="flex justify-end items-center py-5">
            <Button type="submit" className="w-1/2" disabled={isEditing}>{t("Add")}</Button>
          </DialogFooter>
        </form>
      </Form>
      <DialogDescription />
    </DialogContent>
  </Dialog>
}

function ApiKeyDeleteDialog({ apiKey, table }: { apiKey: ApiKey, table: PageTableRef }) {
  const t = useTranslations("Admin-ApiKey")
  const { toast } = useToast()
  const [isDeleting, startDeleting] = useTransition()
  const [open, setOpen] = useState(false)

  async function handleDeleteApiKey(id: string) {
    startDeleting(async () => {
      const res = await fetch(`/api/user/dashboard/api-keys?id=${id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        toast({
          title: t("Error"),
          description: t("DeleteDialogError")
        })
        return
      }
      setOpen(false)
      toast({
        title: t("Success"),
        description: t("DeleteDialogSuccess")
      })
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
            <span>{t("DeleteDialogDescription")}</span>
            <span className="font-bold text-destructive text-lg text-center">{apiKey.name}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/60" onClick={() => handleDeleteApiKey(apiKey.id)}>{t("Delete")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function Page() {

  const { toast } = useToast()
  const [columns, setColumns] = useState<any[]>([])
  const t = useTranslations("Admin-ApiKey")
  const [loading, startLoading] = useTransition()

  function hideKey(key: string) {
    return key.slice(0, 4) + "****" + key.slice(-4)
  }

  useEffect(() => {
    setColumns([
      { key: "name", label: t("Name") },
      {
        key: "key",
        label: t("Key"),
        dataRender: (data: ApiKey) => (
          <TableCell key={`key-${data.id}`}>
            <div className="flex justify-start items-center">
              <span className="text-blue-500">{hideKey(data.key)}</span>
              <Button variant={"ghost"} size={"icon"} className="ml-2" onClick={() => {
                navigator.clipboard.writeText(data.key)
                toast({
                  title: t("Copied"),
                  description: t("ApiKeyCopiedToClipboard"),
                })
              }}><AiOutlineCopy /></Button>
            </div>
          </TableCell>
        )
      },
      {
        key: "createdAt", label: t("CreatedAt"),
        dataRender: (data: ApiKey) => (
          <TableCell key={`createdAt-${data.id}`}>
            <span>{moment(data.createdAt).format("YYYY-MM-DD HH:mm")}</span>
          </TableCell>
        )
      },
      {
        key: "action",
        headerRender: () => <TableHead key={"action"} className="text-right">{t("Action")}</TableHead>,
        dataRender: (data: ApiKey, table: PageTableRef) => (
          <TableCell key={`action-${data.id}`}>
            <div className="flex justify-end items-center gap-2">
              <ApiKeyDeleteDialog apiKey={data} table={table} />
            </div>
          </TableCell>
        )
      }
    ])
  }, [])

  const [data, setData] = useState<ApiKey[]>([])

  useEffect(() => {
    getApiKeys().then()
  }, [])

  const [start, setStart] = useState(0)
  const [offset, setOffset] = useState(10)
  const [total, setTotal] = useState(0)

  async function getApiKeys() {
    startLoading(async () => {
      const res = await fetch(`/api/user/dashboard/api-keys?start=${start}&offset=${offset}`)
      if (!res.ok) {
        return
      }
      const resData = await res.json()
      setData(resData.data)
      setTotal(resData.total)
      setStart(resData.start)
      setOffset(resData.offset)
    })
  }

  return <div>
    <h1 className="text-2xl font-bold">{t("Title")}</h1>
    <div className="flex justify-end items-center gap-x-3">
      <Button variant={"outline"} onClick={() => {
        getApiKeys().then()
      }}>{t("Refresh")}</Button>
      <AddApiKeyDialog onSuccess={getApiKeys} />

    </div>
    <div className="mt-4 px-5">
      <PageTable columns={columns} loading={loading} defaultPageSize={offset} data={data} totalSize={total} start={start} onPageChange={(pageStart1, offset1) => {
        if (pageStart1 != start || offset1 != offset) {
          setStart(pageStart1)
          setOffset(offset1)
          getApiKeys().then()
        }
      }} onUpdate={getApiKeys} />
    </div>
  </div>
}