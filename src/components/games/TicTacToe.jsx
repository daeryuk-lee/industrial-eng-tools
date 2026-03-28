import React, { useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const TicTacToe = ({ onBack }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i) => {
    if (calculateWinner(board) || board[i]) return;
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);
  const status = winner 
    ? `Gagnant : ${winner}` 
    : isDraw 
    ? "Match nul !" 
    : `Joueur suivant : ${isXNext ? 'X' : 'O'}`;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <ArrowLeft size={20} /> Retour
        </button>
        <h2 className="neon-text-purple">Morpion</h2>
        <button onClick={() => { setBoard(Array(9).fill(null)); setIsXNext(true); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '40px' }}>
        <h3 style={{ marginBottom: '30px', color: winner ? 'var(--accent-green)' : 'var(--text-primary)' }}>{status}</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 100px)', 
          gap: '15px', 
          justifyContent: 'center' 
        }}>
          {board.map((square, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              style={{
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-neon)',
                borderRadius: '12px',
                fontSize: '2.5rem',
                fontWeight: '700',
                color: square === 'X' ? 'var(--accent-cyan)' : 'var(--accent-pink)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Orbitron, sans-serif'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
            >
              {square}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
