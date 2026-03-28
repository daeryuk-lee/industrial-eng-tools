import React, { useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const ROWS = 6;
const COLS = 7;

const ConnectFour = ({ onBack }) => {
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [isRedNext, setIsRedNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const checkWinner = (grid, row, col) => {
    const player = grid[row][col];
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    for (const [dr, dc] of directions) {
      let count = 1;
      for (const direction of [1, -1]) {
        let r = row + dr * direction;
        let c = col + dc * direction;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === player) {
          count++;
          r += dr * direction;
          c += dc * direction;
        }
      }
      if (count >= 4) return player;
    }
    return null;
  };

  const handleClick = (col) => {
    if (winner) return;
    const newBoard = board.map(row => [...row]);
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = isRedNext ? 'Red' : 'Yellow';
        setBoard(newBoard);
        const win = checkWinner(newBoard, row, col);
        if (win) setWinner(win);
        setIsRedNext(!isRedNext);
        break;
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setIsRedNext(true);
    setWinner(null);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <ArrowLeft size={20} /> Retour
        </button>
        <h2 className="neon-text-cyan">Puissance 4</h2>
        <button onClick={resetGame} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '30px', display: 'inline-block' }}>
        <h3 style={{ marginBottom: '25px', color: winner ? (winner === 'Red' ? 'var(--accent-pink)' : 'var(--accent-cyan)') : 'var(--text-primary)' }}>
          {winner ? `Vainqueur : ${winner === 'Red' ? 'Rouge' : 'Bleu'} !` : `Tour : ${isRedNext ? 'Rouge' : 'Bleu'}`}
        </h3>

        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '10px', 
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 50px)`,
          gap: '10px'
        }}>
          {Array.from({ length: COLS }).map((_, col) => (
            <div 
              key={col} 
              onClick={() => handleClick(col)}
              style={{ display: 'contents', cursor: 'pointer' }}
            >
              {Array.from({ length: ROWS }).map((_, row) => (
                <div 
                  key={`${row}-${col}`} 
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: board[row][col] === 'Red' 
                      ? 'var(--accent-pink)' 
                      : board[row][col] === 'Yellow' 
                      ? 'var(--accent-cyan)' 
                      : 'var(--bg-main)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    boxShadow: board[row][col] ? '0 0 15px currentColor' : 'none',
                    gridRow: row + 1,
                    gridColumn: col + 1,
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectFour;
