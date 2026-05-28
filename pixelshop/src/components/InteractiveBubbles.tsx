import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Bubble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  opacity: number;
  scale: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface PopRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  hue: number;
  alpha: number;
}

interface FloatingXP {
  id: number;
  x: number;
  y: number;
  text: string;
}

interface MotionParticle {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
}

interface InteractiveBubblesProps {
  onAddXP?: (amount: number) => void;
}

export default function InteractiveBubbles({ onAddXP }: InteractiveBubblesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const popRingsRef = useRef<PopRing[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [poppedCount, setPoppedCount] = useState(0);
  const [floatingXPs, setFloatingXPs] = useState<FloatingXP[]>([]);
  const [motionParticles, setMotionParticles] = useState<MotionParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth);
    let height = (canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight);
    const parentNode = canvas.parentElement;

    // Populate initial bubbles with responsive depth
    const initBubbles = () => {
      const bArray: Bubble[] = [];
      const numBubbles = Math.min(Math.floor(width / 45), parentNode ? 14 : 25);
      for (let i = 0; i < numBubbles; i++) {
        bArray.push({
          id: Math.random() + i,
          x: Math.random() * width,
          y: Math.random() * height * 0.8 + height * 0.1,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.3, // slight upward tendency
          radius: Math.random() * 20 + 15, // slightly more compact for card fitting
          hue: Math.random() * 360,
          opacity: Math.random() * 0.55 + 0.35,
          scale: 1,
        });
      }
      bubblesRef.current = bArray;
    };

    initBubbles();

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      width = canvas.width = parent ? parent.clientWidth : window.innerWidth;
      height = canvas.height = parent ? parent.clientHeight : window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // Pop bubble on click
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let bubblePopped = false;

      // Filter state
      const updatedBubbles = bubblesRef.current.filter((bubble) => {
        const dx = bubble.x - clickX;
        const dy = bubble.y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bubble.radius * bubble.scale) {
          // Explode particle bursts!
          createBurst(bubble.x, bubble.y, bubble.radius, bubble.hue);

          // Add realistic pop ring wave explosion
          popRingsRef.current.push({
            x: bubble.x,
            y: bubble.y,
            radius: bubble.radius * 0.5,
            maxRadius: bubble.radius * 2.5,
            hue: bubble.hue,
            alpha: 1.0
          });

          bubblePopped = true;
          setPoppedCount((prev) => prev + 1);

          // Generate beautiful physical Framer Motion particles along with existing canvas structures!
          const angleStep = (Math.PI * 2) / 10;
          const newFMParticles: MotionParticle[] = Array.from({ length: 10 }, (_, index) => {
            const angle = index * angleStep + (Math.random() * 0.4 - 0.2);
            return {
              id: Math.random() + index + Date.now(),
              startX: bubble.x,
              startY: bubble.y,
              angle: angle,
              distance: bubble.radius * 1.5 + Math.random() * bubble.radius * 1.5,
              size: 6 + Math.random() * 9,
              color: `hsla(${bubble.hue}, 95%, 72%, 1)`,
              delay: Math.random() * 0.04
            };
          });
          setMotionParticles((prev) => [...prev, ...newFMParticles]);

          // Spawn floating XP notification immediately
          const xpEarned = Math.random() > 0.65 ? 10 : 5;
          setFloatingXPs((prev) => [
            ...prev,
            {
              id: Math.random(),
              x: bubble.x,
              y: bubble.y,
              text: `+${xpEarned} XP 🫧`
            }
          ]);

          // Trigger optional onAddXP gamification callback
          if (onAddXP) {
            onAddXP(xpEarned);
          }

          return false; // remove bubble
        }
        return true;
      });

      if (bubblePopped) {
        bubblesRef.current = updatedBubbles;
        // Spawn a replacement bubble from the bottom shortly
        setTimeout(() => {
          if (bubblesRef.current.length < 30) {
            bubblesRef.current.push({
              id: Math.random(),
              x: Math.random() * width,
              y: height + 50,
              vx: (Math.random() - 0.5) * 2,
              vy: -Math.random() * 1.5 - 0.5,
              radius: Math.random() * 25 + 20,
              hue: Math.random() * 360,
              opacity: Math.random() * 0.55 + 0.35,
              scale: 1,
            });
          }
        }, 800);
      }
    };

    const createBurst = (x: number, y: number, radius: number, hue: number) => {
      const pCount = Math.floor(radius / 2) + 12; // 22-35 sparkles for dramatic realism
      const newParticles: Particle[] = [];

      for (let i = 0; i < pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 3; // slightly faster for high intensity look
        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5, // slight upwards vector force
          radius: Math.random() * 3.5 + 1.5,
          color: `hsla(${(hue + Math.random() * 45 - 22) % 360}, 95%, 75%, `,
          alpha: 1.0,
          life: 0,
          maxLife: Math.random() * 35 + 25,
        });
      }
      particlesRef.current = [...particlesRef.current, ...newParticles];
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);

    // Main loops
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const bubbles = bubblesRef.current;
      const particles = particlesRef.current;
      const popRings = popRingsRef.current;

      // Update & Draw Pop Rings
      for (let i = popRings.length - 1; i >= 0; i--) {
        const ring = popRings[i];
        ring.radius += 3.2; // expansion speed
        ring.alpha = 1 - ring.radius / ring.maxRadius;

        if (ring.radius >= ring.maxRadius) {
          popRings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${ring.hue}, 95%, 72%, ${ring.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${ring.hue}, 90%, 65%, 0.6)`;
        ctx.stroke();
        ctx.restore();
      }

      // Update & Draw Particles (background elements)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // gravity pulling sparks slightly
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha.toFixed(2) + ')';
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(32, 95%, 65%, 0.55)`;
        ctx.fill();
        ctx.restore();
      }

      // Update & Draw Bubbles
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];

        // Drifting natural float
        b.x += b.vx;
        b.y += b.vy;

        // Brownian wind friction
        b.vx += (Math.random() - 0.5) * 0.05;
        b.vy += (Math.random() - 0.5) * 0.03 - 0.002;

        // Apply friction
        b.vx *= 0.985;
        b.vy *= 0.985;

        // Cursor repulsion (Anti-gravity effect)
        if (mouse.active) {
          const dx = b.x - mouse.x;
          const dy = b.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const activeRadius = 150; // trigger range

          if (dist < activeRadius) {
            const force = (activeRadius - dist) / activeRadius;
            const thrust = force * 0.45; // strength multiplier
            const angle = Math.atan2(dy, dx);
            b.vx += Math.cos(angle) * thrust;
            b.vy += Math.sin(angle) * thrust;
          }
        }

        // Keep inside bounds (Bounce walls)
        const pad = b.radius + 5;
        if (b.x < pad) {
          b.x = pad;
          b.vx = Math.abs(b.vx) * 0.8;
        } else if (b.x > width - pad) {
          b.x = width - pad;
          b.vx = -Math.abs(b.vx) * 0.8;
        }

        if (b.y < pad) {
          b.y = height + 50; // loop back to bottom smoothly
          b.x = Math.random() * width;
          b.vy = -Math.random() * 1.5 - 0.5;
        } else if (b.y > height + 80) {
          b.y = -20;
          b.vy = Math.random() * 1.5 + 0.2;
        }

        // Draw iridescent bubble with glow reflection 3D glass look
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * b.scale, 0, Math.PI * 2);

        // Core iridescent gradient fill
        const grad = ctx.createRadialGradient(
          b.x - b.radius * 0.3,
          b.y - b.radius * 0.3,
          b.radius * 0.1,
          b.x,
          b.y,
          b.radius
        );

        // Iridescent reflection colors (Soft pinks, purples, blues, yellows)
        const hueAccent1 = b.hue % 360;
        const hueAccent2 = (b.hue + 120) % 360;
        
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        grad.addColorStop(0.3, `hsla(${hueAccent1}, 70%, 75%, 0.08)`);
        grad.addColorStop(0.7, `hsla(${hueAccent2}, 85%, 70%, 0.12)`);
        grad.addColorStop(0.9, `hsla(${(b.hue + 240) % 360}, 90%, 65%, 0.25)`);
        grad.addColorStop(1, `hsla(${hueAccent1}, 95%, 60%, 0.35)`);

        ctx.fillStyle = grad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${hueAccent1}, 75%, 65%, 0.2)`;
        ctx.fill();

        // 3D Glass shine contour stroke
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3D Highlight Spark (Bubble reflection crescent white line)
        ctx.beginPath();
        ctx.arc(
          b.x - b.radius * 0.35,
          b.y - b.radius * 0.35,
          b.radius * 0.45,
          Math.PI * 1.0,
          Math.PI * 1.5
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 3D Inner Glow dot top-left
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.45, b.y - b.radius * 0.45, b.radius * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();

        ctx.restore();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('click', handleCanvasClick);
      }
    };
  }, [onAddXP]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
      <canvas ref={canvasRef} className="w-full h-full block opacity-75 md:opacity-90" />
      
      {/* Dynamic Pop floating notifications */}
      <AnimatePresence>
        {floatingXPs.map((fxp) => (
          <motion.div
            key={fxp.id}
            initial={{ opacity: 0, y: fxp.y, x: fxp.x - 40, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: fxp.y - 80, scale: [0.85, 1.15, 1, 0.95] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            onAnimationComplete={() => {
              setFloatingXPs((prev) => prev.filter((item) => item.id !== fxp.id));
            }}
            className="absolute z-20 pointer-events-none font-mono text-xs font-black text-brand-accent bg-brand-surface/90 border border-brand-accent/40 px-3 py-1.5 rounded-full shadow-[0_4px_16px_rgba(212,149,106,0.3)] select-none whitespace-nowrap"
          >
            {fxp.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Framer Motion Splash Particles */}
      {motionParticles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: p.startX - p.size / 2,
            y: p.startY - p.size / 2,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: p.startX + Math.cos(p.angle) * p.distance - p.size / 2,
            y: p.startY + Math.sin(p.angle) * p.distance + 55 - p.size / 2, // gravity drop influence
            scale: [1, 1.35, 0],
            opacity: [1, 0.9, 0],
          }}
          transition={{
            duration: 0.7 + Math.random() * 0.4,
            ease: [0.15, 0.85, 0.3, 1], // fluid kinematic easing
            delay: p.delay,
          }}
          onAnimationComplete={() => {
            setMotionParticles((prev) => prev.filter((item) => item.id !== p.id));
          }}
          className="absolute pointer-events-none rounded-full z-10"
          style={{
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle at 35% 35%, #ffffff 15%, ${p.color} 55%, transparent 100%)`,
            boxShadow: `0 0 14px ${p.color}, inset 0 0 5px rgba(255,255,255,0.95)`,
            backdropFilter: 'blur(1px)',
          }}
        />
      ))}

      {/* Floating score or pop counter as a subtle, cute gamified reminder */}
      {poppedCount > 0 && (
        <div className="absolute bottom-6 left-6 font-mono text-[10px] text-brand-accent/50 tracking-widest pointer-events-none select-none uppercase">
          💥 BUBBLE POPPED: {poppedCount} • +{poppedCount * 2} XP FUN
        </div>
      )}
    </div>
  );
}
