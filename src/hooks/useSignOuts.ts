"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SignOut } from "@/types"

export function useSignOuts(classId?: string) {
  const [signOuts, setSignOuts] = useState<SignOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSignOuts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = classId ? `/api/signouts?classId=${classId}` : "/api/signouts"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch sign-outs")
      const data = await res.json()
      setSignOuts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    fetchSignOuts()
  }, [fetchSignOuts])

  const createSignOut = async (params: {
    class_id: string
    student_name: string
    student_id?: string
    destination?: string
  }) => {
    const res = await fetch("/api/signouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Failed to create sign-out")
    }
    await fetchSignOuts()
    return res.json()
  }

  const markReturned = async (id: string) => {
    const res = await fetch(`/api/signouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ return: true }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Failed to mark as returned")
    }
    await fetchSignOuts()
    return res.json()
  }

  const deleteSignOut = async (id: string) => {
    const res = await fetch(`/api/signouts/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Failed to delete sign-out")
    }
    await fetchSignOuts()
  }

  return { signOuts, loading, error, fetchSignOuts, createSignOut, markReturned, deleteSignOut }
}

export function useActiveSignOuts(classId: string | null) {
  const [activeSignOuts, setActiveSignOuts] = useState<SignOut[]>([])
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
    setActiveSignOuts((data as SignOut[]) ?? [])
    setLoading(false)
  }, [classId, supabase])

  useEffect(() => {
    if (classId) {
      fetchActive()
      const channel = supabase
        .channel(`active_signouts:${classId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sign_outs", filter: `class_id=eq.${classId}` },
          () => fetchActive()
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
  }, [classId, fetchActive, supabase])

  const markReturned = async (id: string) => {
    const res = await fetch(`/api/signouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ return: true }),
    })
    if (!res.ok) throw new Error("Failed to mark returned")
    await fetchActive()
  }

  const removeFromLine = async (id: string) => {
    await fetch(`/api/signouts/${id}`, { method: "DELETE" })
    await fetchActive()
  }

  return { activeSignOuts, loading, fetchActive, markReturned, removeFromLine }
}
