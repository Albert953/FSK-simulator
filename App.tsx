import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_PARAMS, SAMPLE_RATE, WINDOW_DURATION } from './constants';
import { FSKParams } from './types';
import { calculateFSKPoint, generateSymbol } from './utils/signalUtils';
import { ControlPanel } from './components/ControlPanel';
import { Oscilloscope } from './components/Oscilloscope';
import { LabAssistant } from './components/LabAssistant';
import { Radio } from 'lucide-react';

const App: React.FC = () => {
  const [params, setParams] = useState<FSKParams>(DEFAULT_PARAMS);
  
  // Simulation State
  const [dataPoints, setDataPoints] = useState<{ time: number; value: number }[]>([]);
  const [symbolStream, setSymbolStream] = useState<{ time: number; value: number }[]>([]);
  
  // Refs for animation loop to avoid dependency cycles in useEffect
  const stateRef = useRef({
    time: 0,
    currentSymbol: 0,
    timeSinceLastSymbol: 0,
    phase: 0,
    dataBuffer: [] as { time: number; value: number }[],
    symbolBuffer: [] as { time: number; value: number }[],
  });

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // The Simulation Loop
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = timestamp;

    // Cap delta time to avoid huge jumps if tab is inactive
    const dt = Math.min(deltaTime, 0.1); 

    const state = stateRef.current;
    
    // Update global time
    state.time += dt;
    state.timeSinceLastSymbol += dt;

    // Symbol Logic: Change symbol if duration exceeded
    const symbolDuration = 1 / params.baudRate;
    if (state.timeSinceLastSymbol >= symbolDuration) {
      state.currentSymbol = generateSymbol(params.mOrder);
      // Keep modulus for better sync over time
      state.timeSinceLastSymbol = state.timeSinceLastSymbol % symbolDuration; 
    }

    // Generate Signal Point
    const { signal, newPhase } = calculateFSKPoint(
      state.time,
      state.currentSymbol,
      params,
      state.phase,
      dt
    );

    state.phase = newPhase;

    // Update Buffers
    const newDataPoint = { time: state.time, value: signal };
    const newSymbolPoint = { time: state.time, value: state.currentSymbol };

    state.dataBuffer.push(newDataPoint);
    state.symbolBuffer.push(newSymbolPoint);

    // Prune old data (older than WINDOW_DURATION)
    const cutoffTime = state.time - WINDOW_DURATION;
    
    // Simple optimization: only slice if too large
    if (state.dataBuffer.length > 0 && state.dataBuffer[0].time < cutoffTime) {
       // Find index to slice
       const idx = state.dataBuffer.findIndex(p => p.time > cutoffTime);
       if (idx > 0) {
         state.dataBuffer = state.dataBuffer.slice(idx);
         state.symbolBuffer = state.symbolBuffer.slice(idx);
       }
    }

    // React State Update
    setDataPoints([...state.dataBuffer]);
    setSymbolStream([...state.symbolBuffer]);

    requestRef.current = requestAnimationFrame(animate);
  }, [params]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);


  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">FSK Live Lab</h1>
              <p className="text-xs text-slate-400">Real-time Digital Modulation Simulator</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-500 hover:text-blue-400 transition-colors">
              Powered by Google Gemini
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Visuals */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Modulated Signal */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Modulated Signal (Carrier)</h2>
                    <span className="text-xs text-slate-500">Amplitude vs Time</span>
                </div>
                <Oscilloscope 
                    data={dataPoints} 
                    title="Tx Output" 
                    color="#3b82f6" 
                    yDomain={[-2, 2]} 
                    height={250}
                />
            </div>

            {/* Digital Data Signal */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                        {params.mOrder === 2 ? 'Baseband Data (Bits)' : `Symbol Stream (${params.mOrder}-ary)`}
                    </h2>
                    <span className="text-xs text-slate-500">Symbol Value vs Time</span>
                </div>
                <Oscilloscope 
                    data={symbolStream} 
                    title={params.mOrder === 2 ? "Binary Input" : "Symbol Input"} 
                    color="#10b981" 
                    yDomain={[0, params.mOrder === 2 ? 1.2 : params.mOrder]} 
                    height={150}
                    isDigital={true}
                />
            </div>

            {/* Explanation / Footer */}
            <div className="bg-slate-900/50 p-6 rounded-xl border border-dashed border-slate-700 text-slate-400 text-sm">
                <h3 className="text-white font-medium mb-2">How it works</h3>
                {params.mOrder === 2 ? (
                    <p>
                        Frequency Shift Keying (FSK) modulates digital data by shifting the frequency of a carrier wave. 
                        In this simulation, a logic <strong>1</strong> is represented by the <span className="text-emerald-400">Mark Frequency</span> 
                        and a logic <strong>0</strong> by the <span className="text-indigo-400">Space Frequency</span>.
                    </p>
                ) : (
                    <p>
                        <strong>M-ary FSK ({params.mOrder}-FSK)</strong> uses {params.mOrder} distinct frequencies to represent data. 
                        Each symbol (0 to {params.mOrder - 1}) maps to a specific frequency starting at the <span className="text-pink-400">Base Frequency</span> 
                        and increasing by the <span className="text-cyan-400">Frequency Spacing</span> for each step.
                    </p>
                )}
                <p className="mt-2">
                    Enable <strong>Continuous Phase (CPFSK)</strong> to ensure the wave phase is preserved during frequency transitions, 
                    reducing spectral bandwidth and avoiding high-frequency transients.
                </p>
            </div>
          </div>

          {/* Right Column: Controls & AI */}
          <div className="lg:col-span-4 space-y-6">
            <ControlPanel params={params} setParams={setParams} />
            <LabAssistant params={params} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;