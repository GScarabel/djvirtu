import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, Calendar, MessageSquare, TrendingUp, Eye } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface Stats {
  totalPhotos: number;
  totalVideos: number;
  totalEvents: number;
  unreadMessages: number;
}

type Tab = 'dashboard' | 'albums' | 'photos' | 'videos' | 'events' | 'messages' | 'settings';

interface DashboardProps {
  setActiveTab: (tab: Tab) => void;
}

export function Dashboard({ setActiveTab }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({
    totalPhotos: 0,
    totalVideos: 0,
    totalEvents: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const [photos, videos, events, messages] = await Promise.all([
        supabase.from('photos').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false),
      ]);

      setStats({
        totalPhotos: photos.count || 0,
        totalVideos: videos.count || 0,
        totalEvents: events.count || 0,
        unreadMessages: messages.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Fotos',
      value: stats.totalPhotos,
      icon: Image,
      color: 'from-purple-600 to-purple-400',
    },
    {
      title: 'Vídeos',
      value: stats.totalVideos,
      icon: Video,
      color: 'from-blue-600 to-blue-400',
    },
    {
      title: 'Eventos',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'from-green-600 to-green-400',
    },
    {
      title: 'Mensagens Novas',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'from-orange-600 to-orange-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-4 rounded-lg mb-6 flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="font-bold text-lg">Configuração Necessária</h3>
            <div className="text-sm">
              Configure as variáveis de ambiente do Supabase no arquivo .env para habilitar todas as funcionalidades.
            </div>
          </div>
        </div>

        <div className="mt-6 bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 p-6 rounded-xl">
          <h3 className="font-bold text-lg text-white mb-4">Passos para configurar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li>Crie um projeto no Supabase (supabase.com)</li>
            <li>Execute o SQL do arquivo supabase-schema.sql no SQL Editor</li>
            <li>Copie a URL e a chave anônima do projeto</li>
            <li>Cole no arquivo .env as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY</li>
            <li>Crie os buckets de storage: photos, videos, covers</li>
            <li>Reinicie o servidor de desenvolvimento</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 p-6 rounded-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-lg text-white">Ações Rápidas</h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('photos')}
              className="w-full px-4 py-3 rounded-lg border border-purple-500/30 text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors justify-start gap-3 flex items-center"
            >
              <Image className="w-4 h-4" />
              Adicionar Nova Foto
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className="w-full px-4 py-3 rounded-lg border border-purple-500/30 text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors justify-start gap-3 flex items-center"
            >
              <Video className="w-4 h-4" />
              Adicionar Novo Vídeo
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className="w-full px-4 py-3 rounded-lg border border-purple-500/30 text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors justify-start gap-3 flex items-center"
            >
              <Calendar className="w-4 h-4" />
              Criar Novo Evento
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-lg text-white">Dicas</h3>
          </div>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Mantenha as fotos em alta resolução para melhor qualidade
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Use links do YouTube ou Vimeo para vídeos externos
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Responda as mensagens de contato rapidamente
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">•</span>
              Mantenha a agenda de eventos sempre atualizada
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
