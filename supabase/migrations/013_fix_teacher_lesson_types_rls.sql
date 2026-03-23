-- Migration: Fix teacher_lesson_types RLS for teacher self-management
-- Context: During admin-created teacher signup flows, session can briefly switch
-- to the newly created teacher user. This policy ensures the teacher can only
-- manage lesson type relations tied to their own teacher record.

DROP POLICY IF EXISTS "Teachers can insert own teacher lesson types" ON public.teacher_lesson_types;
DROP POLICY IF EXISTS "Teachers can delete own teacher lesson types" ON public.teacher_lesson_types;

CREATE POLICY "Teachers can insert own teacher lesson types"
  ON public.teacher_lesson_types
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.teachers
      WHERE teachers.id = teacher_id
        AND teachers.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete own teacher lesson types"
  ON public.teacher_lesson_types
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.teachers
      WHERE teachers.id = public.teacher_lesson_types.teacher_id
        AND teachers.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Teachers can insert own teacher lesson types" ON public.teacher_lesson_types IS
  'Permite que professor insira tipos de aula apenas do proprio cadastro.';

COMMENT ON POLICY "Teachers can delete own teacher lesson types" ON public.teacher_lesson_types IS
  'Permite que professor remova tipos de aula apenas do proprio cadastro.';