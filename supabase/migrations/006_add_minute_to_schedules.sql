-- Migration: Add minute column to schedules
-- Permite horários quebrados (08:15, 08:30, etc.)

-- Adiciona coluna de minuto (0-59)
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS minute INTEGER DEFAULT 0;

-- Constraint para validar valores de minuto (0-59)
ALTER TABLE schedules ADD CONSTRAINT valid_minute 
  CHECK (minute >= 0 AND minute <= 59);

-- Índice composto para buscas por horário
CREATE INDEX IF NOT EXISTS idx_schedules_hour_minute ON schedules(hour, minute);

-- Atualiza constraint de unicidade para incluir minuto
-- Primeiro remove a constraint antiga se existir
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_teacher_day_hour_unique;

-- Cria nova constraint única incluindo minuto
ALTER TABLE schedules ADD CONSTRAINT schedules_teacher_day_hour_minute_unique 
  UNIQUE (teacher_id, day_of_week, hour, minute);
