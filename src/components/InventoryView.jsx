import React, { useState } from 'react';
import { Search, Filter, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

const InventoryView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const stocks = [
    { id: 'REF-001', name: 'Roulements à billes SKF', category: 'Mécanique', qty: 450, min: 100, unit: 'u', status: 'OK' },
    { id: 'REF-012', name: 'Capteurs de proximité', category: 'Electrique', qty: 12, min: 25, unit: 'u', status: 'CRITICAL' },
    { id: 'REF-045', name: 'Lubrifiant Haute Temp', category: 'Consommable', qty: 85, min: 50, unit: 'L', status: 'WARNING' },
    { id: 'REF-089', name: 'Courroies de transmission', category: 'Mécanique', qty: 200, min: 40, unit: 'u', status: 'OK' },
    { id: 'REF-102', name: 'Automates Siemens S7', category: 'Electrique', qty: 3, min: 2, unit: 'u', status: 'OK' },
  ];

  const filteredStocks = stocks.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Gestion des Stocks & Pièces</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Inventaire temps réel et alertes de réapprovisionnement</p>
      </header>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Rechercher une référence ou un nom..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
          />
        </div>
        <button className="glass-panel" style={{ padding: '12px 20px', cursor: 'pointer', color: 'var(--text-primary)', border: '1px solid var(--border-glass)' }}>
          <Filter size={18} />
        </button>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>RÉFÉRENCE</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>NOM DE LA PIÈCE</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>CATÉGORIE</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>STOCK ACTUEL</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem' }}>STATUT</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{item.id}</td>
                <td style={{ padding: '16px 24px', fontWeight: '500' }}>{item.name}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>{item.category}</span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600' }}>{item.qty} {item.unit}</span>
                    <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${Math.min(100, (item.qty / (item.min * 2)) * 100)}%`, 
                        height: '100%', 
                        background: item.status === 'CRITICAL' ? 'var(--accent-red)' : item.status === 'WARNING' ? '#f59e0b' : 'var(--accent-green)'
                      }}></div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {item.status === 'CRITICAL' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: '600' }}>
                      <AlertCircle size={14} /> CRITIQUE
                    </span>
                  )}
                  {item.status === 'WARNING' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600' }}>
                      <AlertCircle size={14} /> BAS
                    </span>
                  )}
                  {item.status === 'OK' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '0.85rem', fontWeight: '600' }}>
                      <TrendingUp size={14} /> NORMAL
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryView;
