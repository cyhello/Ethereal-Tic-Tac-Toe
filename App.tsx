
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Difficulty, GameState, Player, Move } from './types';
import { getNextState, checkWinner, MAX_MARKS } from './logic/gameLogic';
import { getGeminiMove } from './services/geminiService';
import { getMinimaxMove } from './logic/gameLogic';

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  moves: [],
  winningLine: null,
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [gameMode, setGameMode] = useState<GameMode>('PvE');
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [isThinking, setIsThinking] = useState(false);
  const [history, setHistory] = useState<GameState[]>([]);

  const handleMove = useCallback((index: number) => {
    if (gameState.board[index] || gameState.winner || isThinking) return;

    setHistory(prev => [...prev, gameState]);
    const newState = getNextState(gameState, index);
    setGameState(newState);
  }, [gameState, isThinking]);

  // AI Logic
  useEffect(() => {
    if (gameMode === 'PvE' && gameState.currentPlayer === 'O' && !gameState.winner) {
      const triggerAI = async () => {
        setIsThinking(true);
        let moveIndex: number = -1;

        // Artificial delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        if (difficulty === 'Easy') {
          const available = gameState.board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
          moveIndex = available[Math.floor(Math.random() * available.length)];
        } else if (difficulty === 'Normal') {
          moveIndex = getMinimaxMove(gameState, 2);
        } else {
          // Gemini AI
          moveIndex = await getGeminiMove(gameState);
        }

        if (moveIndex !== -1) {
          handleMove(moveIndex);
        }
        setIsThinking(false);
      };

      triggerAI();
    }
  }, [gameState.currentPlayer, gameState.winner, gameMode, difficulty, handleMove]);

  const resetGame = () => {
    setGameState(INITIAL_STATE);
    setHistory([]);
    setIsThinking(false);
  };

  const undoMove = () => {
    if (history.length > 0) {
      setGameState(history[history.length - 1]);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  // Helper to identify marks about to expire
  const getExpiringIndex = (player: Player) => {
    const playerMoves = gameState.moves.filter(m => m.player === player);
    if (playerMoves.length === MAX_MARKS) {
      return playerMoves[0].index;
    }
    return null;
  };

  const expiringX = getExpiringIndex('X');
  const expiringO = getExpiringIndex('O');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold font-heading bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
          Ethereal Tic-Tac-Toe
        </h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Each player can only have 3 marks. Placing a 4th makes your oldest disappear. 
          Think two steps ahead!
        </p>
      </div>

      {/* Settings Panel */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md mb-8 flex flex-wrap gap-4 justify-center items-center">
        <div className="flex bg-black/40 p-1 rounded-xl">
          <button 
            onClick={() => setGameMode('PvP')}
            className={`px-4 py-2 rounded-lg transition-all ${gameMode === 'PvP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Two Players
          </button>
          <button 
            onClick={() => setGameMode('PvE')}
            className={`px-4 py-2 rounded-lg transition-all ${gameMode === 'PvE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Against AI
          </button>
        </div>

        {gameMode === 'PvE' && (
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Easy">Difficulty: Easy</option>
            <option value="Normal">Difficulty: Normal</option>
            <option value="Genius (AI)">Difficulty: Genius (Gemini)</option>
          </select>
        )}
      </div>

      {/* Status Bar */}
      <div className="mb-6 h-8 text-xl font-semibold flex items-center gap-3">
        {gameState.winner ? (
          <span className="text-green-400 flex items-center gap-2 animate-bounce">
            🎉 {gameState.winner === 'Draw' ? "It's a Draw!" : `${gameState.winner} Wins!`}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full ${gameState.currentPlayer === 'X' ? 'bg-cyan-400' : 'bg-purple-500'} shadow-[0_0_15px_rgba(34,211,238,0.5)]`}></span>
            <span className="text-gray-200">
              {isThinking ? "AI is plotting..." : `${gameState.currentPlayer}'s Turn`}
            </span>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="relative group">
        <div className="grid grid-cols-3 gap-3 bg-white/5 p-3 rounded-3xl border border-white/10 shadow-2xl">
          {gameState.board.map((cell, idx) => {
            const isWinningCell = gameState.winningLine?.includes(idx);
            const isExpiring = (cell === 'X' && expiringX === idx) || (cell === 'O' && expiringO === idx);
            
            return (
              <button
                key={idx}
                disabled={!!cell || !!gameState.winner || isThinking}
                onClick={() => handleMove(idx)}
                className={`
                  w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl font-black transition-all duration-300
                  ${!cell && !gameState.winner && !isThinking ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'}
                  ${isWinningCell ? 'bg-green-500/30 ring-4 ring-green-500 scale-105' : 'bg-black/40'}
                  ${isExpiring && !gameState.winner ? 'expiring-mark border-2 border-dashed border-red-500/50' : 'border border-white/5'}
                `}
              >
                {cell === 'X' && (
                  <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">X</span>
                )}
                {cell === 'O' && (
                  <span className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">O</span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Glow behind board */}
        <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl -z-10 rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>
      </div>

      {/* Footer Controls */}
      <div className="mt-12 flex gap-4">
        <button 
          onClick={undoMove}
          disabled={history.length === 0 || !!gameState.winner || isThinking}
          className="px-6 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Undo
        </button>
        <button 
          onClick={resetGame}
          className="px-8 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95"
        >
          Reset Match
        </button>
      </div>

      {/* Rules Indicator */}
      <div className="mt-12 flex flex-col items-center gap-4 text-sm text-gray-500">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-dashed border-red-500/50 rounded expiring-mark"></div>
            <span>Flashing = Mark will vanish on your next move</span>
         </div>
         <p>© 2024 Advanced Logic Games</p>
      </div>
    </div>
  );
};

export default App;
