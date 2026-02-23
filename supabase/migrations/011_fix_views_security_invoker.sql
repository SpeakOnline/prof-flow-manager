-- ============================================
-- Migration: 011_fix_views_security_invoker.sql
-- Description: Corrige vulnerabilidade de segurança em views
-- 
-- Issue: Views estavam usando SECURITY DEFINER implícito,
-- que executa com as permissões do criador da view,
-- ignorando as políticas RLS do usuário consultante.
--
-- Solução: Alterar para SECURITY INVOKER, que respeita
-- as políticas RLS do usuário que faz a consulta.
-- ============================================

-- Drop e recria views com SECURITY INVOKER

-- 1. View: teachers_with_free_hours
DROP VIEW IF EXISTS public.teachers_with_free_hours;

CREATE VIEW public.teachers_with_free_hours
WITH (security_invoker = true)
AS
SELECT 
  t.*,
  COUNT(s.id) FILTER (WHERE s.status = 'livre'::schedule_status) as free_hours_count,
  COUNT(s.id) FILTER (WHERE s.status = 'com_aluno'::schedule_status) as occupied_hours_count
FROM public.teachers t
LEFT JOIN public.schedules s ON s.teacher_id = t.id
GROUP BY t.id;

COMMENT ON VIEW public.teachers_with_free_hours IS 'View de professores com contagem de horários. Usa SECURITY INVOKER para respeitar RLS.';


-- 2. View: active_special_lists
-- NOTA: View removida porque a tabela special_lists não possui as colunas
-- start_date e end_date. Se a view existir no banco, será removida.
DROP VIEW IF EXISTS public.active_special_lists;


-- 3. View: teachers_public
DROP VIEW IF EXISTS public.teachers_public;

CREATE VIEW public.teachers_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  name,
  email,
  phone,
  level,
  has_international_certification,
  academic_background,
  last_schedule_access,
  created_at,
  updated_at
  -- performance NÃO é incluído (acesso restrito)
FROM public.teachers;

COMMENT ON VIEW public.teachers_public IS 'View pública de professores sem campos sensíveis (performance). Usa SECURITY INVOKER para respeitar RLS.';


-- ============================================
-- NOTA SOBRE FUNÇÕES COM SECURITY DEFINER
-- ============================================
-- As funções com SECURITY DEFINER são INTENCIONAIS:
-- - handle_new_user(): Precisa criar profile no signup
-- - handle_lgpd_audit_log(): Precisa gravar logs de auditoria
-- - search_teachers: Precisa acessar dados para pesquisa
--
-- Essas funções são seguras porque:
-- 1. São executadas apenas em contextos específicos (triggers)
-- 2. Têm validação interna
-- 3. São necessárias para operações privilegiadas
-- ============================================
