import { useState } from 'react';
import './App.css';

// Importamos las páginas. Rutas corregidas asumiendo que App.jsx está en src/
import LandingPage from './pages/LandingPage/LandingPage'; 
import AuthPage from './pages/AuthPage/AuthPage';
import Dashboard from './pages/Dashboard';
import StorePage from './pages/StorePage'; 
import CheckoutPage from './pages/CheckoutPage'; 

import { authService } from './api';

function App() {
  // 1. INICIALIZACIÓN DEL USUARIO
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gymfit_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. CORRECCIÓN DE REDIRECCIÓN INICIAL
  // Si existe el token, vamos al dashboard, si no, SIEMPRE vamos al landing.
  const [currentView, setCurrentView] = useState(() => {
    // Si hay token, asumimos que debe ir al dashboard (área privada)
    if (localStorage.getItem('gymfit_token')) {
      return 'dashboard';
    }
    // Si no hay token, el valor por defecto es la página pública de inicio
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
    setCurrentView('landing'); // Volver al landing tras cerrar sesión
  };

  // --- RENDERIZADO DE VISTAS ---

  if (currentView === 'landing') {
    return <LandingPage onNavigate={setCurrentView} />;
  }

  if (currentView === 'store') {
    return <StorePage onNavigate={setCurrentView} user={user} />;
  }

  if (currentView === 'checkout') {
    return <CheckoutPage onNavigate={setCurrentView} user={user} />;
  }

  if (currentView === 'login' || currentView === 'register') {
    if (user && currentView === 'login') {
       setCurrentView('dashboard');
       return null;
    }
    return <AuthPage onLoginSuccess={handleLoginSuccess} onNavigate={setCurrentView} initialView={currentView} />;
  }

  if (currentView === 'dashboard') {
    if (!user) {
        // Doble verificación de seguridad
        setCurrentView('login');
        return null;
    }
    return <Dashboard user={user} onLogout={handleLogout} onNavigate={setCurrentView} />;
  }

  return null;
}

export default App;