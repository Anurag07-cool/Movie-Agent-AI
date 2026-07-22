import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Sliders, Moon, Trash2, Shield, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState('gsk_**************************************');
  const [model, setModel] = useState(() => localStorage.getItem('moviemate_model') || 'llama-3.3-70b-versatile');
  
  useEffect(() => {
    localStorage.setItem('moviemate_model', model);
  }, [model]);
  const [temperature, setTemperature] = useState(0.1);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
      localStorage.removeItem('moviemate_sessions');
      alert("Chat history cleared.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-card border border-white/5 rounded-2xl flex items-center justify-center shadow-lg">
            <SettingsIcon size={24} className="text-accent-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-text-secondary">Configure your MovieMate AI agent preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account & API */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 text-white mb-2">
              <Shield size={20} className="text-accent-blue" />
              <h2 className="text-xl font-semibold">Account & API</h2>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary">Groq API Key</label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Key size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                  <input 
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-10 text-white focus:outline-none focus:border-accent-blue/50 transition-colors"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-white"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-text-secondary">Used for authenticating requests to the Groq LLM inference engine.</p>
            </div>
          </div>

          {/* AI Personality */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-3 text-white mb-2">
              <Sliders size={20} className="text-accent-purple" />
              <h2 className="text-xl font-semibold">AI Personality</h2>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary">LLM Model</label>
              <select 
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-accent-purple/50 transition-colors appearance-none"
              >
                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</option>
                <option value="llama3-70b-8192">Llama 3 70B (Legacy)</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B (Balanced)</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-text-secondary">Temperature (Creativity)</label>
                <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded">{temperature.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.1" 
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-accent-purple"
              />
              <p className="text-xs text-text-secondary">Lower values are more factual. Higher values are more creative.</p>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass-card rounded-2xl p-6 space-y-6 md:col-span-2">
            <div className="flex items-center space-x-3 text-white mb-2">
              <Moon size={20} className="text-text-primary" />
              <h2 className="text-xl font-semibold">System Preferences</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl">
              <div>
                <h3 className="font-medium text-white">Clear Chat History</h3>
                <p className="text-sm text-text-secondary">Permanently delete all saved sessions on this device.</p>
              </div>
              <button 
                onClick={handleClearHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors whitespace-nowrap"
              >
                <Trash2 size={16} />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
