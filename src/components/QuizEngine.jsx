import React, { useState, useEffect } from 'react';
import stringSimilarity from 'string-similarity';
import { frenchDepartments, usStates, geoCulture } from '../data/geographyData';
import { translations } from '../data/translations';
import { koreanCapitals } from '../data/koreanData';
import InteractiveMap from './InteractiveMap';

const QuizEngine = ({ mode, lang, isFull, isTyping, qCount, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const t = translations[lang];

  useEffect(() => {
    fetchData();
  }, [mode, lang]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    let rawData = [];
    
    try {
      if (mode === 'flags' || mode === 'capitals') {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags,translations,cca3');
        if (!res.ok) throw new Error("Erreur serveur API");
        const data = await res.json();
        rawData = data.filter(c => c.capital && c.capital.length > 0);
      } else if (mode === 'france') rawData = frenchDepartments;
      else if (mode === 'usa') rawData = usStates;
      else if (mode === 'culture') rawData = geoCulture;

      if (rawData.length === 0) throw new Error("Aucune donnée disponible");
      generateQuestions(rawData);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getTranslatedName = (country) => {
    if (lang === 'en') return country.name.common;
    if (lang === 'kor' && country.translations?.kor) return country.translations.kor.common;
    if (lang === 'fr' && country.translations?.fra) return country.translations.fra.common;
    return country.name.common;
  };

  const getTranslatedCapital = (country) => {
    const original = country.capital[0];
    if (lang === 'kor') return koreanCapitals[original] || original;
    return original;
  };

  const generateQuestions = (data) => {
    const qList = data.map(item => {
      let question, answer, choices, code;
      
      if (mode === 'flags') {
        const name = getTranslatedName(item);
        question = { type: 'image', value: item.flags.svg, text: t.templates.flags, source: "Source: WikiMedia / RestCountries" };
        answer = name;
        choices = [answer, ...data.filter(d => getTranslatedName(d) !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => getTranslatedName(d))];
        code = item.cca3;
      } else if (mode === 'capitals') {
        const name = getTranslatedName(item);
        const capital = getTranslatedCapital(item);
        question = { type: 'text', value: t.templates.capitals.replace('{name}', name) };
        answer = capital;
        choices = [answer, ...data.filter(d => getTranslatedCapital(d) !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => getTranslatedCapital(d))];
        code = item.cca3;
      } else if (mode === 'france') {
        question = { type: 'text', value: t.templates.france.replace('{name}', item.name).replace('{code}', item.code) };
        answer = item.prefecture;
        choices = [answer, ...frenchDepartments.filter(d => d.prefecture !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => d.prefecture)];
        code = item.code;
      } else if (mode === 'usa') {
        question = { type: 'text', value: t.templates.usa.replace('{name}', item.name) };
        answer = item.capital;
        choices = [answer, ...usStates.filter(d => d.capital !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => d.capital)];
        code = item.name;
      } else {
        question = { type: 'text', value: item.q[lang] || item.q.en };
        answer = item.a[lang] || item.a.en;
        choices = [answer, ...(item.choices[lang] || item.choices.en)];
      }

      return { question, answer, choices: shuffle(choices), code };
    });

    setQuestions(shuffle(qList).slice(0, qCount));
  };

  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

  const handleAnswer = (choice) => {
    if (selectedAnswer) return;
    const currentQ = questions[currentIdx];
    const normalizedTarget = currentQ.answer.toLowerCase().trim();
    const normalizedInput = choice.toLowerCase().trim();
    const similarity = stringSimilarity.compareTwoStrings(normalizedInput, normalizedTarget);
    
    let points = 0;
    let type = 'wrong';

    if (normalizedInput === normalizedTarget) { points = 1; type = 'correct'; }
    else if (similarity > 0.75) { points = 0.5; type = 'almost'; }

    setScore(s => s + points);
    setSelectedAnswer(choice);
    setFeedback({ type, message: points === 1 ? t.ui.correct : points === 0.5 ? `${t.ui.almost} ${currentQ.answer}` : `${t.ui.wrong} ${currentQ.answer}` });
    
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

  if (loading) return <div className="container card animate-fade">{t.loading}</div>;
  if (error) return <div className="container card animate-fade">❌ Error: {error} <button onClick={onBack}>Back</button></div>;

  if (showResult) return (
    <div className="container card animate-fade" style={{ textAlign: 'center' }}>
      <h2>{t.results}</h2>
      <p style={{ fontSize: '3rem', margin: '1.5rem 0', color: 'var(--primary)', fontWeight: '800' }}>{score} / {questions.length}</p>
      <button className="btn btn-primary" onClick={onBack}>{t.playAgain}</button>
    </div>
  );

  const q = questions[currentIdx];

  return (
    <div className="container animate-fade" style={{ maxWidth: '1200px' }}>
      <div className="card quiz-layout" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem', minHeight: '550px' }}>
        <div className="quiz-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-light)', fontWeight: '600', fontSize: '0.8rem' }}>
            <span>{t.question} {currentIdx + 1} / {questions.length}</span>
            <span style={{ color: 'var(--secondary)' }}>{t.score} : {score}</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {q.question.type === 'image' ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <img src={q.question.value} alt="Flag" style={{ height: '100px', borderRadius: '8px', boxShadow: 'var(--shadow)', border: '1px solid #eee' }} />
                <p style={{ fontSize: '0.6rem', color: 'var(--text-light)', marginTop: '5px', opacity: 0.6 }}>{q.question.source}</p>
              </div>
            ) : null}
            <h3 style={{ fontSize: '1.4rem', lineHeight: '1.4', color: 'var(--text-dark)', margin: '0' }}>{q.question.value}</h3>
            {q.question.text && <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>{q.question.text}</p>}
          </div>

          {isTyping ? (
            <form onSubmit={(e) => { e.preventDefault(); handleAnswer(userInput); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" autoFocus className="choice-btn" style={{ borderRadius: '12px', border: '2px solid var(--primary)', fontSize: '1.1rem', padding: '0.8rem' }}
                value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={!!selectedAnswer} placeholder="..."
              />
              <button type="submit" className="btn btn-primary" disabled={!!selectedAnswer} style={{ padding: '0.8rem' }}>Valider</button>
            </form>
          ) : (
            <div className="choices">
              {q.choices.map((c, i) => (
                <button 
                  key={i} className={`btn choice-btn ${selectedAnswer === c ? (c === q.answer ? 'choice-correct' : 'choice-wrong') : (selectedAnswer && c === q.answer ? 'choice-correct' : '')}`}
                  onClick={() => handleAnswer(c)}
                  style={{ fontSize: '0.9rem', padding: '0.8rem' }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {feedback && (
            <div className={`animate-fade`} style={{ marginTop: '1.2rem', padding: '0.8rem', borderRadius: '12px', background: feedback.type === 'correct' ? '#f0fdf4' : feedback.type === 'almost' ? '#fffbeb' : '#fef2f2', color: feedback.type === 'correct' ? 'var(--success)' : feedback.type === 'almost' ? '#b45309' : 'var(--danger)', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
              {feedback.message}
            </div>
          )}
        </div>

        <div className="quiz-map">
          <InteractiveMap highlightCode={q.code} mode={mode} />
        </div>
      </div>
      <button className="btn" style={{ marginTop: '2rem', background: 'transparent', color: 'var(--text-light)' }} onClick={onBack}>← {t.back}</button>
    </div>
  );
};

export default QuizEngine;
