import React, { useState, useEffect, useRef } from 'react';
import { trainingService, chatService, authService, clientService } from '../api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Activity, Dumbbell, LogOut, Calendar, Save, Edit3, Camera, Check, Copy, Trash2, PlusCircle, Search, MessageSquare, Send, Users, ChevronLeft, UserPlus, Bell, X as CloseIcon, Plus } from 'lucide-react';
import './Dashboard.css';

// --- SIMULACIÓN DE BASE DE DATOS DE EJERCICIOS (Estilo Hevy) ---
const EXERCISE_DB = [
    { name: 'Press de Banca (Barra)', muscle: 'Pecho' },
    { name: 'Press Inclinado (Mancuerna)', muscle: 'Pecho' },
    { name: 'Cruce de Poleas', muscle: 'Pecho' },
    { name: 'Dominadas (Chin Up)', muscle: 'Espalda' },
    { name: 'Remo con Barra', muscle: 'Espalda' },
    { name: 'Jalón al Pecho', muscle: 'Espalda' },
    { name: 'Sentadilla (Barra)', muscle: 'Piernas' },
    { name: 'Prensa de Piernas', muscle: 'Piernas' },
    { name: 'Peso Muerto Rumano', muscle: 'Isquios' },
    { name: 'Curl de Bíceps (Barra)', muscle: 'Bíceps' },
    { name: 'Extensiones de Tríceps', muscle: 'Tríceps' },
    { name: 'Elevaciones Laterales', muscle: 'Hombros' },
    { name: 'Press Militar', muscle: 'Hombros' },
    { name: 'Crunch Abdominal', muscle: 'Abdominales' },
];

