import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import GeoHub from './components/GeoHub';

const QuizEngine = lazy(() => import('./components/QuizEngine'));
const Legal = lazy(() => import('./components/Legal'));
const UserStats = lazy(() => import('./components/UserStats'));

const Loading = () => <div className="loading-container">Chargement...</div>;

function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lang, setLang] = useState('fr');
  const [isFull, setIsFull] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [qCount, setQCount] = useState('10');
  const [displayMode, setDisplayMode] = useState('classic');
  const [theme, setTheme] = useState(localStorage.getItem('geomaster_theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('geomaster_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={
            <GeoHub 
              lang={lang} 
              setLang={setLang}
              isFull={isFull}
              setIsFull={setIsFull}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
              qCount={qCount}
              setQCount={setQCount}
              displayMode={displayMode}
              setDisplayMode={setDisplayMode}
              onSelectMode={(id) => navigate(`/quiz/${id}`)} 
              onShowLegal={() => navigate('/legal')}
              onShowStats={() => navigate('/stats')}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          } />
          
          <Route path="/quiz/:mode" element={
            <QuizEngine 
              lang={lang}
              isFull={isFull}
              isTyping={isTyping}
              qCount={qCount}
              displayMode={displayMode}
              onBack={() => navigate('/')} 
            />
          } />

          <Route path="/legal" element={
            <Legal lang={lang} onBack={() => navigate('/')} />
          } />

          <Route path="/stats" element={
            <UserStats lang={lang} onBack={() => navigate('/')} />
          } />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
