// src/components/dashboard/RoutinesView.jsx

import React from 'react';
import { Plus, Sun, Sunrise, Dumbbell } from 'lucide-react';

export default function RoutinesView({ 
    user, 
    myRoutines, 
    loadRoutines, 
    startWorkoutSession, 
    linkedClients,
    onActivateZenMode // <-- Prop de Modo Zen
}) {

    // Helper para obtener el nombre del ejercicio, manejando objetos o strings
    const getExerciseName = (ex) => {
        // Si el ejercicio es un objeto (ej: {name: 'press banca', ...}), devuelve el nombre.
        if (typeof ex === 'object' && ex !== null && ex.name) {
            return ex.name;
        }
        // Si es una cadena (ej: 'press banca' en los datos de mock), devuelve la cadena.
        return ex;
    };
    
    // Usamos myRoutines directamente si existen, si no, usamos el mockup para visualizar
    const routinesData = myRoutines && myRoutines.length > 0 ? myRoutines : [
        // Datos de ejemplo para renderizar si no hay rutinas cargadas
        // NOTA: Mantenemos estos como strings para no complicar el mock
        { id: '1', name: 'DÍA 1 (Press)', date: '24/11/2025', exercises: ['press banca', 'aperturas', 'triceps polea'] },
        { id: '2', name: 'DÍA 2 (Jalón)', date: '25/11/2025', exercises: ['jalón al pecho', 'remo en máquina', 'curl de biceps'] }
    ];
    
    const isClient = user.role === 'Client';
    
    // Función para manejar el inicio de la sesión
    const handleStart = (routine) => {
        if (startWorkoutSession) {
            startWorkoutSession(routine);
        } else {
            alert('Funcionalidad de inicio de entrenamiento no disponible.');
        }
    };

    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            
            {/* --- CABECERA Y BOTONES DE ACCIÓN --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 className="page-title" style={{ color: 'white', margin: 0 }}>
                    {isClient ? 'Mis Entrenamientos' : 'Rutinas de Clientes'}
                </h2>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                    
                    {/* BOTÓN MODO ZEN (Solo para Clientes) */}
                    {isClient && (
                        <button 
                            onClick={onActivateZenMode} 
                            style={{
                                padding: '10px 20px', 
                                background: '#005f73', // Azul calmante
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#00798a'}
                            onMouseLeave={(e) => e.target.style.background = '#005f73'}
                        >
                            <Sunrise size={18} /> Modo Zen
                        </button>
                    )}

                    {/* BOTÓN NUEVA RUTINA (ya existente, visible para Entrenador o Cliente) */}
                    <button 
                        style={{
                            padding: '10px 20px', 
                            background: '#E50914', // Rojo GYMFIT
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={18} /> Nueva Rutina
                    </button>
                </div>
            </div>

            {/* --- MENSAJE DE SIN RUTINAS --- */}
            {isClient && myRoutines && myRoutines.length === 0 && (
                <div style={{ padding: '40px', background: '#1c1c1c', borderRadius: '12px', textAlign: 'center', border: '1px dashed #333', marginBottom: '20px' }}>
                    <Dumbbell size={40} color="#E50914" style={{marginBottom: '10px'}}/>
                    <h4 style={{margin: '5px 0', color: '#ccc'}}>No tienes rutinas asignadas.</h4>
                    <p style={{color: '#666', fontSize: '14px'}}>Pídele a tu entrenador que te asigne una, o crea una nueva.</p>
                </div>
            )}

            {/* --- LISTA DE RUTINAS --- */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {/* LÍNEA 98: El map principal usa routine.id como key */}
                {routinesData.map((routine) => (
                    <div key={routine.id} style={{
                        width: '300px',
                        background: '#1c1c1c', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        border: '1px solid #333',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.5em' }}>{routine.name}</h3>
                            <span style={{ color: '#666', fontSize: '12px' }}>{routine.date}</span>
                        </div>
                        
                        <ul style={{ listStyleType: 'none', padding: 0, margin: '15px 0' }}>
                            {/* LÍNEA 119: El map interno es el que causaba el error de key y el error de renderizado */}
                            {routine.exercises.slice(0, 2).map((ex, idx) => (
                                <li 
                                    key={idx} // <-- CORRECCIÓN 1: Añadir la prop key
                                    style={{ color: '#E50914', marginBottom: '5px', fontSize: '14px' }}
                                >
                                    • {getExerciseName(ex)} {/* <-- CORRECCIÓN 2: Renderizar solo el nombre */}
                                </li>
                            ))}
                            {routine.exercises.length > 2 && (
                                <li style={{ color: '#888', fontSize: '12px' }}>
                                    ... y {routine.exercises.length - 2} ejercicios más.
                                </li>
                            )}
                        </ul>

                        <button 
                            onClick={() => handleStart(routine)} 
                            disabled={!startWorkoutSession} 
                            style={{
                                width: '100%', 
                                padding: '12px', 
                                background: startWorkoutSession ? 'linear-gradient(90deg, #E50914, #ff4d4d)' : '#444',
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: startWorkoutSession ? 'pointer' : 'not-allowed', 
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            {startWorkoutSession ? 'EMPEZAR' : 'NO DISPONIBLE'}
                        </button>
                    </div>
                ))}
            </div>

            {user.role === 'Trainer' && (
                <div style={{ marginTop: '30px', padding: '20px', background: '#333', borderRadius: '12px', color: '#ccc' }}>
                    <p style={{ margin: 0 }}>
                        Como **Entrenador**, ves una lista de rutinas de ejemplo. Usa las funcionalidades de gestión de clientes/rutinas (no mostradas aquí) para asignar a tus clientes.
                    </p>
                </div>
            )}
        </div>
    );
}