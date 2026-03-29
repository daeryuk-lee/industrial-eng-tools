import React, { useState, useEffect } from 'react';
import GeoHub from './components/GeoHub';
import QuizEngine from './components/QuizEngine';
import Legal from './components/Legal';

function App() {
  const [currentMode, setCurrentMode] = useState(null);
  const [lang, setLang] = useState('fr');
  const [isFull, setIsFull] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [qCount, setQCount] = useState('10');
  const [displayMode, setDisplayMode] = useState('classic');
  const [showLegal, setShowLegal] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('geomaster_theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('geomaster_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (showLegal) {
    return <Legal lang={lang} onBack={() => setShowLegal(false)} />;
  }

  return (
    <div className="App">
      {!currentMode ? (
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
          onSelectMode={(id) => setCurrentMode(id)} 
          onShowLegal={() => setShowLegal(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : (
        <QuizEngine 
          mode={currentMode} 
          lang={lang}
          isFull={isFull}
          isTyping={isTyping}
          qCount={qCount}
          displayMode={displayMode}
          onBack={() => setCurrentMode(null)} 
        />
      )}
    </div>
  );
}

export default App;