export default function Dashboard({ user, onLogout }) {
    const API_KEY_IMGBB = '5ddc683f72b1a8e246397ff506b520d5'; 

    // --- ESTADOS PRINCIPALES ---
    const [activeTab, setActiveTab] = useState('routines');
    const [myRoutines, setMyRoutines] = useState([]);
    const [progressInputs, setProgressInputs] = useState({});
    
    // --- ESTADOS MODO "HEVY" (CREACIÓN DE RUTINA CLIENTE) ---
    const [isCreatingRoutine, setIsCreatingRoutine] = useState(false); // Pantalla de creación
    const [showExerciseModal, setShowExerciseModal] = useState(false); // Modal buscador
    const [exerciseSearchTerm, setExerciseSearchTerm] = useState(''); // Buscador texto
    
    // --- ESTADOS CHAT & CONTACTOS ---
    const [trainersList, setTrainersList] = useState([]); 
    const [clientsList, setClientsList] = useState([]);   
    const [linkedClients, setLinkedClients] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    // --- ESTADOS GESTIÓN (Sirve para Entrenador y Cliente Constructor) ---
    const [newRoutine, setNewRoutine] = useState({ name: '', description: '', clientId: '', exercises: [] });
    const [loading, setLoading] = useState(false);
    const [trainerSearchId, setTrainerSearchId] = useState(''); 

    // --- ESTADOS PERFIL ---
    const [bio, setBio] = useState(() => localStorage.getItem(`gymfit_bio_${user.userId}`) || (user.role === 'Trainer' ? "Entrenador certificado." : "Atleta disciplinado."));
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [displayName, setDisplayName] = useState(() => localStorage.getItem(`gymfit_custom_name_${user.userId}`) || (user.firstName + ' ' + (user.lastName || '')));
    const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem(`gymfit_avatar_${user.userId}`) || null);
    const [uploadingImg, setLoadingImg] = useState(false);

    const [realStats, setRealStats] = useState({ totalSessions: 0, totalKg: 0, currentStreak: 0, weeklyActivity: [], historyData: [] });

    // --- CARGA DE DATOS ---
    const loadRoutines = (targetClientId) => {
        const idToFetch = targetClientId || user.userId;
        if (user.role === 'Trainer' && !targetClientId) { setMyRoutines([]); return; }
        trainingService.getClientRoutines(idToFetch).then(data => setMyRoutines(data)).catch(err => { console.error(err); setMyRoutines([]); });
    };

    const loadData = () => {
        if (user.role === 'Client') {
            chatService.getTrainers().then(data => setTrainersList(data));
            clientService.getPendingRequests(user.userId).then(data => setPendingRequests(data));
        } else {
            chatService.getMyClients(user.userId).then(data => setClientsList(data));
            clientService.getMyClientsList(user.userId).then(data => setLinkedClients(data));
        }
    };

    const loadChat = (otherUserId) => {
        chatService.getChatHistory(user.userId, otherUserId).then(msgs => setChatMessages(msgs)).catch(err => console.error("Error chat:", err));
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

    useEffect(() => {
        setBio(localStorage.getItem(`gymfit_bio_${user.userId}`) || (user.role === 'Trainer' ? "Entrenador GymFit" : "Atleta en proceso"));
        setDisplayName(localStorage.getItem(`gymfit_custom_name_${user.userId}`) || user.firstName);
        setAvatarUrl(localStorage.getItem(`gymfit_avatar_${user.userId}`));

        if (user.role === 'Client') {
            loadRoutines(); 
            trainingService.getClientHistory(user.userId).then(logs => calculateRealStats(logs));
        }
        loadData();
    }, [user]);

    useEffect(() => {
        let interval = setInterval(() => {
            if (selectedChatUser) loadChat(selectedChatUser._id);
            loadData();
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedChatUser]);

    // --- FUNCIONES "ESTILO HEVY" ---
    
    // 1. Abrir el constructor
    const startNewRoutine = () => {
        setNewRoutine({ name: '', description: '', clientId: user.userId, exercises: [] });
        setIsCreatingRoutine(true);
    };

    // 2. Seleccionar ejercicio del modal
    const selectExercise = (exerciseName) => {
        // Añadimos el ejercicio con 1 set por defecto
        const exerciseObj = { name: exerciseName, sets: 3, reps: 10 }; // Default values
        setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, exerciseObj] });
        setShowExerciseModal(false);
        setExerciseSearchTerm('');
    };

    // 3. Actualizar datos dentro del constructor (Sets/Reps)
    const updateExerciseInBuilder = (index, field, value) => {
        const updatedExercises = [...newRoutine.exercises];
        updatedExercises[index][field] = value;
        setNewRoutine({ ...newRoutine, exercises: updatedExercises });
    };

    // 4. Guardar la rutina creada por el cliente
    const handleClientSaveRoutine = async () => {
        if (!newRoutine.name) return alert("Ponle nombre a tu rutina.");
        if (newRoutine.exercises.length === 0) return alert("Agrega al menos un ejercicio.");

        try {
            setLoading(true);
            // Usamos createRoutine. Si eres cliente, el trainerId serás tú mismo (auto-entrenamiento)
            await trainingService.createRoutine({ ...newRoutine, trainerId: user.userId });
            alert("¡Rutina creada! 💪");
            setIsCreatingRoutine(false);
            loadRoutines(); // Recargar lista
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- OTRAS FUNCIONES ---
    const handleAddClient = async () => {
        if (!trainerSearchId) return alert("Escribe el ID del cliente.");
        try { await clientService.sendRequest(user.userId, trainerSearchId); alert("Solicitud enviada."); setTrainerSearchId(''); } catch (err) { alert(err.message); }
    };
    const handleRespondRequest = async (reqId, status) => { try { await clientService.respondRequest(reqId, status); loadData(); } catch (err) { alert("Error"); } };
    const selectClientFromList = (client) => { setTrainerSearchId(client._id); setNewRoutine({...newRoutine, clientId: client._id}); loadRoutines(client._id); };
    const calculateRealStats = (logs) => { if (!logs || logs.length === 0) return; const totalKg = logs.reduce((acc, log) => acc + (log.weightUsed * log.repsDone), 0); const uniqueDays = [...new Set(logs.map(log => new Date(log.date).toISOString().split('T')[0]))]; const newWeeklyActivity = [ { day: 'L', kg: 0 }, { day: 'M', kg: 0 }, { day: 'X', kg: 0 }, { day: 'J', kg: 0 }, { day: 'V', kg: 0 }, { day: 'S', kg: 0 }, { day: 'D', kg: 0 } ]; setRealStats({ totalKg, totalSessions: uniqueDays.length, currentStreak: uniqueDays.length > 0 ? 1 : 0, weeklyActivity: newWeeklyActivity, historyData: logs.slice(0, 10).map(l => ({ name: l.exerciseName.substring(0,3), kg: l.weightUsed })) }); };
    const handleImageUpload = async (e) => { const file = e.target.files[0]; if (!file) return; setLoadingImg(true); const formData = new FormData(); formData.append('image', file); try { const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY_IMGBB}`, { method: 'POST', body: formData }); const data = await res.json(); if (data.success) { const newUrl = data.data.url; setAvatarUrl(newUrl); localStorage.setItem(`gymfit_avatar_${user.userId}`, newUrl); try { await authService.updateAvatar(user.userId, newUrl); } catch(e){} } } catch (err) { console.error(err); } finally { setLoadingImg(false); } };
    const saveProfileChanges = () => { localStorage.setItem(`gymfit_custom_name_${user.userId}`, displayName); setIsEditingProfile(false); };
    const saveBio = () => { localStorage.setItem(`gymfit_bio_${user.userId}`, bio); setIsEditingBio(false); };
    const getInitials = () => displayName ? displayName[0].toUpperCase() : "U";
    const copyToClipboard = () => { navigator.clipboard.writeText(user.userId); alert('ID copiado.'); };
    const handleSelectUser = (chatUser) => { setSelectedChatUser(chatUser); loadChat(chatUser._id); };
    const handleSendMessage = async (e) => { e.preventDefault(); if (!newMessage.trim() || !selectedChatUser) return; try { await chatService.sendMessage({ senderId: user.userId, receiverId: selectedChatUser._id, content: newMessage }); setNewMessage(''); loadChat(selectedChatUser._id); } catch (err) { console.error(err); } };
    const handleDeleteRoutine = async (routineId) => { if (!window.confirm("¿Eliminar?")) return; try { await trainingService.deleteRoutine(routineId); loadRoutines(trainerSearchId || user.userId); } catch (err) { alert(`Error: ${err.message}`); } };
    const handleSaveRoutineTrainer = async () => { if (newRoutine.exercises.length === 0) return alert("Agrega ejercicios."); if (!newRoutine.clientId) return alert("Falta ID Cliente."); try { setLoading(true); await trainingService.createRoutine({ ...newRoutine, trainerId: user.userId }); alert('¡Asignada!'); setTrainerSearchId(newRoutine.clientId); loadRoutines(newRoutine.clientId); setNewRoutine({ name: '', description: '', clientId: '', exercises: [] }); } catch (err) { alert(err.message); } finally { setLoading(false); } };
    const handleProgressChange = (rId, exName, field, val) => { const key = `${rId}-${exName}`; setProgressInputs(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } })); };
    const saveProgress = async (rId, exName) => { const key = `${rId}-${exName}`; const inputs = progressInputs[key]; if (!inputs?.weight || !inputs?.reps) return alert("Faltan datos"); try { await trainingService.logProgress({ clientId: user.userId, routineId: rId, exerciseName: exName, weightUsed: Number(inputs.weight), repsDone: Number(inputs.reps) }); alert('Guardado ✅'); trainingService.getClientHistory(user.userId).then(logs => calculateRealStats(logs)); } catch (err) { alert(err.message); } };

    // Estado temporal para Entrenador (usando el mismo sistema)
    const addExerciseTrainer = () => {
        // Función simple para entrenador (legacy)
        setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, {name: 'Nuevo Ejercicio', sets: 3, reps: 10}] });
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
                        {avatarUrl ? <img src={avatarUrl} alt="P" className="sidebar-avatar" /> : <div className="avatar-circle">{getInitials()}</div>}
                        <div style={{overflow:'hidden'}}>
                            <h4 style={{whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}}>{displayName}</h4>
                            <p onClick={copyToClipboard} style={{cursor:'pointer', fontSize:'12px', color:'#888', display:'flex', alignItems:'center', gap:'5px'}}>ID: {user.userId.substring(0,6)}... <Copy size={12}/></p>
                        </div>
                    </div>
                    <nav className="sidebar-nav">
                        <button className={`nav-item ${activeTab==='routines'?'active':''}`} onClick={()=>setActiveTab('routines')}><Dumbbell size={20}/> {user.role === 'Trainer' ? 'Gestión Rutinas' : 'Mis Rutinas'}</button>
                        {user.role === 'Client' ? (<><button className={`nav-item ${activeTab==='stats'?'active':''}`} onClick={()=>setActiveTab('stats')}><Activity size={20}/> Estadísticas</button><button className={`nav-item ${activeTab==='chat'?'active':''}`} onClick={()=>setActiveTab('chat')}><div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}><span style={{display:'flex', alignItems:'center', gap:'8px'}}><MessageSquare size={20}/> Entrenadores</span>{pendingRequests.length > 0 && <span style={{background:'red', borderRadius:'50%', width:'8px', height:'8px'}}></span>}</div></button></>) : (<button className={`nav-item ${activeTab==='chat'?'active':''}`} onClick={()=>setActiveTab('chat')}><MessageSquare size={20}/> Mensajes</button>)}
                        <button className={`nav-item ${activeTab==='profile'?'active':''}`} onClick={()=>setActiveTab('profile')}><User size={20}/> Perfil</button>
                    </nav>
                </aside>

                <main className="dashboard-content-area">
                    {/* MODAL DE BÚSQUEDA DE EJERCICIOS (ESTILO HEVY) */}
                    {showExerciseModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h3>Agregar Ejercicio</h3>
                                    <button onClick={()=>setShowExerciseModal(false)} className="btn-icon"><CloseIcon/></button>
                                </div>
                                <input 
                                    className="input-field search-exercise" 
                                    placeholder="Buscar ejercicio (ej: Press...)" 
                                    value={exerciseSearchTerm}
                                    onChange={e=>setExerciseSearchTerm(e.target.value)}
                                    autoFocus
                                />
                                <div className="exercise-db-list">
                                    {EXERCISE_DB.filter(ex => ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase())).map((ex, idx) => (
                                        <div key={idx} className="db-exercise-item" onClick={()=>selectExercise(ex.name)}>
                                            <div className="circle-icon">{ex.name[0]}</div>
                                            <div>
                                                <h4>{ex.name}</h4>
                                                <span>{ex.muscle}</span>
                                            </div>
                                            <PlusCircle size={20} color="#E50914"/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- VISTA RUTINAS --- */}
                    {activeTab === 'routines' && (
                        <div className="fade-in">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                                <h2 className="page-title" style={{marginBottom:0}}>{user.role === 'Trainer' ? 'Panel de Entrenador' : 'Mis Entrenamientos'}</h2>
                                {user.role === 'Client' && !isCreatingRoutine && (
                                    <button className="btn-primary" style={{width:'auto', display:'flex', alignItems:'center', gap:'8px'}} onClick={startNewRoutine}>
                                        <Plus size={20}/> Nueva Rutina
                                    </button>
                                )}
                            </div>

                            {/* CONSTRUCTOR DE RUTINA (CLIENTE) */}
                            {isCreatingRoutine && user.role === 'Client' ? (
                                <div className="routine-creator-box">
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                                        <h3>Crear Rutina</h3>
                                        <button className="btn-secondary" onClick={()=>setIsCreatingRoutine(false)}>Cancelar</button>
                                    </div>
                                    <input className="input-field" placeholder="Título de la Rutina" value={newRoutine.name} onChange={e=>setNewRoutine({...newRoutine, name:e.target.value})}/>
                                    
                                    <div className="builder-list">
                                        {newRoutine.exercises.length === 0 ? (
                                            <div className="empty-state-builder" onClick={()=>setShowExerciseModal(true)}>
                                                <Dumbbell size={40} color="#333"/>
                                                <p>Empieza agregando un ejercicio</p>
                                                <button className="btn-primary small">Agregar Ejercicio</button>
                                            </div>
                                        ) : (
                                            newRoutine.exercises.map((ex, i) => (
                                                <div key={i} className="builder-item">
                                                    <div className="builder-header">
                                                        <h4>{ex.name}</h4>
                                                        <button className="btn-icon" style={{color:'red'}} onClick={()=>{
                                                            const update = {...newRoutine}; update.exercises.splice(i, 1); setNewRoutine(update);
                                                        }}><Trash2 size={16}/></button>
                                                    </div>
                                                    <div className="builder-row">
                                                        <div className="input-group-label"><label>Sets</label><input className="input-mini" type="number" value={ex.sets} onChange={e=>updateExerciseInBuilder(i, 'sets', e.target.value)}/></div>
                                                        <div className="input-group-label"><label>Reps</label><input className="input-mini" type="number" value={ex.reps} onChange={e=>updateExerciseInBuilder(i, 'reps', e.target.value)}/></div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    
                                    {newRoutine.exercises.length > 0 && (
                                        <button className="btn-secondary full-width" style={{marginTop:'10px'}} onClick={()=>setShowExerciseModal(true)}>+ Agregar otro ejercicio</button>
                                    )}

                                    <div style={{marginTop:'20px'}}>
                                        <button className="btn-primary full-width" onClick={handleClientSaveRoutine} disabled={loading}>{loading ? 'Guardando...' : 'Guardar Rutina'}</button>
                                    </div>
                                </div>
                            ) : (
                                // VISTA NORMAL (LISTA) O PANEL DE ENTRENADOR
                                user.role === 'Trainer' ? (
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                                        <div className="routine-creator-box">
                                            <h3><PlusCircle size={18}/> Asignar Rutina Rápida</h3>
                                            <input className="input-field" placeholder="Nombre Rutina" value={newRoutine.name} onChange={e=>setNewRoutine({...newRoutine, name:e.target.value})}/>
                                            <input className="input-field" placeholder="ID Cliente Destino" value={newRoutine.clientId} onChange={e=>setNewRoutine({...newRoutine, clientId:e.target.value})}/>
                                            <button className="btn-secondary small full-width" onClick={addExerciseTrainer}>+ Añadir Slot Ejercicio</button>
                                            <ul style={{maxHeight:'100px', overflowY:'auto', listStyle:'none', padding:0}}>
                                                {newRoutine.exercises.map((e,i)=>(
                                                    <li key={i} style={{fontSize:'12px', borderBottom:'1px solid #333', padding:'5px', display:'flex', gap:'5px'}}>
                                                        <input style={{width:'50%'}} className="input-mini" placeholder="Ejer" value={e.name} onChange={ev=>{const up=[...newRoutine.exercises]; up[i].name=ev.target.value; setNewRoutine({...newRoutine, exercises:up})}}/>
                                                        <input className="input-mini" placeholder="Sets" value={e.sets} onChange={ev=>{const up=[...newRoutine.exercises]; up[i].sets=ev.target.value; setNewRoutine({...newRoutine, exercises:up})}}/>
                                                        <input className="input-mini" placeholder="Reps" value={e.reps} onChange={ev=>{const up=[...newRoutine.exercises]; up[i].reps=ev.target.value; setNewRoutine({...newRoutine, exercises:up})}}/>
                                                    </li>
                                                ))}
                                            </ul>
                                            <button className="btn-primary" style={{marginTop:'10px'}} onClick={handleSaveRoutineTrainer} disabled={loading}>Asignar</button>
                                        </div>
                                        <div className="routine-manager-box">
                                            <h3>Gestionar Clientes</h3>
                                            <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}><input className="input-field" placeholder="Pegar ID..." value={trainerSearchId} onChange={(e)=>setTrainerSearchId(e.target.value)}/><button className="btn-secondary" onClick={()=>loadRoutines(trainerSearchId)}><Search size={18}/></button><button className="btn-secondary" onClick={handleAddClient} style={{color:'#E50914'}}><UserPlus size={18}/></button></div>
                                            {linkedClients.length > 0 && (
                                                <div className="clients-list">
                                                    <h4 style={{color:'#888', fontSize:'12px', margin:'0 0 10px 0'}}>Mis Clientes</h4>
                                                    {linkedClients.map(client => (
                                                        <div key={client._id} onClick={() => selectClientFromList(client)} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px', background:'#1a1a1a', borderRadius:'8px', marginBottom:'5px', cursor:'pointer', border: newRoutine.clientId === client._id ? '1px solid #E50914' : '1px solid #333'}}>
                                                            {client.avatarUrl ? <img src={client.avatarUrl} style={{width:'30px', height:'30px', borderRadius:'50%', objectFit:'cover'}} /> : <div className="avatar-circle" style={{width:'30px', height:'30px', fontSize:'12px'}}>{client.firstName[0]}</div>}
                                                            <span style={{color:'white', fontSize:'14px'}}>{client.firstName} {client.lastName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="routines-list-mini" style={{marginTop:'15px'}}>{myRoutines.map(r => (<div key={r._id||r.id} className="routine-card mini" style={{padding:'10px', marginBottom:'5px', background:'#111'}}><div style={{display:'flex', justifyContent:'space-between'}}><h4 style={{margin:0, fontSize:'14px'}}>{r.name}</h4><button onClick={()=>handleDeleteRoutine(r._id||r.id)} className="btn-icon" style={{color:'#ff4d4d'}}><Trash2 size={14}/></button></div></div>))}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="routines-grid">
                                        {myRoutines.length === 0 ? <p>No tienes rutinas.</p> : myRoutines.map(r => (
                                            <div key={r._id||r.id} className="routine-card">
                                                <div className="routine-header">
                                                    <h3>{r.name}</h3>
                                                    <div style={{display:'flex', gap:'10px'}}>
                                                        <span className="routine-date"><Calendar size={14}/> {new Date(r.createdAt).toLocaleDateString()}</span>
                                                        <button onClick={()=>handleDeleteRoutine(r._id||r.id)} className="btn-icon" style={{color:'#666'}}><Trash2 size={16}/></button>
                                                    </div>
                                                </div>
                                                <div className="exercises-list-scroll">{r.exercises?.map((e,i)=>(<div key={i} className="exercise-item"><div className="exercise-info"><strong className="ex-name">{e.name}</strong><span className="ex-meta">{e.sets} series × {e.reps} reps</span></div><div className="exercise-actions"><input className="input-mini" placeholder="Kg" type="number" onChange={ev=>handleProgressChange(r._id, e.name,'weight',ev.target.value)}/><input className="input-mini" placeholder="Reps" type="number" onChange={ev=>handleProgressChange(r._id, e.name,'reps',ev.target.value)}/><button className="btn-action-save" onClick={()=>saveProgress(r._id, e.name)}><Check size={18} /></button></div></div>))}</div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* --- VISTA CHAT Y OTROS (Se mantienen igual que antes) --- */}
                    {activeTab === 'chat' && (<div className="fade-in" style={{height: '100%'}}>{!selectedChatUser ? (<><h2 className="page-title">{user.role === 'Client' ? 'Encuentra tu Entrenador' : 'Bandeja de Entrada'}</h2>{user.role === 'Client' && pendingRequests.length > 0 && (<div style={{marginBottom:'25px', background:'#1a1a1a', padding:'15px', borderRadius:'12px', borderLeft:'4px solid #E50914'}}><h3 style={{color:'white', marginTop:0, fontSize:'16px'}}>🔔 Solicitudes</h3><div style={{display:'grid', gap:'10px'}}>{pendingRequests.map(req => (<div key={req._id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#000', padding:'10px', borderRadius:'8px'}}><div style={{display:'flex', alignItems:'center', gap:'10px'}}>{req.trainerId.avatarUrl ? <img src={req.trainerId.avatarUrl} style={{width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover'}}/> : <div className="avatar-circle" style={{width:'40px', height:'40px'}}>{req.trainerId.firstName[0]}</div>}<div><span style={{color:'white', display:'block', fontWeight:'bold'}}>{req.trainerId.firstName} {req.trainerId.lastName}</span></div></div><div style={{display:'flex', gap:'10px'}}><button onClick={()=>handleRespondRequest(req._id, 'accepted')} style={{background:'#2ecc71', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px'}}>Aceptar</button><button onClick={()=>handleRespondRequest(req._id, 'rejected')} style={{background:'#e74c3c', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px'}}>X</button></div></div>))}</div></div>)}<div className="trainers-grid">{(user.role === 'Client' ? trainersList : clientsList).length === 0 ? (<p style={{color:'#888'}}>Sin contactos.</p>) : (user.role === 'Client' ? trainersList : clientsList).map(contact => (<div key={contact._id} className="trainer-card">{contact.avatarUrl ? <img src={contact.avatarUrl} className="trainer-avatar-img" style={{width:'60px', height:'60px', borderRadius:'50%', objectFit:'cover', margin:'0 auto 15px', display:'block', border: '2px solid #E50914'}} /> : <div className="trainer-avatar-placeholder">{contact.firstName?.[0]}</div>}<h3>{contact.firstName} {contact.lastName}</h3><button className="btn-primary" onClick={() => handleSelectUser(contact)}><MessageSquare size={16} style={{marginRight: '8px'}}/> Chat</button></div>))}</div></>) : (<div className="chat-interface-container"><div className="chat-header"><button className="btn-back" onClick={() => setSelectedChatUser(null)}><ChevronLeft size={20}/> Volver</button><div className="chat-user-info"><h3>{selectedChatUser.firstName} {selectedChatUser.lastName}</h3></div></div><div className="chat-messages-area">{chatMessages.map((msg, idx) => (<div key={idx} className={`message-bubble ${msg.senderId === user.userId ? 'my-message' : 'other-message'}`}><p>{msg.content}</p><span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>))}<div ref={chatEndRef} /></div><form className="chat-input-area" onSubmit={handleSendMessage}><input type="text" placeholder="..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} autoFocus/><button type="submit" disabled={!newMessage.trim()}><Send size={18}/></button></form></div>)}</div>)}
                    {activeTab === 'stats' && user.role === 'Client' && (<div className="fade-in"><h2 className="page-title">Mi Progreso</h2><div className="stats-grid"><div className="stat-card big" style={{height: 400}}><ResponsiveContainer width="100%" height="100%"><LineChart data={realStats.historyData}><CartesianGrid strokeDasharray="3 3" stroke="#333"/><XAxis dataKey="name" stroke="#888"/><YAxis stroke="#888"/><Tooltip contentStyle={{backgroundColor:'#222', border:'none' }}/><Line type="monotone" dataKey="kg" stroke="#E50914" strokeWidth={3} dot={{fill:'#E50914'}}/></LineChart></ResponsiveContainer></div><div className="stat-card small"><h3>Racha</h3><p className="stat-number">{realStats.currentStreak} días</p></div><div className="stat-card small"><h3>Total</h3><p className="stat-number">{(realStats.totalKg/1000).toFixed(1)}k</p></div></div></div>)}
                    {activeTab === 'profile' && (<div className="fade-in profile-view"><div className="profile-header-card"><div className="profile-cover"></div><div className="profile-content"><div className="profile-avatar-wrapper">{avatarUrl ? <img src={avatarUrl} alt="P" className="profile-avatar-xl img-fit"/> : <div className="profile-avatar-xl">{getInitials()}</div>}{isEditingProfile && <label className="avatar-edit-overlay"><Camera size={24} color="white"/><input type="file" onChange={handleImageUpload} hidden/></label>}</div><div className="profile-names">{isEditingProfile ? <input className="input-field-transparent" value={displayName} onChange={(e)=>setDisplayName(e.target.value)}/> : <h1 style={{color:'white', margin:0}}>{displayName}</h1>}<span className="role-badge">{user.role}</span></div><div className="profile-actions">{isEditingProfile ? <><button className="btn-icon-action save" onClick={saveProfileChanges}><Check size={18}/></button><button className="btn-icon-action cancel" onClick={()=>setIsEditingProfile(false)}><X size={18}/></button></> : <button className="btn-edit-profile" onClick={()=>setIsEditingProfile(true)}><Edit3 size={16}/> Editar</button>}</div></div></div><div className="profile-grid-layout"><div className="bio-card"><div className="card-header-flex"><h3>Biografía</h3><button className="btn-icon-small" onClick={()=>isEditingBio?saveBio():setIsEditingBio(true)}>{isEditingBio?<Save size={16}/>:<Edit3 size={16}/>}</button></div>{isEditingBio?<textarea className="input-field" rows="4" value={bio} onChange={e=>setBio(e.target.value)}/>:<p style={{color:'#ccc', lineHeight:'1.5'}}>{bio}</p>}</div></div></div>)}
                </main>
            </div>
        </div>
    );
}