"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertOctagon, RefreshCw, Database, HelpCircle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const [diagnosticMsg, setDiagnosticMsg] = useState("Menunggu input tindakan...");

  useEffect(() => {
    console.error("Next.js Boundary Error:", error);
  }, [error]);

  const handleSelfHealing = () => {
    setDiagnosticMsg("Menjalankan perbaikan mandiri...");
    setTimeout(() => {
      // Clear next.js/webpack cached client session
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pixelshop_session');
        localStorage.removeItem('pixelshop_products');
        setDiagnosticMsg("Perbaikan mandiri selesai! Memuat ulang sistem...");
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1200);
      }
    }, 1500);
  };

  const handleOfflineMode = () => {
    setDiagnosticMsg("Mengaktifkan Mode Offline Lokal...");
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pixelshop_offline_mode', 'true');
        setDiagnosticMsg("Mode Offline aktif! Mengalihkan ke Dashboard...");
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0e0a08] relative overflow-hidden flex flex-col justify-center items-center px-4 py-8 select-none antialiased">
      {/* Background ambient light */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-rose-500/5 top-[-100px] left-[-100px] blur-[150px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-accent/5 bottom-[-100px] right-[-100px] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg glass-card p-8 md:p-12 relative z-10 border border-rose-500/25 bg-[#1c1410]/95 shadow-2xl rounded-3xl overflow-hidden text-center space-y-8">
        {/* Glow ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-rose-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6">
          {/* Animated Error Shield Icon */}
          <div className="mx-auto w-20 h-20 bg-[#261e14] border border-rose-500/20 rounded-3xl flex items-center justify-center shadow-lg shadow-black/40">
            <AlertOctagon className="w-12 h-12 text-rose-450 stroke-[1.5] animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-rose-400 font-extrabold uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              ● ERROR SYSTEM DETECTED
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-brand-text tracking-tight uppercase pt-2">
              Sistem Mengalami Kendala
            </h2>
            <p className="text-brand-muted text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
              PixelShop mendeteksi adanya kegagalan runtime. Tapi jangan khawatir, asisten kami siap membantu memulihkan sistem Anda.
            </p>
          </div>
        </div>

        {/* Console Diagnostic Log Box */}
        <div className="bg-[#090e1a]/80 border border-brand-border/40 p-4.5 rounded-2xl text-left space-y-2.5">
          <div className="flex justify-between items-center text-[9px] font-mono text-brand-muted uppercase font-bold tracking-wider pb-1.5 border-b border-brand-border/10">
            <span>💻 DIAGNOSTIK KONSOL</span>
            <span className="text-rose-400 font-black">STATUS: FAULT</span>
          </div>
          <p className="font-mono text-[10px] text-rose-300 break-all leading-relaxed">
            {error.message || "Terdapat kegagalan inisialisasi basis data PostgreSQL / Prisma Client."}
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-brand-border/10">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
            <span className="font-mono text-[9px] text-brand-accent uppercase tracking-wider font-bold">
              {diagnosticMsg}
            </span>
          </div>
        </div>

        {/* Recovery Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="w-full bg-[#261e14] border border-brand-border hover:border-brand-accent/50 text-brand-text py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            <RefreshCw className="w-4 h-4 text-brand-accent" /> COBA LAGI
          </button>
          <button
            type="button"
            onClick={handleSelfHealing}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-bg py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer font-mono shadow-lg shadow-brand-accent/20"
          >
            <Database className="w-4 h-4 text-brand-bg" /> SELF-HEALING
          </button>
        </div>

        <button
          type="button"
          onClick={handleOfflineMode}
          className="text-[10px] font-mono text-brand-muted hover:text-brand-accent transition tracking-widest uppercase block mx-auto underline underline-offset-4"
        >
          Lompati & Jalankan Offline Mode
        </button>
      </div>
    </div>
  );
}
