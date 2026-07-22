import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles, Film, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleAsk = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/chat?q=${encodeURIComponent(query)}`);
    }
  };
  return (
    <div className="min-h-full w-full p-8 flex flex-col items-center">
      
      {/* Hero Section */}
      <div className="w-full max-w-5xl mt-16 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <Sparkles size={16} className="text-accent-blue" />
          <span className="text-sm font-medium text-text-secondary">MovieMate AI Agent 2.0</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          Ask anything about <br/>
          <span className="gradient-text">movies.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl text-text-secondary max-w-2xl mb-12 leading-relaxed"
        >
          Watch an autonomous AI reason, call tools, and deliver intelligent recommendations based on factual data.
        </motion.p>
        
        {/* Large AI Chat Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.4 }}
          className="w-full max-w-3xl relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-accent-blue rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
          <form onSubmit={handleAsk} className="relative glass-card flex items-center p-2 pl-6">
            <Search size={24} className="text-text-secondary group-focus-within:text-accent-blue transition-colors" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suggest some sci-fi movies similar to Interstellar..."
              className="flex-1 bg-transparent border-none outline-none text-white text-lg px-4 py-4 placeholder:text-text-secondary/50"
            />
            <button type="submit" className="bg-white text-background hover:bg-gray-200 rounded-xl px-6 py-3 font-semibold transition-all duration-300 flex items-center space-x-2">
              <span>Ask AI</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </motion.div>

        {/* Popular Suggestions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mt-12"
        >
          {['Best action movies of 2023', 'Movies starring Tom Cruise', 'Who directed Oppenheimer?'].map((suggestion, idx) => (
            <button 
              key={idx}
              className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-text-secondary hover:text-white transition-colors flex items-center space-x-2"
            >
              <Film size={14} />
              <span>{suggestion}</span>
            </button>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
