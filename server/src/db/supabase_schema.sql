-- ====================================================================
-- RATHINAM HR - SMART RECRUITMENT SYSTEM (SUPABASE POSTGRESQL SCHEMA)
-- Copy and paste this script into Supabase SQL Editor to create tables.
-- ====================================================================

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(20) NOT NULL,
    subtitle TEXT,
    description TEXT,
    icon VARCHAR(50),
    badge_color VARCHAR(50),
    accent_color VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. USERS & HR ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'HR_ADMIN',
    organization_id VARCHAR(50) REFERENCES public.organizations(id) ON DELETE SET NULL,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. APPLICATIONS TABLE (CORE CANDIDATE DATA)
CREATE TABLE IF NOT EXISTS public.applications (
    id VARCHAR(50) PRIMARY KEY,
    application_id VARCHAR(50) UNIQUE NOT NULL,
    organization_id VARCHAR(50) NOT NULL DEFAULT 'RGU',
    position_applied TEXT NOT NULL,
    source TEXT DEFAULT 'Career Portal',
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    personal_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    contact_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    financial_details JSONB DEFAULT '{}'::jsonb,
    education_details JSONB DEFAULT '[]'::jsonb,
    experience_details JSONB DEFAULT '[]'::jsonb,
    certifications TEXT DEFAULT '',
    languages_known JSONB DEFAULT '[]'::jsonb,
    family_details JSONB DEFAULT '[]'::jsonb,
    additional_info JSONB DEFAULT '{}'::jsonb,
    "references" JSONB DEFAULT '[]'::jsonb,
    referred_friends JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    declaration_accepted BOOLEAN DEFAULT FALSE,
    declaration_date TEXT,
    declaration_place TEXT DEFAULT 'Coimbatore',
    submission_date TEXT,
    submission_time TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 4. STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.status_history (
    id VARCHAR(50) PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL,
    from_status VARCHAR(50) NOT NULL,
    to_status VARCHAR(50) NOT NULL,
    updated_by TEXT NOT NULL,
    remarks TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. INTERNAL HR NOTES TABLE
CREATE TABLE IF NOT EXISTS public.hr_notes (
    id VARCHAR(50) PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    "user" TEXT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. PDF FIELD MAPPINGS TABLE
CREATE TABLE IF NOT EXISTS public.pdf_field_mappings (
    id SERIAL PRIMARY KEY,
    pdf_field TEXT NOT NULL,
    web_form_field TEXT NOT NULL,
    category VARCHAR(100),
    pdf_ref TEXT
);

-- CREATE INDICES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_applications_org ON public.applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_code ON public.applications(application_id);
CREATE INDEX IF NOT EXISTS idx_status_history_app ON public.status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_hr_notes_app ON public.hr_notes(application_id);

-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow public access users" ON public.users;
DROP POLICY IF EXISTS "Allow public access applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public access status_history" ON public.status_history;
DROP POLICY IF EXISTS "Allow public access hr_notes" ON public.hr_notes;
DROP POLICY IF EXISTS "Allow public access audit_logs" ON public.audit_logs;

CREATE POLICY "Allow public access organizations" ON public.organizations FOR ALL USING (true);
CREATE POLICY "Allow public access users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow public access applications" ON public.applications FOR ALL USING (true);
CREATE POLICY "Allow public access status_history" ON public.status_history FOR ALL USING (true);
CREATE POLICY "Allow public access hr_notes" ON public.hr_notes FOR ALL USING (true);
CREATE POLICY "Allow public access audit_logs" ON public.audit_logs FOR ALL USING (true);
