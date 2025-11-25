import React, { useState } from 'react';
// CORRECCIÓN: Importar desde ../api porque estamos dentro de pages/
import { authService } from '../../api';  // <--- Agrega otro "../"

export default function AuthPage({ onLoginSuccess, onNavigate, initialView }) {
  // Si initialView es 'register', empezamos en registro
  const [isLogin, setIsLogin] = useState(initialView === 'login');
  const [role, setRole] = useState('Client');
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
        onLoginSuccess(); 
      } else {
        const parts = (formData.firstName || '').split(' ');
        await authService.register({
            firstName: parts[0] || 'User', lastName: parts.slice(1).join(' ') || '.',
            email: formData.email, password: formData.password, role: role
        });
        onLoginSuccess(); 
      }
    } catch (err) { setError(err.message || 'Error'); } finally { setLoading(false); }
  };

  return (
    <div className="app-container auth-bg">
      <div className="auth-card">
        <h2 className="brand-title">GYMFIT</h2>
        <p className="auth-subtitle">{isLogin ? 'Bienvenido' : 'Crear Cuenta'}</p>
        {error && <div className="error-msg">{error}</div>}
        
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          {!isLogin && (
            <div className="role-selector">
               <button type="button" className={`role-btn ${role === 'Client' ? 'active' : ''}`} onClick={() => setRole('Client')}>Cliente</button>
               <button type="button" className={`role-btn ${role === 'Trainer' ? 'active' : ''}`} onClick={() => setRole('Trainer')}>Entrenador</button>
            </div>
          )}
          {!isLogin && <div className="input-group"><input name="firstName" className="input-field" placeholder="Nombre" onChange={handleChange} /></div>}
          <div className="input-group"><input name="email" className="input-field" placeholder="Email" onChange={handleChange} /></div>
          <div className="input-group"><input name="password" type="password" className="input-field" placeholder="Contraseña" onChange={handleChange} /></div>
          <button type="submit" className="btn-primary">{loading ? '...' : (isLogin ? 'ENTRAR' : 'REGISTRAR')}</button>
        </form>

        <div className="switch-text">
          {isLogin ? '¿Nuevo aquí?' : '¿Ya tienes cuenta?'}
          <button className="btn-link" onClick={() => { setError(''); setIsLogin(!isLogin); }}>
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </div>
        <button className="btn-link" style={{marginTop: '20px'}} onClick={() => onNavigate('landing')}>← Volver</button>
      </div>
    </div>
  );
}