import { useState } from 'react';
import { authService } from './api'; // Importamos el servicio que acabamos de crear
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [role, setRole] = useState('Client');
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LÓGICA DE CONEXIÓN CON EL BACKEND ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (currentView === 'login') {
        // Intentar Login
        await authService.login(formData.email, formData.password);
        setCurrentView('dashboard'); // Si pasa, vamos al dashboard
      } else {
        // Intentar Registro
        // Dividimos el nombre solo para este ejemplo rápido
        const nameParts = (formData.firstName || '').split(' ');
        const first = nameParts[0] || 'Usuario';
        const last = nameParts.slice(1).join(' ') || '.';

        await authService.register({
            firstName: first,
            lastName: last,
            email: formData.email,
            password: formData.password,
            role: role
        });
        setCurrentView('dashboard'); // Si pasa, vamos al dashboard
      }
    } catch (err) {
      // Mostrar el error que viene del backend (ej: "Usuario ya existe")
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // --- VISTAS (UI) ---

  // 1. Landing Page
  if (currentView === 'landing') {
    return (
      <div className="app-container">
        <div className="auth-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <h1 className="brand-title" style={{ fontSize: '64px' }}>GYMFIT</h1>
          <p className="auth-subtitle" style={{ fontSize: '18px' }}>
            Transforma tu cuerpo, gestiona tu progreso.
          </p>
          <button className="btn-primary" onClick={() => setCurrentView('login')} style={{ maxWidth: '200px' }}>
            Empezar Ahora
          </button>
        </div>
      </div>
    );
  }

  // 2. Dashboard (Éxito)
  if (currentView === 'dashboard') {
      const user = JSON.parse(localStorage.getItem('gymfit_user') || '{}');
      return (
          <div className="app-container">
              <div className="auth-card">
                  <h1 className="brand-title">¡Hola, {user.role === 'Trainer' ? 'Profe' : 'Atleta'}!</h1>
                  <p className="auth-subtitle">Has iniciado sesión correctamente.</p>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
                    <small style={{ color: '#aaa' }}>Tu Token ID:</small>
                    <p style={{ wordBreak: 'break-all', fontSize: '12px' }}>{localStorage.getItem('gymfit_token')?.substring(0, 50)}...</p>
                  </div>
                  <button className="btn-primary" onClick={() => {
                      authService.logout();
                      setCurrentView('landing');
                  }}>Cerrar Sesión</button>
              </div>
          </div>
      )
  }

  // 3. Login / Registro
  const isLogin = currentView === 'login';

  return (
    <div className="app-container">
      <div className="auth-card">
        <h2 className="brand-title">GymFit</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta para empezar'}
        </p>

        {/* Mensaje de Error (Rojo) */}
        {error && (
            <div style={{ background: 'rgba(229, 9, 20, 0.2)', color: '#ff6b6b', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid rgba(229, 9, 20, 0.5)' }}>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Selector de Rol */}
          <div className="role-group">
            <label className="label-text">Selecciona tu perfil:</label>
            <div className="role-selector">
              <button type="button" className={`role-btn ${role === 'Client' ? 'active' : ''}`} onClick={() => setRole('Client')}>Cliente</button>
              <button type="button" className={`role-btn ${role === 'Trainer' ? 'active' : ''}`} onClick={() => setRole('Trainer')}>Entrenador</button>
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label className="label-text">Nombre Completo</label>
              <input name="firstName" type="text" className="input-field" placeholder="Ej. Juan Pérez" required onChange={handleChange} />
            </div>
          )}

          <div className="input-group">
            <label className="label-text">Correo Electrónico</label>
            <input name="email" type="email" className="input-field" placeholder="tu@email.com" required onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="label-text">Contraseña</label>
            <input name="password" type="password" className="input-field" placeholder="••••••••" required onChange={handleChange} />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>

        <p className="switch-text">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button className="btn-link" onClick={() => { setError(''); setCurrentView(isLogin ? 'register' : 'login'); }}>
            {isLogin ? 'Regístrate' : 'Ingresa'}
          </button>
        </p>
        
        <button className="btn-link" style={{ display: 'block', margin: '20px auto 0', fontSize: '12px', color: '#666' }} onClick={() => setCurrentView('landing')}>
            ← Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default App;