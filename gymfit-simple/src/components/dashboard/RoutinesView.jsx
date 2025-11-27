import React, { useState } from 'react';
import { Plus, Calendar, Trash2, Check, Dumbbell, PlusCircle, Search, UserPlus, X as CloseIcon } from 'lucide-react';
import { trainingService, clientService } from '../../api';

// Base de datos para el buscador
const EXERCISE_DB = [
    { name: 'Press de Banca (Barra)', muscle: 'Pecho' }, { name: 'Press Inclinado (Mancuerna)', muscle: 'Pecho' }, { name: 'Cruce de Poleas', muscle: 'Pecho' }, { name: 'Dominadas (Chin Up)', muscle: 'Espalda' }, { name: 'Remo con Barra', muscle: 'Espalda' }, { name: 'Jalón al Pecho', muscle: 'Espalda' }, { name: 'Sentadilla (Barra)', muscle: 'Piernas' }, { name: 'Prensa de Piernas', muscle: 'Piernas' }, { name: 'Peso Muerto Rumano', muscle: 'Isquios' }, { name: 'Curl de Bíceps (Barra)', muscle: 'Bíceps' }, { name: 'Extensiones de Tríceps', muscle: 'Tríceps' }, { name: 'Elevaciones Laterales', muscle: 'Hombros' }, { name: 'Press Militar', muscle: 'Hombros' }, { name: 'Crunch Abdominal', muscle: 'Abdominales' },
];

