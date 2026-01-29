import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Eye,
  EyeOff,
  Save,
  X,
  Upload,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Album } from '../../types/database';
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

export function AlbumsManager() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    is_published: true,
  });
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

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

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast.error('Erro ao carregar álbuns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    try {
      if (editingAlbum) {
        const { error } = await supabase
          .from('albums')
          .update({
            title: formData.title,
            description: formData.description,
            cover_image_url: formData.cover_image_url,
            is_published: formData.is_published,
          })
          .eq('id', editingAlbum.id);

        if (error) throw error;
        toast.success('Álbum atualizado com sucesso');
      } else {
        const { error } = await supabase.from('albums').insert({
          title: formData.title,
          description: formData.description,
          cover_image_url: formData.cover_image_url,
          is_published: formData.is_published,
        });

        if (error) throw error;
        toast.success('Álbum criado com sucesso');
      }

      setShowModal(false);
      setEditingAlbum(null);
      setFormData({ title: '', description: '', cover_image_url: '', is_published: true });
      fetchAlbums();
    } catch (error) {
      console.error('Error saving album:', error);
      toast.error('Erro ao salvar álbum');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este álbum? Todas as fotos associadas serão removidas.')) {
      return;
    }

    try {
      const { error } = await supabase.from('albums').delete().eq('id', id);
      if (error) throw error;
      toast.success('Álbum excluído com sucesso');
      fetchAlbums();
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Erro ao excluir álbum');
    }
  };

  const togglePublished = async (album: Album) => {
    try {
      const { error } = await supabase
        .from('albums')
        .update({ is_published: !album.is_published })
        .eq('id', album.id);

      if (error) throw error;
      toast.success(album.is_published ? 'Álbum ocultado' : 'Álbum publicado');
      fetchAlbums();
    } catch (error) {
      console.error('Error toggling album:', error);
      toast.error('Erro ao atualizar álbum');
    }
  };

  const openEditModal = (album: Album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title,
      description: album.description || '',
      cover_image_url: album.cover_image_url || '',
      is_published: album.is_published,
    });

    // Set cover image preview if available
    if (album.cover_image_url) {
      setCoverImagePreview(album.cover_image_url);
    }

    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingAlbum(null);
    setFormData({ title: '', description: '', cover_image_url: '', is_published: true });
    setShowModal(true);
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-4 rounded-lg">
        Configure o Supabase para gerenciar álbuns.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-400">Organize suas fotos em álbuns</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openNewModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Álbum
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Nenhum álbum criado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden"
            >
              <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                {album.cover_image_url ? (
                  <img
                    src={album.cover_image_url}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FolderOpen className="w-16 h-16 text-base-content/30" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg">{album.title}</h3>
                  <span
                    className={`badge ${
                      album.is_published ? 'badge-success' : 'badge-warning'
                    } badge-sm`}
                  >
                    {album.is_published ? 'Publicado' : 'Oculto'}
                  </span>
                </div>
                {album.description && (
                  <p className="text-base-content/70 text-sm mb-4 line-clamp-2">
                    {album.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => togglePublished(album)}
                    className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-white"
                    title={album.is_published ? 'Ocultar' : 'Publicar'}
                  >
                    {album.is_published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(album)}
                    className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(album.id)}
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
              className="bg-[#0a0a1a]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">
                    {editingAlbum ? 'Editar Álbum' : 'Novo Álbum'}
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
                    <span className="label-text text-gray-300">Título *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    placeholder="Nome do álbum"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text">Descrição</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                    placeholder="Descrição do álbum"
                    rows={3}
                  />
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-gray-300">Imagem de Capa</span>
                  </label>
                  <div
                    {...getRootPropsCover()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
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
                          className="max-h-40 mx-auto rounded-lg object-contain"
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
                        <Upload className="w-10 h-10 mx-auto text-gray-500" />
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

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) =>
                        setFormData({ ...formData, is_published: e.target.checked })
                      }
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">Publicar álbum</span>
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
