import React, { useState, useEffect } from 'react';
import { trainingService } from '../api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Activity, Dumbbell, LogOut, Calendar, Save, Edit3, Flame, Camera, X, Check } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ user, onLogout }) {
  // --- CONFIGURACIÓN ---
  const API_KEY_IMGBB = '5ddc683f72b1a8e246397ff506b520d5'; // Tu API Key

  const [activeTab, setActiveTab] = useState('routines');
  const [myRoutines, setMyRoutines] = useState([]);
  const [progressInputs, setProgressInputs] = useState({});
  
  // Estados Entrenador
  const [newRoutine, setNewRoutine] = useState({ name: '', description: '', clientId: '', exercises: [] });
  const [tempExercise, setTempExercise] = useState({ name: '', sets: '', reps: '' });
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE PERFIL ---
  const [bio, setBio] = useState(localStorage.getItem('gymfit_bio') || "Atleta disciplinado en busca de su mejor versión.");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // 1. PERSISTENCIA DE NOMBRE (Prioridad: LocalStorage > User Prop)
  const [displayName, setDisplayName] = useState(() => {
      return localStorage.getItem('gymfit_custom_name') || (user.firstName + ' ' + (user.lastName || ''));
  });

  // 2. PERSISTENCIA DE FOTO
  const [avatarUrl, setAvatarUrl] = useState(() => {
      return localStorage.getItem('gymfit_avatar') || null;
  });

  // Datos Fake
  const statsData = [{name:'S1', kg:60}, {name:'S2', kg:62}, {name:'S3', kg:65}, {name:'S4', kg:68}];
  const weeklyActivity = [
    { day: 'L', minutes: 45 }, { day: 'M', minutes: 60 }, { day: 'X', minutes: 30 }, 
    { day: 'J', minutes: 0 }, { day: 'V', minutes: 75 }, { day: 'S', minutes: 90 }, { day: 'D', minutes: 0 }
  ];

  useEffect(() => {
    if (user && user.role === 'Client') {
      trainingService.getClientRoutines(user.userId)
        .then(data => setMyRoutines(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  // --- FUNCIONES DE PERFIL ---
  
  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploadingImg(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
          const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY_IMGBB}`, {
              method: 'POST',
              body: formData
          });
          const data = await res.json();
          if (data.success) {
              setAvatarUrl(data.data.url);
              localStorage.setItem('gymfit_avatar', data.data.url); // Guardar foto
          } else {
              alert("Error subiendo imagen");
          }
      } catch (err) {
          console.error(err);
      } finally {
          setUploadingImg(false);
      }
  };

  const saveProfileChanges = () => {
      // Guardamos el nombre en una variable especial que sobrevive al login
      localStorage.setItem('gymfit_custom_name', displayName);
      setIsEditingProfile(false);
  };

  const getInitials = () => {
      return displayName ? displayName[0].toUpperCase() : "U";
  };

  // Funciones Rutinas
  const addExercise = () => { if (!tempExercise.name) return; setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, tempExercise] }); setTempExercise({ name: '', sets: '', reps: '' }); };
  const handleSaveRoutine = async () => { try { setLoading(true); await trainingService.createRoutine({ ...newRoutine, trainerId: user.userId }); alert('¡Rutina asignada!'); setNewRoutine({ name: '', description: '', clientId: '', exercises: [] }); } catch (err) { alert(err.message); } finally { setLoading(false); } };
  const handleProgressChange = (rId, exName, field, val) => { const key = `${rId}-${exName}`; setProgressInputs(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } })); };
  const saveProgress = async (rId, exName) => { const key = `${rId}-${exName}`; const inputs = progressInputs[key]; if (!inputs?.weight || !inputs?.reps) return alert("Faltan datos"); try { await trainingService.logProgress({ clientId: user.userId, routineId: rId, exerciseName: exName, weightUsed: Number(inputs.weight), repsDone: Number(inputs.reps) }); alert('Guardado ✅'); } catch (err) { alert(err.message); } };
  const saveBio = () => { localStorage.setItem('gymfit_bio', bio); setIsEditingBio(false); };

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
            {/* IMAGEN DEL SIDEBAR CORREGIDA */}
            {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="sidebar-avatar" />
            ) : (
                <div className="avatar-circle">{getInitials()}</div>
            )}
            <div style={{overflow: 'hidden'}}>
                <h4 style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px'}}>{displayName}</h4>
                <p>ID: {user.userId.substring(0,6)}...</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab==='routines'?'active':''}`} onClick={()=>setActiveTab('routines')}><Dumbbell size={20}/> Rutinas</button>
            {user.role === 'Client' && (
              <>
                <button className={`nav-item ${activeTab==='stats'?'active':''}`} onClick={()=>setActiveTab('stats')}><Activity size={20}/> Estadísticas</button>
                <button className={`nav-item ${activeTab==='profile'?'active':''}`} onClick={()=>setActiveTab('profile')}><User size={20}/> Perfil</button>
              </>
            )}
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

          {/* VISTA ESTADÍSTICAS */}
          {activeTab === 'stats' && (
            <div className="fade-in">
              <h2 className="page-title">Mi Progreso</h2>
              <div className="stats-grid">
                  <div className="stat-card big" style={{height: 400}}><h3>Fuerza Estimada</h3><ResponsiveContainer width="100%" height="100%"><LineChart data={statsData}><CartesianGrid strokeDasharray="3 3" stroke="#333"/><XAxis dataKey="name" stroke="#888"/><YAxis stroke="#888"/><Tooltip contentStyle={{backgroundColor:'#222', border:'none' }}/><Line type="monotone" dataKey="kg" stroke="#E50914" strokeWidth={3} dot={{fill:'#E50914'}}/></LineChart></ResponsiveContainer></div>
                  <div className="stat-card small"><h3>Entrenamientos</h3><p className="stat-number">12</p><span className="stat-label">Este mes</span></div>
                  <div className="stat-card small"><h3>Volumen Total</h3><p className="stat-number">4.5T</p><span className="stat-label">Kg levantados</span></div>
              </div>
            </div>
          )}

          {/* VISTA PERFIL */}
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
                  <div className="profile-stats-bar"><div className="p-stat"><strong>12</strong> <span>Rutinas</span></div><div className="p-stat"><strong>45</strong> <span>Sesiones</span></div><div className="p-stat"><strong>890</strong> <span>Kg Total</span></div></div>
              </div>
              <div className="profile-grid-layout">
                  <div className="bio-card">
                      <div className="card-header-flex"><h3>Biografía</h3><button className="btn-icon-small" onClick={() => isEditingBio ? saveBio() : setIsEditingBio(true)}>{isEditingBio ? <Save size={16}/> : <Edit3 size={16}/>}</button></div>
                      {isEditingBio ? <textarea className="input-field" rows="4" value={bio} onChange={(e) => setBio(e.target.value)} /> : <p style={{color:'#ccc', lineHeight:'1.6'}}>{bio}</p>}
                  </div>
                  <div className="streak-card"><div className="streak-header"><Flame size={32} color="#FF9800" fill="#FF9800"/><div><h3>Racha Actual</h3><p style={{margin:0, fontSize:'24px', fontWeight:'bold', color:'white'}}>5 Días</p></div></div></div>
                  <div className="activity-card"><h3>Actividad Semanal</h3><div style={{ width: '100%', height: 180 }}><ResponsiveContainer><BarChart data={weeklyActivity}><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="day" stroke="#666" /><Tooltip cursor={{fill: '#222'}} contentStyle={{backgroundColor:'#111', border:'1px solid #333'}} /><Bar dataKey="minutes" fill="#E50914" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}