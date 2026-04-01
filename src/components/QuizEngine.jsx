import React, { useState, useEffect, useRef } from 'react';
import stringSimilarity from 'string-similarity';
import { frenchDepartments, usStates, geoCulture, southKoreaProvinces, cameroonRegions } from '../data/geographyData';
import { translations } from '../data/translations';
import { koreanCapitals, koreanStates, koreanDepartments } from '../data/koreanData';
import { frenchCapitals } from '../data/frenchCapitals';
import InteractiveMap from './InteractiveMap';

const QuizEngine = ({ mode, lang, isFull, isTyping, qCount, onBack, displayMode }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [saved, setSaved] = useState(false);
  
  const [foundItems, setFoundItems] = useState([]);
  const inputRef = useRef(null);

  const t = translations[lang];
  const isMarathon = displayMode === 'marathon' && isFull && isTyping;
  const isCulture = mode === 'culture';
  const isMapRequirement = mode === 'south_korea' || mode === 'cameroon';

  useEffect(() => {
    fetchData();
  }, [mode, lang]);

  useEffect(() => {
    let interval = null;
    if (!loading && !showResult && (questions.length > 0)) {
      interval = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, showResult, questions]);

  useEffect(() => {
    if (!loading && !showResult && inputRef.current) {
        inputRef.current.focus();
    }
  }, [loading, showResult, currentIdx, feedback]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    let data = [];
    
    try {
      if (mode === 'flags' || mode === 'capitals' || mode === 'islands') {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags,translations,cca3,latlng,independent,capitalInfo');
        if (!res.ok) throw new Error("Erreur serveur API");
        const resData = await res.json();
        
        if (mode === 'islands') {
          data = resData.filter(c => !c.independent && c.cca3 !== 'TWN');
        } else {
          data = resData.filter(c => (c.independent || c.cca3 === 'TWN') && c.capital && c.capital.length > 0);
        }
      } else if (mode === 'france') data = frenchDepartments;
      else if (mode === 'usa') data = usStates;
      else if (mode === 'south_korea') data = southKoreaProvinces;
      else if (mode === 'cameroon') data = cameroonRegions;
      else if (mode === 'culture') data = geoCulture;

      if (data.length === 0) throw new Error("Aucune donnée disponible");
      generateQuestions(data);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getTranslatedName = (country) => {
    let name = country.name.common;
    if (lang === 'kor' && country.translations?.kor) name = country.translations.kor.common;
    else if (lang === 'fr' && country.translations?.fra) name = country.translations.fra.common;
    
    const overrides = {
        "fr": { "Surinam": "Suriname", "Îles du Cap-Vert": "Cap-Vert", "Cabo Verde": "Cap-Vert" },
        "en": { "Surinam": "Suriname", "Cabo Verde": "Cape Verde" }
    };
    
    if (overrides[lang] && overrides[lang][name]) return overrides[lang][name];
    if (lang === 'fr' && name === "Cabo Verde") return "Cap-Vert";
    
    return name;
  };

  const getTranslatedCapitals = (country) => {
    if (!country.capital || country.capital.length === 0) return ["?"];
    
    // Hard override for Israel
    if (country.cca3 === 'ISR') {
        if (lang === 'fr') return ["Tel-Aviv"];
        if (lang === 'kor') return ["텔아비브"];
        return ["Tel Aviv"];
    }

    return country.capital.map(original => {
        if (lang === 'kor') return koreanCapitals[original] || original;
        if (lang === 'fr') return frenchCapitals[original] || original;
        return original;
    });
  };

  const getTranslatedState = (name, withOriginal = false) => {
    if (lang === 'kor') {
      const kor = koreanStates[name] || name;
      return withOriginal ? `${kor} (${name})` : kor;
    }
    return name;
  };

  const getTranslatedDept = (name, withOriginal = false) => {
    if (lang === 'kor') {
      const kor = koreanDepartments[name] || name;
      return withOriginal ? `${kor} (${name})` : kor;
    }
    return name;
  };

  const generateQuestions = (data) => {
    let qList = data.map(item => {
      let question, answer, choices, code, latlng;
      
      if (mode === 'flags' || mode === 'islands') {
        const name = getTranslatedName(item);
        let templateText = mode === 'islands' ? t.templates.islands : t.templates.flags;
        question = { type: 'image', value: item.flags.svg, text: templateText, isIsland: mode === 'islands', source: "Source: WikiMedia / RestCountries" };
        answer = name;
        choices = [answer, ...data.filter(d => getTranslatedName(d) !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => getTranslatedName(d))];
        code = item.cca3;
        latlng = item.capitalInfo?.latlng || item.latlng;
      } else if (mode === 'capitals') {
        const name = getTranslatedName(item);
        const capitals = getTranslatedCapitals(item);
        question = { type: 'text', text: t.templates.capitals.replace('{name}', name) };
        answer = capitals; // Array of possible answers
        choices = [capitals[0], ...data.filter(d => {
            const dCaps = getTranslatedCapitals(d);
            return !dCaps.some(c => capitals.includes(c));
        }).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => getTranslatedCapitals(d)[0])];
        code = item.cca3;
        latlng = item.capitalInfo?.latlng || item.latlng;
      } else if (mode === 'france') {
        const name = getTranslatedDept(item.name, lang === 'kor');
        const prefecture = getTranslatedDept(item.prefecture, lang === 'kor');
        question = { type: 'text', text: t.templates.france.replace('{name}', name).replace('{code}', item.code) };
        answer = prefecture;
        choices = [answer, ...frenchDepartments.filter(d => d.prefecture !== item.prefecture).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => getTranslatedDept(d.prefecture, lang === 'kor'))];
        code = item.code;
      } else if (mode === 'usa') {
        const name = getTranslatedState(item.name, lang === 'kor');
        const capital = getTranslatedState(item.capital, lang === 'kor');
        question = { type: 'text', text: t.templates.usa.replace('{name}', name) };
        answer = capital;
        choices = [answer, ...usStates.filter(d => d.capital !== item.capital).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => getTranslatedState(d.capital, lang === 'kor'))];
        code = item.name;
      } else if (mode === 'south_korea' || mode === 'cameroon') {
        const name = getTranslatedState(item.name, false);
        const template = mode === 'south_korea' ? t.templates.south_korea : t.templates.cameroon;
        question = { type: 'text', text: template };
        answer = name;
        choices = [answer, ...data.filter(d => d.name !== item.name).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => getTranslatedState(d.name, false))];
        code = item.code || item.name;
      } else {
        question = { type: 'text', text: item.q[lang] || item.q.en };
        answer = item.a[lang] || item.a.en;
        choices = [answer, ...(item.choices[lang] || item.choices.en)];
      }

      return { question, answer, choices: shuffle(choices), code, latlng };
    });

    if (isMarathon) {
        qList.sort((a, b) => {
            const ansA = Array.isArray(a.answer) ? a.answer[0] : a.answer;
            const ansB = Array.isArray(b.answer) ? b.answer[0] : b.answer;
            return ansA.localeCompare(ansB);
        });
    } else {
        qList = shuffle(qList);
    }

    const finalCount = qCount === 'all' ? qList.length : parseInt(qCount);
    setQuestions(qList.slice(0, finalCount));
  };

  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

  const normalize = (str) => {
    if (!str) return "";
    let n = str.trim().toLowerCase();
    n = n.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Supprimer les articles au début
    n = n.replace(/^(le\s+|la\s+|les\s+|l'|the\s+|a\s+|an\s+|de\s+|des\s+|du\s+)/g, "");
    // Supprimer ponctuation, tirets et espaces
    n = n.replace(/[-\s\.\,\(\)\']/g, "");
    // Cas particuliers
    if (n === "vatican" || n === "citevatican") return "vatican";
    return n;
  };

  const handleAnswer = (choice) => {
    if (selectedAnswer && !isMarathon) return;
    
    const currentQ = questions[currentIdx];
    const targetAnswers = Array.isArray(currentQ.answer) ? currentQ.answer : [currentQ.answer];
    const normalizedTargetAnswers = targetAnswers.map(a => normalize(a));
    const normalizedInput = normalize(choice);

    if (isMarathon) {
        const targetQIdx = questions.findIndex(q => {
            if (foundItems.includes(Array.isArray(q.answer) ? q.answer[0] : q.answer)) return false;
            const qAs = Array.isArray(q.answer) ? q.answer : [q.answer];
            const normalizedQAs = qAs.map(a => normalize(a));
            return normalizedQAs.some(a => a === normalizedInput || (normalizedInput.length > 3 && a.includes(normalizedInput)));
        });
        
        if (targetQIdx !== -1) {
            const foundAnswer = Array.isArray(questions[targetQIdx].answer) ? questions[targetQIdx].answer[0] : questions[targetQIdx].answer;
            setFoundItems(prev => [...prev, foundAnswer]);
            setScore(s => s + 1);
            setUserInput('');
            setFeedback({ type: 'correct', message: t.ui.correct });
            setTimeout(() => setFeedback(null), 500);
            
            if (foundItems.length + 1 === questions.length) {
                setShowResult(true);
            }
        }
        return;
    }

    let isCorrect = normalizedTargetAnswers.some(a => {
        if (a === normalizedInput) return true;
        // Tolérance pour les réponses partielles (ex: "Indien" pour "Océan Indien", "Nil" pour "Le Nil")
        // On utilise >= 3 pour accepter des noms courts comme "Nil", "Erie", etc.
        if (normalizedInput.length >= 3 && a.includes(normalizedInput)) return true;
        if (a.length >= 3 && normalizedInput.includes(a)) return true;
        return false;
    });
    let isAlmost = false;
    let points = 0;
    let type = 'wrong';

    if (isCorrect) {
        points = 1;
        type = 'correct';
    } else {
        const similarity = Math.max(...normalizedTargetAnswers.map(a => stringSimilarity.compareTwoStrings(normalizedInput, a)));
        if (similarity > 0.8) {
            points = 0.5;
            type = 'almost';
            isAlmost = true;
        }
    }

    const correctDisplay = targetAnswers.join(" / ");

    setScore(s => s + points);
    setSelectedAnswer(choice);
    setFeedback({ 
        type, 
        message: points === 1 ? t.ui.correct : points === 0.5 ? `${t.ui.almost} ${correctDisplay}` : `${t.ui.wrong} ${correctDisplay}` 
    });
    
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
        setSelectedAnswer(null);
        setFeedback(null);
        setUserInput('');
      } else {
        setShowResult(true);
      }
    }, points === 1 && isTyping ? 600 : 2000);
  };

  const saveRecord = (e) => {
    e.preventDefault();
    if (!playerName.trim() || saved) return;
    const recordKey = `geomaster_leaderboard`;
    const existing = JSON.parse(localStorage.getItem(recordKey) || '[]');
    const newRecord = { name: playerName, score: score, total: questions.length, time: time, mode: mode, type: isTyping ? (isMarathon ? 'marathon' : 'typing') : 'qcm', date: new Date().toISOString() };
    existing.push(newRecord);
    existing.sort((a, b) => b.score !== a.score ? b.score - a.score : a.time - b.time);
    localStorage.setItem(recordKey, JSON.stringify(existing.slice(0, 500)));
    setSaved(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="container card animate-fade">{t.loading}</div>;
  if (error) return <div className="container card animate-fade">❌ Error: {error} <button onClick={onBack}>Back</button></div>;

  if (showResult) return (
    <div className="container card animate-fade" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h2>{t.results}</h2>
      <p style={{ fontSize: '3.5rem', margin: '1rem 0', color: 'var(--primary)', fontWeight: '800' }}>{score} / {questions.length}</p>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '2rem' }}>⏱️ {t.ui.time}: <span style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>{formatTime(time)}</span></p>
      {!saved ? (
        <form onSubmit={saveRecord} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <input type="text" placeholder={t.ui.namePlaceholder} value={playerName} onChange={e => setPlayerName(e.target.value)} className="choice-btn" style={{ padding: '0.8rem', borderRadius: '8px', border: '2px solid var(--primary)', flex: '1', maxWidth: '250px' }} required />
            <button type="submit" className="btn btn-primary">{t.ui.saveScore}</button>
        </form>
      ) : <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f0fdf4', color: 'var(--success)', borderRadius: '8px', fontWeight: 'bold' }}>{t.ui.newRecord}</div>}
      <button className="btn" style={{ background: '#e2e8f0', color: 'var(--text-dark)' }} onClick={onBack}>{t.playAgain}</button>
    </div>
  );

  if (isMarathon) {
    return (
        <div className="container animate-fade" style={{ maxWidth: '1400px' }}>
            <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: 'var(--primary)' }}>🏆 Marathon: {mode.toUpperCase()}</h2>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span>⏱️ {formatTime(time)}</span>
                    <span style={{ color: 'var(--secondary)' }}>{score} / {questions.length}</span>
                </div>
            </div>

            <div style={{ position: 'sticky', top: '20px', zIndex: 100, marginBottom: '2rem' }}>
                <input 
                    ref={inputRef} type="text" className="choice-btn" 
                    style={{ width: '100%', padding: '1.5rem', fontSize: '2rem', textAlign: 'center', borderRadius: '20px', border: '4px solid var(--primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    value={userInput} onChange={(e) => { setUserInput(e.target.value); handleAnswer(e.target.value); }}
                    placeholder="..."
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                {questions.map((q, i) => {
                    const ans = Array.isArray(q.answer) ? q.answer[0] : q.answer;
                    const isFound = foundItems.includes(ans);
                    return (
                        <div key={i} style={{ padding: '0.8rem', background: isFound ? '#f0fdf4' : 'white', border: isFound ? '2px solid var(--success)' : '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center', fontSize: '0.85rem', color: isFound ? 'var(--success)' : '#cbd5e1', fontWeight: isFound ? 'bold' : 'normal', transition: 'all 0.3s' }}>
                            {isFound ? ans : `${i + 1}. ???`}
                        </div>
                    );
                })}
            </div>
            <button className="btn" style={{ marginTop: '2rem', background: 'transparent', color: 'var(--text-light)' }} onClick={onBack}>← {t.back}</button>
        </div>
    );
  }

  const q = questions[currentIdx];
  const targetAnswers = q && q.answer ? (Array.isArray(q.answer) ? q.answer : [q.answer]) : [];
  const isMapOnly = displayMode === 'maponly';
  const isNoMap = (displayMode === 'nomap' && !isMapRequirement) || isCulture;

  return (
    <div className="container animate-fade" style={{ maxWidth: '1200px' }}>
      <div className="card quiz-layout" style={{ display: 'grid', gridTemplateColumns: isNoMap ? '1fr' : '450px 1fr', gap: '2rem', minHeight: '600px' }}>
        <div className="quiz-content" style={{ display: isMapOnly ? 'none' : 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-light)', fontWeight: '600', fontSize: '0.9rem' }}>
            <span>{t.question} {currentIdx + 1} / {questions.length}</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>⏱️ {formatTime(time)}</span>
              <span style={{ color: 'var(--secondary)' }}>{t.score} : {score}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            {q.question.type === 'image' && !isMapOnly ? (
              <div style={{ marginBottom: '2rem' }}>
                <img src={q.question.value} alt="Flag" style={{ height: '120px', borderRadius: '12px', boxShadow: 'var(--shadow)', border: '1px solid #eee' }} />
                {q.question.source && <p style={{ fontSize: '0.6rem', color: 'var(--text-light)', marginTop: '5px', opacity: 0.6 }}>{q.question.source}</p>}
              </div>
            ) : null}
            <h3 style={{ fontSize: '1.8rem', lineHeight: '1.3', color: 'var(--text-dark)', margin: '0', fontWeight: '800' }}>{q.question.text}</h3>
            {isMapRequirement && <p style={{ fontSize: '1rem', color: 'var(--primary)', marginTop: '1rem', fontWeight: 'bold' }}>📍 {lang === 'fr' ? 'Observez la zone surlignée sur la carte' : lang === 'kor' ? '지도의 강조된 부분을 확인하세요' : 'Observe the highlighted area on the map'}</p>}
          </div>

          {(displayMode === 'nomap' && isMapRequirement) ? (
              <div className="card" style={{ background: '#fef2f2', border: '2px solid var(--danger)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Ce mode nécessite l'affichage de la carte pour identifier la zone surlignée.</p>
                  <button className="btn btn-primary" onClick={() => onBack()}>Retour au menu</button>
              </div>
          ) : isTyping ? (
            <form onSubmit={(e) => { e.preventDefault(); handleAnswer(userInput); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <input 
                ref={inputRef} type="text" className="choice-btn" style={{ borderRadius: '12px', border: '3px solid var(--primary)', fontSize: '1.3rem', padding: '1rem' }}
                value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={!!selectedAnswer} placeholder="..."
              />
              <button type="submit" className="btn btn-primary" disabled={!!selectedAnswer} style={{ padding: '1rem', fontSize: '1.1rem' }}>Valider</button>
            </form>
          ) : (
            <div className="choices">
              {q.choices.map((c, i) => (
                <button key={i} className={`btn choice-btn ${selectedAnswer === c ? (targetAnswers.includes(c) ? 'choice-correct' : 'choice-wrong') : (selectedAnswer && targetAnswers.includes(c) ? 'choice-correct' : '')}`} onClick={() => handleAnswer(c)} style={{ fontSize: '1rem', padding: '1rem' }}>{c}</button>
              ))}
            </div>
          )}
          {feedback && <div className={`animate-fade`} style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: feedback.type === 'correct' ? '#f0fdf4' : feedback.type === 'almost' ? '#fffbeb' : '#fef2f2', color: feedback.type === 'correct' ? 'var(--success)' : feedback.type === 'almost' ? '#b45309' : 'var(--danger)', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>{feedback.message}</div>}
        </div>
        {!isNoMap && (
          <div className="quiz-map" style={{ gridColumn: isMapOnly ? 'span 2' : 'auto', position: 'relative' }}>
            <InteractiveMap highlightCode={q.code} mode={mode} latlng={q.latlng} />
            {isMapOnly && (
                <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '600px', background: 'rgba(255,255,255,0.95)', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', zIndex: 100 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 'bold' }}>{t.question} {currentIdx + 1}</span>
                        <div style={{ display: 'flex', gap: '1rem', fontWeight: 'bold' }}><span>⏱️ {formatTime(time)}</span><span style={{ color: 'var(--primary)' }}>{score} pts</span></div>
                    </div>
                    {isTyping ? (
                         <form onSubmit={(e) => { e.preventDefault(); handleAnswer(userInput); }} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input ref={inputRef} type="text" className="choice-btn" style={{ flex: 1, padding: '0.8rem' }} value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={!!selectedAnswer} />
                            <button type="submit" className="btn btn-primary" disabled={!!selectedAnswer}>OK</button>
                         </form>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            {q.choices.map((c, i) => (
                                <button key={i} className={`btn choice-btn ${selectedAnswer === c ? (targetAnswers.includes(c) ? 'choice-correct' : 'choice-wrong') : (selectedAnswer && targetAnswers.includes(c) ? 'choice-correct' : '')}`} onClick={() => handleAnswer(c)} style={{ fontSize: '0.85rem', padding: '0.6rem' }}>{c}</button>
                            ))}
                        </div>
                    )}
                    {feedback && <div style={{ marginTop: '0.8rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>{feedback.message}</div>}
                </div>
            )}
          </div>
        )}
      </div>
      <button className="btn" style={{ marginTop: '2rem', background: 'transparent', color: 'var(--text-light)' }} onClick={onBack}>← {t.back}</button>
    </div>
  );
};

export default QuizEngine;
