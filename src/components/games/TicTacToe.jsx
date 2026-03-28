import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, User, Cpu } from 'lucide-react';

const TicTacToe = ({ onBack }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [isCpuMode, setIsCpuMode] = useState(true);

  const calculateWinner = (squares) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };

  // Algorithme Minimax pour l'IA
  const minimax = (squares, depth, isMaximizing) => {
    const winner = calculateWinner(squares);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (squares.every(s => s !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          let score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          let score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const bestMove = (squares) => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = 'O';
        let score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  useEffect(() => {
    if (isCpuMode && !isXNext && !calculateWinner(board) && board.some(s => s === null)) {
      const timer = setTimeout(() => {
        const move = bestMove(board.slice());
        if (move !== -1) handleClick(move);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, isCpuMode, board]);

  const handleClick = (i) => {
    if (calculateWinner(board) || board[i]) return;
    const newBoard = board.slice();
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(s => s !== null);
  const status = winner ? `Gagnant : ${winner}` : isDraw ? "Nul !" : `Joueur : ${isXNext ? 'X' : 'O'}`;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ArrowLeft /></button>
        <h2 className="neon-text-purple">Morpion AI</h2>
        <button onClick={() => setBoard(Array(9).fill(null))} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><RotateCcw /></button>
      </div>

      <div className="glass-card neon-border" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
          <button onClick={() => setIsCpuMode(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-neon)', background: !isCpuMode ? 'var(--accent-purple)' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><User size={16}/> JvJ</button>
          <button onClick={() => {setIsCpuMode(true); setBoard(Array(9).fill(null));}} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-neon)', background: isCpuMode ? 'var(--accent-purple)' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><Cpu size={16}/> vs CPU</button>
        </div>

        <h3 style={{ marginBottom: '30px', color: winner === 'X' ? 'var(--accent-cyan)' : winner === 'O' ? 'var(--accent-pink)' : 'white' }}>{status}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '15px', justifyContent: 'center' }}>
          {board.map((sq, i) => (
            <button key={i} onClick={() => handleClick(i)} style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-neon)', borderRadius: '12px', fontSize: '2.5rem', fontWeight: 'bold', color: sq === 'X' ? 'var(--accent-cyan)' : 'var(--accent-pink)', cursor: 'pointer', fontFamily: 'Orbitron' }}>{sq}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
