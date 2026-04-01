import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/schedules?classId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId")

  const supabase = await createClient()

  let query = supabase
    .from("schedules")
    .select("*")
    .order("start_date", { ascending: true })

  if (classId) {
    query = query.eq("class_id", classId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/schedules
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { class_id, name, clo_time, repeat_type, repeat_days, start_date, end_date, is_override, override_date } = body

  if (!class_id || !name || !start_date) {
    return NextResponse.json({ error: "class_id, name, and start_date are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("schedules")
    .insert({
      class_id,
      name,
      clo_time,
      repeat_type: repeat_type ?? "none",
      repeat_days,
      start_date,
      end_date,
      is_override: is_override ?? false,
      override_date,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
