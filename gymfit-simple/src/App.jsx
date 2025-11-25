import { useState } from 'react';
import { authService, trainingService } from './api'; // Asegúrate de tener trainingService en api.js
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [role, setRole] = useState('Client');
  
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
  const [routineName, setRoutineName] = useState('');
  const [clientTargetId, setClientTargetId] = useState('');
  const [exercisesList, setExercisesList] = useState([]);
  // Estado temporal para el ejercicio que se está escribiendo
  const [tempExercise, setTempExercise] = useState({ name: '', sets: '', reps: '' });

  // --- MANEJADORES DE INPUTS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LÓGICA DE AUTENTICACIÓN ---
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

  // --- LÓGICA DE RUTINAS (Entrenador) ---
  
  // 1. Agregar un ejercicio a la lista visual (memoria)
  const handleAddExercise = () => {
      if (!tempExercise.name || !tempExercise.sets || !tempExercise.reps) {
          alert("Completa los datos del ejercicio");
          return;
      }
      setExercisesList([...exercisesList, tempExercise]);
      setTempExercise({ name: '', sets: '', reps: '' }); // Limpiar inputs pequeños
  };

  // 2. Guardar la rutina completa en el Backend
  const handleSaveRoutine = async () => {
      if (!routineName || !clientTargetId || exercisesList.length === 0) {
          alert("Faltan datos de la rutina (Nombre, ID Cliente o Ejercicios)");
          return;
      }

      const user = JSON.parse(localStorage.getItem('gymfit_user') || '{}');
      setLoading(true);

      try {
          await trainingService.createRoutine({
              name: routineName,
              description: "Rutina personalizada",
              trainerId: user.userId,
              clientId: clientTargetId,
              exercises: exercisesList
          });
          
          alert("¡Rutina Asignada con Éxito!");
          // Limpiar todo el formulario
          setRoutineName('');
          setClientTargetId('');
          setExercisesList([]);
      } catch (err) {
          alert("Error al guardar: " + (err.message || "Error de servidor"));
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

  // 2. Dashboard (ACTUALIZADO)
  if (currentView === 'dashboard') {
      const user = JSON.parse(localStorage.getItem('gymfit_user') || '{}');
      
      return (
          <div className="app-container" style={{ alignItems: 'flex-start', overflowY: 'auto', paddingTop: '40px' }}>
              <div className="dashboard-content" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                  
                  {/* Header */}
                  <div className="auth-card" style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: '20px', padding: '20px' }}>
                      <div>
                          <h2 className="brand-title" style={{ fontSize: '24px', textAlign: 'left', marginBottom: '5px' }}>Hola, {user.role}</h2>
                          <p style={{ color: '#aaa', fontSize: '12px' }}>ID Usuario: {user.userId}</p>
                      </div>
                      <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', background: '#333' }} onClick={() => {
                          authService.logout();
                          setCurrentView('landing');
                      }}>Salir</button>
                  </div>

                  {/* --- VISTA ENTRENADOR: CREAR RUTINA --- */}
                  {user.role === 'Trainer' && (
                      <div className="auth-card" style={{ alignItems: 'stretch' }}>
                          <h3 style={{ color: 'white', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>📋 Crear Nueva Rutina</h3>

                          <div className="input-group">
                              <label className="label-text">Nombre de la Rutina</label>
                              <input className="input-field" placeholder="Ej. Hipertrofia Espalda" 
                                  value={routineName} onChange={(e) => setRoutineName(e.target.value)} />
                          </div>

                          <div className="input-group">
                              <label className="label-text">ID del Cliente (Destinatario)</label>
                              <input className="input-field" placeholder="Pega aquí el ID del cliente" 
                                  value={clientTargetId} onChange={(e) => setClientTargetId(e.target.value)} />
                          </div>

                          {/* Sección Agregar Ejercicios */}
                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
                              <label className="label-text" style={{ color: '#E50914', marginBottom: '10px' }}>+ Agregar Ejercicio</label>
                              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                  <input className="input-field" style={{ flex: 2 }} placeholder="Nombre (Ej. Sentadilla)" 
                                      value={tempExercise.name} onChange={(e) => setTempExercise({...tempExercise, name: e.target.value})} />
                                  <input className="input-field" style={{ flex: 1 }} placeholder="Series" type="number"
                                      value={tempExercise.sets} onChange={(e) => setTempExercise({...tempExercise, sets: e.target.value})} />
                                  <input className="input-field" style={{ flex: 1 }} placeholder="Reps" 
                                      value={tempExercise.reps} onChange={(e) => setTempExercise({...tempExercise, reps: e.target.value})} />
                              </div>
                              <button className="btn-primary" type="button" onClick={handleAddExercise} style={{ marginTop: '0', fontSize: '12px' }}>Añadir a la lista</button>
                          </div>

                          {/* Lista Previa */}
                          {exercisesList.length > 0 && (
                              <div style={{ marginBottom: '20px' }}>
                                  <h4 style={{ color: '#aaa', fontSize: '14px', marginBottom: '10px' }}>Ejercicios en esta rutina:</h4>
                                  <ul style={{ listStyle: 'none' }}>
                                      {exercisesList.map((ex, i) => (
                                          <li key={i} style={{ background: '#222', padding: '10px', marginBottom: '5px', borderRadius: '4px', borderLeft: '3px solid #E50914', display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                                              <span>{ex.name}</span>
                                              <span style={{ color: '#aaa' }}>{ex.sets} x {ex.reps}</span>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          )}

                          <button className="btn-primary" onClick={handleSaveRoutine} disabled={loading}>
                              {loading ? 'Guardando...' : 'GUARDAR Y ASIGNAR RUTINA'}
                          </button>
                      </div>
                  )}

                  {/* --- VISTA CLIENTE: VER RUTINAS --- */}
                  {user.role === 'Client' && (
                      <div className="auth-card">
                          <h3 style={{ color: 'white' }}>💪 Mis Rutinas</h3>
                          <p style={{ color: '#aaa', marginTop: '10px' }}>
                              Aquí aparecerán las rutinas que te asigne tu entrenador.
                              <br/><br/>
                              (Funcionalidad de visualización pendiente para el siguiente paso).
                          </p>
                      </div>
                  )}
              </div>
          </div>
      )
  }

  // 3. Login / Registro (Vista por defecto para auth)
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