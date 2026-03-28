import React, { useState } from 'react';
import { PlusCircle, Clock, Package, AlertTriangle } from 'lucide-react';

const EntryForm = ({ onAddEntry }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    scraps: '',
    downtime: '',
    comment: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.quantity) return;
    
    onAddEntry({
      ...formData,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: Date.now()
    });
    
    setFormData({ quantity: '', scraps: '', downtime: '', comment: '' });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <PlusCircle size={20} color="var(--accent-blue)" />
        Saisie de Production
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', alignItems: 'end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quantité Produite (u)</label>
          <div style={{ position: 'relative' }}>
            <Package size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="number" 
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '10px 10px 10px 30px', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rebuts (u)</label>
          <div style={{ position: 'relative' }}>
            <AlertTriangle size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-red)' }} />
            <input 
              type="number" 
              placeholder="0"
              value={formData.scraps}
              onChange={(e) => setFormData({...formData, scraps: e.target.value})}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '10px 10px 10px 30px', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Arrêt (min)</label>
          <div style={{ position: 'relative' }}>
            <Clock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="number" 
              placeholder="0"
              value={formData.downtime}
              onChange={(e) => setFormData({...formData, downtime: e.target.value})}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '10px 10px 10px 30px', color: 'white' }}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="glow-blue"
          style={{ 
            background: 'var(--accent-blue)', 
            border: 'none', 
            color: 'var(--bg-main)', 
            padding: '11px', 
            borderRadius: '6px', 
            fontWeight: '600', 
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default EntryForm;
