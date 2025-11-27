import React, { useState, useEffect, useRef, useCallback } from 'react';
import { authService, trainingService, chatService, clientService } from '../api';
import { User, ShoppingBag } from 'lucide-react';
import './Dashboard.css';

// Las rutas son relativas a src/pages/
import Sidebar from '../components/dashboard/Sidebar';
import ProfileView from '../components/dashboard/ProfileView';
import StatsView from '../components/dashboard/StatsView';
import ChatView from '../components/dashboard/ChatView';
import RoutinesView from '../components/dashboard/RoutinesView';
import WorkoutSession from '../components/dashboard/WorkoutSession';
import OrdersView from '../components/dashboard/OrdersView';
import ZenModeView from '../components/dashboard/ZenModeView';
import AssessmentsView from '../components/dashboard/AssessmentsView'; // <--- IMPORTACIÓN NUEVA

import ZenMusic from '../assets/peaceful solitude [F02iMCEEQWs].mp3';

export default function Dashboard({ user, onLogout, onNavigate }) {
    const API_KEY_IMGBB = '5ddc683f72b1a8e246397ff506b520d5';

    const [activeTab, setActiveTab] = useState('routines');
    const [bio, setBio] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);

    const [isZenMode, setIsZenMode] = useState(false);
    const audioRef = useRef(null);

    const contentRef = useRef(null);

    const [myRoutines, setMyRoutines] = useState([]);
    const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState(null);
    const [realStats, setRealStats] = useState({ totalSessions: 0, totalKg: 0, currentStreak: 0, weeklyActivity: [], historyData: [], photos: [], radarData: [], personalRecords: [], activityDates: [] });

    const [trainersList, setTrainersList] = useState([]);
    const [clientsList, setClientsList] = useState([]);
    const [linkedClients, setLinkedClients] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    const loadRoutines = useCallback((targetClientId) => {
        const idToFetch = targetClientId || user.userId;
        if (user.role === 'Trainer' && !targetClientId) { setMyRoutines([]); return; }
        trainingService.getClientRoutines(idToFetch).then(data => setMyRoutines(data)).catch(err => { console.error(err); setMyRoutines([]); });
    }, [user.role, user.userId]);

    const loadChat = useCallback((otherUserId) => {
        chatService.getChatHistory(user.userId, otherUserId).then(msgs => setChatMessages(msgs));
    }, [user.userId]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (contentRef.current) {
                contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
            }
            window.scrollTo(0, 0);
        }, 0); 
        return () => clearTimeout(timeoutId);
    }, [activeTab, selectedChatUser]);

    useEffect(() => {
        const audio = audioRef.current;
        document.body.classList.toggle('zen-mode-active', isZenMode);
        if (audio) {
            if (isZenMode) {
                audio.volume = 0.4;
                audio.loop = true;
                audio.play().catch(error => console.log("La música zen no pudo iniciar automáticamente.", error));
            } else {
                audio.pause();
                audio.currentTime = 0;
            }
        }
        return () => {
            document.body.classList.remove('zen-mode-active');
            if (audio) { audio.pause(); audio.currentTime = 0; }
        };
    }, [isZenMode]);

    useEffect(() => {
        setBio(localStorage.getItem(`gymfit_bio_${user.userId}`) || (user.role === 'Trainer' ? "Entrenador certificado." : "Atleta en proceso"));
        setDisplayName(localStorage.getItem(`gymfit_custom_name_${user.userId}`) || user.firstName);
        setAvatarUrl(localStorage.getItem(`gymfit_avatar_${user.userId}`));

        if (user.role === 'Client') {
            loadRoutines();
            trainingService.getClientHistory(user.userId).then(logs => calculateRealStats(logs));
            chatService.getTrainers().then(data => setTrainersList(data));
            clientService.getPendingRequests(user.userId).then(data => setPendingRequests(data));
        } else {
            chatService.getMyClients(user.userId).then(data => setClientsList(data));
            clientService.getMyClientsList(user.userId).then(data => setLinkedClients(data));
        }
    }, [user, loadRoutines]);

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
        const uniqueDatesSet = new Set(logs.map(log => new Date(log.date || log.createdAt).toISOString().split('T')[0]));
        const uniqueDaysList = Array.from(uniqueDatesSet).sort().reverse();
        const activityDates = Array.from(uniqueDatesSet);

        let currentStreak = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (uniqueDatesSet.has(todayStr) || uniqueDatesSet.has(yesterdayStr)) {
            currentStreak = 1;
            for (let i = 0; i < uniqueDaysList.length - 1; i++) {
                const d1 = new Date(uniqueDaysList[i]);
                const d2 = new Date(uniqueDaysList[i+1]);
                const diff = Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
                if (diff === 1) currentStreak++; else break;
            }
        }

        const totalKg = logs.reduce((acc, log) => acc + (Number(log.weightUsed) * Number(log.repsDone)), 0);
        const totalSessions = uniqueDaysList.length;

        const weeklyActivityMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const dayLabels = { 'Mon': 'L', 'Tue': 'M', 'Wed': 'X', 'Thu': 'J', 'Fri': 'V', 'Sat': 'S', 'Sun': 'D' };

        const curr = new Date();
        const dayOfWeek = curr.getDay() === 0 ? 7 : curr.getDay();
        const firstDayOfWeek = new Date(curr);
        firstDayOfWeek.setDate(curr.getDate() - dayOfWeek + 1);
        firstDayOfWeek.setHours(0,0,0,0);

        logs.forEach(log => {
            const logDate = new Date(log.date || log.createdAt);
            if (logDate >= firstDayOfWeek) {
                const dayStr = logDate.toDateString().split(' ')[0];
                if (weeklyActivityMap[dayStr] !== undefined) {
                    weeklyActivityMap[dayStr] += (Number(log.weightUsed) * Number(log.repsDone));
                }
            }
        });

        const orderedChartData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(k => ({ day: dayLabels[k], kg: weeklyActivityMap[k] }));

        const muscleCounts = { 'Pecho/Push': 0, 'Espalda/Pull': 0, 'Pierna': 0, 'Brazos': 0, 'Core': 0, 'General': 0 };
        logs.forEach(log => {
            const group = guessMuscleGroup(log.exerciseName);
            muscleCounts[group] = (muscleCounts[group] || 0) + 1;
        });
        const radarData = Object.keys(muscleCounts).map(k => ({ subject: k, A: muscleCounts[k], fullMark: 100 })).filter(x => x.A > 0);

        const prMap = {};
        logs.forEach(log => {
            const n = log.exerciseName.toLowerCase().trim();
            const w = Number(log.weightUsed);
            if (!prMap[n] || w > prMap[n]) prMap[n] = w;
        });
        const personalRecords = Object.keys(prMap).map(k => ({ name: k.charAt(0).toUpperCase() + k.slice(1), weight: prMap[k] })).sort((a,b)=>b.weight-a.weight).slice(0,5);

        const historyData = logs.slice(0, 20).reverse().map(l => ({
            exerciseName: l.exerciseName,
            kg: l.weightUsed,
            date: new Date(l.date || l.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        }));

        const photos = logs.filter(l => l.photoUrl).map(l => ({ url: l.photoUrl, date: l.date || l.createdAt })).sort((a,b)=>new Date(b.date)-new Date(a.date));

        setRealStats({ totalSessions, totalKg, currentStreak, weeklyActivity: orderedChartData, historyData, photos, radarData, personalRecords, activityDates });
    };

    const handleRespondRequest = async (reqId, status) => {
        try { 
            await clientService.respondRequest(reqId, status); 
            // Eliminamos la solicitud de la lista visualmente
            setPendingRequests(prev => prev.filter(req => req._id !== reqId));

            if(status === 'accepted') {
                chatService.getTrainers().then(data => setTrainersList(data));
                alert("¡Entrenador aceptado!");
            } else {
                alert("Solicitud rechazada");
            }
        } catch (err) { 
            console.error(err);
            alert("Error al procesar la solicitud"); 
        }
    };

    const refreshStats = () => trainingService.getClientHistory(user.userId).then(logs => calculateRealStats(logs));

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

    const handleActivateZenMode = () => {
        setActiveTab('zen');
        setIsZenMode(true);
    };

    const handleDeactivateZenMode = () => {
        setActiveTab('routines');
        setIsZenMode(false);
    };

    return (
        <div className="dashboard-layout">

            <audio ref={audioRef} src={ZenMusic} style={{display:'none'}} />

            <nav className="navbar" style={{justifyContent: 'space-between'}}>
                <div className="nav-logo" onClick={() => onNavigate('landing')} style={{cursor:'pointer'}}>GYMFIT</div>

                <div className="nav-links" style={{flexGrow: 0}}>
                    <button className="nav-link" onClick={() => onNavigate('landing')} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color:'white'}}>Inicio</button>
                    <button className="nav-link" onClick={() => onNavigate('landing')} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color:'white'}}>Nosotros</button>
                    <button className="nav-link" onClick={() => onNavigate('landing')} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color:'white'}}>Contacto</button>
                    <div style={{width:'1px', height:'20px', background:'#333', margin:'0 15px'}}></div>
                    <button onClick={() => onNavigate('store')} style={{background: 'transparent', border: 'none', color: '#E50914', cursor: 'pointer', display:'flex', alignItems:'center', gap:'5px', fontSize:'16px'}}>
                        <ShoppingBag size={18}/> Tienda
                    </button>
                    <span className="nav-user-badge"><User size={16}/> {user.role}</span>
                </div>
            </nav>
            <div className="dashboard-main">
                <Sidebar
                    user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} onNavigate={onNavigate}
                    displayName={displayName} avatarUrl={avatarUrl} pendingRequests={pendingRequests}
                    getInitials={() => displayName ? displayName[0] : 'U'}
                    copyToClipboard={() => {navigator.clipboard.writeText(user.userId); alert('ID Copiado');}}
                    setAvatarUrl={setAvatarUrl}
                />

                <main className="dashboard-content-area" ref={contentRef}>
                    {activeWorkoutRoutine && (
                        <WorkoutSession user={user} routine={activeWorkoutRoutine} preloadedHistory={activeWorkoutRoutine.preloadedHistory} onFinish={() => setActiveWorkoutRoutine(null)} onCancel={() => setActiveWorkoutRoutine(null)} refreshStats={refreshStats}/>
                    )}

                    {activeTab === 'zen' && isZenMode && (
                        <ZenModeView onDeactivate={handleDeactivateZenMode} />
                    )}

                    {!activeWorkoutRoutine && activeTab !== 'zen' && (
                        <>
                            {activeTab === 'routines' && (
                                <RoutinesView
                                    user={user}
                                    myRoutines={myRoutines}
                                    loadRoutines={loadRoutines}
                                    startWorkoutSession={handleStartSession}
                                    linkedClients={linkedClients}
                                    onActivateZenMode={handleActivateZenMode}
                                />
                            )}
                            
                            {/* --- AQUÍ SE RENDERIZA LA NUEVA VISTA DE VALORACIONES --- */}
                            {activeTab === 'assessments' && (
                                <AssessmentsView 
                                    user={user} 
                                    linkedClients={linkedClients} 
                                />
                            )}

                            {activeTab === 'stats' && user.role === 'Client' && (
                                <StatsView realStats={realStats} />
                            )}

                            {activeTab === 'orders' && user.role === 'Client' && (
                                <OrdersView user={user} />
                            )}

                            {activeTab === 'chat' && (
                                <ChatView
                                    user={user}
                                    trainersList={trainersList}
                                    clientsList={clientsList}
                                    pendingRequests={pendingRequests}
                                    selectedChatUser={selectedChatUser}
                                    setSelectedChatUser={setSelectedChatUser}
                                    chatMessages={chatMessages}
                                    setChatMessages={setChatMessages}
                                    newMessage={newMessage}
                                    setNewMessage={setNewMessage}
                                    handleRespondRequest={handleRespondRequest}
                                    loadChat={loadChat}
                                />
                            )}

                            {activeTab === 'profile' && (
                                <ProfileView
                                    user={user} displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio} avatarUrl={avatarUrl}
                                    isEditingProfile={isEditingProfile} setIsEditingProfile={setIsEditingProfile}
                                    isEditingBio={isEditingBio} setIsEditingBio={setIsEditingBio}
                                    handleImageUpload={handleImageUpload}
                                    saveProfileChanges={() => {localStorage.setItem(`gymfit_custom_name_${user.userId}`, displayName); setIsEditingProfile(false);}}
                                    saveBio={() => {localStorage.setItem(`gymfit_bio_${user.userId}`, bio); setIsEditingBio(false);}}
                                    getInitials={() => displayName ? displayName[0] : 'U'}
                                    uploadingImg={uploadingImg}
                                    setAvatarUrl={setAvatarUrl}
                                    onLogout={onLogout}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}