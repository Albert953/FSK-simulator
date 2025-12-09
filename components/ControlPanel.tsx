import React from 'react';
import { FSKParams } from '../types';
import { Sliders, Activity, Zap, Waves, Volume2, Layers } from 'lucide-react';

interface ControlPanelProps {
  params: FSKParams;
  setParams: React.Dispatch<React.SetStateAction<FSKParams>>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ params, setParams }) => {
  const handleChange = (key: keyof FSKParams, value: number | boolean) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-6">
      <div className="flex items-center space-x-2 border-b border-slate-700 pb-4">
        <Sliders className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Modulation Parameters</h2>
      </div>

      {/* M-Order Selector */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Modulation Order (M)
        </label>
        <div className="grid grid-cols-3 gap-2">
            {[2, 4, 8].map(m => (
                <button
                    key={m}
                    onClick={() => handleChange('mOrder', m)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        params.mOrder === m 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-400' 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                >
                    {m}-FSK
                </button>
            ))}
        </div>
      </div>

      {/* Frequency Controls - Conditional Render */}
      {params.mOrder === 2 ? (
          // BFSK Controls
          <div className="space-y-4 pt-2 border-t border-slate-700/50">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Mark Frequency (Logic 1)
                </label>
                <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-emerald-400">
                  {params.markFreq.toFixed(1)} Hz
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={params.markFreq}
                onChange={(e) => handleChange('markFreq', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Space Frequency (Logic 0)
                </label>
                <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-indigo-400">
                  {params.spaceFreq.toFixed(1)} Hz
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={params.spaceFreq}
                onChange={(e) => handleChange('spaceFreq', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
      ) : (
          // M-FSK Controls
          <div className="space-y-4 pt-2 border-t border-slate-700/50">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-pink-400" />
                  Base Frequency (Symbol 0)
                </label>
                <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-pink-400">
                  {params.baseFreq.toFixed(1)} Hz
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={params.baseFreq}
                onChange={(e) => handleChange('baseFreq', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Frequency Spacing (Δf)
                </label>
                <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-cyan-400">
                  {params.freqSpacing.toFixed(1)} Hz
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={params.freqSpacing}
                onChange={(e) => handleChange('freqSpacing', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Freq Map Preview */}
            <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                <p className="text-xs text-slate-400 mb-2 font-semibold">Frequency Map:</p>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                    {Array.from({length: params.mOrder}).map((_, i) => (
                        <div key={i} className="bg-slate-800 p-1 rounded text-center">
                            <span className="text-slate-400">{i}:</span> <span className="text-white">{(params.baseFreq + i * params.freqSpacing).toFixed(1)}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
      )}

      {/* Baud Rate */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Symbol Rate (Baud)
          </label>
          <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-amber-400">
            {params.baudRate.toFixed(1)} baud
          </span>
        </div>
        <input
          type="range"
          min="0.2"
          max="5"
          step="0.1"
          value={params.baudRate}
          onChange={(e) => handleChange('baudRate', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {/* Noise */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-red-400" />
            Noise Level (AWGN)
          </label>
          <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-red-400">
            {params.noiseLevel.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={params.noiseLevel}
          onChange={(e) => handleChange('noiseLevel', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
      </div>

       {/* Phase Continuity Toggle */}
       <div className="pt-4 border-t border-slate-700">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={params.isContinuousPhase}
              onChange={(e) => handleChange('isContinuousPhase', e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
          <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors flex items-center gap-2">
             <Waves className="w-4 h-4" />
             Continuous Phase (CPFSK)
          </span>
        </label>
        <p className="text-xs text-slate-500 mt-2 ml-14">
            Prevents phase jumps at symbol boundaries for smoother transitions.
        </p>
      </div>

    </div>
  );
};