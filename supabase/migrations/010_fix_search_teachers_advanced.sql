-- Migration: Fix search_teachers_advanced function
-- Corrige a busca avançada de professores para comparar corretamente
-- o enum schedule_status com valores de texto
--
-- PROBLEMA: A comparação de enum com string literal pode não funcionar
-- corretamente em todos os contextos PL/pgSQL.
--
-- SOLUÇÃO: Usar cast explícito ::TEXT para garantir a comparação correta.
--
-- PARA DEBUGAR: Execute as queries abaixo para verificar os dados:
--
-- 1. Verificar schedules para domingo às 8h:
--    SELECT t.name, s.day_of_week, s.hour, s.minute, s.status::TEXT 
--    FROM schedules s 
--    JOIN teachers t ON t.id = s.teacher_id 
--    WHERE s.day_of_week = 0 AND s.hour = 8;
--
-- 2. Verificar todos os schedules com status 'livre':
--    SELECT t.name, s.day_of_week, s.hour, s.minute, s.status::TEXT 
--    FROM schedules s 
--    JOIN teachers t ON t.id = s.teacher_id 
--    WHERE s.status::TEXT = 'livre'
--    ORDER BY s.day_of_week, s.hour;

-- Recria a função com comparação de enum corrigida
CREATE OR REPLACE FUNCTION public.search_teachers_advanced(
  p_day_of_week INT DEFAULT NULL,
  p_hour INT DEFAULT NULL,
  p_level TEXT DEFAULT NULL,
  p_has_certification BOOLEAN DEFAULT NULL,
  p_performance TEXT DEFAULT NULL,
  p_lesson_type_ids UUID[] DEFAULT NULL,
  p_academic_background TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  level TEXT,
  has_international_certification BOOLEAN,
  performance TEXT,
  academic_background TEXT,
  free_hours_count BIGINT
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
    t.performance::TEXT,
    t.academic_background,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status::TEXT = 'livre') AS free_hours_count
  FROM public.teachers t
  LEFT JOIN public.schedules s ON t.id = s.teacher_id
  LEFT JOIN public.teacher_lesson_types tlt ON t.id = tlt.teacher_id
  WHERE
    -- Filtro por horário disponível
    -- Quando ambos dia e hora são informados, busca schedules específicos com status livre
    (
      p_day_of_week IS NULL 
      OR p_hour IS NULL 
      OR (
        s.day_of_week = p_day_of_week 
        AND s.hour = p_hour 
        AND s.status::TEXT = 'livre'
      )
    )
    -- Filtro por nível
    AND (p_level IS NULL OR t.level::TEXT = p_level)
    -- Filtro por certificação
    AND (p_has_certification IS NULL OR t.has_international_certification = p_has_certification)
    -- Filtro por desempenho (apenas admin pode filtrar)
    AND (p_performance IS NULL OR t.performance::TEXT = p_performance)
    -- Filtro por tipo de aula
    AND (p_lesson_type_ids IS NULL OR tlt.lesson_type_id = ANY(p_lesson_type_ids))
    -- Filtro por formação acadêmica (busca textual)
    AND (p_academic_background IS NULL OR t.academic_background ILIKE '%' || p_academic_background || '%')
  GROUP BY t.id, t.user_id, t.name, t.email, t.phone, t.level, 
           t.has_international_certification, t.performance, t.academic_background
  ORDER BY free_hours_count DESC, t.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Também corrige a função search_available_teachers para consistência
CREATE OR REPLACE FUNCTION public.search_available_teachers(
  p_day_of_week INTEGER,
  p_hour INTEGER,
  p_level TEXT DEFAULT NULL,
  p_has_certification BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  level TEXT,
  has_international_certification BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT t.*
  FROM public.teachers t
  WHERE EXISTS (
    SELECT 1 FROM public.schedules s
    WHERE s.teacher_id = t.id
      AND s.day_of_week = p_day_of_week
      AND s.hour = p_hour
      AND s.status::TEXT = 'livre'
  )
  AND (p_level IS NULL OR t.level::TEXT = p_level)
  AND (p_has_certification IS NULL OR t.has_international_certification = p_has_certification)
  ORDER BY t.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Adiciona comentários explicativos
COMMENT ON FUNCTION public.search_teachers_advanced IS 'Busca avançada de professores com múltiplos filtros. Usa cast explícito para comparação de enum schedule_status.';
COMMENT ON FUNCTION public.search_available_teachers IS 'Busca professores disponíveis em um horário específico. Usa cast explícito para comparação de enum schedule_status.';
