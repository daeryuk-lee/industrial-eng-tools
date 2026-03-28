import React from 'react';

const modes = [
  { id: 'flags', name: 'Drapeaux', icon: '🏳️', desc: 'Devinez le pays à partir de son drapeau.' },
  { id: 'capitals', name: 'Capitales', icon: '🏛️', desc: 'Reliez chaque pays à sa capitale mondiale.' },
  { id: 'france', name: 'France', icon: '🥖', desc: 'Préfectures et départements français.' },
  { id: 'usa', name: 'USA', icon: '🗽', desc: 'États et capitales des États-Unis.' },
  { id: 'culture', name: 'Culture Géo', icon: '🌎', desc: 'Fleuves, montagnes et records terrestres.' },
];

const GeoHub = ({ onSelectMode }) => {
  return (
    <div className="container animate-fade">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>GeoMaster</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>Devenez un expert du monde en vous amusant.</p>
      </header>

      <div className="grid-modes">
        {modes.map(mode => (
          <div key={mode.id} className="card mode-card" onClick={() => onSelectMode(mode.id)}>
            <span className="mode-icon">{mode.icon}</span>
            <h3 style={{ margin: '0.5rem 0' }}>{mode.name}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: '1.4' }}>{mode.desc}</p>
          </div>
        ))}
      </div>

      <footer style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-light)', fontSize: '0.8rem' }}>
        &copy; 2026 GeoMaster Platform • Données API Temps Réel
      </footer>
    </div>
  );
};

export default GeoHub;
