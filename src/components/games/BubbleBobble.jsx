import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const WIDTH = 600;
const HEIGHT = 400;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const SPEED = 4;

const BubbleBobble = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const state = useRef({
    player: { x: 50, y: 300, vx: 0, vy: 0, width: 30, height: 30, grounded: false },
    bubbles: [],
    enemies: [
      { x: 400, y: 320, vx: -2, width: 25, height: 25, trapped: false },
      { x: 200, y: 120, vx: 2, width: 25, height: 25, trapped: false }
    ],
    platforms: [
      { x: 0, y: 350, w: 600, h: 50 }, // Ground
      { x: 100, y: 250, w: 150, h: 15 },
      { x: 350, y: 250, w: 150, h: 15 },
      { x: 225, y: 150, w: 150, h: 15 }
    ]
  });

  useEffect(() => {
    const handleKey = (e) => {
      const p = state.current.player;
      if (e.key === 'ArrowLeft') p.vx = -SPEED;
      if (e.key === 'ArrowRight') p.vx = SPEED;
      if (e.key === 'ArrowUp' && p.grounded) { p.vy = JUMP_FORCE; p.grounded = false; }
      if (e.key === ' ') { // Shoot bubble
        state.current.bubbles.push({ x: p.x + p.width, y: p.y + 5, vx: 8, life: 60 });
      }
    };
    const handleKeyUp = (e) => {
      const p = state.current.player;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') p.vx = 0;
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let animationId;

    const update = () => {
      if (gameOver) return;
      const s = state.current;
      const p = s.player;

      // Player Physics
      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.grounded = false;

      // Platform collisions
      s.platforms.forEach(plat => {
        if (p.x < plat.x + plat.w && p.x + p.width > plat.x && p.y + p.height > plat.y && p.y + p.height < plat.y + plat.h + p.vy) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.grounded = true;
        }
      });

      // Boundaries
      p.x = Math.max(0, Math.min(WIDTH - p.width, p.x));

      // Update Bubbles
      s.bubbles.forEach((b, bi) => {
        b.x += b.vx;
        b.life--;
        if (b.life <= 0) s.bubbles.splice(bi, 1);
        
        // Trap enemies
        s.enemies.forEach(en => {
          if (!en.trapped && b.x > en.x && b.x < en.x + en.width && b.y > en.y && b.y < en.y + en.height) {
            en.trapped = true;
            s.bubbles.splice(bi, 1);
          }
        });
      });

      // Update Enemies
      s.enemies.forEach((en, ei) => {
        if (en.trapped) {
          en.y -= 1; // Bubble float up
          if (en.y < -30) s.enemies.splice(ei, 1);
          // Player pop trapped enemy
          if (p.x < en.x + en.width && p.x + p.width > en.x && p.y < en.y + en.height && p.y + p.height > en.y) {
            s.enemies.splice(ei, 1);
            setScore(prev => prev + 500);
          }
        } else {
          en.x += en.vx;
          if (en.x <= 0 || en.x >= WIDTH - en.width) en.vx *= -1;
          // Player hit enemy
          if (p.x < en.x + en.width && p.x + p.width > en.x && p.y < en.y + en.height && p.y + p.height > en.y) {
            setGameOver(true);
          }
        }
      });

      draw();
      animationId = requestAnimationFrame(update);
    };

    const draw = () => {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const s = state.current;
      // Platforms
      ctx.fillStyle = '#22d3ee';
      s.platforms.forEach(plat => ctx.fillRect(plat.x, plat.y, plat.w, plat.h));

      // Player
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(s.player.x, s.player.y, s.player.width, s.player.height);

      // Bubbles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      s.bubbles.forEach(b => {
        ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, Math.PI*2); ctx.stroke();
      });

      // Enemies
      s.enemies.forEach(en => {
        ctx.fillStyle = en.trapped ? 'rgba(255,255,255,0.3)' : '#f472b6';
        if (en.trapped) {
          ctx.beginPath(); ctx.arc(en.x+12, en.y+12, 15, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillRect(en.x, en.y, en.width, en.height);
      });
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-green">BUBBLE BOBBLE</h2>
        <button onClick={() => window.location.reload()} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>
      <div className="glass-card neon-border" style={{ padding: '20px' }}>
        <div style={{ fontSize: '1.2rem', fontFamily: 'Orbitron', color: 'var(--accent-green)', marginBottom: '10px' }}>SCORE: {score}</div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ background: 'black', borderRadius: '8px' }} />
        {gameOver && <h3 style={{ color: 'var(--accent-red)', marginTop: '10px' }}>GAME OVER</h3>}
        <p style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>← → : Déplacer • ↑ : Sauter • ESPACE : Bulles</p>
      </div>
    </div>
  );
};

export default BubbleBobble;