export default function RoutinesView({ user, myRoutines, loadRoutines, startWorkoutSession, linkedClients }) {
    const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
    const [newRoutine, setNewRoutine] = useState({ name: '', description: '', clientId: user.userId, exercises: [] });
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estados Entrenador
    const [trainerSearchId, setTrainerSearchId] = useState('');
    const [tempExercise, setTempExercise] = useState({ name: '', sets: '', reps: '' });

    // --- FUNCIONES COMUNES ---
    const handleDeleteRoutine = async (routineId) => {
        if (!window.confirm("¿Eliminar rutina?")) return;
        try { await trainingService.deleteRoutine(routineId); loadRoutines(user.role === 'Trainer' ? newRoutine.clientId : user.userId); } catch (err) { alert(err.message); }
    };

    // --- FUNCIONES CLIENTE (CONSTRUCTOR) ---
    const startNewRoutine = () => { setNewRoutine({ name: '', description: '', clientId: user.userId, exercises: [] }); setIsCreatingRoutine(true); };
    const selectExercise = (exerciseName) => { const ex = { name: exerciseName, sets: 3, reps: 10 }; setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, ex] }); setShowExerciseModal(false); setExerciseSearchTerm(''); };
    const updateBuilder = (index, field, val) => { const up = [...newRoutine.exercises]; up[index][field] = val; setNewRoutine({ ...newRoutine, exercises: up }); };
    const saveClientRoutine = async () => {
        if (!newRoutine.name || newRoutine.exercises.length === 0) return alert("Completa la rutina");
        try { setLoading(true); await trainingService.createRoutine({ ...newRoutine, trainerId: user.userId }); setIsCreatingRoutine(false); loadRoutines(); } catch (err) { alert(err.message); } finally { setLoading(false); }
    };

    // --- FUNCIONES ENTRENADOR ---
    const handleAddClient = async () => { try { await clientService.sendRequest(user.userId, trainerSearchId); alert("Solicitud enviada"); setTrainerSearchId(''); } catch (e) { alert(e.message); } };
    const addExerciseTrainer = () => { if (!tempExercise.name) return; setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, tempExercise] }); setTempExercise({name:'', sets:'', reps:''}); };
    const saveTrainerRoutine = async () => {
        if (!newRoutine.clientId) return alert("Falta Cliente");
        try { setLoading(true); await trainingService.createRoutine({ ...newRoutine, trainerId: user.userId }); loadRoutines(newRoutine.clientId); setNewRoutine({...newRoutine, exercises:[]}); } catch (e) { alert(e.message); } finally { setLoading(false); }
    };

    return (
        <div className="fade-in">
            {/* HEADER */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h2 className="page-title" style={{marginBottom:0}}>{user.role === 'Trainer' ? 'Panel de Entrenador' : 'Mis Entrenamientos'}</h2>
                {user.role === 'Client' && !isCreatingRoutine && (<button className="btn-primary" style={{width:'auto'}} onClick={startNewRoutine}><Plus size={20}/> Nueva Rutina</button>)}
            </div>

            {/* MODAL BUSCADOR */}
            {showExerciseModal && (<div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3>Agregar Ejercicio</h3><button onClick={()=>setShowExerciseModal(false)} className="btn-icon"><CloseIcon/></button></div><input className="input-field search-exercise" placeholder="Buscar..." value={exerciseSearchTerm} onChange={e=>setExerciseSearchTerm(e.target.value)} autoFocus/><div className="exercise-db-list">{EXERCISE_DB.filter(ex=>ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase())).map((ex,i)=>(<div key={i} className="db-exercise-item" onClick={()=>selectExercise(ex.name)}><div className="circle-icon">{ex.name[0]}</div><div><h4>{ex.name}</h4><span>{ex.muscle}</span></div><PlusCircle size={20} color="#E50914"/></div>))}</div></div></div>)}

            {/* --- VISTA CLIENTE: CONSTRUCTOR --- */}
            {isCreatingRoutine && user.role === 'Client' ? (
                <div className="routine-creator-box">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}><h3>Crear Rutina</h3><button className="btn-secondary" onClick={()=>setIsCreatingRoutine(false)}>Cancelar</button></div>
                    <input className="input-field" placeholder="Nombre Rutina" value={newRoutine.name} onChange={e=>setNewRoutine({...newRoutine, name:e.target.value})}/>
                    <div className="builder-list">
                        {newRoutine.exercises.length===0 && <div className="empty-state-builder" onClick={()=>setShowExerciseModal(true)}><Dumbbell size={40} color="#333"/><p>Agrega ejercicios</p></div>}
                        {newRoutine.exercises.map((ex, i)=>(<div key={i} className="builder-item"><div className="builder-header"><h4>{ex.name}</h4><button className="btn-icon" style={{color:'red'}} onClick={()=>{const up={...newRoutine}; up.exercises.splice(i,1); setNewRoutine(up)}}><Trash2 size={16}/></button></div><div className="builder-row"><div className="input-group-label"><label>Sets</label><input className="input-mini" value={ex.sets} onChange={e=>updateBuilder(i,'sets',e.target.value)}/></div><div className="input-group-label"><label>Reps</label><input className="input-mini" value={ex.reps} onChange={e=>updateBuilder(i,'reps',e.target.value)}/></div></div></div>))}
                    </div>
                    <button className="btn-secondary full-width" onClick={()=>setShowExerciseModal(true)}>+ Ejercicio</button>
                    <button className="btn-primary full-width" style={{marginTop:'20px'}} onClick={saveClientRoutine} disabled={loading}>{loading?'...':'Guardar'}</button>
                </div>
            ) : (
                /* --- VISTA ENTRENADOR --- */
                user.role === 'Trainer' ? (
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                        <div className="routine-creator-box">
                            <h3><PlusCircle size={18}/> Asignar Rutina</h3>
                            <input className="input-field" placeholder="Nombre Rutina" value={newRoutine.name} onChange={e=>setNewRoutine({...newRoutine, name:e.target.value})}/>
                            <input className="input-field" placeholder="ID Cliente" value={newRoutine.clientId} onChange={e=>setNewRoutine({...newRoutine, clientId:e.target.value})}/>
                            <div className="add-exercise-box" style={{padding:'15px', background:'#222', borderRadius:'8px', marginTop:'10px'}}>
                                <input className="input-field" placeholder="Ejercicio" value={tempExercise.name} onChange={e=>setTempExercise({...tempExercise, name:e.target.value})}/>
                                <div style={{display:'flex', gap:'10px'}}><input className="input-field" placeholder="Sets" value={tempExercise.sets} onChange={e=>setTempExercise({...tempExercise, sets:e.target.value})}/><input className="input-field" placeholder="Reps" value={tempExercise.reps} onChange={e=>setTempExercise({...tempExercise, reps:e.target.value})}/></div>
                                <button className="btn-secondary full-width" onClick={addExerciseTrainer}>+ Agregar</button>
                            </div>
                            <ul style={{margin:'10px 0', paddingLeft:'20px', fontSize:'13px', color:'#ccc'}}>{newRoutine.exercises.map((e,i)=><li key={i}>{e.name} ({e.sets}x{e.reps})</li>)}</ul>
                            <button className="btn-primary" onClick={saveTrainerRoutine} disabled={loading}>Asignar</button>
                        </div>
                        <div className="routine-manager-box">
                            <h3>Clientes</h3>
                            <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}><input className="input-field" placeholder="ID Cliente..." value={trainerSearchId} onChange={e=>setTrainerSearchId(e.target.value)}/><button className="btn-secondary" onClick={()=>loadRoutines(trainerSearchId)}><Search size={18}/></button><button className="btn-secondary" onClick={handleAddClient} style={{color:'#E50914'}}><UserPlus size={18}/></button></div>
                            {linkedClients?.length > 0 && <div className="clients-list">{linkedClients.map(c=>(<div key={c._id} onClick={()=>{setNewRoutine({...newRoutine, clientId:c._id}); loadRoutines(c._id)}} style={{padding:'8px', background:'#222', marginBottom:'5px', borderRadius:'5px', cursor:'pointer'}}>{c.firstName} {c.lastName}</div>))}</div>}
                            <div style={{marginTop:'20px'}}>{myRoutines.map(r=>(<div key={r._id} style={{background:'#111', padding:'10px', marginBottom:'5px', borderRadius:'5px', display:'flex', justifyContent:'space-between'}}>{r.name} <Trash2 size={14} color="red" onClick={()=>handleDeleteRoutine(r._id)}/></div>))}</div>
                        </div>
                    </div>
                ) : (
                    /* --- VISTA CLIENTE: LISTA --- */
                    <div className="routines-grid">
                        {myRoutines.length === 0 ? <p>No tienes rutinas.</p> : myRoutines.map(r => (
                            <div key={r._id||r.id} className="routine-card clickable" onClick={() => startWorkoutSession(r)}>
                                <div className="routine-header" style={{borderBottom:'none', paddingBottom:0}}><h3>{r.name}</h3><button onClick={(e)=>{e.stopPropagation(); handleDeleteRoutine(r._id||r.id)}} className="btn-icon"><Trash2 size={16}/></button></div>
                                <div className="routine-date"><Calendar size={14}/> {new Date(r.createdAt).toLocaleDateString()}</div>
                                <div className="routine-preview-list" style={{marginTop:'15px'}}>{r.exercises.slice(0,3).map((e,i)=><span key={i} style={{display:'block', color:'#aaa', fontSize:'13px'}}>• {e.name}</span>)}</div>
                                <button className="btn-primary" style={{marginTop:'20px'}}>Empezar</button>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}