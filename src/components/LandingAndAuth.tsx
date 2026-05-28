/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InteractiveBubbles from './InteractiveBubbles';
import GeometricParticles from './GeometricParticles';
import InteractiveWaves from './InteractiveWaves';
import InteractiveScrollMarquee from './InteractiveScrollMarquee';
import {
  Sparkles,
  ArrowRight,
  Store,
  CheckCircle,
  TrendingUp,
  MessageCircle,
  Calendar,
  Lock,
  Mail,
  User,
  ShoppingBag,
  Volume2,
  Award,
  ChevronRight,
  Mic
} from 'lucide-react';
import { PageId, ShopInfo, UserSession } from '../types';
import { applySectionGradients } from '../lib/theme';
import { googleSignIn } from '../lib/workspaceAuth';
import { useAppContext } from '../context/AppContext';

const dummyTestimonials = [
  {
    initials: "FR",
    name: "Farhan Basreng Remedi",
    product: "Basreng Daun Jeruk",
    location: "Bandung",
    title: "Omset Naik 10x Lipat! 🔥",
    quote: "Kemarin iseng post caption dari PixelShop di Instagram Reels, viewnya melonjak 10x lipat dan Basreng laku keras krisis stok!",
    rating: 5,
    tag: "KULINER PEDAS"
  },
  {
    initials: "BE",
    name: "Bu Endang Jamu Lestari",
    product: "Kunyit Asam Premium",
    location: "Yogyakarta",
    title: "Gaptek pun Bisa Jualan! 🌸",
    quote: "Awalnya saya gaptek setengah mati buat bikin taktik marketing. Sekarang tinggal ngomong dikit, AI langsung meramu kalender sebulan penuh!",
    rating: 5,
    tag: "HERBAL TRADISIONAL"
  },
  {
    initials: "AS",
    name: "Arief Kopi Selasar",
    product: "Kopi Susu Gula Aren",
    location: "Jakarta Selatan",
    title: "Analisis Pasar Tajam ☕",
    quote: "Analisis pasarnya tajam banget! Bisa ngasih tahu taktik pemasaran produk lokal kami dibanding merk kopi waralaba raksasa perkotaan.",
    rating: 5,
    tag: "RETAIL CAFE"
  },
  {
    initials: "SM",
    name: "Shinta Hijab Modis",
    product: "Hijab Laser-cut Premium",
    location: "Solo",
    title: "Hemat Admin Jutaan Rupiah 🧣",
    quote: "Biasanya bayar admin sosmed mahal cuma untuk buat caption harian. Sekarang pakai PixelShop modal puluhan ribu dapet ratusan asisten sapaan gaul.",
    rating: 5,
    tag: "FASHION MUSLIM"
  },
  {
    initials: "DK",
    name: "Kang Deddy Tempe Krispi",
    product: "Tempe Kripik Aneka Rasa",
    location: "Malang",
    title: "Jualan Serasa Main Game! 🎮",
    quote: "Suka sekali sistem XP poin, level, & badge lencana lucunya. Jualan rasanya asyik seperti main RPG, level dagang naik sekelas legenda!",
    rating: 5,
    tag: "KRIPIK TRADISIONAL"
  },
  {
    initials: "NL",
    name: "Neng Lilis Sambal Geledek",
    product: "Sambal Cumi Asin",
    location: "Surabaya",
    title: "Persona AI Sangat Unik 🌶️",
    quote: "Caption buatan AI-nya lincah dan berani banget, pas banget dengan persona sambal pedas level dewa kami. Pembeli makin penasaran!",
    rating: 5,
    tag: "MAKANAN PEDAS"
  },
  {
    initials: "KB",
    name: "Bro Kevin Sepatu Lokal",
    product: "Loafers Kulit Custom",
    location: "Tangerang",
    title: "Hook Reels Sangat Gacor 👞",
    quote: "Instruksi hook-line dari AI PixelShop langsung bikin penonton Reels kami bertahan di detik pertama. Penjualan meroket tajam!",
    rating: 5,
    tag: "FASHION CREATIVE"
  },
  {
    initials: "MM",
    name: "Kak Meidy Dessert Box",
    product: "Red Velvet Cake",
    location: "Medan",
    title: "Admin Kami Anti Marah 🍰",
    quote: "Template chat ramah pelanggannya ngebantu admin saya jawab chat komplain dengan kepala dingin. Customer-service level bintang lima!",
    rating: 5,
    tag: "KULINER MANIS"
  },
  {
    initials: "PW",
    name: "Pak Wayan Ukiran Bali",
    product: "Patung Kayu Deformasi",
    location: "Bali",
    title: "Tembus Pasar Global ✈️",
    quote: "Sangat membantu mencarikan hashtag relevan untuk audiens turis mancanegara. Sekarang ekspor produk jadi lebih tertarget.",
    rating: 5,
    tag: "KERAJINAN TANGAN"
  },
  {
    initials: "TI",
    name: "Teh Irma Sate Maranggi",
    product: "Sate Frozen Praktis",
    location: "Purwakarta",
    title: "Kalender Konten Instan 🍢",
    quote: "Drafting strategi marketing mingguan jadi super cepat. Desainnya juga cantik, bikin betah nulis ide tiap pagi.",
    rating: 5,
    tag: "OLAHAN DAGING"
  }
];

interface LandingAndAuthProps {
  onNavigate: (page: PageId) => void;
  onLogin: (session: UserSession) => void;
  session: UserSession;
  updateShopInfo: (shop: ShopInfo) => void;
  activePage?: PageId;
}

