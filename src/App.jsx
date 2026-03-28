import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--text-secondary)' }}>Gestion des Stocks</h2>
            <p>Module en cours de développement...</p>
          </div>
        );
      case 'processes':
        return (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--text-secondary)' }}>Analyse de Processus</h2>
            <p>Module en cours de développement...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--text-secondary)' }}>Analyses Avancées</h2>
            <p>Module en cours de développement...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main style={{ 
        flex: 1, 
        padding: '20px 40px 20px 20px', 
        height: '100vh', 
        overflowY: 'auto' 
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '20px' }}>
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
