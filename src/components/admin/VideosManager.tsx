import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@supabase/supabase-js';
import {
  Plus,
  Pencil,
  Trash2,
  Video as VideoIcon,
  Eye,
  EyeOff,
  Star,
  Save,
  X,
  Upload,
  Youtube,
  Link,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import type { Video } from '../../types/database';
import toast from 'react-hot-toast';

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

type VideoType = 'upload' | 'youtube' | 'vimeo';

interface FormData {
  title: string;
  description: string;
  video_type: VideoType;
  external_id: string;
  url: string;
  thumbnail_url: string;
  cover_image_url: string;
  is_featured: boolean;
  is_published: boolean;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  video_type: 'youtube',
  external_id: '',
  url: '',
  thumbnail_url: '',
  cover_image_url: '',
  is_featured: false,
  is_published: true,
};

export function VideosManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [uploading, setUploading] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url: string, type: VideoType): string => {
    if (type === 'youtube') {
      const match = url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      return match ? match[1] : '';
    }
    if (type === 'vimeo') {
      const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      return match ? match[1] : '';
    }
    return '';
  };

  const getThumbnailUrl = (type: VideoType, externalId: string): string => {
    if (type === 'youtube' && externalId) {
      return `https://img.youtube.com/vi/${externalId}/maxresdefault.jpg`;
    }
    return '';
  };

  const handleUrlChange = (url: string) => {
    setFormData((prev) => {
      const externalId = extractVideoId(url, prev.video_type);
      return { ...prev, url, external_id: externalId };
    });
  };

  const handleTypeChange = (type: VideoType) => {
    setFormData((prev) => {
      const externalId =
        type !== 'upload' ? extractVideoId(prev.url, type) : '';
      return { ...prev, video_type: type, external_id: externalId };
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabaseStorage.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseStorage.storage
        .from('videos')
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        video_type: 'upload',
        url: urlData.publicUrl,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));

      toast.success('Vídeo enviado com sucesso');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Erro ao enviar vídeo');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.avi'],
    },
    maxFiles: 1,
  });

  // Cover image dropzone
  const onDropCover = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter menos de 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to storage
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `covers/${fileName}`;

        const { error: uploadError } = await supabaseStorage.storage
          .from('covers')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseStorage.storage
          .from('covers')
          .getPublicUrl(filePath);

        setFormData({ ...formData, cover_image_url: urlData.publicUrl });
        toast.success('Imagem de capa atualizada');
      } catch (error) {
        console.error('Error uploading cover image:', error);
        toast.error('Erro ao fazer upload da imagem de capa');
      }
    },
    [formData]
  );

  const { getRootProps: getRootPropsCover, getInputProps: getInputPropsCover, isDragActive: isDragActiveCover } = useDropzone({
    onDrop: onDropCover,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    if (formData.video_type !== 'upload' && !formData.external_id) {
      toast.error('URL do vídeo inválida');
      return;
    }

    try {
      const videoData = {
        title: formData.title,
        description: formData.description,
        video_type: formData.video_type,
        external_id: formData.external_id || null,
        url: formData.url,
        thumbnail_url: formData.cover_image_url ||
          (formData.video_type !== 'upload'
            ? getThumbnailUrl(formData.video_type, formData.external_id)
            : null),
        is_featured: formData.is_featured,
        is_published: formData.is_published,
      };

      if (editingVideo) {
        const { error } = await supabase
          .from('videos')
          .update(videoData)
          .eq('id', editingVideo.id);

        if (error) throw error;
        toast.success('Vídeo atualizado com sucesso');
      } else {
        const { error } = await supabase.from('videos').insert(videoData);

        if (error) throw error;
        toast.success('Vídeo adicionado com sucesso');
      }

      setShowModal(false);
      setEditingVideo(null);
      setFormData(initialFormData);
      fetchVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Erro ao salvar vídeo');
    }
  };

  const handleDelete = async (video: Video) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    try {
      if (video.storage_path) {
        await supabase.storage.from('videos').remove([video.storage_path]);
      }

      const { error } = await supabase.from('videos').delete().eq('id', video.id);
      if (error) throw error;

      toast.success('Vídeo excluído com sucesso');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Erro ao excluir vídeo');
    }
  };

  const togglePublished = async (video: Video) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_published: !video.is_published })
        .eq('id', video.id);

      if (error) throw error;
      toast.success(video.is_published ? 'Vídeo ocultado' : 'Vídeo publicado');
      fetchVideos();
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Erro ao atualizar vídeo');
    }
  };

  const toggleFeatured = async (video: Video) => {
    try {
      if (!video.is_featured) {
        await supabase.from('videos').update({ is_featured: false }).neq('id', video.id);
      }

      const { error } = await supabase
        .from('videos')
        .update({ is_featured: !video.is_featured })
        .eq('id', video.id);

      if (error) throw error;
      toast.success(video.is_featured ? 'Destaque removido' : 'Vídeo destacado');
      fetchVideos();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Erro ao atualizar vídeo');
    }
  };

  const openEditModal = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      video_type: video.video_type,
      external_id: video.external_id || '',
      url: video.url,
      thumbnail_url: video.thumbnail_url || '',
      cover_image_url: video.thumbnail_url || '', // Use the same as thumbnail initially
      is_featured: video.is_featured,
      is_published: video.is_published,
    });

    // Set cover image preview if available
    if (video.thumbnail_url) {
      setCoverImagePreview(video.thumbnail_url);
    }

    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingVideo(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-4 rounded-lg">
        Configure o Supabase para gerenciar vídeos.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-400">Gerencie seus vídeos e performances</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openNewModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Vídeo
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <VideoIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Nenhum vídeo adicionado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden"
            >
              <div className="aspect-video relative">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                    <VideoIcon className="w-12 h-12 text-base-content/30" />
                  </div>
                )}

                <div className="absolute top-2 left-2 flex gap-2">
                  {video.is_featured && (
                    <span className="badge badge-warning gap-1">
                      <Star className="w-3 h-3" />
                      Destaque
                    </span>
                  )}
                  {!video.is_published && (
                    <span className="badge badge-neutral">Oculto</span>
                  )}
                </div>

                <div className="absolute top-2 right-2">
                  <span className="badge badge-info">
                    {video.video_type === 'youtube' && <Youtube className="w-3 h-3 mr-1" />}
                    {video.video_type === 'vimeo' && <Link className="w-3 h-3 mr-1" />}
                    {video.video_type === 'upload' && <Upload className="w-3 h-3 mr-1" />}
                    {video.video_type}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{video.title}</h3>
                {video.description && (
                  <p className="text-base-content/70 text-sm mb-4 line-clamp-2">
                    {video.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFeatured(video)}
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      video.is_featured ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
                    }`}
                    title={video.is_featured ? 'Remover destaque' : 'Destacar'}
                  >
                    <Star className={`w-4 h-4 ${video.is_featured ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => togglePublished(video)}
                    className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-white"
                    title={video.is_published ? 'Ocultar' : 'Publicar'}
                  >
                    {video.is_published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(video)}
                    className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(video)}
                    className="w-8 h-8 rounded flex items-center justify-center text-red-500 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a1a]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">
                    {editingVideo ? 'Editar Vídeo' : 'Novo Vídeo'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-10 h-10 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-gray-300">Tipo de Vídeo</span>
                  </label>
                  <div className="flex gap-2">
                    {(['youtube', 'vimeo', 'upload'] as VideoType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTypeChange(type)}
                        className={`px-4 py-2 rounded-lg flex-1 ${
                          formData.video_type === type
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600/20'
                        }`}
                      >
                        {type === 'youtube' && <Youtube className="w-4 h-4 mr-1" />}
                        {type === 'vimeo' && <Link className="w-4 h-4 mr-1" />}
                        {type === 'upload' && <Upload className="w-4 h-4 mr-1" />}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.video_type === 'upload' ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-primary bg-primary/10'
                        : 'border-base-300 hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="loading loading-spinner text-primary"></span>
                        <p className="text-sm">Enviando vídeo...</p>
                      </div>
                    ) : formData.url ? (
                      <p className="text-sm text-green-400">Vídeo enviado!</p>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-500" />
                        <p className="text-sm text-gray-400">
                          Arraste ou clique para enviar
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text text-gray-300">URL do Vídeo *</span>
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                      placeholder={
                        formData.video_type === 'youtube'
                          ? 'https://www.youtube.com/watch?v=...'
                          : 'https://vimeo.com/...'
                      }
                    />
                    {formData.external_id && (
                      <label className="label">
                        <span className="label-text-alt text-success">
                          ID detectado: {formData.external_id}
                        </span>
                      </label>
                    )}
                  </div>
                )}

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text">Título *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    placeholder="Título do vídeo"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-gray-300">Descrição</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                    placeholder="Descrição do vídeo"
                    rows={3}
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label mb-2">
                    <span className="label-text text-gray-300">Imagem de Capa</span>
                  </label>
                  <div
                    {...getRootPropsCover()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      isDragActiveCover
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-600 hover:border-purple-500/50'
                    }`}
                  >
                    <input {...getInputPropsCover()} />
                    {coverImagePreview ? (
                      <div className="relative">
                        <img
                          src={coverImagePreview}
                          alt="Prévia da capa"
                          className="max-h-60 mx-auto rounded-lg object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverImagePreview(null);
                            setFormData({ ...formData, cover_image_url: '' });
                          }}
                          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 mx-auto text-gray-500" />
                        <p className="text-gray-400">
                          {isDragActiveCover
                            ? 'Solte a imagem aqui'
                            : 'Arraste uma imagem ou clique para selecionar'}
                        </p>
                        <p className="text-sm text-gray-500">
                          JPG, PNG, WEBP (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="label cursor-pointer justify-start gap-3 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) =>
                        setFormData({ ...formData, is_published: e.target.checked })
                      }
                      className="w-4 h-4 text-purple-600 bg-[#0a0a1a] border-purple-500 rounded focus:ring-purple-500 focus:ring-offset-[#0a0a1a]"
                    />
                    <span className="label-text text-gray-300">Publicar</span>
                  </label>

                  <label className="label cursor-pointer justify-start gap-3 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData({ ...formData, is_featured: e.target.checked })
                      }
                      className="w-4 h-4 text-yellow-500 bg-[#0a0a1a] border-yellow-500 rounded focus:ring-yellow-500 focus:ring-offset-[#0a0a1a]"
                    />
                    <span className="label-text text-gray-300">Destaque</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                </div>
              </form>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
