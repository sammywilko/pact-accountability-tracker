import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Flame } from 'lucide-react';

export function cn(...inputs: (string | undefined | null | false)[]) { return twMerge(clsx(inputs)); }

interface AvatarProps { src: string | null; alt?: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; streak?: number; className?: string; }
export const Avatar: React.FC<AvatarProps> = ({ src, alt = 'Avatar', size = 'md', streak, className }) => {
  const sizeClasses = { xs: 'w-6 h-6', sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16', xl: 'w-24 h-24' };
  const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${alt}`;
  return (
    <div className="relative inline-block">
      <div className={cn(sizeClasses[size], 'rounded-full overflow-hidden border-2 border-zinc-900 ring-1 ring-zinc-800', className)}>
        <img src={src || fallback} alt={alt} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = fallback; }} />
      </div>
      {streak !== undefined && streak > 0 && <div className="absolute -bottom-1 -right-1 bg-orange-500 text-black text-[8px] font-black px-1 rounded-full border border-black min-w-[16px] h-[16px] flex items-center justify-center">{streak}</div>}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; loading?: boolean; }
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', loading = false, className, disabled, ...props }) => {
  const baseClasses = 'font-black uppercase tracking-widest rounded-3xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  const variants = { primary: 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400', secondary: 'bg-zinc-800 text-white hover:bg-zinc-700', outline: 'bg-transparent border border-zinc-800 text-zinc-400 hover:bg-zinc-900', ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900', danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' };
  const sizes = { sm: 'text-[9px] py-2 px-4', md: 'text-[10px] py-4 px-8', lg: 'text-[11px] py-6 px-10' };
  return <button className={cn(baseClasses, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>{loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}</button>;
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-3">{label}</label>}
    <input className={cn('w-full bg-zinc-900 border border-zinc-800 rounded-3xl px-6 py-5 text-white font-medium placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20', error && 'border-red-500/50', className)} {...props} />
    {error && <p className="text-[10px] text-red-500 ml-3">{error}</p>}
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string; }
export const Textarea: React.FC<TextareaProps> = ({ label, error, className, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-3">{label}</label>}
    <textarea className={cn('w-full bg-zinc-900 border border-zinc-800 rounded-3xl px-6 py-5 text-white font-medium resize-none placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20', error && 'border-red-500/50', className)} {...props} />
    {error && <p className="text-[10px] text-red-500 ml-3">{error}</p>}
  </div>
);

interface CardProps { children: React.ReactNode; className?: string; onClick?: () => void; }
export const Card: React.FC<CardProps> = ({ children, className, onClick }) => <div className={cn('p-8 bg-zinc-900/40 border border-zinc-800/60 rounded-[3rem]', onClick && 'cursor-pointer hover:bg-zinc-900/60 transition-colors', className)} onClick={onClick}>{children}</div>;

export const StreakBadge: React.FC<{ streak: number; size?: 'sm' | 'md' | 'lg' }> = ({ streak, size = 'md' }) => {
  const sizes = { sm: 'text-[9px] px-2 py-0.5', md: 'text-[10px] px-3 py-1', lg: 'text-xs px-4 py-1.5' };
  return <div className={cn('flex items-center gap-1.5 text-orange-500 bg-orange-500/5 rounded-full border border-orange-500/10', sizes[size])}><Flame size={size === 'sm' ? 12 : 14} fill="currentColor" /><span className="font-black italic">{streak}D</span></div>;
};

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return <div className={cn(sizes[size], 'border-2 border-emerald-500 border-t-transparent rounded-full animate-spin')} />;
};

export const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6"><Spinner size="lg" /><p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{message}</p></div>;

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const colors: Record<string, string> = { fitness: 'text-emerald-500', creative: 'text-purple-500', project: 'text-blue-500', life: 'text-amber-500', work: 'text-cyan-500' };
  return <span className={cn('text-[10px] font-black uppercase tracking-[0.2em]', colors[category] || 'text-zinc-500')}>{category}</span>;
};