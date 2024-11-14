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

interface ProductInfo {
	id: string
	name: string
	description: string
	url: string
	createdAt: number
}

const validateForm = (t: (key: string) => string) => {
	return z.object({
		name: z.string().min(1, { message: t("NameIsRequired") }),
		description: z.string().min(1, { message: t("DescriptionIsRequired") }),
		url: z.string().url({ message: t("UrlIsRequired") }),
	})
}

function AddProductDialog({ onSuccess }: { onSuccess?: () => void }) {

	const t = useTranslations("Admin-ProductManagement")
	const FormType = validateForm(t)
	const [open, setOpen] = useState(false)
	const { toast } = useToast()
	const form = useForm<z.infer<typeof FormType>>({
		resolver: zodResolver(FormType),
		defaultValues: {
			name: "",
			description: "",
			url: ""
		}
	})

	const [isEditing, startTransition] = useTransition()

	async function handleSubmitAddProduct(data: z.infer<typeof FormType>) {
		const { name, description, url } = data
		const { success, error } = FormType.safeParse({ name, description, url })
		if (!success) {
			form.setError("name", { message: error.message })
			return
		}
		startTransition(async () => {
			const res = await fetch("/api/user/super-admin/product-management", {
				method: "POST",
				body: JSON.stringify(data)
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
				<form onSubmit={form.handleSubmit(handleSubmitAddProduct)}>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("Name")}</FormLabel>
								<FormControl>
									<Input {...field} className="focus-visible:shadow-none focus-visible:ring-0" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("Description")}</FormLabel>
								<FormControl>
									<Input {...field} className="focus-visible:shadow-none focus-visible:ring-0" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="url"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("Url")}</FormLabel>
								<FormControl>
									<Input {...field} className="focus-visible:shadow-none focus-visible:ring-0" />
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

function ProductDeleteDialog({ product, table }: { product: ProductInfo, table: PageTableRef }) {
	const t = useTranslations("Admin-ProductManagement")
	const { toast } = useToast()
	const [isDeleting, startDeleting] = useTransition()
	const [open, setOpen] = useState(false)

	async function handleDeleteProduct(id: string) {
		startDeleting(async () => {
			const res = await fetch(`/api/user/super-admin/product-management?id=${id}`, {
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
						<span className="font-bold text-destructive text-lg text-center">{product.name}</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>{t("Cancel")}</AlertDialogCancel>
					<AlertDialogAction disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/60" onClick={() => handleDeleteProduct(product.id)}>{t("Delete")}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default function Page() {

	const [columns, setColumns] = useState<any[]>([])
	const t = useTranslations("Admin-ProductManagement")
	const [loading, startLoading] = useTransition()

	useEffect(() => {
		setColumns([
			{ key: "name", label: t("Name") },
			{
				key: "url",
				label: t("Url"),
				dataRender: (data: ProductInfo) => (
					<TableCell key={`url-${data.id}`} className="max-w-20">
						<div className="w-full flex justify-start items-center overflow-hidden text-ellipsis whitespace-nowrap">
							{data.url}
						</div>
					</TableCell>
				)
			},
			{
				key: "description",
				label: t("Description"),
				dataRender: (data: ProductInfo) => (
					<TableCell key={`description-${data.id}`} className="max-w-20">
						<div className="w-full flex justify-start items-center overflow-hidden text-ellipsis whitespace-nowrap">
							{data.description}
						</div>
					</TableCell>
				)
			},
			{
				key: "createdAt", label: t("CreatedAt"),
				dataRender: (data: ProductInfo) => (
					<TableCell key={`createdAt-${data.id}`}>
						<span>{moment(data.createdAt).format("YYYY-MM-DD HH:mm")}</span>
					</TableCell>
				)
			},
			{
				key: "action",
				headerRender: () => <TableHead key={"action"} className="text-right">{t("Action")}</TableHead>,
				dataRender: (data: ProductInfo, table: PageTableRef) => (
					<TableCell key={`action-${data.id}`}>
						<div className="flex justify-end items-center gap-2">
							<ProductDeleteDialog product={data} table={table} />
						</div>
					</TableCell>
				)
			}
		])
	}, [])

	const [data, setData] = useState<ProductInfo[]>([])

	useEffect(() => {
		getProducts().then()
	}, [])

	const [start, setStart] = useState(0)
	const [offset, setOffset] = useState(10)
	const [total, setTotal] = useState(0)

	async function getProducts() {
		startLoading(async () => {
			const res = await fetch(`/api/user/super-admin/product-management?start=${start}&offset=${offset}`)
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
				getProducts().then()
			}}>{t("Refresh")}</Button>
			<AddProductDialog onSuccess={getProducts} />

		</div>
		<div className="mt-4 px-5">
			<PageTable columns={columns} loading={loading} defaultPageSize={offset} data={data} totalSize={total} start={start} onPageChange={(pageStart1, offset1) => {
				if (pageStart1 != start || offset1 != offset) {
					setStart(pageStart1)
					setOffset(offset1)
					getProducts().then()
				}
			}} onUpdate={getProducts} />
		</div>
	</div>
}