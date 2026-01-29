-- =====================================================
-- DJ Website - Supabase Database Schema
-- Execute this SQL in your Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Albums table for organizing photos
CREATE TABLE IF NOT EXISTS albums (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    storage_path TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    size_bytes BIGINT,
    is_published BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    storage_path TEXT,
    video_type VARCHAR(50) DEFAULT 'upload', -- 'upload', 'youtube', 'vimeo'
    external_id VARCHAR(255), -- For YouTube/Vimeo IDs
    duration_seconds INTEGER,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table for calendar
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Brasil',
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    cover_image_url TEXT,
    ticket_url TEXT,
    ticket_price DECIMAL(10, 2),
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'json', 'boolean'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    event_type VARCHAR(100),
    event_date DATE,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_published ON photos(is_published);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_albums_published ON albums(is_published);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read);

-- =====================================================
-- STORAGE BUCKETS (run these separately or use dashboard)
-- =====================================================

-- Note: Storage buckets should be created via Supabase Dashboard or CLI
-- Go to Storage > Create new bucket
-- Create the following buckets:
-- 1. 'photos' - Public bucket for photo uploads
-- 2. 'videos' - Public bucket for video uploads
-- 3. 'covers' - Public bucket for cover images

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can view published albums" ON albums
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view published photos" ON photos
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view published videos" ON videos
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view published events" ON events
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view site settings" ON site_settings
    FOR SELECT USING (true);

-- Public can insert contact messages
CREATE POLICY "Public can send contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Authenticated users (admin) full access
CREATE POLICY "Admin full access albums" ON albums
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access photos" ON photos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access videos" ON videos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access events" ON events
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access site settings" ON site_settings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access contact messages" ON contact_messages
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE ON albums
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default site settings
INSERT INTO site_settings (key, value, type, description) VALUES
    ('site_name', 'DJ Name', 'text', 'Nome do DJ/Site'),
    ('site_tagline', 'Feel the Beat', 'text', 'Slogan do site'),
    ('hero_title', 'DJ NAME', 'text', 'Título principal do hero'),
    ('hero_subtitle', 'Transformando noites em experiências inesquecíveis', 'text', 'Subtítulo do hero'),
    ('about_text', 'Com mais de 10 anos de experiência, trago energia e paixão para cada evento.', 'text', 'Texto sobre o DJ'),
    ('contact_email', 'contato@djname.com', 'text', 'Email de contato'),
    ('contact_phone', '+55 11 99999-9999', 'text', 'Telefone de contato'),
    ('instagram_url', 'https://instagram.com/djname', 'text', 'URL do Instagram'),
    ('youtube_url', 'https://youtube.com/@djname', 'text', 'URL do YouTube'),
    ('spotify_url', 'https://open.spotify.com/artist/djname', 'text', 'URL do Spotify'),
    ('soundcloud_url', 'https://soundcloud.com/djname', 'text', 'URL do SoundCloud'),
    ('hero_video_url', '', 'text', 'URL do vídeo de background do hero'),
    ('hero_image_url', '', 'text', 'URL da imagem de background do hero')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES (execute after creating buckets)
-- =====================================================

-- After creating storage buckets in the dashboard, execute these policies:

/*
-- Photos bucket policies
CREATE POLICY "Public read access for photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Videos bucket policies
CREATE POLICY "Public read access for videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Covers bucket policies
CREATE POLICY "Public read access for covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'covers' AND auth.role() = 'authenticated');
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================
