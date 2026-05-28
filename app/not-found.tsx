"use client";
import React from 'react';
import { motion } from 'motion/react';
import { Compass, ArrowLeft, Home, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0e0a08] relative overflow-hidden flex flex-col justify-center items-center px-4 py-8 select-none antialiased">
      {/* Premium ambient glows */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-brand-accent/5 top-[-100px] left-[-100px] blur-[150px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/5 bottom-[-100px] right-[-100px] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg glass-card p-8 md:p-12 relative z-10 border border-brand-accent/35 bg-[#1c1410]/95 shadow-2xl rounded-3xl overflow-hidden text-center space-y-8">
        {/* Glow ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-brand-accent/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6">
          {/* Branded animated compass icon */}
          <div className="mx-auto w-24 h-24 bg-[#261e14] border border-brand-accent/30 rounded-3xl flex items-center justify-center shadow-lg shadow-black/40 relative">
            <Compass className="w-12 h-12 text-brand-accent stroke-[1.25] animate-spin" style={{ animationDuration: '25s' }} />
            <HelpCircle className="w-6 h-6 text-brand-accent/80 absolute bottom-3 right-3 animate-bounce" />
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-brand-accent font-extrabold uppercase tracking-widest bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/20">
              ⚡ ERROR 404 • ROUTE GAJEBO DETECTED
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-brand-text tracking-tight uppercase pt-2">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-brand-muted text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
              Opps! Asisten AI kami tidak menemukan kecocokan untuk rute gajebo yang Anda masukkan. Halaman tersebut tidak eksis di PixelShop.
            </p>
          </div>
        </div>

        {/* Console status log details */}
        <div className="bg-[#090e1a]/80 border border-brand-border/40 p-4 rounded-xl text-left space-y-1.5 font-mono text-[10px] text-brand-muted">
          <div className="flex justify-between items-center text-[9px] uppercase font-bold border-b border-brand-border/10 pb-1.5 mb-1 text-brand-accent">
            <span>💻 STATUS SISTEM</span>
            <span className="text-brand-accent">RESOLVED: 404</span>
          </div>
          <div><span className="text-brand-accent pr-1.5">&gt;</span> ERROR: Page resource not found.</div>
          <div><span className="text-brand-accent pr-1.5">&gt;</span> ACTION: Redirect user to verified application space.</div>
        </div>

        {/* Redirect Recovery Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full bg-[#261e14] border border-brand-border hover:border-brand-accent/50 text-brand-text py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            <ArrowLeft className="w-4 h-4 text-brand-accent" /> PENGATURAN AWAL
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 text-brand-bg py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer font-mono shadow-lg shadow-brand-accent/20"
          >
            <Home className="w-4 h-4 text-brand-bg" /> DASHBOARD AI
          </button>
        </div>
      </div>
    </div>
  );
}
