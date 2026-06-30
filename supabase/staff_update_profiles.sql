-- Allow staff to update profiles of clients in their business
CREATE POLICY "staff_can_update_profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.user_id = profiles.id
      AND m.business_id IN (
        SELECT business_id FROM memberships
        WHERE user_id = auth.uid()
          AND role IN ('super_admin', 'owner', 'admin', 'instructor', 'reception')
          AND is_active = true
      )
  )
);
