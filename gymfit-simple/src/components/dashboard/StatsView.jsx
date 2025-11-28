import React, { useMemo } from 'react';
import { 
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar
} from 'recharts';
import { Camera, Trophy, Flame, Dumbbell, Activity, CalendarDays, Zap } from 'lucide-react';

// ===================================
// Componentes de Tooltip Personalizados
// ===================================

// Tooltip para el gráfico de barras (Volumen Semanal)
const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Asegúrate de usar las unidades correctas
        const volumeKg = Math.round(payload[0].value);
        return (
            <div className="custom-tooltip">
                <p className="label">{`Día ${label}`}</p>
                <p className="intro" style={{ color: '#0f0' }}>{`Volumen: ${volumeKg} kg`}</p>
            </div>
        );
    }
    return null;
};

// Tooltip para el gráfico de líneas (Tendencia de Fuerza)
const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // 'label' es el id (índice), el dato real está en payload[0].payload
        const data = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <p className="label">{`Sesión: ${data.exerciseName || 'N/A'}`}</p>
                <p className="intro" style={{ color: '#0f0' }}>{`Peso: ${data.kg} kg`}</p>
                <p className="desc">{`Fecha: ${data.date || 'N/A'}`}</p>
            </div>
        );
    }
    return null;
};


// ===================================
// Componente Principal: StatsView
// ===================================

