"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Class } from "@/types"

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/classes")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `Request failed with status ${res.status}`)
      }
      const data = await res.json()
      setClasses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const createClass = async (name: string, description?: string) => {
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Failed to create class")
    }
    await fetchClasses()
    return res.json()
  }

  const updateClass = async (id: string, updates: Partial<Class>) => {
    const res = await fetch(`/api/classes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Failed to update class")
    }
    await fetchClasses()
    return res.json()
  }

  const deleteClass = async (id: string) => {
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Failed to delete class")
    }
    await fetchClasses()
  }

  return { classes, loading, error, fetchClasses, createClass, updateClass, deleteClass }
}

export function useTvModeSettings(classId: string) {
  const [settings, setSettings] = useState<{
    background_images: string[]
    cycle_background: boolean
    selected_background?: string
    font_family: string
    text_color: string
    show_time_out: boolean
    show_students: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const { data } = await supabaseRef.current
      .from("tv_mode_settings")
      .select("*")
      .eq("class_id", classId)
      .single()
    setSettings(data)
    setLoading(false)
  }, [classId])

  useEffect(() => {
    if (classId) fetchSettings()
  }, [classId, fetchSettings])

  const updateSettings = async (updates: Partial<typeof settings>) => {
    const { error } = await supabaseRef.current
      .from("tv_mode_settings")
      .upsert({ class_id: classId, ...settings, ...updates, updated_at: new Date().toISOString() })
    if (error) throw new Error(error.message)
    await fetchSettings()
  }

  return { settings, loading, updateSettings, fetchSettings }
}
