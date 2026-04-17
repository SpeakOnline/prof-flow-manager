-- Migration: Fix search_teachers_advanced – resolve PGRST203 and improve range coverage
--
-- PROBLEMA 1 (PGRST203):
--   A migration 010 criou search_teachers_advanced com 7 parâmetros.
--   A migration 012 criou uma versão com 9 parâmetros (assinatura diferente).
--   O PostgreSQL manteve AMBAS as funções como overloads distintos.
--   O PostgREST não consegue disambiguar qual usar → erro PGRST203.
--
-- PROBLEMA 2 (cobertura de range):
--   A busca usava p_hour_list (array de horas inteiras) e checava
--   s.hour = ANY(p_hour_list). Isso fazia uma agenda de 17:00-17:30
--   aparecer numa busca por 17:00-18:00, pois ambas têm hour = 17.
--   O correto é verificar se o bloco livre COBRE o range solicitado.
--
-- SOLUÇÃO:
--   1. Remover as duas versões antigas.
--   2. Criar UMA versão nova que usa p_time_range_starts/p_time_range_ends
--      (arrays de minutos desde meia-noite) e verifica contenção:
--      s_start <= range_start AND s_end >= range_end.

-- 1. Remove a versão de 7 parâmetros (migration 010)
DROP FUNCTION IF EXISTS public.search_teachers_advanced(
  INT, INT, TEXT, BOOLEAN, TEXT, UUID[], TEXT
);

-- 2. Remove a versão de 9 parâmetros (migration 012)
DROP FUNCTION IF EXISTS public.search_teachers_advanced(
  INT, INT, INT[], INT[], TEXT, BOOLEAN, TEXT, UUID[], TEXT
);

-- 3. Cria a nova versão com busca por range de horário (em minutos desde meia-noite)
CREATE FUNCTION public.search_teachers_advanced(
  p_day_of_week          INT       DEFAULT NULL,
  p_hour                 INT       DEFAULT NULL,
  p_day_of_week_list     INT[]     DEFAULT NULL,
  p_time_range_starts    INT[]     DEFAULT NULL,
  p_time_range_ends      INT[]     DEFAULT NULL,
  p_level                TEXT      DEFAULT NULL,
  p_has_certification    BOOLEAN   DEFAULT NULL,
  p_performance          TEXT      DEFAULT NULL,
  p_lesson_type_ids      UUID[]    DEFAULT NULL,
  p_academic_background  TEXT      DEFAULT NULL
)
RETURNS TABLE (
  id                          UUID,
  user_id                     UUID,
  name                        TEXT,
  email                       TEXT,
  phone                       TEXT,
  district                    TEXT,
  level                       TEXT,
  has_international_certification BOOLEAN,
  performance                 TEXT,
  academic_background         TEXT,
  free_hours_count            BIGINT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
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
    -- ── Filtro legado por dia + hora únicos ──────────────────────────────────
    (
      (p_day_of_week IS NULL OR p_hour IS NULL)
      OR (
        s.day_of_week = p_day_of_week
        AND s.hour     = p_hour
        AND s.status::TEXT = 'livre'
      )
    )

    -- ── Filtro por lista de dias da semana ───────────────────────────────────
    AND (
      p_day_of_week_list IS NULL
      OR cardinality(p_day_of_week_list) = 0
      OR s.day_of_week = ANY(p_day_of_week_list)
    )

    -- ── Filtro por ranges de horário (contenção total do range) ─────────────
    -- O bloco livre do professor deve COBRIR integralmente o range pedido:
    --   início do bloco ≤ início do range  E  fim do bloco ≥ fim do range
    AND (
      p_time_range_starts IS NULL
      OR cardinality(p_time_range_starts) = 0
      OR EXISTS (
        SELECT 1
        FROM unnest(p_time_range_starts, p_time_range_ends) AS r(rstart, rend)
        WHERE
          (s.hour * 60 + COALESCE(s.minute, 0))         <= r.rstart
          AND (s.end_hour * 60 + COALESCE(s.end_minute, 0)) >= r.rend
      )
    )

    -- ── Se listas de disponibilidade foram informadas, exige status livre ────
    AND (
      (
        (p_day_of_week_list IS NULL OR cardinality(p_day_of_week_list) = 0)
        AND (p_time_range_starts IS NULL OR cardinality(p_time_range_starts) = 0)
      )
      OR s.status::TEXT = 'livre'
    )

    -- ── Filtros de características do professor ──────────────────────────────
    AND (p_level               IS NULL OR t.level::TEXT                    = p_level)
    AND (p_has_certification   IS NULL OR t.has_international_certification = p_has_certification)
    AND (p_performance         IS NULL OR t.performance::TEXT               = p_performance)
    AND (p_lesson_type_ids     IS NULL OR tlt.lesson_type_id                = ANY(p_lesson_type_ids))
    AND (p_academic_background IS NULL OR t.academic_background ILIKE '%' || p_academic_background || '%')

  GROUP BY
    t.id, t.user_id, t.name, t.email, t.phone, t.district, t.level,
    t.has_international_certification, t.performance, t.academic_background
  ORDER BY free_hours_count DESC, t.name;
END;
$$;

COMMENT ON FUNCTION public.search_teachers_advanced(
  INT, INT, INT[], INT[], INT[], TEXT, BOOLEAN, TEXT, UUID[], TEXT
) IS
  'Busca avançada de professores. p_time_range_starts/ends são arrays de minutos '
  'desde meia-noite; um professor só é retornado se tiver pelo menos um bloco livre '
  'que cubra integralmente o range solicitado.';
