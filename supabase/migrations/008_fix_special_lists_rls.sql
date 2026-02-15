-- Migration: Fix special_lists RLS policies for INSERT operations
-- The USING clause doesn't work for INSERT because the row doesn't exist yet
-- We need to use WITH CHECK for INSERT operations

-- Drop existing policies
DROP POLICY IF EXISTS "Teachers can manage own lists" ON special_lists;
DROP POLICY IF EXISTS "Admins can manage all lists" ON special_lists;
DROP POLICY IF EXISTS "Anyone can view lists" ON special_lists;

-- Admins can SELECT all lists
CREATE POLICY "Admins can select all lists"
  ON special_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can INSERT into lists (WITH CHECK is required for INSERT)
CREATE POLICY "Admins can insert lists"
  ON special_lists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can UPDATE all lists
CREATE POLICY "Admins can update lists"
  ON special_lists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can DELETE from lists
CREATE POLICY "Admins can delete lists"
  ON special_lists FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Teachers can SELECT their own list entries
CREATE POLICY "Teachers can select own lists"
  ON special_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = special_lists.teacher_id
      AND teachers.user_id = auth.uid()
    )
  );

-- Teachers can INSERT entries for themselves
CREATE POLICY "Teachers can insert own lists"
  ON special_lists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = teacher_id
      AND teachers.user_id = auth.uid()
    )
  );

-- Teachers can UPDATE their own list entries
CREATE POLICY "Teachers can update own lists"
  ON special_lists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = special_lists.teacher_id
      AND teachers.user_id = auth.uid()
    )
  );

-- Teachers can DELETE their own list entries
CREATE POLICY "Teachers can delete own lists"
  ON special_lists FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = special_lists.teacher_id
      AND teachers.user_id = auth.uid()
    )
  );
