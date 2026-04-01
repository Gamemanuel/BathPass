import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/students?classId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId)
      .order("name", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/students - Upload a batch of students (CSV)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { classId, students } = body

    if (!classId || !students || !Array.isArray(students)) {
      return NextResponse.json({ error: "classId and students array are required" }, { status: 400 })
    }

    // Verify teacher owns the class
    const { data: cls, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", classId)
      .eq("teacher_id", user.id)
      .single()

    if (classError || !cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 })
    }

    // Delete existing students for this class then re-insert
    await supabase.from("students").delete().eq("class_id", classId)

    const rows = students.map((s: { ID: string; Name: string }) => ({
      class_id: classId,
      student_id: String(s.ID),
      name: String(s.Name),
    }))

    const { data, error } = await supabase
      .from("students")
      .insert(rows)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enable class_list_enabled on the class
    await supabase
      .from("classes")
      .update({ class_list_enabled: true, updated_at: new Date().toISOString() })
      .eq("id", classId)

    return NextResponse.json({ inserted: data?.length ?? 0 }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
