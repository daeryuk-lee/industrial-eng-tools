import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Trophy, Target, Clock, Zap, Map as MapIcon, Award } from 'lucide-react';

const UserStats = ({ lang, onBack }) => {
  const [selectedTrophy, setSelectedTrophy] = useState(null);
  const records = useMemo(() => {
    return JSON.parse(localStorage.getItem('geomaster_leaderboard') || '[]');
  }, []);

  const t = {
    fr: {
      stats: "Mes Statistiques",
      trophies: "Mes Trophées",
      noRecords: "Jouez quelques parties pour voir vos statistiques !",
      bestScore: "Meilleur Score",
      avgAccuracy: "Précision Moyenne",
      totalGames: "Parties Jouées",
      progression: "Progression du Score",
      accuracyByMode: "Précision par Mode",
      locked: "Verrouillé",
      back: "Retour",
      close: "Fermer",
      howTo: "Comment l'obtenir :"
    },
    en: {
      stats: "My Statistics",
      trophies: "My Trophies",
      noRecords: "Play a few games to see your stats!",
      bestScore: "Best Score",
      avgAccuracy: "Average Accuracy",
      totalGames: "Games Played",
      progression: "Score Progression",
      accuracyByMode: "Accuracy by Mode",
      locked: "Locked",
      back: "Back",
      close: "Close",
      howTo: "How to get it:"
    },
    kor: {
      stats: "내 통계",
      trophies: "내 트로피",
      noRecords: "통계를 보려면 몇 판 게임을 해보세요!",
      bestScore: "최고 점수",
      avgAccuracy: "평균 정확도",
      totalGames: "총 게임 수",
      progression: "점수 진행",
      accuracyByMode: "모드별 정확도",
      locked: "잠김",
      back: "뒤로",
      close: "닫기",
      howTo: "획득 방법:"
    }
  }[lang] || {
    stats: "My Statistics",
    trophies: "My Trophies",
    noRecords: "Play a few games to see your stats!",
    bestScore: "Best Score",
    avgAccuracy: "Average Accuracy",
    totalGames: "Games Played",
    progression: "Score Progression",
    accuracyByMode: "Accuracy by Mode",
    locked: "Locked",
    back: "Back",
    close: "Close",
    howTo: "How to get it:"
  };

  // Calcul des stats
  const statsSummary = useMemo(() => {
    if (records.length === 0) return null;
    const totalScore = records.reduce((acc, r) => acc + (r.score / r.total), 0);
    const bestScore = Math.max(...records.map(r => r.score));
    return {
      total: records.length,
      avgAccuracy: Math.round((totalScore / records.length) * 100),
      best: bestScore
    };
  }, [records]);

  // Données pour le graphique de progression (10 dernières parties)
  const chartData = useMemo(() => {
    return records.slice(-10).map((r, i) => ({
      name: `P${i + 1}`,
      accuracy: Math.round((r.score / r.total) * 100)
    }));
  }, [records]);

  // Précision par mode
  const modeData = useMemo(() => {
    const modes = {};
    records.forEach(r => {
      if (!modes[r.mode]) modes[r.mode] = { sum: 0, count: 0 };
      modes[r.mode].sum += (r.score / r.total);
      modes[r.mode].count++;
    });
    return Object.keys(modes).map(m => ({
      name: m,
      accuracy: Math.round((modes[m].sum / modes[m].count) * 100)
    }));
  }, [records]);

  const trophyList = [
    { 
      id: 'first_game', 
      icon: <Zap size={40} />, 
      fr: 'Premier Pas', 
      en: 'First Steps', 
      kor: '첫 걸음',
      desc: { fr: "Jouer votre première partie.", en: "Play your first game.", kor: "첫 번째 게임을 플레이하세요." },
      req: () => records.length >= 1 
    },
    { 
      id: 'top_accuracy', 
      icon: <Target size={40} />, 
      fr: 'Tireur d\'Élite', 
      en: 'Sharpshooter', 
      kor: '스나이퍼',
      desc: { fr: "Obtenir un score parfait (100%) sur une partie.", en: "Get a perfect score (100%) on a game.", kor: "한 게임에서 만점(100%)을 받으세요." },
      req: () => records.some(r => r.score === r.total) 
    },
    { 
      id: 'marathon_king', 
      icon: <MapIcon size={40} />, 
      fr: 'Maître du Monde', 
      en: 'World Master', 
      kor: '세계의 주인',
      desc: { fr: "Terminer un mode Marathon.", en: "Complete a Marathon mode.", kor: "마라톤 모드를 완료하세요." },
      req: () => records.some(r => r.type === 'marathon') 
    },
    { 
      id: 'speed_demon', 
      icon: <Clock size={40} />, 
      fr: 'Éclair', 
      en: 'Speed Demon', 
      kor: '스피드 데몬',
      desc: { fr: "Terminer une partie de 10 questions en moins de 30 secondes.", en: "Complete a 10-question game in less than 30 seconds.", kor: "10문제 게임을 30초 이내에 완료하세요." },
      req: () => records.some(r => r.time < 30 && r.total >= 10) 
    },
    { 
      id: 'veteran', 
      icon: <Award size={40} />, 
      fr: 'Vétéran', 
      en: 'Veteran', 
      kor: '베테랑',
      desc: { fr: "Jouer un total de 20 parties.", en: "Play a total of 20 games.", kor: "총 20판의 게임을 플레이하세요." },
      req: () => records.length >= 20 
    },
    { 
      id: 'perfect_10', 
      icon: <Trophy size={40} />, 
      fr: 'La Décima', 
      en: 'Perfect 10', 
      kor: '라 데시마',
      desc: { fr: "Obtenir au moins 10 points sur une partie de 10 questions.", en: "Get at least 10 points on a 10-question game.", kor: "10문제 게임에서 10점을 받으세요." },
      req: () => records.some(r => r.score >= 10 && r.total >= 10) 
    },
  ];

  if (records.length === 0) {
    return (
      <div className="container animate-fade" style={{ textAlign: 'center', padding: '4rem' }}>
        <button className="btn" onClick={onBack} style={{ marginBottom: '2rem' }}>← {t.back}</button>
        <div className="card" style={{ padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>{t.noRecords}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
      <button className="btn" onClick={onBack} style={{ marginBottom: '2rem', background: 'var(--bg-card)', fontWeight: 'bold' }}>← {t.back}</button>
      
      <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '2rem' }}>📊 {t.stats}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Zap size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0' }}>{statsSummary.total}</h2>
          <p style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>{t.totalGames}</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Target size={32} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0' }}>{statsSummary.avgAccuracy}%</h2>
          <p style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>{t.avgAccuracy}</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Trophy size={32} color="#f59e0b" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0' }}>{statsSummary.best}</h2>
          <p style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>{t.bestScore}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>📈 {t.progression} (%)</h3>
          <div style={{ width: '100%', height: '250px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-light)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="var(--text-light)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow)' }} />
                <Line type="monotone" dataKey="accuracy" stroke="var(--primary)" strokeWidth={4} dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>📊 {t.accuracyByMode} (%)</h3>
          <div style={{ width: '100%', height: '250px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={modeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-light)" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="var(--text-light)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow)' }} />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                  {modeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--secondary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-dark)', marginBottom: '2rem' }}>🏆 {t.trophies}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
        {trophyList.map(trophy => {
          const isUnlocked = trophy.req();
          return (
            <div key={trophy.id} className="card trophy-card" onClick={() => setSelectedTrophy(trophy)} style={{ 
              textAlign: 'center', 
              padding: '1.5rem', 
              opacity: isUnlocked ? 1 : 0.4, 
              filter: isUnlocked ? 'none' : 'grayscale(1)',
              border: isUnlocked ? '3px solid var(--secondary)' : '2px solid var(--border)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <div style={{ marginBottom: '1rem', color: isUnlocked ? 'var(--secondary)' : 'var(--text-light)' }}>
                {trophy.icon}
              </div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '900', margin: '0' }}>{isUnlocked ? trophy[lang] || trophy.en : t.locked}</h4>
            </div>
          );
        })}
      </div>

      {selectedTrophy && (
        <div className="modal-overlay" onClick={() => setSelectedTrophy(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="modal-content card animate-pop" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
             <div style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>{selectedTrophy.icon}</div>
             <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>{selectedTrophy[lang] || selectedTrophy.en}</h2>
             <p style={{ color: 'var(--text-light)', fontWeight: 'bold', marginBottom: '2rem' }}>{t.howTo}</p>
             <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem' }}>{selectedTrophy.desc[lang] || selectedTrophy.desc.en}</p>
             <button className="btn btn-primary" onClick={() => setSelectedTrophy(null)} style={{ width: '100%' }}>{t.close}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStats;
