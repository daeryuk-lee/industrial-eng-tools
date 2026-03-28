import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const WIDTH = 600;
const HEIGHT = 300;

const StreetFighter = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [health, setHealth] = useState({ p1: 100, p2: 100 });
  const [gameOver, setGameOver] = useState(false);
  const [isHit, setIsHit] = useState(null); // 'p1' or 'p2'

  const state = useRef({
    p1: { x: 100, y: HEIGHT - 100, w: 45, h: 90, action: 'idle', color: '#22d3ee', dir: 1 },
    p2: { x: 450, y: HEIGHT - 100, w: 45, h: 90, action: 'idle', color: '#f472b6', dir: -1 },
    particles: []
  });

  useEffect(() => {
    const handleKey = (e) => {
      const p1 = state.current.p1;
      if (e.key === 'q') p1.x -= 12;
      if (e.key === 'd') p1.x += 12;
      if (e.key === 'f') { // Punch
        p1.action = 'punch';
        setTimeout(() => p1.action = 'idle', 150);
        checkHit(p1, state.current.p2, 'p2');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const createParticles = (x, y, color) => {
    for(let i=0; i<10; i++) {
      state.current.particles.push({
        x, y, 
        vx: (Math.random()-0.5)*10, 
        vy: (Math.random()-0.5)*10, 
        life: 20, 
        color
      });
    }
  };

  const checkHit = (attacker, defender, target) => {
    const reach = attacker.w + 30;
    const isClose = Math.abs(attacker.x - defender.x) < reach;
    if (isClose) {
      setIsHit(target);
      createParticles(defender.x + defender.w/2, defender.y + 30, attacker.color);
      setTimeout(() => setIsHit(null), 100);
      setHealth(prev => {
        const newHealth = { ...prev, [target]: Math.max(0, prev[target] - 10) };
        if (newHealth[target] === 0) setGameOver(true);
        return newHealth;
      });
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let animationId;

    const update = () => {
      if (gameOver) return;
      
      const s = state.current;
      // AI P2
      if (s.p2.x > s.p1.x + 70) s.p2.x -= 3;
      else if (Math.random() > 0.96) {
        s.p2.action = 'punch';
        setTimeout(() => s.p2.action = 'idle', 150);
        checkHit(s.p2, s.p1, 'p1');
      }

      // Particles
      s.particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) s.particles.splice(i, 1);
      });

      draw();
      animationId = requestAnimationFrame(update);
    };

    const draw = () => {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      
      // Ground with Glow
      ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(192, 132, 252, 0.3)';
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(0, HEIGHT - 20, WIDTH, 20);

      // Draw Players
      drawPlayer(ctx, state.current.p1, isHit === 'p1');
      drawPlayer(ctx, state.current.p2, isHit === 'p2');

      // Draw Particles
      s.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 20;
        ctx.fillRect(p.x, p.y, 3, 3);
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    };

    const drawPlayer = (ctx, p, hit) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (hit) ctx.translate((Math.random()-0.5)*10, 0);

      // Silhouette
      ctx.shadowBlur = hit ? 30 : 15;
      ctx.shadowColor = p.color;
      ctx.fillStyle = hit ? 'white' : p.color;
      
      // Body
      ctx.fillRect(0, 0, p.w, p.h);
      // Head
      ctx.fillRect(p.w/4, -25, p.w/2, 20);
      
      // Punch effect
      if (p.action === 'punch') {
        const dir = p === state.current.p1 ? 1 : -1;
        ctx.fillRect(dir === 1 ? p.w : -30, 20, 30, 15);
        // Energy trail
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(dir === 1 ? p.w - 20 : 10, 22, 50 * dir, 10);
      }
      
      ctx.restore();
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, isHit]);

  return (
    <div className={`animate-fade-in ${isHit ? 'screen-shake' : ''}`} style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-pink">STREET FIGHTER ULTRA</h2>
        <button onClick={() => window.location.reload()} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border arcade-monitor" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ width: '45%', height: '25px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(34, 211, 238, 0.3)', overflow: 'hidden' }}>
            <div style={{ width: `${health.p1}%`, height: '100%', background: 'linear-gradient(90deg, #22d3ee, #0ea5e9)', boxShadow: '0 0 15px #22d3ee', transition: 'width 0.3s' }} />
          </div>
          <div style={{ width: '45%', height: '25px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', border: '1px solid rgba(244, 114, 182, 0.3)', overflow: 'hidden' }}>
            <div style={{ width: `${health.p2}%`, height: '100%', background: 'linear-gradient(90deg, #f472b6, #db2777)', boxShadow: '0 0 15px #f472b6', transition: 'width 0.3s' }} />
          </div>
        </div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ background: 'black', borderRadius: '8px' }} />
        {gameOver && <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', color: '#ff0000', fontSize: '4rem', fontFamily: 'Orbitron', textShadow: '0 0 30px red', zIndex: 20 }}>K.O.</div>}
      </div>
    </div>
  );
};

export default StreetFighter;
