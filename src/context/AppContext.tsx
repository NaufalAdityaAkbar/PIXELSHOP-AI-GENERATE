"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PageId, Product, GeneratedContent, CalendarEvent, Achievement, AITrainerSettings, ShopInfo, UserSession } from '@/src/types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_CALENDAR_EVENTS,
  DEFAULT_AI_TRAINER,
  DEFAULT_SHOP
} from '@/src/mockData';
import { getLevelName } from '@/src/utils';

interface Toast {
  id: string;
  text: string;
  sub: string;
}

interface AppContextType {
  session: UserSession;
  shopInfo: ShopInfo;
  products: Product[];
  contents: GeneratedContent[];
  events: CalendarEvent[];
  achievements: Achievement[];
  aiTrainer: AITrainerSettings;
  toasts: Toast[];
  preselectedProduct: Product | null;
  handleLogin: (newSession: UserSession) => void;
  updateShopInfo: (newShop: ShopInfo) => void;
  handleLogout: () => void;
  handleResetApp: () => void;
  addXP: (amount: number, message: string) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  editProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  saveGeneratedContent: (g: Omit<GeneratedContent, 'id' | 'timestamp'>) => void;
  deleteGeneratedContent: (id: string) => void;
  addCalendarEvents: (newEvents: Omit<CalendarEvent, 'id'>[]) => void;
  checkOffPost: (id: string) => void;
  rescheduleEvent: (id: string, newDate: string, newTime: string) => void;
  deleteCalendarEvent: (id: string) => void;
  selectProductForTool: (product: Product, targetTool: PageId) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<UserSession>(() => {
    if (typeof window === 'undefined') return { email: '', isLoggedIn: false };
    const saved = localStorage.getItem('pixelshop_session');
    return saved ? JSON.parse(saved) : { email: '', isLoggedIn: false };
  });

  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => {
    if (typeof window === 'undefined') return DEFAULT_SHOP;
    const saved = localStorage.getItem('pixelshop_shopInfo');
    return saved ? JSON.parse(saved) : DEFAULT_SHOP;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    const saved = localStorage.getItem('pixelshop_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [contents, setContents] = useState<GeneratedContent[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('pixelshop_contents');
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window === 'undefined') return INITIAL_CALENDAR_EVENTS;
    const saved = localStorage.getItem('pixelshop_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ACHIEVEMENTS;
    const saved = localStorage.getItem('pixelshop_achievements');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const [aiTrainer, setAiTrainer] = useState<AITrainerSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_AI_TRAINER;
    const saved = localStorage.getItem('pixelshop_ai_trainer');
    return saved ? JSON.parse(saved) : DEFAULT_AI_TRAINER;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [preselectedProduct, setPreselectedProduct] = useState<Product | null>(null);

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

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    if (newSession.shopInfo) setShopInfo(newSession.shopInfo);
  };
  const updateShopInfo = (newShop: ShopInfo) => setShopInfo(newShop);
  const handleLogout = () => {
    if (confirm('Keluar dari panel admin Toko?')) {
      setSession({ email: '', isLoggedIn: false });
      window.location.href = '/';
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
    window.location.href = '/';
  };

  const addXP = (amount: number, message: string) => {
    const nextXP = shopInfo.xp + amount;
    let nextLevel = shopInfo.level;
    if (nextXP >= 2000) nextLevel = 5;
    else if (nextXP >= 1500) nextLevel = 4;
    else if (nextXP >= 1000) nextLevel = 3;
    else if (nextXP >= 500) nextLevel = 2;
    else nextLevel = 1;

    let upMessage = '';
    if (nextLevel > shopInfo.level) {
      upMessage = `🎉 LEVEL UP! Kamu sekarang adalah "${getLevelName(nextXP)}"!`;
    }

    setShopInfo(prev => ({ ...prev, xp: nextXP, level: nextLevel }));
    const addToast = (text: string, sub?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, text, sub }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
    addToast(message, upMessage);

    checkAchievements(nextXP, products.length, contents.length + 1);
  };

  const checkAchievements = (xp: number, prodCount: number, contCount: number) => {
    setAchievements(prev =>
      prev.map(ach => {
        if (ach.unlocked) return ach;
        let curProgress = ach.progress;
        if (ach.id === 'ach-2') curProgress = contCount;
        else if (ach.id === 'ach-3') curProgress = prodCount;
        else if (ach.id === 'ach-6') curProgress = contCount;
        
        const isNowUnlocked = curProgress >= ach.target;
        if (isNowUnlocked) {
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

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProd = { ...p, id: `prod-user-${Date.now()}` };
    setProducts(prev => {
      const updated = [...prev, newProd];
      checkAchievements(shopInfo.xp, updated.length, contents.length);
      return updated;
    });
    addXP(15, `Berhasil Daftarkan Produk "${newProd.name}"! (+15 XP)`);
  };
  const editProduct = (p: Product) => setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(item => item.id !== id));

  const saveGeneratedContent = (g: Omit<GeneratedContent, 'id' | 'timestamp'>) => {
    const newContent = { ...g, id: `content-${Date.now()}`, timestamp: new Date().toISOString() };
    setContents(prev => [newContent, ...prev]);
  };
  const deleteGeneratedContent = (id: string) => setContents(prev => prev.filter(item => item.id !== id));

  const addCalendarEvents = (newEvents: Omit<CalendarEvent, 'id'>[]) => {
    const eventsWithIds = newEvents.map((ev, idx) => ({ ...ev, id: `ev-gen-${Date.now()}-${idx}` }));
    setEvents(prev => [...eventsWithIds, ...prev]);
  };
  const checkOffPost = (id: string) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'done' as const } : ev));
    addXP(20, 'Postingan dipublikasikan! Semoga rame orderan, Kak! (+20 XP)');
    setShopInfo(prev => ({ ...prev, streak: prev.streak + 1 }));
  };
  const rescheduleEvent = (id: string, newDate: string, newTime: string) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, date: newDate, time: newTime } : ev));
  };
  const deleteCalendarEvent = (id: string) => setEvents(prev => prev.filter(item => item.id !== id));

  const selectProductForTool = (product: Product, targetTool: PageId) => {
    setPreselectedProduct(product);
    // Note: Caller is responsible for actual Next.js routing!
  };

  return (
    <AppContext.Provider value={{
      session, shopInfo, products, contents, events, achievements, aiTrainer, toasts, preselectedProduct,
      handleLogin, updateShopInfo, handleLogout, handleResetApp, addXP, addProduct, editProduct,
      deleteProduct, saveGeneratedContent, deleteGeneratedContent, addCalendarEvents, checkOffPost,
      rescheduleEvent, deleteCalendarEvent, selectProductForTool
    }}>
      {children}
    </AppContext.Provider>
  );
};
