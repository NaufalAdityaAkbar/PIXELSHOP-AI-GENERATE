"use client";
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { useAppContext } from '@/src/context/AppContext';

export default function ConfirmDialog() {
  const { confirmDialog, closeConfirm } = useAppContext();
  const { isOpen, title, message, type, confirmText, cancelText, onConfirm, onCancel } = confirmDialog;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeConfirm();
  };

  // Curate premium color scheme & icons based on Type
  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-10 h-10 text-emerald-400 stroke-[1.5]" />,
          glow: 'from-emerald-500/20 to-transparent',
          accent: 'border-emerald-500/30',
          btnClass: 'bg-emerald-500 hover:bg-emerald-600 text-brand-bg shadow-emerald-500/20'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-10 h-10 text-amber-400 stroke-[1.5]" />,
          glow: 'from-amber-500/20 to-transparent',
          accent: 'border-amber-500/30',
          btnClass: 'bg-brand-accent hover:bg-brand-accent/90 text-brand-bg shadow-brand-accent/20'
        };
      case 'danger':
        return {
          icon: <AlertTriangle className="w-10 h-10 text-rose-450 stroke-[1.5]" />,
          glow: 'from-rose-500/20 to-transparent',
          accent: 'border-rose-500/30',
          btnClass: 'bg-rose-550 hover:bg-rose-600 text-white shadow-rose-550/20'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-10 h-10 text-blue-400 stroke-[1.5]" />,
          glow: 'from-blue-500/20 to-transparent',
          accent: 'border-blue-500/30',
          btnClass: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
        };
    }
  };

  const config = getConfig();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Glassmorphic backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={handleCancel}
          />

          {/* Dialog Card container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`w-full max-w-md glass-card p-6 md:p-8 relative z-10 border ${config.accent} bg-[#1c1410]/95 shadow-2xl rounded-3xl overflow-hidden preserve-3d`}
          >
            {/* Top Glowing Ambient Light */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b ${config.glow} rounded-full blur-2xl pointer-events-none`} />

            <div className="space-y-6 text-center relative z-10">
              {/* Icon Container */}
              <div className="mx-auto w-16 h-16 bg-[#261e14] border border-brand-border/40 rounded-2xl flex items-center justify-center shadow-lg shadow-black/40">
                {config.icon}
              </div>

              {/* Title & message */}
              <div className="space-y-2">
                <h3 className="font-display font-medium text-lg md:text-xl text-brand-text tracking-wide uppercase">
                  {title}
                </h3>
                <p className="text-brand-muted text-xs md:text-sm leading-relaxed max-w-xs mx-auto">
                  {message}
                </p>
              </div>

              {/* Buttons actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:order-1 bg-[#261e14] border border-brand-border hover:border-brand-accent/50 text-brand-text py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center cursor-pointer font-mono"
                >
                  {cancelText || 'BATAL'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`w-full sm:order-2 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center cursor-pointer font-mono shadow-lg hover:scale-[1.02] active:scale-[0.98] ${config.btnClass}`}
                >
                  {confirmText || 'SINKRONKAN'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
