import React, { useState, useEffect } from 'react';
import { authService, trainingService, chatService, clientService } from '../api';
import { User } from 'lucide-react';
import './Dashboard.css';

// Importamos los componentes modulares
import Sidebar from '../components/dashboard/Sidebar';
import ProfileView from '../components/dashboard/ProfileView';
import StatsView from '../components/dashboard/StatsView';
import ChatView from '../components/dashboard/ChatView';
import RoutinesView from '../components/dashboard/RoutinesView';
import WorkoutSession from '../components/dashboard/WorkoutSession';

export default function Dashboard({ user, onLogout }) {
    const API_KEY_IMGBB = '5ddc683f72b1a8e246397ff506b520d5'; 

    // --- ESTADOS GLOBALES ---
    const [activeTab, setActiveTab] = useState('routines');
    
    // Datos Usuario
    const [bio, setBio] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);

    // Datos Negocio
    const [myRoutines, setMyRoutines] = useState([]);
    const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState(null); 
    
    // ESTADO DE ESTADÍSTICAS REALES
    const [realStats, setRealStats] = useState({ 
        totalSessions: 0, 
        totalKg: 0, 
        currentStreak: 0, 
        weeklyActivity: [], 
        historyData: [], 
        photos: [],
        radarData: [], 
        personalRecords: [],
        activityDates: [] // Lista de fechas exactas para el Heatmap
    });
    
    // Datos Chat
    const [trainersList, setTrainersList] = useState([]); 
    const [clientsList, setClientsList] = useState([]);   
    const [linkedClients, setLinkedClients] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    // --- CARGA DE DATOS ---
    useEffect(() => {
        // Restaurar datos locales
        setBio(localStorage.getItem(`gymfit_bio_${user.userId}`) || (user.role === 'Trainer' ? "Entrenador certificado." : "Atleta en proceso"));
        setDisplayName(localStorage.getItem(`gymfit_custom_name_${user.userId}`) || user.firstName);
        setAvatarUrl(localStorage.getItem(`gymfit_avatar_${user.userId}`));

        // Cargar datos de red según el rol
        if (user.role === 'Client') {
            loadRoutines(); 
            trainingService.getClientHistory(user.userId).then(logs => calculateRealStats(logs));
            chatService.getTrainers().then(data => setTrainersList(data));
            clientService.getPendingRequests(user.userId).then(data => setPendingRequests(data));
        } else {
            chatService.getMyClients(user.userId).then(data => setClientsList(data));
            clientService.getMyClientsList(user.userId).then(data => setLinkedClients(data));
        }
    }, [user]);

    // --- FUNCIONES DE NEGOCIO ---
    const loadRoutines = (targetClientId) => {
        const idToFetch = targetClientId || user.userId;
        if (user.role === 'Trainer' && !targetClientId) { setMyRoutines([]); return; }
        trainingService.getClientRoutines(idToFetch).then(data => setMyRoutines(data)).catch(err => { console.error(err); setMyRoutines([]); });
    };

    const loadChat = (otherUserId) => {
        chatService.getChatHistory(user.userId, otherUserId).then(msgs => setChatMessages(msgs));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImg(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY_IMGBB}`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) { 
                setAvatarUrl(data.data.url); 
                localStorage.setItem(`gymfit_avatar_${user.userId}`, data.data.url); 
                try { await authService.updateAvatar(user.userId, data.data.url); } catch(e){}
            }
        } catch (err) { console.error(err); } finally { setUploadingImg(false); }
    };

    // ===========================================================================
    // === CÁLCULO DE ESTADÍSTICAS REALES (SIN SIMULACIONES) ===
    // ===========================================================================
    
    // Función auxiliar para adivinar músculo según nombre del ejercicio
    const guessMuscleGroup = (name) => {
        const n = name.toLowerCase();
        if (n.includes('press') || n.includes('push') || n.includes('pecho') || n.includes('chest') || n.includes('bench')) return 'Pecho/Push';
        if (n.includes('squat') || n.includes('sentadilla') || n.includes('leg') || n.includes('pierna') || n.includes('extension')) return 'Pierna';
        if (n.includes('dead') || n.includes('muerto') || n.includes('row') || n.includes('remo') || n.includes('pull') || n.includes('jalon') || n.includes('espalda')) return 'Espalda/Pull';
        if (n.includes('curl') || n.includes('bicep') || n.includes('tricep') || n.includes('brazo')) return 'Brazos';
        if (n.includes('abs') || n.includes('crunch') || n.includes('plank') || n.includes('plancha')) return 'Core';
        return 'General';
    };

    const calculateRealStats = (logs) => {
        if (!logs || logs.length === 0) {
            setRealStats({ totalSessions: 0, totalKg: 0, currentStreak: 0, weeklyActivity: [], historyData: [], photos: [], radarData: [], personalRecords: [], activityDates: [] });
            return;
        }

        // 1. FECHAS EXACTAS (Para Heatmap y Racha)
        const uniqueDatesSet = new Set(logs.map(log => new Date(log.date || log.createdAt).toISOString().split('T')[0]));
        const uniqueDaysList = Array.from(uniqueDatesSet).sort().reverse();
        const activityDates = Array.from(uniqueDatesSet);

        // 2. RACHA (STREAK)
        let currentStreak = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (uniqueDaysList.includes(todayStr) || uniqueDaysList.includes(yesterdayStr)) {
            currentStreak = 1;
            for (let i = 0; i < uniqueDaysList.length - 1; i++) {
                const d1 = new Date(uniqueDaysList[i]);
                const d2 = new Date(uniqueDaysList[i+1]);
                // Diferencia en días
                const diff = Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
                if (diff === 1) currentStreak++; else break;
            }
        }

        // 3. TOTALES GENERALES
        const totalKg = logs.reduce((acc, log) => acc + (Number(log.weightUsed) * Number(log.repsDone)), 0);
        const totalSessions = uniqueDaysList.length;

        // 4. VOLUMEN SEMANAL (Sólo esta semana, Lunes a Domingo)
        const weeklyActivityMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const dayLabels = { 'Mon': 'L', 'Tue': 'M', 'Wed': 'X', 'Thu': 'J', 'Fri': 'V', 'Sat': 'S', 'Sun': 'D' };
        
        // Calcular inicio de semana (Lunes)
        const curr = new Date(); 
        const dayOfWeek = curr.getDay() === 0 ? 7 : curr.getDay(); // Domingo es 0, lo pasamos a 7
        const firstDayOfWeek = new Date(curr); 
        firstDayOfWeek.setDate(curr.getDate() - dayOfWeek + 1); // Vamos al Lunes
        firstDayOfWeek.setHours(0,0,0,0); 
        
        logs.forEach(log => { 
            const logDate = new Date(log.date || log.createdAt); 
            // Solo sumamos si el log es de esta semana
            if (logDate >= firstDayOfWeek) { 
                const dayStr = logDate.toDateString().split(' ')[0]; // "Mon", "Tue"...
                if (weeklyActivityMap[dayStr] !== undefined) {
                    weeklyActivityMap[dayStr] += (Number(log.weightUsed) * Number(log.repsDone)); 
                }
            } 
        });

        const orderedChartData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(k => ({ 
            day: dayLabels[k], 
            kg: weeklyActivityMap[k] 
        }));

        // 5. RADAR CHART (Distribución Muscular)
        const muscleCounts = { 'Pecho/Push': 0, 'Espalda/Pull': 0, 'Pierna': 0, 'Brazos': 0, 'Core': 0, 'General': 0 };
        logs.forEach(log => {
            const group = guessMuscleGroup(log.exerciseName);
            muscleCounts[group] = (muscleCounts[group] || 0) + 1;
        });
        const radarData = Object.keys(muscleCounts)
            .map(k => ({ subject: k, A: muscleCounts[k], fullMark: 100 }))
            .filter(x => x.A > 0);

        // 6. PERSONAL RECORDS (PRs)
        const prMap = {};
        logs.forEach(log => {
            const n = log.exerciseName.toLowerCase().trim();
            const w = Number(log.weightUsed);
            if (!prMap[n] || w > prMap[n]) prMap[n] = w;
        });
        const personalRecords = Object.keys(prMap)
            .map(k => ({ name: k.charAt(0).toUpperCase() + k.slice(1), weight: prMap[k] }))
            .sort((a,b)=>b.weight-a.weight)
            .slice(0,5);

        // 7. HISTORIAL LINEAL & FOTOS
        const historyData = logs.slice(0, 20).reverse().map(l => ({ name: l.exerciseName.substring(0, 4), kg: l.weightUsed }));
        const photos = logs.filter(l => l.photoUrl).map(l => ({ url: l.photoUrl, date: l.date || l.createdAt })).sort((a,b)=>new Date(b.date)-new Date(a.date));

        setRealStats({ totalSessions, totalKg, currentStreak, weeklyActivity: orderedChartData, historyData, photos, radarData, personalRecords, activityDates }); 
    };

    const handleRespondRequest = async (reqId, status) => { 
        try { await clientService.respondRequest(reqId, status); alert(status === 'accepted' ? "¡Aceptado!" : "Rechazado"); } catch (err) { alert("Error"); } 
    };

    const refreshStats = () => trainingService.getClientHistory(user.userId).then(logs => calculateRealStats(logs));

    // --- INICIAR SESIÓN CON HISTORIAL REAL ---
    const handleStartSession = async (routine) => {
        setActiveWorkoutRoutine(routine);
        let historyLogs = [];
        try { historyLogs = await trainingService.getClientHistory(user.userId); } catch (err) { console.error(err); }

        const realHistoryMap = {};
        routine.exercises.forEach(ex => {
            const exLogs = historyLogs.filter(l => l.exerciseName.toLowerCase() === ex.name.toLowerCase());
            if (exLogs.length > 0) {
                exLogs.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
                const last = exLogs[0];
                realHistoryMap[ex.name] = { lastWeight: last.weightUsed, lastReps: last.repsDone };
            } else {
                realHistoryMap[ex.name] = null;
            }
        });

        routine.preloadedHistory = realHistoryMap; 
        setActiveWorkoutRoutine({...routine}); 
    };

    // --- RENDER ---
    return (
        <div className="dashboard-layout">
            <nav className="navbar"><div className="nav-logo">GYMFIT</div><div className="nav-links"><span className="nav-user-badge"><User size={16}/> {user.role}</span></div></nav>
            <div className="dashboard-main">
                <Sidebar 
                    user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout}
                    displayName={displayName} avatarUrl={avatarUrl} pendingRequests={pendingRequests}
                    getInitials={() => displayName ? displayName[0] : 'U'} 
                    copyToClipboard={() => {navigator.clipboard.writeText(user.userId); alert('ID Copiado');}}
                    setAvatarUrl={setAvatarUrl}
                />
                <main className="dashboard-content-area">
                    {/* MODAL SUPERPUESTO: SESIÓN DE ENTRENAMIENTO */}
                    {activeWorkoutRoutine && (
                        <WorkoutSession 
                            user={user} 
                            routine={activeWorkoutRoutine} 
                            preloadedHistory={activeWorkoutRoutine.preloadedHistory}
                            onFinish={() => setActiveWorkoutRoutine(null)} 
                            onCancel={() => setActiveWorkoutRoutine(null)}
                            refreshStats={refreshStats}
                        />
                    )}

                    {/* VISTAS NORMALES (Si no hay entreno activo) */}
                    {!activeWorkoutRoutine && (
                        <>
                            {activeTab === 'routines' && (
                                <RoutinesView 
                                    user={user} 
                                    myRoutines={myRoutines} 
                                    loadRoutines={loadRoutines} 
                                    startWorkoutSession={handleStartSession}
                                    linkedClients={linkedClients}
                                />
                            )}

                            {activeTab === 'stats' && user.role === 'Client' && (
                                <StatsView realStats={realStats} />
                            )}

                            {activeTab === 'chat' && (
                                <ChatView 
                                    user={user}
                                    trainersList={trainersList} clientsList={clientsList} pendingRequests={pendingRequests}
                                    selectedChatUser={selectedChatUser} setSelectedChatUser={setSelectedChatUser}
                                    chatMessages={chatMessages} setChatMessages={setChatMessages}
                                    newMessage={newMessage} setNewMessage={setNewMessage}
                                    handleRespondRequest={handleRespondRequest}
                                    loadChat={loadChat} loadData={()=>{}}
                                />
                            )}

                            {activeTab === 'profile' && (
                                <ProfileView 
                                    user={user} displayName={displayName} setDisplayName={setDisplayName}
                                    bio={bio} setBio={setBio} avatarUrl={avatarUrl}
                                    isEditingProfile={isEditingProfile} setIsEditingProfile={setIsEditingProfile}
                                    isEditingBio={isEditingBio} setIsEditingBio={setIsEditingBio}
                                    handleImageUpload={handleImageUpload}
                                    saveProfileChanges={() => {localStorage.setItem(`gymfit_custom_name_${user.userId}`, displayName); setIsEditingProfile(false);}}
                                    saveBio={() => {localStorage.setItem(`gymfit_bio_${user.userId}`, bio); setIsEditingBio(false);}}
                                    getInitials={() => displayName ? displayName[0] : 'U'}
                                    uploadingImg={uploadingImg}
                                    setAvatarUrl={setAvatarUrl}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}