import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Bomb, Flag } from 'lucide-react';

const SIZE = 10;
const MINES = 15;

const Minesweeper = ({ onBack }) => {
  const [grid, setGrid] = useState([]);
  const [status, setStatus] = useState('playing'); // playing, won, lost

  const initGrid = () => {
    let newGrid = Array(SIZE).fill(null).map(() => Array(SIZE).fill({
      isMine: false, isRevealed: false, isFlagged: false, neighborCount: 0
    }));

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c] = { ...newGrid[r][c], isMine: true };
        minesPlaced++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && newGrid[nr][nc].isMine) count++;
            }
          }
          newGrid[r][c] = { ...newGrid[r][c], neighborCount: count };
        }
      }
    }
    setGrid(newGrid);
    setStatus('playing');
  };

  useEffect(() => { initGrid(); }, []);

  const reveal = (r, c) => {
    if (status !== 'playing' || grid[r][c].isRevealed || grid[r][c].isFlagged) return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    
    if (newGrid[r][c].isMine) {
      setStatus('lost');
      revealAllMines(newGrid);
    } else {
      floodFill(newGrid, r, c);
      setGrid(newGrid);
      checkWin(newGrid);
    }
  };

  const floodFill = (g, r, c) => {
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE || g[r][c].isRevealed || g[r][c].isMine) return;
    g[r][c].isRevealed = true;
    if (g[r][c].neighborCount === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          floodFill(g, r + dr, c + dc);
        }
      }
    }
  };

  const toggleFlag = (e, r, c) => {
    e.preventDefault();
    if (status !== 'playing' || grid[r][c].isRevealed) return;
    const newGrid = grid.map((row, ri) => row.map((cell, ci) => 
      ri === r && ci === c ? { ...cell, isFlagged: !cell.isFlagged } : cell
    ));
    setGrid(newGrid);
  };

  const revealAllMines = (g) => {
    g.forEach(row => row.forEach(cell => { if (cell.isMine) cell.isRevealed = true; }));
    setGrid(g);
  };

  const checkWin = (g) => {
    const allSafeRevealed = g.every(row => row.every(cell => cell.isMine || cell.isRevealed));
    if (allSafeRevealed) setStatus('won');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <ArrowLeft size={20} /> Retour
        </button>
        <h2 className="neon-text-pink">Démineur</h2>
        <button onClick={initGrid} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '20px', display: 'inline-block' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span style={{ color: 'var(--accent-pink)' }}>💣 {MINES}</span>
          <span style={{ color: status === 'lost' ? 'var(--accent-red)' : status === 'won' ? 'var(--accent-green)' : 'white' }}>
            {status === 'won' ? 'GAGNÉ !' : status === 'lost' ? 'BOOM !' : 'Bonne chance !'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 35px)`, gap: '4px' }}>
          {grid.map((row, r) => row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => reveal(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
              style={{
                width: '35px',
                height: '35px',
                background: cell.isRevealed 
                  ? (cell.isMine ? 'var(--accent-red)' : 'rgba(255,255,255,0.05)') 
                  : 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                cursor: cell.isRevealed ? 'default' : 'pointer',
                color: [ '', 'var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-pink)', 'var(--accent-purple)', 'red', 'darkred', 'black', 'gray' ][cell.neighborCount]
              }}
            >
              {cell.isRevealed 
                ? (cell.isMine ? <Bomb size={16} /> : (cell.neighborCount || '')) 
                : (cell.isFlagged ? <Flag size={14} color="var(--accent-pink)" /> : '')}
            </div>
          )))}
        </div>
        <p style={{ marginTop: '15px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clic gauche : Révéler • Clic droit : Drapeau</p>
      </div>
    </div>
  );
};

export default Minesweeper;
