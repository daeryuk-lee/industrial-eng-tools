import React, { useState } from 'react';
import GeoHub from './components/GeoHub';
import QuizEngine from './components/QuizEngine';

function App() {
  const [currentMode, setCurrentMode] = useState(null);
  const [lang, setLang] = useState('fr');
  const [isFull, setIsFull] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [qCount, setQCount] = useState('10');

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
          onSelectMode={(id) => setCurrentMode(id)} 
        />
      ) : (
        <QuizEngine 
          mode={currentMode} 
          lang={lang}
          isFull={isFull}
          isTyping={isTyping}
          qCount={qCount === 'all' ? 999 : parseInt(qCount)}
          onBack={() => setCurrentMode(null)} 
        />
      )}
    </div>
  );
}

export default App;
