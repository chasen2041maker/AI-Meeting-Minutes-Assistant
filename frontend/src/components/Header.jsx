import React, { useState } from 'react';
import { Menu, X, Mic } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container flex items-center justify-between py-6 min-h-[70px]">
        <div className="flex items-center gap-12">
          <a href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-slate-900 rounded-lg text-white group-hover:bg-slate-800 transition-colors">
              <Mic size={24} />
            </div>
            <span className="font-heading font-bold text-xl tracking-wider text-slate-900">会议记录助手</span>
          </a>
        </div>
      </div>
    </header>
  );
}
