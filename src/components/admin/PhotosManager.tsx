import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../../lib/supabase';

// Create a separate client for storage operations using service role key
const supabaseStorage = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
);

// Use the default client for database operations
import { supabase } from '../../lib/supabase';
import type { Photo, Album } from '../../types/database';
import toast from 'react-hot-toast';

export function PhotosManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const [photosRes, albumsRes] = await Promise.all([
        supabase.from('photos').select('*').order('created_at', { ascending: false }),
        supabase.from('albums').select('*').order('title', { ascending: true }),
      ]);

      if (photosRes.data) setPhotos(photosRes.data);
      if (albumsRes.data) setAlbums(albumsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar fotos');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!isSupabaseConfigured()) {
        toast.error('Configure o Supabase primeiro');
        return;
      }

      setUploading(true);
      let successCount = 0;

      for (const file of acceptedFiles) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `photos/${fileName}`;

          const { error: uploadError } = await supabaseStorage.storage
            .from('photos')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabaseStorage.storage
            .from('photos')
            .getPublicUrl(filePath);

          const { error: dbError } = await supabase.from('photos').insert({
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: urlData.publicUrl,
            storage_path: filePath,
            size_bytes: file.size,
            album_id: selectedAlbum || null,
            is_published: true,
            display_order: 0,
          });

          if (dbError) throw dbError;
          successCount++;
        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error(`Erro ao fazer upload de ${file.name}`);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} foto(s) enviada(s) com sucesso`);
        fetchData();
      }

      setUploading(false);
    },
    [selectedAlbum]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
  });

  const handleDelete = async (photo: Photo) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return;

    try {
      if (photo.storage_path) {
        await supabase.storage.from('photos').remove([photo.storage_path]);
      }

      const { error } = await supabase.from('photos').delete().eq('id', photo.id);
      if (error) throw error;

      toast.success('Foto excluída com sucesso');
      fetchData();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Erro ao excluir foto');
    }
  };

  const togglePublished = async (photo: Photo) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_published: !photo.is_published })
        .eq('id', photo.id);

      if (error) throw error;
      toast.success(photo.is_published ? 'Foto ocultada' : 'Foto publicada');
      fetchData();
    } catch (error) {
      console.error('Error toggling photo:', error);
      toast.error('Erro ao atualizar foto');
    }
  };

  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (!confirm(`Excluir ${selectedPhotos.length} foto(s)?`)) return;

    try {
      const photosToDelete = photos.filter((p) => selectedPhotos.includes(p.id));
      const paths = photosToDelete
        .map((p) => p.storage_path)
        .filter(Boolean) as string[];

      if (paths.length > 0) {
        await supabase.storage.from('photos').remove(paths);
      }

      const { error } = await supabase
        .from('photos')
        .delete()
        .in('id', selectedPhotos);

      if (error) throw error;

      toast.success(`${selectedPhotos.length} foto(s) excluída(s)`);
      setSelectedPhotos([]);
      fetchData();
    } catch (error) {
      console.error('Error deleting photos:', error);
      toast.error('Erro ao excluir fotos');
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="alert alert-warning">
        Configure o Supabase para gerenciar fotos.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
          >
            <option value="" className="bg-[#0a0a1a]">Sem álbum</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id} className="bg-[#0a0a1a]">
                {album.title}
              </option>
            ))}
          </select>
        </div>

        {selectedPhotos.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={deleteSelected}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir ({selectedPhotos.length})
          </motion.button>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-600 hover:border-purple-500/50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white">Enviando fotos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-gray-500" />
            <p className="text-gray-400">
              {isDragActive
                ? 'Solte as imagens aqui'
                : 'Arraste imagens ou clique para selecionar'}
            </p>
            <p className="text-sm text-gray-500">
              Suporta: JPG, PNG, GIF, WebP
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Nenhuma foto enviada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative group aspect-square rounded-xl overflow-hidden ${
                selectedPhotos.includes(photo.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              <img
                src={photo.url}
                alt={photo.title || 'Photo'}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => toggleSelectPhoto(photo.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedPhotos.includes(photo.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => togglePublished(photo)}
                  className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
                >
                  {photo.is_published ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(photo)}
                  className="w-8 h-8 rounded-full bg-white/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {!photo.is_published && (
                <div className="absolute top-2 left-2">
                  <span className="badge badge-warning badge-sm">Oculto</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
