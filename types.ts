export interface FSKParams {
  mOrder: number; // 2, 4, 8, etc.
  markFreq: number; // For BFSK (M=2) Logic '1'
  spaceFreq: number; // For BFSK (M=2) Logic '0'
  baseFreq: number; // For M-FSK (Symbol 0)
  freqSpacing: number; // For M-FSK (Delta between symbols)
  baudRate: number; // Symbols per second
  amplitude: number;
  noiseLevel: number;
  isContinuousPhase: boolean;
}

export interface SimulationState {
  time: number;
  symbolBuffer: number[];
  currentPhase: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum FSKType {
  BFSK = 'BFSK',
  MFSK = 'MFSK'
}