import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Target, Shield, Zap } from 'lucide-react';

const WORLD_SIZE = 2000;
const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 500;
const PLAYER_SIZE = 25;
const BOT_COUNT = 10;

const WEAPONS = {
  pistol: { name: 'Pistolet', damage: 15, speed: 12, fireRate: 400, spread: 0.05, ammo: 15, color: '#94a3b8' },
  ak47: { name: 'AK-47', damage: 22, speed: 15, fireRate: 120, spread: 0.1, ammo: 30, color: '#b45309' },
  shotgun: { name: 'Pompe', damage: 12, speed: 10, fireRate: 800, spread: 0.4, ammo: 5, pellets: 5, color: '#475569' }
};

const SurvivUltra = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [kills, setKills] = useState(0);
  const [health, setHealth] = useState(100);
  const [weapon, setWeapon] = useState(WEAPONS.pistol);

  const state = useRef({
    player: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, angle: 0, vx: 0, vy: 0, health: 100 },
    bots: [],
    bullets: [],
    crates: [],
    items: [],
    particles: [],
    zone: { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, radius: WORLD_SIZE / 1.2, targetRadius: WORLD_SIZE / 1.2 },
    keys: {},
    mouse: { x: 0, y: 0 },
    lastShot: 0,
    camera: { x: 0, y: 0 }
  });

  const initGame = () => {
    const s = state.current;
    s.player = { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, angle: 0, vx: 0, vy: 0, health: 100 };
    s.bots = Array.from({ length: BOT_COUNT }).map(() => ({
      id: Math.random(),
      x: Math.random() * WORLD_SIZE,
      y: Math.random() * WORLD_SIZE,
      health: 100,
      weapon: Object.values(WEAPONS)[Math.floor(Math.random() * 3)],
      angle: Math.random() * Math.PI * 2,
      lastShot: 0
    }));
    s.crates = Array.from({ length: 25 }).map(() => ({
      x: Math.random() * WORLD_SIZE,
      y: Math.random() * WORLD_SIZE,
      w: 50, h: 50, health: 50
    }));
    s.items = [];
    s.bullets = [];
    s.particles = [];
    s.zone = { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, radius: WORLD_SIZE / 1.2, targetRadius: WORLD_SIZE / 1.5 };
    setHealth(100);
    setKills(0);
    setGameOver(false);
    setWin(false);
  };

  useEffect(() => {
    initGame();
    const handleKey = (e) => state.current.keys[e.key.toLowerCase()] = e.type === 'keydown';
    const handleMouse = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      state.current.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let animationId;

    const update = () => {
      if (gameOver || win) return;
      const s = state.current;
      const p = s.player;

      // Player Movement
      const speed = 5;
      let dx = 0, dy = 0;
      if (s.keys['z'] || s.keys['w']) dy -= speed;
      if (s.keys['s']) dy += speed;
      if (s.keys['q'] || s.keys['a']) dx -= speed;
      if (s.keys['d']) dx += speed;
      p.x = Math.max(PLAYER_SIZE, Math.min(WORLD_SIZE - PLAYER_SIZE, p.x + dx));
      p.y = Math.max(PLAYER_SIZE, Math.min(WORLD_SIZE - PLAYER_SIZE, p.y + dy));

      // Camera Follow
      s.camera.x = p.x - VIEW_WIDTH / 2;
      s.camera.y = p.y - VIEW_HEIGHT / 2;

      // Player Rotation
      const centerX = VIEW_WIDTH / 2;
      const centerY = VIEW_HEIGHT / 2;
      p.angle = Math.atan2(s.mouse.y - centerY, s.mouse.x - centerX);

      // Shooting
      if (s.keys[' ']) {
        const now = Date.now();
        if (now - s.lastShot > weapon.fireRate) {
          fireBullet(p.x, p.y, p.angle, weapon, true);
          s.lastShot = now;
        }
      }

      // Update Bullets
      s.bullets.forEach((b, bi) => {
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;
        b.dist += b.speed;
        if (b.dist > 1000) s.bullets.splice(bi, 1);

        // Bullet collisions with crates
        s.crates.forEach((c, ci) => {
          if (b.x > c.x && b.x < c.x + c.w && b.y > c.y && b.y < c.y + c.h) {
            c.health -= b.damage;
            s.bullets.splice(bi, 1);
            if (c.health <= 0) {
              spawnLoot(c.x + c.w/2, c.y + c.h/2);
              s.crates.splice(ci, 1);
            }
          }
        });

        // Bullet collisions with bots
        s.bots.forEach((bot, botIdx) => {
          if (b.isPlayer && Math.hypot(b.x - bot.x, b.y - bot.y) < PLAYER_SIZE) {
            bot.health -= b.damage;
            s.bullets.splice(bi, 1);
            if (bot.health <= 0) {
              s.bots.splice(botIdx, 1);
              setKills(k => k + 1);
            }
          }
        });

        // Bullet collision with player
        if (!b.isPlayer && Math.hypot(b.x - p.x, b.y - p.y) < PLAYER_SIZE) {
          p.health -= b.damage;
          setHealth(p.health);
          s.bullets.splice(bi, 1);
          if (p.health <= 0) setGameOver(true);
        }
      });

      // Update Bots
      s.bots.forEach(bot => {
        const distToPlayer = Math.hypot(bot.x - p.x, bot.y - p.y);
        if (distToPlayer < 400) {
          bot.angle = Math.atan2(p.y - bot.y, p.x - bot.x);
          const now = Date.now();
          if (now - bot.lastShot > bot.weapon.fireRate) {
            fireBullet(bot.x, bot.y, bot.angle, bot.weapon, false);
            bot.lastShot = now;
          }
        } else {
          bot.x += Math.cos(bot.angle) * 2;
          bot.y += Math.sin(bot.angle) * 2;
          if (Math.random() > 0.98) bot.angle = Math.random() * Math.PI * 2;
        }
        bot.x = Math.max(PLAYER_SIZE, Math.min(WORLD_SIZE - PLAYER_SIZE, bot.x));
        bot.y = Math.max(PLAYER_SIZE, Math.min(WORLD_SIZE - PLAYER_SIZE, bot.y));
      });

      // Zone Logic
      if (s.zone.radius > s.zone.targetRadius) s.zone.radius -= 0.2;
      else {
        s.zone.targetRadius = Math.max(100, s.zone.radius - 200);
      }
      if (Math.hypot(p.x - s.zone.x, p.y - s.zone.y) > s.zone.radius) {
        p.health -= 0.1;
        setHealth(p.health);
        if (p.health <= 0) setGameOver(true);
      }

      // Loot pickup
      s.items.forEach((it, ii) => {
        if (Math.hypot(p.x - it.x, p.y - it.y) < PLAYER_SIZE + 10) {
          if (it.type === 'weapon') setWeapon(it.data);
          else if (it.type === 'medkit') { p.health = Math.min(100, p.health + 30); setHealth(p.health); }
          s.items.splice(ii, 1);
        }
      });

      if (s.bots.length === 0) setWin(true);

      draw();
      animationId = requestAnimationFrame(update);
    };

    const fireBullet = (x, y, angle, wp, isPlayer) => {
      const s = state.current;
      if (wp.pellets) {
        for(let i=0; i<wp.pellets; i++) {
          s.bullets.push({ x, y, angle: angle + (Math.random()-0.5)*wp.spread, speed: wp.speed, damage: wp.damage, dist: 0, isPlayer });
        }
      } else {
        s.bullets.push({ x, y, angle: angle + (Math.random()-0.5)*wp.spread, speed: wp.speed, damage: wp.damage, dist: 0, isPlayer });
      }
    };

    const spawnLoot = (x, y) => {
      const rand = Math.random();
      let item;
      if (rand < 0.3) item = { type: 'weapon', data: WEAPONS.ak47, color: WEAPONS.ak47.color };
      else if (rand < 0.5) item = { type: 'weapon', data: WEAPONS.shotgun, color: WEAPONS.shotgun.color };
      else item = { type: 'medkit', color: '#ef4444' };
      state.current.items.push({ x, y, ...item });
    };

    const draw = () => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

      ctx.save();
      ctx.translate(-s.camera.x, -s.camera.y);

      // Grass Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for(let i=0; i<=WORLD_SIZE; i+=100) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,WORLD_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(WORLD_SIZE,i); ctx.stroke();
      }

      // Draw Zone
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(s.zone.x, s.zone.y, s.zone.radius, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.fill();

      // Draw Crates
      s.crates.forEach(c => {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = '#451a03';
        ctx.strokeRect(c.x+5, c.y+5, c.w-10, c.h-10);
      });

      // Draw Items
      s.items.forEach(it => {
        ctx.fillStyle = it.color;
        ctx.beginPath(); ctx.arc(it.x, it.y, 12, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 10; ctx.shadowColor = it.color;
      });
      ctx.shadowBlur = 0;

      // Draw Bullets
      ctx.fillStyle = '#fbbf24';
      s.bullets.forEach(b => ctx.fillRect(b.x-2, b.y-2, 4, 4));

      // Draw Bots
      s.bots.forEach(bot => drawEntity(ctx, bot, bot.weapon.color));

      // Draw Player
      drawEntity(ctx, p, '#38bdf8');

      ctx.restore();
    };

    const drawEntity = (ctx, ent, color) => {
      ctx.save();
      ctx.translate(ent.x, ent.y);
      ctx.rotate(ent.angle);
      
      // Hands holding weapon
      ctx.fillStyle = '#fde047';
      ctx.beginPath(); ctx.arc(20, 15, 8, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(20, -15, 8, 0, Math.PI*2); ctx.fill();

      // Weapon
      ctx.fillStyle = '#475569';
      ctx.fillRect(10, -5, 30, 10);

      // Body
      ctx.fillStyle = color;
      ctx.shadowBlur = 15; ctx.shadowColor = color;
      ctx.beginPath(); ctx.arc(0, 0, PLAYER_SIZE, 0, Math.PI*2); ctx.fill();
      
      ctx.restore();
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, win, weapon]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-cyan">Surviv Ultra</h2>
        <button onClick={initGame} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border arcade-monitor" style={{ padding: '10px', position: 'relative' }}>
        {/* HUD */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ width: '200px' }}>
            <div style={{ height: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${health}%`, height: '100%', background: '#22c55e', transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '5px', textAlign: 'left', fontFamily: 'Orbitron' }}>HEALTH: {Math.ceil(health)}%</div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'Orbitron' }}>
            <div style={{ color: '#38bdf8', fontSize: '1.2rem' }}>KILLS: {kills}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>WEAPON: {weapon.name}</div>
          </div>
        </div>

        <canvas ref={canvasRef} width={VIEW_WIDTH} height={VIEW_HEIGHT} style={{ background: '#1e293b', borderRadius: '8px', cursor: 'crosshair' }} />
        
        {(gameOver || win) && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', padding: '40px', borderRadius: '20px', border: '2px solid var(--accent-purple)', zIndex: 30 }}>
            <h1 style={{ color: win ? '#22c55e' : '#ef4444', fontSize: '3rem', margin: '0 0 20px 0' }}>{win ? 'VICTOIRE !' : 'ÉLIMINÉ'}</h1>
            <p style={{ fontSize: '1.2rem', color: 'white' }}>Vous avez éliminé {kills} bots.</p>
            <button onClick={initGame} className="btn-primary" style={{ marginTop: '30px' }}>Rejouer</button>
          </div>
        )}
      </div>
      <p style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ZQSD : Déplacer • Souris : Viser • ESPACE : Tirer • Cassez les caisses pour du loot !</p>
    </div>
  );
};

export default SurvivUltra;
