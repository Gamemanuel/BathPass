import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/bell-schedule — list teacher's bell periods
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("bell_schedule_periods")
      .select("*")
      .eq("teacher_id", user.id)
      .order("order_index", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/bell-schedule — create a bell period
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, start_time, end_time, order_index } = body

    if (!name || !start_time || !end_time) {
      return NextResponse.json(
        { error: "name, start_time, and end_time are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("bell_schedule_periods")
      .insert({ teacher_id: user.id, name, start_time, end_time, order_index: order_index ?? 0 })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
