
import { Player } from "../types";

export type ReversiPlayer = 'Black' | 'White';
export type ReversiBoard = (ReversiPlayer | null)[];

export interface ReversiState {
  board: ReversiBoard;
  currentPlayer: ReversiPlayer;
  winner: ReversiPlayer | 'Draw' | null;
  noMovesCount: number; // To detect if both players pass
}

const BOARD_SIZE = 8;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

// Positional weights for AI
const WEIGHTS = [
  100, -20, 10,  5,  5, 10, -20, 100,
  -20, -50, -2, -2, -2, -2, -50, -20,
   10,  -2, -1, -1, -1, -1,  -2,  10,
    5,  -2, -1, -1, -1, -1,  -2,   5,
    5,  -2, -1, -1, -1, -1,  -2,   5,
   10,  -2, -1, -1, -1, -1,  -2,  10,
  -20, -50, -2, -2, -2, -2, -50, -20,
  100, -20, 10,  5,  5, 10, -20, 100
];

export const getInitialReversiState = (): ReversiState => {
  const board = Array(64).fill(null);
  // Standard Othello setup: Center 4 squares
  // 27: White, 28: Black, 35: Black, 36: White (0-indexed)
  // Rows 3 and 4, Cols 3 and 4
  const c1 = 3 * 8 + 3; // 27
  const c2 = 3 * 8 + 4; // 28
  const c3 = 4 * 8 + 3; // 35
  const c4 = 4 * 8 + 4; // 36
  
  board[c1] = 'White';
  board[c2] = 'Black';
  board[c3] = 'Black';
  board[c4] = 'White';

  return {
    board,
    currentPlayer: 'Black', // Black moves first
    winner: null,
    noMovesCount: 0
  };
};

const isValidPos = (r: number, c: number) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

export const getFlippableDiscs = (board: ReversiBoard, player: ReversiPlayer, index: number): number[] => {
  if (board[index] !== null) return [];

  const opponent = player === 'Black' ? 'White' : 'Black';
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  const flippable: number[] = [];

  for (const [dr, dc] of DIRECTIONS) {
    let r = row + dr;
    let c = col + dc;
    const potentialFlips: number[] = [];

    while (isValidPos(r, c) && board[r * BOARD_SIZE + c] === opponent) {
      potentialFlips.push(r * BOARD_SIZE + c);
      r += dr;
      c += dc;
    }

    if (isValidPos(r, c) && board[r * BOARD_SIZE + c] === player && potentialFlips.length > 0) {
      flippable.push(...potentialFlips);
    }
  }

  return flippable;
};

export const getValidMoves = (board: ReversiBoard, player: ReversiPlayer): number[] => {
  const moves: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (getFlippableDiscs(board, player, i).length > 0) {
      moves.push(i);
    }
  }
  return moves;
};

export const getReversiNextState = (state: ReversiState, index: number): ReversiState => {
  const flips = getFlippableDiscs(state.board, state.currentPlayer, index);
  if (flips.length === 0) return state;

  const newBoard = [...state.board];
  newBoard[index] = state.currentPlayer;
  flips.forEach(idx => {
    newBoard[idx] = state.currentPlayer;
  });

  let nextPlayer: ReversiPlayer = state.currentPlayer === 'Black' ? 'White' : 'Black';
  let nextMoves = getValidMoves(newBoard, nextPlayer);
  let noMoves = 0;
  let winner = state.winner;

  // If next player has no moves, pass turn
  if (nextMoves.length === 0) {
    noMoves = 1;
    nextPlayer = state.currentPlayer; // Switch back
    nextMoves = getValidMoves(newBoard, nextPlayer);
    
    // If original player also has no moves -> Game Over
    if (nextMoves.length === 0) {
      noMoves = 2;
      const blackCount = newBoard.filter(c => c === 'Black').length;
      const whiteCount = newBoard.filter(c => c === 'White').length;
      if (blackCount > whiteCount) winner = 'Black';
      else if (whiteCount > blackCount) winner = 'White';
      else winner = 'Draw';
    }
  }

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    winner,
    noMovesCount: noMoves
  };
};

const evaluateReversiBoard = (board: ReversiBoard, player: ReversiPlayer): number => {
  let score = 0;
  const opponent = player === 'Black' ? 'White' : 'Black';

  for (let i = 0; i < 64; i++) {
    if (board[i] === player) score += WEIGHTS[i];
    else if (board[i] === opponent) score -= WEIGHTS[i];
  }
  return score;
};

const reversiMinimax = (
  board: ReversiBoard, 
  depth: number, 
  alpha: number, 
  beta: number, 
  maximizing: boolean, 
  player: ReversiPlayer
): number => {
  if (depth === 0) return evaluateReversiBoard(board, player);

  const currentActor = maximizing ? player : (player === 'Black' ? 'White' : 'Black');
  const validMoves = getValidMoves(board, currentActor);

  if (validMoves.length === 0) {
    // If no moves, treat as leaf node or continue with same player? 
    // Simplify: return eval
    return evaluateReversiBoard(board, player); 
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of validMoves) {
      const flips = getFlippableDiscs(board, currentActor, move);
      const newBoard = [...board];
      newBoard[move] = currentActor;
      flips.forEach(idx => newBoard[idx] = currentActor);

      const ev = reversiMinimax(newBoard, depth - 1, alpha, beta, false, player);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of validMoves) {
      const flips = getFlippableDiscs(board, currentActor, move);
      const newBoard = [...board];
      newBoard[move] = currentActor;
      flips.forEach(idx => newBoard[idx] = currentActor);

      const ev = reversiMinimax(newBoard, depth - 1, alpha, beta, true, player);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const getReversiBestMove = (state: ReversiState, difficulty: 'Easy' | 'Normal' | 'Genius (AI)'): number => {
  const moves = getValidMoves(state.board, state.currentPlayer);
  if (moves.length === 0) return -1;

  if (difficulty === 'Easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Normal: Depth 2
  // Genius: Depth 4 (Can be slow in JS if not optimized, but 4 is usually safe for Reversi)
  const depth = difficulty === 'Normal' ? 2 : 4;
  
  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    // Simulate move
    const flips = getFlippableDiscs(state.board, state.currentPlayer, move);
    const newBoard = [...state.board];
    newBoard[move] = state.currentPlayer;
    flips.forEach(idx => newBoard[idx] = state.currentPlayer);

    const score = reversiMinimax(newBoard, depth, -Infinity, Infinity, false, state.currentPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};
