-- Allow authenticated users to insert their own teacher profile.
-- The on_auth_user_created trigger handles this for new sign-ups, but users
-- who existed before the migration ran have no row in teachers. This policy
-- lets the API upsert the profile on-demand when those users first create a class.

CREATE POLICY "Teachers can insert own profile" ON teachers
  FOR INSERT WITH CHECK (auth.uid() = id);
