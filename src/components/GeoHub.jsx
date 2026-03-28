import React from 'react';
import { translations } from '../data/translations';

const GeoHub = ({ lang, setLang, isFull, setIsFull, isTyping, setIsTyping, qCount, setQCount, onSelectMode }) => {
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
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {['fr', 'en', 'kor'].map(l => (
            <button key={l} className={`btn ${lang === l ? 'btn-primary' : ''}`} onClick={() => setLang(l)} style={{ textTransform: 'uppercase', padding: '6px 12px', fontSize: '0.8rem' }}>
              {l}
            </button>
          ))}
        </div>
        
        <h1 style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: '800' }}>{t.title}</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>{t.subtitle}</p>
      </header>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${!isTyping ? 'btn-primary' : ''}`} onClick={() => setIsTyping(false)}>{t.ui.qcm}</button>
          <button className={`btn ${isTyping ? 'btn-primary' : ''}`} onClick={() => setIsTyping(true)}>{t.ui.typing}</button>
        </div>

        <div style={{ width: '2px', height: '30px', background: '#e2e8f0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-light)' }}>{t.settings.qCount}</span>
          <select 
            value={qCount} 
            onChange={(e) => {
              const val = e.target.value;
              setQCount(val);
              setIsFull(val === 'all');
            }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid var(--primary)', outline: 'none', background: 'white', fontWeight: 'bold' }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="all">{t.settings.all}</option>
          </select>
        </div>
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
