"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles, Compass, ShoppingBag, Calendar, BookOpen,
  Award, Brain, Settings, LogOut, Menu, X
} from 'lucide-react';
import { useAppContext } from '@/src/context/AppContext';
import { getLevelName } from '@/src/utils';
import FloatingWorkspaceBar from '@/src/components/FloatingWorkspaceBar';
import LandingAndAuth from '@/src/components/LandingAndAuth';
import { PageId } from '@/src/types';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const ctx = useAppContext();
  const { session, shopInfo, toasts, contents, handleLogout } = ctx;
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const [authPage, setAuthPage] = useState<PageId>('landing');

  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateX(yPct * -1.5);
    setRotateY(xPct * 1.5);
  };
  const handleMouseLeave = () => { setRotateX(0); setRotateY(0); };

  if (!session.isLoggedIn) {
    return (
      <LandingAndAuth
        onNavigate={(page) => {
          if (page === 'dashboard') {
            router.push('/dashboard');
          } else {
            setAuthPage(page);
          }
        }}
        onLogin={(sess) => {
          ctx.handleLogin(sess);
          router.push('/dashboard');
        }}
        session={session}
        updateShopInfo={ctx.updateShopInfo}
        activePage={authPage}
      />
    );
  }

  const navMenuItems = [
    { href: '/dashboard', label: 'Dashboard Utama', icon: <Compass className="w-5 h-5 font-bold" /> },
    { href: '/products', label: 'Katalog Produk', icon: <ShoppingBag className="w-5 h-5" /> },
    { href: '/calendar', label: 'Kalender Konten', icon: <Calendar className="w-5 h-5" /> },
    { href: '/history', label: 'Riwayat Salinan', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/achievements', label: 'Gamifikasi Level', icon: <Award className="w-5 h-5" /> },
    { href: '/ai-trainer', label: 'AI Brand Voice Trainer', icon: <Brain className="w-5 h-5" /> },
    { href: '/settings', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-brand-bg relative flex flex-col antialiased select-none font-sans">
      <div className="amber-blob w-[400px] h-[400px] bg-[#D4956A] top-[-100px] right-[-100px] opacity-20" />
      <div className="amber-blob w-[300px] h-[300px] bg-[#F27D26] bottom-[-50px] left-[-50px] opacity-20" />

      {/* Floating Toasts */}
      <div className="fixed top-6 right-6 z-50 pointer-events-none space-y-3 w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#261e14] border border-brand-accent/40 rounded-xl p-5 shadow-2xl relative overflow-hidden pointer-events-auto"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#B4753A] to-brand-accent" />
              <div className="pl-3 space-y-1">
                <div className="text-xs font-mono text-brand-accent font-extrabold uppercase tracking-wide">
                  ● PIXELSHOP GAME ENGINE
                </div>
                <div className="font-bold text-[#8AC98A] text-sm">{toast.text}</div>
                {toast.sub && <div className="text-xs text-brand-text font-semibold">{toast.sub}</div>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <header className="sticky top-0 z-40 bg-brand-bg/80 backdrop-blur border-b border-brand-border/40 px-4 py-4 max-w-7xl mx-auto w-full flex justify-between items-center">
        <div onClick={() => router.push('/dashboard')} className="flex items-center gap-2 cursor-pointer font-display text-xl font-bold text-brand-text">
          <span className="p-1 px-2 bg-brand-accent text-brand-bg rounded-lg">
            <Sparkles className="w-4 h-4 fill-brand-bg stroke-[2.5]" />
          </span>
          <span>Pixel</span><span className="font-script text-2xl text-brand-accent tracking-normal -ml-0.5 lowercase">shop</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-[#261e14] border border-brand-border/40 px-3 py-1.5 rounded-full text-xs font-bold text-brand-text">
            <span className="px-2 py-0.5 bg-brand-accent text-brand-bg rounded-full text-[9px] font-mono tracking-wider">LV {shopInfo.level}</span>
            <span>{shopInfo.xp} XP</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 border border-brand-border rounded bg-[#261e14] text-brand-text hover:border-brand-accent/45 transition sm:hidden">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        <aside className="hidden sm:block md:col-span-3 space-y-3 sticky top-24 self-start">
          <div className="glass-card p-4 space-y-5">
            <div className="flex items-center gap-3 border-b border-brand-border/30 pb-4">
              <div className="w-10 h-10 bg-brand-accent text-brand-bg font-bold font-mono rounded-full flex items-center justify-center text-lg shadow">
                {shopInfo.shopName[0]?.toUpperCase()}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h4 className="font-extrabold text-sm text-brand-text truncate leading-none">{shopInfo.shopName}</h4>
                <p className="text-[10px] text-brand-accent uppercase font-mono tracking-wider font-extrabold">{getLevelName(shopInfo.xp)}</p>
              </div>
            </div>
            <nav className="space-y-1.5">
              {navMenuItems.map((item) => (
                <button key={item.href} onClick={() => router.push(item.href)} className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition duration-150 flex items-center gap-3 ${pathname.startsWith(item.href) ? 'bg-brand-accent text-brand-bg shadow-md border-r-4 border-[#B4753A]' : 'text-brand-muted hover:bg-[#332518] hover:text-brand-text'}`}>
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>
            <div className="pt-4 border-t border-brand-border/30">
              <button onClick={handleLogout} className="w-full py-3 px-4 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition flex items-center gap-3 cursor-pointer">
                <LogOut className="w-5 h-5" /> Logout Aplikasi
              </button>
            </div>
          </div>
        </aside>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="sm:hidden glass-card p-5 border-brand-border/40 space-y-4 shadow-xl z-30">
              <div className="flex items-center gap-3 border-b border-brand-border/20 pb-3">
                <div className="w-10 h-10 bg-brand-accent text-brand-bg rounded-full flex items-center justify-center font-bold">
                  {shopInfo.shopName[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-brand-text">{shopInfo.shopName}</h4>
                  <p className="text-[10px] text-brand-accent font-mono uppercase">{getLevelName(shopInfo.xp)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {navMenuItems.map((item) => (
                  <button key={item.href} onClick={() => { router.push(item.href); setMobileMenuOpen(false); }} className={`py-3 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${pathname.startsWith(item.href) ? 'bg-brand-accent text-brand-bg' : 'text-brand-muted hover:bg-[#332518]'}`}>
                    {item.icon} {item.label}
                  </button>
                ))}
                <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="py-3 px-4 rounded-lg text-xs font-semibold text-red-400 flex items-center gap-2 hover:bg-red-500/10 transition">
                  <LogOut className="w-5 h-5" /> Logout Toko
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.main ref={workspaceRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ perspective: 2000, transformStyle: 'preserve-3d' }} className="col-span-1 md:col-span-9 relative">
          <motion.div style={{ rotateX: smoothRotateX, rotateY: smoothRotateY, transformStyle: 'preserve-3d' }} className="w-full h-full pb-20">
            <AnimatePresence mode="wait">
              <motion.div key={pathname} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <FloatingWorkspaceBar latestContent={contents[0] || null} />
        </motion.main>
      </div>
    </div>
  );
}
