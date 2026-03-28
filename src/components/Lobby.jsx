import React from 'react';
import { Grid3X3, Hash, Bomb, Move, LayoutGrid, Tablet, Rocket, Ghost, CircleDot, Swords } from 'lucide-react';

const games = [
  { id: 'tic-tac-toe', name: 'Morpion AI', icon: Grid3X3, color: 'var(--accent-purple)', desc: 'Jouez contre un ordinateur imbattable.' },
  { id: 'connect-four', name: 'Puissance 4 AI', icon: Hash, color: 'var(--accent-cyan)', desc: 'Affrontez l\'IA stratégique.' },
  { id: 'pong', name: 'Pong', icon: Tablet, color: 'var(--accent-cyan)', desc: 'Le classique du tennis de table.' },
  { id: 'pacman', name: 'Pac-Man', icon: Ghost, color: 'yellow', desc: 'Évitez les fantômes et mangez tout.' },
  { id: 'space-invaders', name: 'Space Invaders', icon: Rocket, color: 'var(--accent-green)', desc: 'Défendez la Terre contre les aliens.' },
  { id: 'surviv', name: 'Surviv Ultra', icon: CircleDot, color: 'var(--accent-cyan)', desc: 'Battle Royale 2D : Loot, tir et survie.' },
  { id: 'bubble-bobble', name: 'Bubble Bobble', icon: CircleDot, color: 'var(--accent-pink)', desc: 'Capturez les ennemis dans vos bulles.' },
  { id: 'street-fighter', name: 'Street Fighter', icon: Swords, color: 'var(--accent-red)', desc: 'Combattez l\'IA en duel.' },
  { id: 'minesweeper', name: 'Démineur', icon: Bomb, color: 'var(--accent-pink)', desc: 'Nettoyez la grille avec logique.' },
  { id: 'snake', name: 'Snake', icon: Move, color: 'var(--accent-green)', desc: 'Le serpent qui grandit sans fin.' },
  { id: 'tetris', name: 'Tetris', icon: LayoutGrid, color: 'var(--accent-purple)', desc: 'Le puzzle culte des blocs.' },
];

const Lobby = ({ onSelectGame }) => {
  return (
    <div className="animate-fade-in">
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="neon-text-purple" style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Arcade Hub Pro</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Plateforme ultime de jeux rétro avec IA intégrée.</p>
      </header>

      <div className="game-grid">
        {games.map((game) => (
          <div key={game.id} className="glass-card neon-border" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px', padding: '20px' }} onClick={() => onSelectGame(game.id)}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: `rgba(255, 255, 255, 0.05)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: game.color }}>
              <game.icon size={30} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{game.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>{game.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
