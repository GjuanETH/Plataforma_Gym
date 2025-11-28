import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, Save, Ruler, Weight, Activity, ChevronLeft, Calendar, FileText, Target } from 'lucide-react';
import { assessmentService } from '../../api';

export default function AssessmentsView({ user, linkedClients }) {
    
    // Estados generales
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentAssessment, setCurrentAssessment] = useState(null);

    // Formulario (Valores iniciales)
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        bodyFat: '',
        goal: 'Perdida de Peso',
        dietType: 'Flexible',
        observations: ''
    });

    // Función para cargar datos de la API (Encapsulada en useCallback)
    const loadAssessmentData = useCallback(async (clientId) => {
        setLoading(true);
        try {
            const data = await assessmentService.getLatestAssessment(clientId);
            if (data) {
                setCurrentAssessment(data);
                // Solo precargar el formulario si es el entrenador el que ve el registro
                if (user.role === 'Trainer') {
                    setFormData({
                        weight: data.weight || '',
                        height: data.height || '',
                        bodyFat: data.bodyFat || '',
                        goal: data.goal || 'Perdida de Peso',
                        dietType: data.dietType || 'Flexible',
                        observations: data.observations || ''
                    });
                }
            } else {
                setCurrentAssessment(null);
                // Resetear formulario si no hay datos y es el entrenador
                if (user.role === 'Trainer') setFormData({ weight: '', height: '', bodyFat: '', goal: 'Perdida de Peso', dietType: 'Flexible', observations: '' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user.role]); // Depende del rol del usuario

    // --- EFECTO: CARGAR DATOS AL INICIO ---
    useEffect(() => {
        if (user.role === 'Client') {
            loadAssessmentData(user.userId);
        }
    }, [user.role, user.userId, loadAssessmentData]); // Incluimos loadAssessmentData

    // ... (El resto de las funciones se mantienen igual)
    const handleSelectClient = (client) => {
        setSelectedClient(client);
        loadAssessmentData(client._id);
    };

    const handleBack = () => {
        setSelectedClient(null);
        setCurrentAssessment(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            clientId: selectedClient._id,
            trainerId: user.userId,
            date: new Date(),
            ...formData
        };

        try {
            const saved = await assessmentService.saveAssessment(payload);
            setCurrentAssessment(saved); 
            alert("¡Valoración guardada correctamente!");
        } catch (error) {
            console.error("Error API:", error);
            // Simulación visual en caso de error (o mientras se levanta el backend)
            const simulatedData = {...payload, date: new Date().toISOString()};
            setCurrentAssessment(simulatedData);
            alert("Guardado (Simulación: Si el backend da 404, revisa que el servidor 'training-services' esté corriendo).");
        } finally {
            setLoading(false);
        }
    };

    const calculateIMC = (w, h) => {
        if (!w || !h) return 0;
        const hM = h / 100; 
        return (w / (hM * hM)).toFixed(1);
    };

    // ----------------------------------------------------------------------
    // VISTA 1: ENTRENADOR - LISTA DE CLIENTES
    // ----------------------------------------------------------------------
    if (user.role === 'Trainer' && !selectedClient) {
        const filteredClients = linkedClients?.filter(c => 
            c.firstName.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

        return (
            <div className="fade-in">
                <h2 className="page-title">Realizar Valoración</h2>
                <div style={{marginBottom:'25px', position:'relative'}}>
                    <Search size={18} style={{position:'absolute', left:'15px', top:'14px', color:'#666'}}/>
                    <input type="text" className="input-field" style={{paddingLeft:'45px'}} placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                
                <div className="trainers-grid">
                    {filteredClients.map(client => (
                        <div key={client._id} className="trainer-card" onClick={() => handleSelectClient(client)} style={{cursor:'pointer'}}>
                            
                            {/* CAMBIO AQUÍ: LÓGICA DE AVATAR */}
                            {client.avatarUrl ? (
                                <img 
                                    src={client.avatarUrl} 
                                    alt="Cliente" 
                                    // Reutilizamos estilos inline para asegurar consistencia
                                    style={{
                                        width:'80px', 
                                        height:'80px', 
                                        borderRadius:'50%', 
                                        objectFit:'cover', 
                                        marginBottom:'15px', 
                                        border:'3px solid #E50914',
                                        display: 'block',
                                        margin: '0 auto 15px auto'
                                    }}
                                />
                            ) : (
                                <div className="trainer-avatar-placeholder" style={{background:'#E50914', border:'none'}}>
                                    {client.firstName?.[0]?.toUpperCase()}
                                </div>
                            )}

                            <h3>{client.firstName} {client.lastName}</h3>
                            <button className="btn-primary" style={{width:'100%', marginTop:'15px'}}>Valorar Cliente</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // VISTA 2: FORMULARIO Y DATOS
    // ----------------------------------------------------------------------
    const isTrainer = user.role === 'Trainer';
    // Si es entrenador, usamos formData (para editar), si es cliente, usamos currentAssessment (para ver)
    const displayData = isTrainer ? formData : currentAssessment; 
    
    const StatsCard = () => (
        <div className="profile-card fade-in" style={{background:'#141414', padding:'30px', borderRadius:'15px', border:'1px solid #222', marginTop:'20px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', borderBottom:'1px solid #333', paddingBottom:'15px'}}>
                <h3 style={{margin:0, color:'white'}}>Estado Físico Actual</h3>
                <span style={{color:'#666', fontSize:'13px', display:'flex', alignItems:'center', gap:'5px'}}>
                    <Calendar size={14}/> {currentAssessment?.date ? new Date(currentAssessment.date).toLocaleDateString() : 'Sin registros'}
                </span>
            </div>

            {/* Renderiza el mensaje de 'Sin registros' si NO hay datos Y es Cliente */}
            {!currentAssessment && !isTrainer ? ( 
                <div style={{textAlign:'center', padding:'40px', color:'#666'}}>
                    <Activity size={48} style={{marginBottom:'10px', opacity:0.5}}/>
                    <p>Tu entrenador aún no ha cargado tu valoración física.</p>
                </div>
            ) : (
                // Si SÍ hay datos (currentAssessment) O si es entrenador (isTrainer), muestra la tarjeta
                <>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'20px', marginBottom:'30px'}}>
                        <div className="stat-box" style={{background:'#0a0a0a', padding:'20px', borderRadius:'12px', border:'1px solid #333', textAlign:'center'}}>
                            <Weight size={24} color="#E50914" style={{marginBottom:'10px'}}/>
                            <div style={{fontSize:'24px', fontWeight:'bold', color:'white'}}>{displayData?.weight || '-'} <span style={{fontSize:'14px', color:'#666'}}>kg</span></div>
                            <div style={{fontSize:'12px', color:'#888'}}>Peso</div>
                        </div>
                        <div className="stat-box" style={{background:'#0a0a0a', padding:'20px', borderRadius:'12px', border:'1px solid #333', textAlign:'center'}}>
                            <Ruler size={24} color="#E50914" style={{marginBottom:'10px'}}/>
                            <div style={{fontSize:'24px', fontWeight:'bold', color:'white'}}>{displayData?.height || '-'} <span style={{fontSize:'14px', color:'#666'}}>cm</span></div>
                            <div style={{fontSize:'12px', color:'#888'}}>Altura</div>
                        </div>
                        <div className="stat-box" style={{background:'#0a0a0a', padding:'20px', borderRadius:'12px', border:'1px solid #333', textAlign:'center'}}>
                            <Activity size={24} color="#E50914" style={{marginBottom:'10px'}}/>
                            <div style={{fontSize:'24px', fontWeight:'bold', color:'white'}}>{displayData?.bodyFat || '-'} <span style={{fontSize:'14px', color:'#666'}}>%</span></div>
                            <div style={{fontSize:'12px', color:'#888'}}>Grasa Corporal</div>
                        </div>
                        <div className="stat-box" style={{background:'#0a0a0a', padding:'20px', borderRadius:'12px', border:'1px solid #333', textAlign:'center'}}>
                            <div style={{fontSize:'24px', fontWeight:'bold', color: calculateIMC(displayData?.weight, displayData?.height) > 25 ? '#FFC107' : '#00E676'}}>
                                {calculateIMC(displayData?.weight, displayData?.height)}
                            </div>
                            <div style={{fontSize:'12px', color:'#888'}}>IMC (Est)</div>
                        </div>
                    </div>

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                        <div style={{background:'#0a0a0a', padding:'20px', borderRadius:'12px', border:'1px solid #333'}}>
                            <h4 style={{margin:'0 0 10px 0', color:'#E50914', display:'flex', alignItems:'center', gap:'8px'}}><Target size={16}/> Objetivo</h4>
                            <p style={{margin:0, color:'#ddd'}}>{displayData?.goal || '-'}</p>
                        </div>
                        <div style={{background:'#0a0a0a', padding:'20px', borderRadius:'12px', border:'1px solid #333'}}>
                            <h4 style={{margin:'0 0 10px 0', color:'#E50914', display:'flex', alignItems:'center', gap:'8px'}}><FileText size={16}/> Alimentación</h4>
                            <p style={{margin:0, color:'#ddd'}}>{displayData?.dietType || '-'}</p>
                        </div>
                    </div>

                    {displayData?.observations && (
                        <div style={{marginTop:'20px', background:'#0a0a0a', padding:'20px', borderRadius:'12px', border:'1px solid #333'}}>
                            <h4 style={{margin:'0 0 10px 0', color:'#666'}}>Observaciones del Entrenador</h4>
                            <p style={{margin:0, color:'#ccc', fontStyle:'italic'}}>"{displayData.observations}"</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    // Si es entrenador y está seleccionando cliente, muestra la lista (Vista 1)
    if (user.role === 'Trainer' && !selectedClient) {
        // Redefinimos la lógica de listado de clientes aquí
        const filteredClients = linkedClients?.filter(c => 
            c.firstName.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

        return (
            <div className="fade-in">
                <h2 className="page-title">Realizar Valoración</h2>
                <div style={{marginBottom:'25px', position:'relative'}}>
                    <Search size={18} style={{position:'absolute', left:'15px', top:'14px', color:'#666'}}/>
                    <input type="text" className="input-field" style={{paddingLeft:'45px'}} placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                
                <div className="trainers-grid">
                    {filteredClients.map(client => (
                        <div key={client._id} className="trainer-card" onClick={() => handleSelectClient(client)} style={{cursor:'pointer'}}>
                            
                            {client.avatarUrl ? (
                                <img 
                                    src={client.avatarUrl} 
                                    alt="Cliente" 
                                    style={{
                                        width:'80px', 
                                        height:'80px', 
                                        borderRadius:'50%', 
                                        objectFit:'cover', 
                                        marginBottom:'15px', 
                                        border:'3px solid #E50914',
                                        display: 'block',
                                        margin: '0 auto 15px auto'
                                    }}
                                />
                            ) : (
                                <div className="trainer-avatar-placeholder" style={{background:'#E50914', border:'none'}}>
                                    {client.firstName?.[0]?.toUpperCase()}
                                </div>
                            )}

                            <h3>{client.firstName} {client.lastName}</h3>
                            <button className="btn-primary" style={{width:'100%', marginTop:'15px'}}>Valorar Cliente</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    // VISTA 2: Formulario de Entrenador (o solo tarjeta para Cliente)
    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                {isTrainer && (
                    <button className="btn-icon" onClick={handleBack} style={{background:'#222', border:'1px solid #333'}}>
                        <ChevronLeft size={20}/>
                    </button>
                )}
                <h2 className="page-title" style={{ margin: 0, border: 0, padding: 0 }}>
                    {isTrainer ? `Valoración de ${selectedClient.firstName}` : 'Mis Valoraciones'}
                </h2>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: isTrainer ? '1fr 1fr' : '1fr', gap: '30px'}}>
                {isTrainer && (
                    <div className="routine-creator-box fade-in">
                        <h3 style={{marginTop:0, marginBottom:'20px', color:'white'}}>Ingresar Datos</h3>
                        <form onSubmit={handleSave}>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'15px'}}>
                                <div>
                                    <label style={{display:'block', color:'#888', fontSize:'12px', marginBottom:'5px'}}>Peso (kg)</label>
                                    <input type="number" className="input-field" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="0.0"/>
                                </div>
                                <div>
                                    <label style={{display:'block', color:'#888', fontSize:'12px', marginBottom:'5px'}}>Altura (cm)</label>
                                    <input type="number" className="input-field" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="0"/>
                                </div>
                            </div>
                            <div style={{marginBottom:'15px'}}>
                                <label style={{display:'block', color:'#888', fontSize:'12px', marginBottom:'5px'}}>% Grasa Corporal</label>
                                <input type="number" className="input-field" value={formData.bodyFat} onChange={e => setFormData({...formData, bodyFat: e.target.value})} placeholder="0%"/>
                            </div>
                            <div style={{marginBottom:'15px'}}>
                                <label style={{display:'block', color:'#888', fontSize:'12px', marginBottom:'5px'}}>Objetivo Principal</label>
                                <select className="input-field" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})}>
                                    <option>Pérdida de Peso</option>
                                    <option>Hipertrofia (Masa Muscular)</option>
                                    <option>Definición</option>
                                    <option>Fuerza</option>
                                    <option>Resistencia</option>
                                </select>
                            </div>
                            <div style={{marginBottom:'15px'}}>
                                <label style={{display:'block', color:'#888', fontSize:'12px', marginBottom:'5px'}}>Tipo de Alimentación</label>
                                <input type="text" className="input-field" value={formData.dietType} onChange={e => setFormData({...formData, dietType: e.target.value})} placeholder="Ej: Flexible, Keto, Alta en Carb..."/>
                            </div>
                            <div style={{marginBottom:'25px'}}>
                                <label style={{display:'block', color:'#888', fontSize:'12px', marginBottom:'5px'}}>Observaciones</label>
                                <textarea className="input-field" rows="3" value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} style={{resize:'none'}} placeholder="Notas sobre lesiones, progresos, etc..."/>
                            </div>
                            <button type="submit" className="btn-primary full-width" disabled={loading}>
                                <Save size={18} style={{marginRight:'8px'}}/> {loading ? 'Guardando...' : 'Guardar Valoración'}
                            </button>
                        </form>
                    </div>
                )}
                <div>
                    {isTrainer && <h4 style={{color:'#666', marginBottom:'10px'}}>Vista Previa del Cliente</h4>}
                    <StatsCard />
                </div>
            </div>
        </div>
    );
}