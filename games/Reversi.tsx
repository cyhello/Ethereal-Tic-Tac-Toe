
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Difficulty } from '../types';
import { 
  ReversiState, 
  getInitialReversiState, 
  getReversiNextState, 
  getValidMoves, 
  getReversiBestMove 
} from '../logic/reversiLogic';

interface ReversiProps {
  onBack: () => void;
}

const Reversi: React.FC<ReversiProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<ReversiState>(getInitialReversiState());
  const [gameMode, setGameMode] = useState<GameMode>('PvE');
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [showMoves, setShowMoves] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [hintIndex, setHintIndex] = useState<number | null>(null);

  const validMoves = getValidMoves(gameState.board, gameState.currentPlayer);

  const handleMove = useCallback((index: number) => {
    if (gameState.winner || isThinking) return;
    if (!validMoves.includes(index)) return;

    setHintIndex(null);
    const newState = getReversiNextState(gameState, index);
    setGameState(newState);
  }, [gameState, isThinking, validMoves]);

  // AI Turn
  useEffect(() => {
    if (gameMode === 'PvE' && gameState.currentPlayer === 'White' && !gameState.winner) {
      const triggerAI = async () => {
        setIsThinking(true);
        // Add a slight delay to let player see their move and animations
        await new Promise(resolve => setTimeout(resolve, 1000));

        const move = getReversiBestMove(gameState, difficulty);
        if (move !== -1) {
          const newState = getReversiNextState(gameState, move);
          setGameState(newState);
        } else {
          const newState = getReversiNextState(gameState, -1);
          setGameState(newState);
        }
        setIsThinking(false);
      };
      triggerAI();
    }
  }, [gameState, gameMode, difficulty]);

  const requestHint = () => {
    if (isThinking || gameState.winner) return;
    const bestMove = getReversiBestMove(gameState, 'Genius (AI)');
    setHintIndex(bestMove);
  };

  const resetGame = () => {
    setGameState(getInitialReversiState());
    setHintIndex(null);
    setIsThinking(false);
  };

  const blackCount = gameState.board.filter(c => c === 'Black').length;
  const whiteCount = gameState.board.filter(c => c === 'White').length;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto animate-fade-in pt-20 pb-8 relative z-10">
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group z-50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 bg-black/20"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        Back
      </button>

      <div className="mb-6 text-center">
        <h1 className="text-5xl font-extrabold font-heading bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          Cyber Reversi
        </h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase font-semibold">Vibrant 3D Neon Strategy</p>
      </div>

      {/* Controls */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-xl mb-8 flex flex-wrap gap-4 justify-center items-center shadow-2xl">
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setGameMode('PvP')}
            className={`px-5 py-2 rounded-xl font-bold transition-all ${gameMode === 'PvP' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-gray-400 hover:text-white'}`}
          >
            PvP
          </button>
          <button 
            onClick={() => setGameMode('PvE')}
            className={`px-5 py-2 rounded-xl font-bold transition-all ${gameMode === 'PvE' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-gray-400 hover:text-white'}`}
          >
            PvE
          </button>
        </div>

        {gameMode === 'PvE' && (
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-black/60 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
          >
            <option value="Easy">Easy</option>
            <option value="Normal">Normal</option>
            <option value="Genius (AI)">Genius</option>
          </select>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setShowMoves(!showMoves)}
            className={`px-4 py-2.5 rounded-xl border transition-all text-sm font-bold flex items-center gap-2 ${
              showMoves ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-black/40 border-white/10 text-gray-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${showMoves ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-600'}`}></div>
            Hints
          </button>

          <button
            onClick={requestHint}
            disabled={isThinking || !!gameState.winner}
            className="px-4 py-2.5 rounded-xl border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-20"
          >
            <span>💡</span> Best Move
          </button>
        </div>
      </div>

      {/* Score Board */}
      <div className="flex gap-12 mb-8 bg-black/30 px-10 py-4 rounded-3xl border border-white/5 backdrop-blur-sm">
        <div className={`flex flex-col items-center transition-all duration-500 ${gameState.currentPlayer === 'Black' ? 'scale-110 opacity-100' : 'opacity-40'}`}>
          <div className="text-xs uppercase tracking-tighter text-fuchsia-400 mb-1 font-bold">Player 1</div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.8)] border-2 border-fuchsia-300/50"></div>
             <span className="text-3xl font-black text-white">{blackCount}</span>
          </div>
        </div>
        
        <div className="w-px bg-white/10 self-stretch"></div>

        <div className={`flex flex-col items-center transition-all duration-500 ${gameState.currentPlayer === 'White' ? 'scale-110 opacity-100' : 'opacity-40'}`}>
          <div className="text-xs uppercase tracking-tighter text-cyan-400 mb-1 font-bold">Player 2</div>
          <div className="flex items-center gap-3">
             <span className="text-3xl font-black text-white">{whiteCount}</span>
             <div className="w-8 h-8 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.8)] border-2 border-cyan-100/50"></div>
          </div>
        </div>
      </div>

      {gameState.winner && (
        <div className="mb-6 text-3xl font-black text-green-400 animate-bounce tracking-tight drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
          {gameState.winner === 'Draw' ? '🤝 SPECTACULAR DRAW!' : `🏆 ${gameState.winner.toUpperCase()} DOMINATES!`}
        </div>
      )}

      {/* Board */}
      <div className="relative p-4 bg-gray-900/80 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md">
        {/* Adjusted Grid background to emerald-500/20 to make the gaps (lines) much more visible and glowing */}
        <div className="grid grid-cols-8 gap-0.5 sm:gap-1 bg-emerald-500/40 p-1.5 rounded-2xl shadow-inner border border-emerald-500/30 overflow-hidden">
          {gameState.board.map((cell, idx) => {
            const isValid = validMoves.includes(idx);
            const isHint = hintIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => handleMove(idx)}
                disabled={!isValid || !!gameState.winner || isThinking}
                className={`
                  w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center relative rounded-sm
                  reversi-cell transition-all duration-200
                  ${(Math.floor(idx / 8) + idx % 8) % 2 === 0 ? 'bg-[#0a1a15]' : 'bg-[#081612]'}
                  ${isValid && !isThinking ? 'hover:bg-emerald-500/20 cursor-pointer' : 'cursor-default'}
                `}
              >
                {/* 3D Disc */}
                {cell && (
                  <div className={`reversi-disc-container ${cell === 'White' ? 'is-flipping-white' : 'is-flipping-black'}`}>
                    <div className="reversi-disc-face reversi-disc-black"></div>
                    <div className="reversi-disc-face reversi-disc-white"></div>
                  </div>
                )}

                {/* Valid Move Indicator */}
                {!cell && isValid && showMoves && !isThinking && (
                  <div className={`
                    w-3 h-3 rounded-full transition-all duration-300
                    ${isHint ? 'bg-yellow-400 scale-150 shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-pulse' : 'bg-emerald-500/30 group-hover:bg-emerald-500/60'}
                  `}></div>
                )}
                
                {/* Visual cell border accent - made more visible */}
                <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-sm"></div>
              </button>
            );
          })}
        </div>
        
        {/* Decorative background glow */}
        <div className="absolute -inset-10 bg-emerald-500/5 blur-[100px] -z-10 rounded-full opacity-50"></div>
      </div>
      
      <div className="mt-10 flex gap-4">
        <button 
          onClick={resetGame}
          className="px-8 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all border border-white/5 active:scale-95 shadow-lg"
        >
          Restart Match
        </button>
      </div>

      <div className="mt-8 text-gray-600 text-[10px] tracking-widest uppercase font-bold">
        Cybernetic Tactics • Offline Mode
      </div>
    </div>
  );
};

export default Reversi;
