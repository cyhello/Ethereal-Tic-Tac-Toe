
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
        // Wait a bit for visuals
        await new Promise(resolve => setTimeout(resolve, 600));

        const move = getReversiBestMove(gameState, difficulty);
        if (move !== -1) {
          const newState = getReversiNextState(gameState, move);
          setGameState(newState);
        } else {
          // AI has no moves (pass)
          const newState = getReversiNextState(gameState, -1); // Index doesn't matter for pass logic if validMoves is empty inside logic
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
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto animate-fade-in">
      <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
        ← Back to Menu
      </button>

      <div className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold font-heading bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
          Cyber Reversi
        </h1>
        <p className="text-gray-400 text-sm">Flank opponents to flip their color.</p>
      </div>

      {/* Controls */}
      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md mb-6 flex flex-wrap gap-3 justify-center items-center">
        <div className="flex bg-black/40 p-1 rounded-xl">
          <button 
            onClick={() => setGameMode('PvP')}
            className={`px-4 py-1.5 rounded-lg transition-all ${gameMode === 'PvP' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            PvP
          </button>
          <button 
            onClick={() => setGameMode('PvE')}
            className={`px-4 py-1.5 rounded-lg transition-all ${gameMode === 'PvE' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            PvE
          </button>
        </div>

        {gameMode === 'PvE' && (
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Easy">Easy</option>
            <option value="Normal">Normal</option>
            <option value="Genius (AI)">Genius</option>
          </select>
        )}

        <button
          onClick={() => setShowMoves(!showMoves)}
          className={`px-3 py-1.5 rounded-lg border transition-all text-sm ${
            showMoves ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-black/40 border-white/10 text-gray-400'
          }`}
        >
          Dots
        </button>

        <button
          onClick={requestHint}
          disabled={isThinking || !!gameState.winner}
          className="px-3 py-1.5 rounded-lg border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 transition-all text-sm"
        >
          💡 Hint
        </button>
      </div>

      {/* Score Board */}
      <div className="flex gap-8 mb-6 text-xl font-bold font-heading">
        <div className={`flex items-center gap-2 ${gameState.currentPlayer === 'Black' ? 'scale-110 text-purple-400' : 'text-gray-500'}`}>
          <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
          Black: {blackCount}
        </div>
        <div className={`flex items-center gap-2 ${gameState.currentPlayer === 'White' ? 'scale-110 text-cyan-400' : 'text-gray-500'}`}>
          <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
          White: {whiteCount}
        </div>
      </div>

      {gameState.winner && (
        <div className="mb-4 text-2xl font-bold text-green-400 animate-bounce">
          {gameState.winner === 'Draw' ? 'Draw!' : `${gameState.winner} Wins!`}
        </div>
      )}

      {/* Board */}
      <div className="relative p-2 bg-gray-900 rounded-lg shadow-2xl border border-gray-700">
        <div className="grid grid-cols-8 gap-1 bg-gray-800 p-1">
          {gameState.board.map((cell, idx) => {
            const isValid = validMoves.includes(idx);
            const isHint = hintIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => handleMove(idx)}
                disabled={!isValid || !!gameState.winner || isThinking}
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center relative
                  ${(idx + Math.floor(idx / 8)) % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}
                  hover:bg-gray-700 transition-colors
                `}
              >
                {/* Grid Lines/Background logic handled by grid gap mostly */}
                <div className="absolute inset-0 border border-white/5 pointer-events-none"></div>
                
                {/* Pieces */}
                {cell === 'Black' && (
                  <div className="w-[80%] h-[80%] rounded-full bg-purple-600 shadow-inner shadow-purple-900 ring-2 ring-purple-900/50 transition-all duration-300 transform scale-100"></div>
                )}
                {cell === 'White' && (
                  <div className="w-[80%] h-[80%] rounded-full bg-cyan-300 shadow-inner shadow-white ring-2 ring-cyan-500/50 transition-all duration-300 transform scale-100"></div>
                )}

                {/* Valid Move Dot */}
                {!cell && isValid && showMoves && !isThinking && (
                  <div className={`w-3 h-3 rounded-full ${isHint ? 'bg-yellow-400 animate-pulse scale-125' : 'bg-white/20 hover:bg-white/40'} transition-all`}></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8">
        <button 
          onClick={resetGame}
          className="px-6 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition-all"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
};

export default Reversi;