export default function LandingAndAuth({
  onNavigate,
  onLogin,
  session,
  updateShopInfo,
  activePage = 'landing'
}: LandingAndAuthProps) {
  const ctx = useAppContext();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');

  // Onboarding Wizard State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [obShopName, setObShopName] = useState('');
  const [obCategory, setObCategory] = useState('Kuliner & Cemilan');
  const [obCustomCategory, setObCustomCategory] = useState('');
  const [obDesc, setObDesc] = useState('');
  const [obPlatforms, setObPlatforms] = useState<string[]>(['instagram']);
  const [obBrandVoice, setObBrandVoice] = useState<string>('ceria');
  const [obCustomBrandVoice, setObCustomBrandVoice] = useState('');
  const [obFirstProduct, setObFirstProduct] = useState('');
  const [obFirstPrice, setObFirstPrice] = useState('');

  // Form errors
  const [errorMsg, setErrorMsg] = useState('');

  // Auth Loading States
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authLoadingStep, setAuthLoadingStep] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Tolong masukkan email.');
      return;
    }
    setErrorMsg('');
    setIsAuthLoading(true);

    try {
      if (activeTab === 'register') {
        setAuthLoadingStep('Membuat Akun PixelShop...');
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const newSession: UserSession = {
          email,
          isLoggedIn: true,
          shopInfo: {
            shopName: shopName || 'PixelShop Baru',
            category: 'Retail & Fashion',
            description: 'Toko baru keren berdaya AI.',
            platforms: ['instagram', 'whatsapp'],
            brandVoice: 'ceria',
            level: 1,
            xp: 10,
            streak: 1
          }
        };
        onLogin(newSession);
        onNavigate('onboarding');
      } else {
        setAuthLoadingStep('Menghubungkan ke PixelShop...');
        
        // Attempt to load from PostgreSQL Prisma db
        let dbShop = null;
        try {
          const res = await fetch('/api/pixelshop/get-db-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && !data.new_user && !data.db_offline) {
              dbShop = data;
            }
          }
        } catch (dbErr) {
          console.warn("DB offline fallback to local mock:", dbErr);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (dbShop) {
          setAuthLoadingStep('Sinkronisasi Akun Toko Anda... ⚡');
          await new Promise((resolve) => setTimeout(resolve, 600));

          const existingSession: UserSession = {
            email,
            isLoggedIn: true,
            shopInfo: dbShop.shopInfo
          };
          onLogin(existingSession);
          onNavigate('dashboard');
        } else {
          setIsAuthLoading(false);
          setAuthLoadingStep('');
          setErrorMsg('Alamat email belum terdaftar. Silakan daftar terlebih dahulu.');
          return;
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login.');
    } finally {
      setIsAuthLoading(false);
      setAuthLoadingStep('');
    }
  };

  const handlePlatformToggle = (plat: string) => {
    if (obPlatforms.includes(plat)) {
      setObPlatforms(obPlatforms.filter((p) => p !== plat));
    } else {
      setObPlatforms([...obPlatforms, plat]);
    }
  };

  const submitOnboarding = async () => {
    if (!obShopName.trim()) {
      alert('Nama toko tidak boleh kosong!');
      return;
    }
    const finalCategory = obCategory === 'custom' ? obCustomCategory : obCategory;
    const finalBrandVoice = obBrandVoice === 'custom' ? obCustomBrandVoice : obBrandVoice;

    const finalShop: ShopInfo = {
      shopName: obShopName,
      category: finalCategory || 'Kuliner & Cemilan',
      description: obDesc || 'Fokus meluncurkan produk berkualitas global buatan lokal.',
      platforms: obPlatforms,
      brandVoice: finalBrandVoice as any || 'ceria',
      level: 1,
      xp: 50, // bonus setup
      streak: 1
    };

    updateShopInfo(finalShop);

    // Persist onboarding state in PostgreSQL
    if (session.isLoggedIn && session.email) {
      try {
        await fetch('/api/pixelshop/save-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session.email,
            shopName: obShopName,
            category: finalCategory,
            description: obDesc || 'Fokus meluncurkan produk berkualitas global buatan lokal.',
            platforms: obPlatforms,
            brandVoice: finalBrandVoice,
            firstProduct: obFirstProduct.trim() ? {
              name: obFirstProduct,
              price: Number(obFirstPrice) || 25000
            } : null
          })
        });
      } catch (err) {
        console.error("Gagal menyimpan onboarding ke database:", err);
      }
    }

    // Add first product helper if user input it
    if (obFirstProduct.trim()) {
      const userProducts = localStorage.getItem('pixelshop_products');
      const productsList = userProducts ? JSON.parse(userProducts) : [];
      productsList.push({
        id: `prod-user-${Date.now()}`,
        name: obFirstProduct,
        price: Number(obFirstPrice) || 25000,
        description: 'Produk pertama yang dikonfigurasi saat onboarding.',
        category: finalCategory
      });
      localStorage.setItem('pixelshop_products', JSON.stringify(productsList));
    }

    // Trigger achievements Grand Opening setup
    onNavigate('dashboard');
  };

  // Auth Page renders on activePage === 'auth'
  if (activePage === 'auth') {
    return (
      <div className="min-h-screen bg-brand-bg relative overflow-hidden flex flex-col justify-center items-center px-4 py-8">
        <AnimatePresence>
          {isAuthLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col justify-center items-center gap-6 animate-fade-in"
            >
              {/* Spinning particle galaxy */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-t-brand-accent border-r-brand-accent/30 border-b-brand-accent/10 border-l-brand-accent/50 animate-spin" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-brand-accent to-[#B4753A] flex items-center justify-center shadow-lg shadow-brand-accent/20"
                >
                  <Sparkles className="w-5 h-5 text-brand-bg animate-pulse" />
                </motion.div>
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-display font-medium text-lg text-brand-text uppercase tracking-widest animate-pulse">PixelShop AI</h3>
                <p className="text-brand-accent font-mono text-xs tracking-wider bg-brand-accent/10 px-4 py-1.5 rounded-full border border-brand-accent/20 max-w-sm mx-auto">
                  {authLoadingStep || 'Menyiapkan Kanvas Kreatif Anda...'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow Spheres */}
        <div className="amber-blob w-96 h-96 bg-brand-accent top-12 left-12" />
        <div className="amber-blob w-80 h-80 bg-[#B4753A] bottom-12 right-12 opacity-15" />

        {/* Back Link to Landing */}
        <button
          onClick={() => onNavigate('landing')}
          className="absolute top-6 left-6 text-xs font-mono text-brand-accent bg-[#261e14] border border-brand-border/40 px-4 py-2 rounded-full flex items-center gap-2 hover:border-brand-accent hover:text-brand-text transition z-20 cursor-pointer"
        >
          ← KEMBALI KE BERANDA
        </button>

        <div className="w-full max-w-lg glass-card glass neumorph p-8 md:p-12 relative z-10 border border-brand-accent/30 space-y-6">
          <div className="text-center space-y-1">
            <span className="font-script text-4xl text-brand-accent block select-none -mb-1">
              {activeTab === 'login' ? 'Selamat Datang Kembali' : 'Bergabung Bersama Kami'}
            </span>
            <h2 className="text-3xl font-display font-medium text-brand-text tracking-wide uppercase">
              {activeTab === 'login' ? 'Masuk Toko' : 'Daftar Akun'}
            </h2>
            <p className="text-brand-muted text-xs font-sans">
              Integrasi Google Gemini Pro untuk Optimalisasi Pemasaran UMKM
            </p>
          </div>

          {/* Tab Selection */}
          <div className="grid grid-cols-2 bg-[#1c1410] p-1 border border-brand-border/40 rounded-xl">
            <button
              onClick={() => setActiveTab('login')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-brand-accent text-brand-bg'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-brand-accent text-brand-bg'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              REGISTER
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 pt-1">
            {activeTab === 'register' && (
              <div>
                <label className="block text-[10px] font-mono text-brand-text mb-1.5 uppercase tracking-wider">
                  Nama Toko / Brand
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-accent">
                    <Store className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#1c1410]/70 border border-brand-border rounded-xl pl-10 pr-4 py-3 text-xs text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-150"
                    placeholder="Contoh: Dapur Rasa Ibu"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-brand-text mb-1.5 uppercase tracking-wider">
                Alamat Email Kantor
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-accent">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  className="w-full bg-[#1c1410]/70 border border-brand-border rounded-xl pl-10 pr-4 py-3 text-xs text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-150"
                  placeholder="name@toko.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-brand-text mb-1.5 uppercase tracking-wider">
                Kata Sandi Rahasia
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-brand-accent">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  className="w-full bg-[#1c1410]/70 border border-brand-border rounded-xl pl-10 pr-4 py-3 text-xs text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-150"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-400 text-xs font-semibold bg-red-400/10 p-2.5 rounded-lg border border-red-400/20">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-accent py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 mt-2 shadow-lg hover:shadow-brand-accent/30 transition-all duration-300 cursor-pointer"
            >
              {activeTab === 'login' ? 'MASUK KE TOKO' : 'MULAI PROSES ONBOARDING (+50 XP)'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Auth Option - Google OAuth Centered Request */}
          <div className="space-y-3 pt-3 border-t border-brand-border/45">
            <div className="relative flex justify-center text-[10px] font-mono">
              <span className="bg-[#261e14] px-3 text-brand-muted uppercase">Atau Hubungkan Lewat</span>
            </div>

            <button
              type="button"
              onClick={async () => {
                setIsAuthLoading(true);
                setAuthLoadingStep('Menyinkronkan Kredensial dengan Google OAuth...');
                let googleEmail = email || 'naufaladityaakbar@gmail.com';
                let googleName = 'Naufal Aditya Akbar';
                let photoURL = undefined;

                try {
                  const res = await googleSignIn();
                  if (!res) {
                    throw new Error("Gagal mengambil respon dari Firebase Google Sign-In.");
                  }
                  googleEmail = res.user.email || googleEmail;
                  googleName = res.user.displayName || googleName;
                  photoURL = res.user.photoURL || undefined;
                } catch (e: any) {
                  console.error('Firebase Google Auth error:', e);
                  setIsAuthLoading(false);
                  setAuthLoadingStep('');
                  
                  ctx.triggerConfirm({
                    title: "Firebase Auth Error",
                    message: `Domain belum terdaftar di Firebase Console (auth/unauthorized-domain).\n\nSilakan daftarkan domain di Firebase Console, atau lanjutkan dengan Preview Demo Mode.`,
                    type: "danger",
                    confirmText: "PREVIEW SECURE DEMO",
                    cancelText: "KEMBALI KE LOGIN",
                    onConfirm: async () => {
                      setIsAuthLoading(true);
                      setAuthLoadingStep('Menyiapkan Secure Preview Demo Mode... 🛡️');
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      
                      const googleSessionFallback: UserSession = {
                        email: email || 'naufaladityaakbar@gmail.com',
                        isLoggedIn: true,
                        shopInfo: {
                          shopName: shopName || 'Rasa Nusantara Gg. 3',
                          category: 'Kuliner & Cemilan',
                          description: 'Toko UMKM modern berdaya kecerdasan buatan.',
                          platforms: ['instagram', 'shopee', 'whatsapp'],
                          brandVoice: 'santai',
                          level: 1,
                          xp: 50,
                          streak: 1
                        }
                      };
                      onLogin(googleSessionFallback);
                      onNavigate('onboarding');
                      setIsAuthLoading(false);
                      setAuthLoadingStep('');
                    },
                    onCancel: () => {
                      // Do nothing, close Dialog and stay on login page
                    }
                  });
                  return; // CRITICAL: Stop executing and stay on login page!
                }

                setAuthLoadingStep('Sinkronisasi PostgreSQL dengan Prisma... ⚡');
                
                // Attempt to check if user already exists in PostgreSQL
                let dbShop = null;
                try {
                  const checkRes = await fetch('/api/pixelshop/get-db-state', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: googleEmail })
                  });
                  if (checkRes.ok) {
                    const data = await checkRes.json();
                    if (data && !data.new_user && !data.db_offline) {
                      dbShop = data;
                    }
                  }
                } catch (err) {
                  console.warn("PostgreSQL offline, proceeding with local mock:", err);
                }

                await new Promise((resolve) => setTimeout(resolve, 1200));

                if (dbShop) {
                  // Direct to dashboard
                  setAuthLoadingStep('Berhasil Sinkron! Membuka Dashboard... 🎉');
                  await new Promise((resolve) => setTimeout(resolve, 600));

                  const googleSession: UserSession = {
                    email: googleEmail,
                    isLoggedIn: true,
                    shopInfo: dbShop.shopInfo
                  };
                  onLogin(googleSession);
                  onNavigate('dashboard');
                } else {
                  // Direct to onboarding
                  setAuthLoadingStep('Menyiapkan Kanvas Onboarding Anda... 🎨');
                  await new Promise((resolve) => setTimeout(resolve, 600));

                  const googleSession: UserSession = {
                    email: googleEmail,
                    isLoggedIn: true,
                    shopInfo: {
                      shopName: googleName ? `${googleName} Shop` : 'Toko Baru Saya',
                      category: 'Kuliner & Cemilan',
                      description: 'Toko UMKM modern berdaya kecerdasan buatan.',
                      platforms: ['instagram', 'shopee', 'whatsapp'],
                      brandVoice: 'santai',
                      level: 1,
                      xp: 50,
                      streak: 1
                    }
                  };
                  onLogin(googleSession);
                  onNavigate('onboarding');
                }

                setIsAuthLoading(false);
                setAuthLoadingStep('');
              }}
              className="w-full bg-[#1c1410] border border-brand-border hover:border-brand-accent/50 text-brand-text py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.1.38-2.11 2.45v2.85h3.33c1.94-1.78 3.91-4.8 3.91-8.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.33-2.85c-.93.63-2.12 1.02-3.63 1.02-2.79 0-5.15-1.89-6-4.43H3.54v2.96C5.52 21.72 8.52 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M6 13.83c-.2-.63-.32-1.3-.32-2 0-.7.12-1.37.32-2V6.87H3.54c-.65 1.28-1.54 2.87-1.54 4.96s.89 3.68 1.54 4.96l2.46-2.96z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 8.52 0 5.52 2.28 3.54 5.27l3.46 2.96c.85-2.54 3.21-4.43 6-4.43z"
                />
              </svg>
              <span>Sambungkan dengan Google OAuth</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3-Step Setup Onboarding flow
  if (activePage === 'onboarding' || (session.isLoggedIn && onboardingStep >= 1 && obShopName === '')) {
    return (
      <div className="min-h-screen bg-brand-bg relative overflow-hidden flex flex-col justify-center items-center px-4 py-8">
        {/* Glow Spheres */}
        <div className="amber-blob w-96 h-96 bg-brand-accent top-12 left-12" />
        <div className="amber-blob w-80 h-80 bg-[#B4753A] bottom-12 right-12 opacity-15" />

        <div className="w-full max-w-2xl glass-card neumorph p-8 md:p-12 relative z-10 border border-brand-accent/25">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-brand-muted mb-2 font-mono">
              <span>LANGKAH {onboardingStep} DARI 3</span>
              <span>{Math.round((onboardingStep / 3) * 100)}% SELESAI</span>
            </div>
            <div className="w-full bg-[#332518] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-accent transition-all duration-300"
                style={{ width: `${(onboardingStep / 3) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {onboardingStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center md:text-left space-y-1">
                  <span className="font-script text-3xl text-brand-accent block select-none -mb-1 rotate-[-1deg] origin-left">Langkah Awal Sukses</span>
                  <h2 className="text-3xl md:text-4xl font-display font-medium text-brand-text tracking-tight flex items-center gap-3">
                    <Store className="text-brand-accent w-8 h-8" strokeWidth={1.5} /> Kenalan Dulu Yuk!
                  </h2>
                  <p className="text-brand-muted text-sm mt-1">
                    Isi profil toko kamu untuk menyesuaikan saran caption jualan dari AI.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-brand-text mb-2 tracking-wider">
                      NAMA TOKO / BRAND <span className="text-brand-accent">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#1c1410] border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-150"
                      placeholder="Contoh: Hijab Cantik Amelia"
                      value={obShopName}
                      onChange={(e) => setObShopName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-brand-text mb-2 tracking-wider">
                      KATEGORI USAHA
                    </label>
                    <select
                      className="w-full bg-[#1c1410] border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-150"
                      value={obCategory}
                      onChange={(e) => setObCategory(e.target.value)}
                    >
                      <option value="Kuliner & Cemilan">Kuliner & Cemilan (Hot & Tasty)</option>
                      <option value="Fashion Muslim">Fashion Muslim (Syar'i & Premium)</option>
                      <option value="Kecantikan & Skincare">Kecantikan & Skincare (Glow & Natural)</option>
                      <option value="Kerajinan & Craft">Kerajinan & Craft Handmade</option>
                      <option value="Minuman Kekinian">Minuman & Kopi Milenial</option>
                      <option value="custom">✍️ Tulis Kategori Kustom Anda...</option>
                    </select>
                  </div>

                  {obCategory === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="block text-xs font-mono text-brand-text mb-2 tracking-wider">
                        KATEGORI USAHA KUSTOM
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#1c1410] border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-150"
                        placeholder="Contoh: Mainan Anak Edukatif, Suku Cadang Motor"
                        value={obCustomCategory}
                        onChange={(e) => setObCustomCategory(e.target.value)}
                      />
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-xs font-mono text-brand-text mb-2 tracking-wider">
                      DESKRIPSI SINGKAT BRAND (OPSIONAL)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-[#1c1410] border border-brand-border rounded-lg px-4 py-3 text-brand-text focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition duration-150"
                      placeholder="Jelaskan apa yang kamu jual dan keunikan tokomu..."
                      value={obDesc}
                      onChange={(e) => setObDesc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      if (!obShopName.trim()) {
                        alert('Tolong masukkan Nama Toko.');
                        return;
                      }
                      setOnboardingStep(2);
                    }}
                    className="btn-accent px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    Lanjut <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {onboardingStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="font-script text-3xl text-brand-accent block select-none -mb-1 rotate-[-1deg] origin-left">Ekosistem Pemasaran</span>
                  <h2 className="text-3xl md:text-4xl font-display font-medium text-brand-text tracking-tight flex items-center gap-3">
                    <TrendingUp className="text-brand-accent w-8 h-8" strokeWidth={1.5} /> Platform Penjualan
                  </h2>
                  <p className="text-brand-muted text-sm mt-1">
                    Pilih platform media sosial dan marketplace utama yang kamu gunakan saat jualan.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'instagram', label: 'Instagram' },
                    { id: 'tiktok', label: 'TikTok/TikTok Shop' },
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: 'shopee', label: 'Shopee' },
                    { id: 'tokopedia', label: 'Tokopedia' }
                  ].map((plat) => {
                    const active = obPlatforms.includes(plat.id);
                    return (
                      <button
                        key={plat.id}
                        onClick={() => handlePlatformToggle(plat.id)}
                        className={`p-4 rounded-xl border transition-all text-left cursor-pointer ${
                          active
                            ? 'border-brand-accent bg-brand-accent/15 text-brand-text neumorph'
                            : 'border-brand-border bg-[#1c1410] text-brand-muted hover:border-brand-accent/40'
                        }`}
                      >
                        <div className="font-semibold text-sm">{plat.label}</div>
                        <div className="text-[10px] text-brand-muted/70 mt-1">
                          {active ? '✓ Terpilih' : '+ Masukkan'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="px-6 py-3 border border-brand-border text-brand-muted rounded-lg hover:border-brand-accent/40 transition cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setOnboardingStep(3)}
                    className="btn-accent px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer"
                    disabled={obPlatforms.length === 0}
                  >
                    Lanjut <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {onboardingStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <span className="font-script text-3xl text-brand-accent block select-none -mb-1 rotate-[-1deg] origin-left">Personalisasi AI Toko</span>
                  <h2 className="text-3xl md:text-4xl font-display font-medium text-brand-text tracking-tight flex items-center gap-3">
                    <Sparkles className="text-brand-accent w-8 h-8" strokeWidth={1.5} /> Brand Voice & Produk Pertama
                  </h2>
                  <p className="text-brand-muted text-sm mt-1">
                    Tentukan gaya bicara khas (tone) tokomu dan masukkan draf produk pertamamu.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-brand-text mb-2 tracking-wider">
                      NADA BICARA TOKO (BRAND VOICE)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'santai', title: '😊 Santai & Akrab', desc: 'Kak, Bestie, sob' },
                        { id: 'formal', title: '💼 Formal & Profesional', desc: 'Bapak/Ibu, Anda' },
                        { id: 'ceria', title: '⚡ Ceria & Berenergi', desc: 'Hype, Seru, Promo!' },
                        { id: 'elegan', title: '✨ Elegan & Eksklusif', desc: 'Pilihan Khusus' },
                        { id: 'custom', title: '✍️ Gaya Bahasa Kustom', desc: 'Tulis gayamu sendiri' }
                      ].map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => setObBrandVoice(voice.id)}
                          type="button"
                          className={`p-3 rounded-lg border transition text-left cursor-pointer ${
                            obBrandVoice === voice.id
                              ? 'border-brand-accent bg-brand-accent/15 text-brand-text'
                              : 'border-brand-border bg-[#1c1410] text-brand-muted hover:border-brand-accent/20'
                          }`}
                        >
                          <div className="font-semibold text-xs text-brand-text">{voice.title}</div>
                          <div className="text-[10px] text-brand-muted mt-0.5">{voice.desc}</div>
                        </button>
                      ))}
                    </div>

                    {obBrandVoice === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1.5 mt-2"
                      >
                        <label className="block text-[10px] font-mono text-brand-muted uppercase tracking-wider">
                          NADA BICARA KUSTOM Anda
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                          placeholder="Contoh: Jaksel Gaul, Skena Indie, Emak-emak Rempong"
                          value={obCustomBrandVoice}
                          onChange={(e) => setObCustomBrandVoice(e.target.value)}
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="border-t border-brand-border/45 pt-4">
                    <h3 className="text-xs font-mono tracking-wider text-brand-accent mb-3 uppercase font-bold">📦 PRODUK PERTAMA</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono text-brand-muted mb-1">
                          NAMA PRODUK PERTAMA
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                          placeholder="Misal: Keripik Basreng Pedas Jeruk"
                          value={obFirstProduct}
                          onChange={(e) => setObFirstProduct(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-brand-muted mb-1">
                          HARGA JUAL (RP)
                        </label>
                        <input
                          type="number"
                          className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                          placeholder="Misal: 15000"
                          value={obFirstPrice}
                          onChange={(e) => setObFirstPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="px-6 py-3 border border-brand-border text-brand-muted rounded-lg hover:border-brand-accent/40 cursor-pointer"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={submitOnboarding}
                    className="btn-accent px-8 py-3 rounded-lg flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    Buka Toko Jualan Kamu! <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0a08] relative overflow-x-hidden text-brand-text">
      
      {/* SECTION 1: HERO CONTAINER (BUBBLES & GLOWING BLOB) */}
      <section className={`relative w-full pt-16 pb-24 overflow-hidden border-b border-brand-border/15 ${applySectionGradients('hero')}`}>
        {/* Interactive Antigravity Bubbles backdrop for Hero Only */}
        <InteractiveBubbles 
          onAddXP={(xpToGain) => {
            if (session.isLoggedIn && session.shopInfo) {
              const currentXp = session.shopInfo.xp;
              const nextXp = currentXp + xpToGain;
              let nextLevel = session.shopInfo.level;
              if (nextXp >= 2000) nextLevel = 5;
              else if (nextXp >= 1500) nextLevel = 4;
              else if (nextXp >= 1000) nextLevel = 3;
              else if (nextXp >= 500) nextLevel = 2;
              
              updateShopInfo({
                ...session.shopInfo,
                xp: nextXp,
                level: nextLevel
              });
            }
          }}
        />
        
        {/* Background Blobs for ambient mood */}
        <div className="amber-blob w-[450px] h-[450px] bg-brand-accent top-[-100px] left-[-100px] pointer-events-none" />
        <div className="amber-blob w-[400px] h-[400px] bg-[#B4753A] bottom-[-150px] right-[-150px] opacity-10 pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10 max-w-7xl">
          <header className="flex justify-between items-center mb-16 relative z-30">
            <div className="flex items-center gap-2 cursor-pointer font-display text-2xl font-bold text-brand-text hover:opacity-90">
              <span className="p-1.5 bg-brand-accent text-brand-bg rounded-lg">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </span>
              <span>Pixel</span><span className="font-script text-3xl text-brand-accent font-normal tracking-normal lowercase -ml-1">shop</span>
            </div>
            <button
              onClick={() => {
                setActiveTab('login');
                onNavigate('auth');
              }}
              className="px-4 py-2 border border-brand-border hover:border-brand-accent/60 hover:text-brand-text rounded-lg text-sm text-brand-muted font-medium transition hover-wave-ripple cursor-pointer"
            >
              Masuk Toko
            </button>
          </header>

          {/* Content Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left relative z-20">
            <div className="space-y-6 max-w-xl">
              <div className="flex flex-col space-y-1">
                <span className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-semibold uppercase tracking-wider">
                  ❤️ Didesain untuk UMKM Tangguh Indonesia
                </span>
                <span className="font-script text-3xl text-brand-accent pl-2 rotate-[-2deg] origin-left select-none">
                  Gemulet, Modis & Berenergi
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-brand-text tracking-tight leading-[1.05]">
                Toko kamu, <br />
                <span className="italic font-normal font-serif text-brand-accent bg-clip-text text-transparent bg-gradient-to-r from-brand-accent via-[#F28C38] to-[#EED4B7]">
                  dikerjain AI
                </span>
                <span className="text-3xl md:text-4xl block font-sans font-light text-brand-text/90 tracking-normal mt-2 lowercase">
                  bukan <span className="font-script text-5xl text-brand-accent tracking-wider font-semibold">manual</span> lagi.
                </span>
              </h1>
              <p className="text-brand-muted text-base md:text-lg">
                Atasi masalah bikin caption, analisis pasar, deskripsi e-commerce, hingga draf kalender mingguan secara instan dengan kecerdasan Google Gemini 3.5. Dapatkan sistem XP, level, dan badge pencapaian spesial agar jualan jadi asyik!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={() => {
                    setActiveTab('register');
                    onNavigate('auth');
                  }}
                  className="btn-accent hover-wave-ripple px-8 py-4 rounded-xl flex items-center justify-center gap-3 text-base shadow-xl cursor-pointer bg-brand-accent text-brand-bg font-bold"
                >
                  Mulai Gratis Sekarang <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('login');
                    onNavigate('auth');
                  }}
                  className="px-6 py-4 glass-card hover-ebb-tide rounded-xl flex items-center justify-center gap-2 text-sm text-brand-text transition duration-150 cursor-pointer"
                >
                  Login Demo Toko
                </button>
              </div>

              {/* Quick Stats Banner */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-border/45">
                <div>
                  <div className="text-xl font-bold text-brand-text">99%</div>
                  <div className="text-xs text-brand-muted">Akurasi Voice</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-text">10s</div>
                  <div className="text-xs text-brand-muted">Waktu Generate</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-text">5+</div>
                  <div className="text-xs text-brand-muted">Alat Pemasaran</div>
                </div>
              </div>
            </div>

            {/* Interactive Simulation Preview Screen - Minimalist 3D Product Showcase */}
            <div className="relative h-[500px] flex items-center justify-center perspective-1000">
              <div className="absolute inset-0 bg-brand-accent/5 rounded-[40px] blur-3xl pointer-events-none transform rotate-6" />
              
              <AnimatePresence>
                {[
                  { id: 1, title: 'AI Brand Voice Trainer', desc: 'Latih kecerdasan AI sesuai ciri khas emosi & tone unik tokomu.', tag: 'BRAND VOICE', metric: '9 Emosi Warna', emoji: '🎙️', rotateY: -15, rotateX: 10, z: 0, x: -80, y: -40, delay: 0 },
                  { id: 2, title: 'Auto Content Planner', desc: 'Jadwalkan & draf konten promosi sebulan penuh dalam 10 detik.', tag: 'PLANNER', metric: 'Google Calendar Sync', emoji: '📅', rotateY: 20, rotateX: 5, z: -50, x: 100, y: 30, delay: 0.2 },
                  { id: 3, title: 'Smart Caption Copy', desc: 'Ubah ide draf mentah menjadi sales copy memikat berdaya konversi tinggi.', tag: 'COPYWRITING', metric: 'Konversi Tinggi', emoji: '✍️', rotateY: 5, rotateX: -15, z: 80, x: 20, y: 70, delay: 0.4 }
                ].map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8, rotateY: 0, rotateX: 0, x: 0, y: 0, z: -100 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotateY: item.rotateY, 
                      rotateX: item.rotateX, 
                      x: item.x, 
                      y: item.y, 
                      z: item.z 
                    }}
                    transition={{
                      duration: 1.2,
                      delay: item.delay,
                      type: 'spring',
                      bounce: 0.4
                    }}
                    whileHover={{ scale: 1.05, rotateY: 0, rotateX: 0, z: 100, zIndex: 50, transition: { duration: 0.3 } }}
                    className="absolute w-64 glass-card p-5 rounded-2xl border border-brand-accent/20 cursor-pointer shadow-2xl backdrop-blur-xl bg-[#1c1410]/85 preserve-3d"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="flex justify-between items-start mb-4 translate-z-12">
                      <span className="text-[9px] font-mono font-bold px-2 py-1 bg-brand-accent/20 text-brand-accent rounded uppercase tracking-widest">{item.tag}</span>
                      <Sparkles className="w-4 h-4 text-brand-accent" />
                    </div>
                    
                    <div className="h-28 w-full bg-gradient-to-br from-brand-accent/15 to-brand-bg rounded-xl mb-4 flex items-center justify-center translate-z-20 border border-brand-border/30 relative overflow-hidden">
                       <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(212,149,106,0.4)] animate-pulse">{item.emoji}</span>
                    </div>

                    <div className="space-y-1 translate-z-12">
                      <span className="text-[9px] font-mono text-brand-muted tracking-wider uppercase block font-semibold">{item.metric}</span>
                      <h3 className="font-extrabold text-sm text-brand-text truncate">{item.title}</h3>
                      <p className="text-[10px] text-brand-muted/90 leading-snug">{item.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-border/30 flex justify-between items-center translate-z-12">
                      <div className="h-1.5 w-16 bg-[#33251a] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-full" />
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">FITUR READY</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute -bottom-8 bg-[#261e14] border border-brand-border/40 px-6 py-3 rounded-full text-xs font-mono font-bold text-brand-text shadow-xl flex items-center gap-3 z-40"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>PixelShop AI Siap Mengoptimalkan Bisnis Anda</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: AI FEATURES AREA (CONSTELLATION WEB BACKGROUND) */}
      <section className="relative w-full py-32 border-b border-brand-border/15 overflow-hidden bg-[#0e0a08]">
        {/* Dynamic Connected Node Grid backdrop */}
        <GeometricParticles />

        <div className="container mx-auto px-4 max-w-7xl relative z-10 space-y-16">
          <div className="space-y-4 text-center md:text-left max-w-2xl mx-auto md:mx-0">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-bold block">Sirkuit Terotomatisasi</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-brand-text leading-tight tracking-tight">
              Kecerdasan Skala Penuh<br />dalam <span className="font-script text-5xl text-brand-accent tracking-normal font-normal">Satu Kanvas.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-20">
            {/* Bento Grid Item 1 (Large) */}
            <div className="md:col-span-8 glass-card border-brand-accent/20 bg-gradient-to-br from-[#1a120f]/90 to-[#0e0a08]/90 overflow-hidden group">
              <div className="p-8 h-full flex flex-col justify-between">
                <div className="space-y-3 max-w-md">
                  <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mb-6">
                    <ShoppingBag className="w-6 h-6 text-brand-accent" />
                  </div>
                  <h3 className="text-2xl font-sans font-bold text-brand-text">Platform Agnostik Generasi</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">Formulasikan puluhan kombinasi naskah (caption, script carousel) disesuaikan persis untuk ritme engagement Instagram, keramaian TikTok, maupun etalase WhatsApp katalog.</p>
                </div>
              </div>
            </div>

            {/* Bento Grid Item 2 */}
            <div className="md:col-span-4 glass-card border-brand-border/40 hover:border-brand-accent/30 transition-all p-8 flex flex-col justify-end min-h-[280px]">
              <div className="space-y-2">
                <TrendingUp className="w-6 h-6 text-brand-accent mb-4" />
                <h3 className="text-lg font-bold text-brand-text">SEO Deskripsi</h3>
                <p className="text-xs text-brand-muted leading-relaxed">Struktur penjualan terintegrasi kaidah pencarian mesin E-Commerce lokal.</p>
              </div>
            </div>

            {/* Bento Grid Item 3 */}
            <div className="md:col-span-4 glass-card border-brand-border/40 hover:border-brand-accent/30 transition-all p-8 flex flex-col justify-end min-h-[280px]">
              <div className="space-y-2">
                <Calendar className="w-6 h-6 text-brand-accent mb-4" />
                <h3 className="text-lg font-bold text-brand-text">Kalender Cerdas</h3>
                <p className="text-xs text-brand-muted leading-relaxed">Konstruksi 7-hari pemetaan jam prime rilis digital dalam sekejap klik.</p>
              </div>
            </div>

            {/* Bento Grid Item 4 (Medium) */}
            <div className="md:col-span-8 glass-card border-brand-border/40 bg-gradient-to-tr from-[#1a120f]/50 to-transparent p-8 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-8 items-center">
                <div className="space-y-3">
                  <Volume2 className="w-6 h-6 text-brand-accent mb-2" />
                  <h3 className="text-xl font-bold text-brand-text">Sonar Pesaing</h3>
                  <p className="text-xs text-brand-muted leading-relaxed">Analisa metrik pembeda (USP) berotasi merespon kelemahan narasi terberat brand kompetitor yang selevel denganmu.</p>
                </div>
                <div className="pl-6 border-l border-brand-border/30 space-y-3">
                  <span className="block text-[10px] font-mono text-brand-muted uppercase">Voice Dictation</span>
                  <div className="bg-[#17110e] border border-brand-border/40 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center animate-pulse shrink-0"><Mic className="w-4 h-4 text-brand-accent" /></div>
                    <span className="text-[10px] text-emerald-400/80 font-mono italic">Merekam instruksi CS darurat...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CARA KERJA (FLUID VECTOR WAVES BACKDROP) */}
      <section className={`relative w-full py-28 border-b border-brand-border/15 overflow-hidden ${applySectionGradients('howItWorks')}`}>
        {/* Oceans currents sand wave animation */}
        <InteractiveWaves />

        <div className="container mx-auto px-4 max-w-6xl relative z-10 space-y-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            <span className="font-script text-3xl text-brand-accent block select-none -mb-1 rotate-[-1deg] origin-left">Sederhana & Mudah</span>
            <h2 className="text-3xl md:text-5xl font-serif font-medium text-brand-text mt-2 tracking-tight">Cara Kerja PixelShop</h2>
            <p className="text-brand-muted text-xs font-mono uppercase tracking-widest">Rute Tahapan Sukses UMKM Naik Kelas</p>
          </motion.div>

          {/* Alternating Route Layout */}
          <div className="relative mt-20 text-left">
            {/* Central Vertical Timeline Route Line */}
            <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-brand-accent/5 via-brand-accent/50 to-brand-accent/5 -translate-x-1/2 hidden md:block" />

            <div className="space-y-16 md:space-y-28">
              {[
                {
                  step: '01',
                  badge: 'TAHAP PERTAMA',
                  title: 'Daftar & Konfigurasi Toko',
                  desc: 'Masukkan kategori jualanmu, link platform serta brand voice jualan yang kamu inginkan.',
                  detail: 'Sistem pintar kami secara otomatis meramu ramuan kata sapaan paling memikat yang sesuai dengan target demografis audiens tokomu.',
                  visual: (
                    <div className="p-5 bg-[#17110e] rounded-2xl border border-brand-border/60 shadow-lg space-y-3 font-sans">
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                        <span className="text-[10px] text-brand-accent font-mono font-bold">INFO AKUN TOKO</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-brand-muted">Nama Brand:</span> <strong className="text-brand-text">Basreng Remedi</strong>
                        </div>
                        <div>
                          <span className="text-brand-muted">Kategori:</span> <strong className="text-brand-text">Camilan Tradisional / Pedas</strong>
                        </div>
                        <div>
                          <span className="text-brand-muted">Brand Voice:</span> <span className="bg-brand-accent/10 border border-brand-accent/30 text-brand-accent px-1.5 py-0.5 rounded text-[10px]">Friendly / Gaul Sunda</span>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  step: '02',
                  badge: 'TAHAP KEDUA',
                  title: 'Ajarkan Karakter AI Kami',
                  desc: 'Latih AI dengan preferensi kata favorit, sapaan khas, serta hindari kata tabu tokomu.',
                  detail: 'Tambahkan instruksi spesifik seperti "jangan sebut kata murah" atau "selalu tambahkan sapaan BESTIE". AI kami akan patuh seumur hidup.',
                  visual: (
                    <div className="p-5 bg-[#17110e] rounded-2xl border border-brand-border/60 shadow-lg space-y-3 font-sans">
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                        <span className="text-[10px] text-brand-accent font-mono font-bold">LATIHAN PARAMETRIKS</span>
                        <span className="text-[10px] text-emerald-400 font-mono">AKTIF</span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2.5 bg-brand-bg rounded-lg border border-brand-border/30 text-[11px] leading-relaxed italic text-brand-muted">
                          "Tolong ganti kata 'diskon' jadi 'promo cuci gudang mantap' ya!"
                        </div>
                        <div className="p-2.5 bg-brand-accent/5 rounded-lg border border-brand-accent/20 text-[11px] leading-relaxed text-brand-text">
                          <span className="text-brand-accent font-semibold">Respon Asisten AI:</span> Siap dimengerti bos! Semua copywriting promosi mulai sekarang dimodifikasi otomatis. ✨
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  step: '03',
                  badge: 'TAHAP KETIGA',
                  title: 'Dapatkan Konten Siap Pakai',
                  desc: 'Peta kalender instan dengan point XP gakeep, level jualan level up sekelas legenda UMKM!',
                  detail: 'Salin copywriting, buat slide draf Instagram, atau buat feed marketplace hanya dalam sekali klik. Rasakan asyiknya berbisnis dengan reward XP tergamifikasi.',
                  visual: (
                    <div className="p-5 bg-[#17110e] rounded-2xl border border-brand-border/60 shadow-lg space-y-3 font-sans">
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                        <span className="text-[10px] text-brand-accent font-mono font-bold">HASIL GENERASI KILAT</span>
                        <span className="text-brand-accent font-mono text-[10px]">SUCCESS +150XP</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 p-2 bg-brand-bg rounded border border-brand-border/30 text-xs text-brand-text">
                          <span className="text-brand-accent font-bold">1</span>
                          <span className="truncate">Feed IG: "Camilan pedas renyah daun jeruk..."</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-2 bg-brand-bg rounded border border-brand-border/30 text-xs text-brand-text">
                          <span className="text-brand-accent font-bold">2</span>
                          <span className="truncate">Story WA: "Stok basreng nipis bestie!"</span>
                        </div>
                      </div>
                    </div>
                  )
                }
              ].map((s, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
                  >
                    
                    {/* Content Block (Left on Even, Right on Odd) */}
                    <div className={`space-y-4 md:px-8 ${isEven ? 'md:order-1 md:text-right' : 'md:order-2 md:text-left'}`}>
                      <div className="inline-flex py-1 px-3 bg-brand-accent/15 text-brand-accent text-[10px] font-mono font-black rounded-lg uppercase tracking-wider">
                        {s.badge}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif font-medium text-brand-text">
                        {s.step}. {s.title}
                      </h3>
                      <p className="text-sm text-brand-muted leading-relaxed">
                        {s.desc}
                      </p>
                      <p className={`text-xs text-brand-muted/75 leading-relaxed border-brand-accent/30 pl-3 ${isEven ? 'md:border-r-2 md:border-l-0 md:pr-3 md:pl-0' : 'md:border-l-2 md:pl-3'}`}>
                        {s.detail}
                      </p>
                    </div>

                    {/* Interactive Graphics Block (Right on Even, Left on Odd) */}
                    <div className={`relative z-10 ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                      <div className="absolute inset-0 bg-brand-accent/5 rounded-2xl blur-xl pointer-events-none" />
                      <div className="relative glass-card hover-ebb-tide p-2 rounded-2xl cursor-pointer">
                        {s.visual}
                      </div>
                    </div>

                    {/* Centered Timeline Circle node bullet */}
                    <div className="absolute left-8 md:left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-25 hidden md:block">
                      <div className="h-10 w-10 rounded-full bg-[#110c0a] border-2 border-brand-accent flex items-center justify-center text-sm font-bold font-mono text-brand-accent shadow-[0_0_15px_rgba(212,149,106,0.35)] hover:scale-110 transition duration-200">
                        {s.step}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TESTIMONIAL PANEL & FOOTER AREA (EBB HOVER GLASS) */}
      <section className={`relative w-full py-28 overflow-hidden ${applySectionGradients('testimonials')}`}>
        {/* Decorative background lights */}
        <div className="amber-blob w-96 h-96 bg-brand-accent/15 -bottom-20 -left-20 opacity-20 pointer-events-none" />
        <div className="amber-blob w-80 h-80 bg-brand-accent/10 top-20 -right-20 opacity-15 pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center space-y-4 mb-12">
          <span className="font-script text-3xl text-brand-accent block select-none rotate-[-1deg]">Testimoni Jawara</span>
          <h2 className="text-3xl md:text-5xl font-serif font-medium text-brand-text">Kisah Sukses Pejuang Toko</h2>
          <p className="text-sm text-brand-muted max-w-xl mx-auto">
            Dari kuliner khas Bandung hingga kerajinan ukir Bali, dengar langsung bagaimana AI PixelShop mengubah nasib konten jualan mereka dalam hitungan detik.
          </p>
        </div>

        {/* Dynamic Dual-Track Auto Scrolling Marquee Containers */}
        <div className="space-y-8 py-6 w-full overflow-hidden relative z-20 animate-pause-hover">
          {/* Row 1: Scrolling Left */}
          <div className="w-full overflow-hidden relative py-2">
            {/* Soft faded edge overlays to look clean and premium */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0e0a08] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0e0a08] to-transparent z-10 pointer-events-none" />
            
            <div className="flex gap-6 w-max animate-marquee-left">
              {/* Render 5 testimonials twice for seamless wrap */}
              {[...dummyTestimonials.slice(0, 5), ...dummyTestimonials.slice(0, 5)].map((t, idx) => (
                <div 
                  key={`t1-${idx}`}
                  className="w-[290px] md:w-[350px] shrink-0 p-5 md:p-6 rounded-2xl glass-card border border-brand-accent/15 bg-brand-surface/20 hover:border-brand-accent/50 hover:bg-brand-surface/40 transition duration-300 relative overflow-hidden group select-text"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-xl pointer-events-none group-hover:bg-brand-accent/10 transition-colors" />
                  
                  {/* Top Row: stars and category */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-mono bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      {t.tag}
                    </span>
                    <div className="text-amber-500 font-bold text-xs">
                      {"★".repeat(t.rating)}
                    </div>
                  </div>

                  {/* Title & Quote */}
                  <h4 className="font-bold text-sm text-brand-text mb-1.5 group-hover:text-brand-accent transition-colors">{t.title}</h4>
                  <p className="text-[11px] text-brand-muted/90 leading-relaxed italic mb-4 line-clamp-3">
                    "{t.quote}"
                  </p>

                  {/* Divider line */}
                  <div className="h-[1px] bg-brand-border/15 my-3" />

                  {/* Footer Author Profile */}
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-accent/30 to-brand-surface border border-brand-accent/30 flex items-center justify-center text-xs font-black font-mono text-brand-accent">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-brand-text flex items-center gap-1">
                        {t.name}
                        <CheckCircle className="h-3 w-3 text-emerald-400 fill-emerald-400/10" />
                      </div>
                      <div className="text-[10px] text-brand-muted">
                        {t.product} • {t.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Scrolling Right */}
          <div className="w-full overflow-hidden relative py-2">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0e0a08] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0e0a08] to-transparent z-10 pointer-events-none" />
            
            <div className="flex gap-6 w-max animate-marquee-right">
              {/* Render another 5 testimonials twice for seamless wrap */}
              {[...dummyTestimonials.slice(5, 10), ...dummyTestimonials.slice(5, 10)].map((t, idx) => (
                <div 
                  key={`t2-${idx}`}
                  className="w-[290px] md:w-[350px] shrink-0 p-5 md:p-6 rounded-2xl glass-card border border-brand-accent/15 bg-brand-surface/20 hover:border-brand-accent/50 hover:bg-brand-surface/40 transition duration-300 relative overflow-hidden group select-text"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-xl pointer-events-none group-hover:bg-brand-accent/10 transition-colors" />
                  
                  {/* Top Row: stars and category */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-mono bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      {t.tag}
                    </span>
                    <div className="text-amber-500 font-bold text-xs">
                      {"★".repeat(t.rating)}
                    </div>
                  </div>

                  {/* Title & Quote */}
                  <h4 className="font-bold text-sm text-brand-text mb-1.5 group-hover:text-brand-accent transition-colors">{t.title}</h4>
                  <p className="text-[11px] text-brand-muted/90 leading-relaxed italic mb-4 line-clamp-3">
                    "{t.quote}"
                  </p>

                  {/* Divider line */}
                  <div className="h-[1px] bg-brand-border/15 my-3" />

                  {/* Footer Author Profile */}
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-accent/30 to-brand-surface border border-brand-accent/30 flex items-center justify-center text-xs font-black font-mono text-brand-accent">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-brand-text flex items-center gap-1">
                        {t.name}
                        <CheckCircle className="h-3 w-3 text-emerald-400 fill-emerald-400/10" />
                      </div>
                      <div className="text-[10px] text-brand-muted">
                        {t.product} • {t.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flagship Testimonial Highlight below the continuous movement */}
        <div className="container mx-auto px-4 max-w-5xl relative z-10 mt-16">
          <div className="bg-brand-surface border border-brand-border/45 rounded-3xl p-8 md:p-12 text-left relative overflow-hidden glass-card hover-ebb-tide cursor-pointer z-20">
            <div className="amber-blob w-72 h-72 bg-brand-accent top-[-40px] right-[-40px] opacity-10 pointer-events-none" />
            <div className="max-w-3xl space-y-6 relative z-10">
              <span className="text-brand-accent font-mono text-xs uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-accent animate-ping" />
                SOKONGAN WARGA JAWARA
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-brand-text leading-tight font-serif">
                "Bikin konten jualan gak pusing lagi. Kemarin iseng post caption dari PixelShop di Instagram Reels, viewnya melonjak 10x lipat dan Basreng laku keras!"
              </h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-accent text-brand-bg font-black flex items-center justify-center font-mono text-xs">FR</div>
                <div>
                  <div className="font-bold text-brand-text flex items-center gap-1">
                    Farhan Basreng Remedi
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-400 fill-emerald-400/10" />
                  </div>
                  <div className="text-xs text-brand-muted">Bakso Goreng Jeruk Purut, Bandung</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Area */}
          <footer className="mt-24 pt-8 border-t border-brand-border/40 text-center text-xs text-brand-muted space-y-2">
            <div>© 2026 PixelShop — "Toko kamu, dikerjain AI." Made with Google Gemini 3.5.</div>
            <div className="text-brand-accent/65">Peduli UMKM Indonesia • Terjangkau • Canggih • Seru</div>
          </footer>
        </div>
      </section>

      {/* Auth Screen Modal Render */}
      <AnimatePresence>
        {onNavigate === undefined ? null : null}
      </AnimatePresence>
    </div>
  );
}
