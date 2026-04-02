-- Add custom destinations list to classes
ALTER TABLE classes ADD COLUMN IF NOT EXISTS destinations TEXT[] DEFAULT '{}';

-- =====================
-- BELL SCHEDULE PERIODS
-- =====================
-- Each teacher sets their own bell schedule (named periods with start/end times).
-- The TV page uses this to determine the active period and display the CLO.
CREATE TABLE IF NOT EXISTS bell_schedule_periods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bell_schedule_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own bell schedule" ON bell_schedule_periods
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Anyone can read bell schedule periods" ON bell_schedule_periods
  FOR SELECT USING (true);
