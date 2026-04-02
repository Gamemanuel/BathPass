// Database types matching the Supabase schema

export interface Teacher {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Class {
  id: string
  teacher_id: string
  name: string
  description?: string
  tv_mode_enabled: boolean
  line_mode_enabled: boolean
  class_list_enabled: boolean
  destinations?: string[]
  created_at: string
  updated_at: string
}

export interface BellPeriod {
  id: string
  teacher_id: string
  name: string
  start_time: string // "HH:MM:SS"
  end_time: string   // "HH:MM:SS"
  order_index: number
  created_at: string
}

export interface Student {
  id: string
  class_id: string
  student_id: string
  name: string
  created_at: string
}

export interface SignOut {
  id: string
  class_id: string
  student_id?: string
  student_name: string
  destination?: string
  time_out: string
  time_in?: string
  total_time_spent?: string
  created_at: string
}

export interface Schedule {
  id: string
  class_id: string
  name: string
  clo_time?: string
  repeat_type: "none" | "daily" | "weekly" | "custom"
  repeat_days?: number[]
  start_date: string
  end_date?: string
  is_override: boolean
  override_date?: string
  created_at: string
  updated_at: string
}

export interface TvModeSettings {
  id: string
  class_id: string
  background_images: string[]
  cycle_background: boolean
  selected_background?: string
  font_family: string
  text_color: string
  show_time_out: boolean
  show_students: boolean
  created_at: string
  updated_at: string
}

// Form types
export interface CreateClassForm {
  name: string
  description?: string
}

export interface SignOutForm {
  student_input: string
  destination?: string
  class_id: string
}

export interface CreateScheduleForm {
  name: string
  clo_time?: string
  repeat_type: "none" | "daily" | "weekly" | "custom"
  repeat_days?: number[]
  start_date: string
  end_date?: string
  is_override: boolean
  override_date?: string
}

// CSV row for class list upload
export interface StudentCSVRow {
  ID: string
  Name: string
}
