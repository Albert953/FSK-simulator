export const DEFAULT_PARAMS = {
  mOrder: 2,
  markFreq: 5,
  spaceFreq: 2,
  baseFreq: 2, // Default base for M-FSK
  freqSpacing: 2, // Default spacing for M-FSK
  baudRate: 1,
  amplitude: 1,
  noiseLevel: 0,
  isContinuousPhase: true,
};

export const SAMPLE_RATE = 60; // Simulation updates per second (FPS)
export const POINTS_PER_FRAME = 2; // Granularity of the wave
export const WINDOW_DURATION = 5; // Seconds of history to show on screen
export const MAX_POINTS = 500; // Max points in chart arrays

export const COLORS = {
  primary: '#3b82f6', // blue-500
  secondary: '#10b981', // emerald-500
  accent: '#f59e0b', // amber-500
  background: '#0f172a', // slate-900
  grid: '#334155', // slate-700
};