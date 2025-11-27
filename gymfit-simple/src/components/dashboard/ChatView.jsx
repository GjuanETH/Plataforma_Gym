import React, { useEffect, useState, useRef } from 'react'; 
import { MessageSquare, Send, ChevronLeft, Bell } from 'lucide-react';
import { chatService } from '../../api'; 

export default function ChatView({ user, trainersList, clientsList, pendingRequests, selectedChatUser, setSelectedChatUser, chatMessages, setChatMessages, newMessage, setNewMessage, handleRespondRequest, loadChat }) {

    const chatEndRef = useRef(null); 
    const messagesAreaRef = useRef(null); 

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // EFECTO DE SCROLL DE MENSAJES (INTERNO DEL CHAT)
    useEffect(() => {
        const messagesArea = messagesAreaRef.current;
        const messageCount = chatMessages.length;

        if (!messagesArea || messageCount === 0) return;

        const scrollBuffer = 200; 
        
        // Comportamiento al cargar el historial por primera vez: scroll instantáneo al final.
        if (isInitialLoad) {
            // block: "end" ayuda a que no scrollee toda la página
            chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" }); 
            setIsInitialLoad(false); 
            return;
        }
        
        // Calcula si el usuario está cerca del final para mantener el scroll automático.
        const distanceFromBottom = messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight;
        const isNearBottom = distanceFromBottom < scrollBuffer;

        const lastMessage = chatMessages[messageCount - 1];
        
        // Si el último mensaje es mío o estoy cerca del fondo, hace scroll suave.
        if (lastMessage && (lastMessage.senderId === user.userId || isNearBottom)) {
             chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
        
    }, [chatMessages, user.userId]); 

    // CARGA DE CHAT Y LIMPIEZA
    useEffect(() => {
        setIsInitialLoad(true);
        setChatMessages([]); 
        
        if (selectedChatUser) {
            loadChat(selectedChatUser._id);
        }
    }, [selectedChatUser, loadChat]);

    // Polling
    useEffect(() => {
        let interval;
        if (selectedChatUser) {
            interval = setInterval(() => {
                loadChat(selectedChatUser._id);
            }, 3000); 
        }
        return () => clearInterval(interval);
    }, [selectedChatUser, loadChat]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChatUser) return;
        
        const tempMessage = { 
            content: newMessage,
            senderId: user.userId,
            timestamp: new Date().toISOString(),
            isSending: true 
        };

        setChatMessages(prev => [...prev, tempMessage]);
        setNewMessage(''); 

        try {
            await chatService.sendMessage({ senderId: user.userId, receiverId: selectedChatUser._id, content: tempMessage.content });
        } catch (err) { 
            console.error(err); 
            setChatMessages(prev => prev.filter(msg => !msg.isSending));
            alert('Error al enviar el mensaje. Inténtalo de nuevo.');
        }
    };

    // VISTA DEL CHAT ACTIVO
    if (selectedChatUser) {
        return (
            <div className="chat-interface-container fade-in">
                <div className="chat-header">
                    <button className="btn-back" onClick={() => setSelectedChatUser(null)}>
                        <ChevronLeft size={18}/> Volver
                    </button>
                    <div className="chat-user-info">
                        <h3>{selectedChatUser.firstName} {selectedChatUser.lastName}</h3>
                        <span className="online-badge">Chat Activo</span>
                    </div>
                </div>
                
                {/* Contenedor de mensajes */}
                <div ref={messagesAreaRef} className="chat-messages-area"> 
                    {chatMessages.length === 0 ? (
                        <div className="empty-chat">¡Inicia la conversación! 👋</div> 
                    ) : (
                        chatMessages.map((msg, idx) => (
                            <div key={idx} className={`message-bubble ${msg.senderId === user.userId ? 'my-message' : 'other-message'}`}>
                                <p>{msg.content}</p>
                                <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                        ))
                    )}
                    <div ref={chatEndRef} />
                </div>
                <form className="chat-input-area" onSubmit={handleSendMessage}>
                    <input type="text" placeholder="Escribe un mensaje..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} autoFocus/>
                    <button type="submit" disabled={!newMessage.trim()}><Send size={18}/></button>
                </form>
            </div>
        );
    }

    // VISTA DE LISTA DE CONTACTOS
    return (
        <div className="fade-in">
            <h2 className="page-title">{user.role === 'Client' ? 'Encuentra tu Entrenador' : 'Bandeja de Entrada'}</h2>
            
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
                        {contact.avatarUrl ? <img src={contact.avatarUrl} alt="User" className="trainer-avatar-img" /> : <div className="trainer-avatar-placeholder">{contact.firstName?.[0]}</div>}
                        <h3>{contact.firstName} {contact.lastName}</h3>
                        <p className="trainer-email" style={{color:'#666', fontSize:'13px', margin:'5px 0 15px'}}>{contact.email}</p>
                        <button className="btn-primary" onClick={() => { setSelectedChatUser(contact); }}>
                            <MessageSquare size={16} style={{marginRight: '8px'}}/> {user.role === 'Client' ? 'Contactar' : 'Abrir Chat'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}