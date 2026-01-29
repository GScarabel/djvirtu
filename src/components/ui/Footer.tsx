import { Instagram, Youtube, Music2, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { ButtonRipple } from './EnhancedAnimations';

export function Footer() {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030014]/90 backdrop-blur-xl border-t border-purple-500/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music2 className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold gradient-text">{settings.hero_title}</span>
            </div>
            <p className="text-gray-400 mb-4">
              {settings.site_tagline}
            </p>
            <div className="flex gap-3">
              {settings.instagram_url && (
                <ButtonRipple
                  key="instagram"
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/40 transition-all"
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
                  className="w-10 h-10 rounded-full bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/40 transition-all"
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
                  className="w-10 h-10 rounded-full bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/40 transition-all"
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
                  className="w-10 h-10 rounded-full bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/40 transition-all"
                  aria-label="Spotify"
                >
                  <Music2 className="w-5 h-5" />
                </ButtonRipple>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Links Rápidos</h3>
            <ul className="space-y-2">
              {[
                { label: 'Inicio', id: 'home' },
                { label: 'Sobre', id: 'about' },
                { label: 'Galeria', id: 'gallery' },
                { label: 'Vídeos', id: 'videos' },
                { label: 'Eventos', id: 'events' },
                { label: 'Contato', id: 'contact' }
              ].map(
                (link) => (
                  <li key={link.id}>
                    <a
                      href={`/#${link.id}`}
                      className="text-gray-400 hover:text-purple-400 transition-colors block"
                    >
                      {link.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>{settings.contact_email}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-4 h-4 text-purple-400" />
                <span>{settings.contact_phone}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>
                  {settings.location_city && settings.location_state
                    ? `${settings.location_city}, ${settings.location_state} - Brasil`
                    : settings.location_city || settings.location_state || 'Localização não definida'}
                </span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <ButtonRipple
                  href={`https://wa.me/${settings.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de solicitar um orçamento para meu evento.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-400 transition-colors"
                >
                  Conversar no WhatsApp
                </ButtonRipple>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 my-8"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {currentYear} {settings.hero_title}. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por{' '}
            <span className="text-red-500 animate-pulse"></span> Gabriel Scarabel
          </p>
        </div>
      </div>
    </footer>
  );
}
