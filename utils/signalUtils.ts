import { FSKParams } from '../types';

// Generate a random symbol (0 to M-1)
export const generateSymbol = (mOrder: number): number => {
  return Math.floor(Math.random() * mOrder);
};

// Gaussian noise generator (Box-Muller transform)
export const gaussianNoise = (): number => {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
};

export const calculateFSKPoint = (
  time: number,
  currentSymbol: number,
  params: FSKParams,
  prevPhase: number,
  dt: number
): { signal: number; newPhase: number; targetFreq: number } => {
  
  let targetFreq: number;

  if (params.mOrder === 2) {
    // Classic BFSK behavior
    targetFreq = currentSymbol === 1 ? params.markFreq : params.spaceFreq;
  } else {
    // M-FSK behavior: f = base + symbol * spacing
    targetFreq = params.baseFreq + (currentSymbol * params.freqSpacing);
  }
  
  let phase;
  let newPhase = prevPhase;

  if (params.isContinuousPhase) {
    // CPFSK: Integrate frequency to get phase
    // dPhase = 2 * pi * f * dt
    const phaseDelta = 2 * Math.PI * targetFreq * dt;
    newPhase = (prevPhase + phaseDelta) % (2 * Math.PI);
    phase = newPhase;
  } else {
    // Non-coherent: Phase resets or depends purely on time * freq
    // This causes discontinuities at symbol boundaries
    phase = 2 * Math.PI * targetFreq * time;
    newPhase = 0; // Not used for state in this mode
  }

  const cleanSignal = params.amplitude * Math.sin(phase);
  const noise = gaussianNoise() * params.noiseLevel;
  
  return {
    signal: cleanSignal + noise,
    newPhase,
    targetFreq
  };
};