import { useState, useEffect } from 'react';
import { authService, trainingService } from './api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [role, setRole] = useState('Client');
  
  // Leemos el usuario al principio para que esté disponible en toda la app
  const user = JSON.parse(localStorage.getItem('gymfit_user') || '{}');

  // --- ESTADOS DE AUTENTICACIÓN ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- ESTADOS PARA CREAR RUTINA (Solo Entrenador) ---
  const [newRoutine, setNewRoutine] = useState({ name: '', description: '', clientId: '', exercises: [] });
  const [tempExercise, setTempExercise] = useState({ name: '', sets: '', reps: '' });

  // --- ESTADOS PARA CLIENTE ---
  const [myRoutines, setMyRoutines] = useState([]);

  // --- EFECTO: CARGAR RUTINAS (Solo si es Cliente y está en Dashboard) ---
  useEffect(() => {
      if (currentView === 'dashboard' && user.role === 'Client' && user.userId) {
          trainingService.getClientRoutines(user.userId)
              .then(data => setMyRoutines(data))
              .catch(err => console.error("Error cargando rutinas:", err));
      }
  }, [currentView, user.role, user.userId]);

  // --- MANEJADORES ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (currentView === 'login') {
        await authService.login(formData.email, formData.password);
        setCurrentView('dashboard');
      } else {
        const nameParts = (formData.firstName || '').split(' ');
        await authService.register({
            firstName: nameParts[0] || 'User',
            lastName: nameParts.slice(1).join(' ') || '.',
            email: formData.email,
            password: formData.password,
            role: role
        });
        setCurrentView('dashboard');
      }
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de Entrenador
  const addExercise = () => {
      if (!tempExercise.name || !tempExercise.sets || !tempExercise.reps) return;
      setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, tempExercise] });
      setTempExercise({ name: '', sets: '', reps: '' });
  };

  const handleSaveRoutine = async () => {
      try {
          setLoading(true);
          await trainingService.createRoutine({ ...newRoutine, trainerId: user.userId });
          alert('¡Rutina creada con éxito!');
          setNewRoutine({ name: '', description: '', clientId: '', exercises: [] });
      } catch (err) {
          alert('Error: ' + (err.message || 'No se pudo crear'));
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
          <p className="auth-subtitle" style={{ fontSize: '18px' }}>Transforma tu cuerpo, gestiona tu progreso.</p>
          <button className="btn-primary" onClick={() => setCurrentView('login')} style={{ maxWidth: '200px' }}>Empezar Ahora</button>
        </div>
      </div>
    );
  }

  // 2. Dashboard
  if (currentView === 'dashboard') {
      return (
          <div className="app-container" style={{ alignItems: 'flex-start', overflowY: 'auto', paddingTop: '40px' }}>
              <div className="dashboard-content" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                  
                  {/* Header */}
                  <div className="auth-card" style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: '20px', padding: '20px' }}>
                      <div>
                          <h1 className="brand-title" style={{ fontSize: '28px', textAlign: 'left', marginBottom: '5px' }}>
                              HOLA, {user.role === 'Trainer' ? 'TRAINER' : 'CLIENT'}
                          </h1>
                          <p style={{ color: '#aaa', fontSize: '12px' }}>ID Usuario: {user.userId}</p>
                      </div>
                      <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', background: '#333' }} onClick={() => {
                          authService.logout();
                          setCurrentView('landing');
                      }}>SALIR</button>
                  </div>

                  {/* --- VISTA ENTRENADOR --- */}
                  {user.role === 'Trainer' && (
                      <div className="auth-card" style={{ alignItems: 'stretch' }}>
                          <h3 style={{ color: 'white', marginBottom: '20px' }}>📋 Crear Nueva Rutina</h3>
                          
                          <div className="input-group">
                              <label className="label-text">NOMBRE DE LA RUTINA</label>
                              <input className="input-field" placeholder="Ej. Hipertrofia Espalda" 
                                  value={newRoutine.name} onChange={(e) => setNewRoutine({...newRoutine, name: e.target.value})} 
                              />
                          </div>
                          <div className="input-group">
                              <label className="label-text">ID DEL CLIENTE (DESTINATARIO)</label>
                              <input className="input-field" placeholder="Pega aquí el ID del cliente" 
                                  value={newRoutine.clientId} onChange={(e) => setNewRoutine({...newRoutine, clientId: e.target.value})} 
                              />
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                              <label className="label-text" style={{ color: '#E50914' }}>+ AGREGAR EJERCICIO</label>
                              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                  <input className="input-field" placeholder="Nombre (Ej. Sentadilla)" 
                                      value={tempExercise.name} onChange={(e) => setTempExercise({...tempExercise, name: e.target.value})} 
                                  />
                                  <input className="input-field" placeholder="Series" type="number"
                                      value={tempExercise.sets} onChange={(e) => setTempExercise({...tempExercise, sets: e.target.value})} 
                                  />
                                  <input className="input-field" placeholder="Reps" 
                                      value={tempExercise.reps} onChange={(e) => setTempExercise({...tempExercise, reps: e.target.value})} 
                                  />
                              </div>
                              <button className="btn-primary" style={{ marginTop: '10px', fontSize: '12px' }} onClick={addExercise}>
                                  AÑADIR A LA LISTA
                              </button>
                          </div>

                          {newRoutine.exercises.length > 0 && (
                              <ul style={{ marginBottom: '20px', color: '#ddd' }}>
                                  {newRoutine.exercises.map((ex, idx) => (
                                      <li key={idx} style={{ marginBottom: '5px', borderLeft: '2px solid #E50914', paddingLeft: '10px' }}>
                                          <strong>{ex.name}</strong>: {ex.sets} series x {ex.reps}
                                      </li>
                                  ))}
                              </ul>
                          )}
                          <button className="btn-primary" onClick={handleSaveRoutine} disabled={loading}>
                              {loading ? 'Guardando...' : 'GUARDAR Y ASIGNAR RUTINA'}
                          </button>
                      </div>
                  )}

                  {/* --- VISTA CLIENTE --- */}
                  {user.role === 'Client' && (
                      <div style={{ width: '100%' }}>
                          <h2 className="section-title" style={{ color: 'white', marginBottom: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                              💪 MIS RUTINAS ASIGNADAS
                          </h2>

                          {myRoutines.length === 0 ? (
                              <div className="auth-card" style={{ textAlign: 'center' }}>
                                  <p style={{ color: '#aaa' }}>No tienes rutinas asignadas todavía.</p>
                                  <p style={{ fontSize: '12px', marginTop: '10px' }}>Pídele a tu entrenador que cree una usando tu ID.</p>
                              </div>
                          ) : (
                              <div className="exercises-list">
                                  {myRoutines.map((routine) => (
                                      <div key={routine._id} className="auth-card" style={{ alignItems: 'flex-start', marginBottom: '20px', animation: 'fadeIn 0.5s' }}>
                                          <div style={{ width: '100%', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
                                              <h3 style={{ color: '#E50914', fontSize: '24px', textTransform: 'uppercase', margin: 0 }}>{routine.name}</h3>
                                              <p style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>
                                                  {routine.description || "Sin descripción"} • Asignada el {new Date(routine.createdAt).toLocaleDateString()}
                                              </p>
                                          </div>

                                          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                                              {routine.exercises.map((ex, idx) => (
                                                  <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #E50914' }}>
                                                      <strong style={{ display: 'block', color: 'white', fontSize: '16px' }}>{ex.name}</strong>
                                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '14px', color: '#ccc' }}>
                                                          <span>Series: <strong style={{ color: 'white' }}>{ex.sets}</strong></span>
                                                          <span>Reps: <strong style={{ color: 'white' }}>{ex.reps}</strong></span>
                                                      </div>
                                                  </div>
                                              ))}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}

              </div>
          </div>
      )
  }

  // 3. Login / Registro (Vista por defecto)
  const isLogin = currentView === 'login';

  return (
    <div className="app-container">
      <div className="auth-card">
        <h2 className="brand-title">GymFit</h2>
        <p className="auth-subtitle">{isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta para empezar'}</p>

        {error && <div style={{ background: 'rgba(229, 9, 20, 0.2)', color: '#ff6b6b', padding: '10px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}</button>
        </form>

        <p className="switch-text">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button className="btn-link" onClick={() => { setError(''); setCurrentView(isLogin ? 'register' : 'login'); }}>{isLogin ? 'Regístrate' : 'Ingresa'}</button>
        </p>
        <button className="btn-link" style={{ display: 'block', margin: '20px auto 0', fontSize: '12px', color: '#666' }} onClick={() => setCurrentView('landing')}>← Volver al inicio</button>
      </div>
    </div>
  );
}

export default App;