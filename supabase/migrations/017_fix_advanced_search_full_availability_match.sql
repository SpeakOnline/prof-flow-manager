-- Migration: Require full day/hour availability match in advanced teacher search
--
-- Problem:
-- The multi-day/multi-hour filter matched teachers with partial availability
-- (e.g., only one or two selected days), because it only checked ANY day/hour.
--
-- Fix:
-- When using p_day_of_week_list and/or p_hour_list, require full coverage of the
-- requested Cartesian product (day x hour). If one list is empty, treat it as a
-- wildcard dimension and require all values from the provided dimension.

CREATE OR REPLACE FUNCTION public.search_teachers_advanced(
  p_day_of_week INT DEFAULT NULL,
  p_hour INT DEFAULT NULL,
  p_day_of_week_list INT[] DEFAULT NULL,
  p_hour_list INT[] DEFAULT NULL,
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
  district TEXT,
  level TEXT,
  has_international_certification BOOLEAN,
  performance TEXT,
  academic_background TEXT,
  free_hours_count BIGINT
) AS $fn$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    t.id,
    t.user_id,
    t.name,
    t.email,
    t.phone,
    t.district,
    t.level::TEXT,
    t.has_international_certification,
    t.performance::TEXT,
    t.academic_background,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status::TEXT = 'livre') AS free_hours_count
  FROM public.teachers t
  LEFT JOIN public.schedules s ON t.id = s.teacher_id
  LEFT JOIN public.teacher_lesson_types tlt ON t.id = tlt.teacher_id
  WHERE
    (
      (p_day_of_week IS NULL OR p_hour IS NULL)
      OR EXISTS (
        SELECT 1
        FROM public.schedules s_single
        WHERE s_single.teacher_id = t.id
          AND s_single.day_of_week = p_day_of_week
          AND s_single.hour = p_hour
          AND s_single.status::TEXT = 'livre'
      )
    )
    AND (
      (
        (p_day_of_week_list IS NULL OR cardinality(p_day_of_week_list) = 0)
        AND (p_hour_list IS NULL OR cardinality(p_hour_list) = 0)
      )
      OR NOT EXISTS (
        SELECT 1
        FROM unnest(COALESCE(NULLIF(p_day_of_week_list, ARRAY[]::INT[]), ARRAY[NULL::INT])) AS d(day_of_week)
        CROSS JOIN unnest(COALESCE(NULLIF(p_hour_list, ARRAY[]::INT[]), ARRAY[NULL::INT])) AS h(hour)
        WHERE NOT EXISTS (
          SELECT 1
          FROM public.schedules s_multi
          WHERE s_multi.teacher_id = t.id
            AND s_multi.status::TEXT = 'livre'
            AND (d.day_of_week IS NULL OR s_multi.day_of_week = d.day_of_week)
            AND (h.hour IS NULL OR s_multi.hour = h.hour)
        )
      )
    )
    AND (p_level IS NULL OR t.level::TEXT = p_level)
    AND (p_has_certification IS NULL OR t.has_international_certification = p_has_certification)
    AND (p_performance IS NULL OR t.performance::TEXT = p_performance)
    AND (p_lesson_type_ids IS NULL OR tlt.lesson_type_id = ANY(p_lesson_type_ids))
    AND (p_academic_background IS NULL OR t.academic_background ILIKE '%' || p_academic_background || '%')
  GROUP BY t.id, t.user_id, t.name, t.email, t.phone, t.district, t.level,
           t.has_international_certification, t.performance, t.academic_background
  ORDER BY free_hours_count DESC, t.name;
END;
$fn$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.search_teachers_advanced(
  INT,
  INT,
  INT[],
  INT[],
  TEXT,
  BOOLEAN,
  TEXT,
  UUID[],
  TEXT
) IS 'Busca avancada de professores exigindo correspondencia completa para filtros de multiplos dias/horarios.';
