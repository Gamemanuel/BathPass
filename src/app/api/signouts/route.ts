import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/signouts?classId=xxx&active=true
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId")
  const active = searchParams.get("active") === "true"

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let query = supabase
    .from("sign_outs")
    .select("*")
    .order("time_out", { ascending: false })

  if (classId) {
    query = query.eq("class_id", classId)
  }

  if (active) {
    query = query.is("time_in", null)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/signouts - Create a new sign-out
export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { class_id, student_name, student_id, destination } = body

  if (!class_id || !student_name) {
    return NextResponse.json({ error: "class_id and student_name are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("sign_outs")
    .insert({
      class_id,
      student_name,
      student_id,
      destination,
      time_out: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
