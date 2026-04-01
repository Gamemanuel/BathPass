import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// PATCH /api/signouts/[id] - Mark student as returned
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  const updateData: Record<string, string | null> = {}

  if (body.return) {
    updateData.time_in = new Date().toISOString()
  } else if (body.time_in !== undefined) {
    updateData.time_in = body.time_in
  }

  const { data, error } = await supabase
    .from("sign_outs")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/signouts/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await supabase
    .from("sign_outs")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
