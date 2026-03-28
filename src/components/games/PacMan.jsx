import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const WIDTH = 570;
const HEIGHT = 420;
const SIZE = 30;

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
  const [isHit, setIsHit] = useState(false);
  
  const state = useRef({
    pacman: { x: 1, y: 1, dir: { x: 1, y: 0 }, nextDir: { x: 0, y: 0 }, mouth: 0 },
    ghosts: [
      { x: 9, y: 9, color: '#ff0000', dir: { x: 1, y: 0 } },
      { x: 9, y: 7, color: '#ffb8ff', dir: { x: -1, y: 0 } },
      { x: 7, y: 9, color: '#00ffff', dir: { x: 0, y: 1 } }
    ],
    map: MAP.map(row => [...row])
  });

  useEffect(() => {
    const handleKey = (e) => {
      const p = state.current.pacman;
      if (e.key === 'ArrowUp') p.nextDir = { x: 0, y: -1 };
      if (e.key === 'ArrowDown') p.nextDir = { x: 0, y: 1 };
      if (e.key === 'ArrowLeft') p.nextDir = { x: -1, y: 0 };
      if (e.key === 'ArrowRight') p.nextDir = { x: 1, y: 0 };
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
      
      const s = state.current;
      const p = s.pacman;
      
      // Animation de la bouche
      p.mouth = Math.abs(Math.sin(frame * 0.2)) * 0.2 * Math.PI;

      if (frame % 12 === 0) { // Mouvement
        if (s.map[p.y + p.nextDir.y]?.[p.x + p.nextDir.x] !== 1) p.dir = p.nextDir;
        if (s.map[p.y + p.dir.y]?.[p.x + p.dir.x] !== 1) {
          p.x += p.dir.x; p.y += p.dir.y;
        }

        if (s.map[p.y][p.x] === 0) {
          s.map[p.y][p.x] = 2;
          setScore(prev => prev + 10);
        }

        s.ghosts.forEach(g => {
          const dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
          const valid = dirs.filter(d => s.map[g.y + d.y]?.[g.x + d.x] !== 1);
          if (valid.length > 0) {
            const best = valid.reduce((prev, curr) => {
              const dP = Math.abs(g.x + prev.x - p.x) + Math.abs(g.y + prev.y - p.y);
              const dC = Math.abs(g.x + curr.x - p.x) + Math.abs(g.y + curr.y - p.y);
              return dC < dP ? curr : prev;
            });
            g.dir = Math.random() > 0.3 ? best : valid[Math.floor(Math.random()*valid.length)];
            g.x += g.dir.x; g.y += g.dir.y;
          }
          if (g.x === p.x && g.y === p.y) { setGameOver(true); setIsHit(true); }
        });
      }

      draw();
      animationId = requestAnimationFrame(update);
    };

    const draw = () => {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const s = state.current;
      
      // Murs Néon
      s.map.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(34, 211, 238, 0.4)';
            ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 1;
            ctx.fillRect(x*SIZE+4, y*SIZE+4, SIZE-8, SIZE-8);
            ctx.strokeRect(x*SIZE+2, y*SIZE+2, SIZE-4, SIZE-4);
          } else if (cell === 0) {
            ctx.shadowBlur = 5; ctx.shadowColor = 'white';
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(x*SIZE+SIZE/2, y*SIZE+SIZE/2, 2, 0, Math.PI*2); ctx.fill();
          }
        });
      });

      // Pacman Stylisé (SVG-like drawing)
      const p = s.pacman;
      const angle = p.dir.x === 1 ? 0 : p.dir.x === -1 ? Math.PI : p.dir.y === 1 ? Math.PI*0.5 : Math.PI*1.5;
      
      ctx.save();
      ctx.translate(p.x*SIZE + SIZE/2, p.y*SIZE + SIZE/2);
      ctx.rotate(angle);
      
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, SIZE/2);
      grad.addColorStop(0, '#ffff00');
      grad.addColorStop(1, '#ffaa00');
      
      ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(255, 255, 0, 0.5)';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, SIZE/2 - 2, p.mouth, 2*Math.PI - p.mouth);
      ctx.lineTo(0, 0);
      ctx.fill();
      
      // Oeil
      ctx.fillStyle = 'black';
      ctx.beginPath(); ctx.arc(2, -8, 2, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      // Fantômes Stylisés
      s.ghosts.forEach(g => {
        ctx.shadowBlur = 15; ctx.shadowColor = g.color;
        ctx.fillStyle = g.color;
        
        const gx = g.x*SIZE + 5;
        const gy = g.y*SIZE + 5;
        const gs = SIZE - 10;
        
        ctx.beginPath();
        ctx.arc(gx + gs/2, gy + gs/2, gs/2, Math.PI, 0);
        ctx.lineTo(gx + gs, gy + gs);
        // Bas ondulé
        for(let i=0; i<3; i++) {
          ctx.quadraticCurveTo(gx + gs - (i*gs/3) - gs/6, gy + gs + 5, gx + gs - (i+1)*gs/3, gy + gs);
        }
        ctx.lineTo(gx, gy + gs/2);
        ctx.fill();
        
        // Yeux
        ctx.fillStyle = 'white';
        ctx.beginPath(); ctx.arc(gx+8, gy+8, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(gx+18, gy+8, 4, 0, Math.PI*2); ctx.fill();
      });
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver]);

  return (
    <div className={`animate-fade-in ${isHit ? 'screen-shake' : ''}`} style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-purple">Pac-Man Ultra</h2>
        <button onClick={() => window.location.reload()} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border arcade-monitor" style={{ padding: '10px', display: 'inline-block', position: 'relative', overflow: 'hidden' }}>
        <div style={{ marginBottom: '10px', fontSize: '1.4rem', fontFamily: 'Orbitron', color: '#ffff00', textShadow: '0 0 10px rgba(255,255,0,0.5)' }}>SCORE: {score}</div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ background: 'black', borderRadius: '4px' }} />
        {gameOver && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, color: '#ff0000', fontSize: '3rem', fontFamily: 'Orbitron', textShadow: '0 0 20px red' }}>GAME OVER</div>}
      </div>
    </div>
  );
};

export default PacMan;
