import React from 'react';
import { translations } from '../data/translations';

const Legal = ({ lang, onBack }) => {
  const t = translations[lang];
  const l = t.legal;

  return (
    <div className="container animate-fade" style={{ maxWidth: '900px', padding: '2rem' }}>
      <button className="btn" onClick={onBack} style={{ marginBottom: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border)', fontWeight: 'bold' }}>← {t.back}</button>
      
      <div className="card" style={{ padding: '3.5rem', lineHeight: '1.8', fontSize: '1rem' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '2.5rem', borderBottom: '4px solid var(--primary)', paddingBottom: '1rem', fontWeight: '900', fontSize: '2.5rem' }}>{t.ui.legal}</h1>
        
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '1rem', fontWeight: '800' }}>{l.s1_title}</h2>
          <p>{l.s1_text}</p>
          <p style={{ marginTop: '1rem' }}>
            <strong>{l.s1_owner}</strong> c0bb237<br />
            <strong>{l.s1_tech}</strong> c0bb237 & Gemini CLI (Intelligence Artificielle)<br />
            <strong>{l.s1_resp}</strong> c0bb237 - {l.s1_contact}
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '1rem', fontWeight: '800' }}>{l.s2_title}</h2>
          <p>{l.s2_text}</p>
          <p>{l.s2_address}</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '1rem', fontWeight: '800' }}>{l.s3_title}</h2>
          <p>{l.s3_text}</p>
          <p style={{ marginTop: '1rem' }}><strong>{l.s3_warn}</strong></p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '1rem', fontWeight: '800' }}>{l.s4_title}</h2>
          <p>{l.s4_text}</p>
          <p style={{ marginTop: '1rem' }}>{l.s4_usage}</p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--text-dark)', marginBottom: '1rem', fontWeight: '800' }}>{l.s5_title}</h2>
          <p>{l.s5_text}</p>
        </section>

        <footer style={{ marginTop: '4rem', fontSize: '0.9rem', color: 'var(--text-light)', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          {t.ui.credits}
        </footer>
      </div>
    </div>
  );
};

export default Legal;
