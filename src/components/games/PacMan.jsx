import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Heart } from 'lucide-react';

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
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isHit, setIsHit] = useState(false);
  
  const state = useRef({
    pacman: { x: 1, y: 1, dir: { x: 1, y: 0 }, nextDir: { x: 0, y: 0 }, mouth: 0, targetX: 1, targetY: 1, progress: 0 },
    ghosts: [
      { x: 9, y: 9, color: '#ff0000', dir: { x: 1, y: 0 }, targetX: 9, targetY: 9, progress: 0 },
      { x: 9, y: 7, color: '#ffb8ff', dir: { x: -1, y: 0 }, targetX: 9, targetY: 7, progress: 0 },
      { x: 7, y: 9, color: '#00ffff', dir: { x: 0, y: 1 }, targetX: 7, targetY: 9, progress: 0 }
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

    const moveEntity = (ent, isPacman = false) => {
      ent.progress += 0.12; // Vitesse de déplacement fluide
      if (ent.progress >= 1) {
        ent.x = ent.targetX;
        ent.y = ent.targetY;
        ent.progress = 0;

        if (isPacman) {
          // Décider de la prochaine direction
          if (state.current.map[ent.y + ent.nextDir.y]?.[ent.x + ent.nextDir.x] !== 1) {
            ent.dir = ent.nextDir;
          }
          if (state.current.map[ent.y + ent.dir.y]?.[ent.x + ent.dir.x] !== 1) {
            ent.targetX = ent.x + ent.dir.x;
            ent.targetY = ent.y + ent.dir.y;
          }
          // Collecter pellet
          if (state.current.map[ent.y][ent.x] === 0) {
            state.current.map[ent.y][ent.x] = 2;
            setScore(s => s + 10);
          }
        } else {
          // IA Fantôme
          const dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
          const valid = dirs.filter(d => state.current.map[ent.y + d.y]?.[ent.x + d.x] !== 1);
          if (valid.length > 0) {
            const best = valid.reduce((prev, curr) => {
              const dP = Math.abs(ent.x + prev.x - state.current.pacman.x) + Math.abs(ent.y + prev.y - state.current.pacman.y);
              const dC = Math.abs(ent.x + curr.x - state.current.pacman.x) + Math.abs(ent.y + curr.y - state.current.pacman.y);
              return dC < dP ? curr : prev;
            });
            ent.dir = Math.random() > 0.2 ? best : valid[Math.floor(Math.random()*valid.length)];
            ent.targetX = ent.x + ent.dir.x;
            ent.targetY = ent.y + ent.dir.y;
          }
        }
      }
    };

    const update = () => {
      if (gameOver) return;
      frame++;
      
      const s = state.current;
      moveEntity(s.pacman, true);
      s.ghosts.forEach(g => {
        moveEntity(g);
        // Collision detection fluide
        const dx = (s.pacman.x + s.pacman.dir.x * s.pacman.progress) - (g.x + g.dir.x * g.progress);
        const dy = (s.pacman.y + s.pacman.dir.y * s.pacman.progress) - (g.y + g.dir.y * g.progress);
        if (Math.sqrt(dx*dx + dy*dy) < 0.6) {
          handleHit();
        }
      });

      s.pacman.mouth = Math.abs(Math.sin(frame * 0.15)) * 0.25 * Math.PI;

      draw();
      animationId = requestAnimationFrame(update);
    };

    const handleHit = () => {
      setIsHit(true);
      setLives(l => {
        if (l <= 1) setGameOver(true);
        return l - 1;
      });
      // Reset positions
      state.current.pacman = { ...state.current.pacman, x: 1, y: 1, targetX: 1, targetY: 1, progress: 0 };
      setTimeout(() => setIsHit(false), 500);
    };

    const draw = () => {
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const s = state.current;
      
      // Labyrinthe haute qualité
      s.map.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            ctx.shadowBlur = 8; ctx.shadowColor = '#22d3ee';
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2;
            ctx.strokeRect(x*SIZE+4, y*SIZE+4, SIZE-8, SIZE-8);
          } else if (cell === 0) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffb8ae';
            ctx.beginPath(); ctx.arc(x*SIZE+SIZE/2, y*SIZE+SIZE/2, 2.5, 0, Math.PI*2); ctx.fill();
          }
        });
      });

      // Pacman (Interpolé)
      const p = s.pacman;
      const px = (p.x + (p.targetX - p.x) * p.progress) * SIZE + SIZE/2;
      const py = (p.y + (p.targetY - p.y) * p.progress) * SIZE + SIZE/2;
      const angle = p.dir.x === 1 ? 0 : p.dir.x === -1 ? Math.PI : p.dir.y === 1 ? Math.PI*0.5 : Math.PI*1.5;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, SIZE/2);
      grad.addColorStop(0, '#ffff00'); grad.addColorStop(1, '#ffaa00');
      ctx.shadowBlur = 15; ctx.shadowColor = 'yellow';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, SIZE/2 - 2, p.mouth, 2*Math.PI - p.mouth);
      ctx.lineTo(0, 0); ctx.fill();
      ctx.restore();

      // Fantômes (Interpolés)
      s.ghosts.forEach(g => {
        const gx = (g.x + (g.targetX - g.x) * g.progress) * SIZE + 5;
        const gy = (g.y + (g.targetY - g.y) * g.progress) * SIZE + 5;
        ctx.shadowBlur = 12; ctx.shadowColor = g.color;
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(gx + (SIZE-10)/2, gy + (SIZE-10)/2, (SIZE-10)/2, Math.PI, 0);
        ctx.lineTo(gx + (SIZE-10), gy + (SIZE-10));
        ctx.lineTo(gx, gy + (SIZE-10)); ctx.fill();
      });
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver]);

  return (
    <div className={`animate-fade-in ${isHit ? 'screen-shake' : ''}`} style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-purple">Pac-Man Ultra HD</h2>
        <button onClick={() => window.location.reload()} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border arcade-monitor" style={{ padding: '15px', position: 'relative', display: 'inline-block' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '1.4rem', fontFamily: 'Orbitron', color: '#ffff00' }}>{score}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[...Array(lives)].map((_, i) => <Heart key={i} size={20} fill="#ff0000" color="#ff0000" />)}
          </div>
        </div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ background: '#020205', borderRadius: '8px' }} />
        {gameOver && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, color: 'red', fontSize: '3.5rem', fontFamily: 'Orbitron' }}>GAME OVER</div>}
      </div>
    </div>
  );
};

export default PacMan;
