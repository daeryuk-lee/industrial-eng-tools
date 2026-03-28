import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;

const TETROMINOS = {
  I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: 'var(--accent-cyan)' },
  J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: 'blue' },
  L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: 'orange' },
  O: { shape: [[1, 1], [1, 1]], color: 'yellow' },
  S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: 'var(--accent-green)' },
  T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: 'var(--accent-purple)' },
  Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: 'var(--accent-pink)' },
};

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOS);
  const key = keys[Math.floor(Math.random() * keys.length)];
  return { ...TETROMINOS[key], pos: { x: Math.floor(COLS / 2) - 1, y: 0 } };
};

const Tetris = ({ onBack }) => {
  const [grid, setGrid] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const [activePiece, setActivePiece] = useState(randomTetromino());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const checkCollision = (piece, pos, newGrid = grid) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && newGrid[newY][newX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (matrix) => matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());

  const handleRotate = () => {
    const rotated = { ...activePiece, shape: rotate(activePiece.shape) };
    if (!checkCollision(rotated, activePiece.pos)) setActivePiece(rotated);
  };

  const move = (dir) => {
    if (!checkCollision(activePiece, { x: activePiece.pos.x + dir, y: activePiece.pos.y })) {
      setActivePiece(prev => ({ ...prev, pos: { ...prev.pos, x: prev.pos.x + dir } }));
    }
  };

  const drop = useCallback(() => {
    if (gameOver) return;
    if (!checkCollision(activePiece, { x: activePiece.pos.x, y: activePiece.pos.y + 1 })) {
      setActivePiece(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } }));
    } else {
      // Lock piece
      const newGrid = grid.map(row => [...row]);
      activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const gy = activePiece.pos.y + y;
            const gx = activePiece.pos.x + x;
            if (gy >= 0) newGrid[gy][gx] = activePiece.color;
          }
        });
      });

      // Check lines
      let linesCleared = 0;
      const filteredGrid = newGrid.filter(row => {
        if (row.every(cell => cell !== 0)) {
          linesCleared++;
          return false;
        }
        return true;
      });
      while (filteredGrid.length < ROWS) filteredGrid.unshift(Array(COLS).fill(0));
      
      setGrid(filteredGrid);
      setScore(s => s + (linesCleared * 100));

      const nextPiece = randomTetromino();
      if (checkCollision(nextPiece, nextPiece.pos, filteredGrid)) {
        setGameOver(true);
      } else {
        setActivePiece(nextPiece);
      }
    }
  }, [activePiece, grid, gameOver]);

  useEffect(() => {
    const interval = setInterval(drop, 800);
    return () => clearInterval(interval);
  }, [drop]);

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowDown') drop();
      if (e.key === 'ArrowUp') handleRotate();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move, drop, handleRotate, gameOver]);

  const resetGame = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    setActivePiece(randomTetromino());
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <ArrowLeft size={20} /> Retour
        </button>
        <h2 className="neon-text-purple">Tetris</h2>
        <button onClick={resetGame} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '20px', display: 'flex', gap: '30px', justifyContent: 'center' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateRows: `repeat(${ROWS}, ${BLOCK_SIZE}px)`, 
          gridTemplateColumns: `repeat(${COLS}, ${BLOCK_SIZE}px)`,
          background: 'rgba(0,0,0,0.5)',
          border: '2px solid var(--border-neon)',
          position: 'relative'
        }}>
          {grid.map((row, y) => row.map((cell, x) => (
            <div key={`${y}-${x}`} style={{ background: cell || 'transparent', border: '0.1px solid rgba(255,255,255,0.05)' }} />
          )))}
          {activePiece.shape.map((row, y) => row.map((value, x) => {
            if (value !== 0) {
              return <div key={`p-${y}-${x}`} style={{ 
                position: 'absolute', 
                width: BLOCK_SIZE, 
                height: BLOCK_SIZE, 
                background: activePiece.color, 
                top: (activePiece.pos.y + y) * BLOCK_SIZE, 
                left: (activePiece.pos.x + x) * BLOCK_SIZE,
                boxShadow: `inset 0 0 10px rgba(0,0,0,0.5), 0 0 5px ${activePiece.color}`
              }} />;
            }
            return null;
          }))}
        </div>

        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>SCORE</div>
            <div style={{ fontSize: '1.5rem', fontFamily: 'Orbitron', color: 'var(--accent-cyan)' }}>{score}</div>
          </div>
          {gameOver && <h3 style={{ color: 'var(--accent-red)' }}>GAME OVER</h3>}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            ← → : Déplacer<br/>↑ : Rotation<br/>↓ : Descendre
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tetris;
