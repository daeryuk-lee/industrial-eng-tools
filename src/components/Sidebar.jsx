import React from 'react';
import { LayoutDashboard, PackageSearch, Activity, BarChart3, Settings } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Stocks', icon: PackageSearch },
    { id: 'processes', label: 'Processus', icon: Activity },
    { id: 'analytics', label: 'Analyses', icon: BarChart3 },
  ];

  return (
    <aside className="glass-panel sidebar" style={{ 
      width: '260px', 
      height: 'calc(100vh - 40px)', 
      margin: '20px', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '24px'
    }}>
      <div className="brand" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--accent-blue)', borderRadius: '8px' }} className="glow-blue"></div>
        <h2 style={{ fontSize: '1.2rem', margin: 0, letterSpacing: '1px' }}>IE TOOLS</h2>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              margin: '8px 0',
              border: 'none',
              borderRadius: '8px',
              background: activeView === item.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              color: activeView === item.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              fontSize: '1rem'
            }}
            className={activeView === item.id ? 'glow-blue' : ''}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="settings" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
        <button style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          border: 'none',
          background: 'transparent',
          color: 'var(--text-secondary)',
          cursor: 'pointer'
        }}>
          <Settings size={20} />
          Paramètres
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
