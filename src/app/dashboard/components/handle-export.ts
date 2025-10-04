import {BathroomPass} from "@/app/dashboard/components/table-schema";
import {Row} from "@tanstack/react-table";
import Papa from "papaparse"

// .CSV Export Handler
export const handleExport = (rows: Row<BathroomPass>[], fileName: string) => {
    const dataToExport = rows.map((row) => row.original)
    const csv = Papa.unparse(dataToExport)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${fileName}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
