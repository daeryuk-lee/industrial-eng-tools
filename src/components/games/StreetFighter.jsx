import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const WIDTH = 600;
const HEIGHT = 300;

const StreetFighter = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [health, setHealth] = useState({ p1: 100, p2: 100 });
  const [gameOver, setGameOver] = useState(false);

  const state = useRef({
    p1: { x: 100, y: HEIGHT - 80, w: 40, h: 80, action: 'idle', color: 'var(--accent-cyan)' },
    p2: { x: 450, y: HEIGHT - 80, w: 40, h: 80, action: 'idle', color: 'var(--accent-pink)' }
  });

  useEffect(() => {
    const handleKey = (e) => {
      const p1 = state.current.p1;
      if (e.key === 'q') p1.x -= 10;
      if (e.key === 'd') p1.x += 10;
      if (e.key === 'f') { // Punch
        p1.action = 'punch';
        setTimeout(() => p1.action = 'idle', 200);
        checkHit(p1, state.current.p2, 'p2');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const checkHit = (attacker, defender, target) => {
    const reach = attacker.w + 20;
    const isClose = Math.abs(attacker.x - defender.x) < reach;
    if (isClose) {
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
      
      // Simple AI for P2
      const p1 = state.current.p1;
      const p2 = state.current.p2;
      if (p2.x > p1.x + 60) p2.x -= 2;
      else if (Math.random() > 0.95) {
        p2.action = 'punch';
        setTimeout(() => p2.action = 'idle', 200);
        checkHit(p2, p1, 'p1');
      }

      draw();
      animationId = requestAnimationFrame(update);
    };

    const draw = () => {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      
      // Ground
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(0, HEIGHT - 20, WIDTH, 20);

      // P1
      drawPlayer(ctx, state.current.p1);
      // P2
      drawPlayer(ctx, state.current.p2);
    };

    const drawPlayer = (ctx, p) => {
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10; ctx.shadowColor = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      if (p.action === 'punch') {
        ctx.fillRect(p === state.current.p1 ? p.x + p.w : p.x - 20, p.y + 20, 20, 10);
      }
      ctx.shadowBlur = 0;
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-pink">STREET FIGHTER</h2>
        <button onClick={() => window.location.reload()} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ width: '45%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${health.p1}%`, height: '100%', background: 'var(--accent-cyan)', transition: 'width 0.3s' }} />
          </div>
          <div style={{ width: '45%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${health.p2}%`, height: '100%', background: 'var(--accent-pink)', transition: 'width 0.3s' }} />
          </div>
        </div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ background: 'black', borderRadius: '8px' }} />
        {gameOver && <h3 style={{ color: 'var(--accent-red)', marginTop: '10px' }}>K.O.</h3>}
        <p style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Q / D : Déplacer • F : Coup de poing</p>
      </div>
    </div>
  );
};

export default StreetFighter;
