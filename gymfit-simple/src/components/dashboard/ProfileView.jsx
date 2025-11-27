import React from 'react';
import { Camera, LogOut, Edit, Save, X } from 'lucide-react';

export default function ProfileView({ 
    user, 
    displayName, 
    setDisplayName, 
    bio, 
    setBio, 
    avatarUrl,
    isEditingProfile, 
    setIsEditingProfile,
    isEditingBio, 
    setIsEditingBio,
    handleImageUpload,
    saveProfileChanges,
    saveBio,
    getInitials,
    uploadingImg,
    onLogout 
}) {

    return (
        <div className="fade-in" style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
            <h2 className="page-title">Mi Perfil</h2>

            {/* Tarjeta Principal de Perfil */}
            <div className="profile-card" style={{background:'#141414', padding:'30px', borderRadius:'15px', border:'1px solid #222', marginBottom:'30px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'30px', flexWrap:'wrap'}}>
                    {/* Sección Avatar */}
                    <div className="avatar-upload-container" style={{position:'relative', width:'120px', height:'120px', flexShrink:0}}>
                        <div style={{width:'120px', height:'120px', borderRadius:'50%', overflow:'hidden', background: '#333', display:'flex', alignItems:'center', justifyContent:'center', border:'3px solid #E50914'}}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                                <div style={{color:'white', fontSize:'36px', fontWeight:'bold'}}>{getInitials()}</div>
                            )}
                        </div>
                        <input type="file" id="avatar-input" accept="image/*" style={{display:'none'}} onChange={handleImageUpload} disabled={uploadingImg}/>
                        <label htmlFor="avatar-input" style={{position:'absolute', bottom:0, right:0, background:'#E50914', color:'white', borderRadius:'50%', padding:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 3px #141414'}}>
                            <Camera size={18} />
                        </label>
                        {uploadingImg && <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.7)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}><LogOut size={24} className="spin" color="#fff"/></div>}
                    </div>

                    {/* Información y Edición */}
                    <div style={{flex:1}}>
                        <div style={{display:'flex', alignItems:'center', marginBottom:'10px'}}>
                            {isEditingProfile ? (
                                <input 
                                    type="text" 
                                    value={displayName} 
                                    onChange={(e) => setDisplayName(e.target.value)} 
                                    style={{padding:'5px', fontSize:'24px', fontWeight:'bold', background:'transparent', border:'1px solid #E50914', color:'white'}}
                                />
                            ) : (
                                <h3 style={{margin:0, fontSize:'24px', fontWeight:'bold'}}>{displayName}</h3>
                            )}
                            
                            <button 
                                onClick={() => isEditingProfile ? saveProfileChanges() : setIsEditingProfile(true)} 
                                style={{marginLeft:'10px', background:'transparent', border:'none', cursor:'pointer', color:'#888'}}
                            >
                                {isEditingProfile ? <Save size={20} color="#0f0"/> : <Edit size={18}/>}
                            </button>
                            {isEditingProfile && (
                                <button onClick={() => setIsEditingProfile(false)} style={{marginLeft:'5px', background:'transparent', border:'none', cursor:'pointer', color:'#888'}}>
                                    <X size={18}/>
                                </button>
                            )}
                        </div>
                        
                        <p style={{color:'#888', margin:'0 0 15px 0'}}>{user.role === 'Trainer' ? 'Entrenador' : 'Cliente'} | ID: {user.userId}</p>

                        {/* BOTÓN DE LOGOUT (CERRAR SESIÓN) */}
                        <button 
                            onClick={onLogout} 
                            style={{padding:'10px 20px', background:'#440000', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', fontSize:'14px', transition:'background 0.3s'}}
                            onMouseEnter={(e) => e.target.style.background = '#E50914'}
                            onMouseLeave={(e) => e.target.style.background = '#440000'}
                        >
                            <LogOut size={16}/> Cerrar Sesión
                        </button>

                    </div>
                </div>
            </div>

            {/* Sección Biografía */}
            <div className="bio-card" style={{background:'#141414', padding:'30px', borderRadius:'15px', border:'1px solid #222', marginBottom:'30px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #333', paddingBottom:'10px', marginBottom:'15px'}}>
                    <h4 style={{margin:0, color:'#E50914'}}>Acerca de Mí</h4>
                    <button 
                        onClick={() => isEditingBio ? saveBio() : setIsEditingBio(true)} 
                        style={{background:'transparent', border:'none', cursor:'pointer', color:'#888'}}
                    >
                        {isEditingBio ? <Save size={20} color="#0f0"/> : <Edit size={18}/>}
                    </button>
                </div>
                
                {isEditingBio ? (
                    <textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        rows="4"
                        style={{width:'100%', padding:'10px', background:'#0a0a0a', border:'1px solid #333', color:'white', borderRadius:'8px', resize:'none'}}
                    />
                ) : (
                    <p style={{color:'#ccc', lineHeight:'1.5'}}>{bio}</p>
                )}
            </div>
        </div>
    );
}