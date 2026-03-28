import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, User, Cpu } from 'lucide-react';

const ROWS = 6;
const COLS = 7;

const ConnectFour = ({ onBack }) => {
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [isRedNext, setIsRedNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isCpuMode, setIsCpuMode] = useState(true);

  const checkWinner = (grid, row, col) => {
    const player = grid[row][col];
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    for (const [dr, dc] of directions) {
      let count = 1;
      for (const dir of [1, -1]) {
        let r = row + dr * dir, c = col + dc * dir;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === player) {
          count++; r += dr * dir; c += dc * dir;
        }
      }
      if (count >= 4) return player;
    }
    return null;
  };

  // IA Simple : Cherche à gagner ou à bloquer
  const getCpuMove = (grid) => {
    // 1. Chercher un coup gagnant
    for (let c = 0; c < COLS; c++) {
      const r = getAvailableRow(grid, c);
      if (r !== -1) {
        grid[r][c] = 'Yellow';
        if (checkWinner(grid, r, c)) { grid[r][c] = null; return c; }
        grid[r][c] = null;
      }
    }
    // 2. Bloquer le joueur s'il va gagner
    for (let c = 0; c < COLS; c++) {
      const r = getAvailableRow(grid, c);
      if (r !== -1) {
        grid[r][c] = 'Red';
        if (checkWinner(grid, r, c)) { grid[r][c] = null; return c; }
        grid[r][c] = null;
      }
    }
    // 3. Coup aléatoire intelligent (préfère le centre)
    const validCols = [3, 2, 4, 1, 5, 0, 6].filter(c => getAvailableRow(grid, c) !== -1);
    return validCols[0];
  };

  const getAvailableRow = (grid, col) => {
    for (let r = ROWS - 1; r >= 0; r--) if (!grid[r][col]) return r;
    return -1;
  };

  useEffect(() => {
    if (isCpuMode && !isRedNext && !winner) {
      const timer = setTimeout(() => {
        const col = getCpuMove(board.map(r => [...r]));
        if (col !== undefined) handleClick(col);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isRedNext, isCpuMode, winner]);

  const handleClick = (col) => {
    if (winner) return;
    const r = getAvailableRow(board, col);
    if (r === -1) return;
    
    const newBoard = board.map(row => [...row]);
    newBoard[r][col] = isRedNext ? 'Red' : 'Yellow';
    setBoard(newBoard);
    const win = checkWinner(newBoard, r, col);
    if (win) setWinner(win);
    setIsRedNext(!isRedNext);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-cyan">Puissance 4 AI</h2>
        <button onClick={() => {setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null))); setWinner(null); setIsRedNext(true);}} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '25px', display: 'inline-block' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '25px' }}>
          <button onClick={() => setIsCpuMode(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-neon)', background: !isCpuMode ? 'var(--accent-cyan)' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><User size={14}/> JvJ</button>
          <button onClick={() => {setIsCpuMode(true); setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null))); setWinner(null);}} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-neon)', background: isCpuMode ? 'var(--accent-cyan)' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><Cpu size={14}/> vs CPU</button>
        </div>

        <h3 style={{ marginBottom: '20px', color: winner === 'Red' ? 'var(--accent-pink)' : winner === 'Yellow' ? 'var(--accent-cyan)' : 'white' }}>
          {winner ? `Victoire : ${winner === 'Red' ? 'Rouge' : 'Bleu'} !` : `Tour : ${isRedNext ? 'Rouge' : 'Bleu'}`}
        </h3>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', display: 'grid', gridTemplateColumns: `repeat(${COLS}, 50px)`, gap: '10px' }}>
          {board.map((row, ri) => row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} onClick={() => handleClick(ci)} style={{ width: '50px', height: '50px', borderRadius: '50%', background: cell === 'Red' ? 'var(--accent-pink)' : cell === 'Yellow' ? 'var(--accent-cyan)' : 'var(--bg-main)', border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.3s' }} />
          )))}
        </div>
      </div>
    </div>
  );
};

export default ConnectFour;
