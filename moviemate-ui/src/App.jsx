import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import EmptyState from './pages/EmptyState';
import History from './pages/History';
import Settings from './pages/Settings';
import './index.css';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background overflow-hidden selection:bg-accent-blue/30 text-text-primary font-sans">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-purple/20 blur-[120px] animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-accent-blue/20 blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-accent-pink/10 blur-[150px] animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        <Sidebar />
        
        <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/trending" element={<EmptyState title="Trending Movies" description="Discover what's hot right now. This section is coming soon!" />} />
            <Route path="/genres" element={<EmptyState title="Movie Genres" description="Browse movies by your favorite categories. Coming soon!" />} />
            <Route path="/favorites" element={<EmptyState title="Your Favorites" description="Save your top movies here for quick access later. Coming soon!" />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
