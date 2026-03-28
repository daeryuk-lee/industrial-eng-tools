import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import StatCard from './StatCard';
import EntryForm from './EntryForm';

const initialData = [
  { time: '08:00', prod: 450, target: 500 },
  { time: '09:00', prod: 520, target: 500 },
  { time: '10:00', prod: 480, target: 500 },
  { time: '11:00', prod: 610, target: 500 },
];

const radarData = [
  { subject: 'Dispo', A: 85, fullMark: 100 },
  { subject: 'Perf', A: 92, fullMark: 100 },
  { subject: 'Qualité', A: 98, fullMark: 100 },
  { subject: 'Sécurité', A: 100, fullMark: 100 },
  { subject: 'Ordre', A: 75, fullMark: 100 },
];

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [chartData, setChartData] = useState(initialData);
  const [stats, setStats] = useState({
    trs: 84.2,
    perf: 92.1,
    quality: 98.5,
    downtime: 12
  });

  const handleAddEntry = (newEntry) => {
    setEntries([newEntry, ...entries].slice(0, 5));
    
    // Simuler mise à jour graphique
    const lastTime = chartData[chartData.length - 1].time;
    const nextHour = (parseInt(lastTime.split(':')[0]) + 1).toString().padStart(2, '0') + ':00';
    
    setChartData([...chartData, { 
      time: nextHour, 
      prod: parseInt(newEntry.quantity), 
      target: 500 
    }]);

    // Recalcul partiel des stats (simulation)
    setStats(prev => ({
      ...prev,
      trs: Math.min(99, prev.trs + 0.2),
      downtime: prev.downtime + parseInt(newEntry.downtime || 0)
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Tableau de bord interactif</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Saisie en temps réel par les opérateurs</p>
        </div>
        <div style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent-green)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
          • SYSTÈME ACTIF
        </div>
      </header>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <StatCard title="TRS GLOBAL" value={stats.trs.toFixed(1)} unit="%" trend={2.4} color="var(--accent-blue)" />
        <StatCard title="PERFORMANCE" value={stats.perf.toFixed(1)} unit="%" trend={-1.2} color="var(--accent-green)" />
        <StatCard title="QUALITÉ" value={stats.quality.toFixed(1)} unit="%" trend={0.5} color="var(--accent-blue)" />
        <StatCard title="ARRÊTS CUMULÉS" value={stats.downtime} unit="min" trend={-15.0} color="var(--accent-red)" />
      </div>

      <EntryForm onAddEntry={handleAddEntry} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', height: '400px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Evolution Production vs Objectif</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-main)', border: '1px solid var(--border-glass)' }} />
              <Area type="monotone" dataKey="prod" stroke="var(--accent-blue)" fill="url(#colorProd)" strokeWidth={3} />
              <Area type="monotone" dataKey="target" stroke="var(--text-secondary)" fill="transparent" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Analyse Radar</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--border-glass)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Radar name="Usine" dataKey="A" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Journal des saisies récentes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
              Aucune saisie pour le moment.
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '4px solid var(--accent-blue)' }}>
                <div>
                  <span style={{ fontWeight: '600' }}>{entry.quantity} unités</span>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '12px', fontSize: '0.85rem' }}>{entry.timestamp}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--accent-red)' }}>{entry.scraps || 0} rebuts</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{entry.downtime || 0} min d'arrêt</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
