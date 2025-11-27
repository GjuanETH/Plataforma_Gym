import React, { useState, useEffect, useRef } from 'react';
import { Timer, Check, XCircle, Plus, TimerReset, Medal, X as CloseIcon, Camera, Upload, Loader2 } from 'lucide-react';
import { trainingService } from '../../api';

export default function WorkoutSession({ user, routine, onFinish, onCancel, refreshStats, preloadedHistory }) {
    const API_KEY_IMGBB = '5ddc683f72b1a8e246397ff506b520d5';

    // Estados del entrenamiento
    const [workoutLogs, setWorkoutLogs] = useState({});
    const [historyData, setHistoryData] = useState({});
    const [workoutTimer, setWorkoutTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [restTimerActive, setRestTimerActive] = useState(false);
    const [restTimeRemaining, setRestTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(false);
    const restTimerRef = useRef(null);

    // Estados del Resumen y Foto
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState({ totalKg: 0, totalSets: 0, muscles: [] });
    const [workoutPhoto, setWorkoutPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [photoUploadedUrl, setPhotoUploadedUrl] = useState(null);
    const fileInputRef = useRef(null);

    // --- INICIALIZACIÓN ---
    useEffect(() => {
        const initialLogs = {};
        const historyToUse = preloadedHistory || {}; 
        
        routine.exercises.forEach(ex => {
            initialLogs[ex.name] = [];
            for (let i = 0; i < ex.sets; i++) {
                initialLogs[ex.name].push({ weight: '', reps: '', completed: false, restTime: 60 });
            }
            if (!preloadedHistory) {
                 historyToUse[ex.name] = null; 
            }
        });
        setWorkoutLogs(initialLogs);
        setHistoryData(historyToUse);
    }, [routine, preloadedHistory]);

    // --- TIMERS ---
    useEffect(() => {
        let interval;
        if (isTimerRunning) interval = setInterval(() => setWorkoutTimer(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    useEffect(() => {
        if (restTimerActive && restTimeRemaining > 0) {
            restTimerRef.current = setTimeout(() => setRestTimeRemaining(prev => prev - 1), 1000);
        } else if (restTimeRemaining === 0 && restTimerActive) {
            setRestTimerActive(false);
        }
        return () => clearTimeout(restTimerRef.current);
    }, [restTimerActive, restTimeRemaining]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // --- LÓGICA DE SERIES ---
    const handleSetCheck = (exName, setIndex) => {
        const updatedLogs = { ...workoutLogs };
        const currentSet = updatedLogs[exName][setIndex];
        if (!currentSet.weight || !currentSet.reps) return;
        
        const isNowCompleted = !currentSet.completed;
        currentSet.completed = isNowCompleted;
        setWorkoutLogs(updatedLogs);

        if (isNowCompleted) {
            setRestTimeRemaining(currentSet.restTime || 60);
            setRestTimerActive(true);
        } else {
            setRestTimerActive(false);
        }
    };
    
    const handleWorkoutInput = (exName, setIndex, field, value) => {
        const updatedLogs = { ...workoutLogs };
        updatedLogs[exName][setIndex][field] = value;
        setWorkoutLogs(updatedLogs);
    };

    const addSetToExercise = (exName) => {
        const updatedLogs = { ...workoutLogs };
        const lastSetRest = updatedLogs[exName][updatedLogs[exName].length -1]?.restTime || 60;
        updatedLogs[exName].push({ weight: '', reps: '', completed: false, restTime: lastSetRest });
        setWorkoutLogs(updatedLogs);
    };

    const removeSetFromExercise = (exName, setIndex) => {
        const updatedLogs = { ...workoutLogs };
        if (updatedLogs[exName].length <= 1) return; 
        updatedLogs[exName].splice(setIndex, 1);
        setWorkoutLogs(updatedLogs);
    };

    const changeExerciseRestTime = (exName, newTime) => {
        const updatedLogs = { ...workoutLogs };
        updatedLogs[exName].forEach(set => { if (!set.completed) set.restTime = parseInt(newTime); });
        setWorkoutLogs(updatedLogs);
    };

    // --- PASO 1: CALCULAR Y MOSTRAR RESUMEN (Sin guardar aún) ---
    const finishWorkout = () => {
        if (!window.confirm("¿Terminar entrenamiento?")) return;
        
        // Detener timers
        setIsTimerRunning(false);
        setRestTimerActive(false);

        // Calcular estadísticas locales
        let sessionTotalKg = 0;
        let sessionTotalSets = 0;
        let hasCompletedSets = false;
        
        Object.keys(workoutLogs).forEach(exName => {
            workoutLogs[exName].forEach((set) => {
                if (set.completed) {
                    sessionTotalKg += Number(set.weight) * Number(set.reps);
                    sessionTotalSets++;
                    hasCompletedSets = true;
                }
            });
        });

        if (!hasCompletedSets) { 
            alert("No completaste nada. Se cancela el guardado."); 
            return; 
        }

        // Mostrar el modal para permitir subir foto antes de guardar
        setSummaryData({ totalKg: sessionTotalKg, totalSets: sessionTotalSets, muscles: [] });
        setShowSummary(true); 
    };

    // --- PASO 2: GUARDAR DEFINITIVAMENTE EN BD (Con foto si existe) ---
    const handleFinalSave = async () => {
        setLoading(true);
        try {
            const logsToSave = [];
            
            // Reconstruimos los logs para enviar
            Object.keys(workoutLogs).forEach(exName => {
                workoutLogs[exName].forEach((set) => {
                    if (set.completed) {
                        logsToSave.push({ 
                            clientId: user.userId, 
                            routineId: routine._id || routine.id, 
                            exerciseName: exName, 
                            weightUsed: Number(set.weight), 
                            repsDone: Number(set.reps),
                            date: new Date(),
                            // ADJUNTAMOS LA FOTO SOLO AL PRIMER REGISTRO DE LA SESIÓN
                            // Ahora sí funcionará porque photoUploadedUrl ya tiene valor (si se subió)
                            photoUrl: (logsToSave.length === 0 && photoUploadedUrl) ? photoUploadedUrl : null
                        });
                    }
                });
            });
            
            // Guardar cada log en la BD
            // Nota: Idealmente tu API debería aceptar un array de logs (batch), 
            // pero lo dejamos en loop como lo tenías para no romper el backend actual.
            for (const log of logsToSave) { await trainingService.logProgress(log); }
            
            refreshStats(); // Actualizar el dashboard principal
            onFinish(); // Cerrar todo y volver
        } catch (err) { 
            alert("Error guardando datos."); 
            console.error(err); 
        } finally { 
            setLoading(false); 
        }
    };

    // --- FOTO DEL RESULTADO ---
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setWorkoutPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            setPhotoUploadedUrl(null);
        }
    };

    const handleSavePhoto = async () => {
        if (!workoutPhoto) return;
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('image', workoutPhoto);

        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY_IMGBB}`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setPhotoUploadedUrl(data.data.url); // Guardamos la URL para enviarla en handleFinalSave
                alert("¡Foto subida con éxito! Dale a 'Guardar Rutina' para finalizar.");
            } else {
                alert("Error subiendo foto: " + (data.error?.message || "Error desconocido"));
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    // --- RENDERIZADO: MODAL RESUMEN ---
    if (showSummary) {
        return (
            <div className="modal-overlay fade-in" style={{zIndex: 9999}}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 style={{display:'flex', alignItems:'center', gap:'10px', color:'#fff', margin:0}}>
                            <Medal color="#E50914"/> ¡Completado!
                        </h3>
                        {/* Botón X cierra sin guardar cambios finales si no se desea */}
                        <button onClick={onFinish} className="btn-icon"><CloseIcon/></button>
                    </div>
                    
                    <div className="summary-content">
                        <span className="summary-medal">🎉</span>
                        <h2>¡Buen trabajo!</h2>
                        <p style={{color:'#888', marginBottom: '20px'}}>Has completado tu rutina.</p>
                        
                        <div className="summary-stats-row">
                            <div className="summary-stat"><h4>{summaryData.totalSets}</h4><p>Series</p></div>
                            <div className="summary-stat"><h4>{(summaryData.totalKg/1000).toFixed(1)}k</h4><p>Volumen</p></div>
                        </div>

                        <div className="workout-photo-section">
                            <h4 style={{color:'#fff', marginBottom:'15px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontSize:'14px'}}>
                                <Camera size={18} /> Foto del Resultado
                            </h4>
                            
                            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handlePhotoSelect} style={{display:'none'}} />

                            {!photoPreview ? (
                                <button className="btn-primary" onClick={() => fileInputRef.current.click()}>Tomar / Subir Foto</button>
                            ) : (
                                <div className="photo-preview-container">
                                    <img src={photoPreview} alt="Preview" className="photo-preview-img" style={{opacity: uploadingPhoto ? 0.5 : 1}}/>
                                    <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                                        <button className="btn-secondary" style={{flex:1}} onClick={() => fileInputRef.current.click()} disabled={uploadingPhoto || photoUploadedUrl}>Cambiar</button>
                                        <button className="btn-primary" style={{flex:1, background: photoUploadedUrl ? 'var(--success)' : 'var(--primary)'}} onClick={handleSavePhoto} disabled={uploadingPhoto || photoUploadedUrl}>
                                            {uploadingPhoto ? <><Loader2 className="spin" size={16}/> Subiendo...</> : photoUploadedUrl ? <><Check size={16}/> ¡Lista!</> : <><Upload size={16}/> Subir</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ESTE BOTÓN AHORA EJECUTA EL GUARDADO FINAL */}
                        <button 
                            className="btn-secondary full-width" 
                            style={{marginTop:'20px', borderColor:'#333', background: '#E50914', color: 'white'}} 
                            onClick={handleFinalSave}
                            disabled={loading || uploadingPhoto}
                        >
                            {loading ? 'Guardando...' : 'Guardar Rutina y Finalizar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDERIZADO: SESIÓN ACTIVA ---
    return (
        <div className="workout-session-overlay fade-in">
            <div className="workout-header">
                <div><h2 style={{margin:0, color:'white'}}>{routine.name}</h2><div className="workout-timer"><Timer size={16} color={isTimerRunning ? "#E50914" : "#666"}/> <span>{formatTime(workoutTimer)}</span></div></div>
            </div>
            <div className="workout-exercises-list">
                {Object.keys(workoutLogs).map((exName, exIdx) => {
                    const history = historyData[exName];
                    const prevText = history ? `${history.lastWeight}kg x ${history.lastReps}` : '-';
                    return (
                        <div key={exIdx} className="workout-exercise-card">
                            <div className="workout-card-header">
                                <h3>{exName}</h3>
                                <select className="rest-selector" onChange={(e) => changeExerciseRestTime(exName, e.target.value)} defaultValue="60">
                                    <option value="30">Desc: 30s</option>
                                    <option value="60">Desc: 60s</option>
                                    <option value="90">Desc: 90s</option>
                                    <option value="120">Desc: 2m</option>
                                </select>
                            </div>
                            <div className="set-grid-header"><span>#</span><span>Prev</span><span>Kg</span><span>Reps</span><span></span></div>
                            <div className="sets-container">
                                {workoutLogs[exName].map((set, setIdx) => (
                                    <div key={setIdx} className={`set-row ${set.completed ? 'completed' : ''}`}>
                                        <div className="set-num-col"><span className="set-number">{setIdx + 1}</span></div>
                                        <div className="prev-data-col"><div className="prev-badge">{prevText}</div></div>
                                        <div><input type="number" className="workout-input" value={set.weight} onChange={(e) => {const up={...workoutLogs}; up[exName][setIdx].weight=e.target.value; setWorkoutLogs(up)}} disabled={set.completed} placeholder="-"/></div>
                                        <div><input type="number" className="workout-input" value={set.reps} onChange={(e) => {const up={...workoutLogs}; up[exName][setIdx].reps=e.target.value; setWorkoutLogs(up)}} disabled={set.completed} placeholder="-"/></div>
                                        <div className="set-actions-col">
                                            <button className={`btn-check-set ${set.completed ? 'active' : ''}`} onClick={() => handleSetCheck(exName, setIdx)}><Check size={20}/></button>
                                            {!set.completed && (
                                                <button className="btn-delete-set" onClick={() => removeSetFromExercise(exName, setIdx)}>
                                                    <XCircle size={18}/>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-add-set" onClick={() => addSetToExercise(exName)}><Plus size={16}/> Agregar Serie</button>
                        </div>
                    );
                })}
            </div>
            <div className="workout-footer-bar">
                <button className="btn-cancel-workout" onClick={onCancel}>Cancelar</button>
                <button className="btn-finish-workout" onClick={finishWorkout} disabled={loading}>{loading?'...':'Finalizar'}</button>
                {restTimerActive && <div className="rest-timer-floating"><TimerReset size={20}/> {formatTime(restTimeRemaining)}</div>}
            </div>
        </div>
    );
}