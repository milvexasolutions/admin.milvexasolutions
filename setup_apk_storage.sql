-- ===============================================================
-- 📦 MILVEXA: SETUP APK STORAGE BUCKET
-- ===============================================================
-- Run this script in your Supabase SQL Editor to create the 
-- storage bucket that will host the uploaded Android APK files.

-- 1. Create the 'apks' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('apks', 'apks', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow PUBLIC READ access so mobile users can download the APK
CREATE POLICY "Public Read Access for APKs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'apks');

-- 3. Allow PUBLIC INSERT access (since we are doing custom auth in the Admin panel, 
-- we will allow public uploads, but it will be hidden inside the admin panel)
-- Alternatively, if Supabase Auth was used, we'd use (auth.role() = 'authenticated')
CREATE POLICY "Admin Upload Access for APKs" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'apks');

-- 4. Allow UPDATE/DELETE for replacing old APKs
CREATE POLICY "Admin Update Access for APKs" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'apks');

CREATE POLICY "Admin Delete Access for APKs" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'apks');
