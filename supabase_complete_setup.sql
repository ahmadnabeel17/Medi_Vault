-- ===========================================================================
-- PHASE 1: CORE PROFILES
-- ===========================================================================

-- Create the profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('patient', 'doctor')) NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ===========================================================================
-- PHASE 2: DOCTOR AI VERIFICATION
-- ===========================================================================

-- Create the doctor_verifications table
CREATE TABLE public.doctor_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  degree TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  registration_council TEXT NOT NULL,
  certificate_file_url TEXT NOT NULL,
  verification_status TEXT CHECK (verification_status IN ('pending', 'ai_verified', 'ai_flagged', 'manually_verified', 'rejected')) DEFAULT 'pending' NOT NULL,
  ai_verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on doctor_verifications
ALTER TABLE public.doctor_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Doctor can insert their own verification
CREATE POLICY "Doctors can insert their own verification"
  ON public.doctor_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- Policy: Doctor can view their own verification
CREATE POLICY "Doctors can view their own verification"
  ON public.doctor_verifications
  FOR SELECT
  USING (auth.uid() = doctor_id);

-- Create storage bucket for doctor certificates (private bucket)
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-certificates', 'doctor-certificates', false);

-- Enable RLS on storage objects
-- Note: Supabase storage.objects has RLS enabled by default.

-- Policy: Authenticated users can upload to the bucket
CREATE POLICY "Users can upload certificates"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'doctor-certificates' AND auth.role() = 'authenticated' );

-- Policy: Users can view their own uploaded certificates
CREATE POLICY "Users can view their own certificates"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'doctor-certificates' AND auth.uid() = owner );
