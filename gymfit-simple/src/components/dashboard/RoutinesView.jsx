import React, { useState, useEffect } from 'react';
import { Plus, Play, Trash2, Dumbbell, Save, X, Calendar, BrainCircuit, User, ChevronLeft, Search, MessageSquare, UserPlus, Send } from 'lucide-react';
import { trainingService, clientService } from '../../api';

export default function RoutinesView({ user, myRoutines, loadRoutines, startWorkoutSession, linkedClients, onActivateZenMode }) {
    
    const [selectedClient, setSelectedClient] = useState(null); 
    const [searchTerm, setSearchTerm] = useState(''); 
    
    // Estado para invitar cliente
    const [inviteId, setInviteId] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    // Estados para Crear Rutina
    const [isCreating, setIsCreating] = useState(false);
    const [newRoutineName, setNewRoutineName] = useState('');
    const [newRoutineNotes, setNewRoutineNotes] = useState(''); 
    const [newExercises, setNewExercises] = useState([{ name: '', sets: 3 }]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user.role === 'Client') {
            loadRoutines(user.userId);
        }
    }, [user, loadRoutines]);

    // --- LÓGICA DE ENTRENADOR: VINCULAR CLIENTE ---
    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!inviteId.trim()) return;

        setIsInviting(true);
        try {
            await clientService.sendRequest(user.userId, inviteId.trim());
            alert("¡Solicitud enviada! El cliente debe aceptarla en su perfil.");
            setInviteId('');
        } catch (error) {
            console.error(error);
            const msg = error.message || "Error al enviar solicitud. Verifica que el ID sea correcto.";
            alert(msg);
        } finally {
            setIsInviting(false);
        }
    };

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        loadRoutines(client._id); 
        setSearchTerm('');
    };

    const handleBackToClients = () => {
        setSelectedClient(null);
        setNewRoutineName('');
        setNewExercises([{ name: '', sets: 3 }]);
    };

    // --- FUNCIONES DEL CREADOR DE RUTINAS ---
    const handleAddExerciseRow = () => setNewExercises([...newExercises, { name: '', sets: 3 }]);
    
    const handleRemoveExerciseRow = (index) => {
        const updated = [...newExercises];
        updated.splice(index, 1);
        setNewExercises(updated);
    };

    const handleExerciseChange = (index, field, value) => {
        const updated = [...newExercises];
        updated[index][field] = value;
        setNewExercises(updated);
    };

    // 🎯 FUNCIÓN handleSaveRoutine CORREGIDA (SOLUCIONA EL ERROR 400) 🎯
    const handleSaveRoutine = async () => {
        if (!newRoutineName.trim()) return alert("Ponle un nombre a la rutina");
        if (newExercises.some(ex => !ex.name.trim())) return alert("Completa los nombres de los ejercicios");

        // 1. DEFINICIÓN DE LOS IDs NECESARIOS
        // ID del cliente a quien se asigna la rutina (puede ser él mismo)
        const clientId = user.role === 'Trainer' ? selectedClient?._id : user.userId;
        
        // ID de la persona que ASIGNA/CREA la rutina (siempre el usuario logueado)
        const trainerIdToSend = user.userId; 

        if (!clientId || !trainerIdToSend) {
            // Este alert ya no debería aparecer si el usuario está logueado
            return alert("Error: Faltan IDs de usuario/cliente para asignar la rutina."); 
        }

        setIsSaving(true);
        try {
            const routineData = {
                // 👇 ENVÍA AMBOS IDs AL BACKEND (trainerIdToSend ahora está definido)
                clientId: clientId,
                trainerId: trainerIdToSend, // <--- CAMBIO CRUCIAL PARA LA VALIDACIÓN DEL BACKEND
                name: newRoutineName,
                description: newRoutineNotes,
                exercises: newExercises,
                createdBy: user.role 
            };

            await trainingService.createRoutine(routineData);
            
            // Lógica de éxito
            loadRoutines(clientId);
            setIsCreating(false);
            setNewRoutineName('');
            setNewRoutineNotes('');
            setNewExercises([{ name: '', sets: 3 }]);
            alert("¡Rutina asignada con éxito!");

        } catch (error) {
            console.error(error);
            // Mostrar el mensaje de error específico devuelto por el backend (400 Bad Request)
            const msg = error.response?.data?.message || "Error al crear la rutina";
            alert(msg); 
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRoutine = async (routineId) => {
        if (!window.confirm("¿Seguro que quieres borrar esta rutina?")) return;
        try {
            await trainingService.deleteRoutine(routineId);
            const targetId = user.role === 'Trainer' ? selectedClient?._id : user.userId;
            loadRoutines(targetId);
        } catch (error) {
            console.error(error);
            alert("Error al borrar");
        }
    };

    // --------------------------------------------------------------------------------
    // VISTA 1: FORMULARIO DE CREACIÓN
    // --------------------------------------------------------------------------------
    if (isCreating) {
        return (
            <div className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 className="page-title" style={{ margin: 0 }}>
                        {user.role === 'Trainer' ? `Asignar a ${selectedClient?.firstName}` : 'Nueva Rutina'}
                    </h2>
                    <button className="btn-secondary" onClick={() => setIsCreating(false)}>
                        <X size={18} style={{ marginRight: '8px' }} /> Cancelar
                    </button>
                </div>

                <div className="routine-creator-box">
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '10px', fontSize: '14px' }}>Nombre de la Rutina</label>
                        <input type="text" className="input-field" placeholder="Ej: Hipertrofia Espalda" value={newRoutineName} onChange={(e) => setNewRoutineName(e.target.value)} autoFocus />
                    </div>

                    <div className="input-group" style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '10px', fontSize: '14px' }}>Observaciones / Instrucciones</label>
                        <textarea className="input-field" rows="2" placeholder="Ej: Descansar 2 min entre series pesadas..." value={newRoutineNotes} onChange={(e) => setNewRoutineNotes(e.target.value)} style={{resize:'none'}} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '15px', fontSize: '14px' }}>Ejercicios</label>
                        {newExercises.map((ex, index) => (
                            <div key={index} className="builder-item fade-in">
                                <div className="builder-header">
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ background: '#222', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{index + 1}</span>
                                        Ejercicio
                                    </h4>
                                    {newExercises.length > 1 && (
                                        <button onClick={() => handleRemoveExerciseRow(index)} className="btn-icon" style={{ color: '#E50914' }}><Trash2 size={16} /></button>
                                    )}
                                </div>
                                <div className="builder-row">
                                    <div style={{ flex: 1 }}>
                                        <input type="text" className="input-field" placeholder="Nombre ejercicio..." value={ex.name} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)} />
                                    </div>
                                    <div style={{ width: '100px', textAlign: 'center' }}>
                                        <div className="input-group-label">
                                            <label>Series</label>
                                            <input type="number" className="input-mini" value={ex.sets} onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="btn-secondary full-width" onClick={handleAddExerciseRow} style={{ marginBottom: '30px', borderStyle: 'dashed' }}>
                        <Plus size={18} /> Agregar otro ejercicio
                    </button>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                        <button className="btn-secondary" onClick={() => setIsCreating(false)}>Cancelar</button>
                        <button className="btn-primary" onClick={handleSaveRoutine} disabled={isSaving}>
                            <Save size={18} /> {isSaving ? 'Guardando...' : 'Asignar Rutina'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --------------------------------------------------------------------------------
    // VISTA 2: LISTA DE CLIENTES + VINCULAR (SOLO ENTRENADOR)
    // --------------------------------------------------------------------------------
    if (user.role === 'Trainer' && !selectedClient) {
        const filteredClients = linkedClients.filter(c => 
            c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="fade-in">
                <h2 className="page-title">Gestión de Clientes</h2>
                
                <div style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)', padding:'25px', borderRadius:'16px', border:'1px solid #333', marginBottom:'30px', boxShadow:'0 10px 30px rgba(0,0,0,0.3)'}}>
                    <h3 style={{marginTop:0, fontSize:'16px', display:'flex', alignItems:'center', gap:'10px', color:'white'}}>
                        <UserPlus size={20} color="#E50914"/> Vincular Nuevo Cliente
                    </h3>
                    <p style={{color:'#888', fontSize:'13px', margin:'5px 0 15px'}}>Ingresa el ID único de tu cliente para enviarle una solicitud de entrenamiento.</p>
                    
                    <form onSubmit={handleSendInvite} style={{display:'flex', gap:'10px'}}>
                        <input 
                            type="text" 
                            className="input-field" 
                            style={{flex:1, background:'#000', borderColor:'#444'}}
                            placeholder="Pega aquí el ID del cliente..." 
                            value={inviteId}
                            onChange={(e) => setInviteId(e.target.value)}
                        />
                        <button type="submit" className="btn-primary" style={{width:'auto', padding:'0 25px'}} disabled={isInviting || !inviteId.trim()}>
                             {isInviting ? 'Enviando...' : <><Send size={16}/> Enviar Solicitud</>}
                        </button>
                    </form>
                </div>

                <div style={{marginBottom:'25px', position:'relative'}}>
                    <Search size={18} style={{position:'absolute', left:'15px', top:'14px', color:'#666'}}/>
                    <input type="text" className="input-field" style={{paddingLeft:'45px'}} placeholder="Buscar cliente por nombre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>

                {linkedClients.length === 0 ? (
                    <div style={{textAlign:'center', padding:'40px', color:'#666'}}>
                        <User size={48} style={{marginBottom:'10px', opacity:0.5}}/>
                        <p>No tienes clientes activos. ¡Vincula uno arriba!</p>
                    </div>
                ) : (
                    <div className="trainers-grid">
                        {filteredClients.map(client => (
                            <div key={client._id} className="trainer-card" onClick={() => handleSelectClient(client)} style={{cursor:'pointer'}}>
                                {/* AQUÍ ESTABA EL ERROR: Ahora comprueba si hay avatarUrl */}
                                {client.avatarUrl ? (
                                    <img 
                                        src={client.avatarUrl} 
                                        alt="Cliente" 
                                        className="trainer-avatar-img" // Usa la misma clase CSS que ya tienes
                                        style={{width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover', marginBottom:'15px', border:'3px solid #E50914'}}
                                    />
                                ) : (
                                    <div className="trainer-avatar-placeholder" style={{background:'#E50914', border:'none'}}>
                                        {client.firstName?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                
                                <h3>{client.firstName} {client.lastName}</h3>
                                <p className="trainer-email" style={{color:'#666', fontSize:'13px', margin:'5px 0 15px'}}>{client.email}</p>
                                <button className="btn-primary" style={{width:'100%', marginTop:'auto'}}>Gestionar Rutinas</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --------------------------------------------------------------------------------
    // VISTA 3: LISTA DE RUTINAS
    // --------------------------------------------------------------------------------
    const isTrainerViewingClient = user.role === 'Trainer' && selectedClient;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    {isTrainerViewingClient && (
                        <button className="btn-icon" onClick={handleBackToClients} style={{background:'#222', border:'1px solid #333'}}><ChevronLeft size={20}/></button>
                    )}
                    <h2 className="page-title" style={{ margin: 0, border:0, padding:0 }}>
                        {isTrainerViewingClient ? `Rutinas de ${selectedClient.firstName}` : 'Mis Entrenamientos'}
                    </h2>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    {user.role === 'Client' && (
                        <button className="btn-secondary" onClick={onActivateZenMode} style={{ color: '#88BFFF', borderColor: '#88BFFF' }}>
                            <BrainCircuit size={18} style={{ marginRight: '8px' }} /> Modo Zen
                        </button>
                    )}
                    <button className="btn-primary" onClick={() => setIsCreating(true)}>
                        <Plus size={18} /> {user.role === 'Trainer' ? 'Asignar Rutina' : 'Nueva Rutina'}
                    </button>
                </div>
            </div>

            <div className="routines-grid">
                {myRoutines.length === 0 && (
                    <div className="empty-state-builder" onClick={() => setIsCreating(true)}>
                        <Dumbbell size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                        <h3>{isTrainerViewingClient ? 'Este cliente no tiene rutinas' : 'No tienes rutinas aún'}</h3>
                        <p>{isTrainerViewingClient ? 'Asigna la primera rutina personalizada para tu cliente.' : 'Crea tu primera rutina para empezar.'}</p>
                        <span style={{ color: '#E50914', fontWeight: 'bold', marginTop: '10px', display: 'block' }}>{isTrainerViewingClient ? 'Asignar ahora →' : 'Crear ahora →'}</span>
                    </div>
                )}

                {myRoutines.map(routine => (
                    <div key={routine._id} className="routine-card clickable">
                        <div className="routine-header">
                            <div>
                                <h3>{routine.name}</h3>
                                <div className="routine-date"><Calendar size={12} /> {routine.exercises.length} Ejercicios</div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleDeleteRoutine(routine._id); }} title="Eliminar rutina"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        
                        {routine.description && (
                            <p style={{fontSize:'12px', color:'#888', fontStyle:'italic', margin:'0 0 10px 0'}}>
                                <MessageSquare size={10} style={{marginRight:'5px'}}/> "{routine.description.length > 50 ? routine.description.substring(0,50)+'...' : routine.description}"
                            </p>
                        )}

                        <div className="routine-preview-list">
                            {routine.exercises.slice(0, 3).map((ex, i) => (
                                <span key={i}>{ex.name} <small style={{color:'#666'}}>({ex.sets} series)</small></span>
                            ))}
                            {routine.exercises.length > 3 && <span style={{ color: '#666', fontStyle: 'italic', paddingLeft:0 }}>...y {routine.exercises.length - 3} más</span>}
                        </div>

                        {user.role === 'Client' ? (
                            <button className="btn-primary" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); startWorkoutSession(routine); }}>
                                <Play size={16} fill="currentColor" style={{ marginRight: '8px' }} /> EMPEZAR
                            </button>
                        ) : (
                            <div style={{marginTop:'auto', textAlign:'center', fontSize:'12px', color:'#666', borderTop:'1px solid #222', paddingTop:'10px'}}>Rutina asignada</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}