import React, { useState, useEffect } from 'react';
import { frenchDepartments, usStates, geoCulture } from '../data/geographyData';
import { translations } from '../data/translations';

const QuizEngine = ({ mode, lang, isFull, isTyping, qCount, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(true);
  const t = translations[lang];

  useEffect(() => {
    fetchData();
  }, [mode, lang]);

  const fetchData = async () => {
    setLoading(true);
    let rawData = [];
    
    if (mode === 'flags' || mode === 'capitals') {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags,translations,latlng');
        const data = await res.json();
        rawData = data.filter(c => c.capital && c.capital.length > 0);
      } catch (e) {
        console.error("Erreur API", e);
      }
    } else if (mode === 'france') rawData = frenchDepartments;
    else if (mode === 'usa') rawData = usStates;
    else if (mode === 'culture') rawData = geoCulture;

    generateQuestions(rawData);
    setLoading(false);
  };

  const getTranslatedName = (country) => {
    if (lang === 'en') return country.name.common;
    if (lang === 'kor' && country.translations?.kor) return country.translations.kor.common;
    if (lang === 'fr' && country.translations?.fra) return country.translations.fra.common;
    return country.name.common;
  };

  const generateQuestions = (data) => {
    const qList = data.map(item => {
      let question, answer, choices, mapUrl;
      
      if (mode === 'flags') {
        const countryName = getTranslatedName(item);
        question = { type: 'image', value: item.flags.svg, text: t.templates.flags };
        answer = countryName;
        choices = [answer, ...data.filter(d => getTranslatedName(d) !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => getTranslatedName(d))];
        mapUrl = `https://static-maps.yandex.ru/1.x/?ll=${item.latlng[1]},${item.latlng[0]}&z=3&l=map&size=450,250`;
      } else if (mode === 'capitals') {
        const countryName = getTranslatedName(item);
        question = { type: 'text', value: t.templates.capitals.replace('{name}', countryName) };
        answer = item.capital[0];
        choices = [answer, ...data.filter(d => d.capital[0] !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => d.capital[0])];
        mapUrl = `https://static-maps.yandex.ru/1.x/?ll=${item.latlng[1]},${item.latlng[0]}&z=4&l=map&size=450,250`;
      } else if (mode === 'france') {
        question = { type: 'text', value: t.templates.france.replace('{name}', item.name).replace('{code}', item.code) };
        answer = item.prefecture;
        choices = [answer, ...frenchDepartments.filter(d => d.prefecture !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => d.prefecture)];
        mapUrl = `https://static-maps.yandex.ru/1.x/?ll=2.35,48.85&z=5&l=map&size=450,250`; // Default France
      } else if (mode === 'usa') {
        question = { type: 'text', value: t.templates.usa.replace('{name}', item.name) };
        answer = item.capital;
        choices = [answer, ...usStates.filter(d => d.capital !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => d.capital)];
        mapUrl = `https://static-maps.yandex.ru/1.x/?ll=-95,37&z=3&l=map&size=450,250`; // Default USA
      } else {
        question = { type: 'text', value: item.q[lang] || item.q.en };
        answer = item.a[lang] || item.a.en;
        choices = [answer, ...(item.choices[lang] || item.choices.en)];
      }

      return { question, answer, choices: shuffle(choices), mapUrl };
    });

    setQuestions(shuffle(qList).slice(0, qCount));
  };

  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

  const handleAnswer = (choice) => {
    if (selectedAnswer) return;
    setSelectedAnswer(choice);
    
    const isCorrect = choice.toLowerCase().trim() === questions[currentIdx].answer.toLowerCase().trim();
    if (isCorrect) setScore(s => s + 1);
    
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
        setSelectedAnswer(null);
        setUserInput('');
      } else {
        setShowResult(true);
      }
    }, isTyping && isCorrect ? 500 : 1500);
  };

  const submitTyping = (e) => {
    e.preventDefault();
    if (!userInput) return;
    handleAnswer(userInput);
  };

  if (loading) return <div className="container card animate-fade">{t.loading}</div>;

  if (showResult) return (
    <div className="container card animate-fade">
      <h2>{t.results}</h2>
      <p style={{ fontSize: '2.5rem', margin: '1.5rem 0', color: 'var(--primary)' }}>{score} / {questions.length}</p>
      <button className="btn btn-primary" onClick={onBack}>{t.playAgain}</button>
    </div>
  );

  const q = questions[currentIdx];

  return (
    <div className="container animate-fade">
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="quiz-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-light)', fontWeight: '600', fontSize: '0.85rem' }}>
            <span>{t.question} {currentIdx + 1} / {questions.length}</span>
            <span style={{ color: 'var(--secondary)' }}>{t.score} : {score}</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {q.question.type === 'image' ? (
              <img src={q.question.value} alt="Quiz" style={{ height: '120px', borderRadius: '8px', boxShadow: 'var(--shadow)', marginBottom: '1rem' }} />
            ) : null}
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', lineHeight: '1.4' }}>{q.question.value}</h3>
            {q.question.text && <p style={{ marginTop: '0.5rem', color: 'var(--text-light)' }}>{q.question.text}</p>}
          </div>

          {isTyping ? (
            <form onSubmit={submitTyping} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                autoFocus
                className="choice-btn" 
                style={{ borderRadius: '12px', border: '2px solid var(--primary)', outline: 'none', padding: '1rem', fontSize: '1.1rem' }}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="..."
                disabled={!!selectedAnswer}
              />
              {selectedAnswer && (
                <div style={{ padding: '0.8rem', borderRadius: '8px', background: userInput.toLowerCase().trim() === q.answer.toLowerCase().trim() ? '#f0fdf4' : '#fef2f2', color: userInput.toLowerCase().trim() === q.answer.toLowerCase().trim() ? 'var(--success)' : 'var(--danger)', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {userInput.toLowerCase().trim() === q.answer.toLowerCase().trim() ? '✓ Correct' : `✗ Incorrect: ${q.answer}`}
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem' }} disabled={!!selectedAnswer}>Valider</button>
            </form>
          ) : (
            <div className="choices">
              {q.choices.map((c, i) => (
                <button 
                  key={i} 
                  className={`btn choice-btn ${selectedAnswer === c ? (c === q.answer ? 'choice-correct' : 'choice-wrong') : (selectedAnswer && c === q.answer ? 'choice-correct' : '')}`}
                  onClick={() => handleAnswer(c)}
                  style={{ padding: '0.8rem', fontSize: '0.9rem' }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="quiz-map" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {q.mapUrl ? (
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow)', border: '4px solid white' }}>
              <img src={q.mapUrl} alt="Location Map" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          ) : (
            <div style={{ height: '250px', background: '#e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
              🌍 Visualisation
            </div>
          )}
        </div>
      </div>
      <button className="btn" style={{ marginTop: '2rem', background: 'transparent', color: 'var(--text-light)' }} onClick={onBack}>← {t.back}</button>
    </div>
  );
};

export default QuizEngine;
