import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, PlayCircle, Loader2, CheckCircle2, StopCircle } from 'lucide-react';

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q');
  const chatId = searchParams.get('id');
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [abortController, setAbortController] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load session when ID changes
  useEffect(() => {
    if (chatId) {
      const sessions = JSON.parse(localStorage.getItem('moviemate_sessions') || '[]');
      const session = sessions.find(s => s.id === chatId);
      if (session) {
        setMessages(session.messages);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [chatId]);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length === 0 && !chatId) return; // Don't save empty new chats
    
    const sessions = JSON.parse(localStorage.getItem('moviemate_sessions') || '[]');
    let currentId = chatId;
    
    if (!currentId) {
      currentId = Date.now().toString();
      // Update URL without full reload
      setSearchParams({ id: currentId });
    }
    
    const sessionData = {
      id: currentId,
      title: messages.length > 0 && messages[0].content ? (messages[0].content.substring(0, 40) + (messages[0].content.length > 40 ? '...' : '')) : "New Chat",
      messages,
      updatedAt: new Date().toISOString()
    };
    
    const existingIndex = sessions.findIndex(s => s.id === currentId);
    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionData;
    } else {
      sessions.unshift(sessionData);
    }
    
    localStorage.setItem('moviemate_sessions', JSON.stringify(sessions));
  }, [messages, chatId, setSearchParams]);
  
  useEffect(() => {
    if (initialQuery && messages.length === 0 && !chatId) {
      setMessages([{ role: 'user', content: initialQuery }]);
      submitQuery(initialQuery, []);
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
  }, [initialQuery, chatId, searchParams, setSearchParams]);

  const submitQuery = async (query, history) => {
    // Add "thinking" state
    setMessages(prev => [...prev, { role: 'agent', content: '', isThinking: true, tools: [] }]);
    
    // Format history for backend
    const formattedMessages = history.map(m => ({
      role: m.role === 'agent' ? 'assistant' : m.role,
      content: m.content || ''
    }));
    // Append the current query
    formattedMessages.push({ role: 'user', content: query });
    
    const controller = new AbortController();
    setAbortController(controller);
    
    const selectedModel = localStorage.getItem('moviemate_model') || 'llama-3.3-70b-versatile';

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: formattedMessages, model: selectedModel }),
        signal: controller.signal
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'thinking') {
              // already set initially
            } else if (data.type === 'tool_running') {
              // Intentionally hidden from UI
            } else if (data.type === 'tool_done') {
              // Intentionally hidden from UI
            } else if (data.type === 'final_answer') {
              setMessages(prev => {
                const newMsgs = [...prev];
                const last = newMsgs[newMsgs.length - 1];
                last.isThinking = false;
                last.content = data.content;
                return newMsgs;
              });
            } else if (data.type === 'error') {
              setMessages(prev => {
                const newMsgs = [...prev];
                const last = newMsgs[newMsgs.length - 1];
                last.isThinking = false;
                last.content = "An error occurred: " + data.content;
                return newMsgs;
              });
            }
          }
        }
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        setMessages(prev => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          last.isThinking = false;
          if (!last.content) last.content = "Generation stopped by user.";
          return newMsgs;
        });
      } else {
        setMessages(prev => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          last.isThinking = false;
          last.content = "Failed to connect to backend AI server.";
          return newMsgs;
        });
      }
    } finally {
      setAbortController(null);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const query = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setInputValue('');
    submitQuery(query, messages);
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-8">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-24 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-text-secondary opacity-50">
            Start a conversation with MovieMate
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-accent-purple text-white' : 'bg-card border border-white/10 text-accent-blue'
                }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div className="space-y-3">
                  {/* Main Message Content */}
                  {msg.isThinking ? (
                    <div className="bg-card/50 px-6 py-4 rounded-2xl rounded-tl-sm border border-white/5 flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    msg.content && (
                      <div className={`px-6 py-4 rounded-2xl shadow-lg border border-white/5 leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-accent-purple/80 to-accent-purple/60 rounded-tr-sm text-white' 
                          : 'bg-card/80 backdrop-blur-xl rounded-tl-sm text-text-primary'
                      }`}>
                        {msg.content}
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background via-background to-transparent">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
          <div className="absolute inset-0 bg-accent-blue/10 rounded-2xl blur-md group-focus-within:bg-accent-blue/20 transition-all"></div>
          <div className="glass-card relative flex items-center p-2 pl-6">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message MovieMate..."
              className="flex-1 bg-transparent border-none outline-none text-white text-base py-3"
            />
            {abortController ? (
              <button 
                type="button"
                onClick={handleStop}
                className="bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl p-3 transition-colors flex items-center justify-center mr-2"
              >
                <StopCircle size={20} />
              </button>
            ) : null}
            <button 
              type="submit"
              disabled={!inputValue.trim() || abortController}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-xl p-3 transition-colors flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
