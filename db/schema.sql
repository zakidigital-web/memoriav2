CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NULL,
  history TEXT NULL,
  vision TEXT NULL,
  mission TEXT NULL,
  facilities TEXT NULL,
  favicon_url TEXT NULL,
  tagline TEXT NULL,
  contact_email TEXT NULL,
  contact_phone TEXT NULL,
  contact_address TEXT NULL,
  default_theme TEXT NOT NULL DEFAULT 'light' CHECK (default_theme IN ('light', 'dark')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  photo_url TEXT NULL,
  category TEXT NOT NULL CHECK (category IN ('Pimpinan', 'Guru Kelas', 'Staf TU')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teachers_category ON teachers (category);
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers (name);

CREATE TABLE IF NOT EXISTS alumni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ttl TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  photo_url TEXT NULL,
  graduation_year INT NOT NULL,
  class_name TEXT NOT NULL,
  instagram TEXT NULL,
  twitter TEXT NULL,
  linkedin TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alumni_year_class ON alumni (graduation_year, class_name);
CREATE INDEX IF NOT EXISTS idx_alumni_name ON alumni (name);

CREATE TABLE IF NOT EXISTS yearbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  title TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  cover_image_url TEXT NULL,
  background_music_url TEXT NULL,
  total_students INT NOT NULL DEFAULT 0,
  total_classes INT NOT NULL DEFAULT 0,
  page_count INT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_yearbooks_year UNIQUE (year)
);

CREATE INDEX IF NOT EXISTS idx_yearbooks_year ON yearbooks (year DESC);
CREATE INDEX IF NOT EXISTS idx_yearbooks_title ON yearbooks (title);

CREATE TABLE IF NOT EXISTS yearbook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  yearbook_id UUID NOT NULL REFERENCES yearbooks(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_yearbook_pages UNIQUE (yearbook_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_yearbook_pages_yearbook_page ON yearbook_pages (yearbook_id, page_number);

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admins ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS favicon_url TEXT NULL;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS tagline TEXT NULL;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS contact_email TEXT NULL;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS contact_phone TEXT NULL;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS contact_address TEXT NULL;

CREATE TABLE IF NOT EXISTS visitor_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  duration INT NOT NULL DEFAULT 0,
  source TEXT NULL,
  device TEXT NULL,
  browser TEXT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_visitor_stats_visited_at ON visitor_stats (visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_stats_session ON visitor_stats (session_id);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(user_id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  details JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS database_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(user_id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_database_backups_created_at ON database_backups (created_at DESC);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_mode TEXT NOT NULL DEFAULT 'system' CHECK (theme_mode IN ('system','light','dark')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences_select_own"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SEED: Create Default Admin Credential
-- Username: admin
-- Password: admin123
DO $$
DECLARE
  default_user_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE username = 'admin') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', default_user_id, 'authenticated', 'authenticated', 'admin@admin.memoria.local', crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
    );
    
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      default_user_id::text, default_user_id, format('{"sub":"%s","email":"%s"}', default_user_id::text, 'admin@admin.memoria.local')::jsonb, 'email', now(), now(), now()
    );

    INSERT INTO admins (user_id, username) VALUES (default_user_id, 'admin');
  END IF;
END $$;
