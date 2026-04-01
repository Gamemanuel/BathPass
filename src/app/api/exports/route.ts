import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Papa from "papaparse"

// GET /api/exports?classId=xxx&startDate=yyyy-mm-dd&endDate=yyyy-mm-dd
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let query = supabase
    .from("sign_outs")
    .select("*, classes(name)")
    .order("time_out", { ascending: false })

  if (classId) {
    query = query.eq("class_id", classId)
  }

  if (startDate) {
    query = query.gte("time_out", startDate)
  }

  if (endDate) {
    // Add 1 day to include the end date fully
    const end = new Date(endDate)
    end.setDate(end.getDate() + 1)
    query = query.lt("time_out", end.toISOString())
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const csvData = (data ?? []).map((row) => ({
    "Class": (row.classes as { name: string } | null)?.name ?? "",
    "Student Name": row.student_name,
    "Student ID": row.student_id ?? "",
    "Destination": row.destination ?? "",
    "Time Out": row.time_out ? new Date(row.time_out).toLocaleString() : "",
    "Time In": row.time_in ? new Date(row.time_in).toLocaleString() : "Not returned",
    "Duration": row.total_time_spent ?? "",
  }))

  const csv = Papa.unparse(csvData)

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="bathpass-export.csv"`,
    },
  })
}
