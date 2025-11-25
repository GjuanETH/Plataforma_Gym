import React, { useState, useEffect } from 'react';
import { trainingService } from '../api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Activity, Dumbbell, LogOut, Calendar, Save, Edit3, Flame, Camera, X, Check } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ user, onLogout }) {
  const API_KEY_IMGBB = '5ddc683f72b1a8e246397ff506b520d5'; 

  const [activeTab, setActiveTab] = useState('routines');
  const [myRoutines, setMyRoutines] = useState([]);
  const [progressInputs, setProgressInputs] = useState({});
  
  // Estados Entrenador
  const [newRoutine, setNewRoutine] = useState({ name: '', description: '', clientId: '', exercises: [] });
  const [tempExercise, setTempExercise] = useState({ name: '', sets: '', reps: '' });
  const [loading, setLoading] = useState(false);

  // --- CORRECCIÓN 1: DATOS DE PERFIL VINCULADOS AL ID DEL USUARIO ---
  // Usamos user.userId en la key del localStorage para que no se mezclen cuentas
  const [bio, setBio] = useState(() => localStorage.getItem(`gymfit_bio_${user.userId}`) || (user.role === 'Trainer' ? "Entrenador certificado." : "Atleta disciplinado en busca de su mejor versión."));
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [displayName, setDisplayName] = useState(() => 
    localStorage.getItem(`gymfit_custom_name_${user.userId}`) || (user.firstName + ' ' + (user.lastName || ''))
  );
  
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem(`gymfit_avatar_${user.userId}`) || null);
  const [uploadingImg, setUploadingImg] = useState(false);

  // ESTADÍSTICAS REALES (Inicializadas en 0)
  const [realStats, setRealStats] = useState({
      totalSessions: 0,
      totalKg: 0,
      currentStreak: 0,
      weeklyActivity: [],
      historyData: []
  });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    // Si cambia el usuario (login/logout), reseteamos los estados visuales leyendo las keys nuevas
    setBio(localStorage.getItem(`gymfit_bio_${user.userId}`) || (user.role === 'Trainer' ? "Entrenador GymFit" : "Atleta en proceso"));
    setDisplayName(localStorage.getItem(`gymfit_custom_name_${user.userId}`) || user.firstName);
    setAvatarUrl(localStorage.getItem(`gymfit_avatar_${user.userId}`));

    if (user && user.role === 'Client') {
      trainingService.getClientRoutines(user.userId)
        .then(data => setMyRoutines(data))
        .catch(err => console.error(err));

      trainingService.getClientHistory(user.userId).then(logs => {
          calculateRealStats(logs);
      });
    }
  }, [user]); // Ejecutar cuando cambie el usuario

  // --- LÓGICA MATEMÁTICA DE ESTADÍSTICAS (SOLO CLIENTES) ---
  const calculateRealStats = (logs) => {
      if (!logs || logs.length === 0) return;
      
      const totalKg = logs.reduce((acc, log) => acc + (log.weightUsed * log.repsDone), 0);
      const uniqueDays = [...new Set(logs.map(log => new Date(log.date).toISOString().split('T')[0]))];
      const totalSessions = uniqueDays.length;

      // Calcular Racha (Streak) simple
      let streak = 0;
      const sortedDays = uniqueDays.sort((a, b) => new Date(b) - new Date(a));
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (sortedDays[0] === today || sortedDays[0] === yesterday) {
          streak = 1; // Lógica simplificada de racha
          // Aquí iría el bucle complejo si lo necesitas
      }

      // Actividad Semanal
      const weekMap = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 0: 'D' };
      const newWeeklyActivity = [ { day: 'L', kg: 0 }, { day: 'M', kg: 0 }, { day: 'X', kg: 0 }, { day: 'J', kg: 0 }, { day: 'V', kg: 0 }, { day: 'S', kg: 0 }, { day: 'D', kg: 0 } ];
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      logs.forEach(log => {
          const logDate = new Date(log.date);
          if (logDate >= oneWeekAgo) {
              const dayIndex = logDate.getDay();
              const dayLabel = weekMap[dayIndex];
              const dayObj = newWeeklyActivity.find(d => d.day === dayLabel);
              if (dayObj) dayObj.kg += (log.weightUsed * log.repsDone);
          }
      });

      setRealStats({
          totalKg,
          totalSessions,
          currentStreak: streak,
          weeklyActivity: newWeeklyActivity,
          historyData: logs.slice(0, 10).map(l => ({ name: l.exerciseName.substring(0,3), kg: l.weightUsed }))
      });
  };

  // --- FUNCIONES DE PERFIL CON KEYS DINÁMICAS ---
  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploadingImg(true);
      const formData = new FormData();
      formData.append('image', file);
      try {
          const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY_IMGBB}`, { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success) { 
            setAvatarUrl(data.data.url); 
            // GUARDAMOS CON EL ID DEL USUARIO
            localStorage.setItem(`gymfit_avatar_${user.userId}`, data.data.url); 
          }
      } catch (err) { console.error(err); } finally { setUploadingImg(false); }
  };

  const saveProfileChanges = () => { 
    localStorage.setItem(`gymfit_custom_name_${user.userId}`, displayName); 
    setIsEditingProfile(false); 
  };
  
  const saveBio = () => { 
    localStorage.setItem(`gymfit_bio_${user.userId}`, bio); 
    setIsEditingBio(false); 
  };

  const getInitials = () => displayName ? displayName[0].toUpperCase() : "U";

  // --- FUNCIONES RUTINAS ---
  const addExercise = () => { if (!tempExercise.name) return; setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, tempExercise] }); setTempExercise({ name: '', sets: '', reps: '' }); };
  const handleSaveRoutine = async () => { try { setLoading(true); await trainingService.createRoutine({ ...newRoutine, trainerId: user.userId }); alert('¡Rutina asignada!'); setNewRoutine({ name: '', description: '', clientId: '', exercises: [] }); } catch (err) { alert(err.message); } finally { setLoading(false); } };
  const handleProgressChange = (rId, exName, field, val) => { const key = `${rId}-${exName}`; setProgressInputs(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } })); };
  const saveProgress = async (rId, exName) => { 
      const key = `${rId}-${exName}`; const inputs = progressInputs[key]; 
      if (!inputs?.weight || !inputs?.reps) return alert("Faltan datos"); 
      try { 
          await trainingService.logProgress({ clientId: user.userId, routineId: rId, exerciseName: exName, weightUsed: Number(inputs.weight), repsDone: Number(inputs.reps) }); 
          alert('Guardado ✅');
          trainingService.getClientHistory(user.userId).then(logs => calculateRealStats(logs));
      } catch (err) { alert(err.message); } 
  };

  return (
    <div className="dashboard-layout">
      <nav className="navbar">
        <div className="nav-logo">GYMFIT</div>
        <div className="nav-links">
          <span className="nav-user-badge"><User size={16}/> {user.role}</span>
          <button className="btn-nav-logout" onClick={onLogout}><LogOut size={18}/> Salir</button>
        </div>
      </nav>

      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <div className="user-card">
            {avatarUrl ? <img src={avatarUrl} alt="Profile" className="sidebar-avatar" /> : <div className="avatar-circle">{getInitials()}</div>}
            <div style={{overflow: 'hidden'}}>
                <h4 style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px'}}>{displayName}</h4>
                <p>ID: {user.userId.substring(0,6)}...</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab==='routines'?'active':''}`} onClick={()=>setActiveTab('routines')}><Dumbbell size={20}/> Rutinas</button>
            
            {/* CORRECCIÓN 2: Mostrar botón estadísticas SOLO a clientes */}
            {user.role === 'Client' && (
                <button className={`nav-item ${activeTab==='stats'?'active':''}`} onClick={()=>setActiveTab('stats')}><Activity size={20}/> Estadísticas</button>
            )}

            {/* CORRECCIÓN 3: Botón perfil visible PARA TODOS (Entrenador y Cliente) */}
            <button className={`nav-item ${activeTab==='profile'?'active':''}`} onClick={()=>setActiveTab('profile')}><User size={20}/> Perfil</button>
          </nav>
        </aside>

        <main className="dashboard-content-area">
          
          {/* VISTA RUTINAS */}
          {activeTab === 'routines' && (
            <div className="fade-in">
              <h2 className="page-title">{user.role === 'Trainer' ? 'Asignar Rutinas' : 'Mis Entrenamientos'}</h2>
              {user.role === 'Trainer' ? (
                <div className="routine-creator-box">
                  <h3>Nueva Rutina</h3>
                  <div className="form-grid"><input className="input-field" placeholder="Nombre Rutina" value={newRoutine.name} onChange={e=>setNewRoutine({...newRoutine, name:e.target.value})}/><input className="input-field" placeholder="ID Cliente" value={newRoutine.clientId} onChange={e=>setNewRoutine({...newRoutine, clientId:e.target.value})}/></div>
                  <div className="add-exercise-box"><div className="form-grid three-cols"><input className="input-field" placeholder="Ejercicio" value={tempExercise.name} onChange={e=>setTempExercise({...tempExercise, name:e.target.value})}/><input className="input-field" placeholder="Sets" value={tempExercise.sets} onChange={e=>setTempExercise({...tempExercise, sets:e.target.value})}/><input className="input-field" placeholder="Reps" value={tempExercise.reps} onChange={e=>setTempExercise({...tempExercise, reps:e.target.value})}/></div><button className="btn-secondary small" onClick={addExercise}>+ Agregar Ejercicio</button></div>
                  <ul>{newRoutine.exercises.map((ex,i)=><li key={i}>{ex.name} ({ex.sets}x{ex.reps})</li>)}</ul>
                  <button className="btn-primary" onClick={handleSaveRoutine} disabled={loading}>Guardar Rutina</button>
                </div>
              ) : (
                <div className="routines-grid">
                  {myRoutines.length === 0 ? <p>No tienes rutinas asignadas.</p> : myRoutines.map(routine => (
                    <div key={routine._id} className="routine-card">
                      <div className="routine-header"><h3>{routine.name}</h3><span className="routine-date"><Calendar size={14}/> {new Date(routine.createdAt).toLocaleDateString()}</span></div>
                      <div className="exercises-list-scroll">
                        {routine.exercises.map((ex, idx) => (
                          <div key={idx} className="exercise-item"><div className="exercise-info"><strong>{ex.name}</strong><small>{ex.sets} series x {ex.reps}</small></div><div className="exercise-actions"><input className="input-mini" type="number" placeholder="Kg" onChange={e=>handleProgressChange(routine._id, ex.name, 'weight', e.target.value)}/><input className="input-mini" type="number" placeholder="Reps" onChange={e=>handleProgressChange(routine._id, ex.name, 'reps', e.target.value)}/><button className="btn-icon" onClick={()=>saveProgress(routine._id, ex.name)}><Save size={16}/></button></div></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VISTA ESTADÍSTICAS (Solo Client) */}
          {activeTab === 'stats' && user.role === 'Client' && (
            <div className="fade-in">
              <h2 className="page-title">Mi Progreso</h2>
              <div className="stats-grid">
                  <div className="stat-card big" style={{height: 400}}><h3>Últimos Registros</h3><ResponsiveContainer width="100%" height="100%"><LineChart data={realStats.historyData}><CartesianGrid strokeDasharray="3 3" stroke="#333"/><XAxis dataKey="name" stroke="#888"/><YAxis stroke="#888"/><Tooltip contentStyle={{backgroundColor:'#222', border:'none' }}/><Line type="monotone" dataKey="kg" stroke="#E50914" strokeWidth={3} dot={{fill:'#E50914'}}/></LineChart></ResponsiveContainer></div>
                  <div className="stat-card small"><h3>Racha Actual</h3><p className="stat-number">{realStats.currentStreak} <span style={{fontSize:'16px'}}>días</span></p><span className="stat-label">¡Sigue así!</span></div>
                  <div className="stat-card small"><h3>Volumen Total</h3><p className="stat-number">{(realStats.totalKg / 1000).toFixed(1)}k</p><span className="stat-label">Kg levantados</span></div>
              </div>
            </div>
          )}

          {/* VISTA PERFIL (Adaptada para ambos) */}
          {activeTab === 'profile' && (
            <div className="fade-in profile-view">
              <div className="profile-header-card">
                  <div className="profile-cover"></div>
                  <div className="profile-content">
                      <div className="profile-avatar-wrapper">
                          {avatarUrl ? ( <img src={avatarUrl} alt="Profile" className="profile-avatar-xl img-fit" /> ) : ( <div className="profile-avatar-xl">{getInitials()}</div> )}
                          {isEditingProfile && ( <label className="avatar-edit-overlay"><Camera size={24} color="white" /><input type="file" accept="image/*" onChange={handleImageUpload} hidden /></label> )}
                          {uploadingImg && <div className="uploading-badge">Subiendo...</div>}
                      </div>
                      <div className="profile-names">
                          {isEditingProfile ? ( <input className="input-field-transparent" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoFocus /> ) : ( <h1 style={{color:'white', margin:0}}>{displayName}</h1> )}
                          <span className="role-badge">{user.role}</span>
                      </div>
                      <div className="profile-actions">
                          {isEditingProfile ? ( <><button className="btn-icon-action save" onClick={saveProfileChanges}><Check size={18}/></button><button className="btn-icon-action cancel" onClick={() => setIsEditingProfile(false)}><X size={18}/></button></> ) : ( <button className="btn-edit-profile" onClick={() => setIsEditingProfile(true)}><Edit3 size={16} /> Editar Perfil</button> )}
                      </div>
                  </div>
                  
                  {/* Estadísticas de Cabecera: SOLO PARA CLIENTES */}
                  {user.role === 'Client' && (
                    <div className="profile-stats-bar">
                        <div className="p-stat"><strong>{myRoutines.length}</strong> <span>Rutinas</span></div>
                        <div className="p-stat"><strong>{realStats.totalSessions}</strong> <span>Sesiones</span></div>
                        <div className="p-stat"><strong>{realStats.totalKg}</strong> <span>Kg Total</span></div>
                    </div>
                  )}
              </div>

              <div className="profile-grid-layout">
                  <div className="bio-card" style={user.role === 'Trainer' ? {width: '100%'} : {}}>
                      <div className="card-header-flex"><h3>Biografía</h3><button className="btn-icon-small" onClick={() => isEditingBio ? saveBio() : setIsEditingBio(true)}>{isEditingBio ? <Save size={16}/> : <Edit3 size={16}/>}</button></div>
                      {isEditingBio ? <textarea className="input-field" rows="4" value={bio} onChange={(e) => setBio(e.target.value)} /> : <p style={{color:'#ccc', lineHeight:'1.6'}}>{bio}</p>}
                  </div>
                  
                  {/* Gráficas: SOLO PARA CLIENTES */}
                  {user.role === 'Client' && (
                    <>
                      <div className="streak-card"><div className="streak-header"><Flame size={32} color="#FF9800" fill="#FF9800"/><div><h3>Racha Actual</h3><p style={{margin:0, fontSize:'24px', fontWeight:'bold', color:'white'}}>{realStats.currentStreak} Días</p></div></div></div>
                      <div className="activity-card">
                          <h3>Volumen Semanal (Kg)</h3>
                          <div style={{ width: '100%', height: 180 }}>
                              <ResponsiveContainer><BarChart data={realStats.weeklyActivity}><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="day" stroke="#666" /><Tooltip cursor={{fill: '#222'}} contentStyle={{backgroundColor:'#111', border:'1px solid #333'}} /><Bar dataKey="kg" fill="#E50914" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                          </div>
                      </div>
                    </>
                  )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}