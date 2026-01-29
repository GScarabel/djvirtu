import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Youtube,
  Music2,
  CheckCircle,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { AnimatedSection } from '../ui/AnimatedSection';
import { DatePicker } from '../ui/DatePicker';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { ButtonRipple, CardHover } from '../ui/EnhancedAnimations';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  event_type: string;
  event_date: string;
  message: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  event_type: '',
  event_date: '',
  message: '',
};

const eventTypes = [
  'Casamento',
  '15 Anos',
  'Formatura',
  'Evento Corporativo',
  'Aniversário',
  'Festival',
  'Club/Balada',
  'Outro',
];


export const Contact = memo(function Contact() {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus('error');
      setErrorMessage('Por favor, insira um email válido.');
      setLoading(false);
      return;
    }

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('contact_messages').insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject || null,
          event_type: formData.event_type || null,
          event_date: formData.event_date || null,
          message: formData.message,
          is_read: false,
          is_archived: false,
        });

        if (error) throw error;
      }

      setStatus('success');
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
      setErrorMessage('Ocorreu um erro ao enviar a mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent('Olá! Gostaria de solicitar um orçamento para meu evento.');
  const whatsappUrl = settings.contact_phone ? `https://wa.me/${settings.contact_phone.replace(/\D/g, '')}?text=${whatsappMessage}` : '#';

  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-purple-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <p className="section-subtitle mb-4">Contato</p>
          <h2 className="section-title text-4xl md:text-5xl mb-6">
            <span className="gradient-text">Vamos Trabalhar Juntos</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Interessado em contratar para seu evento? Entre em contato e vamos criar uma experiência inesquecível.
          </p>
        </AnimatedSection>

        {/* WhatsApp CTA */}
        <AnimatedSection className="mb-16">
          <div className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6"
            >
              <MessageCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Resposta Rápida via WhatsApp
            </h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Para uma resposta mais rápida, entre em contato diretamente pelo WhatsApp.
              Respondo em até 24 horas.
            </p>
            <ButtonRipple
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn inline-flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-semibold"
            >
              <MessageCircle className="w-6 h-6" />
              Conversar no WhatsApp
            </ButtonRipple>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <AnimatedSection direction="left">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Informações de Contato</h3>
                <div className="decorative-line mb-8" />
              </div>

              <div className="space-y-6">
                {/* Email */}
                <CardHover>
                  <motion.a
                    href={`mailto:${settings.contact_email}`}
                    className="glass-card rounded-xl p-6 flex items-center gap-5 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center flex-shrink-0 group-hover:neon-glow-sm transition-all">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Email</h4>
                      <p className="text-gray-400 group-hover:text-purple-400 transition-colors">
                        {settings.contact_email}
                      </p>
                    </div>
                  </motion.a>
                </CardHover>

                {/* Phone */}
                <CardHover>
                  <motion.a
                    href={`tel:${settings.contact_phone}`}
                    className="glass-card rounded-xl p-6 flex items-center gap-5 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center flex-shrink-0 group-hover:neon-glow-sm transition-all">
                      <Phone className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Telefone / WhatsApp</h4>
                      <p className="text-gray-400 group-hover:text-purple-400 transition-colors">
                        {settings.contact_phone}
                      </p>
                    </div>
                  </motion.a>
                </CardHover>

                {/* Location */}
                <CardHover>
                  <motion.div
                    className="glass-card rounded-xl p-6 flex items-center gap-5 group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Localização</h4>
                      <p className="text-gray-400">
                        {settings.location_city && settings.location_state
                          ? `${settings.location_city}, ${settings.location_state} - Brasil`
                          : settings.location_city || settings.location_state || 'Localização não definida'}
                      </p>
                      <p className="text-purple-400 text-sm">
                        Atendimento em todo o Brasil
                      </p>
                    </div>
                  </motion.div>
                </CardHover>
              </div>

              {/* Social Links */}
              <div className="pt-6">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Redes Sociais</p>
                <div className="flex gap-4">
                  {settings.instagram_url && (
                    <ButtonRipple
                      key="instagram"
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-pink-500 transition-all hover:border-purple-500/40"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </ButtonRipple>
                  )}
                  {settings.youtube_url && (
                    <ButtonRipple
                      key="youtube"
                      href={settings.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all hover:border-purple-500/40"
                      aria-label="YouTube"
                    >
                      <Youtube className="w-5 h-5" />
                    </ButtonRipple>
                  )}
                  {settings.soundcloud_url && (
                    <ButtonRipple
                      key="soundcloud"
                      href={settings.soundcloud_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-all hover:border-purple-500/40"
                      aria-label="SoundCloud"
                    >
                      <Music2 className="w-5 h-5" />
                    </ButtonRipple>
                  )}
                  {settings.spotify_url && (
                    <ButtonRipple
                      key="spotify"
                      href={settings.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-green-500 transition-all hover:border-purple-500/40"
                      aria-label="Spotify"
                    >
                      <Music2 className="w-5 h-5" />
                    </ButtonRipple>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Contact Form */}
          <AnimatedSection direction="right">
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Envie uma Mensagem</h3>

              {/* Success Message */}
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300">Mensagem enviada com sucesso! Entrarei em contato em breve.</span>
                </motion.div>
              )}

              {/* Error Message */}
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300">{errorMessage}</span>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Nome <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Email <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="event_type" className="block text-sm text-gray-400 mb-2">Tipo de Evento</label>
                  <select
                    id="event_type"
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleChange}
                    title="Selecione o tipo de evento"
                    aria-label="Tipo de evento"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0a0a1a]">Selecione</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type} className="bg-[#0a0a1a]">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Data do Evento</label>
                  <DatePicker
                    value={formData.event_date}
                    onChange={(date) => setFormData({...formData, event_date: date})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Assunto</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Assunto da mensagem"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Mensagem <span className="text-purple-400">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Conte mais sobre seu evento..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              <ButtonRipple
                type="submit"
                disabled={loading}
                className="btn-primary-glow w-full py-4 rounded-lg text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Mensagem</span>
                  </>
                )}
              </ButtonRipple>
            </form>
          </AnimatedSection>
        </div>
      </div>

      {/* Section divider */}
      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
});
