
import React, { useState, useEffect, useCallback } from 'react';
import { GameMode, Difficulty, GameState, Player } from '../types';
import { getNextState, getSmartMove, MAX_MARKS } from '../logic/gameLogic';
import { getGeminiMove } from '../services/geminiService';

const INITIAL_STATE: GameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  moves: [],
  winningLine: null,
};

interface TicTacToeProps {
  onBack: () => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [gameMode, setGameMode] = useState<GameMode>('PvE');
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [showHints, setShowHints] = useState(true);
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
    if (gameMode === 'PvE' && gameState.currentPlayer === 'O' && !gameState.winner && !isThinking) {
      const triggerAI = async () => {
        setIsThinking(true);
        let moveIndex = -1;

        try {
          if (difficulty === 'Genius (AI)') {
            // Use Gemini for Genius difficulty
            moveIndex = await getGeminiMove(gameState);
          } else {
            // Artificial delay for local AI to feel natural
            await new Promise(resolve => setTimeout(resolve, 800));
            moveIndex = getSmartMove(gameState, difficulty);
          }
        } catch (error) {
          console.error("AI Error:", error);
          // Fallback to local logic if Gemini fails
          moveIndex = getSmartMove(gameState, difficulty);
        }

        if (moveIndex !== -1) {
          handleMove(moveIndex);
        }
        setIsThinking(false);
      };
      triggerAI();
    }
  }, [gameState.currentPlayer, gameState.winner, gameMode, difficulty, handleMove, isThinking, gameState]);

  const resetGame = () => {
    setGameState(INITIAL_STATE);
    setHistory([]);
    setIsThinking(false);
  };

  const undoMove = () => {
    if (history.length > 0 && !isThinking) {
      setGameState(history[history.length - 1]);
      setHistory(prev => prev.slice(0, -1));
    }
  };

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
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto animate-fade-in">
       <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
        ← Back to Menu
      </button>

      <div className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold font-heading bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
          Ethereal Tic-Tac-Toe
        </h1>
        <p className="text-gray-400 text-sm">3 marks limit. Oldest vanishes.</p>
      </div>

      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md mb-8 flex flex-wrap gap-4 justify-center items-center">
        <div className="flex bg-black/40 p-1 rounded-xl">
          <button 
            onClick={() => setGameMode('PvP')}
            className={`px-4 py-2 rounded-lg transition-all ${gameMode === 'PvP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            PvP
          </button>
          <button 
            onClick={() => setGameMode('PvE')}
            className={`px-4 py-2 rounded-lg transition-all ${gameMode === 'PvE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            PvE
          </button>
        </div>

        {gameMode === 'PvE' && (
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Easy">Easy</option>
            <option value="Normal">Normal</option>
            <option value="Genius (AI)">Genius (AI)</option>
          </select>
        )}

        <button
          onClick={() => setShowHints(!showHints)}
          className={`px-4 py-2 rounded-lg border transition-all ${
            showHints 
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
              : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          {showHints ? 'Hints ON' : 'Hints OFF'}
        </button>
      </div>

      <div className="mb-6 h-8 text-xl font-semibold flex items-center gap-3">
        {gameState.winner ? (
          <span className="text-green-400 flex items-center gap-2 animate-bounce">
            🎉 {gameState.winner === 'Draw' ? "It's a Draw!" : `${gameState.winner} Wins!`}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full ${gameState.currentPlayer === 'X' ? 'bg-cyan-400' : 'bg-purple-500'} shadow-[0_0_15px_rgba(34,211,238,0.5)]`}></span>
            <span className="text-gray-200">
              {isThinking ? (
                <span className="flex items-center gap-2">
                  <span className="animate-pulse">AI is plotting...</span>
                </span>
              ) : (
                `${gameState.currentPlayer}'s Turn`
              )}
            </span>
          </div>
        )}
      </div>

      <div className="relative group">
        <div className="grid grid-cols-3 gap-3 bg-white/5 p-3 rounded-3xl border border-white/10 shadow-2xl">
          {gameState.board.map((cell, idx) => {
            const isWinningCell = gameState.winningLine?.includes(idx);
            const isExpiring = (cell === 'X' && expiringX === idx) || (cell === 'O' && expiringO === idx);
            const showExpiringEffect = showHints && isExpiring && !gameState.winner;
            
            return (
              <button
                key={idx}
                disabled={!!cell || !!gameState.winner || isThinking}
                onClick={() => handleMove(idx)}
                className={`
                  w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl font-black transition-all duration-300
                  ${!cell && !gameState.winner && !isThinking ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'}
                  ${isWinningCell ? 'bg-green-500/30 ring-4 ring-green-500 scale-105' : 'bg-black/40'}
                  ${showExpiringEffect ? 'expiring-mark border-2 border-dashed border-red-500/50' : 'border border-white/5'}
                  ${isThinking && !cell ? 'opacity-50' : ''}
                `}
              >
                {cell === 'X' && <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">X</span>}
                {cell === 'O' && <span className="text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">O</span>}
              </button>
            );
          })}
        </div>
        <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl -z-10 rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>
      </div>

      <div className="mt-12 flex gap-4">
        <button 
          onClick={undoMove}
          disabled={history.length === 0 || !!gameState.winner || isThinking}
          className="px-6 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
        >
          Undo
        </button>
        <button 
          onClick={resetGame}
          className="px-8 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold shadow-lg transition-all active:scale-95"
        >
          Reset Match
        </button>
      </div>
    </div>
  );
};

export default TicTacToe;
