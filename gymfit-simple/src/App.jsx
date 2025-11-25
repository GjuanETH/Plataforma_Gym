import { useState, useEffect } from 'react';
import { authService, trainingService } from './api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); 
  const [role, setRole] = useState('Client');
  
  const user = JSON.parse(localStorage.getItem('gymfit_user') || '{}');

  // --- ESTADOS DE AUTENTICACIÓN ---
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- ESTADOS ENTRENADOR ---
  const [newRoutine, setNewRoutine] = useState({ name: '', description: '', clientId: '', exercises: [] });
  const [tempExercise, setTempExercise] = useState({ name: '', sets: '', reps: '' });

  // --- ESTADOS CLIENTE ---
  const [myRoutines, setMyRoutines] = useState([]);
  const [progressInputs, setProgressInputs] = useState({}); 

  // --- EFECTO: CARGAR RUTINAS ---
  useEffect(() => {
      if (currentView === 'dashboard' && user.role === 'Client' && user.userId) {
          trainingService.getClientRoutines(user.userId)
              .then(data => setMyRoutines(data))
              .catch(err => console.error("Error cargando rutinas:", err));
      }
  }, [currentView, user.role, user.userId]);

  // --- MANEJADORES AUTH ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (currentView === 'login') {
        await authService.login(formData.email, formData.password);
        setCurrentView('dashboard');
      } else {
        const parts = (formData.firstName || '').split(' ');
        await authService.register({
            firstName: parts[0] || 'User', lastName: parts.slice(1).join(' ') || '.',
            email: formData.email, password: formData.password, role: role
        });
        setCurrentView('dashboard');
      }
    } catch (err) { setError(err.message || 'Error'); } finally { setLoading(false); }
  };

  // --- LÓGICA ENTRENADOR ---
  const addExercise = () => {
      if (!tempExercise.name) return;
      setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, tempExercise] });
      setTempExercise({ name: '', sets: '', reps: '' });
  };

  const handleSaveRoutine = async () => {
      try {
          setLoading(true);
          await trainingService.createRoutine({ ...newRoutine, trainerId: user.userId });
          alert('¡Rutina asignada!');
          setNewRoutine({ name: '', description: '', clientId: '', exercises: [] });
      } catch (err) { alert('Error: ' + err.message); } finally { setLoading(false); }
  };

  // --- LÓGICA CLIENTE ---
  const handleProgressChange = (routineId, exName, field, value) => {
      const key = `${routineId}-${exName}`;
      setProgressInputs(prev => ({
          ...prev,
          [key]: { ...prev[key], [field]: value }
      }));
  };

  const saveProgress = async (routineId, exName) => {
      const key = `${routineId}-${exName}`;
      const inputs = progressInputs[key];

      if (!inputs || !inputs.weight || !inputs.reps) {
          alert("Ingresa peso y reps.");
          return;
      }

      try {
          await trainingService.logProgress({
              clientId: user.userId, routineId, exerciseName: exName,
              weightUsed: Number(inputs.weight), repsDone: Number(inputs.reps)
          });
          alert(`✅ Progreso guardado: ${exName}`);
          setProgressInputs(prev => { const s = { ...prev }; delete s[key]; return s; });
      } catch (err) { alert("Error: " + err.message); }
  };

  // ======================================================
  // VISTAS
  // ======================================================

  // 1. LANDING PAGE
  if (currentView === 'landing') {
    return (
      <div style={{ width: '100%' }}>
        <nav className="navbar">
          <a href="#" className="nav-logo">GYMFIT</a>
          <div className="nav-links">
            <a href="#home" className="nav-link">Inicio</a>
            <a href="#features" className="nav-link">Servicios</a>
            <a href="#contact" className="nav-link">Contacto</a>
          </div>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px', margin: 0 }} onClick={() => setCurrentView('login')}>Área Clientes</button>
        </nav>

        <div id="home" className="app-container hero-container">
          <div className="hero-content" style={{animation: 'slideUp 0.8s ease-out'}}>
            <span className="hero-tagline">Tu evolución comienza hoy</span>
            <h1 className="brand-title" style={{ fontSize: '80px', lineHeight: '1', marginBottom: '20px', textAlign: 'center' }}>DOMINA<br />TU CUERPO</h1>
            <p className="auth-subtitle" style={{ textAlign: 'center', fontSize: '20px', marginBottom: '40px', maxWidth: '600px' }}>La plataforma definitiva para gestionar tus entrenamientos y medir tu progreso con precisión.</p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => setCurrentView('login')} style={{ maxWidth: '200px', margin: 0 }}>EMPEZAR AHORA</button>
            </div>
          </div>
        </div>

        <section id="features" className="section">
          <div className="section-heading"><h2>Por qué GymFit</h2><p>Tu centro de comando fitness.</p></div>
          <div className="features-grid">
            <div className="feature-card"><span className="feature-icon">📊</span><h3>Seguimiento</h3><p>Registra cada repetición.</p></div>
            <div className="feature-card"><span className="feature-icon">⚡</span><h3>Rutinas</h3><p>Planes personalizados.</p></div>
            <div className="feature-card"><span className="feature-icon">🤝</span><h3>Conexión</h3><p>Comunicación directa.</p></div>
          </div>
        </section>

        <footer id="contact" className="footer" style={{ background: '#050505', paddingTop: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '50px', textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontFamily: 'Oswald', fontSize: '32px', marginBottom: '30px', textTransform: 'uppercase' }}>Hablemos de tu rendimiento</h2>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className="info-item" style={{ fontSize: '16px' }}><span style={{ fontSize: '24px', color: '#E50914' }}>📍</span><p style={{ margin: 0, color: '#ccc' }}>Bogotá, Colombia</p></div>
              <div className="info-item" style={{ fontSize: '16px' }}><span style={{ fontSize: '24px', color: '#E50914' }}>📧</span><p style={{ margin: 0, color: '#ccc' }}>contacto@gymfit.com</p></div>
              <div className="info-item" style={{ fontSize: '16px' }}><span style={{ fontSize: '24px', color: '#E50914' }}>📱</span><p style={{ margin: 0, color: '#ccc' }}>+57 300 123 4567</p></div>
            </div>
          </div>
          <div style={{ height: '1px', background: '#222', width: '100%', marginBottom: '40px' }}></div>
          <div className="footer-content" style={{ justifyContent: 'center', gap: '80px', textAlign: 'center' }}>
            <div className="footer-logo"><h2 style={{ color: '#E50914', margin: 0 }}>GYMFIT</h2><p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>Transformando la manera en que entrenas.</p></div>
            <div className="footer-links"><h4 style={{ color: 'white', marginBottom: '15px' }}>Plataforma</h4><ul style={{ padding: 0 }}><li><a href="#" onClick={() => setCurrentView('login')}>Login</a></li><li><a href="#">Registro</a></li></ul></div>
          </div>
          <div className="footer-bottom"><p>&copy; 2025 GymFit Inc. Todos los derechos reservados.</p></div>
        </footer>
      </div>
    );
  }

  // 2. DASHBOARD
  if (currentView === 'dashboard') return (
      <div className="app-container" style={{ alignItems: 'flex-start', overflowY: 'auto', paddingTop: '40px' }}>
          <div className="dashboard-content" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
              <div className="auth-card" style={{ flexDirection: 'row', justifyContent: 'space-between', padding: '20px', marginBottom: '20px' }}>
                  <div><h2 className="brand-title" style={{ fontSize: '24px', textAlign: 'left', marginBottom: '0' }}>HOLA, {user.role === 'Trainer' ? 'PROFE' : 'CLIENT'}</h2><p style={{ color: '#aaa', fontSize: '12px' }}>ID: {user.userId}</p></div>
                  <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', background: '#333' }} onClick={() => { authService.logout(); setCurrentView('landing'); }}>SALIR</button>
              </div>
              {user.role === 'Trainer' && (
                  <div className="auth-card" style={{ alignItems: 'stretch' }}>
                      <h3 style={{ color: 'white', marginBottom: '20px' }}>Crear Rutina</h3>
                      <input className="input-field" placeholder="Nombre Rutina" style={{marginBottom: '10px'}} value={newRoutine.name} onChange={e => setNewRoutine({...newRoutine, name: e.target.value})} />
                      <input className="input-field" placeholder="ID Cliente" style={{marginBottom: '10px'}} value={newRoutine.clientId} onChange={e => setNewRoutine({...newRoutine, clientId: e.target.value})} />
                      <div style={{ background: '#222', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}><div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '5px' }}><input className="input-field" placeholder="Ejercicio" value={tempExercise.name} onChange={e => setTempExercise({...tempExercise, name: e.target.value})} /><input className="input-field" placeholder="Sets" value={tempExercise.sets} onChange={e => setTempExercise({...tempExercise, sets: e.target.value})} /><input className="input-field" placeholder="Reps" value={tempExercise.reps} onChange={e => setTempExercise({...tempExercise, reps: e.target.value})} /></div><button className="btn-primary" style={{ marginTop: '10px', fontSize: '12px' }} onClick={addExercise}>+ Agregar</button></div>
                      <ul>{newRoutine.exercises.map((ex, i) => <li key={i} style={{color:'#ccc'}}>• {ex.name} ({ex.sets}x{ex.reps})</li>)}</ul>
                      <button className="btn-primary" onClick={handleSaveRoutine} disabled={loading}>{loading ? 'Guardando...' : 'Asignar Rutina'}</button>
                  </div>
              )}
              {user.role === 'Client' && (
                  <div><h2 style={{ color: 'white', marginBottom: '20px' }}>MIS RUTINAS</h2>{myRoutines.length === 0 ? <p style={{color:'white'}}>No tienes rutinas asignadas.</p> : (<div className="exercises-list">{myRoutines.map((routine) => (<div key={routine._id} className="auth-card" style={{ alignItems: 'stretch', marginBottom: '20px' }}><div style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}><h3 style={{ color: '#E50914', margin: 0 }}>{routine.name}</h3><p style={{ color: '#aaa', fontSize: '12px' }}>{new Date(routine.createdAt).toLocaleDateString()}</p></div><div style={{ display: 'grid', gap: '10px' }}>{routine.exercises.map((ex, idx) => { const key = `${routine._id}-${ex.name}`; const inputs = progressInputs[key] || { weight: '', reps: '' }; return (<div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #E50914' }}><div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}><strong style={{ color: 'white', fontSize: '16px' }}>{ex.name}</strong><span style={{ color: '#aaa', fontSize: '12px' }}>Meta: {ex.sets} series x {ex.reps}</span></div><div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}><input type="number" placeholder="Kg" className="input-field" style={{ padding: '8px', fontSize: '13px' }} value={inputs.weight} onChange={(e) => handleProgressChange(routine._id, ex.name, 'weight', e.target.value)} /><input type="number" placeholder="Reps" className="input-field" style={{ padding: '8px', fontSize: '13px' }} value={inputs.reps} onChange={(e) => handleProgressChange(routine._id, ex.name, 'reps', e.target.value)} /><button className="btn-primary" style={{ width: 'auto', margin: 0, padding: '8px 12px', fontSize: '12px' }} onClick={() => saveProgress(routine._id, ex.name)}>💾</button></div></div>) })}</div></div>))}</div>)}</div>
              )}
          </div>
      </div>
  );

  // 3. LOGIN / REGISTRO (CORREGIDO)
  const isLogin = currentView === 'login';

  return (
    <div className="app-container">
      <div className="auth-card">
        <h2 className="brand-title">GYMFIT</h2>
        <p className="auth-subtitle">{isLogin ? 'Bienvenido' : 'Registro'}</p>
        {error && <div style={{ color: 'red', textAlign:'center', marginBottom:'10px' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          
          {/* AQUÍ ESTABA EL ERROR: AHORA SOLO SE VE SI NO ES LOGIN */}
          {!isLogin && (
            <div className="role-selector" style={{marginBottom:'20px'}}>
               <button type="button" className={`role-btn ${role === 'Client' ? 'active' : ''}`} onClick={() => setRole('Client')}>Cliente</button>
               <button type="button" className={`role-btn ${role === 'Trainer' ? 'active' : ''}`} onClick={() => setRole('Trainer')}>Entrenador</button>
            </div>
          )}

          {!isLogin && <div className="input-group"><input name="firstName" className="input-field" placeholder="Nombre" onChange={handleChange} /></div>}
          <div className="input-group"><input name="email" className="input-field" placeholder="Email" onChange={handleChange} /></div>
          <div className="input-group"><input name="password" type="password" className="input-field" placeholder="Password" onChange={handleChange} /></div>
          <button type="submit" className="btn-primary">{loading ? '...' : (isLogin ? 'Entrar' : 'Registrar')}</button>
        </form>
        
        <div className="switch-text">
          {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}
          <button className="btn-link" onClick={() => { setError(''); setCurrentView(isLogin ? 'register' : 'login'); }}>{isLogin ? 'Regístrate aquí' : 'Inicia sesión'}</button>
        </div>
        <button className="btn-link" style={{marginTop:'30px', fontSize:'12px', color:'#444'}} onClick={() => setCurrentView('landing')}>← Volver al inicio</button>
      </div>
    </div>
  );
}

export default App;