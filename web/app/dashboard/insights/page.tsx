"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, MessageSquare, Send, Sparkles, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { GlassPanel } from "@/components/shared/risk-ui";

type Message = { id: string; role: 'ai' | 'user'; content: string; timestamp: string };

const MOCK_INSIGHTS = [
  "Your IGD risk has increased by 15% due to 3 consecutive nights of sleep sacrifice.",
  "Journal sentiment remains stable, but 'body dissatisfaction' tags appeared twice this week.",
  "Your HRV drops consistently after gaming sessions exceeding 4 hours."
];

export default function InsightsModule() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: "Hello. I'm your MindShield AI Therapist. I've analyzed your telemetry from the past 7 days. I noticed your gaming sessions are stretching into the night, which is affecting your sleep and HRV. How are you feeling today?",
      timestamp: new Date(Date.now() - 60000).toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "I understand. Often, extending gaming sessions is a way to decompress, but the physiological data shows it's actually increasing your baseline stress (HRV dropped to 28ms). Let's explore a 90-minute hard stop for tonight. What do you think?",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050508] p-6 lg:p-8 text-[#e8e6f0]">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
              <Brain className="w-6 h-6 text-[#7c54ff]" />
              Phase 6: AI Therapist
            </h1>
            <p className="text-xs font-mono text-[#8b8aa0] mt-1 tracking-wider uppercase">
              Explainability Insights & Cognitive Behavioral Chat
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#22d3a0] border border-[#22d3a0]/30 bg-[#22d3a0]/10 px-2 py-1 rounded">
            <Sparkles className="w-3 h-3" />
            GEMINI 2.0 ACTIVE
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Col: Executive Summary & Insights */}
          <div className="col-span-1 space-y-6 flex flex-col h-full">
            <GlassPanel className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-mono tracking-widest text-[#a78bff] uppercase flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Weekly Summary
                </h2>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {MOCK_INSIGHTS.map((insight, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04] text-sm leading-relaxed text-[#e8e6f0]"
                  >
                    <div className="flex items-start gap-3">
                      {i === 0 ? <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" /> : <TrendingUp className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />}
                      {insight}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <button className="w-full py-2.5 rounded text-xs font-mono tracking-widest bg-white/[0.05] hover:bg-white/[0.1] text-white transition-colors border border-white/10">
                  DOWNLOAD FULL SOC REPORT
                </button>
              </div>
            </GlassPanel>
          </div>

          {/* Right Col: AI Therapist Chat */}
          <GlassPanel className="col-span-1 lg:col-span-2 p-0 flex flex-col h-full border-t-2 border-t-[#22d3a0] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] bg-black/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#22d3a0]/20 flex items-center justify-center border border-[#22d3a0]/30 relative">
                <Brain className="w-4 h-4 text-[#22d3a0]" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#22d3a0] border border-black" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">MindShield AI Therapist</h3>
                <p className="text-[10px] font-mono text-[#8b8aa0]">CBT-aligned clinical assistant</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-[#7c54ff] text-white rounded-br-sm' 
                        : 'bg-white/[0.05] border border-white/10 text-[#e8e6f0] rounded-bl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span className={`text-[9px] font-mono mt-2 block ${msg.role === 'user' ? 'text-white/70 text-right' : 'text-[#8b8aa0]'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-bl-sm p-4 flex gap-1.5 items-center h-[52px]">
                    <motion.div className="w-1.5 h-1.5 bg-[#22d3a0] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-[#22d3a0] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-[#22d3a0] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-black/40 border-t border-white/[0.06]">
              <form onSubmit={handleSend} className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Discuss your risk insights with the AI Therapist..."
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-4 pr-12 py-4 text-sm text-white focus:outline-none focus:border-[#22d3a0] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-2 bottom-2 w-10 rounded-lg bg-[#22d3a0] text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:bg-[#1ebf91]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </GlassPanel>

        </div>
      </div>
    </div>
  );
}
