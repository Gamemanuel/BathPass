-- BathPass Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- TEACHERS (profiles)
-- =====================
CREATE TABLE IF NOT EXISTS teachers (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own profile" ON teachers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can insert own profile" ON teachers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can update own profile" ON teachers
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create teacher profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.teachers (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- CLASSES
-- =====================
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tv_mode_enabled BOOLEAN DEFAULT FALSE,
  line_mode_enabled BOOLEAN DEFAULT FALSE,
  class_list_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own classes" ON classes
  FOR ALL USING (auth.uid() = teacher_id);

-- =====================
-- STUDENTS
-- =====================
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage students in own classes" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = students.class_id AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read students for sign-out" ON students
  FOR SELECT USING (true);

-- =====================
-- SIGN OUTS
-- =====================
CREATE TABLE IF NOT EXISTS sign_outs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id TEXT,
  student_name TEXT NOT NULL,
  destination TEXT,
  time_out TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  time_in TIMESTAMPTZ,
  total_time_spent INTERVAL GENERATED ALWAYS AS (time_in - time_out) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sign_outs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage sign_outs for own classes" ON sign_outs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = sign_outs.class_id AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert sign_outs" ON sign_outs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update sign_outs (for return)" ON sign_outs
  FOR UPDATE USING (true);

-- =====================
-- SCHEDULES
-- =====================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  clo_time TIME,
  repeat_type TEXT CHECK (repeat_type IN ('none', 'daily', 'weekly', 'custom')) DEFAULT 'none',
  repeat_days INTEGER[],
  start_date DATE NOT NULL,
  end_date DATE,
  is_override BOOLEAN DEFAULT FALSE,
  override_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage schedules for own classes" ON schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = schedules.class_id AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read schedules" ON schedules
  FOR SELECT USING (true);

-- =====================
-- TV MODE SETTINGS
-- =====================
CREATE TABLE IF NOT EXISTS tv_mode_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  background_images TEXT[] DEFAULT '{}',
  cycle_background BOOLEAN DEFAULT TRUE,
  selected_background TEXT,
  font_family TEXT DEFAULT 'Inter',
  text_color TEXT DEFAULT '#FFFFFF',
  show_time_out BOOLEAN DEFAULT TRUE,
  show_students BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tv_mode_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage tv settings for own classes" ON tv_mode_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = tv_mode_settings.class_id AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read tv_mode_settings" ON tv_mode_settings
  FOR SELECT USING (true);

-- =====================
-- HELPER VIEWS
-- =====================

-- View for active sign-outs (not yet returned)
CREATE OR REPLACE VIEW active_sign_outs AS
SELECT
  so.*,
  c.name AS class_name,
  EXTRACT(EPOCH FROM (NOW() - so.time_out)) / 60 AS minutes_out
FROM sign_outs so
JOIN classes c ON c.id = so.class_id
WHERE so.time_in IS NULL;

-- View for sign-outs with formatted duration
CREATE OR REPLACE VIEW sign_outs_with_duration AS
SELECT
  so.*,
  c.name AS class_name,
  CASE
    WHEN so.time_in IS NOT NULL THEN
      TO_CHAR(so.time_in - so.time_out, 'MI "min"')
    ELSE
      TO_CHAR(NOW() - so.time_out, 'MI "min" (ongoing)')
  END AS duration_display
FROM sign_outs so
JOIN classes c ON c.id = so.class_id;
