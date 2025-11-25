import React, { useState, useEffect } from 'react';
// CORRECCIÓN: Importar desde ../api
import { trainingService } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Activity, Dumbbell, LogOut, Calendar, Save } from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('routines');
  const [myRoutines, setMyRoutines] = useState([]);
  const [progressInputs, setProgressInputs] = useState({});
  
  // Estados Entrenador
  const [newRoutine, setNewRoutine] = useState({ name: '', description: '', clientId: '', exercises: [] });
  const [tempExercise, setTempExercise] = useState({ name: '', sets: '', reps: '' });
  const [loading, setLoading] = useState(false);

  const statsData = [{name:'S1', kg:60}, {name:'S2', kg:62}, {name:'S3', kg:65}, {name:'S4', kg:68}];

  useEffect(() => {
    if (user && user.role === 'Client') {
      trainingService.getClientRoutines(user.userId)
        .then(data => setMyRoutines(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  // --- Funciones Entrenador ---
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
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  // --- Funciones Cliente ---
  const handleProgressChange = (rId, exName, field, val) => {
    const key = `${rId}-${exName}`;
    setProgressInputs(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  };

  const saveProgress = async (rId, exName) => {
    const key = `${rId}-${exName}`;
    const inputs = progressInputs[key];
    if (!inputs?.weight || !inputs?.reps) return alert("Faltan datos");
    try {
      await trainingService.logProgress({ clientId: user.userId, routineId: rId, exerciseName: exName, weightUsed: Number(inputs.weight), repsDone: Number(inputs.reps) });
      alert('Guardado ✅');
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="dashboard-layout">
      {/* NAVBAR DASHBOARD */}
      <nav className="navbar">
        <div className="nav-logo">GYMFIT</div>
        <div className="nav-links">
          <span className="nav-user-badge"><User size={16}/> {user.role}</span>
          <button className="btn-nav-logout" onClick={onLogout}><LogOut size={18}/> Salir</button>
        </div>
      </nav>

      <div className="dashboard-main">
        {/* SIDEBAR */}
        <aside className="dashboard-sidebar">
          <div className="user-card">
            <div className="avatar-circle">{user.userId.substring(0,2).toUpperCase()}</div>
            <div><h4>Usuario</h4><p>ID: {user.userId.substring(0,6)}...</p></div>
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

        {/* AREA PRINCIPAL */}
        <main className="dashboard-content-area">
          {/* VISTA RUTINAS */}
          {activeTab === 'routines' && (
            <div className="fade-in">
              <h2 className="page-title">{user.role === 'Trainer' ? 'Asignar Rutinas' : 'Mis Rutinas'}</h2>
              
              {user.role === 'Trainer' ? (
                <div className="routine-creator-box">
                  <h3>Nueva Rutina</h3>
                  <div className="form-grid">
                    <input className="input-field" placeholder="Nombre Rutina" value={newRoutine.name} onChange={e=>setNewRoutine({...newRoutine, name:e.target.value})}/>
                    <input className="input-field" placeholder="ID Cliente" value={newRoutine.clientId} onChange={e=>setNewRoutine({...newRoutine, clientId:e.target.value})}/>
                  </div>
                  <div className="add-exercise-box">
                    <div className="form-grid three-cols">
                      <input className="input-field" placeholder="Ejercicio" value={tempExercise.name} onChange={e=>setTempExercise({...tempExercise, name:e.target.value})}/>
                      <input className="input-field" placeholder="Sets" value={tempExercise.sets} onChange={e=>setTempExercise({...tempExercise, sets:e.target.value})}/>
                      <input className="input-field" placeholder="Reps" value={tempExercise.reps} onChange={e=>setTempExercise({...tempExercise, reps:e.target.value})}/>
                    </div>
                    <button className="btn-secondary small" onClick={addExercise}>+ Agregar Ejercicio</button>
                  </div>
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
                          <div key={idx} className="exercise-item">
                            <div className="exercise-info"><strong>{ex.name}</strong><small>{ex.sets} series x {ex.reps}</small></div>
                            <div className="exercise-actions">
                              <input className="input-mini" type="number" placeholder="Kg" onChange={e=>handleProgressChange(routine._id, ex.name, 'weight', e.target.value)}/>
                              <input className="input-mini" type="number" placeholder="Reps" onChange={e=>handleProgressChange(routine._id, ex.name, 'reps', e.target.value)}/>
                              <button className="btn-icon" onClick={()=>saveProgress(routine._id, ex.name)}><Save size={16}/></button>
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

          {/* VISTA ESTADÍSTICAS Y PERFIL (Omitidas para brevedad, funcionan igual que antes) */}
          {activeTab === 'stats' && user.role === 'Client' && (
             <div className="fade-in"><h2 className="page-title">Mi Progreso</h2><div className="stat-card big" style={{height:300}}><ResponsiveContainer><LineChart data={statsData}><CartesianGrid stroke="#333"/><XAxis dataKey="name"/><YAxis/><Line type="monotone" dataKey="kg" stroke="#E50914"/></LineChart></ResponsiveContainer></div></div>
          )}
          {activeTab === 'profile' && (
             <div className="fade-in profile-view"><h2 className="page-title">Perfil</h2><div className="profile-card"><div className="profile-details"><h3>Usuario</h3><p>ID: {user.userId}</p></div></div></div>
          )}
        </main>
      </div>
    </div>
  );
}