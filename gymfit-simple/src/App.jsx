import { useState } from 'react'; // Agregamos useEffect por si acaso, aunque aquí usaremos lazy state
import './App.css';

// Importamos las páginas
import LandingPage from './pages/LandingPage/LandingPage';
import AuthPage from './pages/AuthPage/AuthPage';
import Dashboard from './pages/Dashboard';

import { authService } from './api';

function App() {
  // 1. PRIMERO: Inicializamos el usuario (esto ya lo tenías bien)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gymfit_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. SEGUNDO (LA CORRECCIÓN): Inicializamos la vista basándonos en si hay usuario o no
  const [currentView, setCurrentView] = useState(() => {
    // Si existe el usuario en localStorage, vamos directo al dashboard
    if (localStorage.getItem('gymfit_user')) {
      return 'dashboard';
    }
    // Si no, vamos al landing
    return 'landing';
  });

  const handleLoginSuccess = () => {
    const loggedUser = JSON.parse(localStorage.getItem('gymfit_user'));
    setUser(loggedUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView('landing');
  };

  // RENDERIZADO
  if (currentView === 'landing') {
    return <LandingPage onNavigate={setCurrentView} />;
  }

  if (currentView === 'login' || currentView === 'register') {
    // Pequeña protección: si el usuario intenta ir a login estando logueado
    if (user && currentView === 'login') {
       setCurrentView('dashboard');
       return null;
    }
    return <AuthPage onLoginSuccess={handleLoginSuccess} onNavigate={setCurrentView} initialView={currentView} />;
  }

  if (currentView === 'dashboard') {
    // Protección extra: si intenta ir al dashboard sin usuario, lo mandamos a login
    if (!user) {
        setCurrentView('login');
        return null;
    }
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return null;
}

export default App;