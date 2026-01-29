import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Image,
  Video,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PhotosManager } from '../components/admin/PhotosManager';
import { VideosManager } from '../components/admin/VideosManager';
import { EventsManager } from '../components/admin/EventsManager';
import { AlbumsManager } from '../components/admin/AlbumsManager';
import { MessagesManager } from '../components/admin/MessagesManager';
import { SettingsManager } from '../components/admin/SettingsManager';
import { Dashboard } from '../components/admin/Dashboard';
import { ButtonRipple } from '../components/ui/EnhancedAnimations';

type Tab =
  | 'dashboard'
  | 'albums'
  | 'photos'
  | 'videos'
  | 'events'
  | 'messages'
  | 'settings';

const tabs = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'albums' as Tab, label: 'Álbuns', icon: FolderOpen },
  { id: 'photos' as Tab, label: 'Fotos', icon: Image },
  { id: 'videos' as Tab, label: 'Vídeos', icon: Video },
  { id: 'events' as Tab, label: 'Eventos', icon: Calendar },
  { id: 'messages' as Tab, label: 'Mensagens', icon: MessageSquare },
  { id: 'settings' as Tab, label: 'Configurações', icon: Settings },
];

export function Admin() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'albums':
        return <AlbumsManager />;
      case 'photos':
        return <PhotosManager />;
      case 'videos':
        return <VideosManager />;
      case 'events':
        return <EventsManager />;
      case 'messages':
        return <MessagesManager />;
      case 'settings':
        return <SettingsManager />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/40 transition-all"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#030014]/90 backdrop-blur-xl border-r border-purple-500/20 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <ButtonRipple
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </ButtonRipple>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-500/20">
          <ButtonRipple
            onClick={signOut}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </ButtonRipple>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0a0a1a]/90 backdrop-blur-lg border-b border-purple-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold ml-12 lg:ml-0 text-white">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <ButtonRipple href="/" target="_blank" className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600/20 transition-colors">
                Ver Site
              </ButtonRipple>
            </div>
          </div>
        </header>

        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}
