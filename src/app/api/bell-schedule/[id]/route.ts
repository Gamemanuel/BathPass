import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// PATCH /api/bell-schedule/[id] — update a period
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("bell_schedule_periods")
      .update(body)
      .eq("id", id)
      .eq("teacher_id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/bell-schedule/[id] — delete a period
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("bell_schedule_periods")
      .delete()
      .eq("id", id)
      .eq("teacher_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
