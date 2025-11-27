import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrdersView({ user }) {
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        // Cargar pedidos específicos de este usuario
        const savedOrders = localStorage.getItem(`gymfit_orders_${user.userId}`);
        if (savedOrders) {
            setOrders(JSON.parse(savedOrders));
        }
    }, [user]);

    const toggleOrder = (id) => {
        setExpandedOrder(expandedOrder === id ? null : id);
    };

    return (
        <div className="fade-in">
            <h2 className="page-title">Mis Pedidos</h2>
            
            {orders.length === 0 ? (
                <div style={{textAlign:'center', padding:'50px', background:'#141414', borderRadius:'15px', color:'#666'}}>
                    <Package size={50} style={{opacity:0.5, marginBottom:'15px'}}/>
                    <h3>No has realizado pedidos aún.</h3>
                    <p>Visita la tienda para equiparte.</p>
                </div>
            ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                    {orders.map(order => (
                        <div key={order.id} style={{background:'#141414', borderRadius:'12px', border:'1px solid #222', overflow:'hidden'}}>
                            
                            {/* Encabezado del Pedido (Click para expandir) */}
                            <div 
                                onClick={() => toggleOrder(order.id)}
                                style={{padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', background: expandedOrder === order.id ? '#1a1a1a' : 'transparent'}}
                            >
                                <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                                    <div style={{background:'#E50914', padding:'10px', borderRadius:'8px', color:'white'}}>
                                        <Package size={24}/>
                                    </div>
                                    <div>
                                        <h4 style={{margin:0, fontSize:'16px'}}>Pedido #{order.id}</h4>
                                        <span style={{fontSize:'12px', color:'#888'}}>{new Date(order.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div style={{display:'flex', gap:'30px', alignItems:'center'}}>
                                    <div style={{textAlign:'right', display:'none', sm: 'block'}}>
                                        <div style={{fontSize:'12px', color:'#888'}}>Total</div>
                                        <div style={{fontWeight:'bold', color:'#E50914'}}>${order.total.toLocaleString()}</div>
                                    </div>
                                    <div style={{display:'flex', alignItems:'center', gap:'5px', background:'#222', padding:'5px 12px', borderRadius:'20px', fontSize:'12px'}}>
                                        {order.status === 'En preparación' ? <Clock size={14} color="#ffa500"/> : <CheckCircle size={14} color="#0f0"/>}
                                        {order.status}
                                    </div>
                                    {expandedOrder === order.id ? <ChevronUp size={20} color="#666"/> : <ChevronDown size={20} color="#666"/>}
                                </div>
                            </div>

                            {/* Detalles del Pedido (Expandible) */}
                            {expandedOrder === order.id && (
                                <div className="fade-in" style={{padding:'20px', borderTop:'1px solid #222', background:'#111'}}>
                                    <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px'}}>
                                        <div>
                                            <h5 style={{marginBottom:'15px', color:'#888'}}>Productos</h5>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'14px'}}>
                                                    <span style={{color:'white'}}>{item.qty}x {item.name}</span>
                                                    <span style={{color:'#666'}}>${(item.price * item.qty).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{borderLeft:'1px solid #333', paddingLeft:'20px'}}>
                                            <h5 style={{marginBottom:'15px', color:'#888'}}>Envío</h5>
                                            <div style={{fontSize:'14px', display:'flex', gap:'10px', alignItems:'start'}}>
                                                <MapPin size={16} color="#E50914" style={{marginTop:'3px'}}/>
                                                <div>
                                                    <div>{order.shipping.address}</div>
                                                    <div style={{color:'#666'}}>{order.shipping.city}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}