import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatedSection } from '../ui/AnimatedSection';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Event } from '../../types/database';
import { CardHover, ButtonRipple } from '../ui/EnhancedAnimations';
import { getPreloadedData } from '../../hooks/usePreloader';

export const Events = memo(function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Verificar cache do preloader primeiro
    const cachedData = getPreloadedData();
    if (cachedData?.events && cachedData.events.length > 0) {
      setEvents(cachedData.events as Event[]);
      setLoading(false);
      return;
    }

    try {
      // Busca apenas eventos publicados criados pelo admin
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('event_date', { ascending: true });

      if (data) setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = useMemo(() => events.filter((event) => {
    const eventDate = parseISO(event.event_date);
    return !isPast(eventDate) || isToday(eventDate);
  }), [events]);

  const pastEvents = useMemo(() => events.filter((event) => {
    const eventDate = parseISO(event.event_date);
    return isPast(eventDate) && !isToday(eventDate);
  }), [events]);

  const getEventStatus = useCallback((event: Event) => {
    const eventDate = parseISO(event.event_date);
    if (isToday(eventDate)) return { label: 'Hoje', color: 'badge-success' };
    if (isPast(eventDate)) return { label: 'Realizado', color: 'badge-neutral' };
    return { label: 'Em Breve', color: 'badge-primary' };
  }, []);

  const handleFilterUpcoming = useCallback(() => setFilter('upcoming'), []);
  const handleFilterPast = useCallback(() => setFilter('past'), []);

  return (
    <section id="events" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-blue-900/5 to-[#0a0a1a]" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium border border-purple-500/30 mb-4">
            <Calendar className="w-4 h-4 inline mr-2" />
            Agenda
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Eventos</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Fique por dentro dos meus shows e apresentações.
          </p>

          <div className="flex justify-center gap-2">
            <ButtonRipple
              onClick={handleFilterUpcoming}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'upcoming'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-purple-600/20 hover:text-white'
              }`}
            >
              Próximos Eventos
            </ButtonRipple>
            <ButtonRipple
              onClick={handleFilterPast}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'past'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-purple-600/20 hover:text-white'
              }`}
            >
              Eventos Realizados
            </ButtonRipple>
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filter === 'upcoming' && upcomingEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">
              Nenhum evento programado no momento.
            </p>
          </div>
        ) : filter === 'past' && pastEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">
              Nenhum evento realizado registrado.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {(filter === 'upcoming' ? upcomingEvents : pastEvents).map((event, index) => {
              const status = getEventStatus(event);
              return (
                <AnimatedSection key={event.id} delay={index * 0.1}>
                  <CardHover>
                    <motion.div
                      className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-24 h-24 md:h-auto relative flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-purple-600/10 to-blue-600/10 m-4 rounded-lg">
                          <div className="text-center">
                            <span className="block text-2xl font-bold text-purple-400">
                              {format(parseISO(event.event_date), 'dd', { locale: ptBR })}
                            </span>
                            <span className="block text-xs text-gray-500 uppercase">
                              {format(parseISO(event.event_date), 'MMM', { locale: ptBR })}
                            </span>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              status.label === 'Hoje' ? 'bg-green-500/20 text-green-400' :
                              status.label === 'Realizado' ? 'bg-gray-500/20 text-gray-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {status.label}
                            </span>
                          </div>
                          {event.is_featured && (
                            <div className="absolute -top-2 -right-2">
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center animate-pulse">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                                  </svg>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 animate-ping opacity-20"></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors">
                                {event.title}
                              </h3>
                              <p className="text-gray-400 mb-4 line-clamp-2">
                                {event.description}
                              </p>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-purple-400" />
                                  <span>
                                    {format(parseISO(event.event_date), "dd 'de' MMMM 'de' yyyy", {
                                      locale: ptBR,
                                    })}
                                  </span>
                                </div>
                                {event.start_time && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-purple-400" />
                                    <span>
                                      {event.start_time}
                                      {event.end_time && ` - ${event.end_time}`}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-purple-400" />
                                  <span>
                                    {event.venue}
                                    {event.city && `, ${event.city}`}
                                    {event.state && ` - ${event.state}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                              {event.ticket_url && filter === 'upcoming' && !isPast(parseISO(event.event_date)) && (
                                <ButtonRipple
                                  href={event.ticket_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Mais Informações
                                </ButtonRipple>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </CardHover>
                </AnimatedSection>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
});
