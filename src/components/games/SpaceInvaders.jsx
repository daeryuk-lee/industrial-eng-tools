import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const WIDTH = 600;
const HEIGHT = 450;
const SHIP_SIZE = 30;
const ALIEN_SIZE = 25;
const ALIEN_ROWS = 4;
const ALIEN_COLS = 8;

const SpaceInvaders = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const state = useRef({
    shipX: WIDTH / 2 - SHIP_SIZE / 2,
    bullets: [],
    aliens: [],
    alienDir: 1,
    lastShot: 0
  });

  const initAliens = () => {
    const aliens = [];
    for (let r = 0; r < ALIEN_ROWS; r++) {
      for (let c = 0; c < ALIEN_COLS; c++) {
        aliens.push({
          x: c * (ALIEN_SIZE + 20) + 50,
          y: r * (ALIEN_SIZE + 20) + 50,
          alive: true
        });
      }
    }
    state.current.aliens = aliens;
  };

  useEffect(() => {
    initAliens();
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') state.current.shipX = Math.max(0, state.current.shipX - 15);
      if (e.key === 'ArrowRight') state.current.shipX = Math.min(WIDTH - SHIP_SIZE, state.current.shipX + 15);
      if (e.key === ' ' || e.key === 'ArrowUp') {
        const now = Date.now();
        if (now - state.current.lastShot > 400) {
          state.current.bullets.push({ x: state.current.shipX + SHIP_SIZE / 2, y: HEIGHT - SHIP_SIZE - 10 });
          state.current.lastShot = now;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let animationId;

    const update = () => {
      if (gameOver || win) return;

      const s = state.current;
      
      // Move bullets
      s.bullets = s.bullets.filter(b => b.y > 0);
      s.bullets.forEach(b => b.y -= 7);

      // Move aliens
      let shouldDrop = false;
      s.aliens.forEach(a => {
        if (!a.alive) return;
        a.x += 1.5 * s.alienDir;
        if (a.x <= 10 || a.x >= WIDTH - ALIEN_SIZE - 10) shouldDrop = true;
      });

      if (shouldDrop) {
        s.alienDir *= -1;
        s.aliens.forEach(a => a.y += 15);
      }

      // Collisions
      s.bullets.forEach(b => {
        s.aliens.forEach(a => {
          if (a.alive && b.x > a.x && b.x < a.x + ALIEN_SIZE && b.y > a.y && b.y < a.y + ALIEN_SIZE) {
            a.alive = false;
            b.y = -100; // Remove bullet
            setScore(prev => prev + 50);
          }
        });
      });

      // Check Game Over / Win
      if (s.aliens.some(a => a.alive && a.y >= HEIGHT - SHIP_SIZE - 20)) setGameOver(true);
      if (s.aliens.every(a => !a.alive)) setWin(true);

      draw();
      animationId = requestAnimationFrame(update);
    };

    const draw = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Stars
      ctx.fillStyle = 'white';
      for(let i=0; i<30; i++) ctx.fillRect((i*137)%WIDTH, (i*241)%HEIGHT, 1, 1);

      // Ship
      ctx.fillStyle = 'var(--accent-cyan)';
      ctx.shadowBlur = 10; ctx.shadowColor = 'var(--accent-cyan)';
      ctx.beginPath();
      ctx.moveTo(s.shipX + SHIP_SIZE/2, HEIGHT - SHIP_SIZE);
      ctx.lineTo(s.shipX, HEIGHT - 10);
      ctx.lineTo(s.shipX + SHIP_SIZE, HEIGHT - 10);
      ctx.fill();

      // Bullets
      ctx.fillStyle = 'var(--accent-pink)';
      s.bullets.forEach(b => ctx.fillRect(b.x - 2, b.y, 4, 10));

      // Aliens
      ctx.fillStyle = 'var(--accent-green)';
      ctx.shadowColor = 'var(--accent-green)';
      s.aliens.forEach(a => {
        if (a.alive) {
          ctx.fillRect(a.x, a.y, ALIEN_SIZE, ALIEN_SIZE - 5);
          ctx.fillRect(a.x + 5, a.y + ALIEN_SIZE - 5, 5, 5);
          ctx.fillRect(a.x + ALIEN_SIZE - 10, a.y + ALIEN_SIZE - 5, 5, 5);
        }
      });
      ctx.shadowBlur = 0;
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, win]);

  const reset = () => {
    initAliens();
    setScore(0);
    setGameOver(false);
    setWin(false);
    state.current.bullets = [];
    state.current.shipX = WIDTH / 2 - SHIP_SIZE / 2;
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-green">SPACE INVADERS</h2>
        <button onClick={reset} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontFamily: 'Orbitron', marginBottom: '15px' }}>
          <span style={{ color: 'var(--accent-cyan)' }}>SCORE: {score}</span>
          {(gameOver || win) && (
            <span style={{ color: win ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {win ? 'MISSION RÉUSSIE' : 'GAME OVER'}
            </span>
          )}
        </div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ background: 'black', borderRadius: '8px' }} />
        <p style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>← → : Déplacer • ESPACE : Tirer</p>
      </div>
    </div>
  );
};

export default SpaceInvaders;
