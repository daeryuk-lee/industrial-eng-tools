import React, { useState } from 'react';
import GeoHub from './components/GeoHub';
import QuizEngine from './components/QuizEngine';

function App() {
  const [currentMode, setCurrentMode] = useState(null);
  const [lang, setLang] = useState('fr');
  const [isFull, setIsFull] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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
          onSelectMode={(id) => setCurrentMode(id)} 
        />
      ) : (
        <QuizEngine 
          mode={currentMode} 
          lang={lang}
          isFull={isFull}
          isTyping={isTyping}
          onBack={() => setCurrentMode(null)} 
        />
      )}
    </div>
  );
}

export default App;
