import React from 'react';
import { Dumbbell, Activity, MessageSquare, User, LogOut, Copy } from 'lucide-react';

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, displayName, avatarUrl, pendingRequests, getInitials, copyToClipboard }) {
    return (
        <aside className="dashboard-sidebar">
            <div className="user-card">
                <div className="profile-avatar-wrapper" style={{width:'45px', height:'45px', minWidth:'45px', minHeight:'45px'}}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="sidebar-avatar" style={{width:'100%', height:'100%'}} />
                    ) : (
                        <div className="avatar-circle" style={{width:'100%', height:'100%', fontSize:'16px'}}>{getInitials()}</div>
                    )}
                </div>
                <div style={{overflow:'hidden'}}>
                    <h4 style={{whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden'}}>{displayName}</h4>
                    <p onClick={copyToClipboard} style={{cursor:'pointer', fontSize:'11px', color:'#888', display:'flex', alignItems:'center', gap:'5px'}}>
                        ID: {user.userId.substring(0,6)}... <Copy size={10}/>
                    </p>
                </div>
            </div>
            <nav className="sidebar-nav">
                <button className={`nav-item ${activeTab==='routines'?'active':''}`} onClick={()=>setActiveTab('routines')}>
                    <Dumbbell size={20}/> {user.role === 'Trainer' ? 'Gestión Rutinas' : 'Mis Rutinas'}
                </button>
                
                {user.role === 'Client' ? (
                    <>
                        <button className={`nav-item ${activeTab==='stats'?'active':''}`} onClick={()=>setActiveTab('stats')}>
                            <Activity size={20}/> Estadísticas
                        </button>
                        <button className={`nav-item ${activeTab==='chat'?'active':''}`} onClick={()=>setActiveTab('chat')}>
                            <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
                                <span style={{display:'flex', alignItems:'center', gap:'8px'}}><MessageSquare size={20}/> Entrenadores</span>
                                {pendingRequests.length > 0 && <span style={{background:'red', borderRadius:'50%', width:'8px', height:'8px'}}></span>}
                            </div>
                        </button>
                    </>
                ) : (
                    <button className={`nav-item ${activeTab==='chat'?'active':''}`} onClick={()=>setActiveTab('chat')}>
                        <MessageSquare size={20}/> Mensajes
                    </button>
                )}
                
                <button className={`nav-item ${activeTab==='profile'?'active':''}`} onClick={()=>setActiveTab('profile')}>
                    <User size={20}/> Perfil
                </button>
                
                <button className="nav-item" onClick={onLogout} style={{marginTop: 'auto', color: '#e74c3c'}}>
                    <LogOut size={20}/> Salir
                </button>
            </nav>
        </aside>
    );
}