import React from 'react';
import { Grid3X3, Hash, Bomb, Move, LayoutGrid } from 'lucide-react';

const games = [
  { id: 'tic-tac-toe', name: 'Morpion', icon: Grid3X3, color: 'var(--accent-purple)', desc: 'Alignez 3 symboles pour gagner.' },
  { id: 'connect-four', name: 'Puissance 4', icon: Hash, color: 'var(--accent-cyan)', desc: 'Soyez le premier à aligner 4 jetons.' },
  { id: 'minesweeper', name: 'Démineur', icon: Bomb, color: 'var(--accent-pink)', desc: 'Nettoyez la grille sans exploser.' },
  { id: 'snake', name: 'Snake', icon: Move, color: 'var(--accent-green)', desc: 'Mangez et grandissez sans vous mordre.' },
  { id: 'tetris', name: 'Tetris', icon: LayoutGrid, color: 'var(--accent-purple)', desc: 'Empilez les blocs et effacez les lignes.' },
];

const Lobby = ({ onSelectGame }) => {
  return (
    <div className="animate-fade-in">
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 className="neon-text-purple" style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>Arcade Hub</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Choisissez votre défi et commencez à jouer.</p>
      </header>

      <div className="game-grid">
        {games.map((game) => (
          <div 
            key={game.id} 
            className="glass-card neon-border" 
            style={{ 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '20px'
            }}
            onClick={() => onSelectGame(game.id)}
          >
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '20px', 
              background: `rgba(255, 255, 255, 0.05)`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: game.color,
              boxShadow: `inset 0 0 15px ${game.color}22`
            }}>
              <game.icon size={40} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>{game.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>{game.desc}</p>
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: 'auto' }}>Jouer</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
