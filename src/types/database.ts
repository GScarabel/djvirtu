export interface Album {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  album_id: string | null;
  title: string | null;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  storage_path: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  storage_path: string | null;
  video_type: 'upload' | 'youtube' | 'vimeo';
  external_id: string | null;
  duration_seconds: number | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  cover_image_url: string | null;
  ticket_url: string | null;
  ticket_price: number | null;
  is_featured: boolean;
  is_published: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  type: 'text' | 'image' | 'json' | 'boolean';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  event_type: string | null;
  event_date: string | null;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      albums: {
        Row: Album;
        Insert: Omit<Album, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Album, 'id' | 'created_at' | 'updated_at'>>;
      };
      photos: {
        Row: Photo;
        Insert: Omit<Photo, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Photo, 'id' | 'created_at' | 'updated_at'>>;
      };
      videos: {
        Row: Video;
        Insert: Omit<Video, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Video, 'id' | 'created_at' | 'updated_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Omit<SiteSetting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SiteSetting, 'id' | 'created_at' | 'updated_at'>>;
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: Omit<ContactMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<ContactMessage, 'id' | 'created_at'>>;
      };
    };
  };
}
