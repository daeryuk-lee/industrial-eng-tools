import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const CANVAS_SIZE = 400;
const GRID_SIZE = 20;

const Snake = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

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
    const moveSnake = setInterval(() => {
      setSnake(prevSnake => {
        const head = { x: prevSnake[0].x + direction.x, y: prevSnake[0].y + direction.y };
        
        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];
        
        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood({
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          });
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(moveSnake);
  }, [direction, food, gameOver]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Grid (optional style)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for(let i=0; i<=CANVAS_SIZE; i += CANVAS_SIZE/GRID_SIZE) {
      ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(CANVAS_SIZE,i); ctx.stroke();
    }

    // Food
    ctx.fillStyle = 'var(--accent-pink)';
    ctx.shadowBlur = 10; ctx.shadowColor = 'var(--accent-pink)';
    ctx.fillRect(food.x * (CANVAS_SIZE/GRID_SIZE) + 2, food.y * (CANVAS_SIZE/GRID_SIZE) + 2, (CANVAS_SIZE/GRID_SIZE) - 4, (CANVAS_SIZE/GRID_SIZE) - 4);

    // Snake
    ctx.fillStyle = 'var(--accent-green)';
    ctx.shadowBlur = 8; ctx.shadowColor = 'var(--accent-green)';
    snake.forEach((seg, i) => {
      ctx.globalAlpha = i === 0 ? 1 : 0.8 - (i/snake.length)*0.5;
      ctx.fillRect(seg.x * (CANVAS_SIZE/GRID_SIZE) + 1, seg.y * (CANVAS_SIZE/GRID_SIZE) + 1, (CANVAS_SIZE/GRID_SIZE) - 2, (CANVAS_SIZE/GRID_SIZE) - 2);
    });
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }, [snake, food]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 0, y: -1 });
    setGameOver(false);
    setScore(0);
    setFood({ x: 5, y: 5 });
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <ArrowLeft size={20} /> Retour
        </button>
        <h2 className="neon-text-green">Snake</h2>
        <button onClick={resetGame} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '20px', display: 'inline-block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontFamily: 'Orbitron' }}>
          <span style={{ color: 'var(--accent-green)' }}>SCORE: {score}</span>
          {gameOver && <span style={{ color: 'var(--accent-red)' }}>GAME OVER</span>}
        </div>
        <canvas 
          ref={canvasRef} 
          width={CANVAS_SIZE} 
          height={CANVAS_SIZE} 
          style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)' }}
        />
        <p style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Utilisez les flèches du clavier pour diriger le serpent.</p>
      </div>
    </div>
  );
};

export default Snake;
