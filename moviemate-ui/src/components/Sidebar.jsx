import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  MessageSquare, 
  TrendingUp, 
  Film, 
  Heart, 
  History, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
  { icon: TrendingUp, label: 'Trending', path: '/trending' },
  { icon: Film, label: 'Genres', path: '/genres' },
  { icon: Heart, label: 'Favorites', path: '/favorites' },
  { icon: History, label: 'History', path: '/history' },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 260 : 80 }}
      className="h-full z-50 flex flex-col bg-card/40 backdrop-blur-3xl border-r border-white/5 relative transition-all duration-300"
    >
      <div className="p-6 flex items-center justify-between">
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-xl tracking-tight gradient-text"
          >
            MovieMate
          </motion.div>
        )}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavLink 
          to="/chat"
          className="flex items-center space-x-3 px-4 py-3 mb-6 rounded-xl transition-all duration-300 group bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="relative z-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          {isExpanded && (
            <span className="font-semibold relative z-10">New Chat</span>
          )}
        </NavLink>

        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
              ${isActive ? 'text-white' : 'text-text-secondary hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 rounded-xl"
                  />
                )}
                <item.icon size={20} className={`relative z-10 ${isActive ? 'text-accent-blue' : 'group-hover:scale-110 transition-transform'}`} />
                {isExpanded && (
                  <span className="font-medium relative z-10">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 mt-auto border-t border-white/5">
        <NavLink 
          to="/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
        >
          <Settings size={20} />
          {isExpanded && <span className="font-medium">Settings</span>}
        </NavLink>
      </div>
    </motion.aside>
  );
}
