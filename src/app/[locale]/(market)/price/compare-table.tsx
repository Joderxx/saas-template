import { getTranslations } from "next-intl/server"
import { Table, TableCaption, TableHeader, TableBody, TableFooter, TableRow, TableCell, TableHead } from "@/components/ui/table"

export default async function CompareTable() {
  const t = await getTranslations("Price")

  const tableData = {
    detail: [
      "Code",
      "Analysis",
      "HighPriority",
      "Support",
      "DataExport",
      "ApiAccess",
      "RoleControl"
    ],
    free: [
      "Code"
    ],
    pro: [
      "Code",
      "Analysis",
      "HighPriority",
      "Support",
    ],
    business: [
      "Code",
      "Analysis",
      "HighPriority",
      "Support",
      "DataExport",
      "ApiAccess",
      "RoleControl"
    ]
  }

  return (
    <div className="container">
      {/* @ts-ignore */}
      <Table className="border-collapse text-md">
        <TableCaption>{t("TableCaption")}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-64"></TableHead>
            <TableHead className="w-48 text-center border-l">{t("Free")}</TableHead>
            <TableHead className="w-48 text-center border-l">{t("Pro")}</TableHead>
            <TableHead className="w-48 text-center border-l">{t("Business")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.detail.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{t(item)}</TableCell>
              <TableCell className="text-center border-l">{tableData.free.includes(item) ? "✅" : "❌"}</TableCell>
              <TableCell className="text-center border-l">{tableData.pro.includes(item) ? "✅" : "❌"}</TableCell>
              <TableCell className="text-center border-l">{tableData.business.includes(item) ? "✅" : "❌"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}