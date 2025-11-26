import React, { useState, useEffect, useRef } from 'react';
import { trainingService, chatService, authService } from '../api'; // Importamos authService también
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, Activity, Dumbbell, LogOut, Calendar, Save, Edit3, Flame, Camera, X, Check, Copy, Trash2, PlusCircle, Search, MessageSquare, Send, Users, ChevronLeft } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ user, onLogout }) {
    const API_KEY_IMGBB = '5ddc683f72b1a8e246397ff506b520d5'; 

    // --- ESTADOS PRINCIPALES ---
    const [activeTab, setActiveTab] = useState('routines');
    const [myRoutines, setMyRoutines] = useState([]);
    const [progressInputs, setProgressInputs] = useState({});
    
    // --- ESTADOS DE CHAT Y ENTRENADORES ---
    const [trainersList, setTrainersList] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    // --- ESTADOS DE ENTRENADOR (RUTINAS) ---
    const [newRoutine, setNewRoutine] = useState({ name: '', description: '', clientId: '', exercises: [] });
    const [tempExercise, setTempExercise] = useState({ name: '', sets: '', reps: '' });
    const [loading, setLoading] = useState(false);
    const [trainerSearchId, setTrainerSearchId] = useState(''); 

    // --- ESTADOS DE PERFIL ---
    const [bio, setBio] = useState(() => localStorage.getItem(`gymfit_bio_${user.userId}`) || (user.role === 'Trainer' ? "Entrenador certificado." : "Atleta disciplinado."));
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [displayName, setDisplayName] = useState(() => localStorage.getItem(`gymfit_custom_name_${user.userId}`) || (user.firstName + ' ' + (user.lastName || '')));
    
    // Intentamos cargar avatar de localStorage, si no, puede ser null
    const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem(`gymfit_avatar_${user.userId}`) || null);
    const [uploadingImg, setLoadingImg] = useState(false);

    // --- ESTADOS DE ESTADÍSTICAS ---
    const [realStats, setRealStats] = useState({ totalSessions: 0, totalKg: 0, currentStreak: 0, weeklyActivity: [], historyData: [] });

    // --- 1. CARGA DE DATOS ---
    const loadRoutines = (targetClientId) => {
        const idToFetch = targetClientId || user.userId;
        
        // Si soy entrenador y el campo de búsqueda está vacío, no cargo nada aún
        if (user.role === 'Trainer' && !targetClientId) {
            setMyRoutines([]);
            return;
        }

        trainingService.getClientRoutines(idToFetch)
            .then(data => setMyRoutines(data))
            .catch(err => { 
                console.error(err); 
                setMyRoutines([]); 
            });
    };

    const loadTrainers = () => {
        chatService.getTrainers()
            .then(data => setTrainersList(data))
            .catch(err => console.error("Error cargando entrenadores", err));
    };

    const loadChat = (trainerId) => {
        chatService.getChatHistory(user.userId, trainerId)
            .then(msgs => setChatMessages(msgs))
            .catch(err => console.error("Error cargando chat:", err));
    };

    // Scroll al fondo cuando llegan mensajes nuevos
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Efecto Inicial
    useEffect(() => {
        setBio(localStorage.getItem(`gymfit_bio_${user.userId}`) || (user.role === 'Trainer' ? "Entrenador GymFit" : "Atleta en proceso"));
        setDisplayName(localStorage.getItem(`gymfit_custom_name_${user.userId}`) || user.firstName);
        setAvatarUrl(localStorage.getItem(`gymfit_avatar_${user.userId}`));

        if (user && user.role === 'Client') {
            loadRoutines(); 
            trainingService.getClientHistory(user.userId).then(logs => calculateRealStats(logs));
            loadTrainers(); 
        } else {
            setMyRoutines([]);
        }
    }, [user]);

    // Polling del Chat (Refresco cada 3s)
    useEffect(() => {
        let interval;
        if (selectedTrainer) {
            interval = setInterval(() => {
                loadChat(selectedTrainer._id);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [selectedTrainer]);

    // --- 2. LÓGICA DE ESTADÍSTICAS ---
    const calculateRealStats = (logs) => {
        if (!logs || logs.length === 0) return;
        const totalKg = logs.reduce((acc, log) => acc + (log.weightUsed * log.repsDone), 0);
        const uniqueDays = [...new Set(logs.map(log => new Date(log.date).toISOString().split('T')[0]))];
        const totalSessions = uniqueDays.length;
        
        let streak = 0;
        const sortedDays = uniqueDays.sort((a, b) => new Date(b) - new Date(a));
        if (sortedDays.length > 0) streak = 1; 
        
        const newWeeklyActivity = [ { day: 'L', kg: 0 }, { day: 'M', kg: 0 }, { day: 'X', kg: 0 }, { day: 'J', kg: 0 }, { day: 'V', kg: 0 }, { day: 'S', kg: 0 }, { day: 'D', kg: 0 } ];
        setRealStats({ 
            totalKg, 
            totalSessions, 
            currentStreak: streak, 
            weeklyActivity: newWeeklyActivity, 
            historyData: logs.slice(0, 10).map(l => ({ name: l.exerciseName.substring(0,3), kg: l.weightUsed })) 
        });
    };

    // --- 3. FUNCIONES DE PERFIL ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoadingImg(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            // 1. Subir a ImgBB
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY_IMGBB}`, { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.success) { 
                const newUrl = data.data.url;
                setAvatarUrl(newUrl); 
                // Guardar en localStorage para rapidez local
                localStorage.setItem(`gymfit_avatar_${user.userId}`, newUrl); 
                
                // 2. Guardar en Base de Datos (para que otros usuarios me vean)
                try {
                    await authService.updateAvatar(user.userId, newUrl);
                } catch(dbErr) {
                    console.error("No se pudo guardar en BD, solo local", dbErr);
                }
            }
        } catch (err) { console.error(err); } finally { setLoadingImg(false); }
    };

    const saveProfileChanges = () => { localStorage.setItem(`gymfit_custom_name_${user.userId}`, displayName); setIsEditingProfile(false); };
    const saveBio = () => { localStorage.setItem(`gymfit_bio_${user.userId}`, bio); setIsEditingBio(false); };
    const getInitials = () => displayName ? displayName[0].toUpperCase() : "U";
    const copyToClipboard = () => { navigator.clipboard.writeText(user.userId); alert('ID copiado al portapapeles.'); };

    // --- 4. FUNCIONES DE CHAT ---
    const handleSelectTrainer = (trainer) => {
        setSelectedTrainer(trainer);
        loadChat(trainer._id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTrainer) return;

        try {
            await chatService.sendMessage({
                senderId: user.userId,
                receiverId: selectedTrainer._id,
                content: newMessage
            });
            setNewMessage('');
            loadChat(selectedTrainer._id);
        } catch (err) {
            console.error(err);
        }
    };

    // --- 5. FUNCIONES DE ENTRENADOR (RUTINAS) ---
    const handleDeleteRoutine = async (routineId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta rutina permanentemente?")) return;
        try { 
            await trainingService.deleteRoutine(routineId); 
            loadRoutines(trainerSearchId || user.userId); 
            alert("Rutina eliminada correctamente ✅"); 
        } catch (err) { 
            alert(`Error al borrar: ${err.message || 'Error de conexión'}`); 
        }
    };
    
    const addExercise = () => { 
        if (!tempExercise.name) return; 
        setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, tempExercise] }); 
        setTempExercise({ name: '', sets: '', reps: '' }); 
    };
    
    const handleSaveRoutine = async () => { 
        if (newRoutine.exercises.length === 0) return alert("Agrega ejercicios."); 
        if (!newRoutine.clientId) return alert("Falta ID Cliente."); 
        
        try { 
            setLoading(true); 
            await trainingService.createRoutine({ ...newRoutine, trainerId: user.userId }); 
            alert('¡Rutina asignada exitosamente!'); 
            
            setTrainerSearchId(newRoutine.clientId); 
            loadRoutines(newRoutine.clientId); 
            
            setNewRoutine({ name: '', description: '', clientId: '', exercises: [] }); 
        } catch (err) { 
            alert(err.message || "Error al crear rutina"); 
        } finally { 
            setLoading(false); 
        } 
    };

    // --- 6. FUNCIONES PROGRESO (CLIENTE) ---
    const handleProgressChange = (rId, exName, field, val) => { 
        const key = `${rId}-${exName}`; 
        setProgressInputs(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } })); 
    };
    
    const saveProgress = async (rId, exName) => { 
        const key = `${rId}-${exName}`; 
        const inputs = progressInputs[key]; 
        if (!inputs?.weight || !inputs?.reps) return alert("Faltan datos (Kg y Reps)"); 
        
        try { 
            await trainingService.logProgress({ 
                clientId: user.userId, 
                routineId: rId, 
                exerciseName: exName, 
                weightUsed: Number(inputs.weight), 
                repsDone: Number(inputs.reps) 
            }); 
            alert('Guardado ✅'); 
            trainingService.getClientHistory(user.userId).then(logs => calculateRealStats(logs));
        } catch (err) { 
            alert(err.message); 
        } 
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
                        <div style={{overflow:'hidden'}}>
                            <h4 style={{whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}}>{displayName}</h4>
                            <p onClick={copyToClipboard} style={{cursor:'pointer', fontSize:'12px', color:'#888', display:'flex', alignItems:'center', gap:'5px'}}>
                                ID: {user.userId.substring(0,6)}... <Copy size={12}/>
                            </p>
                        </div>
                    </div>
                    <nav className="sidebar-nav">
                        <button className={`nav-item ${activeTab==='routines'?'active':''}`} onClick={()=>setActiveTab('routines')}>
                            <Dumbbell size={20}/> {user.role === 'Trainer' ? 'Gestión Rutinas' : 'Mis Rutinas'}
                        </button>
                        
                        {user.role === 'Client' && (
                            <>
                                <button className={`nav-item ${activeTab==='stats'?'active':''}`} onClick={()=>setActiveTab('stats')}>
                                    <Activity size={20}/> Estadísticas
                                </button>
                                <button className={`nav-item ${activeTab==='trainers'?'active':''}`} onClick={()=>setActiveTab('trainers')}>
                                    <Users size={20}/> Entrenadores
                                </button>
                            </>
                        )}
                        
                        <button className={`nav-item ${activeTab==='profile'?'active':''}`} onClick={()=>setActiveTab('profile')}>
                            <User size={20}/> Perfil
                        </button>
                    </nav>
                </aside>

                <main className="dashboard-content-area">
                    
                    {/* --- VISTA RUTINAS --- */}
                    {activeTab === 'routines' && (
                        <div className="fade-in">
                            <h2 className="page-title">{user.role === 'Trainer' ? 'Panel de Entrenador' : 'Mis Entrenamientos'}</h2>
                            {user.role === 'Trainer' ? (
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                                    
                                    {/* CREAR RUTINA */}
                                    <div className="routine-creator-box">
                                        <h3><PlusCircle size={18}/> Crear Rutina</h3>
                                        <div className="form-group" style={{marginBottom:'10px'}}>
                                            <input className="input-field" placeholder="Nombre Rutina" value={newRoutine.name} onChange={e=>setNewRoutine({...newRoutine, name:e.target.value})}/>
                                        </div>
                                        <div className="form-group" style={{marginBottom:'10px'}}>
                                            <input className="input-field" placeholder="ID Cliente Destino" value={newRoutine.clientId} onChange={e=>setNewRoutine({...newRoutine, clientId:e.target.value})}/>
                                        </div>
                                        
                                        <div className="add-exercise-box" style={{marginBottom:'10px', background:'#222', padding:'10px', borderRadius:'8px'}}>
                                            <div className="form-grid three-cols" style={{marginBottom:'10px'}}>
                                                <input className="input-field" placeholder="Ejercicio" value={tempExercise.name} onChange={e=>setTempExercise({...tempExercise, name:e.target.value})}/>
                                                <input className="input-field" placeholder="Sets" type="number" value={tempExercise.sets} onChange={e=>setTempExercise({...tempExercise, sets:e.target.value})}/>
                                                <input className="input-field" placeholder="Reps" type="number" value={tempExercise.reps} onChange={e=>setTempExercise({...tempExercise, reps:e.target.value})}/>
                                            </div>
                                            <button className="btn-secondary small full-width" style={{width:'100%'}} onClick={addExercise}>+ Agregar Ejercicio</button>
                                        </div>

                                        <ul style={{maxHeight:'100px', overflowY:'auto', listStyle:'none', padding:0, margin:'10px 0'}}>
                                            {newRoutine.exercises.map((e,i)=>(
                                                <li key={i} style={{fontSize:'12px', borderBottom:'1px solid #333', padding:'5px'}}>
                                                    {e.name} ({e.sets} sets x {e.reps})
                                                </li>
                                            ))}
                                        </ul>
                                        <button className="btn-primary" style={{width:'100%'}} onClick={handleSaveRoutine} disabled={loading}>
                                            {loading ? 'Guardando...' : 'Asignar Rutina'}
                                        </button>
                                    </div>

                                    {/* VER RUTINAS CLIENTE (Entrenador) */}
                                    <div className="routine-manager-box">
                                        <h3>Gestionar Clientes</h3>
                                        <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
                                            <input 
                                                className="input-field" 
                                                placeholder="Pegar ID Cliente..." 
                                                value={trainerSearchId} 
                                                onChange={(e)=>setTrainerSearchId(e.target.value)}
                                            />
                                            <button className="btn-secondary" onClick={()=>loadRoutines(trainerSearchId)}><Search size={18}/></button>
                                        </div>
                                        <div className="routines-list-mini" style={{maxHeight:'400px', overflowY:'auto'}}>
                                            {myRoutines.length === 0 ? <p style={{textAlign:'center', color:'#666'}}>Busca un cliente para ver sus rutinas.</p> : myRoutines.map(r => (
                                                <div key={r._id||r.id} className="routine-card mini" style={{padding:'10px', marginBottom:'10px'}}>
                                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                                        <h4 style={{margin:0}}>{r.name}</h4>
                                                        <button 
                                                            onClick={()=>handleDeleteRoutine(r._id||r.id)} 
                                                            className="btn-icon" 
                                                            style={{color:'#ff4d4d', background:'rgba(255,0,0,0.1)'}}
                                                        >
                                                            <Trash2 size={14}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* VISTA CLIENTE */
                                <div className="routines-grid">
                                    {myRoutines.length === 0 ? <p>No tienes rutinas asignadas.</p> : myRoutines.map(r => (
                                        <div key={r._id||r.id} className="routine-card">
                                            <div className="routine-header">
                                                <h3>{r.name}</h3>
                                                <span className="routine-date"><Calendar size={14}/> {new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {/* LISTA DE EJERCICIOS MEJORADA */}
                                            <div className="exercises-list-scroll">
                                                {r.exercises?.map((e,i)=>(
                                                    <div key={i} className="exercise-item">
                                                        {/* Info del ejercicio */}
                                                        <div className="exercise-info">
                                                            <strong className="ex-name">{e.name}</strong>
                                                            <span className="ex-meta">{e.sets} series × {e.reps} reps</span>
                                                        </div>

                                                        {/* Inputs y Botón */}
                                                        <div className="exercise-actions">
                                                            <input 
                                                                className="input-mini" 
                                                                placeholder="Kg" 
                                                                type="number"
                                                                onChange={ev=>handleProgressChange(r._id, e.name,'weight',ev.target.value)}
                                                            />
                                                            <input 
                                                                className="input-mini" 
                                                                placeholder="Reps" 
                                                                type="number"
                                                                onChange={ev=>handleProgressChange(r._id, e.name,'reps',ev.target.value)}
                                                            />
                                                            <button 
                                                                className="btn-action-save" 
                                                                title="Guardar progreso"
                                                                onClick={()=>saveProgress(r._id, e.name)}
                                                            >
                                                                <Check size={18} />
                                                            </button>
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

                    {/* --- VISTA ENTRENADORES Y CHAT (Solo Cliente) --- */}
                    {activeTab === 'trainers' && user.role === 'Client' && (
                        <div className="fade-in" style={{height: '100%'}}>
                            {!selectedTrainer ? (
                                <>
                                    <h2 className="page-title">Encuentra tu Entrenador</h2>
                                    <div className="trainers-grid">
                                        {trainersList.length === 0 ? <p>No hay entrenadores disponibles.</p> : trainersList.map(trainer => (
                                            <div key={trainer._id} className="trainer-card">
                                                {/* FOTO DE ENTRENADOR DINÁMICA */}
                                                {trainer.avatarUrl ? (
                                                    <img src={trainer.avatarUrl} alt="Trainer" className="trainer-avatar-img" style={{width:'60px', height:'60px', borderRadius:'50%', objectFit:'cover', margin:'0 auto 15px', display:'block', border: '2px solid #E50914'}} />
                                                ) : (
                                                    <div className="trainer-avatar-placeholder">{trainer.firstName?.[0]}</div>
                                                )}
                                                
                                                <h3>{trainer.firstName} {trainer.lastName}</h3>
                                                <p className="trainer-email">{trainer.email}</p>
                                                <button className="btn-primary" onClick={() => handleSelectTrainer(trainer)}>
                                                    <MessageSquare size={16} style={{marginRight: '8px'}}/> Contactar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="chat-interface-container">
                                    <div className="chat-header">
                                        <button className="btn-back" onClick={() => setSelectedTrainer(null)}><ChevronLeft size={20}/> Volver</button>
                                        <div className="chat-user-info">
                                            <h3>{selectedTrainer.firstName} {selectedTrainer.lastName}</h3>
                                            <span className="online-badge">Entrenador</span>
                                        </div>
                                    </div>
                                    
                                    <div className="chat-messages-area">
                                        {chatMessages.length === 0 ? (
                                            <div className="empty-chat">¡Saluda a tu posible entrenador! 👋</div>
                                        ) : (
                                            chatMessages.map((msg, idx) => (
                                                <div key={idx} className={`message-bubble ${msg.senderId === user.userId ? 'my-message' : 'other-message'}`}>
                                                    <p>{msg.content}</p>
                                                    <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            ))
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                                        <input 
                                            type="text" 
                                            placeholder="Escribe un mensaje..." 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            autoFocus
                                        />
                                        <button type="submit" disabled={!newMessage.trim()}><Send size={18}/></button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- VISTA ESTADÍSTICAS --- */}
                    {activeTab === 'stats' && user.role === 'Client' && (
                        <div className="fade-in">
                            <h2 className="page-title">Mi Progreso</h2>
                            <div className="stats-grid">
                                <div className="stat-card big" style={{height: 400}}>
                                    <h3>Últimos Registros</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={realStats.historyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333"/>
                                            <XAxis dataKey="name" stroke="#888"/>
                                            <YAxis stroke="#888"/>
                                            <Tooltip contentStyle={{backgroundColor:'#222', border:'none' }}/>
                                            <Line type="monotone" dataKey="kg" stroke="#E50914" strokeWidth={3} dot={{fill:'#E50914'}}/>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="stat-card small"><h3>Racha Actual</h3><p className="stat-number">{realStats.currentStreak} días</p></div>
                                <div className="stat-card small"><h3>Volumen Total</h3><p className="stat-number">{(realStats.totalKg/1000).toFixed(1)}k <small>kg</small></p></div>
                            </div>
                        </div>
                    )}

                    {/* --- VISTA PERFIL --- */}
                    {activeTab === 'profile' && (
                        <div className="fade-in profile-view">
                            <div className="profile-header-card">
                                <div className="profile-cover"></div>
                                <div className="profile-content">
                                    <div className="profile-avatar-wrapper">
                                        {avatarUrl ? <img src={avatarUrl} alt="P" className="profile-avatar-xl img-fit"/> : <div className="profile-avatar-xl">{getInitials()}</div>}
                                        {isEditingProfile && <label className="avatar-edit-overlay"><Camera size={24} color="white"/><input type="file" onChange={handleImageUpload} hidden/></label>}
                                        {uploadingImg && <div className="uploading-badge">Subiendo...</div>}
                                    </div>
                                    <div className="profile-names">
                                        {isEditingProfile ? <input className="input-field-transparent" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} autoFocus/> : <h1 style={{color:'white', margin:0}}>{displayName}</h1>}
                                        <span className="role-badge">{user.role}</span>
                                    </div>
                                    <div className="profile-actions">
                                        {isEditingProfile ? (
                                            <><button className="btn-icon-action save" onClick={saveProfileChanges}><Check size={18}/></button>
                                              <button className="btn-icon-action cancel" onClick={()=>setIsEditingProfile(false)}><X size={18}/></button></>
                                        ) : (
                                            <button className="btn-edit-profile" onClick={()=>setIsEditingProfile(true)}><Edit3 size={16}/> Editar Perfil</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="profile-grid-layout">
                                <div className="bio-card">
                                    <div className="card-header-flex"><h3>Biografía</h3><button className="btn-icon-small" onClick={()=>isEditingBio?saveBio():setIsEditingBio(true)}>{isEditingBio?<Save size={16}/>:<Edit3 size={16}/>}</button></div>
                                    {isEditingBio?<textarea className="input-field" rows="4" value={bio} onChange={e=>setBio(e.target.value)}/>:<p style={{color:'#ccc', lineHeight:'1.5'}}>{bio}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}