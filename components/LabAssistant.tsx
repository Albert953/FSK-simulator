import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { FSKParams, ChatMessage } from '../types';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';

interface LabAssistantProps {
  params: FSKParams;
}

export const LabAssistant: React.FC<LabAssistantProps> = ({ params }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hello! I'm your FSK Lab Assistant. I can explain the current modulation settings, theoretical concepts, or what the waveforms represent. Ask me anything!",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (!process.env.API_KEY) {
          throw new Error("API Key missing");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const mSpecificInfo = params.mOrder === 2 
        ? `- Mode: Binary FSK (2-FSK)\n- Mark Frequency (1): ${params.markFreq} Hz\n- Space Frequency (0): ${params.spaceFreq} Hz`
        : `- Mode: ${params.mOrder}-FSK\n- Base Frequency: ${params.baseFreq} Hz\n- Frequency Spacing: ${params.freqSpacing} Hz`;

      const systemPrompt = `
        You are an expert Digital Signal Processing (DSP) Tutor and Lab Assistant for an FSK (Frequency Shift Keying) simulation web app.
        
        Current Simulation State:
        ${mSpecificInfo}
        - Symbol Rate: ${params.baudRate} baud
        - Noise Level: ${params.noiseLevel} (0-1 scale)
        - Continuous Phase: ${params.isContinuousPhase ? 'Enabled (CPFSK)' : 'Disabled'}

        Your goal is to answer the user's question accurately, concisely, and with a focus on education.
        If the user asks about the "current settings", refer to the values above.
        Explain concepts simply but technically. Use Markdown for formatting.
        Keep answers short (under 150 words) unless asked for a detailed explanation.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Question: " + userMsg.text }] }
        ],
      });

      const text = response.text || "I couldn't generate a response. Please try again.";
      
      setMessages(prev => [...prev, { role: 'model', text: text, timestamp: Date.now() }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Unable to connect to the AI service. Please check your API key.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
      <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
                <h3 className="font-semibold text-white">Lab Assistant</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    Powered by Gemini 2.5 <Sparkles className="w-3 h-3 text-amber-400" />
                </p>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-700 text-slate-100 rounded-bl-none'
              }`}
            >
              {msg.role === 'model' ? (
                  // Simple markdown rendering safety
                  msg.text.split('\n').map((line, i) => <p key={i} className="min-h-[1em]">{line}</p>)
              ) : msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about modulation, frequencies..."
            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};