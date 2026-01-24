
export type Player = 'X' | 'O';
export type Difficulty = 'Easy' | 'Normal' | 'Genius (AI)';
export type GameMode = 'PvP' | 'PvE';

export interface Move {
  player: Player;
  index: number;
  timestamp: number;
}

export interface GameState {
  board: (Player | null)[];
  currentPlayer: Player;
  winner: Player | 'Draw' | null;
  moves: Move[];
  winningLine: number[] | null;
}
