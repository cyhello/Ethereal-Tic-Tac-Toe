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
    currentPlayer: (state.currentPlayer === 'X' ? 'O' : 'X') as Player,
    winner: winner,
    winningLine: line,
    moves: finalMoves,
  };
};

// Evaluation function for Minimax
const evaluateBoard = (state: GameState, aiPlayer: Player): number => {
  if (state.winner === aiPlayer) return 1000;
  if (state.winner && state.winner !== 'Draw') return -1000;
  if (state.winner === 'Draw') return 0;
  return 0;
};

// Minimax with Alpha-Beta Pruning
const minimax = (
  state: GameState,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player
): number => {
  if (depth === 0 || state.winner) {
    return evaluateBoard(state, aiPlayer);
  }

  const available = state.board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
  
  if (available.length === 0) return 0; // Should not happen in disappearing TTT often

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const idx of available) {
      const nextState = getNextState(state, idx);
      const ev = minimax(nextState, depth - 1, false, alpha, beta, aiPlayer);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const idx of available) {
      const nextState = getNextState(state, idx);
      const ev = minimax(nextState, depth - 1, true, alpha, beta, aiPlayer);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const getSmartMove = (state: GameState, difficulty: 'Easy' | 'Normal' | 'Genius (AI)'): number => {
  const available = state.board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
  if (available.length === 0) return -1;

  // 1. Easy: Random
  if (difficulty === 'Easy') {
    return available[Math.floor(Math.random() * available.length)];
  }

  // 2. Normal: Win immediate or Block immediate, else random
  if (difficulty === 'Normal') {
    // Check for win
    for (const idx of available) {
      const next = getNextState(state, idx);
      if (next.winner === state.currentPlayer) return idx;
    }
    // Check for block
    const opponent = (state.currentPlayer === 'X' ? 'O' : 'X') as Player;
    const hypotheticalOpponentState = { ...state, currentPlayer: opponent };
    for (const idx of available) {
      const next = getNextState(hypotheticalOpponentState, idx);
      if (next.winner === opponent) return idx;
    }
    // Center logic
    if (available.includes(4)) return 4;
    return available[Math.floor(Math.random() * available.length)];
  }

  // 3. Genius: Minimax with Alpha-Beta
  // Depth 6 is sufficient for 3x3 with disappearing marks to look ahead effectively
  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const idx of available) {
    const nextState = getNextState(state, idx);
    // Call minimax for the opponent (minimizing step next)
    const score = minimax(nextState, 6, false, -Infinity, Infinity, state.currentPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = idx;
    }
  }
  
  return bestMove;
};