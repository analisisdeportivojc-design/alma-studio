-- ============================================
-- ALMA STUDIO - Schema Multi-tenant con Roles
-- ============================================

-- BUSINESSES (cada studio/negocio es un tenant)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- alma-studio, yoga-zen, etc.
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3d3d3d',
  secondary_color TEXT DEFAULT '#b8956a',
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'PE',
  whatsapp TEXT,
  instagram TEXT,
  tiktok TEXT,
  website_domain TEXT, -- almastudio.com.pe
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PROFILES (extiende auth.users con datos del sistema)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ROLES del sistema
CREATE TYPE user_role AS ENUM (
  'super_admin',  -- Juan: controla todo
  'owner',        -- Dueño del studio
  'admin',        -- Administrador del studio
  'instructor',   -- Instructora
  'reception',    -- Recepción
  'client'        -- Cliente/Alumno
);

-- MEMBERSHIPS (vincula usuario + negocio + rol)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- DISCIPLINES (Barré, Mat, Reformer, etc.)
CREATE TABLE disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- CLASS LEVELS (Foundation, Flow, Strength)
CREATE TABLE class_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  sort_order INT DEFAULT 0
);

-- INSTRUCTORS (datos extra de instructores)
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  bio TEXT,
  specialties TEXT[],
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, business_id)
);

-- CLASSES (clases programadas)
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  discipline_id UUID REFERENCES disciplines(id),
  level_id UUID REFERENCES class_levels(id),
  instructor_id UUID REFERENCES instructors(id),
  name TEXT NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Lunes
  start_time TIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 50,
  max_capacity INT NOT NULL DEFAULT 6,
  is_active BOOLEAN DEFAULT true
);

-- CLASS SESSIONS (instancias de una clase en una fecha específica)
CREATE TABLE class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, session_date)
);

-- PACKAGES (paquetes de clases)
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PEN',
  total_classes INT NOT NULL,
  duration_days INT NOT NULL, -- vigencia en días
  freeze_days INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- CLIENT SUBSCRIPTIONS (compras de paquetes)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  package_id UUID NOT NULL REFERENCES packages(id),
  classes_remaining INT NOT NULL,
  classes_used INT DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  freeze_days_remaining INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'expired', 'cancelled')),
  payment_id TEXT, -- referencia al pago
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BOOKINGS (reservas de clases)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  session_id UUID NOT NULL REFERENCES class_sessions(id),
  subscription_id UUID REFERENCES subscriptions(id),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show', 'waitlist')),
  booked_at TIMESTAMPTZ DEFAULT now(),
  checked_in_at TIMESTAMPTZ,
  UNIQUE(user_id, session_id)
);

-- PAYMENTS (registro de pagos)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PEN',
  payment_method TEXT, -- 'culqi', 'stripe', 'cash', 'transfer'
  external_id TEXT, -- ID de Culqi/Stripe
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_business ON memberships(business_id);
CREATE INDEX idx_classes_business ON classes(business_id);
CREATE INDEX idx_sessions_business_date ON class_sessions(business_id, session_date);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_session ON bookings(session_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_payments_business ON payments(business_id);

-- ============================================
-- ROW LEVEL SECURITY (cada negocio solo ve sus datos)
-- ============================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Businesses: public read for active businesses
CREATE POLICY "Public can view active businesses"
  ON businesses FOR SELECT
  USING (is_active = true);

-- Memberships: users see their own memberships
CREATE POLICY "Users see own memberships"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);

-- Disciplines: public read per business
CREATE POLICY "Public can view disciplines"
  ON disciplines FOR SELECT
  USING (is_active = true);

-- Class levels: public read
CREATE POLICY "Public can view class levels"
  ON class_levels FOR SELECT
  USING (true);

-- Instructors: public read active instructors
CREATE POLICY "Public can view active instructors"
  ON instructors FOR SELECT
  USING (is_active = true);

-- Classes: public read active classes
CREATE POLICY "Public can view active classes"
  ON classes FOR SELECT
  USING (is_active = true);

-- Class sessions: public read
CREATE POLICY "Public can view sessions"
  ON class_sessions FOR SELECT
  USING (true);

-- Packages: public read active packages
CREATE POLICY "Public can view active packages"
  ON packages FOR SELECT
  USING (is_active = true);

-- Subscriptions: users see their own
CREATE POLICY "Users see own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Bookings: users see their own
CREATE POLICY "Users see own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Payments: users see their own
CREATE POLICY "Users see own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
