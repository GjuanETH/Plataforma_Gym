import React, { useEffect } from 'react';
import { MessageSquare, Send, ChevronLeft, Bell } from 'lucide-react';
import { chatService } from '../../api'; // Ajusta la ruta según donde esté tu api.js

export default function ChatView({ user, trainersList, clientsList, pendingRequests, selectedChatUser, setSelectedChatUser, chatMessages, setChatMessages, newMessage, setNewMessage, handleRespondRequest, loadChat, loadData }) {
    
    const chatEndRef = React.useRef(null);

    // Polling local
    useEffect(() => {
        let interval;
        if (selectedChatUser) {
            interval = setInterval(() => {
                loadChat(selectedChatUser._id);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [selectedChatUser]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChatUser) return;
        try {
            await chatService.sendMessage({ senderId: user.userId, receiverId: selectedChatUser._id, content: newMessage });
            setNewMessage('');
            loadChat(selectedChatUser._id);
        } catch (err) { console.error(err); }
    };

    if (selectedChatUser) {
        return (
            <div className="chat-interface-container fade-in">
                <div className="chat-header">
                    <button className="btn-back" onClick={() => setSelectedChatUser(null)}><ChevronLeft size={20}/> Volver</button>
                    <div className="chat-user-info"><h3>{selectedChatUser.firstName} {selectedChatUser.lastName}</h3><span className="online-badge">Chat Activo</span></div>
                </div>
                <div className="chat-messages-area">
                    {chatMessages.length === 0 ? <div className="empty-chat">¡Inicia la conversación! 👋</div> : chatMessages.map((msg, idx) => (
                        <div key={idx} className={`message-bubble ${msg.senderId === user.userId ? 'my-message' : 'other-message'}`}>
                            <p>{msg.content}</p>
                            <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form className="chat-input-area" onSubmit={handleSendMessage}>
                    <input type="text" placeholder="Escribe un mensaje..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} autoFocus/>
                    <button type="submit" disabled={!newMessage.trim()}><Send size={18}/></button>
                </form>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <h2 className="page-title">{user.role === 'Client' ? 'Encuentra tu Entrenador' : 'Bandeja de Entrada'}</h2>
            
            {/* Notificaciones Cliente */}
            {user.role === 'Client' && pendingRequests.length > 0 && (
                <div style={{marginBottom:'25px', background:'#1a1a1a', padding:'15px', borderRadius:'12px', borderLeft:'4px solid #E50914'}}>
                    <h3 style={{color:'white', marginTop:0, fontSize:'16px', display:'flex', alignItems:'center', gap:'10px'}}>
                        <Bell size={18} color="#E50914" fill="#E50914"/> Solicitudes de Entrenador
                    </h3>
                    <div style={{display:'grid', gap:'10px'}}>
                        {pendingRequests.map(req => (
                            <div key={req._id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#000', padding:'10px', borderRadius:'8px'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <div className="avatar-circle" style={{width:'40px', height:'40px'}}>{req.trainerId.firstName[0]}</div>
                                    <div><span style={{color:'white', display:'block', fontWeight:'bold'}}>{req.trainerId.firstName} {req.trainerId.lastName}</span></div>
                                </div>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <button onClick={()=>handleRespondRequest(req._id, 'accepted')} className="btn-secondary" style={{color:'#2ecc71', borderColor:'#2ecc71'}}>Aceptar</button>
                                    <button onClick={()=>handleRespondRequest(req._id, 'rejected')} className="btn-secondary" style={{color:'#e74c3c', borderColor:'#e74c3c'}}>X</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="trainers-grid">
                {(user.role === 'Client' ? trainersList : clientsList).length === 0 ? (
                    <p style={{color:'#888'}}>Sin contactos disponibles.</p>
                ) : (user.role === 'Client' ? trainersList : clientsList).map(contact => (
                    <div key={contact._id} className="trainer-card">
                        {contact.avatarUrl ? <img src={contact.avatarUrl} alt="User" className="trainer-avatar-img" style={{width:'60px', height:'60px', borderRadius:'50%', objectFit:'cover', margin:'0 auto 15px', display:'block', border: '2px solid #E50914'}} /> : <div className="trainer-avatar-placeholder">{contact.firstName?.[0]}</div>}
                        <h3>{contact.firstName} {contact.lastName}</h3>
                        <p className="trainer-email">{contact.email}</p>
                        <button className="btn-primary" onClick={() => { setSelectedChatUser(contact); loadChat(contact._id); }}>
                            <MessageSquare size={16} style={{marginRight: '8px'}}/> {user.role === 'Client' ? 'Contactar' : 'Abrir Chat'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}