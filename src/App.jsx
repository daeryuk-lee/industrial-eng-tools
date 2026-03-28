import React, { useState } from 'react';
import Lobby from './components/Lobby';
import TicTacToe from './components/games/TicTacToe';
import ConnectFour from './components/games/ConnectFour';
import Minesweeper from './components/games/Minesweeper';
import Snake from './components/games/Snake';
import Tetris from './components/games/Tetris';

function App() {
  const [currentGame, setCurrentGame] = useState(null);

  const renderGame = () => {
    switch (currentGame) {
      case 'tic-tac-toe':
        return <TicTacToe onBack={() => setCurrentGame(null)} />;
      case 'connect-four':
        return <ConnectFour onBack={() => setCurrentGame(null)} />;
      case 'minesweeper':
        return <Minesweeper onBack={() => setCurrentGame(null)} />;
      case 'snake':
        return <Snake onBack={() => setCurrentGame(null)} />;
      case 'tetris':
        return <Tetris onBack={() => setCurrentGame(null)} />;
      default:
        return <Lobby onSelectGame={(id) => setCurrentGame(id)} />;
    }
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {renderGame()}
      </div>
      
      <footer style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.5 }}>
        &copy; 2026 Arcade Hub • Propulsé par Gemini Pro
      </footer>
    </div>
  );
}

export default App;
