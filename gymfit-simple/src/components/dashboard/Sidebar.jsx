import React from 'react';
import { LayoutDashboard, Activity, MessageSquare, User, LogOut, Package, ShoppingBag } from 'lucide-react';

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, displayName, avatarUrl, getInitials, setAvatarUrl, onNavigate }) {
    
    // Función para manejar clics en las pestañas internas
    const handleTabClick = (tabName) => {
        // La navegación interna usa setActiveTab
        setActiveTab(tabName);
    };

    return (
        <aside className="sidebar">
            {/* Perfil Resumido */}
            <div className="sidebar-profile" style={{textAlign:'center', marginBottom:'30px'}}>
                <div className="sidebar-avatar" style={{
                    width:'80px', height:'80px', borderRadius:'50%', overflow:'hidden', margin:'0 auto 15px auto',
                    background: '#333', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #E50914'
                }}>
                    {avatarUrl ? (
                        <img 
                            src={avatarUrl} 
                            alt="Avatar" 
                            style={{width:'100%', height:'100%', objectFit:'cover'}} 
                            onError={(e) => {e.target.style.display='none'; setAvatarUrl(null);}} 
                        />
                    ) : (
                        <div style={{color:'white', fontSize:'24px', fontWeight:'bold'}}>{getInitials()}</div>
                    )}
                </div>
                <div className="sidebar-user-info">
                    <h3 style={{color:'white', margin:'0 0 5px 0'}}>{displayName}</h3>
                    <span style={{color:'#888', fontSize:'12px'}}>{user.role === 'Trainer' ? 'Entrenador' : 'Cliente'}</span>
                </div>
            </div>

            {/* Menú de Navegación */}
            <nav className="sidebar-nav">
                <button className={`nav-item ${activeTab === 'routines' ? 'active' : ''}`} onClick={() => handleTabClick('routines')}>
                    <LayoutDashboard size={20} /> Mis Rutinas
                </button>
                
                {user.role === 'Client' && (
                    <>
                        <button className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => handleTabClick('stats')}>
                            <Activity size={20} /> Estadísticas
                        </button>
                        
                        {/* BOTÓN IR A TIENDA (USA onNavigate) */}
                        <button className="nav-item" onClick={() => onNavigate('store')} style={{color:'#E50914'}}>
                            <ShoppingBag size={20} /> Ir a Tienda
                        </button>

                        <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabClick('orders')}>
                            <Package size={20} /> Mis Pedidos
                        </button>
                    </>
                )}

                <button className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => handleTabClick('chat')}>
                    <MessageSquare size={20} /> Chat
                </button>
                
                <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabClick('profile')}>
                    <User size={20} /> Perfil
                </button>
            </nav>

            {/* Footer Sidebar */}
            <div className="sidebar-footer">
                <button className="nav-item logout" onClick={onLogout}>
                    <LogOut size={20} /> Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}