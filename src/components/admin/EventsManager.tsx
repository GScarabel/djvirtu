import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Eye,
  EyeOff,
  Star,
  Save,
  X,
  MapPin,
  Clock,
} from 'lucide-react';
import { DatePicker } from '../ui/DatePicker';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Event } from '../../types/database';
import toast from 'react-hot-toast';

interface FormData {
  title: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  event_date: string;
  start_time: string;
  end_time: string;
  is_featured: boolean;
  is_published: boolean;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  venue: '',
  address: '',
  city: '',
  state: '',
  event_date: '',
  start_time: '',
  end_time: '',
  is_featured: false,
  is_published: true,
};

interface City {
  id: number;
  nome: string;
}

interface State {
  id: number;
  sigla: string;
  nome: string;
}

// Fetch all Brazilian states from IBGE API
const fetchStates = async (): Promise<State[]> => {
  try {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const states: State[] = await response.json();
    return states.sort((a, b) => a.sigla.localeCompare(b.sigla));
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

// Fetch cities for a specific state from IBGE API
const fetchCitiesByState = async (stateSigla: string): Promise<City[]> => {
  try {
    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateSigla}/municipios`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cities: City[] = await response.json();
    return cities.sort((a, b) => a.nome.localeCompare(b.nome));
  } catch (error) {
    console.error(`Error fetching cities for state ${stateSigla}:`, error);
    return [];
  }
};

export function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
    loadStates();
  }, []);

  const loadStates = async () => {
    const loadedStates = await fetchStates();
    setStates(loadedStates);
  };

  const fetchEvents = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.event_date) {
      toast.error('Título e data são obrigatórios');
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        venue: formData.venue || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        event_date: formData.event_date,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        status: 'upcoming', // Default to upcoming since we're only creating events we'll participate in
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Evento atualizado com sucesso');
      } else {
        const { error } = await supabase.from('events').insert(eventData);

        if (error) throw error;
        toast.success('Evento criado com sucesso');
      }

      setShowModal(false);
      setEditingEvent(null);
      setFormData(initialFormData);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erro ao salvar evento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;

      toast.success('Evento excluído com sucesso');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  const togglePublished = async (event: Event) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_published: !event.is_published })
        .eq('id', event.id);

      if (error) throw error;
      toast.success(event.is_published ? 'Evento ocultado' : 'Evento publicado');
      fetchEvents();
    } catch (error) {
      console.error('Error toggling event:', error);
      toast.error('Erro ao atualizar evento');
    }
  };

  const toggleFeatured = async (event: Event) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_featured: !event.is_featured })
        .eq('id', event.id);

      if (error) throw error;
      toast.success(event.is_featured ? 'Destaque removido' : 'Evento destacado');
      fetchEvents();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Erro ao atualizar evento');
    }
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      venue: event.venue || '',
      address: event.address || '',
      city: event.city || '',
      state: event.state || '',
      event_date: event.event_date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      is_featured: event.is_featured,
      is_published: event.is_published,
    });

    // Load cities for the selected state if it exists
    if (event.state) {
      loadCitiesForState(event.state);
    }

    setShowModal(true);
  };

  const loadCitiesForState = async (stateSigla: string) => {
    if (!stateSigla) {
      setCities([]);
      return;
    }

    setCitiesLoading(true);
    const loadedCities = await fetchCitiesByState(stateSigla);
    setCities(loadedCities);
    setCitiesLoading(false);
  };

  const openNewModal = () => {
    setEditingEvent(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      upcoming: 'badge-primary',
      ongoing: 'badge-success',
      completed: 'badge-neutral',
      cancelled: 'badge-error',
    };
    const labels: Record<string, string> = {
      upcoming: 'Em Breve',
      ongoing: 'Em Andamento',
      completed: 'Finalizado',
      cancelled: 'Cancelado',
    };
    return { class: badges[status] || 'badge-neutral', label: labels[status] || status };
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="alert alert-warning">
        Configure o Supabase para gerenciar eventos.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-400">Gerencie sua agenda de eventos</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openNewModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Evento
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">Nenhum evento criado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const status = getStatusBadge(event.status);
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0 text-center md:text-left md:w-24">
                    <p className="text-2xl font-bold text-purple-400">
                      {format(parseISO(event.event_date), 'dd', { locale: ptBR })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(event.event_date), 'MMM yyyy', { locale: ptBR })}
                    </p>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-white">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        status.label === 'Hoje' ? 'bg-green-500/20 text-green-400' :
                        status.label === 'Finalizado' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {status.label}
                      </span>
                      {event.is_featured && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 gap-1">
                          <Star className="w-3 h-3" />
                          Destaque
                        </span>
                      )}
                      {!event.is_published && (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">Oculto</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      {event.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-purple-400" />
                          {event.venue}
                          {event.city && `, ${event.city}`}
                        </span>
                      )}
                      {event.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-purple-400" />
                          {event.start_time}
                          {event.end_time && ` - ${event.end_time}`}
                        </span>
                      )}
                      {event.ticket_price && (
                        <span className="text-purple-400 font-medium">
                          R$ {event.ticket_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => toggleFeatured(event)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.is_featured ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
                      }`}
                      title={event.is_featured ? 'Remover destaque' : 'Destacar'}
                    >
                      <Star className={`w-4 h-4 ${event.is_featured ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => togglePublished(event)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
                      title={event.is_published ? 'Ocultar' : 'Publicar'}
                    >
                      {event.is_published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(event)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
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
                    {editingEvent ? 'Editar Evento' : 'Novo Evento'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control md:col-span-2">
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
                      placeholder="Nome do evento"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text text-gray-300">Data *</span>
                    </label>
                    <DatePicker
                      value={formData.event_date}
                      onChange={(date) => setFormData({ ...formData, event_date: date })}
                      className="w-full"
                    />
                  </div>


                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text text-gray-300">Horário Início</span>
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text text-gray-300">Horário Fim</span>
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text text-gray-300">Local</span>
                    </label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) =>
                        setFormData({ ...formData, venue: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                      placeholder="Nome do local"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text text-gray-300">Cidade</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors min-w-[200px]"
                      disabled={!formData.state || citiesLoading}
                    >
                      <option value="" className="bg-[#0a0a1a]">Selecione um estado primeiro</option>
                      {citiesLoading && <option className="bg-[#0a0a1a]">Carregando cidades...</option>}
                      {cities.map((city) => (
                        <option key={city.id} value={city.nome} className="bg-[#0a0a1a]">
                          {city.nome}
                        </option>
                      ))}
                    </select>
                    
                  </div>

                  <div className="form-control">
                    <label className="label mb-2">
                      <span className="label-text text-gray-300">Estado</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setFormData({ ...formData, state: newState, city: '' }); // Reset city when state changes
                        loadCitiesForState(newState); // Load cities for the selected state
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors min-w-[200px]"
                    >
                      <option value="" className="bg-[#0a0a1a]">Selecione</option>
                      {states.map((state) => (
                        <option key={state.sigla} value={state.sigla} className="bg-[#0a0a1a]">
                          {state.nome} ({state.sigla})
                        </option>
                      ))}
                    </select>
                  </div>


                  <div className="form-control md:col-span-2">
                    <label className="label mb-2">
                      <span className="label-text text-gray-300">Descrição</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                      placeholder="Descrição do evento"
                      rows={3}
                    />
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
