"use client"

import { Table, TableBody, TableCell, TableCaption, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination"
import { useEffect, useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Skeleton } from "./ui/skeleton"
import { BsBox2 } from "react-icons/bs"

type Column = {
  key: string
  label?: string,
  dataRender?: (data: any, table: PageTableRef) => React.ReactNode,
  headerRender?: (table: PageTableRef) => React.ReactNode
}
type Props = {
  className?: string
  columns: Column[]
  totalSize: number
  defaultPageSize: number
  data: any[]
  caption?: string
  loading?: boolean
  start?: number
  onUpdate?: () => void
  footerRender?: (table: PageTableRef) => React.ReactNode
  onPageChange?: (pageStart: number, offset: number) => void
}

function TableLoading({ length }: { length: number }) {
  return (
    <TableRow>
      <TableCell colSpan={length} className="h-20 bg-gray-100 animate-pulse rounded-md">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[125px] w-full rounded-xl " />
        </div>
      </TableCell>
    </TableRow>
  )
}

function TableEmpty({ length }: { length: number }) {
  return <TableRow>
    <TableCell colSpan={length} className="h-20">
      <div className="flex justify-center items-center text-center text-sm text-gray-500">
        <BsBox2 size={100} className="text-primary/30" />
      </div>
    </TableCell>
  </TableRow>
}

export type PageTableRef = {
  update: () => void
}

const PageTable = ({ className, columns, totalSize, defaultPageSize = 10, data, caption, loading, footerRender, onPageChange, onUpdate, start = 0 }: Props) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const maxPage = Math.ceil(totalSize / Math.max(pageSize, 1))

  useEffect(() => {
    const curr = Math.max(Math.ceil(start / pageSize), 1)
    if (curr != currentPage) {
      setCurrentPage(curr)
    }
  }, [start])

  const update = () => {
    onUpdate && onUpdate()
  }

  const self = useMemo(() => ({
    update
  }), [update])

  useEffect(() => {
    onPageChange?.((currentPage - 1) * pageSize, pageSize)
  }, [currentPage, pageSize])

  return <div className={cn("flex flex-col gap-4", className)}>
    <Table>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            column.headerRender ? column.headerRender(self) : <TableHead key={column.key}>{column.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? <TableLoading length={columns.length} /> : (
          data.length > 0 ? data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                column.dataRender ? column.dataRender(item, self) : <TableCell key={column.key}>{item[column.key] as string}</TableCell>
              ))}
            </TableRow>
          )) : <TableEmpty length={columns.length} />
        )}
      </TableBody>
      {footerRender && <TableFooter>{footerRender(self)}</TableFooter>}
    </Table>
    <div className="flex justify-end">
      <div className="flex items-center gap-2">
        {
          data.length > 0 && (
            <>

              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                <SelectTrigger className="w-30">
                  <SelectValue placeholder="Page Size" className="text-sm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>

              <Pagination className="flex justify-end items-center">
                <PaginationContent>
                  {currentPage > 1 && currentPage < maxPage && (
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={() => setCurrentPage(currentPage - 1)} />
                    </PaginationItem>
                  )}
                  {
                    currentPage > 3 && currentPage < maxPage && (
                      <PaginationItem>
                        <PaginationLink href="#" onClick={() => setCurrentPage(currentPage - 2)}>{currentPage - 2}</PaginationLink>
                      </PaginationItem>
                    )
                  }
                  {
                    currentPage > 1 && currentPage < maxPage && (
                      <PaginationItem>
                        <PaginationLink href="#" onClick={() => setCurrentPage(currentPage - 1)}>{currentPage - 1}</PaginationLink>
                      </PaginationItem>
                    )
                  }
                  <PaginationItem>
                    <PaginationLink href="#" isActive>{currentPage}</PaginationLink>
                  </PaginationItem>
                  {
                    (currentPage < maxPage - 3 || currentPage > 3) && currentPage < maxPage - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  {
                    currentPage < maxPage - 1 && (
                      <PaginationItem>
                        <PaginationLink href="#" onClick={() => setCurrentPage(maxPage - 1)}>{maxPage - 1}</PaginationLink>
                      </PaginationItem>
                    )
                  }
                  {
                    currentPage < maxPage && (
                      <PaginationItem>
                        <PaginationLink href="#" onClick={() => setCurrentPage(maxPage)}>{maxPage}</PaginationLink>
                      </PaginationItem>
                    )
                  }
                  {
                    currentPage < maxPage && (
                      <PaginationItem>
                        <PaginationNext href="#" onClick={() => setCurrentPage(currentPage + 1)} />
                      </PaginationItem>
                    )
                  }
                </PaginationContent>
              </Pagination>
            </>
          )
        }

      </div>
    </div>
  </div>
}

export default PageTable