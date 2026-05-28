/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  CheckCircle,
  Copy,
  Trash2,
  Award,
  BookOpen,
  Sliders,
  Sparkles,
  Volume2,
  Store,
  Compass,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Check,
  AlertCircle,
  Brain,
  Grid,
  Search,
  Settings,
  X
} from 'lucide-react';
import { CalendarEvent, GeneratedContent, Achievement, AITrainerSettings, ShopInfo, PageId } from '../types';
import { formatPriceIDR } from '../utils';

// ============================================
// 1. CALENDAR VIEW COMPONENT
// ============================================
interface CalendarViewProps {
  events: CalendarEvent[];
  onCheckPost: (id: string) => void;
  onReschedule: (id: string, newDate: string, newTime: string) => void;
  onDeleteEvent: (id: string) => void;
  onNavigate: (p: PageId) => void;
}

export function CalendarView({
  events,
  onCheckPost,
  onReschedule,
  onDeleteEvent,
  onNavigate
}: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  // Filter events by selected status
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'done'>('all');

  const filtered = events.filter((ev) => {
    if (filter === 'scheduled') return ev.status === 'scheduled' || ev.status === 'draft';
    if (filter === 'done') return ev.status === 'done';
    return true;
  });

  const triggerOpenReschedule = (ev: CalendarEvent) => {
    setSelectedEvent(ev);
    setNewDate(ev.date);
    setNewTime(ev.time);
    setIsRescheduleOpen(true);
  };

  const saveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent && newDate) {
      onReschedule(selectedEvent.id, newDate, newTime || '12:00');
      setIsRescheduleOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-col space-y-0.5">
            <span className="font-script text-3xl text-brand-accent block select-none rotate-[-1deg] origin-left">Penjadwalan Otomatis</span>
            <h1 className="text-2xl md:text-3xl font-serif font-medium text-brand-text tracking-tight flex items-center gap-2.5">
              <Calendar className="text-brand-accent w-7 h-7" strokeWidth={1.5} /> Kalender Kerja Konten
            </h1>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Pantau dan eksekusi jadwal postingan jualanmu di sini. Lakukan check-off untuk memperoleh XP + Streak!
          </p>
        </div>

        <div className="flex gap-1.5 bg-[#261e14] border border-brand-border/40 p-1.5 rounded-lg">
          {(['all', 'scheduled', 'done'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-1.5 rounded text-xs capitalize transition cursor-pointer font-bold ${
                filter === opt
                  ? 'bg-brand-accent text-brand-bg shadow'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              {opt === 'all' ? 'Semua' : opt === 'scheduled' ? 'Terjadwal' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center text-brand-muted space-y-4">
          <div className="text-5xl">📆</div>
          <h3 className="font-bold text-base text-brand-text">Belum ada agenda terdaftar</h3>
          <p className="text-xs max-w-sm mx-auto">
            Gunakan Weekly Content Plan AI Tool untuk menyusun rangkaian kalender jualan bulananmu secara otomatis.
          </p>
          <button
            onClick={() => onNavigate('content_plan_tool')}
            className="btn-accent px-4 py-2 rounded text-xs inline-flex items-center gap-1"
          >
            Generate Jadwal Sekarang <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ev) => {
            const isDone = ev.status === 'done';
            return (
              <div
                key={ev.id}
                className={`glass-card p-6 flex flex-col justify-between neumorph relative overflow-hidden transition ${
                  isDone
                    ? 'border-brand-success/30 bg-[#1c2419]/35 opacity-90'
                    : 'border-brand-border/30 hover:border-brand-accent/30'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2.5 py-1 rounded text-[9px] font-mono tracking-wider font-extrabold uppercase ${
                        ev.platform === 'instagram'
                          ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                          : ev.platform === 'tiktok'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : ev.platform === 'whatsapp'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20'
                      }`}
                    >
                      {ev.platform} • {ev.format}
                    </span>

                    <span className="text-[10px] font-mono text-brand-muted flex items-center gap-1 font-semibold bg-[#1c1410] px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5" /> {ev.time}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-mono text-brand-muted">{ev.date}</div>
                    <h3 className="font-extrabold text-sm text-brand-text">{ev.title}</h3>
                  </div>

                  <p className="text-xs text-brand-muted/90 italic leading-relaxed bg-[#1c1410]/50 p-3 rounded border border-brand-border/10 line-clamp-3">
                    "{ev.caption || 'Belum ada copy konten jualan.'}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-border/30 flex justify-between items-center gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => triggerOpenReschedule(ev)}
                      disabled={isDone}
                      className="p-1 px-2.5 bg-[#47301c]/40 hover:bg-[#47301c] text-[10px] text-brand-accent border border-brand-accent/20 rounded font-bold transition cursor-pointer disabled:opacity-40"
                    >
                      Atur Ulang
                    </button>
                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="p-1.5 hover:bg-red-500/10 text-brand-muted hover:text-red-400 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isDone ? (
                    <span className="text-[10px] text-[#8AC98A] font-black uppercase font-mono flex items-center gap-1 bg-[#8AC98A]/10 px-2 py-1 rounded">
                      ✓ POSTED (+20 XP)
                    </span>
                  ) : (
                    <button
                      onClick={() => onCheckPost(ev.id)}
                      className="px-3 py-1.5 bg-brand-success text-brand-bg rounded font-mono font-black text-[10px] hover:scale-103 transition cursor-pointer"
                    >
                      TANDAI POSTED (+20 XP)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal Backdrop */}
      <AnimatePresence>
        {isRescheduleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setIsRescheduleOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 md:p-8 w-full max-w-sm relative z-10 border border-brand-accent/40"
            >
              <h3 className="font-extrabold text-base text-brand-text mb-4">🗓️ Reschedule Postingan</h3>
              <form onSubmit={saveReschedule} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-brand-muted mb-1">TANGGAL POSTBARU</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-brand-muted mb-1">JAM POSTBARU</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text"
                    placeholder="Contoh: 12:30"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsRescheduleOpen(false)}
                    className="px-3 py-1.5 bg-[#332518] text-brand-muted rounded text-xs"
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-accent px-4 py-1.5 rounded text-xs">
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// 2. HISTORY VIEW COMPONENT
// ============================================
interface HistoryViewProps {
  contents: GeneratedContent[];
  onDeleteContent: (id: string) => void;
  onNavigate: (p: PageId) => void;
}

export function HistoryView({ contents, onDeleteContent, onNavigate }: HistoryViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyHistory = (text: string, id: string) => {
    // Parser for JSON formatted strings inside history data
    let cleanText = text;
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        cleanText = parsed.join('\n\n');
      } else if (typeof parsed === 'object') {
        cleanText = parsed.description || parsed.previewText || JSON.stringify(parsed);
      }
    } catch (e) {
      // standard raw text
    }

    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getCleanPreview = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed[0];
      if (typeof parsed === 'object') return parsed.description || parsed.previewText || JSON.stringify(parsed);
    } catch (_) {}
    return text;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <div className="flex flex-col space-y-0.5">
          <span className="font-script text-3xl text-brand-accent block select-none rotate-[-1deg] origin-left">Arsip & Kreasi</span>
          <h1 className="text-2xl md:text-3xl font-serif font-medium text-brand-text tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-brand-accent w-7 h-7" strokeWidth={1.5} /> Riwayat Konten AI
          </h1>
        </div>
        <p className="text-xs text-brand-muted mt-1">
          Buka kembali seluruh salinan jualan yang pernah dibuat asisten AI toko jualanmu sewaktu-waktu.
        </p>
      </div>

      {contents.length === 0 ? (
        <div className="glass-card p-12 text-center text-brand-muted space-y-4">
          <div className="text-5xl">🗄️</div>
          <h3 className="font-bold text-base text-brand-text">Belum ada riwayat tercatat</h3>
          <p className="text-xs max-w-sm mx-auto">
            Hasilkan kreasi marketing pertamamu dengan mengakses salah satu generator menu AI di Dashboard.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn-accent px-4 py-2 rounded text-xs"
          >
            Mulai Gunakan AI
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {contents.map((c) => (
            <div
              key={c.id}
              className="glass-card p-5 border-brand-border/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-brand-accent/25 transition duration-150"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#332518] text-brand-accent border border-brand-border/20 text-[9px] font-mono uppercase font-black rounded">
                    {c.type}
                  </span>
                  {c.platform && (
                    <span className="text-[10px] text-brand-muted font-mono capitalize">
                      {c.platform}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-extrabold text-brand-text">{c.title}</h3>
                <p className="text-xs text-brand-muted/90 line-clamp-2 leading-relaxed">
                  {getCleanPreview(c.content)}
                </p>
              </div>

              <div className="flex gap-2 w-full md:w-auto self-stretch md:self-auto justify-end border-t md:border-t-0 md:border-l border-brand-border/20 pt-3 md:pt-0 md:pl-4">
                <button
                  onClick={() => handleCopyHistory(c.content, c.id)}
                  className="p-2 border border-brand-border hover:border-brand-accent/40 rounded text-[10px] font-bold text-brand-text flex items-center justify-center gap-1 flex-1 md:flex-none"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedId === c.id ? 'Tersalin' : 'Ambil Copy'}
                </button>
                <button
                  onClick={() => onDeleteContent(c.id)}
                  className="p-2 text-brand-muted hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// 3. ACHIEVEMENTS VIEW COMPONENT
// ============================================
interface AchievementsViewProps {
  achievements: Achievement[];
  xpTotal: number;
}

export function AchievementsView({ achievements, xpTotal }: AchievementsViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div className="glass-card p-6 md:p-8 neumorph flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-brand-accent/20">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono tracking-widest text-[#8AC98A] font-extrabold uppercase">● Gamifikasi UMKM</span>
          <h1 className="text-2xl md:text-3.5xl font-serif font-medium text-brand-text tracking-tight">
            Leveling & Pencapaian Jualan
          </h1>
          <p className="text-xs text-brand-muted max-w-md">
            Tambah produk, eksekusi konten, dan catat streak harian untuk melengkapi semua 6 piala eksklusif.
          </p>
        </div>

        <div className="p-4 bg-[#1c1410] border border-brand-border/40 rounded-xl text-center min-w-[150px]">
          <span className="block text-[9px] font-mono text-brand-muted uppercase">TOTAL XP KUMULATIF</span>
          <span className="block text-3.5xl font-black text-brand-accent font-mono">{xpTotal} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach) => {
          const progressPercent = Math.min(Math.round((ach.progress / ach.target) * 100), 100);
          return (
            <div
              key={ach.id}
              className={`glass-card p-6 flex flex-col justify-between neumorph border relative overflow-hidden transition ${
                ach.unlocked
                  ? 'border-brand-accent/30 bg-brand-accent/5'
                  : 'border-brand-border/30 opacity-75'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-[#332518] rounded-xl flex items-center justify-center text-3xl font-mono">
                    {ach.title.split(' ')[0]}
                  </div>

                  {ach.unlocked ? (
                    <span className="text-[9px] font-mono uppercase bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded font-black tracking-wide">
                      🎖️ KUNCI TERBUKA
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono uppercase bg-[#1c1410] text-brand-muted px-2 py-0.5 rounded border border-brand-border/30">
                      Locked
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-brand-text">
                    {ach.title.split(' ').slice(1).join(' ')}
                  </h3>
                  <p className="text-xs text-brand-muted leading-relaxed">{ach.description}</p>
                </div>
              </div>

              {/* Progress and xp reward detail */}
              <div className="mt-6 pt-4 border-t border-brand-border/30 space-y-2.5">
                <div className="flex justify-between text-[10px] font-mono text-brand-muted">
                  <span>PROGRESS ({ach.progress}/{ach.target})</span>
                  <span className="font-extrabold text-[#8AC98A]">+{ach.xpReward} XP REWARD</span>
                </div>
                <div className="w-full bg-[#1c1410] h-2 rounded-full overflow-hidden p-0.5 border border-brand-border/20">
                  <div
                    className="h-full bg-brand-accent rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================
// 4. AI TRAINER COMPONENT (FITUR SPESIAL)
// ============================================
interface AITrainerViewProps {
  onAddXP: (xp: number, message: string) => void;
  onSaveContent: (content: Omit<GeneratedContent, 'id' | 'timestamp'>) => void;
  shopInfo: ShopInfo;
}

export function AITrainerView({ onAddXP, onSaveContent, shopInfo }: AITrainerViewProps) {
  const [character, setCharacter] = useState<'Sahabat Jualan' | 'Expert Advisor' | 'Hype Master'>('Sahabat Jualan');
  const [favoriteWords, setFavoriteWords] = useState('Bestie, Kak, Yuk Checkout, Garansi Puas, Terkancing');
  const [avoidWords, setAvoidWords] = useState('Produk murahan, Tidak ada garansi, Maaf mengganggu');
  const [formalityLevel, setFormalityLevel] = useState(2);
  const [sampleCaption, setSampleCaption] = useState('Contoh caption andalan toko yang paling laris biasanya...');
  const [targetAge, setTargetAge] = useState<'remaja' | 'dewasa muda' | 'ibu rumah tangga' | 'semua'>('dewasa muda');
  const [targetLocation, setTargetLocation] = useState('Kota-kota besar Indonesia & Jabodetabek');

  // Preview Generation State
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewText, setPreviewText] = useState('');

  const submitTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreviewLoading(true);
    setPreviewText('');

    try {
      const response = await fetch('/api/pixelshop/generate-preview-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character,
          favoriteWords,
          avoidWords,
          formalityLevel,
          targetAge,
          targetLocation
        })
      });
      const data = await response.json();
      setPreviewText(data.previewText);

      // Award +15 XP for trainer tuning
      onAddXP(15, 'Penalaan identitas AI Trainer terkonfigurasi & Disimpan! (+15 XP)');

      // Save to generation history
      onSaveContent({
        type: 'competitor', // fits as competitive tuning info
        title: `Konfigurasi AI Voice: ${character}`,
        content: JSON.stringify({ previewText: data.previewText, character, favoriteWords }),
        extraInfo: `Formality ${formalityLevel}`
      });

    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
    >
      {/* Parameters tuning panel */}
      <form onSubmit={submitTrainer} className="lg:col-span-7 glass-card p-6 md:p-8 border-brand-accent/25 space-y-6">
        <div className="border-b border-brand-border/30 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="text-brand-accent w-6 h-6" />
            <div>
              <span className="block text-[10px] font-mono text-brand-accent uppercase tracking-wider">PREFERENSI AI</span>
              <h2 className="text-lg font-serif font-medium text-brand-text">Latih AI Jualan Tokomu</h2>
            </div>
          </div>
          <span className="text-xs text-[#8AC98A] font-bold font-mono">+15 XP</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-brand-text">KARAKTER ASISTEN AI</label>
              <select
                className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text font-bold"
                value={character}
                onChange={(e) => setCharacter(e.target.value as any)}
              >
                <option value="Sahabat Jualan">😊 Sahabat Jualan (Ramah, Akrab, Hangat)</option>
                <option value="Expert Advisor">💼 Expert Advisor (Informatif, Terstruktur)</option>
                <option value="Hype Master">🔥 Hype Master (Sangat Berenergi, Hypebeast)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-brand-text">TARGET UMUR AUDIENS</label>
              <select
                className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text"
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value as any)}
              >
                <option value="dewasa muda">Dewasa Muda (18-30 tahun)</option>
                <option value="remaja">Remaja Sekolah (12-17 tahun)</option>
                <option value="ibu rumah tangga">Ibu Rumah Tangga / Orang tua</option>
                <option value="semua">Semua Lapisan Ekonomi & Usia</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-brand-text">KATA EMAS / YANG SERING TOKO KAMU PAKAI (Pisahkan Koma)</label>
            <input
              type="text"
              className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2.5 text-xs text-brand-text"
              value={favoriteWords}
              onChange={(e) => setFavoriteWords(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-brand-text">KATA TABU / YANG HARUS DIHINDARI SAMA SEKALI</label>
            <input
              type="text"
              className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2.5 text-xs text-brand-text"
              value={avoidWords}
              onChange={(e) => setAvoidWords(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono text-brand-text">
              <span>TINGKAT FORMALITAS BAHASA</span>
              <span className="font-extrabold text-brand-accent">Level {formalityLevel} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              className="w-full accent-brand-accent bg-[#332518] h-1.5 rounded-lg"
              value={formalityLevel}
              onChange={(e) => setFormalityLevel(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-brand-text">TARGET SEBARAN LOKASI GEOGRAFIS</label>
            <input
              type="text"
              className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text"
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-brand-text">CONTOH FORMAT CAPTION FAVORIT BARU (LEARNING DATA)</label>
            <textarea
              rows={3}
              className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text"
              value={sampleCaption}
              onChange={(e) => setSampleCaption(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={previewLoading}
          className="btn-accent w-full py-4 rounded-lg text-sm font-extrabold"
        >
          {previewLoading ? '⚙️ AI Sedang Menghafal Gaya Baru...' : 'Simpan & Aktifkan Identitas AI Tokomu!'}
        </button>
      </form>

      {/* Training simulated output preview */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-card p-6 border-brand-accent/20 space-y-4">
          <span className="text-[10px] font-mono text-brand-accent bg-brand-accent/15 px-2.5 py-1 rounded font-bold uppercase tracking-wider">
            Simulasi Output Jualan
          </span>
          <h3 className="font-bold text-base text-brand-text">Simulasi Voice Identitas Toko</h3>
          <p className="text-xs text-brand-muted">
            Berikut sapaan promosi simulasi Keripik Tempe Premium yang digenerate AI sesuai parameter suara kustommu.
          </p>

          <div className="bg-[#1c1410] border border-brand-border/30 p-4 rounded-xl text-xs text-brand-text select-all leading-relaxed whitespace-pre-line italic">
            {previewText || 'Tulis parameter di bagian kiri lalu tekan "Simpan & Aktifkan" untuk mereview draf suara tokomu di bagian panel audio ini.'}
          </div>

          {previewText && (
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(previewText);
                  alert('Sapaan promosi disalin!');
                }}
                className="flex-1 py-2 bg-[#332518] border border-brand-border/40 hover:border-brand-accent/40 rounded text-xs text-brand-text font-bold"
              >
                Salin Teks Simulasi
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// 5. SETTINGS SUMMARY COMPONENT
// ============================================
interface SettingsViewProps {
  shopInfo: ShopInfo;
  onUpdateShop: (shop: ShopInfo) => void;
  onResetApp: () => void;
}

export function SettingsView({ shopInfo, onUpdateShop, onResetApp }: SettingsViewProps) {
  const [name, setName] = useState(shopInfo.shopName);
  const [cat, setCat] = useState(shopInfo.category);
  const [desc, setDesc] = useState(shopInfo.description);
  const [voice, setVoice] = useState(shopInfo.brandVoice);

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShop({
      ...shopInfo,
      shopName: name,
      category: cat,
      description: desc,
      brandVoice: voice
    });
    alert('Profil toko utama diperbarui!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-xl mx-auto glass-card p-6 md:p-8 border-brand-accent/25 space-y-8"
    >
      <div className="border-b border-brand-border/30 pb-4 flex items-center gap-3">
        <div className="p-2 bg-brand-accent/15 text-brand-accent rounded">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-serif font-medium text-brand-text">Pengaturan Toko</h2>
          <p className="text-xs text-brand-muted">Mutakhirkan informasi brand atau ubah status sambungan.</p>
        </div>
      </div>

      <form onSubmit={saveSettings} className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono text-brand-muted mb-1">NAMA TOKO / BRAND</label>
          <input
            type="text"
            required
            className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-brand-muted mb-1">KATEGORI USAHA</label>
          <input
            type="text"
            required
            className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-brand-muted mb-1">DESKRIPSI UMUM BRAND</label>
          <textarea
            rows={3}
            className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-brand-muted mb-1">GAYA BAHASA BRAND TONE</label>
          <select
            className="w-full bg-[#1c1410] border border-brand-border rounded px-3 py-2 text-xs text-brand-text"
            value={voice}
            onChange={(e) => setVoice(e.target.value as any)}
          >
            <option value="santai">😊 Santai & Akrab</option>
            <option value="formal">💼 Formal & Profesional</option>
            <option value="ceria">⚡ Ceria & Berenergi</option>
            <option value="elegan">✨ Elegan & Eksklusif</option>
          </select>
        </div>

        <button type="submit" className="btn-accent w-full py-3 rounded text-xs font-bold shadow-md">
          Simpan Profil Jualan
        </button>
      </form>

      <div className="pt-6 border-t border-brand-border/25 space-y-4">
        <h3 className="text-xs font-extrabold text-red-400 uppercase tracking-widest flex items-center gap-1.5Packed">
          <AlertCircle className="w-4 h-4" /> Area Bahaya Tindakan
        </h3>
        <p className="text-[11px] text-brand-muted">
          Menghapus data sesi toko akan mengatur ulang semua level jualan, produk catalog, riwayat, serta piala pencapaian ke keadaan pabrik.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Apakah Anda yakin ingin melakukan reset pabrik PixelShop Anda?')) {
              onResetApp();
            }
          }}
          className="px-4 py-2 border border-red-500/30 hover:bg-red-500/15 text-red-400 rounded text-xs transition"
        >
          Reset Pabrik / Hapus Akun Jualan
        </button>
      </div>
    </motion.div>
  );
}
export function SupportingViewsDummy() { return null; }
