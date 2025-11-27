import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, MapPin, Truck, CheckCircle, Lock } from 'lucide-react';

// Estilos de los inputs definidos aquí para fácil acceso
const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#1a1a1a',
    color: 'white',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.3s'
};

export default function CheckoutPage({ onNavigate }) {
    const [cart, setCart] = useState([]);
    
    // Estado para todos los campos del formulario
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        address: '', city: '', zip: '', 
        cardName: '', cardNumber: '', expDate: '', cvv: ''
    });
    
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. Cargar el carrito guardado al iniciar el componente
    useEffect(() => {
        const savedCart = localStorage.getItem('gymfit_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    // 2. Manejar cambios en los inputs
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Simular el proceso de pago
    const handlePayment = (e) => {
        e.preventDefault(); // Evitar recarga de página
        setIsProcessing(true);

        // Simulamos un delay de red (2 segundos)
        setTimeout(() => {
            setIsProcessing(false);
            
            // Aquí iría la integración real con Stripe/Wompi/PayPal
            // Por ahora, asumimos éxito:
            alert("¡Pago Exitoso! Tu pedido ha sido procesado correctamente.");
            
            // Limpiamos el carrito y volvemos al dashboard
            localStorage.removeItem('gymfit_cart');
            onNavigate('dashboard'); 
        }, 2000);
    };

    // Si el carrito está vacío (por si acceden directo por URL o error)
    if (cart.length === 0) {
        return (
            <div style={{minHeight:'100vh', background:'#0a0a0a', color:'white', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                <h2>Tu carrito está vacío</h2>
                <button onClick={() => onNavigate('store')} className="btn-primary" style={{marginTop:'20px', padding:'10px 20px', background:'#E50914', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>
                    Volver a la Tienda
                </button>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'sans-serif'}}>
            {/* NAVBAR SIMPLE */}
            <nav style={{padding: '20px 40px', borderBottom: '1px solid #222', display:'flex', alignItems:'center', background:'rgba(0,0,0,0.5)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:10}}>
                <button onClick={() => onNavigate('store')} style={{background:'transparent', border:'none', color:'#888', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                    <ArrowLeft size={20}/> Volver
                </button>
                <div style={{flex:1, textAlign:'center', fontWeight:'900', color:'#E50914', fontSize:'20px'}}>PAGO SEGURO</div>
            </nav>

            <div style={{maxWidth: '1100px', margin: '40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px'}}>
                
                {/* COLUMNA IZQUIERDA: FORMULARIO DE DATOS */}
                <div>
                    {/* Sección Envío */}
                    <h2 style={{display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #333', paddingBottom:'15px', marginTop:0}}>
                        <MapPin color="#E50914"/> Datos de Envío
                    </h2>
                    
                    <form id="checkout-form" onSubmit={handlePayment} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'20px'}}>
                        <input required name="firstName" placeholder="Nombre" onChange={handleInputChange} style={inputStyle} />
                        <input required name="lastName" placeholder="Apellido" onChange={handleInputChange} style={inputStyle} />
                        
                        <input required name="email" type="email" placeholder="Correo Electrónico" onChange={handleInputChange} style={{...inputStyle, gridColumn:'span 2'}} />
                        <input required name="phone" type="tel" placeholder="Teléfono" onChange={handleInputChange} style={{...inputStyle, gridColumn:'span 2'}} />
                        
                        <input required name="address" placeholder="Dirección Completa" onChange={handleInputChange} style={{...inputStyle, gridColumn:'span 2'}} />
                        
                        <input required name="city" placeholder="Ciudad" onChange={handleInputChange} style={inputStyle} />
                        <input required name="zip" placeholder="Cód. Postal" onChange={handleInputChange} style={inputStyle} />
                        
                        {/* Sección Tarjeta */}
                        <h2 style={{gridColumn:'span 2', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #333', paddingBottom:'15px', marginTop:'30px'}}>
                            <CreditCard color="#E50914"/> Método de Pago
                        </h2>
                        
                        <div style={{gridColumn:'span 2', background:'#141414', padding:'20px', borderRadius:'10px', border:'1px solid #333'}}>
                            <div style={{display:'flex', gap:'10px', marginBottom:'15px', alignItems:'center'}}>
                                <CreditCard size={24} color="#fff"/>
                                <span style={{fontWeight:'bold'}}>Tarjeta de Crédito / Débito</span>
                                <div style={{marginLeft:'auto', display:'flex', gap:'5px'}}>
                                    {/* Iconos visuales de tarjetas (simulados) */}
                                    <div style={{width:'30px', height:'20px', background:'#333', borderRadius:'3px'}}></div>
                                    <div style={{width:'30px', height:'20px', background:'#333', borderRadius:'3px'}}></div>
                                </div>
                            </div>
                            
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                <input required name="cardName" placeholder="Nombre en la tarjeta" style={{...inputStyle, gridColumn:'span 2', background:'#0a0a0a'}} />
                                <input required name="cardNumber" placeholder="0000 0000 0000 0000" maxLength="19" style={{...inputStyle, gridColumn:'span 2', background:'#0a0a0a'}} />
                                <input required name="expDate" placeholder="MM/AA" maxLength="5" style={{...inputStyle, background:'#0a0a0a'}} />
                                <input required name="cvv" placeholder="CVV" maxLength="4" type="password" style={{...inputStyle, background:'#0a0a0a'}} />
                            </div>
                        </div>
                    </form>
                </div>

                {/* COLUMNA DERECHA: RESUMEN Y TOTAL */}
                <div>
                    <div style={{background: '#141414', padding: '30px', borderRadius: '15px', border: '1px solid #333', position:'sticky', top:'100px'}}>
                        <h3 style={{marginTop:0, borderBottom:'1px solid #333', paddingBottom:'15px'}}>Resumen del Pedido</h3>
                        
                        <div style={{maxHeight:'300px', overflowY:'auto', marginBottom:'20px', paddingRight:'5px'}}>
                            {cart.map((item, idx) => (
                                <div key={idx} style={{display:'flex', gap:'15px', marginBottom:'15px', borderBottom:'1px solid #222', paddingBottom:'15px'}}>
                                    <div style={{width:'50px', height:'50px', background:'#fff', borderRadius:'5px', padding:'2px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        <img src={item.image} style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain'}} alt={item.name}/>
                                    </div>
                                    <div style={{flex:1}}>
                                        <div style={{fontSize:'14px', fontWeight:'bold', lineHeight:'1.2'}}>{item.name}</div>
                                        <div style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>Cant: {item.qty}</div>
                                    </div>
                                    <div style={{fontWeight:'bold', color:'#E50914'}}>${(item.price * item.qty).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{paddingTop:'5px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                <span style={{color:'#888'}}>Subtotal</span>
                                <span>${total.toLocaleString()}</span>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                <span style={{color:'#888'}}>Envío <Truck size={14} style={{display:'inline', marginLeft:'5px'}}/></span>
                                <span style={{color:'#0f0'}}>Gratis</span>
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', fontSize:'22px', fontWeight:'900', marginTop:'20px', borderTop:'1px solid #333', paddingTop:'15px'}}>
                                <span>Total</span>
                                <span>${total.toLocaleString()}</span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            form="checkout-form"
                            disabled={isProcessing}
                            style={{
                                width: '100%', padding: '15px', marginTop: '25px', 
                                background: isProcessing ? '#555' : '#E50914', color: 'white', 
                                border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', 
                                cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', 
                                justifyContent: 'center', alignItems: 'center', gap: '10px',
                                transition: 'background 0.3s'
                            }}
                        >
                            {isProcessing ? 'Procesando Pago...' : <><Lock size={18}/> Pagar Ahora</>}
                        </button>
                        
                        <div style={{textAlign:'center', marginTop:'15px', fontSize:'12px', color:'#666', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}>
                            <CheckCircle size={12} color="#0f0"/> Transacción encriptada SSL 256-bit
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}