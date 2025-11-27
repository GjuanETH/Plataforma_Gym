import React from 'react';
import { Camera, Check, X, Edit3, Save } from 'lucide-react';

export default function ProfileView({ 
    user, displayName, setDisplayName, bio, setBio, avatarUrl, 
    isEditingProfile, setIsEditingProfile, isEditingBio, setIsEditingBio, 
    handleImageUpload, saveProfileChanges, saveBio, getInitials, uploadingImg 
}) {
    return (
        <div className="fade-in profile-view">
            <div className="profile-header-card">
                <div className="profile-cover"></div>
                <div className="profile-content">
                    <div className="profile-avatar-wrapper">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="profile-img-real" />
                        ) : (
                            <div className="profile-avatar-xl">{getInitials()}</div>
                        )}
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
    );
}