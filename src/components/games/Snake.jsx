import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

const Snake = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + direction.x, y: prev[0].y + direction.y };
        
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          if (score > highScore) setHighScore(score);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 100); // Vitesse plus fluide
    return () => clearInterval(interval);
  }, [direction, food, gameOver, score, highScore]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#020205'; // Noir profond
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grille subtile
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for(let i=0; i<=CANVAS_SIZE; i+=CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(CANVAS_SIZE,i); ctx.stroke();
    }

    // Food (Glow effect)
    ctx.shadowBlur = 15; ctx.shadowColor = '#f472b6';
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(food.x*CELL_SIZE + CELL_SIZE/2, food.y*CELL_SIZE + CELL_SIZE/2, CELL_SIZE/2 - 4, 0, Math.PI*2);
    ctx.fill();

    // Snake (Neon Green)
    snake.forEach((seg, i) => {
      ctx.shadowBlur = i === 0 ? 20 : 10;
      ctx.shadowColor = '#4ade80';
      ctx.fillStyle = i === 0 ? '#4ade80' : 'rgba(74, 222, 128, 0.6)';
      ctx.fillRect(seg.x*CELL_SIZE + 1, seg.y*CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    ctx.shadowBlur = 0;
  }, [snake, food]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-green">Snake Neon</h2>
        <button onClick={() => {setSnake([{x:10,y:10}]); setGameOver(false); setScore(0);}} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border arcade-monitor" style={{ padding: '20px', display: 'inline-block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Orbitron', marginBottom: '10px' }}>
          <span style={{ color: '#4ade80' }}>SCORE: {score}</span>
          <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '5px' }}><Trophy size={16}/> {highScore}</span>
        </div>
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} style={{ background: '#000', borderRadius: '4px', border: '2px solid rgba(74, 222, 128, 0.2)' }} />
        {gameOver && <h3 style={{ color: '#ef4444', marginTop: '10px', fontFamily: 'Orbitron' }}>GAME OVER</h3>}
      </div>
    </div>
  );
};

export default Snake;
