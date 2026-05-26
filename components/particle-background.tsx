"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const COUNT = 65;
    const MAX_DIST = 130;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function makeParticle(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: Math.random() * 2.2 + 0.8,
        opacity: Math.random() * 0.45 + 0.12,
      };
    }

    function init() {
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) particles.push(makeParticle());
    }

    function tick() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx!.strokeStyle = `rgba(255, 59, 48, ${alpha})`;
            ctx!.lineWidth = 0.75;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }

      // dots
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 59, 48, ${p.opacity})`;
        ctx!.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -5 || p.x > canvas!.width + 5) p.vx *= -1;
        if (p.y < -5 || p.y > canvas!.height + 5) p.vy *= -1;
      }

      animId = requestAnimationFrame(tick);
    }

    const onResize = () => { resize(); init(); };

    resize();
    init();
    tick();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="login-particles" />;
}
