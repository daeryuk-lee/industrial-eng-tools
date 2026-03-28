import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Heart } from 'lucide-react';

const WIDTH = 600;
const HEIGHT = 400;
const GRAVITY = 0.45;
const JUMP_FORCE = -11;
const SPEED = 4.5;

const BubbleBobble = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);

  const state = useRef({
    player: { x: 50, y: 300, vx: 0, vy: 0, w: 35, h: 35, grounded: false, dir: 1 },
    bubbles: [],
    enemies: [],
    platforms: []
  });

  const initLevel = (lvl) => {
    state.current.player = { x: 50, y: 300, vx: 0, vy: 0, w: 35, h: 35, grounded: false, dir: 1 };
    state.current.bubbles = [];
    
    if (lvl === 1) {
      state.current.platforms = [
        { x: 0, y: 360, w: 600, h: 40, color: '#22c55e' },
        { x: 100, y: 260, w: 150, h: 15, color: '#38bdf8' },
        { x: 350, y: 260, w: 150, h: 15, color: '#38bdf8' },
        { x: 225, y: 160, w: 150, h: 15, color: '#38bdf8' }
      ];
      state.current.enemies = [
        { x: 400, y: 325, vx: -2, w: 30, h: 30, trapped: false, color: '#f472b6' },
        { x: 250, y: 130, vx: 2, w: 30, h: 30, trapped: false, color: '#f472b6' }
      ];
    } else {
      state.current.platforms = [
        { x: 0, y: 360, w: 600, h: 40, color: '#ef4444' },
        { x: 50, y: 280, w: 100, h: 15, color: '#f59e0b' },
        { x: 450, y: 280, w: 100, h: 15, color: '#f59e0b' },
        { x: 200, y: 200, w: 200, h: 15, color: '#f59e0b' },
        { x: 100, y: 100, w: 400, h: 15, color: '#f59e0b' }
      ];
      state.current.enemies = [
        { x: 100, y: 330, vx: 3, w: 30, h: 30, trapped: false, color: '#a855f7' },
        { x: 500, y: 250, vx: -3, w: 30, h: 30, trapped: false, color: '#a855f7' },
        { x: 300, y: 70, vx: 4, w: 30, h: 30, trapped: false, color: '#a855f7' }
      ];
    }
  };

  useEffect(() => {
    initLevel(level);
    const handleKey = (e) => {
      const p = state.current.player;
      if (e.key === 'ArrowLeft') { p.vx = -SPEED; p.dir = -1; }
      if (e.key === 'ArrowRight') { p.vx = SPEED; p.dir = 1; }
      if (e.key === 'ArrowUp' && p.grounded) { p.vy = JUMP_FORCE; p.grounded = false; }
      if (e.key === ' ') {
        state.current.bubbles.push({ x: p.x + (p.dir === 1 ? p.w : -15), y: p.y + 10, vx: 9 * p.dir, life: 50 });
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') state.current.player.vx = 0;
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKeyUp); };
  }, [level]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let animationId;

    const update = () => {
      if (gameOver) return;
      const s = state.current;
      const p = s.player;

      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.grounded = false;

      s.platforms.forEach(plat => {
        if (p.x < plat.x + plat.w && p.x + p.w > plat.x && p.y + p.h > plat.y && p.y + p.h < plat.y + plat.h + p.vy) {
          p.y = plat.y - p.h; p.vy = 0; p.grounded = true;
        }
      });
      p.x = Math.max(0, Math.min(WIDTH - p.w, p.x));

      s.bubbles.forEach((b, bi) => {
        b.x += b.vx; b.life--;
        if (b.life <= 0) s.bubbles.splice(bi, 1);
        s.enemies.forEach(en => {
          if (!en.trapped && Math.abs(b.x - en.x) < 20 && Math.abs(b.y - en.y) < 20) {
            en.trapped = true; s.bubbles.splice(bi, 1);
          }
        });
      });

      s.enemies.forEach((en, ei) => {
        if (en.trapped) {
          en.y -= 1.5;
          if (en.y < -30) s.enemies.splice(ei, 1);
          if (Math.abs(p.x - en.x) < 30 && Math.abs(p.y - en.y) < 30) {
            s.enemies.splice(ei, 1); setScore(v => v + 500);
          }
        } else {
          en.x += en.vx;
          if (en.x <= 0 || en.x >= WIDTH - en.w) en.vx *= -1;
          if (Math.abs(p.x - en.x) < 25 && Math.abs(p.y - en.y) < 25) handleHit();
        }
      });

      if (s.enemies.length === 0) setLevel(l => l === 1 ? 2 : 1);

      draw();
      animationId = requestAnimationFrame(update);
    };

    const handleHit = () => {
      setLives(l => {
        if (l <= 1) setGameOver(true);
        return l - 1;
      });
      state.current.player.x = 50; state.current.player.y = 300;
    };

    const draw = () => {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const s = state.current;
      s.platforms.forEach(plat => {
        ctx.shadowBlur = 10; ctx.shadowColor = plat.color;
        ctx.fillStyle = plat.color;
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      });

      // Dragon Sprite (SVG-style)
      const p = s.player;
      ctx.shadowBlur = 15; ctx.shadowColor = '#4ade80';
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = 'white';
      ctx.fillRect(p.x + (p.dir === 1 ? 20 : 5), p.y + 5, 8, 8); // Eye

      s.enemies.forEach(en => {
        ctx.shadowBlur = 10; ctx.shadowColor = en.color;
        ctx.fillStyle = en.trapped ? 'rgba(255,255,255,0.4)' : en.color;
        if (en.trapped) {
          ctx.beginPath(); ctx.arc(en.x+15, en.y+15, 20, 0, Math.PI*2); ctx.stroke();
        }
        ctx.fillRect(en.x, en.y, en.w, en.h);
      });
      ctx.shadowBlur = 0;
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [level, gameOver]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-green">Bubble Bobble HD</h2>
        <button onClick={() => window.location.reload()} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border arcade-monitor" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Orbitron', marginBottom: '10px' }}>
          <span style={{ color: 'var(--accent-green)' }}>SCORE: {score}</span>
          <span style={{ color: 'var(--accent-cyan)' }}>LVL: {level}</span>
          <div style={{ display: 'flex', gap: '5px' }}>
            {[...Array(lives)].map((_, i) => <Heart key={i} size={18} fill="#ff0000" color="#ff0000" />)}
          </div>
        </div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ background: 'black', borderRadius: '8px' }} />
        {gameOver && <h3 style={{ color: 'red', marginTop: '10px', fontFamily: 'Orbitron' }}>GAME OVER</h3>}
      </div>
    </div>
  );
};

export default BubbleBobble;
