import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import { AnimationReadyProvider } from './contexts/AnimationReadyContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { GlowCursor } from './components/ui/GlowCursor';
import { LoadingScreen } from './components/ui/LoadingScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && isHomePage && (
          <LoadingScreen key="loading" onLoadComplete={handleLoadComplete} />
        )}
      </AnimatePresence>

      <div>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--b2))',
              color: 'hsl(var(--bc))',
              border: '1px solid hsl(var(--b3))',
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--su))',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(var(--er))',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <AnimationReadyProvider>
            <GlowCursor>
              <Router>
                <AppContent />
              </Router>
            </GlowCursor>
          </AnimationReadyProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
