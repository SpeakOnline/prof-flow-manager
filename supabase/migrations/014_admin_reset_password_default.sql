-- Migration: Allow admin to reset user password to default without email flow

CREATE OR REPLACE FUNCTION public.admin_reset_user_password_to_default(
  p_user_email TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_target_user_id UUID;
BEGIN
  -- Apenas admin pode resetar senha de outros usuarios
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem resetar senhas';
  END IF;

  SELECT id
  INTO v_target_user_id
  FROM auth.users
  WHERE email = p_user_email
  LIMIT 1;

  IF v_target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario nao encontrado para o e-mail informado';
  END IF;

  UPDATE auth.users
  SET
    encrypted_password = extensions.crypt('123456', extensions.gen_salt('bf')),
    updated_at = NOW()
  WHERE id = v_target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reset_user_password_to_default(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_reset_user_password_to_default(TEXT) TO authenticated;

COMMENT ON FUNCTION public.admin_reset_user_password_to_default(TEXT) IS
  'Permite que admin resete senha para o padrao 123456 sem envio de e-mail.';
