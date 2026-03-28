import React, { useState } from 'react';
import GeoHub from './components/GeoHub';
import QuizEngine from './components/QuizEngine';

function App() {
  const [currentMode, setCurrentMode] = useState(null);

  return (
    <div className="App">
      {!currentMode ? (
        <GeoHub onSelectMode={(id) => setCurrentMode(id)} />
      ) : (
        <QuizEngine 
          mode={currentMode} 
          onBack={() => setCurrentMode(null)} 
        />
      )}
    </div>
  );
}

export default App;
