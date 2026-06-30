-- ============================================
-- STAFF ACCESS — políticas RLS para que el personal
-- (admin/owner/instructor/recepción) pueda ver y
-- gestionar datos de TODO su negocio, no solo los propios.
--
-- Sin esto, el admin de Clases/Reservas no puede
-- crear/editar/cancelar nada (RLS lo bloquea por defecto)
-- y Recepción solo vería sus propias reservas, no las de
-- las alumnas.
--
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

CREATE OR REPLACE FUNCTION is_staff(p_business_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE user_id = auth.uid()
      AND business_id = p_business_id
      AND role IN ('super_admin', 'owner', 'admin', 'instructor', 'reception')
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Classes / Sessions / catálogo: staff gestiona todo
CREATE POLICY "Staff manage classes" ON classes
  FOR ALL USING (is_staff(business_id)) WITH CHECK (is_staff(business_id));

CREATE POLICY "Staff manage sessions" ON class_sessions
  FOR ALL USING (is_staff(business_id)) WITH CHECK (is_staff(business_id));

CREATE POLICY "Staff manage disciplines" ON disciplines
  FOR ALL USING (is_staff(business_id)) WITH CHECK (is_staff(business_id));

CREATE POLICY "Staff manage class_levels" ON class_levels
  FOR ALL USING (is_staff(business_id)) WITH CHECK (is_staff(business_id));

CREATE POLICY "Staff manage instructors" ON instructors
  FOR ALL USING (is_staff(business_id)) WITH CHECK (is_staff(business_id));

CREATE POLICY "Staff manage packages" ON packages
  FOR ALL USING (is_staff(business_id)) WITH CHECK (is_staff(business_id));

-- Bookings: staff ve y gestiona las reservas de TODAS las alumnas
CREATE POLICY "Staff manage bookings" ON bookings
  FOR ALL USING (is_staff(business_id)) WITH CHECK (is_staff(business_id));

-- Payments: staff ve los pagos del negocio
CREATE POLICY "Staff view payments" ON payments
  FOR SELECT USING (is_staff(business_id));

-- Subscriptions: staff ve y gestiona membresías de clientes
CREATE POLICY "Staff manage subscriptions" ON subscriptions
  FOR ALL USING (is_staff(business_id)) WITH CHECK (is_staff(business_id));

-- Profiles: staff puede ver el perfil de cualquier cliente que comparta negocio
CREATE POLICY "Staff view client profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships m1
      JOIN memberships m2 ON m1.business_id = m2.business_id
      WHERE m1.user_id = auth.uid()
        AND m2.user_id = profiles.id
        AND m1.role IN ('super_admin', 'owner', 'admin', 'instructor', 'reception')
        AND m1.is_active = true
    )
  );

-- Memberships: staff ve y administra los miembros de su negocio
CREATE POLICY "Staff view business memberships" ON memberships
  FOR SELECT USING (is_staff(business_id));

CREATE POLICY "Staff update business memberships" ON memberships
  FOR UPDATE USING (is_staff(business_id));

-- Businesses: staff puede editar la config de su propio negocio
CREATE POLICY "Staff update own business" ON businesses
  FOR UPDATE USING (is_staff(id));