export default function StatsView({ realStats }) {
    
    // --- LÓGICA DE FILTRADO Y PREPARACIÓN DE DATOS ---

    // 🎯 Filtramos realStats.historyData para obtener las fotos de progreso
    const photos = useMemo(() => {
        if (!realStats.historyData) return [];

        return realStats.historyData
            .filter(log => log.photoUrl) // Mantenemos solo los logs que tienen una URL de foto
            .map(log => ({ 
                url: log.photoUrl, 
                date: log.date // Usamos la fecha del log
            }));

    }, [realStats.historyData]);


    // --- GENERACIÓN DEL HEATMAP CON DATOS REALES ---
    const heatmapBoxes = useMemo(() => {
        const boxes = [];
        const today = new Date();
        
        // Creamos un Set para búsqueda ultra rápida. 
        // Aseguramos que activityDates es un array
        const activitySet = new Set(realStats.activityDates || []);

        // Generamos los últimos 100 días (101 cajas incluyendo el día actual)
        for (let i = 100; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            // Formato universal ISO para la comparación
            const dateStr = d.toISOString().split('T')[0]; 

            const isActive = activitySet.has(dateStr);
            const color = isActive ? '#E50914' : '#222'; 
            const opacity = isActive ? 1 : 0.4;

            boxes.push(
                <div 
                    key={i} 
                    title={`${dateStr}: ${isActive ? 'Entrenaste' : 'Descanso'}`} 
                    style={{
                        width: '12px', height: '12px', borderRadius: '3px', 
                        backgroundColor: color, opacity: opacity,
                        transition: 'all 0.3s ease',
                        boxShadow: isActive ? '0 0 5px rgba(229, 9, 20, 0.5)' : 'none',
                    }}
                ></div>
            );
        }
        return boxes;
    }, [realStats.activityDates]);

    // Prepara los datos para la gráfica de tendencia de fuerza
    const forceTrendData = useMemo(() => {
        // historyData contiene el nombre, peso (kg) y la fecha
        return (realStats.historyData || [])
            .filter(item => item.kg !== undefined && item.kg !== null) // Filtramos datos sin peso
            .map((item, index) => ({
                ...item,
                id: index, // Usamos el índice como clave en el eje X para mantener el orden
                // item.date ya debería estar formateada ('27/nov'), si no, formatear aquí.
            }));
    }, [realStats.historyData]);

    // ===================================
    // RENDERIZADO DEL COMPONENTE
    // ===================================

    return (
        <div className="fade-in" style={{paddingBottom: '50px'}}>
            {/* --- Encabezado --- */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <h2 className="page-title" style={{marginBottom:0, color:'#E50914'}}>Análisis de Rendimiento 📊</h2>
                <div style={{fontSize:'12px', color:'#666'}}>Datos Reales</div>
            </div>
            
            {/* --- Estilos JSX para la corrección (asumiendo Next.js o similar) --- */}
            <style jsx>{`
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
                .custom-tooltip {
                    background-color: #111;
                    border: 1px solid #E50914;
                    border-radius: 8px;
                    padding: 10px;
                    color: white;
                    font-size: 14px;
                }
                .custom-tooltip .label {
                    font-weight: bold;
                }
                .custom-tooltip .desc {
                    color: #aaa;
                    font-size: 12px;
                }
            `}</style>
            
            {/* --- GRID DE TARJETAS PRINCIPALES (Key Metrics) --- */}
            <div className="stats-grid" style={{marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px'}}>
                {/* Racha Actual */}
                <div className="stat-card small">
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h3>Racha Actual</h3>
                        <Flame color={realStats.currentStreak > 0 ? "#FFD700" : "#666"} size={20}/>
                    </div>
                    <p className="stat-number">{realStats.currentStreak || 0} <span style={{fontSize:'14px', color:'#888', fontWeight:'normal'}}>días</span></p>
                </div>
                
                {/* Volumen Total */}
                <div className="stat-card small">
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h3>Volumen Total</h3>
                        <Dumbbell color="#E50914" size={20}/>
                    </div>
                    <p className="stat-number">{((realStats.totalKg || 0)/1000).toFixed(1)}k <span style={{fontSize:'14px', color:'#888', fontWeight:'normal'}}>kg</span></p>
                </div>

                {/* Sesiones Totales */}
                <div className="stat-card small">
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h3>Sesiones</h3>
                        <Activity color="#E50914" size={20}/>
                    </div>
                    <p className="stat-number">{realStats.totalSessions || 0}</p>
                </div>
            </div>

            {/* --- SECCIÓN DE GRÁFICOS AVANZADOS --- */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                
                {/* 1. Radar Chart (Enfoque Muscular) */}
                <div className="stat-card big" style={{height: 350}}>
                    <h3>Enfoque Muscular</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" 
                            data={realStats.radarData && realStats.radarData.length > 0 ? realStats.radarData : [{subject:'Sin datos', A:0, fullMark:100}]}
                        >
                            <PolarGrid stroke="#333" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                            <Radar name="Ejercicios" dataKey="A" stroke="#E50914" strokeWidth={2} fill="#E50914" fillOpacity={0.4} />
                            <Tooltip contentStyle={{backgroundColor:'#111', border:'1px solid #333', color:'#fff'}} itemStyle={{color:'#E50914'}}/>
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Actividad Semanal (Volumen Semanal) */}
                <div className="stat-card big" style={{height: 350}}>
                    <h3>Volumen Semanal (kg)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={realStats.weeklyActivity || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="day" stroke="#666" tickLine={false} />
                            {/* Formateador para mostrar kgs en miles */}
                            <YAxis stroke="#666" tickLine={false} tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} /> 
                            <Tooltip cursor={{fill: '#333', opacity: 0.2}} content={<CustomBarTooltip />} />
                            <Bar dataKey="kg" fill="#E50914" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- RÉCORDS Y PROGRESO --- */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                
                {/* Tabla de Récords Personales (PRs) */}
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
                                    // Borde de oro para el PR principal, gris para los demás
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
                            <XAxis 
                                dataKey="id" 
                                stroke="#666" 
                                tick={{fontSize: 10}} 
                                // Usamos el id, pero mostramos la fecha del dato correspondiente
                                tickFormatter={(value) => forceTrendData[value] ? forceTrendData[value].date : ''}
                            />
                            <YAxis stroke="#666" domain={['dataMin', 'dataMax']} tickFormatter={(value) => `${value}kg`} tickLine={false}/>
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

            {/* --- MAPA DE CALOR (Constancia) --- */}
            <div className="stat-card" style={{marginBottom: '40px'}}>
                <h3 style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                    <CalendarDays size={18} color="#888"/> Constancia Real (Últimos 101 Días)
                </h3>
                {/* Contenedor del Heatmap */}
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
                                {/* Manejo de fecha segura */}
                                {photo.date ? new Date(photo.date).toLocaleDateString() : 'N/A'}
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