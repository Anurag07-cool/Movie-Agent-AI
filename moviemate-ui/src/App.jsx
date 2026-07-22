import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import EmptyState from './pages/EmptyState';
import './index.css';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background overflow-hidden relative">
        {/* Animated Background Particles / Gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-purple/20 blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-blue/20 blur-[120px] mix-blend-screen" />
        </div>

        <Sidebar />
        
        <main className="flex-1 relative z-10 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/trending" element={<EmptyState title="Trending Movies" description="Discover what everyone is watching right now. This section will feature a stunning carousel of the hottest movies worldwide." />} />
            <Route path="/genres" element={<EmptyState title="Browse Genres" description="Explore our vast library organized by genre. From spine-tingling Horror to heartwarming Romance." />} />
            <Route path="/favorites" element={<EmptyState title="Your Favorites" description="Keep track of the movies you love. They will be securely saved here for easy access." />} />
            <Route path="/history" element={<EmptyState title="Watch History" description="Your past AI conversations and movie inquiries will appear here." />} />
            <Route path="/settings" element={<EmptyState title="Settings" description="Configure your API keys, theme preferences, and AI personality settings." />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
