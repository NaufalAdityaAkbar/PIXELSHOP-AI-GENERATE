/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  TrendingUp,
  Award,
  Calendar,
  Zap,
  Package,
  ChevronRight,
  Plus,
  Compass,
  MessageSquare,
  Volume2,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { PageId, ShopInfo, CalendarEvent, Achievement } from '../types';
import { getLevelName, getLevelRange } from '../utils';
import InteractiveBubbles from './InteractiveBubbles';

interface DashboardViewProps {
  shopInfo: ShopInfo;
  productsCount: number;
  contentsCount: number;
  events: CalendarEvent[];
  achievements: Achievement[];
  onNavigate: (page: PageId) => void;
  onPostCheck: (eventId: string) => void;
  onAddXP?: (amount: number, message: string) => void;
}

export default function DashboardView({
  shopInfo,
  productsCount,
  contentsCount,
  events,
  achievements,
  onNavigate,
  onPostCheck,
  onAddXP
}: DashboardViewProps) {
  const { percent, max } = getLevelRange(shopInfo.xp);
  const currentLevelLabel = getLevelName(shopInfo.xp);

  // Active / scheduled events for today
  const upcomingEvents = events.filter((ev) => ev.status !== 'done').slice(0, 3);
  const unlockedAchievements = achievements.filter((ach) => ach.unlocked).slice(0, 3);

  // Dynamic 7-day streak labels matching past 7 days
  const streakDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const cardVariant = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Hero Grid - Ember Gold Glass Box */}
      <motion.div variants={cardVariant} className="glass-card p-5 sm:p-6 md:p-8 relative overflow-hidden neumorph border border-brand-accent/20 cursor-crosshair">
        <InteractiveBubbles onAddXP={(xp) => onAddXP && onAddXP(xp, `🫧 Gelembung pecah! (+${xp} XP)`)} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3 w-full">
            <div className="flex flex-col space-y-0.5">
              <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Toko Kamu Sedang Aktif
              </span>
              <span className="font-script text-xl sm:text-2xl text-brand-accent pl-1 origin-left select-none">
                Semangat pagi, Mitra UMKM Tangguh!
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3.5xl md:text-4xl font-display font-medium text-brand-text tracking-tight">
              Selamat Datang, <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-[#EED4B7]">{shopInfo.shopName}</span>! 👋
            </h1>
            <p className="text-xs text-brand-muted max-w-xl">
              Kategori: <strong className="text-brand-text">{shopInfo.category}</strong> • Voice: <strong className="text-brand-text capitalize">{shopInfo.brandVoice}</strong>. Pantau metrik jualanmu dan gunakan AI untuk melipatgandakan omzet jualan hari ini.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#1c1410] border border-brand-border/40 px-4 py-3 rounded-xl shrink-0 w-full sm:w-auto self-stretch sm:self-auto justify-center sm:justify-start">
            <div className="p-2.5 bg-brand-accent/25 rounded-lg text-brand-accent">
              <Zap className="w-5 h-5 fill-brand-accent" />
            </div>
            <div>
              <div className="text-xl font-black text-brand-text">{shopInfo.streak} Hari</div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#8AC98A] font-bold">● STREAK AKTIF</div>
            </div>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="mt-8 pt-6 border-t border-brand-border/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-[#B4753A] text-brand-bg text-xs font-black rounded-lg">
                LEVEL {shopInfo.level}
              </span>
              <span className="text-sm font-bold text-brand-text tracking-wide uppercase">
                {currentLevelLabel}
              </span>
            </div>
            <div className="text-xs text-brand-muted font-mono">
              {shopInfo.xp} XP / {max} XP (Tingkat Berikutnya)
            </div>
          </div>

          <div className="w-full bg-[#1c1410] h-3.5 rounded-full border border-brand-border/30 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#B4753A] to-brand-accent rounded-full transition-all duration-300 relative"
              style={{ width: `${percent}%` }}
            >
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Numerical Stats Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          {
            icon: <Compass className="w-5 h-5 text-brand-accent" />,
            label: 'KONTEN YANG DIBUAT',
            value: `${contentsCount} Konten`,
            desc: 'Dibuat lewat bantuan tools AI'
          },
          {
            icon: <Package className="w-5 h-5 text-brand-accent" />,
            label: 'PRODUK AKTIF',
            value: `${productsCount} Produk`,
            desc: 'Terdaftar di katalog tokomu'
          },
          {
            icon: <Award className="w-5 h-5 text-brand-accent" />,
            label: 'PENCAPAIAN TERBUKA',
            value: `${achievements.filter((a) => a.unlocked).length} Badge`,
            desc: 'Dari total 6 tantangan eksklusif'
          }
        ].map((stat, i) => (
          <motion.div variants={cardVariant} key={i} className="glass-card p-6 flex items-start gap-4">
            <div className="p-3 bg-[#332518] rounded-xl">{stat.icon}</div>
            <div className="space-y-1">
              <span className="block text-[10px] font-mono tracking-widest text-brand-muted">{stat.label}</span>
              <span className="block text-2xl font-extrabold text-brand-text">{stat.value}</span>
              <span className="block text-xs text-brand-muted/75">{stat.desc}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Content - Tools Shortcuts and Feed Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shortcuts for 5 AI Tools (Occupies 2 Cols in desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-serif font-medium text-brand-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-accent animate-pulse" strokeWidth={1.5} /> Pilih Jalan Pintas Alat AI
            </h2>
            <span className="text-xs text-brand-muted">Generasi Instan + XP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: 'caption_tool',
                title: 'Caption Generator',
                desc: 'Buat 3 variasi caption medsos sekaligus lengkap dengan CTA dan emoji jualan.',
                xp: '+10 XP',
                badge: 'Populer'
              },
              {
                id: 'description_tool',
                title: 'Marketplace Description',
                desc: 'Susun deskripsi e-commerce SEO-friendly dengan daftar keyword strategis.',
                xp: '+10 XP',
                badge: 'Praktis'
              },
              {
                id: 'content_plan_tool',
                title: 'Rencana Konten Mingguan',
                desc: 'AI generate 7 ide konten kreatif mingguan langsung dalam satu klik.',
                xp: '+25 XP',
                badge: 'Spesial'
              },
              {
                id: 'chat_reply_tool',
                title: 'Template Balas Chat CS',
                desc: 'Generate draf balasan keluhan, nego harga, tawar ongkir instan.',
                xp: '+5 XP',
                badge: 'Ramah'
              },
              {
                id: 'competitor_tool',
                title: 'Analisis Kompetitor',
                desc: 'Analisis gap pasar, temukan 5 Unique Selling Point produkmu dari saingan.',
                xp: '+15 XP',
                badge: 'Strategis'
              }
            ].map((tool) => (
              <motion.div
                variants={cardVariant}
                key={tool.id}
                onClick={() => onNavigate(tool.id as PageId)}
                className="glass-card p-5 glass-item-hover cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex px-1.5 py-0.5 rounded bg-brand-accent/20 text-brand-accent text-[9px] font-mono uppercase font-bold">
                      {tool.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#8AC98A]">{tool.xp}</span>
                  </div>
                  <h3 className="font-bold text-base text-brand-text group-hover:text-brand-accent transition">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">{tool.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-accent mt-4 group-hover:translate-x-1 transition duration-150">
                  Mulai Generate <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}

            {/* AI Trainer Call to Action */}
            <motion.div
              variants={cardVariant}
              onClick={() => onNavigate('ai_trainer')}
              className="glass-card p-5 bg-gradient-to-br from-[#332518] to-brand-bg hover:from-[#47301c] cursor-pointer rounded-2xl border-brand-accent/30 group flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex px-1.5 py-0.5 rounded bg-white/10 text-brand-text text-[9px] font-mono uppercase font-bold">
                  FITUR UNGGULAN ✨
                </span>
                <h3 className="font-extrabold text-base text-brand-accent mt-2 group-hover:scale-101 duration-150">
                  Latih AI Toko Kamu!
                </h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Ajarkan sapaan andalan, kata tabu, tingkat formalitas, dan lampirkan contoh caption jualan favoritmu demi menyempurnakan hasil jaya.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-brand-text mt-4">
                Buka AI Trainer Master <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>

          {/* Activity 7-day streak grid */}
          <motion.div variants={cardVariant} className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-brand-text">Aktivitas Mingguan Jualan Tokamu</h3>
                <p className="text-xs text-brand-muted">Cetak streak agar jualan makin bersemangat!</p>
              </div>
              <span className="p-1 px-2.5 bg-brand-accent/15 border border-brand-accent/35 rounded-full text-brand-accent font-mono text-[10px] font-bold">
                Level Jualan Pro
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-3 text-center">
              {streakDays.map((sd, index) => {
                // mock first 3 days logged in, last 4 not yet or simulated active based on streak
                const isLogged = index < shopInfo.streak;
                return (
                  <div key={index} className="space-y-1.5">
                    <div
                      className={`mx-auto w-8.5 h-8.5 xs:w-9.5 xs:h-9.5 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                        isLogged
                          ? 'bg-brand-accent text-brand-bg font-bold shadow-lg neumorph scale-102 xs:scale-105'
                          : 'bg-[#1c1410] border border-brand-border/40 text-brand-muted text-[11px] sm:text-xs'
                      }`}
                    >
                      {isLogged ? <CheckCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.5]" /> : sd}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-brand-muted/70 font-mono">{sd}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Upcoming events / Achievements overview */}
        <div className="space-y-6">
          {/* Konten Terjadwal Hari Ini */}
          <motion.div variants={cardVariant} className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-brand-border/30 pb-3">
              <h3 className="font-serif font-medium text-sm text-brand-text flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-accent" strokeWidth={1.5} /> Jadwal Posting Aktif
              </h3>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-0.5"
              >
                Lihat Kalender
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="text-2xl">📆</div>
                <div className="text-xs text-brand-muted">Tidak ada jadwal terdekat.</div>
                <button
                  onClick={() => onNavigate('content_plan_tool')}
                  className="btn-accent px-3 py-1.5 rounded text-xs"
                >
                  Generate Plan Baru
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 bg-[#1c1410] rounded-xl border border-brand-border/40 space-y-2 relative group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase font-mono text-brand-accent">
                        {ev.platform} • {ev.format}
                      </span>
                      <span className="text-[10px] text-brand-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ev.time}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-brand-text line-clamp-1">{ev.title}</div>
                    <p className="text-[11px] text-brand-muted line-clamp-2 italic">
                      "{ev.caption || 'Belum ada konten copy jualan'}"
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-brand-border/20">
                      <span className="text-[9px] font-mono text-amber-500/90 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                        ⌛ TERJADWAL
                      </span>
                      <button
                        onClick={() => onPostCheck(ev.id)}
                        className="px-2 py-1 bg-brand-success text-brand-bg rounded font-mono font-bold text-[9px] hover:scale-103 transition"
                      >
                        TANDAI POSTED (+20 XP)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Achievements Unlocked sidebar */}
          <motion.div variants={cardVariant} className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-brand-border/30 pb-3">
              <h3 className="font-serif font-medium text-sm text-brand-text flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-accent" strokeWidth={1.5} /> Badge Pencapaianmu
              </h3>
              <button
                onClick={() => onNavigate('achievements')}
                className="text-xs font-bold text-brand-accent hover:underline"
              >
                Semua ({achievements.length})
              </button>
            </div>

            <div className="space-y-3">
              {achievements.slice(0, 3).map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition ${
                    ach.unlocked
                      ? 'bg-brand-accent/10 border-brand-accent/30'
                      : 'bg-[#1c1410] border-brand-border/30 opacity-70'
                  }`}
                >
                  <div className="text-2xl p-2 bg-[#332518] rounded-xl">{ach.title.split(' ')[0]}</div>
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-xs text-brand-text flex items-center justify-between">
                      <span>{ach.title.split(' ').slice(1).join(' ')}</span>
                      {ach.unlocked && (
                        <span className="text-[9px] font-bold text-[#8AC98A] uppercase font-mono">
                          TERSEDIA
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-brand-muted line-clamp-1">{ach.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
