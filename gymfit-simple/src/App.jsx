import { useState } from 'react';
import './App.css';

// Importamos las páginas
import LandingPage from './pages/LandingPage/LandingPage'; // Asegúrate de que la ruta sea correcta
import AuthPage from './pages/AuthPage/AuthPage';
import Dashboard from './pages/Dashboard';
import StorePage from './pages/StorePage'; // <--- IMPORTAMOS LA TIENDA
import CheckoutPage from './pages/CheckoutPage';

import { authService } from './api';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gymfit_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState(() => {
    if (localStorage.getItem('gymfit_user')) {
      return 'dashboard';
    }
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

  // --- RENDERIZADO DE VISTAS ---

  if (currentView === 'landing') {
    return <LandingPage onNavigate={setCurrentView} />;
  }

  // NUEVA VISTA: TIENDA
  if (currentView === 'store') {
    return <StorePage onNavigate={setCurrentView} />;
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
        setCurrentView('login');
        return null;
    }
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (currentView === 'store') {
    return <StorePage onNavigate={setCurrentView} />;
  }

  // AGREGAR ESTO AQUÍ:
  if (currentView === 'checkout') {
    return <CheckoutPage onNavigate={setCurrentView} />;
  }

  return null;
}

export default App;