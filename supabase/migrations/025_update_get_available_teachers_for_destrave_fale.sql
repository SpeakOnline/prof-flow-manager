-- Migration: Update get_available_teachers to filter by Destrave & Fale program
-- Modifica a função get_available_teachers para retornar apenas professores
-- que estão na lista 'destrave_fale' e não estão na lista 'restricted'

CREATE OR REPLACE FUNCTION public.get_available_teachers()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  level TEXT,
  has_international_certification BOOLEAN,
  academic_background TEXT,
  district TEXT,
  available_schedules_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    t.id,
    t.user_id,
    t.name,
    t.email,
    t.phone,
    t.level::TEXT,
    t.has_international_certification,
    t.academic_background,
    t.district,
    COUNT(s.id) AS available_schedules_count
  FROM public.teachers t
  INNER JOIN public.schedules s ON t.id = s.teacher_id
  -- Filtrar apenas professores no programa Destrave & Fale
  INNER JOIN public.special_lists sl_df ON t.id = sl_df.teacher_id AND sl_df.list_type = 'destrave_fale'
  -- Excluir professores na lista de restrição
  LEFT JOIN public.special_lists sl_restr ON t.id = sl_restr.teacher_id AND sl_restr.list_type = 'restricted'
  WHERE s.status = 'livre'
    AND sl_restr.id IS NULL
  GROUP BY t.id, t.user_id, t.name, t.email, t.phone, t.level, 
           t.has_international_certification, t.academic_background, t.district
  ORDER BY available_schedules_count DESC, t.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.get_available_teachers IS 'Retorna professores do programa Destrave & Fale com horários disponíveis, excluindo os restritos';
