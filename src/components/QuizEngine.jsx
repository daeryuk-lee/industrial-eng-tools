import React, { useState, useEffect } from 'react';
import { frenchDepartments, usStates, geoCulture } from '../data/geographyData';
import { translations } from '../data/translations';

const QuizEngine = ({ mode, lang, isFull, isTyping, onBack }) => {
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
        const res = await fetch('https://restcountries.com/v3.1/all');
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
    if (lang === 'kor') return country.translations.kor.common;
    if (lang === 'fr') return country.translations.fra.common;
    return country.name.common;
  };

  const generateQuestions = (data) => {
    const qList = data.map(item => {
      let question, answer, choices;
      
      if (mode === 'flags') {
        const countryName = getTranslatedName(item);
        question = { type: 'image', value: item.flags.svg, text: lang === 'kor' ? "이 나라는 어디입니까?" : (lang === 'en' ? "Which country is this?" : "De quel pays s'agit-il ?") };
        answer = countryName;
        choices = [answer, ...data.filter(d => getTranslatedName(d) !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => getTranslatedName(d))];
      } else if (mode === 'capitals') {
        const countryName = getTranslatedName(item);
        question = { type: 'text', value: lang === 'kor' ? `${countryName}의 수도는 어디입니까?` : (lang === 'en' ? `What is the capital of ${countryName}?` : `Quelle est la capitale de : ${countryName} ?`) };
        answer = item.capital[0];
        choices = [answer, ...data.filter(d => d.capital[0] !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => d.capital[0])];
      } else if (mode === 'france') {
        question = { type: 'text', value: `${item.name} (${item.code}) ?` };
        answer = item.prefecture;
        choices = [answer, ...frenchDepartments.filter(d => d.prefecture !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => d.prefecture)];
      } else if (mode === 'usa') {
        question = { type: 'text', value: `${item.name} ?` };
        answer = item.capital;
        choices = [answer, ...usStates.filter(d => d.capital !== answer).sort(() => 0.5 - Math.random()).slice(0, 3).map(d => d.capital)];
      } else {
        question = { type: 'text', value: item.q[lang] || item.q.en };
        answer = item.a[lang] || item.a.en;
        choices = [answer, ...(item.choices[lang] || item.choices.en)];
      }

      return { question, answer, choices: shuffle(choices) };
    });

    const finalQuestions = isFull ? shuffle(qList) : shuffle(qList).slice(0, 10);
    setQuestions(finalQuestions);
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
    }, isTyping && isCorrect ? 500 : 1200);
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
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-light)', fontWeight: '600' }}>
          <span>{t.question} {currentIdx + 1} / {questions.length}</span>
          <span style={{ color: 'var(--secondary)' }}>{t.score} : {score}</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {q.question.type === 'image' ? (
            <img src={q.question.value} alt="Quiz" style={{ height: '180px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
          ) : (
            <h3 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>{q.question.value}</h3>
          )}
          {q.question.text && <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>{q.question.text}</p>}
        </div>

        {isTyping ? (
          <form onSubmit={submitTyping} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              autoFocus
              className="choice-btn" 
              style={{ borderRadius: '12px', border: '2px solid var(--primary)', outline: 'none', padding: '1.2rem', fontSize: '1.2rem' }}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="..."
              disabled={!!selectedAnswer}
            />
            {selectedAnswer && (
              <div style={{ padding: '1rem', borderRadius: '12px', background: userInput.toLowerCase().trim() === q.answer.toLowerCase().trim() ? '#f0fdf4' : '#fef2f2', color: userInput.toLowerCase().trim() === q.answer.toLowerCase().trim() ? 'var(--success)' : 'var(--danger)', textAlign: 'center', fontWeight: 'bold' }}>
                {userInput.toLowerCase().trim() === q.answer.toLowerCase().trim() ? '✓ Correct' : `✗ Incorrect: ${q.answer}`}
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }} disabled={!!selectedAnswer}>Valider</button>
          </form>
        ) : (
          <div className="choices">
            {q.choices.map((c, i) => (
              <button 
                key={i} 
                className={`btn choice-btn ${selectedAnswer === c ? (c === q.answer ? 'choice-correct' : 'choice-wrong') : (selectedAnswer && c === q.answer ? 'choice-correct' : '')}`}
                onClick={() => handleAnswer(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="btn" style={{ marginTop: '2rem', background: 'transparent', color: 'var(--text-light)' }} onClick={onBack}>← {t.back}</button>
    </div>
  );
};

export default QuizEngine;
