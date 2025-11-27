import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, X, ArrowLeft, Trash2, CheckCircle } from 'lucide-react';

// --- IMPORTACIÓN DE IMÁGENES LOCALES ---
import wheyImg from '../assets/Whey protein isolate.jpg';
import creatinaImg from '../assets/Creatina monohidratada.jpeg';
import preworkoutImg from '../assets/Pre Workout explosive.jpeg';
import camisetaImg from '../assets/Camiseta_Oversize.png';
import strapsImg from '../assets/straps de agarre.jpeg';
import cinturonImg from '../assets/cinturon.jpg';

export default function StorePage({ onNavigate }) {
    const [cartOpen, setCartOpen] = useState(false);
    const [cart, setCart] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('Todos');

    // --- TUS PRODUCTOS CON FOTOS REALES ---
    const products = [
        { 
            id: 1, 
            name: 'Whey Protein Isolate', 
            price: 180000, 
            category: 'Suplementos', 
            image: wheyImg, 
            desc: 'Proteína pura para recuperación muscular.' 
        },
        { 
            id: 2, 
            name: 'Creatina Monohidratada', 
            price: 95000, 
            category: 'Suplementos', 
            image: creatinaImg, 
            desc: 'Aumenta tu fuerza y potencia.' 
        },
        { 
            id: 3, 
            name: 'Pre-Workout Explosive', 
            price: 120000, 
            category: 'Suplementos', 
            image: preworkoutImg, 
            desc: 'Energía extrema para tus rutinas.' 
        },
        { 
            id: 4, 
            name: 'Camiseta Oversize GymFit', 
            price: 65000, 
            category: 'Ropa', 
            image: camisetaImg, 
            desc: 'Estilo urbano para entrenar cómodo.' 
        },
        { 
            id: 5, 
            name: 'Straps de Agarre', 
            price: 45000, 
            category: 'Accesorios', 
            image: strapsImg, 
            desc: 'Mejora tu agarre en peso muerto.' 
        },
        { 
            id: 6, 
            name: 'Cinturón de Powerlifting', 
            price: 150000, 
            category: 'Accesorios', 
            image: cinturonImg, 
            desc: 'Protección lumbar para cargas máximas.' 
        },
    ];

    const categories = ['Todos', 'Suplementos', 'Ropa', 'Accesorios'];

    // --- LÓGICA DEL CARRITO ---
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
        setCartOpen(true);
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    };

    const totalCart = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const filteredProducts = categoryFilter === 'Todos' ? products : products.filter(p => p.category === categoryFilter);

    return (
        <div className="fade-in" style={{minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'sans-serif'}}>
            {/* NAVBAR */}
            <nav style={{padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', background: 'rgba(0,0,0,0.8)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)'}}>
                <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                    <button onClick={() => onNavigate('landing')} style={{background:'transparent', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                        <ArrowLeft size={20}/> Volver
                    </button>
                    <h1 style={{margin:0, color:'#E50914', fontWeight:'900', letterSpacing:'1px'}}>GYMFIT STORE</h1>
                </div>
                
                <button onClick={() => setCartOpen(true)} style={{position: 'relative', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'}}>
                    <ShoppingCart size={28} />
                    {cart.length > 0 && (
                        <span style={{position: 'absolute', top: -8, right: -8, background: '#E50914', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                            {cart.reduce((acc, item) => acc + item.qty, 0)}
                        </span>
                    )}
                </button>
            </nav>

            {/* HEADER */}
            <header style={{textAlign: 'center', padding: '60px 20px', background: 'linear-gradient(to bottom, #111, #0a0a0a)'}}>
                <h2 style={{fontSize: '40px', fontWeight: '800', marginBottom: '10px'}}>EQUÍPATE PARA GANAR</h2>
                <p style={{color: '#888', fontSize: '18px'}}>Los mejores suplementos y accesorios para tu evolución.</p>
                
                <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', flexWrap: 'wrap'}}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setCategoryFilter(cat)}
                            style={{
                                padding: '10px 25px', borderRadius: '30px', border: '1px solid #333', cursor: 'pointer',
                                background: categoryFilter === cat ? '#E50914' : 'transparent',
                                color: categoryFilter === cat ? 'white' : '#888',
                                transition: 'all 0.3s ease', fontWeight: '600'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* GRID PRODUCTOS */}
            <div style={{maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px'}}>
                {filteredProducts.map(product => (
                    <div key={product.id} className="fade-in" style={{background: '#141414', borderRadius: '15px', overflow: 'hidden', border: '1px solid #222', transition: 'transform 0.2s'}}>
                        {/* Contenedor de Imagen con fondo blanco para que se vea bien el producto */}
                        <div style={{height: '250px', overflow: 'hidden', background: '#fff', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <img src={product.image} alt={product.name} style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain'}} />
                        </div>
                        <div style={{padding: '20px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                                <div>
                                    <span style={{fontSize: '12px', color: '#E50914', textTransform: 'uppercase', fontWeight: 'bold'}}>{product.category}</span>
                                    <h3 style={{margin: '5px 0', fontSize: '18px'}}>{product.name}</h3>
                                </div>
                            </div>
                            <p style={{color: '#666', fontSize: '13px', lineHeight: '1.4'}}>{product.desc}</p>
                            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <span style={{fontSize: '20px', fontWeight: 'bold'}}>${product.price.toLocaleString()}</span>
                                <button onClick={() => addToCart(product)} style={{padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'}}>
                                    <Plus size={20}/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* SIDEBAR CARRITO */}
            {cartOpen && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', justifyContent: 'flex-end'}}>
                    <div className="cart-sidebar slide-in-right" style={{width: '100%', maxWidth: '400px', background: '#111', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #333'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #222'}}>
                            <h2 style={{margin: 0}}>Tu Carrito</h2>
                            <button onClick={() => setCartOpen(false)} style={{background: 'transparent', border: 'none', color: '#666', cursor: 'pointer'}}><X size={24}/></button>
                        </div>
                        <div style={{flex: 1, overflowY: 'auto'}}>
                            {cart.length === 0 ? (
                                <div style={{textAlign: 'center', color: '#666', marginTop: '50px'}}>
                                    <ShoppingCart size={40} style={{opacity: 0.3, marginBottom: '10px'}}/>
                                    <p>Tu carrito está vacío.</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} style={{display: 'flex', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #1a1a1a'}}>
                                        <div style={{width: '60px', height: '60px', background: '#fff', borderRadius: '8px', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><img src={item.image} alt="" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}/></div>
                                        <div style={{flex: 1}}>
                                            <h4 style={{margin: '0 0 5px 0', fontSize: '14px'}}>{item.name}</h4>
                                            <p style={{margin: 0, color: '#E50914', fontWeight: 'bold'}}>${(item.price * item.qty).toLocaleString()}</p>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
                                                <button onClick={() => updateQty(item.id, -1)} style={{padding: '2px 8px', background: '#333', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer'}}><Minus size={14}/></button>
                                                <span style={{fontSize: '14px'}}>{item.qty}</span>
                                                <button onClick={() => updateQty(item.id, 1)} style={{padding: '2px 8px', background: '#333', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer'}}><Plus size={14}/></button>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} style={{background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', height: 'fit-content'}}><Trash2 size={18}/></button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #333'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold'}}><span>Total</span><span>${totalCart.toLocaleString()}</span></div>
                            
                            {/* --- BOTÓN DE PAGO CORREGIDO --- */}
                            <button 
                                style={{width: '100%', padding: '15px', background: '#E50914', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center'}} 
                                onClick={() => {
                                    localStorage.setItem('gymfit_cart', JSON.stringify(cart));
                                    onNavigate('checkout');
                                }}
                            >
                                Proceder al Pago <CheckCircle size={18}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}