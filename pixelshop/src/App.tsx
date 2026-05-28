/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'motion/react';
import {
  Sparkles,
  Store,
  Compass,
  ShoppingBag,
  Calendar,
  BookOpen,
  Award,
  Brain,
  Settings,
  Zap,
  Star,
  Plus,
  TrendingUp,
  MessageSquare,
  Volume2,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';

import { PageId, Product, GeneratedContent, CalendarEvent, Achievement, AITrainerSettings, ShopInfo, UserSession } from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_CALENDAR_EVENTS,
  DEFAULT_AI_TRAINER,
  DEFAULT_SHOP
} from './mockData';
import { getLevelName } from './utils';
import LandingAndAuth from './components/LandingAndAuth';
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import ToolsViews from './components/ToolsViews';
import { CalendarView, HistoryView, AchievementsView, AITrainerView, SettingsView } from './components/SupportingViews';
import FloatingWorkspaceBar from './components/FloatingWorkspaceBar';

export default function App() {
  // Navigation State
  const [activePage, setActivePage] = useState<PageId>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  // Deep Link States
  const [preselectedProduct, setPreselectedProduct] = useState<Product | null>(null);

  // Database / LocalStorage Sync State
  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('pixelshop_session');
    return saved ? JSON.parse(saved) : { email: '', isLoggedIn: false };
  });

  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => {
    const saved = localStorage.getItem('pixelshop_shopInfo');
    return saved ? JSON.parse(saved) : DEFAULT_SHOP;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pixelshop_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [contents, setContents] = useState<GeneratedContent[]>(() => {
    const saved = localStorage.getItem('pixelshop_contents');
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('pixelshop_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('pixelshop_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const [aiTrainer, setAiTrainer] = useState<AITrainerSettings>(() => {
    const saved = localStorage.getItem('pixelshop_ai_trainer');
    return saved ? JSON.parse(saved) : DEFAULT_AI_TRAINER;
  });

  // Custom 3D Tilt Effect State for Workspace
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  // Animated Gamification Toast Banner State
  const [toasts, setToasts] = useState<Array<{ id: string; text: string; sub: string }>>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate rotation (-1deg to 1deg maximum for subtlety)
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    setRotateX(yPct * -1.5);
    setRotateY(xPct * 1.5);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('pixelshop_session', JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem('pixelshop_shopInfo', JSON.stringify(shopInfo));
  }, [shopInfo]);

  useEffect(() => {
    localStorage.setItem('pixelshop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pixelshop_contents', JSON.stringify(contents));
  }, [contents]);

  useEffect(() => {
    localStorage.setItem('pixelshop_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('pixelshop_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('pixelshop_ai_trainer', JSON.stringify(aiTrainer));
  }, [aiTrainer]);


  // Login Handler (Direct redirect to onboarding if brand-new, otherwise to dashboard)
  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    if (newSession.shopInfo) {
      setShopInfo(newSession.shopInfo);
    }
  };

  const updateShopInfo = (newShop: ShopInfo) => {
    setShopInfo(newShop);
  };

  const handleLogout = () => {
    if (confirm('Keluar dari panel admin Toko?')) {
      setSession({ email: '', isLoggedIn: false });
      setActivePage('landing');
    }
  };

  const handleResetApp = () => {
    localStorage.clear();
    setSession({ email: '', isLoggedIn: false });
    setShopInfo(DEFAULT_SHOP);
    setProducts(INITIAL_PRODUCTS);
    setContents([]);
    setEvents(INITIAL_CALENDAR_EVENTS);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setAiTrainer(DEFAULT_AI_TRAINER);
    setActivePage('landing');
  };

  // Gamification & XP Reward triggers
  const addXP = (amount: number, message: string) => {
    const nextXP = shopInfo.xp + amount;
    let nextLevel = shopInfo.level;

    // Level up calculation boundaries
    // Level up thresholds: 500 XP, 1000 XP, 1500 XP, 2000 XP
    if (nextXP >= 2000) nextLevel = 5;
    else if (nextXP >= 1500) nextLevel = 4;
    else if (nextXP >= 1000) nextLevel = 3;
    else if (nextXP >= 500) nextLevel = 2;
    else nextLevel = 1;

    let upMessage = '';
    if (nextLevel > shopInfo.level) {
      upMessage = `🎉 LEVEL UP! Kamu sekarang adalah "${getLevelName(nextXP)}"!`;
    }

    setShopInfo((prev) => ({
      ...prev,
      xp: nextXP,
      level: nextLevel
    }));

    // Trigger visual toast
    const toastId = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id: toastId, text: message, sub: upMessage }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4500);

    // Dynamic Achievements check
    checkAchievements(nextXP, products.length, contents.length + 1);
  };

  // Check achievements progress and unlock rewards dynamically
  const checkAchievements = (xp: number, prodCount: number, contCount: number) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.unlocked) return ach;

        let curProgress = ach.progress;
        if (ach.id === 'ach-2') {
          // Penulis pertama
          curProgress = contCount;
        } else if (ach.id === 'ach-3') {
          // Stok lengkap
          curProgress = prodCount;
        } else if (ach.id === 'ach-6') {
          // Viral Starter
          curProgress = contCount;
        }

        const isNowUnlocked = curProgress >= ach.target;

        if (isNowUnlocked) {
          // Add reward inside same thread asynchronously to avoid double states
          setTimeout(() => {
            addXP(ach.xpReward, `🏆 Pencapaian Terbuka: ${ach.title.split(' ').slice(1).join(' ')}!`);
          }, 400);
        }

        return {
          ...ach,
          progress: curProgress,
          unlocked: isNowUnlocked,
          unlockedAt: isNowUnlocked ? new Date().toISOString() : undefined
        };
      })
    );
  };

  // Product CRUD
  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...p,
      id: `prod-user-${Date.now()}`
    };
    setProducts((prev) => {
      const updated = [...prev, newProd];
      checkAchievements(shopInfo.xp, updated.length, contents.length);
      return updated;
    });

    // XP allocation for listing products
    addXP(15, `Berhasil Daftarkan Produk "${newProd.name}"! (+15 XP)`);
  };

  const editProduct = (p: Product) => {
    setProducts((prev) => prev.map((item) => (item.id === p.id ? p : item)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // Content Saving History
  const saveGeneratedContent = (g: Omit<GeneratedContent, 'id' | 'timestamp'>) => {
    const newContent: GeneratedContent = {
      ...g,
      id: `content-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setContents((prev) => [newContent, ...prev]);
  };

  const deleteGeneratedContent = (id: string) => {
    setContents((prev) => prev.filter((item) => item.id !== id));
  };

  // Calendar CRUD
  const addCalendarEvents = (newEvents: Omit<CalendarEvent, 'id'>[]) => {
    const eventsWithIds = newEvents.map((ev, idx) => ({
      ...ev,
      id: `ev-gen-${Date.now()}-${idx}`
    }));
    setEvents((prev) => [...eventsWithIds, ...prev]);
  };

  const checkOffPost = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, status: 'done' as const } : ev))
    );
    // Award XP
    addXP(20, 'Postingan dipublikasikan! Semoga rame orderan, Kak! (+20 XP)');

    // Increment streak
    setShopInfo((prev) => ({
      ...prev,
      streak: prev.streak + 1
    }));
  };

  const rescheduleEvent = (id: string, newDate: string, newTime: string) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, date: newDate, time: newTime } : ev))
    );
  };

  const deleteCalendarEvent = (id: string) => {
    setEvents((prev) => prev.filter((item) => item.id !== id));
  };

  // Dynamic deep linking form catalog to specific tools
  const selectProductForTool = (product: Product, targetTool: PageId) => {
    setPreselectedProduct(product);
    setActivePage(targetTool);
  };

  // Render Page dispatcher
  const renderCurrentView = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardView
            shopInfo={shopInfo}
            productsCount={products.length}
            contentsCount={contents.length}
            events={events}
            achievements={achievements}
            onNavigate={setActivePage}
            onPostCheck={checkOffPost}
            onAddXP={addXP}
          />
        );
      case 'products':
        return (
          <ProductsView
            products={products}
            onAddProduct={addProduct}
            onEditProduct={editProduct}
            onDeleteProduct={deleteProduct}
            onSelectProductForTool={selectProductForTool}
          />
        );
      case 'caption_tool':
      case 'description_tool':
      case 'content_plan_tool':
      case 'chat_reply_tool':
      case 'competitor_tool':
        return (
          <ToolsViews
            toolId={activePage}
            products={products}
            preselectedProduct={preselectedProduct}
            onAddXP={addXP}
            onSaveContent={saveGeneratedContent}
            onAddCalendarEvents={addCalendarEvents}
            onNavigate={setActivePage}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            events={events}
            onCheckPost={checkOffPost}
            onReschedule={rescheduleEvent}
            onDeleteEvent={deleteCalendarEvent}
            onNavigate={setActivePage}
          />
        );
      case 'history':
        return (
          <HistoryView
            contents={contents}
            onDeleteContent={deleteGeneratedContent}
            onNavigate={setActivePage}
          />
        );
      case 'achievements':
        return <AchievementsView achievements={achievements} xpTotal={shopInfo.xp} />;
      case 'ai_trainer':
        return (
          <AITrainerView
            onAddXP={addXP}
            onSaveContent={saveGeneratedContent}
            shopInfo={shopInfo}
          />
        );
      case 'settings':
        return (
          <SettingsView
            shopInfo={shopInfo}
            onUpdateShop={updateShopInfo}
            onResetApp={handleResetApp}
          />
        );
      default:
        return (
          <DashboardView
            shopInfo={shopInfo}
            productsCount={products.length}
            contentsCount={contents.length}
            events={events}
            achievements={achievements}
            onNavigate={setActivePage}
            onPostCheck={checkOffPost}
            onAddXP={addXP}
          />
        );
    }
  };

  // If session is NOT logged in, we render the Landing Page containing auth login/register screens
  if (!session.isLoggedIn && activePage === 'landing') {
    return (
      <LandingAndAuth
        onNavigate={setActivePage}
        onLogin={handleLogin}
        session={session}
        updateShopInfo={updateShopInfo}
        activePage={activePage}
      />
    );
  }

  // If redirecting to auth screen itself
  if (!session.isLoggedIn && activePage === 'auth') {
    return (
      <LandingAndAuth
        onNavigate={setActivePage}
        onLogin={handleLogin}
        session={session}
        updateShopInfo={updateShopInfo}
        activePage={activePage}
      />
    );
  }

  // If in onboarding step page explicitly
  if (activePage === 'onboarding') {
    return (
      <LandingAndAuth
        onNavigate={setActivePage}
        onLogin={handleLogin}
        session={session}
        updateShopInfo={updateShopInfo}
        activePage={activePage}
      />
    );
  }

  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: <Compass className="w-5 h-5 font-bold" /> },
    { id: 'products', label: 'Katalog Produk', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'calendar', label: 'Kalender Konten', icon: <Calendar className="w-5 h-5" /> },
    { id: 'history', label: 'Riwayat Salinan', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'achievements', label: 'Gamifikasi Level', icon: <Award className="w-5 h-5" /> },
    { id: 'ai_trainer', label: 'AI Brand Voice Trainer', icon: <Brain className="w-5 h-5" /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-brand-bg relative flex flex-col antialiased select-none font-sans">
      {/* Background ambient glowing blobs */}
      <div className="amber-blob w-[400px] h-[400px] bg-[#D4956A] top-[-100px] right-[-100px] opacity-20" />
      <div className="amber-blob w-[300px] h-[300px] bg-[#F27D26] bottom-[-50px] left-[-50px] opacity-20" />

      {/* Gamification Floating Toasts System */}
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
              {/* Gold gradient side splash */}
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

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-brand-bg/80 backdrop-blur border-b border-brand-border/40 px-4 py-4 max-w-7xl mx-auto w-full flex justify-between items-center">
        <div
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-2 cursor-pointer font-display text-xl font-bold text-brand-text"
        >
          <span className="p-1 px-2 bg-brand-accent text-brand-bg rounded-lg">
            <Sparkles className="w-4 h-4 fill-brand-bg stroke-[2.5]" />
          </span>
          <span>Pixel</span><span className="font-script text-2xl text-brand-accent tracking-normal -ml-0.5 lowercase">shop</span>
        </div>

        {/* Level and streak indicator */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-[#261e14] border border-brand-border/40 px-3 py-1.5 rounded-full text-xs font-bold text-brand-text">
            <span className="px-2 py-0.5 bg-brand-accent text-brand-bg rounded-full text-[9px] font-mono tracking-wider">LV {shopInfo.level}</span>
            <span>{shopInfo.xp} XP</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-brand-border rounded bg-[#261e14] text-brand-text hover:border-brand-accent/45 transition sm:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* General Container Split-Pane (Sidebar + Main workspace) */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        {/* Sidebar Navigation - Sticky for desktop */}
        <aside className="hidden sm:block md:col-span-3 space-y-3 sticky top-24 self-start">
          <div className="glass-card p-4 space-y-5">
            <div className="flex items-center gap-3 border-b border-brand-border/30 pb-4">
              <div className="w-10 h-10 bg-brand-accent text-brand-bg font-bold font-mono rounded-full flex items-center justify-center text-lg shadow">
                {shopInfo.shopName[0].toUpperCase()}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h4 className="font-extrabold text-sm text-brand-text truncate leading-none">
                  {shopInfo.shopName}
                </h4>
                <p className="text-[10px] text-brand-accent uppercase font-mono tracking-wider font-extrabold">
                  {getLevelName(shopInfo.xp)}
                </p>
              </div>
            </div>

            <nav className="space-y-1.5">
              {navMenuItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPreselectedProduct(null); // Clear preselect trace on manual click navigation
                      setActivePage(item.id as PageId);
                    }}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition duration-150 flex items-center gap-3 ${
                      isActive
                        ? 'bg-brand-accent text-brand-bg shadow-md border-r-4 border-[#B4753A]'
                        : 'text-brand-muted hover:bg-[#332518] hover:text-brand-text'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-brand-border/30">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition flex items-center gap-3 cursor-pointer"
              >
                <LogOut className="w-5 h-5" /> Logout Aplikasi
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile menu viewport */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden glass-card p-5 border-brand-border/40 space-y-4 shadow-xl z-30"
            >
              <div className="flex items-center gap-3 border-b border-brand-border/20 pb-3">
                <div className="w-10 h-10 bg-brand-accent text-brand-bg rounded-full flex items-center justify-center font-bold">
                  {shopInfo.shopName[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-brand-text">{shopInfo.shopName}</h4>
                  <p className="text-[10px] text-brand-accent font-mono uppercase">{getLevelName(shopInfo.xp)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1">
                {navMenuItems.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPreselectedProduct(null);
                        setActivePage(item.id as PageId);
                        setMobileMenuOpen(false);
                      }}
                      className={`py-3 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                        isActive ? 'bg-brand-accent text-brand-bg' : 'text-brand-muted hover:bg-[#332518]'
                      }`}
                    >
                      {item.icon} {item.label}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="py-3 px-4 rounded-lg text-xs font-semibold text-red-400 flex items-center gap-2 hover:bg-red-500/10 transition"
                >
                  <LogOut className="w-5 h-5" /> Logout Toko
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE AREA (Occupies 9 Columns) */}
        <motion.main 
          id="workspace-area"
          ref={workspaceRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: 2000,
            transformStyle: 'preserve-3d'
          }}
          className="col-span-1 md:col-span-9 relative"
        >
          <motion.div
             style={{
               rotateX: smoothRotateX,
               rotateY: smoothRotateY,
               transformStyle: 'preserve-3d'
             }}
             className="w-full h-full pb-20"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <FloatingWorkspaceBar latestContent={contents[0] || null} />
        </motion.main>
      </div>
    </div>
  );
}
