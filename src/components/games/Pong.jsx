import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const WIDTH = 600;
const HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 8;

const Pong = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState({ player: 0, cpu: 0 });
  const [gameOver, setGameOver] = useState(false);

  const gameState = useRef({
    playerY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    cpuY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ball: { x: WIDTH / 2, y: HEIGHT / 2, dx: 4, dy: 4 }
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const root = document.documentElement;
      const mouseY = e.clientY - rect.top - root.scrollTop;
      gameState.current.playerY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2));
    };
    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    return () => canvasRef.current?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let animationId;

    const update = () => {
      if (gameOver) return;

      const state = gameState.current;
      
      // Move ball
      state.ball.x += state.ball.dx;
      state.ball.y += state.ball.dy;

      // Wall bounce
      if (state.ball.y <= 0 || state.ball.y >= HEIGHT) state.ball.dy *= -1;

      // CPU AI
      const cpuCenter = state.cpuY + PADDLE_HEIGHT / 2;
      if (cpuCenter < state.ball.y - 35) state.cpuY += 4;
      else if (cpuCenter > state.ball.y + 35) state.cpuY -= 4;
      state.cpuY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, state.cpuY));

      // Paddle collisions
      if (state.ball.x <= PADDLE_WIDTH + 5) {
        if (state.ball.y > state.playerY && state.ball.y < state.playerY + PADDLE_HEIGHT) {
          state.ball.dx *= -1.1; // Speed up
          state.ball.x = PADDLE_WIDTH + 5;
        } else if (state.ball.x < 0) {
          setScore(s => ({ ...s, cpu: s.cpu + 1 }));
          resetBall();
        }
      }

      if (state.ball.x >= WIDTH - PADDLE_WIDTH - 5) {
        if (state.ball.y > state.cpuY && state.ball.y < state.cpuY + PADDLE_HEIGHT) {
          state.ball.dx *= -1.1;
          state.ball.x = WIDTH - PADDLE_WIDTH - 5;
        } else if (state.ball.x > WIDTH) {
          setScore(s => ({ ...s, player: s.player + 1 }));
          resetBall();
        }
      }

      draw();
      animationId = requestAnimationFrame(update);
    };

    const resetBall = () => {
      gameState.current.ball = { x: WIDTH / 2, y: HEIGHT / 2, dx: 4 * (Math.random() > 0.5 ? 1 : -1), dy: 4 * (Math.random() > 0.5 ? 1 : -1) };
    };

    const draw = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Mid line
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.setLineDash([10, 10]);
      ctx.beginPath(); ctx.moveTo(WIDTH/2, 0); ctx.lineTo(WIDTH/2, HEIGHT); ctx.stroke();

      ctx.fillStyle = 'var(--accent-cyan)';
      ctx.shadowBlur = 10; ctx.shadowColor = 'var(--accent-cyan)';
      ctx.fillRect(5, gameState.current.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
      
      ctx.fillStyle = 'var(--accent-pink)';
      ctx.shadowColor = 'var(--accent-pink)';
      ctx.fillRect(WIDTH - PADDLE_WIDTH - 5, gameState.current.cpuY, PADDLE_WIDTH, PADDLE_HEIGHT);

      ctx.fillStyle = 'white';
      ctx.shadowBlur = 15; ctx.shadowColor = 'white';
      ctx.beginPath();
      ctx.arc(gameState.current.ball.x, gameState.current.ball.y, BALL_SIZE, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-cyan">PONG</h2>
        <button onClick={() => setScore({player:0, cpu:0})} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '2rem', fontFamily: 'Orbitron', marginBottom: '15px' }}>
          <span className="neon-text-cyan">{score.player}</span>
          <span className="neon-text-pink">{score.cpu}</span>
        </div>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} style={{ background: 'black', borderRadius: '8px', cursor: 'none' }} />
        <p style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Déplacez votre souris verticalement pour contrôler la raquette de gauche.</p>
      </div>
    </div>
  );
};

export default Pong;
