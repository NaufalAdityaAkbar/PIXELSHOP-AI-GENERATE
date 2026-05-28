import React, { useEffect, useRef } from 'react';

interface InteractiveScrollMarqueeProps {
  text: string;
  speedMultiplier?: number;
  reverse?: boolean;
  className?: string;
}

export default function InteractiveScrollMarquee({
  text,
  speedMultiplier = 1,
  reverse = false,
  className = '',
}: InteractiveScrollMarqueeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetScrollVelocity = useRef(0);
  const currentScrollVelocity = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Base motor speed and direction
    const baseSpeed = 1.0 * speedMultiplier * (reverse ? -1 : 1);
    let currentX = 0;
    let frameId: number;

    // Track scroll offset per frame
    let lastScrollFrameY = window.pageYOffset || document.documentElement.scrollTop;

    // Performance-first direct DOM translation ticks with frame-dynamic scroll velocity
    const update = () => {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate instantaneous scroll velocity on this animation frame
      const scrollDelta = currentScrollY - lastScrollFrameY;
      lastScrollFrameY = currentScrollY;

      // Map scroll intensity smoothly (increasing scroll velocity adds to marquee motion force)
      targetScrollVelocity.current = scrollDelta * 0.25;

      // Smoothly interpolate (lerp) current velocity to target scroll influence
      currentScrollVelocity.current += (targetScrollVelocity.current - currentScrollVelocity.current) * 0.12;

      // Apply decel friction/inertia fallback as target velocity naturally decays
      targetScrollVelocity.current *= 0.9;

      // Calculate total translation offset combining base motor speed & scroll intensity
      const waveThrust = baseSpeed + currentScrollVelocity.current;
      currentX += waveThrust;

      // Wrap-around threshold logic (based on half the actual scroll width)
      if (Math.abs(currentX) >= container.scrollWidth / 2) {
        currentX = 0;
      }

      // High-performance translate3d to avoid layout thrashing
      container.style.transform = `translate3d(${-currentX}px, 0, 0)`;

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [speedMultiplier, reverse]);

  // Repeated 8 times to ensure it occupies the full widescreen width smoothly
  const items = Array(8).fill(text);

  return (
    <div className={`w-full overflow-hidden whitespace-nowrap py-3.5 bg-brand-accent/10 border-y border-brand-accent/20 select-none relative z-20 ${className}`}>
      <div 
        ref={containerRef}
        className="inline-flex gap-8 text-xs font-mono font-black uppercase tracking-widest text-brand-accent transition-transform duration-75 ease-out"
        style={{ willChange: 'transform' }}
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-6 whitespace-nowrap">
            <span>{item}</span>
            <span className="text-[#8AC98A] font-sans">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
