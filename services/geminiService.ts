
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, Player } from "../types";

export const getGeminiMove = async (state: GameState): Promise<number> => {
  // Initialize AI right before the call as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const boardStr = state.board.map((val, idx) => `${idx}:${val || 'empty'}`).join(', ');
  const historyStr = state.moves
    .map(m => `Player ${m.player} moved to ${m.index}`)
    .join('\n');

  try {
    const response = await ai.models.generateContent({
      // Using Pro for complex reasoning tasks like strategy games
      model: 'gemini-3-pro-preview',
      contents: `Current Board Status: [${boardStr}]
Full Move History (latest last):
${historyStr}

The player who just moved is ${state.currentPlayer === 'X' ? 'O' : 'X'}. 
It is now ${state.currentPlayer}'s turn.
Analyze the board. If you have 3 marks, remember your oldest mark will vanish if you place a new one. 
Return the best index (0-8) to win or block the opponent.`,
      config: {
        systemInstruction: `You are a Grandmaster at "Disappearing Tic-Tac-Toe". 
Rules: 
1. 3x3 Grid (indices 0-8).
2. Players only have 3 marks. 
3. When a player makes their 4th move, their OLDEST mark disappears.
4. Your goal is to get 3 in a row.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestIndex: {
              type: Type.INTEGER,
              description: 'The grid index (0-8) to place the mark.',
            },
            reasoning: {
              type: Type.STRING,
              description: 'Brief explanation of the strategy.'
            }
          },
          required: ["bestIndex"],
        },
      },
    });

    // Access .text property directly
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(text.trim());
    return result.bestIndex;
  } catch (error) {
    console.error("Gemini Move Error:", error);
    // Fallback to a random valid move if API fails
    const available = state.board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
    return available[Math.floor(Math.random() * available.length)];
  }
};
