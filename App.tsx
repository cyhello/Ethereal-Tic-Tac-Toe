
import React, { useState } from 'react';
import TicTacToe from './games/TicTacToe';
import Reversi from './games/Reversi';

type View = 'menu' | 'tictactoe' | 'reversi';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('menu');

  if (currentView === 'tictactoe') {
    return <TicTacToe onBack={() => setCurrentView('menu')} />;
  }

  if (currentView === 'reversi') {
    return <Reversi onBack={() => setCurrentView('menu')} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-extrabold font-heading bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4 drop-shadow-lg">
          Neon Arcade
        </h1>
        <p className="text-gray-400 text-lg">Select a game to begin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Tic Tac Toe Card */}
        <button
          onClick={() => setCurrentView('tictactoe')}
          className="group relative bg-gray-900 border border-white/10 p-8 rounded-3xl hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              Ethereal Tic-Tac-Toe
            </h2>
            <p className="text-gray-400 group-hover:text-gray-300">
              A strategic twist on the classic. Only 3 marks allowed per player—oldest marks fade away.
            </p>
            <div className="mt-6 flex items-center text-cyan-500 font-semibold gap-2 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
              Play Now <span>→</span>
            </div>
          </div>
        </button>

        {/* Reversi Card */}
        <button
          onClick={() => setCurrentView('reversi')}
          className="group relative bg-gray-900 border border-white/10 p-8 rounded-3xl hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
              <span className="text-4xl">⚫</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              Cyber Reversi
            </h2>
            <p className="text-gray-400 group-hover:text-gray-300">
              Also known as Othello. Flank your opponent to dominate the grid in this 8x8 strategy classic.
            </p>
            <div className="mt-6 flex items-center text-purple-500 font-semibold gap-2 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
              Play Now <span>→</span>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-16 text-gray-500 text-sm">
        Offline AI Powered • No Server Required
      </div>
    </div>
  );
};

export default App;
