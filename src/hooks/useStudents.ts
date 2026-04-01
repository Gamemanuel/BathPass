"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Student } from "@/types"

export function useStudents(classId: string | null) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    if (!classId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/students?classId=${classId}`)
      if (!res.ok) throw new Error("Failed to fetch students")
      const data = await res.json()
      setStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const uploadStudents = async (rows: { ID: string; Name: string }[]) => {
    if (!classId) throw new Error("No class selected")
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, students: rows }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Failed to upload students")
    }
    await fetchStudents()
    return res.json()
  }

  // Find a student by name or ID input
  const findStudent = (input: string) => {
    const lower = input.toLowerCase().trim()
    return students.find(
      (s) =>
        s.student_id.toLowerCase() === lower ||
        s.name.toLowerCase() === lower ||
        s.name.toLowerCase().includes(lower)
    )
  }

  return { students, loading, error, fetchStudents, uploadStudents, findStudent }
}

export function useActiveStudents(classId: string | null) {
  const [activeStudents, setActiveStudents] = useState<{
    id: string
    student_name: string
    destination?: string
    time_out: string
    class_id: string
  }[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const fetchActive = useCallback(async () => {
    if (!classId) return
    setLoading(true)
    const { data } = await supabase
      .from("sign_outs")
      .select("*")
      .eq("class_id", classId)
      .is("time_in", null)
      .order("time_out", { ascending: true })
    setActiveStudents(data ?? [])
    setLoading(false)
  }, [classId, supabase])

  useEffect(() => {
    if (classId) {
      fetchActive()
      // Real-time subscription
      const channel = supabase
        .channel(`sign_outs:${classId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sign_outs", filter: `class_id=eq.${classId}` },
          () => fetchActive()
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [classId, fetchActive, supabase])

  return { activeStudents, loading, fetchActive }
}
