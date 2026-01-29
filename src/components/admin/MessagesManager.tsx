import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  MailOpen,
  Trash2,
  Archive,
  Clock,
  Phone,
  Calendar,
  X,
  CheckCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { ContactMessage } from '../../types/database';
import toast from 'react-hot-toast';

export function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (message: ContactMessage) => {
    if (message.is_read) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', message.id);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const toggleArchive = async (message: ContactMessage) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_archived: !message.is_archived })
        .eq('id', message.id);

      if (error) throw error;
      toast.success(message.is_archived ? 'Mensagem desarquivada' : 'Mensagem arquivada');
      fetchMessages();
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Erro ao arquivar mensagem');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return;

    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;

      toast.success('Mensagem excluída com sucesso');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erro ao excluir mensagem');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      toast.success('Todas as mensagens marcadas como lidas');
      fetchMessages();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Erro ao marcar mensagens');
    }
  };

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    markAsRead(message);
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread') return !m.is_read;
    if (filter === 'archived') return m.is_archived;
    return !m.is_archived;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-4 rounded-lg">
        Configure o Supabase para gerenciar mensagens.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600/20'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600/20'
            }`}
          >
            Não lidas
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'archived'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600/20'
            }`}
          >
            Arquivadas
          </button>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="px-3 py-1 rounded-lg text-sm bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <p className="text-base-content/70">
            {filter === 'unread'
              ? 'Nenhuma mensagem não lida.'
              : filter === 'archived'
              ? 'Nenhuma mensagem arquivada.'
              : 'Nenhuma mensagem recebida ainda.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => openMessage(message)}
              className={`bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                !message.is_read ? 'border-l-4 border-purple-500' : ''
              } ${
                message.is_read
                  ? 'bg-[#0a0a1a]/30 text-gray-500'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.is_read
                      ? 'bg-base-300 text-base-content/50'
                      : 'bg-primary/20 text-primary'
                  }`}
                >
                  {message.is_read ? (
                    <MailOpen className="w-5 h-5" />
                  ) : (
                    <Mail className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{message.name}</span>
                    {!message.is_read && (
                      <span className="badge badge-primary badge-xs">Nova</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    {message.email}
                  </p>
                  {message.subject && (
                    <p className="font-medium text-sm mb-1 text-white">{message.subject}</p>
                  )}
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {message.message}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(message.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleArchive(message);
                      }}
                      className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-white"
                      title={message.is_archived ? 'Desarquivar' : 'Arquivar'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(message.id);
                      }}
                      className="w-8 h-8 rounded flex items-center justify-center text-red-500 hover:bg-red-500/20"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a1a]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-purple-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedMessage.name}</h3>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="w-10 h-10 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    {selectedMessage.phone && (
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="flex items-center gap-2 text-gray-400 hover:text-purple-400"
                      >
                        <Phone className="w-4 h-4" />
                        {selectedMessage.phone}
                      </a>
                    )}
                    {selectedMessage.event_type && (
                      <span className="badge badge-outline">
                        {selectedMessage.event_type}
                      </span>
                    )}
                    {selectedMessage.event_date && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(selectedMessage.event_date), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </span>
                    )}
                  </div>

                  {selectedMessage.subject && (
                    <div>
                      <h4 className="font-semibold mb-1">Assunto</h4>
                      <p className="text-gray-400">{selectedMessage.subject}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-1">Mensagem</h4>
                    <p className="text-gray-400 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div className="text-sm text-gray-500">
                    Recebida em{' '}
                    {format(parseISO(selectedMessage.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Contato DJ'}`}
                    className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    E-mail
                  </a>
                  {selectedMessage.phone && (
                    <a
                      href={"https://wa.me/" + selectedMessage.phone.replace(/\D/g, '') + "?text=" + encodeURIComponent("")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.24-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.485 1.694.625.712.227 1.36.195 1.871.118.571-.087 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.46-8.432z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={() => {
                      toggleArchive(selectedMessage);
                      setSelectedMessage(null);
                    }}
                    className="px-4 py-3 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    {selectedMessage.is_archived ? 'Desarquivar' : 'Arquivar'}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="px-4 py-3 rounded-lg bg-white/5 text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
