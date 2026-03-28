import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const WIDTH = 570;
const HEIGHT = 420;
const SIZE = 30;

// 1 = Wall, 0 = Pellet, 2 = Empty
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,1,2,2,2,2,2,2,2,1,0,0,0,0,1],
  [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,2,1,2,2,2,1,2,0,0,0,0,0,1],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,1,2,2,2,2,2,2,2,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
];

const PacMan = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const state = useRef({
    pacman: { x: 1, y: 1, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 } },
    ghosts: [
      { x: 9, y: 9, color: 'red', dir: { x: 1, y: 0 } },
      { x: 9, y: 7, color: 'pink', dir: { x: -1, y: 0 } }
    ],
    map: MAP.map(row => [...row])
  });

  useEffect(() => {
    const handleKey = (e) => {
      const s = state.current.pacman;
      if (e.key === 'ArrowUp') s.nextDir = { x: 0, y: -1 };
      if (e.key === 'ArrowDown') s.nextDir = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft') s.nextDir = { x: -1, y: 0 };
      if (e.key === 'ArrowRight') s.nextDir = { x: 1, y: 0 };
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let animationId;
    let frame = 0;

    const update = () => {
      if (gameOver) return;
      frame++;
      if (frame % 15 !== 0) { // Slow down movement
        animationId = requestAnimationFrame(update);
        return;
      }

      const s = state.current;
      
      // Update Pacman
      const p = s.pacman;
      // Try next direction
      if (s.map[p.y + p.nextDir.y]?.[p.x + p.nextDir.x] !== 1) p.dir = p.nextDir;
      // Move if no wall
      if (s.map[p.y + p.dir.y]?.[p.x + p.dir.x] !== 1) {
        p.x += p.dir.x; p.y += p.dir.y;
      }

      // Collect pellet
      if (s.map[p.y][p.x] === 0) {
        s.map[p.y][p.x] = 2;
        setScore(prev => prev + 10);
      }

      // Update Ghosts
      s.ghosts.forEach(g => {
        const dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
        const validDirs = dirs.filter(d => s.map[g.y + d.y]?.[g.x + d.x] !== 1);
        if (validDirs.length > 0) {
          // AI: Try to follow Pacman
          const bestDir = validDirs.reduce((prev, curr) => {
            const distP = Math.abs(g.x + prev.x - p.x) + Math.abs(g.y + prev.y - p.y);
            const distC = Math.abs(g.x + curr.x - p.x) + Math.abs(g.y + curr.y - p.y);
            return distC < distP ? curr : prev;
          });
          if (Math.random() > 0.3) g.dir = bestDir; // 70% chance to be smart
          else g.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
          
          g.x += g.dir.x; g.y += g.dir.y;
        }

        // Collision with Pacman
        if (g.x === p.x && g.y === p.y) setGameOver(true);
      });

      draw();
      animationId = requestAnimationFrame(update);
    };

    const draw = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const s = state.current;
      s.map.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            ctx.fillStyle = 'rgba(34, 211, 238, 0.3)';
            ctx.strokeStyle = 'var(--accent-cyan)';
            ctx.fillRect(x*SIZE, y*SIZE, SIZE, SIZE);
            ctx.strokeRect(x*SIZE+2, y*SIZE+2, SIZE-4, SIZE-4);
          } else if (cell === 0) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x*SIZE + SIZE/2, y*SIZE + SIZE/2, 2, 0, Math.PI*2);
            ctx.fill();
          }
        });
      });

      // Pacman
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(s.pacman.x*SIZE + SIZE/2, s.pacman.y*SIZE + SIZE/2, SIZE/2 - 2, 0.2*Math.PI, 1.8*Math.PI);
      ctx.lineTo(s.pacman.x*SIZE + SIZE/2, s.pacman.y*SIZE + SIZE/2);
      ctx.fill();

      // Ghosts
      s.ghosts.forEach(g => {
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(g.x*SIZE + SIZE/2, g.y*SIZE + SIZE/2 - 2, SIZE/2 - 2, Math.PI, 0);
        ctx.lineTo(g.x*SIZE + SIZE, g.y*SIZE + SIZE);
        ctx.lineTo(g.x*SIZE, g.y*SIZE + SIZE);
        ctx.fill();
        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(g.x*SIZE+8, g.y*SIZE+8, 4, 4);
        ctx.fillRect(g.x*SIZE+18, g.y*SIZE+8, 4, 4);
      });
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-purple">PAC-MAN AI</h2>
        <button onClick={() => window.location.reload()} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '10px', display: 'inline-block' }}>
        <div style={{ marginBottom: '10px', fontSize: '1.2rem', fontFamily: 'Orbitron', color: 'yellow' }}>SCORE: {score}</div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ background: 'black', borderRadius: '4px' }} />
        {gameOver && <h3 style={{ color: 'var(--accent-red)', marginTop: '10px' }}>GAME OVER</h3>}
        <p style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Utilisez les flèches pour diriger Pac-Man.</p>
      </div>
    </div>
  );
};

export default PacMan;
