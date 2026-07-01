-- Sesiones concretas por fecha con instructora asignada
-- Relaciona una clase template con una fecha específica y su instructora

CREATE TABLE IF NOT EXISTS class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, date)
);

ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;

-- Staff puede leer y escribir sesiones
CREATE POLICY "staff_manage_sessions"
ON class_sessions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.user_id = auth.uid()
      AND m.business_id = class_sessions.business_id
      AND m.role IN ('owner', 'admin', 'super_admin')
  )
);

-- Clientes pueden leer sesiones
CREATE POLICY "clients_read_sessions"
ON class_sessions FOR SELECT
USING (true);
