-- Valoraciones por clase específica (una por usuario por sesión)
CREATE TABLE IF NOT EXISTS class_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id)
);

ALTER TABLE class_ratings ENABLE ROW LEVEL SECURITY;

-- Usuario puede insertar/actualizar su propia valoración
CREATE POLICY "users_manage_own_ratings"
ON class_ratings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Cualquiera puede leer valoraciones (para mostrar promedio)
CREATE POLICY "public_read_ratings"
ON class_ratings FOR SELECT
USING (true);
