import React from 'react';
import { ArrowRight, Clock, Users, Zap } from 'lucide-react';

const ProcessView = () => {
  const steps = [
    { name: 'Réception', duration: '15m', efficiency: 98, status: 'completed' },
    { name: 'Usinage', duration: '45m', efficiency: 82, status: 'active' },
    { name: 'Contrôle Qualité', duration: '20m', efficiency: 100, status: 'pending' },
    { name: 'Assemblage', duration: '60m', efficiency: 90, status: 'pending' },
    { name: 'Expédition', duration: '30m', efficiency: 95, status: 'pending' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Analyse de Processus & Flux</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Optimisation du temps de cycle et équilibrage de ligne</p>
      </header>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '24px', minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Clock size={20} color="var(--accent-blue)" />
            <h3 style={{ margin: 0 }}>Temps de Cycle (Takt Time)</h3>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-blue)' }}>
            142 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>sec / unité</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '12px' }}>
            Objectif client : 150 sec. <span style={{ color: 'var(--accent-green)' }}>-5.3% de marge</span>
          </p>
        </div>

        <div className="glass-panel" style={{ flex: 1, padding: '24px', minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Zap size={20} color="var(--accent-green)" />
            <h3 style={{ margin: 0 }}>Efficience Globale</h3>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-green)' }}>
            91.4 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '15px' }}>
            <div style={{ width: '91.4%', height: '100%', background: 'var(--accent-green)', borderRadius: '3px' }}></div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '32px' }}>Visualisation du Flux de Valeur (VSM)</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {steps.map((step, index) => (
            <React.Fragment key={step.name}>
              <div style={{ 
                flex: 1, 
                padding: '20px', 
                background: step.status === 'active' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.02)', 
                border: step.status === 'active' ? '1px solid var(--accent-blue)' : '1px solid var(--border-glass)',
                borderRadius: '12px',
                textAlign: 'center',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Étape {index + 1}</div>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>{step.name}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: step.status === 'active' ? 'var(--accent-blue)' : 'white' }}>{step.duration}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', marginTop: '8px' }}>Eff: {step.efficiency}%</div>
              </div>
              {index < steps.length - 1 && (
                <div style={{ padding: '0 10px', color: 'var(--border-glass)' }}>
                  <ArrowRight size={24} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Users size={20} color="var(--accent-blue)" />
          <h3 style={{ margin: 0 }}>Équilibrage de la Charge</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {['Poste 1', 'Poste 2', 'Poste 3', 'Poste 4'].map((poste, i) => (
            <div key={poste} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ width: '80px', fontSize: '0.9rem' }}>{poste}</span>
              <div style={{ flex: 1, height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${[85, 95, 70, 40][i]}%`, 
                  height: '100%', 
                  background: [85, 95, 70, 40][i] > 90 ? 'var(--accent-red)' : 'var(--accent-blue)',
                  transition: 'width 1s ease-in-out'
                }}></div>
              </div>
              <span style={{ width: '40px', fontSize: '0.85rem', textAlign: 'right' }}>{[85, 95, 70, 40][i]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessView;
