import React, { useMemo } from 'react';
import { 
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar
} from 'recharts';
import { Camera, Trophy, Flame, Dumbbell, Activity, CalendarDays, Zap } from 'lucide-react';

// Componente de Tooltip para el gráfico de barras (Volumen Semanal)
const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: '#111', border: '1px solid #E50914', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '14px' }}>
                <p className="label" style={{ fontWeight: 'bold' }}>{`Día ${label}`}</p>
                <p className="intro" style={{ color: '#0f0' }}>{`Volumen: ${Math.round(payload[0].value)} kg`}</p>
            </div>
        );
    }
    return null;
};

// Componente de Tooltip para el gráfico de líneas (Tendencia de Fuerza)
const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: '#111', border: '1px solid #E50914', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '14px' }}>
                <p className="label" style={{ fontWeight: 'bold' }}>{`Sesión: ${payload[0].payload.exerciseName}`}</p>
                <p className="intro" style={{ color: '#0f0' }}>{`Peso: ${payload[0].value} kg`}</p>
                <p className="desc" style={{ color: '#aaa', fontSize: '12px' }}>{`Fecha: ${label}`}</p>
            </div>
        );
    }
    return null;
};


export default function StatsView({ realStats }) {
    const photos = realStats.photos || [];

    // --- GENERACIÓN DEL HEATMAP CON DATOS REALES ---
    const heatmapBoxes = useMemo(() => {
        const boxes = [];
        const today = new Date();
        
        // Creamos un Set para búsqueda ultra rápida. 
        const activitySet = new Set(realStats.activityDates || []);

        // Generamos los últimos 100 días
        for (let i = 100; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // "YYYY-MM-DD"

            // La lógica para la intensidad del color podría ser más sofisticada, 
            // pero mantenemos simple: activo vs inactivo
            const isActive = activitySet.has(dateStr);
            const color = isActive ? '#E50914' : '#222'; 
            const opacity = isActive ? 1 : 0.4; // Menor opacidad para inactivo

            boxes.push(
                <div key={i} title={`${dateStr}: ${isActive ? 'Entrenaste' : 'Descanso'}`} style={{
                    width: '12px', height: '12px', borderRadius: '3px', 
                    backgroundColor: color, opacity: opacity,
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 0 5px rgba(229, 9, 20, 0.5)' : 'none',
                }}></div>
            );
        }
        return boxes;
    }, [realStats.activityDates]);

    // Prepara los datos para la gráfica de tendencia de fuerza, usando la fecha completa
    const forceTrendData = useMemo(() => {
        // historyData contiene el nombre, peso (kg) y ahora usaremos el índice como ID temporal para XAxis
        // En Dashboard.jsx, historyData es logs.slice(0, 20).reverse().map(l => ({ name: l.exerciseName.substring(0, 4), kg: l.weightUsed }));
        // Lo modificaremos aquí para usar la fecha completa.
        
        // Nota: Asegúrate que historyData en Dashboard.jsx también devuelva la fecha real:
        /* // En Dashboard.jsx:
        const historyData = logs.slice(0, 20).reverse().map(l => ({ 
            exerciseName: l.exerciseName, 
            kg: l.weightUsed, 
            date: new Date(l.date || l.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        }));
        */
        return (realStats.historyData || []).map((item, index) => ({
            ...item,
            id: index, // Usamos el índice como clave en el eje X para mantener el orden
            date: item.date // Asumiendo que ahora date contiene la fecha formateada ('27/nov')
        }));
    }, [realStats.historyData]);


    return (
        <div className="fade-in" style={{paddingBottom: '50px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h2 className="page-title" style={{marginBottom:0, color:'#E50914'}}>Análisis de Rendimiento 📊</h2>
                <div style={{fontSize:'12px', color:'#666'}}>Datos Reales</div>
            </div>
            
            <style jsx="true">{`
                .stat-card {
                    background: #141414;
                    padding: 25px;
                    border-radius: 12px;
                    border: 1px solid #222;
                    color: white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                }
                .stat-card h3 {
                    color: #E50914;
                    font-size: 16px;
                    margin-bottom: 15px;
                }
                .stat-card .stat-number {
                    font-size: 36px;
                    font-weight: 700;
                    margin: 0;
                    color: white;
                }
                .stats-grid > .stat-card.small {
                    border-left: 5px solid #E50914;
                    padding: 15px 25px;
                }
            `}</style>
            
            {/* --- GRID DE TARJETAS PRINCIPALES --- */}
            <div className="stats-grid" style={{marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px'}}>
                <div className="stat-card small">
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h3>Racha Actual</h3>
                        <Flame color={realStats.currentStreak > 0 ? "#FFD700" : "#666"} size={20}/>
                    </div>
                    <p className="stat-number">{realStats.currentStreak} <span style={{fontSize:'14px', color:'#888', fontWeight:'normal'}}>días</span></p>
                </div>
                
                <div className="stat-card small">
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h3>Volumen Total</h3>
                        <Dumbbell color="#E50914" size={20}/>
                    </div>
                    <p className="stat-number">{(realStats.totalKg/1000).toFixed(1)}k <span style={{fontSize:'14px', color:'#888', fontWeight:'normal'}}>kg</span></p>
                </div>

                <div className="stat-card small">
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h3>Sesiones</h3>
                        <Activity color="#E50914" size={20}/>
                    </div>
                    <p className="stat-number">{realStats.totalSessions}</p>
                </div>
            </div>

            {/* --- SECCIÓN DE GRÁFICOS AVANZADOS --- */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                
                {/* 1. Radar Chart (Músculos Reales) */}
                <div className="stat-card big" style={{height: 350}}>
                    <h3>Enfoque Muscular</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={realStats.radarData && realStats.radarData.length > 0 ? realStats.radarData : [{subject:'Sin datos', A:0, fullMark:100}]}>
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                            <Radar name="Ejercicios" dataKey="A" stroke="#E50914" strokeWidth={2} fill="#E50914" fillOpacity={0.4} />
                            <Tooltip contentStyle={{backgroundColor:'#111', border:'1px solid #333', color:'#fff'}} itemStyle={{color:'#E50914'}}/>
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Actividad Semanal (Barras Reales) */}
                <div className="stat-card big" style={{height: 350}}>
                    <h3>Volumen Semanal (kg)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={realStats.weeklyActivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="day" stroke="#666" tickLine={false} />
                            <YAxis stroke="#666" tickLine={false} tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                            <Tooltip cursor={{fill: '#333', opacity: 0.2}} content={<CustomBarTooltip />} />
                            <Bar dataKey="kg" fill="#E50914" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- RÉCORDS Y PROGRESO --- */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                
                {/* Tabla de Récords Reales */}
                <div className="stat-card" style={{height: 'auto', minHeight: '300px'}}>
                    <h3 style={{display:'flex', alignItems:'center', gap:'10px'}}><Trophy size={18} color="#FFD700"/> Récords Personales (PRs)</h3>
                    <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {realStats.personalRecords && realStats.personalRecords.length > 0 ? (
                            realStats.personalRecords.map((pr, idx) => (
                                <div key={idx} style={{
                                    display:'flex', 
                                    justifyContent:'space-between', 
                                    padding:'12px', 
                                    background:'#222', 
                                    borderRadius:'8px', 
                                    alignItems:'center',
                                    borderLeft: idx === 0 ? '4px solid #FFD700' : '4px solid #444',
                                }}>
                                    <span style={{color:'#ddd', fontSize:'15px', display:'flex', alignItems:'center', gap:'8px'}}>
                                        {idx === 0 && <Zap size={16} color="#FFD700"/>}
                                        {pr.name}
                                    </span>
                                    <span style={{color:'#E50914', fontWeight:'bold', fontSize:'16px'}}>{pr.weight} kg</span>
                                </div>
                            ))
                        ) : (
                            <p style={{color:'#666', fontSize:'14px', textAlign:'center', marginTop:'40px'}}>
                                Entrena fuerte para registrar tus récords aquí.
                            </p>
                        )}
                    </div>
                </div>

                {/* Gráfico Lineal de Progreso (Tendencia de Fuerza) */}
                <div className="stat-card" style={{height: '300px'}}>
                    <h3>Tendencia de Fuerza (Últimas Sesiones)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forceTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false}/>
                            {/* Mostramos el índice en el eje X para mantener el orden, pero usamos la fecha en el Tooltip */}
                            <XAxis 
                                dataKey="id" 
                                stroke="#666" 
                                tick={{fontSize: 10}} 
                                tickFormatter={(value) => forceTrendData[value] ? forceTrendData[value].date : ''}
                            />
                            <YAxis stroke="#666" domain={['dataMin', 'dataMax']} tickFormatter={(value) => `${value}kg`} tickLine={false}/>
                            {/* Usamos el CustomLineTooltip para mostrar el nombre del ejercicio y el peso */}
                            <Tooltip content={<CustomLineTooltip />} />
                            <Line 
                                type="monotone" 
                                dataKey="kg" 
                                stroke="#E50914" 
                                strokeWidth={2} 
                                dot={{r: 3, fill:'#E50914', stroke:'#E50914', strokeWidth: 1}} 
                                activeDot={{r: 6, fill:'#fff', stroke:'#E50914', strokeWidth: 2}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- MAPA DE CALOR REAL (Constancia) --- */}
            <div className="stat-card" style={{marginBottom: '40px'}}>
                <h3 style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                    <CalendarDays size={18} color="#888"/> Constancia Real (Últimos 101 Días)
                </h3>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center'}}>
                    {heatmapBoxes}
                </div>
            </div>

            {/* --- GALERÍA DE PROGRESO --- */}
            <h3 style={{color: 'white', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px', color:'#E50914'}}>
                <Camera color="#E50914"/> Galería de Resultados
            </h3>
            
            {photos && photos.length > 0 ? (
                <div className="photos-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px'}}>
                    {photos.map((photo, idx) => (
                        <div key={idx} className="photo-card fade-in" style={{
                            position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1/1', 
                            border: '1px solid #333', cursor:'pointer', transition: 'transform 0.2s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <img src={photo.url} alt="Progreso" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, width: '100%', 
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', 
                                color: 'white', fontSize: '10px', padding: '8px', textAlign: 'center'
                            }}>
                                {new Date(photo.date).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center', color: '#666', border: '1px dashed #333'}}>
                    <Camera size={40} style={{marginBottom:'10px', opacity:0.5}}/>
                    <p>Completa una rutina y sube una foto para llenar tu galería.</p>
                </div>
            )}
        </div>
    );
}