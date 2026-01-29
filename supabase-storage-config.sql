-- Supabase Storage Configuration Script

-- Enable RLS (Row Level Security) for storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for storage
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO authenticated, anon
USING (bucket_id = 'photos' OR bucket_id = 'videos' OR bucket_id = 'covers');

CREATE POLICY "Allow authenticated insert access" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'photos' OR bucket_id = 'videos' OR bucket_id = 'covers');

CREATE POLICY "Allow authenticated update access" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'photos' OR bucket_id = 'videos' OR bucket_id = 'covers');

CREATE POLICY "Allow authenticated delete access" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'photos' OR bucket_id = 'videos' OR bucket_id = 'covers');

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('photos', 'photos', true, false, 10485760, '{image/png,image/jpeg,image/jpg,image/webp,image/gif}'),
  ('videos', 'videos', true, false, 104857600, '{video/mp4,video/webm,video/avi,video/mov,video/quicktime}'),
  ('covers', 'covers', true, false, 10485760, '{image/png,image/jpeg,image/jpg,image/webp,image/gif}')
ON CONFLICT (id) DO NOTHING;

-- Grant privileges
GRANT ALL PRIVILEGES ON TABLE storage.objects TO postgres;
GRANT USAGE ON SCHEMA storage TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO postgres;
