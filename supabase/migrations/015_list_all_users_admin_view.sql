-- Migration: Admin list all users (admins and teachers)

CREATE OR REPLACE FUNCTION public.list_all_users()
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  email TEXT,
  role public.user_role,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem listar usuarios';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id,
    COALESCE(t.name, au.raw_user_meta_data->>'name', 'Sem nome') AS name,
    COALESCE(t.email, au.email, '') AS email,
    p.role,
    au.created_at
  FROM public.profiles p
  INNER JOIN auth.users au ON au.id = p.user_id
  LEFT JOIN public.teachers t ON t.user_id = p.user_id
  ORDER BY p.role DESC, name;
END;
$$;

REVOKE ALL ON FUNCTION public.list_all_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_all_users() TO authenticated;

COMMENT ON FUNCTION public.list_all_users() IS
  'Retorna lista de todos os usuarios (admin e professor) para visualizacao administrativa.';
