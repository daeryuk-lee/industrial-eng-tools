import React, { useState, useEffect } from 'react';
import { frenchDepartments, usStates, geoCulture } from '../data/geographyData';

const QuizEngine = ({ mode, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [mode]);

  const fetchData = async () => {
    setLoading(true);
    let rawData = [];
    
    if (mode === 'flags' || mode === 'capitals') {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,flags');
        const data = await res.json();
        rawData = data.filter(c => c.capital && c.capital.length > 0).slice(0, 40); // Limiter pour performance
      } catch (e) {
        console.error("Erreur API", e);
      }
    } else if (mode === 'france') rawData = frenchDepartments;
    else if (mode === 'usa') rawData = usStates;
    else if (mode === 'culture') rawData = geoCulture;

    generateQuestions(rawData);
    setLoading(false);
  };

  const generateQuestions = (data) => {
    const qList = data.map(item => {
      let question, answer, choices;
      
      if (mode === 'flags') {
        question = { type: 'image', value: item.flags.svg, text: "De quel pays s'agit-il ?" };
        answer = item.name.common;
        choices = [answer, ...getRandomChoices(data, 'name.common', answer)];
      } else if (mode === 'capitals') {
        question = { type: 'text', value: `Quelle est la capitale de : ${item.name.common} ?` };
        answer = item.capital[0];
        choices = [answer, ...getRandomChoices(data, 'capital.0', answer)];
      } else if (mode === 'france') {
        question = { type: 'text', value: `Quelle est la préfecture du département : ${item.name} (${item.code}) ?` };
        answer = item.prefecture;
        choices = [answer, ...getRandomChoices(data, 'prefecture', answer)];
      } else if (mode === 'usa') {
        question = { type: 'text', value: `Quelle est la capitale de l'État : ${item.name} ?` };
        answer = item.capital;
        choices = [answer, ...getRandomChoices(data, 'capital', answer)];
      } else {
        question = { type: 'text', value: item.q };
        answer = item.a;
        choices = [answer, ...item.choices];
      }

      return { question, answer, choices: shuffle(choices) };
    }).slice(0, 10); // Quiz de 10 questions

    setQuestions(shuffle(qList));
  };

  const getRandomChoices = (data, path, current) => {
    const getVal = (obj, p) => p.split('.').reduce((o, i) => o?.[i], obj);
    return data
      .filter(d => getVal(d, path) !== current)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(d => getVal(d, path));
  };

  const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());

  const handleAnswer = (choice) => {
    if (selectedAnswer) return;
    setSelectedAnswer(choice);
    if (choice === questions[currentIdx].answer) setScore(s => s + 1);
    
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  if (loading) return <div className="container card">Chargement du monde...</div>;

  if (showResult) return (
    <div className="container card animate-fade">
      <h2>Quiz Terminé !</h2>
      <p style={{ fontSize: '2rem', margin: '1rem 0' }}>Score : {score} / {questions.length}</p>
      <button className="btn btn-primary" onClick={onBack}>Retour au Hub</button>
    </div>
  );

  const q = questions[currentIdx];

  return (
    <div className="container animate-fade">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-light)' }}>
          <span>Question {currentIdx + 1} / {questions.length}</span>
          <span>Score : {score}</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {q.question.type === 'image' ? (
            <img src={q.question.value} alt="Quiz" style={{ height: '150px', borderRadius: '8px', boxShadow: 'var(--shadow)' }} />
          ) : (
            <h3 style={{ fontSize: '1.5rem' }}>{q.question.value}</h3>
          )}
          {q.question.text && <p>{q.question.text}</p>}
        </div>

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
      </div>
    </div>
  );
};

export default QuizEngine;
