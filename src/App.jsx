import React, { useState } from 'react';
import Lobby from './components/Lobby';
import TicTacToe from './components/games/TicTacToe';
import ConnectFour from './components/games/ConnectFour';
import Minesweeper from './components/games/Minesweeper';
import Snake from './components/games/Snake';
import Tetris from './components/games/Tetris';
import Pong from './components/games/Pong';
import SpaceInvaders from './components/games/SpaceInvaders';
import PacMan from './components/games/PacMan';
import BubbleBobble from './components/games/BubbleBobble';
import StreetFighter from './components/games/StreetFighter';
import SurvivUltra from './components/games/SurvivUltra';

function App() {
  const [currentGame, setCurrentGame] = useState(null);

  const renderGame = () => {
    const props = { onBack: () => setCurrentGame(null) };
    switch (currentGame) {
      case 'tic-tac-toe': return <TicTacToe {...props} />;
      case 'connect-four': return <ConnectFour {...props} />;
      case 'minesweeper': return <Minesweeper {...props} />;
      case 'snake': return <Snake {...props} />;
      case 'tetris': return <Tetris {...props} />;
      case 'pong': return <Pong {...props} />;
      case 'space-invaders': return <SpaceInvaders {...props} />;
      case 'pacman': return <PacMan {...props} />;
      case 'bubble-bobble': return <BubbleBobble {...props} />;
      case 'street-fighter': return <StreetFighter {...props} />;
      case 'surviv': return <SurvivUltra {...props} />;
      default: return <Lobby onSelectGame={(id) => setCurrentGame(id)} />;
    }
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {renderGame()}
      </div>
      <footer style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.5 }}>
        &copy; 2026 Arcade Hub Pro • Propulsé par Gemini Pro
      </footer>
    </div>
  );
}

export default App;
