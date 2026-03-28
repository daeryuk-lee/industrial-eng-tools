import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from './StatCard';

const data = [
  { time: '08:00', prod: 450, target: 500 },
  { time: '09:00', prod: 520, target: 500 },
  { time: '10:00', prod: 480, target: 500 },
  { time: '11:00', prod: 610, target: 500 },
  { time: '12:00', prod: 590, target: 500 },
  { time: '13:00', prod: 680, target: 500 },
  { time: '14:00', prod: 720, target: 500 },
];

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Tableau de bord de production</h1>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Equipe A • Ligne #4 • 28 Mars 2026</div>
      </header>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <StatCard title="TRS (OEE)" value="84.2" unit="%" trend={2.4} color="var(--accent-blue)" />
        <StatCard title="Performance" value="92.1" unit="%" trend={-1.2} color="var(--accent-green)" />
        <StatCard title="Taux de Qualité" value="98.5" unit="%" trend={0.5} color="var(--accent-blue)" />
        <StatCard title="Arrêts Machine" value="12" unit="min" trend={-15.0} color="var(--accent-red)" />
      </div>

      <div className="glass-panel" style={{ padding: '32px', height: '400px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '24px', fontWeight: '600' }}>Flux de production (u/h)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ background: 'var(--bg-main)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--accent-blue)' }}
            />
            <Area type="monotone" dataKey="prod" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorProd)" strokeWidth={3} />
            <Area type="monotone" dataKey="target" stroke="var(--text-secondary)" fill="transparent" strokeDasharray="5 5" strokeWidth={1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
