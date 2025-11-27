// src/components/dashboard/ZenModeView.jsx

import React from 'react';
// IMPORTACIÓN CORREGIDA: Incluir todos los íconos utilizados
import { X, Heart, Sun, Feather, Clock } from 'lucide-react'; 

export default function ZenModeView({ onDeactivate }) {

    // Contenido de estiramientos/meditación
    const exercises = [
        { name: "Respiración Profunda", duration: "3 min", icon: <Feather size={20} color="#88BFFF" /> },
        { name: "Estiramiento del Gato-Vaca", duration: "2 min", icon: <Clock size={20} color="#88BFFF" /> },
        { name: "Flexión de Tronco Sentado", duration: "1 min", icon: <Heart size={20} color="#88BFFF" /> },
    ];

    return (
        <div className="fade-in" style={{ padding: '20px', color: 'white' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 className="page-title" style={{ color: '#88BFFF', margin: 0 }}>
                    🌊 Modo Zen Activo: Enfocando la Mente
                </h2>
                
                <button 
                    onClick={onDeactivate} 
                    style={{
                        padding: '10px 20px', 
                        background: '#E50914', // Rojo para salir
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background 0.3s'
                    }}
                >
                    <X size={18} /> Volver a Entrenamientos
                </button>
            </div>

            {/* --- Tarjeta de Meditación/Instrucciones --- */}
            <div style={{
                background: 'rgba(0, 50, 100, 0.5)', 
                padding: '30px', 
                borderRadius: '15px', 
                border: '1px solid #0077B6',
                marginBottom: '30px'
            }}>
                <h3 style={{ color: '#B3CDE0', marginTop: 0 }}>Guía de Relajación</h3>
                <p style={{ color: '#B3CDE0', lineHeight: '1.6' }}>
                    Tómate este tiempo para recargar energías. La música relajante está sonando en el fondo. Cierra los ojos y sigue la siguiente rutina de estiramientos suaves o ejercicios de respiración.
                </p>
            </div>

            {/* --- Ejercicios/Estiramientos --- */}
            <h3 style={{ color: '#B3CDE0', marginBottom: '20px' }}>Estiramientos Sugeridos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {exercises.map((item, index) => (
                    <div 
                        key={index} // <-- CORRECCIÓN: Añadir la prop key aquí
                        style={{
                            background: 'rgba(0, 50, 100, 0.3)', 
                            padding: '15px', 
                            borderRadius: '10px', 
                            borderLeft: '4px solid #88BFFF',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.icon}
                            <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                        </div>
                        <span style={{ color: '#B3CDE0' }}>{item.duration}</span>
                    </div>
                ))}
            </div>

        </div>
    );
}