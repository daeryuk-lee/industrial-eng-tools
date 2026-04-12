import React from 'react';
import { translations } from '../data/translations';

const Privacy = ({ lang, onBack }) => {
  const t = translations[lang];
  const p = t.privacy;

  return (
    <div className="container animate-fade" style={{ maxWidth: '900px', padding: '2rem' }}>
      <button className="btn" onClick={onBack} style={{ marginBottom: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border)', fontWeight: 'bold' }}>← {t.back}</button>
      
      <div className="card" style={{ padding: '3.5rem', lineHeight: '1.8', fontSize: '1.1rem' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '2.5rem', borderBottom: '4px solid var(--primary)', paddingBottom: '1rem', fontWeight: '900', fontSize: '2.5rem' }}>{p.title}</h1>
        
        <section style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '500' }}>{p.intro}</p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '1.2rem', fontWeight: '800' }}>{p.dataCollectionTitle}</h2>
          <p>{p.dataCollectionText}</p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '1.2rem', fontWeight: '800' }}>{p.adsTitle}</h2>
          <p>{p.adsText}</p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '1.2rem', fontWeight: '800' }}>{p.cookiesTitle}</h2>
          <p>{p.cookiesText}</p>
        </section>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '1.2rem', fontWeight: '800' }}>{p.changesTitle}</h2>
          <p>{p.changesText}</p>
        </section>

        <footer style={{ marginTop: '4rem', fontSize: '0.9rem', color: 'var(--text-light)', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          {t.ui.credits}
        </footer>
      </div>
    </div>
  );
};

export default Privacy;
