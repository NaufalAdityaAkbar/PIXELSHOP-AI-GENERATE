import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface Bubble {
  id: number;
  x: number; // horizontal offset percentage
  size: number; // size in pixels
  color: string;
  duration: number;
  delay: number;
}

interface MiniParticle {
  id: string;
  x: number;
  y: number;
  angle: number;
  color: string;
}

export default function BubbleSkeletonLoader() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<MiniParticle[]>([]);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingTexts = [
    'Sedang mengocok ramuan kalimat memikat...',
    'Asisten AI sedang menyisir keyword pembawa hoki...',
    'Menyusun taktik sapaan gaul penakluk pembeli...',
    'Menyuntikkan daya tarik emosi tingkat tinggi...',
    'Hampir siap! Merapikan tata letak estetik...'
  ];

  // Rotate helpful marketing/brewing text
  useEffect(() => {
    const textInterval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2800);
    return () => clearInterval(textInterval);
  }, []);

  // Generate continuous bubbles
  useEffect(() => {
    let bubbleId = 0;
    
    // Seed initial batch
    const initialBubbles = Array.from({ length: 12 }, () => ({
      id: ++bubbleId,
      x: 10 + Math.random() * 80,
      size: 15 + Math.random() * 30,
      color: Math.random() > 0.4 ? 'rgba(212,149,106, 0.25)' : 'rgba(138, 201, 138, 0.25)',
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
    }));
    setBubbles(initialBubbles);

    // Keep spawning new ones
    const spawnTimer = setInterval(() => {
      const newBubble: Bubble = {
        id: ++bubbleId,
        x: 5 + Math.random() * 90,
        size: 12 + Math.random() * 28,
        color: Math.random() > 0.5 ? 'rgba(212,149,106, 0.2)' : 'rgba(255, 255, 255, 0.15)',
        duration: 4 + Math.random() * 3,
        delay: 0,
      };
      setBubbles((prev) => [...prev.slice(-25), newBubble]);
    }, 600);

    return () => clearInterval(spawnTimer);
  }, []);

  // Trigger burst/bubble-split visual burst effects dynamically
  const triggerBurst = (xPercent: number, yPx: number, color: string) => {
    const pCount = 6 + Math.floor(Math.random() * 4);
    const newParticles: MiniParticle[] = Array.from({ length: pCount }, (_, k) => ({
      id: `${Date.now()}-${k}-${Math.random()}`,
      x: xPercent,
      y: yPx,
      angle: (k * 360) / pCount + (Math.random() * 20 - 10),
      color: color,
    }));

    setParticles((prev) => [...prev.slice(-35), ...newParticles]);

    // Clean up particles
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1000);
  };

  return (
    <div className="relative w-full rounded-3xl p-8 bg-gradient-to-b from-[#140e0b] via-[#0c0806] to-[#120c09] border border-brand-accent/20 overflow-hidden shadow-2xl space-y-8 select-none">
      
      {/* Dynamic brewing container for fluid molecules */}
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none overflow-hidden">
        {/* Soft amber radial steam underlay */}
        <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-80 h-40 rounded-full bg-brand-accent/10 blur-[60px] animate-pulse" />
        
        {/* Floating Interactive Bubbles */}
        <AnimatePresence>
          {bubbles.map((b) => (
            <motion.div
              key={b.id}
              initial={{ y: 200, opacity: 0, scale: 0.3 }}
              animate={{
                y: -60,
                opacity: [0, 0.8, 0.8, 0],
                scale: [0.5, 1.1, 1, 0.4],
                x: [0, Math.sin(b.id) * 35, Math.sin(b.id) * -35],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: b.duration,
                delay: b.delay,
                ease: 'easeInOut',
              }}
              onUpdate={(latest) => {
                // Periodically trigger a subtle particle splash when reaching half height
                if (typeof latest.y === 'number' && latest.y < 35 && latest.y > 33 && Math.random() > 0.85) {
                  triggerBurst(b.x, latest.y, b.color);
                }
              }}
              style={{
                position: 'absolute',
                left: `${b.x}%`,
                width: b.size,
                height: b.size,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${b.color.replace('0.2', '0.4').replace('0.15', '0.3')}, transparent)`,
                border: '1px solid rgba(212,149,106, 0.35)',
                boxShadow: '0 4px 12px rgba(212,149,106, 0.1)',
                backdropFilter: 'blur(1px)',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.5 }}
              onClick={() => triggerBurst(b.x, -20, 'rgba(212,149,106, 0.7)')}
            />
          ))}
        </AnimatePresence>

        {/* Burst Splitting Droplet Particles */}
        {particles.map((p) => {
          const radian = (p.angle * Math.PI) / 180;
          const targetDist = 40 + Math.random() * 50;
          const targetX = Math.cos(radian) * targetDist;
          const targetY = Math.sin(radian) * targetDist;

          return (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: p.y, opacity: 1, scale: 1.2 }}
              animate={{
                x: targetX,
                y: p.y + targetY,
                opacity: 0,
                scale: 0.2,
              }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: p.color.includes('212') ? '#D4956A' : '#8AC98A',
                boxShadow: '0 0 6px rgba(212,149,106, 0.6)',
              }}
            />
          );
        })}
      </div>

      {/* Structured Glassmorphic Skeleton Fields with Liquid Sweeping Glimmers */}
      <div className="space-y-6 relative z-10">
        
        {/* Loading Header indicator */}
        <div className="flex justify-between items-center border-b border-brand-border/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-brand-accent/20 rounded-full flex items-center justify-center border border-brand-accent/30 shadow-[0_0_12px_rgba(212,149,106,0.15)]">
              <Sparkles className="h-4 w-4 text-brand-accent animate-spin-slow" />
            </div>
            <div>
              <span className="block text-[9px] font-mono text-brand-accent uppercase tracking-widest font-extrabold animate-pulse">Meramu Konten Pintar</span>
              <h4 className="text-sm font-bold text-brand-text font-serif">PixelShop AI Formula Lab</h4>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#1a120e] px-2.5 py-1 rounded-md border border-brand-accent/15">
            <span className="h-2 w-2 rounded-full bg-brand-accent animate-ping" />
            <span className="text-[10px] font-mono text-brand-accent font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Dynamic transition bubble tagline switcher */}
        <div className="h-8 flex items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingTextIndex}
              initial={{ y: 7, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -7, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-xs text-brand-muted/90 italic font-medium font-sans flex items-center gap-1.5"
            >
              <span>🫧</span> {loadingTexts[loadingTextIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Skeleton content field with bubbling glass overlays */}
        <div className="relative p-5 bg-[#0e0a08]/75 rounded-2xl border border-brand-border/25 space-y-4">
          
          {/* Top placeholder badge */}
          <div className="flex justify-between">
            <div className="h-4.5 bg-gradient-to-r from-brand-accent/15 via-brand-accent/5 to-brand-accent/15 rounded w-[90px] animate-pulse" />
            <div className="h-4 bg-brand-border/20 rounded w-10 animate-pulse" />
          </div>

          {/* Liquid-simulated line placeholders */}
          <div className="space-y-3.5 pt-2">
            <div className="h-3 bg-gradient-to-r from-brand-border/10 via-brand-accent/10 to-brand-border/10 rounded w-full animate-pulse" style={{ animationDelay: '0.1s' }} />
            <div className="h-3 bg-gradient-to-r from-brand-border/10 via-brand-accent/10 to-brand-border/10 rounded w-[94%] animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="h-3 bg-gradient-to-r from-brand-border/10 via-brand-accent/10 to-brand-border/10 rounded w-[88%] animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="h-3 bg-gradient-to-r from-brand-border/10 via-brand-accent/10 to-brand-border/10 rounded w-[72%] animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>

          {/* Highlighted liquid zone */}
          <div className="mt-4 p-3 bg-brand-accent/[0.03] border border-brand-accent/10 rounded-xl space-y-2">
            <div className="h-2.5 bg-brand-accent/10 rounded w-28 animate-pulse" />
            <div className="h-2 bg-brand-border/10 rounded w-full animate-pulse" />
          </div>

        </div>

        {/* Skeleton Interactive Action buttons */}
        <div className="pt-2 flex gap-3">
          <div className="h-10 bg-gradient-to-r from-brand-border/15 via-brand-accent/5 to-brand-border/15 rounded-xl flex-1 animate-pulse" />
          <div className="h-10 bg-gradient-to-r from-brand-border/15 via-brand-accent/5 to-brand-border/15 rounded-xl flex-1 animate-pulse" />
        </div>

      </div>

    </div>
  );
}
