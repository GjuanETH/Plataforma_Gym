import { useState } from 'react';
import './App.css';

// Importamos las páginas
import LandingPage from './pages/LandingPage/LandingPage';
import AuthPage from './pages/AuthPage/AuthPage';
import Dashboard from './pages/Dashboard';

import { authService } from './api';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  
  // ✅ CORRECCIÓN: Inicializamos el usuario directamente aquí.
  // Así evitamos el error de "setState inside useEffect".
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('gymfit_user');
    return savedUser ? JSON.parse(savedUser) : null;
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
    return <AuthPage onLoginSuccess={handleLoginSuccess} onNavigate={setCurrentView} initialView={currentView} />;
  }

  if (currentView === 'dashboard') {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return null;
}

export default App;