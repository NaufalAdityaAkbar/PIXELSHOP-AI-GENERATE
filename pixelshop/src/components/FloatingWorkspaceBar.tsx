import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Mail, Calendar as CalendarIcon, HardDrive, LogIn, ChevronRight, Check } from 'lucide-react';
import { GeneratedContent } from '../types';
import { googleSignIn, getAccessToken, initAuth } from '../lib/workspaceAuth';
import { exportToGoogleCalendar, sendEmailViaGmail, uploadFileToDrive } from '../lib/workspaceApis';

export default function FloatingWorkspaceBar({ latestContent }: { latestContent: GeneratedContent | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  React.useEffect(() => {
    const unsub = initAuth((user) => setIsSignedIn(true), () => setIsSignedIn(false));
    return () => unsub();
  }, []);

  if (!latestContent) return null;

  const handleAuth = async () => {
    try {
      setLoading(true);
      await googleSignIn();
      setIsSignedIn(true);
      setStatus('Workspace terhubung!');
      setTimeout(() => setStatus(''), 2000);
    } catch (e: any) {
      setStatus('Gagal terhubung: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(''), 3000);
  };

  const runWithAuth = async (action: () => Promise<void>) => {
    if (!isSignedIn || !getAccessToken()) {
      try {
        await googleSignIn();
        setIsSignedIn(true);
      } catch (e) {
        notify('Autentikasi gagal.');
        return;
      }
    }
    try {
      setLoading(true);
      await action();
    } catch (e: any) {
      notify('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCalendar = () => runWithAuth(async () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = `${String(today.getHours() + 1).padStart(2, '0')}:00`;
    await exportToGoogleCalendar(
      latestContent.title || 'Konten PixelShop',
      dateStr,
      timeStr,
      latestContent.platform || 'General',
      latestContent.type,
      latestContent.content
    );
    notify('Berhasil dijadwalkan ke Google Calendar!');
  });

  const handleSaveDrive = () => runWithAuth(async () => {
    await uploadFileToDrive(
      `PixelShop_${latestContent.type}_${Date.now()}.txt`,
      'text/plain',
      `Title: ${latestContent.title}\n\nContent:\n${latestContent.content}`
    );
    notify('Berhasil disimpan ke Google Drive!');
  });

  const handleSendEmail = () => runWithAuth(async () => {
    // We can prompt for email or send to self
    const fakeEmail = 'promosi@toko.com'; 
    await sendEmailViaGmail(
      fakeEmail,
      `Draft Konten PixelShop: ${latestContent.title}`,
      `Berikut adalah draft konten yang baru dibuat:\n\n${latestContent.content}\n\nPlatform: ${latestContent.platform}`
    );
    notify(`Draft email terkirim ke ${fakeEmail}!`);
  });

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1c1410] border border-brand-accent/50 text-brand-text text-[10px] px-3 py-1.5 rounded-full font-mono whitespace-nowrap shadow-lg flex items-center gap-1.5"
            >
              {status.includes('Berhasil') || status.includes('terhubung') ? <Check className="w-3 h-3 text-emerald-400" /> : null}
              {status}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          layout
          initial={{ borderRadius: 32 }}
          className="bg-[#261e14]/90 backdrop-blur-md border border-brand-border/40 shadow-2xl overflow-hidden flex items-center"
        >
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-brand-text hover:bg-white/5 transition"
          >
            <Share2 className="w-4 h-4 text-brand-accent" />
            <span className="hidden sm:inline">Workspace Sync</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center gap-1 pr-3"
              >
                <div className="w-px h-6 bg-brand-border/40 mx-2" />
                <button
                  onClick={handleSyncCalendar}
                  disabled={loading}
                  className="p-2 hover:bg-white/10 rounded-lg text-brand-text transition tooltip-trigger relative group"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1c1410] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-brand-border pointer-events-none">Ke Calendar</span>
                </button>
                <button
                  onClick={handleSaveDrive}
                  disabled={loading}
                  className="p-2 hover:bg-white/10 rounded-lg text-brand-text transition tooltip-trigger relative group"
                >
                  <HardDrive className="w-4 h-4" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1c1410] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-brand-border pointer-events-none">Simpan Drive</span>
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={loading}
                  className="p-2 hover:bg-white/10 rounded-lg text-brand-text transition tooltip-trigger relative group"
                >
                  <Mail className="w-4 h-4" />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1c1410] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-brand-border pointer-events-none">Email Draft (Gmail)</span>
                </button>
                {!isSignedIn && (
                  <>
                    <div className="w-px h-6 bg-brand-border/40 mx-1" />
                    <button
                      onClick={handleAuth}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 ml-1 bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent rounded-lg text-xs font-bold transition whitespace-nowrap"
                    >
                      <LogIn className="w-3.5 h-3.5" /> G-Login
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
