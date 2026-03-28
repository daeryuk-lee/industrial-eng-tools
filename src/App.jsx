import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryView from './components/InventoryView';
import ProcessView from './components/ProcessView';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryView />;
      case 'processes':
        return <ProcessView />;
      case 'analytics':
        return (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--text-secondary)' }}>Analyses Prédictives</h2>
            <p>Intelligence artificielle en cours d'intégration pour la maintenance prédictive...</p>
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
