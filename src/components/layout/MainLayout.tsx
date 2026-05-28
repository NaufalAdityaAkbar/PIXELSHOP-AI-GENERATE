"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles, Compass, ShoppingBag, Calendar, BookOpen,
  Award, Brain, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAppContext } from '@/src/context/AppContext';
import { getLevelName } from '@/src/utils';
import FloatingWorkspaceBar from '@/src/components/FloatingWorkspaceBar';
import LandingAndAuth from '@/src/components/LandingAndAuth';
import ConfirmDialog from '@/src/components/ConfirmDialog';
import { PageId } from '@/src/types';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const ctx = useAppContext();
  const { session, shopInfo, toasts, contents, handleLogout, isSyncing, syncMessage } = ctx;
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('pixelshop_sidebar_collapsed');
    if (saved === 'true') {
      setIsSidebarCollapsed(true);
    }
  }, []);

  React.useEffect(() => {
    if (!session.isLoggedIn) {
      document.title = "PixelShop | Beranda";
      return;
    }

    const titleMap: Record<string, string> = {
      "/dashboard": "PixelShop | Dashboard Utama",
      "/products": "PixelShop | Katalog Produk",
      "/calendar": "PixelShop | Kalender Konten",
      "/history": "PixelShop | Riwayat Salinan",
      "/achievements": "PixelShop | Gamifikasi Level",
      "/ai-trainer": "PixelShop | AI Brand Voice Trainer",
      "/settings": "PixelShop | Pengaturan Profil",
    };

    const matchedKey = Object.keys(titleMap).find(key => pathname.startsWith(key));
    document.title = matchedKey ? titleMap[matchedKey] : "PixelShop | Beranda";
  }, [pathname, session.isLoggedIn]);

  const toggleSidebar = () => {
    const nextVal = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextVal);
    localStorage.setItem('pixelshop_sidebar_collapsed', String(nextVal));
  };
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

  const needsOnboarding = session.isLoggedIn && (!shopInfo || !shopInfo.shopName || shopInfo.shopName === 'Nama Toko Baru' || shopInfo.shopName === '');

  if (!session.isLoggedIn || needsOnboarding) {
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
        activePage={needsOnboarding ? 'onboarding' : authPage}
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
      <ConfirmDialog />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-accent/5 top-[-150px] right-[-150px] blur-[150px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/5 bottom-[-100px] left-[-100px] blur-[120px] pointer-events-none" />

      {/* Floating Toasts */}
      <div className="fixed top-6 right-6 z-50 pointer-events-none space-y-3 w-full max-w-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-brand-surface border border-brand-accent/40 rounded-xl p-5 shadow-2xl relative overflow-hidden pointer-events-auto"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-brand-accent to-brand-accent/50" />
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

      {/* Real-time DB Sync Loading Pill */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[99] bg-[#1c1410]/95 border border-brand-accent/40 rounded-2xl p-4 shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/30 text-brand-accent">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-brand-accent relative" />
            </div>
            <div className="space-y-0.5 pr-2">
              <div className="text-[9px] font-mono text-brand-accent font-extrabold uppercase tracking-widest leading-none">
                SINKRONISASI BASIS DATA
              </div>
              <div className="text-[11px] text-brand-text font-bold leading-tight">
                {syncMessage || 'Menyinkronkan data dengan PostgreSQL...'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-brand-bg/85 backdrop-blur-md border-b border-brand-border/40 px-4 py-4 max-w-7xl mx-auto w-full flex justify-between items-center">
        <div onClick={() => router.push('/dashboard')} className="flex items-center gap-2 cursor-pointer font-display text-xl font-bold text-brand-text">
          <span className="p-1 px-2 bg-brand-accent text-brand-bg rounded-lg">
            <Sparkles className="w-4 h-4 fill-brand-bg stroke-[2.5]" />
          </span>
          <span>Pixel</span><span className="font-script text-2xl text-brand-accent tracking-normal -ml-0.5 lowercase">shop</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-brand-surface border border-brand-border/40 px-3 py-1.5 rounded-full text-xs font-bold text-brand-text">
            <span className="px-2 py-0.5 bg-brand-accent text-brand-bg rounded-full text-[9px] font-mono tracking-wider">LV {shopInfo.level}</span>
            <span>{shopInfo.xp} XP</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 border border-brand-border rounded bg-brand-surface text-brand-text hover:border-brand-accent/45 transition sm:hidden">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 max-w-7xl w-full flex flex-col md:flex-row gap-6 relative z-10">
        {/* DESKTOP SIDEBAR WITH COLLAPSIBLE CAPABILITY */}
        <aside
          className={`hidden sm:block shrink-0 sticky top-24 self-start transition-all duration-300 ease-in-out z-20 ${
            isSidebarCollapsed ? 'w-[78px]' : 'w-full md:w-64'
          }`}
        >
          <div className="glass-card p-4 space-y-5 relative">
            {/* COLLAPSE TOGGLE BUTTON */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-brand-accent text-brand-bg rounded-full border border-brand-border/40 hover:scale-110 flex items-center justify-center cursor-pointer transition-all duration-250 shadow-lg shadow-brand-accent/20 z-50 hover:bg-brand-accent/90"
              title={isSidebarCollapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
              )}
            </button>

            {/* SHOP PROFILE SEGMENT */}
            <div
              className={`flex items-center border-b border-brand-border/30 pb-4 transition-all duration-200 ${
                isSidebarCollapsed ? 'justify-center gap-0' : 'gap-3'
              }`}
            >
              <div className="w-10 h-10 bg-brand-accent text-brand-bg font-extrabold font-mono rounded-full flex items-center justify-center text-lg shadow-lg shrink-0">
                {shopInfo.shopName[0]?.toUpperCase()}
              </div>
              {!isSidebarCollapsed && (
                <div className="space-y-0.5 overflow-hidden transition-opacity duration-300">
                  <h4 className="font-extrabold text-sm text-brand-text truncate leading-none">{shopInfo.shopName}</h4>
                  <p className="text-[10px] text-brand-accent uppercase font-mono tracking-wider font-extrabold">
                    {getLevelName(shopInfo.xp)}
                  </p>
                </div>
              )}
            </div>

            {/* NAVIGATION MENU ITEMS */}
            <nav className="space-y-2">
              {navMenuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center cursor-pointer group relative ${
                      isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
                    } ${
                      isActive
                        ? 'bg-brand-accent text-brand-bg shadow-lg border-l-4 border-white'
                        : 'text-brand-muted hover:bg-brand-surface2/70 hover:text-brand-text'
                    }`}
                  >
                    <div className="shrink-0">{item.icon}</div>
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}

                    {/* COLLAPSED FLOATING TOOLTIP */}
                    {isSidebarCollapsed && (
                      <span className="absolute left-16 bg-[#131b2e] border border-brand-border/60 text-brand-text text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap tracking-wider uppercase">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* LOGOUT BUTTON CONTAINER */}
            <div className="pt-4 border-t border-brand-border/30">
              <button
                type="button"
                onClick={handleLogout}
                className={`w-full py-3.5 rounded-xl text-xs font-bold text-red-450 hover:bg-red-500/10 transition-all duration-200 flex items-center cursor-pointer group relative ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
                }`}
              >
                <div className="shrink-0">
                  <LogOut className="w-5 h-5" />
                </div>
                {!isSidebarCollapsed && <span>Logout Aplikasi</span>}

                {/* LOGOUT TOOLTIP */}
                {isSidebarCollapsed && (
                  <span className="absolute left-16 bg-red-950/80 border border-red-500/30 text-red-200 text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 whitespace-nowrap tracking-wider uppercase">
                    Logout Aplikasi
                  </span>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER/MENU AREA */}
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
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => { router.push(item.href); setMobileMenuOpen(false); }}
                    className={`py-3 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                      pathname.startsWith(item.href)
                        ? 'bg-brand-accent text-brand-bg'
                        : 'text-brand-muted hover:bg-brand-surface2/70'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="py-3 px-4 rounded-lg text-xs font-semibold text-red-400 flex items-center gap-2 hover:bg-red-500/10 transition"
                >
                  <LogOut className="w-5 h-5" /> Logout Toko
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN IMMERSIVE CONTENT REGION */}
        <motion.main
          ref={workspaceRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 2000, transformStyle: 'preserve-3d' }}
          className="flex-1 min-w-0 relative"
        >
          <motion.div style={{ rotateX: smoothRotateX, rotateY: smoothRotateY, transformStyle: 'preserve-3d' }} className="w-full h-full pb-20">
            <motion.div
              key={pathname}
              initial={{ opacity: 0.1, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </motion.div>
          <FloatingWorkspaceBar latestContent={contents[0] || null} />
        </motion.main>
      </div>
    </div>
  );
}
