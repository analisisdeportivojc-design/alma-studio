-- Phase A: Enrich client profiles with business intelligence fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS referral_source TEXT CHECK (referral_source IN ('instagram', 'referido', 'google', 'walk_in', 'tiktok', 'otro')),
  ADD COLUMN IF NOT EXISTS referred_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS objective TEXT CHECK (objective IN ('bienestar', 'perdida_peso', 'rehabilitacion', 'deporte', 'otro')),
  ADD COLUMN IF NOT EXISTS medical_notes TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS preferred_contact TEXT CHECK (preferred_contact IN ('whatsapp', 'email', 'ninguno')) DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
