-- Add video_urls to instructors
ALTER TABLE instructors
  ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Instructor ratings by clients
CREATE TABLE IF NOT EXISTS instructor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(instructor_id, user_id)
);

ALTER TABLE instructor_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can read ratings
CREATE POLICY "ratings_readable_by_all"
ON instructor_ratings FOR SELECT USING (true);

-- Only authenticated users can rate
CREATE POLICY "clients_can_rate"
ON instructor_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own rating
CREATE POLICY "clients_can_update_own_rating"
ON instructor_ratings FOR UPDATE
USING (auth.uid() = user_id);
