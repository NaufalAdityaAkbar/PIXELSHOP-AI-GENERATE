import React, { useEffect, useRef } from 'react';

export default function InteractiveWaves() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);
    let animationId: number;
    let time = 0;
    let scrollSpeed = 0;
    let lastScrollY = window.pageYOffset;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      scrollSpeed += Math.abs(currentScrollY - lastScrollY) * 0.04;
      lastScrollY = currentScrollY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Multi-layered ocean coordinate plotting
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dampen the scroll surge input
      scrollSpeed *= 0.94;
      time += 0.015 + scrollSpeed * 0.005;

      ctx.save();
      ctx.lineWidth = 1.2;

      // Draw 3 layers of glowing waves
      const waveLayers = [
        { amplitude: 25, frequency: 0.005, speed: 0.4, hue: 28, opacity: 0.08 },
        { amplitude: 18, frequency: 0.008, speed: -0.3, hue: 40, opacity: 0.06 },
        { amplitude: 12, frequency: 0.012, speed: 0.6, hue: 15, opacity: 0.04 },
      ];

      for (let w = 0; w < waveLayers.length; w++) {
        const layer = waveLayers[w];
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${layer.hue}, 65%, 65%, ${layer.opacity})`;

        for (let x = 0; x <= width; x += 15) {
          // Calculate wave height (Y)
          const scrollOff = scrollSpeed * 0.2;
          const y =
            height * 0.5 +
            Math.sin(x * layer.frequency + time * layer.speed) * layer.amplitude +
            Math.cos(x * 0.003 - time * 0.2) * (10 + scrollOff);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-none opacity-60 z-0"
    />
  );
}
