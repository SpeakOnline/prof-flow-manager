-- Migration: Add new list types to special_lists
-- Add 'restricted' and 'best' to the list_type check constraint

-- First, drop the existing check constraint
ALTER TABLE special_lists DROP CONSTRAINT IF EXISTS special_lists_list_type_check;

-- Recreate with the new values included
ALTER TABLE special_lists ADD CONSTRAINT special_lists_list_type_check 
  CHECK (list_type IN ('ferias', 'licenca_medica', 'afastamento', 'outro', 'restricted', 'best'));
