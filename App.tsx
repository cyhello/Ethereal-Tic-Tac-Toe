
import React, { useState } from 'react';
import TicTacToe from './games/TicTacToe';
import Reversi from './games/Reversi';

// Define the structure of the site navigation
type Page = 'home' | 'games-menu' | 'learning' | 'tictactoe' | 'reversi';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // --- Routing Logic ---

  if (currentPage === 'tictactoe') {
    return <TicTacToe onBack={() => setCurrentPage('games-menu')} />;
  }

  if (currentPage === 'reversi') {
    return <Reversi onBack={() => setCurrentPage('games-menu')} />;
  }

  // --- Helper Components ---

  const BackButton = ({ to }: { to: Page }) => (
    <button 
      onClick={() => setCurrentPage(to)}
      className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group z-50"
    >
      <span className="group-hover:-translate-x-1 transition-transform">←</span>
      Back
    </button>
  );

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen relative p-4 animate-fade-in">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="text-center mb-16 relative z-10">
        <h1 className="text-7xl md:text-8xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-6 drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">
          Terry's Web
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide">
          Welcome to my personal digital playground.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* Games Entry */}
        <button
          onClick={() => setCurrentPage('games-menu')}
          className="group relative h-64 rounded-3xl overflow-hidden border border-white/10 bg-gray-900/50 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🎮</div>
            <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Games</h2>
            <p className="text-gray-400 group-hover:text-gray-200">棋类游戏</p>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Classic Strategy • AI Opponents</p>
          </div>
        </button>

        {/* Learning Entry */}
        <button
          onClick={() => setCurrentPage('learning')}
          className="group relative h-64 rounded-3xl overflow-hidden border border-white/10 bg-gray-900/50 hover:border-pink-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(236,72,153,0.3)] backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">📚</div>
            <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">Learning</h2>
            <p className="text-gray-400 group-hover:text-gray-200">学习笔记</p>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Code • Design • Innovation</p>
          </div>
        </button>
      </div>

      <footer className="absolute bottom-8 text-gray-600 text-sm">
        © {new Date().getFullYear()} Terry. All rights reserved.
      </footer>
    </div>
  );

  const renderGamesMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
      <BackButton to="home" />
      
      <div className="text-center mb-12">
        <h2 className="text-5xl font-heading font-bold text-white mb-4">Game Center</h2>
        <div className="h-1 w-24 bg-cyan-500 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Tic Tac Toe Card */}
        <button
          onClick={() => setCurrentPage('tictactoe')}
          className="group relative bg-gray-900/80 border border-white/10 p-8 rounded-3xl hover:border-cyan-500/50 transition-all duration-500 text-left hover:-translate-y-2"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 border border-white/5">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              Disappearing Tic-Tac-Toe
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Also known as "Infinite Tic-Tac-Toe". Players only have 3 marks. Placing a 4th causes the oldest to vanish!
            </p>
            <div className="mt-6 flex items-center text-cyan-500 font-semibold gap-2 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
              Play Now <span>→</span>
            </div>
          </div>
        </button>

        {/* Reversi Card */}
        <button
          onClick={() => setCurrentPage('reversi')}
          className="group relative bg-gray-900/80 border border-white/10 p-8 rounded-3xl hover:border-purple-500/50 transition-all duration-500 text-left hover:-translate-y-2"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300 border border-white/5">
              <span className="text-3xl">⚫</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              Cyber Reversi
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              The classic Othello strategy game reimagined. Flank your opponent's discs to flip them to your color.
            </p>
            <div className="mt-6 flex items-center text-purple-500 font-semibold gap-2 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
              Play Now <span>→</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderLearning = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in relative">
      <BackButton to="home" />
      
      <div className="text-center mb-12">
        <h2 className="text-5xl font-heading font-bold text-white mb-4">Knowledge Base</h2>
        <p className="text-pink-400 font-mono">/var/www/terry/learning</p>
      </div>

      <div className="max-w-3xl w-full bg-gray-900/60 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <span className="text-4xl">🚧</span>
          <div>
            <h3 className="text-2xl font-bold text-white">Work in Progress</h3>
            <p className="text-gray-400">Content is being curated.</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">Planned Topics:</p>
          <ul className="space-y-3">
            {['Artificial Intelligence Integration', 'Modern React Patterns', 'UI/UX Design Systems'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors p-3 rounded-lg hover:bg-white/5 cursor-default">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8 p-4 bg-pink-900/20 border border-pink-500/20 rounded-xl text-pink-300 text-sm">
          Stay tuned for updates! This section will host my personal notes and tech demos.
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white font-sans selection:bg-pink-500 selection:text-white">
      {currentPage === 'home' && renderHome()}
      {currentPage === 'games-menu' && renderGamesMenu()}
      {currentPage === 'learning' && renderLearning()}
    </div>
  );
};

export default App;
