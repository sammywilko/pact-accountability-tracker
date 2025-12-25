import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, Camera, User } from 'lucide-react';
import { cn } from '../ui';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/check-in', icon: Camera, label: 'Check-in', primary: true },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-zinc-900 safe-area-inset-bottom z-40">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          if (item.primary) return <Link key={item.path} to={item.path} className="relative -mt-8"><div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"><Icon size={28} strokeWidth={2.5} className="text-black" /></div></Link>;
          return <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 py-2 px-4"><Icon size={24} className={cn('transition-colors', isActive ? 'text-emerald-500' : 'text-zinc-600')} /><span className={cn('text-[9px] font-black uppercase tracking-widest transition-colors', isActive ? 'text-emerald-500' : 'text-zinc-700')}>{item.label}</span></Link>;
        })}
      </div>
    </nav>
  );
};