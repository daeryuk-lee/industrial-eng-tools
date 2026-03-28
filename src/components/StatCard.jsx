import React from 'react';

const StatCard = ({ title, value, unit, trend, color }) => {
  const isPositive = trend > 0;
  
  return (
    <div className="glass-panel" style={{ padding: '24px', flex: 1, minWidth: '240px' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '2rem', fontWeight: '700', color: color || 'var(--text-primary)' }}>{value}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          background: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)'
        }}>
          {isPositive ? '+' : ''}{trend}%
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>vs hier</span>
      </div>
      
      {/* Progress Bar Simulation */}
      <div style={{ width: '100%', height: '4px', background: 'var(--border-glass)', borderRadius: '2px', marginTop: '20px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${value}%`, 
          height: '100%', 
          background: color || 'var(--accent-blue)', 
          borderRadius: '2px',
          boxShadow: `0 0 10px ${color || 'var(--accent-blue)'}`
        }}></div>
      </div>
    </div>
  );
};

export default StatCard;
