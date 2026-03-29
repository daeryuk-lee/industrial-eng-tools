import React, { useState, useEffect, useRef } from 'react';
import { translations } from '../data/translations';
import { Moon, Sun, ChevronDown, Check, MessageCircle, X } from 'lucide-react';

const CustomSelect = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="dropdown-container" ref={containerRef} style={{ zIndex: isOpen ? 1000 : 10 }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase', marginLeft: '4px', marginBottom: '4px', display: 'block' }}>{label}</span>
      <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption ? selectedOption.label : 'Select...'}</span>
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((opt) => (
            <div 
              key={opt.value} 
              className={`dropdown-item ${value === opt.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
              {value === opt.value && <Check size={14} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GeoHub = ({ lang, setLang, isFull, setIsFull, isTyping, setIsTyping, qCount, setQCount, onSelectMode, displayMode, setDisplayMode, onShowLegal, theme, toggleTheme }) => {
  const t = translations[lang];
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbTab, setLbTab] = useState('permanent');
  const [lbMode, setLbMode] = useState('all');
  const [lbCount, setLbCount] = useState('all');
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const modes = [
    { id: 'flags', name: t.modes.flags, icon: '🏳️' },
    { id: 'capitals', name: t.modes.capitals, icon: '🏛️' },
    { id: 'islands', name: t.modes.islands, icon: '🏝️' },
    { id: 'france', name: t.modes.france, icon: '🥖' },
    { id: 'usa', name: t.modes.usa, icon: '🗽' },
    { id: 'south_korea', name: t.modes.south_korea, icon: '🏯' },
    { id: 'cameroon', name: t.modes.cameroon, icon: '🦁' },
    { id: 'culture', name: t.modes.culture, icon: '🌎' },
  ];

  const visibleModes = modes.filter(mode => {
    if (mode.id === 'cameroon') return displayMode === 'marathon';
    return true;
  });

  useEffect(() => {
    const recordKey = `geomaster_leaderboard`;
    const records = JSON.parse(localStorage.getItem(recordKey) || '[]');
    setLeaderboard(records);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getFilteredLeaderboard = () => {
    const now = new Date();
    return leaderboard.filter(r => {
      if (lbMode !== 'all' && r.mode !== lbMode) return false;
      if (lbCount !== 'all') {
          const targetTotal = lbCount === '999' ? 999 : parseInt(lbCount);
          if (r.total !== targetTotal && !(lbCount === 'all_marathon' && r.type === 'marathon')) return false;
      }
      if (lbTab === 'permanent') return true;
      const date = new Date(r.date);
      if (lbTab === 'monthly') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      if (lbTab === 'weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return date > oneWeekAgo;
      }
      return true;
    }).slice(0, 10);
  };

  const DISCORD_WEBHOOK_URL = ""; 

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    const message = {
      content: `📢 **Nouveau Feedback GeoMaster !**\n**Message :** ${feedback}\n**Langue :** ${lang.toUpperCase()}\n**Thème :** ${theme}`,
      username: "GeoMaster Bot"
    };

    if (DISCORD_WEBHOOK_URL) {
        try {
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
        } catch (err) { console.error("Erreur Discord:", err); }
    }

    setFeedback('');
    setFeedbackSent(true);
    setTimeout(() => {
        setFeedbackSent(false);
        setIsModalOpen(false);
    }, 2000);
  };

  useEffect(() => {
    if ((qCount !== 'all' || !isTyping) && displayMode === 'marathon') {
        setDisplayMode('classic');
    }
  }, [qCount, isTyping, displayMode]);

  const displayOptions = [
    { value: 'classic', label: t.ui.modeClassic },
    { value: 'nomap', label: t.ui.modeNoMap },
    { value: 'maponly', label: t.ui.modeMapOnly },
  ];
  if (isFull && isTyping) displayOptions.push({ value: 'marathon', label: t.ui.modeMarathon });

  const qCountOptions = [
    { value: '10', label: '10 Questions' },
    { value: '20', label: '20 Questions' },
    { value: '50', label: '50 Questions' },
    { value: 'all', label: t.settings.all },
  ];

  const lbModeOptions = [{ value: 'all', label: `${t.ui.lbCat}: All` }, ...modes.map(m => ({ value: m.id, label: m.name }))];
  const lbCountOptions = [
    { value: 'all', label: `${t.ui.lbCount}: All` },
    { value: '10', label: '10 Qs' },
    { value: '20', label: '20 Qs' },
    { value: '50', label: '50 Qs' },
    { value: '999', label: 'Full (Classic)' },
    { value: 'all_marathon', label: 'Full (Marathon)' },
  ];

  return (
    <div className="container animate-fade">
      <header style={{ textAlign: 'center', marginBottom: '3.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '0', right: '0', display: 'flex', gap: '10px' }}>
            <button className="btn" onClick={() => setIsModalOpen(true)} style={{ padding: '10px', borderRadius: '50%', width: '45px', height: '45px', background: 'var(--bg-card)' }}>
                <MessageCircle size={20} />
            </button>
            <button className="btn" onClick={toggleTheme} style={{ padding: '10px', borderRadius: '50%', width: '45px', height: '45px', background: 'var(--bg-card)' }}>
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {['fr', 'en', 'kor'].map(l => (
            <button key={l} className={`btn ${lang === l ? 'btn-primary' : ''}`} onClick={() => setLang(l)} style={{ textTransform: 'uppercase', padding: '8px 16px', fontSize: '0.8rem' }}>
              {l}
            </button>
          ))}
        </div>
        
        <h1 style={{ fontSize: '4.5rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: '900', letterSpacing: '-2px' }}>{t.title}</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.3rem', fontWeight: '500', opacity: 0.8 }}>{t.subtitle}</p>
      </header>

      <div className="card" style={{ marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '2.5rem', justifyContent: 'center', alignItems: 'flex-end', padding: '2rem', position: 'relative', zIndex: 100 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase', marginLeft: '4px', marginBottom: '4px' }}>Format</span>
            <div style={{ display: 'flex', background: 'var(--bg-app)', padding: '4px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <button className={`btn ${!isTyping ? 'btn-primary' : ''}`} onClick={() => setIsTyping(false)} style={{ borderRadius: '12px', border: 'none', padding: '10px 20px', fontSize: '0.85rem' }}>{t.ui.qcm}</button>
                <button className={`btn ${isTyping ? 'btn-primary' : ''}`} onClick={() => setIsTyping(true)} style={{ borderRadius: '12px', border: 'none', padding: '10px 20px', fontSize: '0.85rem' }}>{t.ui.typing}</button>
            </div>
        </div>

        <CustomSelect label={t.ui.displayMode} value={displayMode} options={displayOptions} onChange={setDisplayMode} />
        <CustomSelect label={t.settings.qCount} value={qCount} options={qCountOptions} onChange={(val) => { setQCount(val); setIsFull(val === 'all'); }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
        <div className="grid-modes">
          {visibleModes.map(mode => (
            <div key={mode.id} className="card mode-card" onClick={() => onSelectMode(mode.id)} style={{ position: 'relative', overflow: 'hidden', border: '2px solid var(--border)' }}>
              <span className="mode-icon">{mode.icon}</span>
              <h3 style={{ margin: '0.5rem 0', fontWeight: '900', fontSize: '1.4rem' }}>{mode.name}</h3>
              {isFull && <div style={{ position: 'absolute', top: '15px', right: '-35px', background: 'var(--secondary)', color: 'white', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '0.75rem', fontWeight: '900', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>FULL</div>}
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '2rem', maxHeight: '800px', display: 'flex', flexDirection: 'column', border: '2px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 2rem 0', color: 'var(--primary)', textAlign: 'center', fontSize: '1.8rem', fontWeight: '900' }}>🏆 {t.ui.leaderboard}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
            <CustomSelect label={t.ui.lbCat} value={lbMode} options={lbModeOptions} onChange={setLbMode} />
            <CustomSelect label={t.ui.lbCount} value={lbCount} options={lbCountOptions} onChange={setLbCount} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', background: 'var(--bg-app)', padding: '6px', borderRadius: '16px' }}>
            <button onClick={() => setLbTab('permanent')} className={`btn ${lbTab === 'permanent' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '10px', fontSize: '0.8rem', border: 'none' }}>{t.ui.lbAll}</button>
            <button onClick={() => setLbTab('monthly')} className={`btn ${lbTab === 'monthly' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '10px', fontSize: '0.8rem', border: 'none' }}>{t.ui.lbMonth}</button>
            <button onClick={() => setLbTab('weekly')} className={`btn ${lbTab === 'weekly' ? 'btn-primary' : ''}`} style={{ flex: 1, padding: '10px', fontSize: '0.8rem', border: 'none' }}>{t.ui.lbWeek}</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', minHeight: '300px', paddingRight: '5px' }}>
            {getFilteredLeaderboard().length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '1rem', marginTop: '4rem', opacity: 0.5 }}>Aucun record.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {getFilteredLeaderboard().map((record, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: i === 0 ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-app)', borderRadius: '16px', border: '2px solid', borderColor: i === 0 ? '#f59e0b' : 'var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: '900', color: i === 0 ? '#f59e0b' : 'var(--text-light)', fontSize: '1.1rem', width: '30px' }}>{i + 1}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '800', fontSize: '1.05rem' }}>{record.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '700' }}>{record.mode} • {record.type}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '1.1rem' }}>{record.score}/{record.total}</div>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '700' }}>⏱️ {formatTime(record.time)}</div>
                    </div>
                    </div>
                ))}
                </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content card" onClick={e => e.stopPropagation()}>
                <button className="btn" onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', padding: '8px', borderRadius: '50%', width: '40px', height: '40px', background: 'var(--bg-app)' }}>
                    <X size={20} />
                </button>
                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: '900' }}>💬 {t.ui.feedback}</h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontWeight: '500' }}>Votre message sera envoyé directement à l'équipe administrative.</p>
                <form onSubmit={handleFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <textarea 
                        rows="5"
                        placeholder={t.ui.feedbackPlaceholder} 
                        value={feedback} 
                        onChange={e => setFeedback(e.target.value)}
                        style={{ width: '100%', padding: '1.2rem', fontSize: '1rem', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--bg-app)', color: 'var(--text-dark)', outline: 'none', resize: 'none' }}
                        autoFocus
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '1.2rem', fontSize: '1.1rem' }}>
                        {t.ui.send} 🚀
                    </button>
                </form>
                {feedbackSent && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--success)', fontWeight: '800', animation: 'fadeIn 0.3s forwards' }}>
                        ✅ Message envoyé avec succès !
                    </div>
                )}
            </div>
        </div>
      )}

      <footer style={{ marginTop: '6rem', textAlign: 'center', padding: '4rem 0', borderTop: '2px solid var(--border)' }}>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>{t.ui.credits}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', fontSize: '1rem', alignItems: 'center' }}>
            <button onClick={onShowLegal} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '900', fontSize: '1rem' }}>{t.ui.legal}</button>
            <span style={{ color: 'var(--border)', fontSize: '1.5rem' }}>|</span>
            <span style={{ color: 'var(--text-light)', fontWeight: '800' }}>GeoMaster v2.5 Premium</span>
        </div>
      </footer>
    </div>
  );
};

export default GeoHub;
