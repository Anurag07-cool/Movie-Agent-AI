import React from 'react';
import { Film } from 'lucide-react';

export default function EmptyState({ title, description }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center mt-32">
      <div className="w-24 h-24 bg-card border border-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
        <Film size={40} className="text-accent-purple/50" />
      </div>
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}
