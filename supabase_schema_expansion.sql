-- ===========================================================================
-- PHASE 3: RECORDS, DOCTOR ACCESS, AND CHAT HISTORY
-- ===========================================================================

-- 1. Create doctor_patient_access table
CREATE TABLE public.doctor_patient_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'revoked')) DEFAULT 'pending' NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(doctor_id, patient_id)
);

-- Enable RLS on doctor_patient_access
ALTER TABLE public.doctor_patient_access ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can manage access for their own records
CREATE POLICY "Patients can view and manage their own access grants"
  ON public.doctor_patient_access
  FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Policy: Doctors can view access granted to them
CREATE POLICY "Doctors can view access granted to them"
  ON public.doctor_patient_access
  FOR SELECT
  USING (auth.uid() = doctor_id);


-- 2. Create records table
CREATE TABLE public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  raw_text TEXT,
  ai_extracted_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on records
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- Policy: Patients have full CRUD on their own records
CREATE POLICY "Patients have full access to their own records"
  ON public.records
  FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Policy: Doctors can view records of patients who granted them active access
CREATE POLICY "Doctors can view records of patients with active access"
  ON public.records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_patient_access
      WHERE doctor_patient_access.doctor_id = auth.uid()
        AND doctor_patient_access.patient_id = records.patient_id
        AND doctor_patient_access.status = 'active'
        AND (doctor_patient_access.expires_at IS NULL OR doctor_patient_access.expires_at > now())
    )
  );


-- 3. Create chat_history table
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on chat_history
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Policy: Patients have full CRUD on their own chat history
CREATE POLICY "Patients have full access to their own chat history"
  ON public.chat_history
  FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);


-- ===========================================================================
-- STORAGE SETUP
-- ===========================================================================

-- Create storage bucket for medical records (private bucket)
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-records', 'medical-records', false);

-- Enable RLS on storage objects
-- Note: Supabase storage.objects has RLS enabled by default.

-- Policy: Users can upload files to a folder matching their own user id
CREATE POLICY "Users can upload their own medical records"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'medical-records' 
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Policy: Users can read files from a folder matching their own user id
CREATE POLICY "Users can view their own medical records"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'medical-records' 
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );
