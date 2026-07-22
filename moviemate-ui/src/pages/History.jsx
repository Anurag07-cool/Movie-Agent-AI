import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, MessageSquare, Trash2, ArrowRight } from 'lucide-react';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('moviemate_sessions') || '[]');
    // Sort by most recent
    saved.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    setSessions(saved);
  }, []);

  const deleteSession = (id, e) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    localStorage.setItem('moviemate_sessions', JSON.stringify(updated));
    setSessions(updated);
  };

  const openSession = (id) => {
    navigate(`/chat?id=${id}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-card border border-white/5 rounded-2xl flex items-center justify-center shadow-lg">
            <HistoryIcon size={24} className="text-accent-purple" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Chat History</h1>
            <p className="text-text-secondary">View and continue your previous conversations with MovieMate.</p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center mt-12">
            <MessageSquare size={48} className="mx-auto text-white/20 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No History Yet</h2>
            <p className="text-text-secondary mb-6">You haven't started any conversations with MovieMate.</p>
            <button 
              onClick={() => navigate('/chat')}
              className="bg-accent-blue hover:bg-accent-blue/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Start a New Chat
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => openSession(session.id)}
                className="glass-card rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center space-x-4 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={18} className="text-accent-purple" />
                  </div>
                  <div className="truncate pr-4">
                    <h3 className="font-semibold text-lg text-white truncate">{session.title}</h3>
                    <p className="text-sm text-text-secondary">
                      {new Date(session.updatedAt).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })} • {session.messages.length} messages
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button 
                    onClick={(e) => deleteSession(session.id, e)}
                    className="p-2 rounded-lg text-text-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Chat"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-secondary group-hover:bg-accent-blue group-hover:text-white transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
