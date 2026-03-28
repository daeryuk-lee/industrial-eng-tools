import React from 'react';
import { translations } from '../data/translations';

const GeoHub = ({ lang, setLang, isFull, setIsFull, isTyping, setIsTyping, onSelectMode }) => {
  const t = translations[lang];
  const modes = [
    { id: 'flags', name: t.modes.flags, icon: '🏳️' },
    { id: 'capitals', name: t.modes.capitals, icon: '🏛️' },
    { id: 'france', name: t.modes.france, icon: '🥖' },
    { id: 'usa', name: t.modes.usa, icon: '🗽' },
    { id: 'culture', name: t.modes.culture, icon: '🌎' },
  ];

  return (
    <div className="container animate-fade">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          {['fr', 'en', 'kor'].map(l => (
            <button key={l} className={`btn ${lang === l ? 'btn-primary' : ''}`} onClick={() => setLang(l)} style={{ textTransform: 'uppercase', padding: '8px 16px' }}>
              {l}
            </button>
          ))}
        </div>
        
        <h1 style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: '800' }}>{t.title}</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.2rem' }}>{t.subtitle}</p>
      </header>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <button className={`btn ${!isTyping ? 'btn-primary' : ''}`} onClick={() => setIsTyping(false)}>{t.ui.qcm}</button>
        <button className={`btn ${isTyping ? 'btn-primary' : ''}`} onClick={() => setIsTyping(true)}>{t.ui.typing}</button>
        <div style={{ width: '2px', background: '#e2e8f0', margin: '0 10px' }} />
        <button className={`btn ${!isFull ? 'btn-primary' : ''}`} onClick={() => setIsFull(false)}>{t.ui.quick}</button>
        <button className={`btn ${isFull ? 'btn-primary' : ''}`} onClick={() => setIsFull(true)}>{t.ui.all}</button>
      </div>

      <div className="grid-modes">
        {modes.map(mode => (
          <div key={mode.id} className="card mode-card" onClick={() => onSelectMode(mode.id)} style={{ position: 'relative', overflow: 'hidden' }}>
            <span className="mode-icon">{mode.icon}</span>
            <h3 style={{ margin: '0.5rem 0' }}>{mode.name}</h3>
            {isFull && <div style={{ position: 'absolute', top: '10px', right: '-30px', background: 'var(--secondary)', color: 'white', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '0.7rem', fontWeight: 'bold' }}>FULL</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeoHub;
