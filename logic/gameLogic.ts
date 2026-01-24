
import { GameState, Move, Player } from "../types";

export const MAX_MARKS = 3;

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const checkWinner = (board: (Player | null)[]) => {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
};

export const getNextState = (state: GameState, index: number): GameState => {
  if (state.board[index] || state.winner) return state;

  const newMoves = [...state.moves, { player: state.currentPlayer, index, timestamp: Date.now() }];
  const playerMoves = newMoves.filter(m => m.player === state.currentPlayer);
  
  const finalMoves = [...newMoves];
  if (playerMoves.length > MAX_MARKS) {
    // Find the oldest move for this player and remove it
    const oldestIndexInHistory = finalMoves.findIndex(m => m.player === state.currentPlayer);
    if (oldestIndexInHistory !== -1) {
      finalMoves.splice(oldestIndexInHistory, 1);
    }
  }

  // Construct new board from remaining moves
  const newBoard: (Player | null)[] = Array(9).fill(null);
  finalMoves.forEach(m => {
    newBoard[m.index] = m.player;
  });

  const { winner, line } = checkWinner(newBoard);
  
  return {
    board: newBoard,
    // Explicitly type return values to satisfy GameState
    currentPlayer: (state.currentPlayer === 'X' ? 'O' : 'X') as Player,
    winner: winner,
    winningLine: line,
    moves: finalMoves,
  };
};

export const getMinimaxMove = (state: GameState, depth: number): number => {
  // Simple Minimax for "Normal" mode - focusing on blocking or winning
  const available = state.board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
  
  // 1. Can I win this turn?
  for (const idx of available) {
    const next = getNextState(state, idx);
    if (next.winner === state.currentPlayer) return idx;
  }

  // 2. Can I block opponent from winning?
  // Explicitly type opponent as Player to prevent widening to string
  const opponent: Player = state.currentPlayer === 'X' ? 'O' : 'X';
  // Explicitly type the hypothetical state to satisfy GameState requirements
  const hypotheticalOpponentState: GameState = { 
    ...state, 
    currentPlayer: opponent 
  };
  
  for (const idx of available) {
    // Fix: line 68 now receives a valid GameState
    const next = getNextState(hypotheticalOpponentState, idx);
    if (next.winner === opponent) return idx;
  }

  // 3. Center if available
  if (available.includes(4)) return 4;

  // 4. Random corner
  const corners = [0, 2, 6, 8].filter(c => available.includes(c));
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

  // 5. Any random
  return available[Math.floor(Math.random() * available.length)];
};
