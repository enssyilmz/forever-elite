-- Create storage bucket for package images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('package-image', 'package-image', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view (SELECT) files in package-image bucket
CREATE POLICY "Anyone can view package images" ON storage.objects
    FOR SELECT USING (bucket_id = 'package-image');

-- Policy to allow authenticated users to upload (INSERT) files to package-image bucket
CREATE POLICY "Authenticated users can upload package images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'package-image' AND auth.role() = 'authenticated');

-- Policy to allow authenticated users to update files in package-image bucket
CREATE POLICY "Authenticated users can update package images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'package-image' AND auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete files in package-image bucket
CREATE POLICY "Authenticated users can delete package images" ON storage.objects
    FOR DELETE USING (bucket_id = 'package-image' AND auth.role() = 'authenticated');
