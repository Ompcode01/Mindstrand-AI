"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, X, Zap, Moon, HeartPulse, BrainCircuit } from "lucide-react";
import { GlassPanel } from "./risk-ui";

export function DemoPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  // Toggle panel with Ctrl+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerEvent = (type: string) => {
    setActiveSimulation(type);
    
    // In a real app, this sends a POST to /api/v1/telemetry/simulate/event
    console.log(`[DEMO ENGINE] Triggering: ${type}`);
    
    // Mock simulation delay
    setTimeout(() => {
      setActiveSimulation(null);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 right-6 w-80 z-[100]"
        >
          <GlassPanel className="p-0 overflow-hidden border-[#f59e0b]/30 shadow-2xl shadow-[#f59e0b]/10 bg-[#0a0a0f]/95">
            <div className="bg-[#f59e0b]/20 p-3 border-b border-[#f59e0b]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#f59e0b]" />
                <h3 className="text-xs font-mono font-bold tracking-widest text-[#f59e0b] uppercase">
                  Phase 8: Demo Engine
                </h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#f59e0b] hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-[10px] font-mono text-[#8b8aa0] mb-4">
                Use these controls during the hackathon pitch to inject critical events into the live risk feed.
              </p>

              <button 
                onClick={() => triggerEvent('HEAVY_GAMING')}
                disabled={activeSimulation !== null}
                className="w-full flex items-center justify-between p-3 rounded bg-white/[0.03] border border-white/10 hover:border-[#7c54ff]/50 hover:bg-[#7c54ff]/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-[#7c54ff]" />
                  <span className="text-xs font-mono text-[#e8e6f0] group-hover:text-white">Inject Heavy Gaming</span>
                </div>
                {activeSimulation === 'HEAVY_GAMING' && <span className="w-2 h-2 rounded-full bg-[#7c54ff] animate-pulse" />}
              </button>

              <button 
                onClick={() => triggerEvent('SLEEP_DEFICIT')}
                disabled={activeSimulation !== null}
                className="w-full flex items-center justify-between p-3 rounded bg-white/[0.03] border border-white/10 hover:border-[#f97316]/50 hover:bg-[#f97316]/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-[#f97316]" />
                  <span className="text-xs font-mono text-[#e8e6f0] group-hover:text-white">Trigger Sleep Deficit</span>
                </div>
                {activeSimulation === 'SLEEP_DEFICIT' && <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />}
              </button>

              <button 
                onClick={() => triggerEvent('HRV_DROP')}
                disabled={activeSimulation !== null}
                className="w-full flex items-center justify-between p-3 rounded bg-white/[0.03] border border-white/10 hover:border-[#ef4444]/50 hover:bg-[#ef4444]/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <HeartPulse className="w-4 h-4 text-[#ef4444]" />
                  <span className="text-xs font-mono text-[#e8e6f0] group-hover:text-white">Simulate HRV Crash</span>
                </div>
                {activeSimulation === 'HRV_DROP' && <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />}
              </button>
              
              <button 
                onClick={() => triggerEvent('BDD_ALERT')}
                disabled={activeSimulation !== null}
                className="w-full flex items-center justify-between p-3 rounded bg-white/[0.03] border border-white/10 hover:border-[#22d3a0]/50 hover:bg-[#22d3a0]/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <BrainCircuit className="w-4 h-4 text-[#22d3a0]" />
                  <span className="text-xs font-mono text-[#e8e6f0] group-hover:text-white">Force BDD NLP Alert</span>
                </div>
                {activeSimulation === 'BDD_ALERT' && <span className="w-2 h-2 rounded-full bg-[#22d3a0] animate-pulse" />}
              </button>

            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
