import React from 'react';
import './LandingPage.css'; 

export default function LandingPage({ onNavigate }) {
  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      {/* NAVBAR */}
      <nav className="navbar">
        <a href="#" className="nav-logo" onClick={() => onNavigate('landing')}>GYMFIT</a>
        <div className="nav-links">
          <a href="#home" className="nav-link">Inicio</a>
          <a href="#about" className="nav-link">Nosotros</a>
          {/* BOTÓN TIENDA AGREGADO */}
          <button onClick={() => onNavigate('store')} className="nav-link" style={{background:'transparent', border:'none', cursor:'pointer', fontSize:'16px'}}>
             Tienda
          </button>
          <a href="#features" className="nav-link">Servicios</a>
          <a href="#contact" className="nav-link">Contacto</a>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 24px', margin: 0 }} onClick={() => onNavigate('login')}>
          Área Clientes
        </button>
      </nav>

      {/* HERO */}
      <div id="home" className="app-container hero-container">
        <div className="hero-content">
          <span className="hero-tagline">Tu evolución comienza hoy</span>
          <h1 className="brand-title">DOMINA<br />TU CUERPO</h1>
          <p className="auth-subtitle">La plataforma definitiva para gestionar tus entrenamientos.</p>
          <button className="btn-primary" style={{position:'relative', zIndex:100}} onClick={() => onNavigate('login')}>
            EMPEZAR AHORA
          </button>
        </div>
      </div>

      {/* QUIENES SOMOS */}
      <section id="about" className="section section-alt">
        <div className="section-heading"><h2>Quiénes Somos</h2><p>Tecnología y deporte unidos.</p></div>
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', color: '#ccc' }}>
          <p>En GymFit eliminamos el caos de las hojas de cálculo. Conectamos entrenadores y atletas para maximizar resultados reales basados en datos.</p>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="features" className="section">
        <div className="section-heading"><h2>Servicios</h2><p>Todo lo que necesitas para crecer.</p></div>
        <div className="features-grid">
          <div className="feature-card"><h3>📊 Seguimiento</h3><p>Registra cada repetición y peso.</p></div>
          <div className="feature-card"><h3>⚡ Rutinas</h3><p>Planes 100% personalizados.</p></div>
          <div className="feature-card"><h3>🤝 Conexión</h3><p>Chat directo con tu coach.</p></div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="footer">
        <div className="section-heading"><h2>Contáctanos</h2></div>
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <div className="info-item"><span style={{color: '#E50914'}}>📍</span> Bogotá, Colombia</div>
          <div className="info-item"><span style={{color: '#E50914'}}>📧</span> contacto@gymfit.com</div>
          <div className="info-item"><span style={{color: '#E50914'}}>📱</span> +57 300 123 4567</div>
        </div>
        <div className="footer-bottom"><p>&copy; 2025 GymFit Inc.</p></div>
      </footer>
    </div>
  );
}