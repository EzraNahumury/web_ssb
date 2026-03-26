"use client";

import { useEffect, useRef, useState } from "react";

function PreloaderParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function init() {
      particles.length = 0;
      for (let i = 0; i < 65; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          r: Math.random() * 2.2 + 0.8,
          o: Math.random() * 0.45 + 0.12,
        });
      }
    }

    function tick() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx!.strokeStyle = `rgba(0, 98, 255, ${(1 - dist / 130) * 0.18})`;
            ctx!.lineWidth = 0.75;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0, 98, 255, ${p.o})`;
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

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

export function LoginPreloader({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 2400);
    const t2 = setTimeout(() => setShow(false), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <>
      {show && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(145deg, #dff3fc 0%, #c6e3f6 40%, #d0e6f9 80%, #e0f0fb 100%)",
            opacity: fade ? 0 : 1,
            transition: "opacity 0.6s ease",
          }}
        >
          <PreloaderParticles />

          {/* Vignette overlay */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, transparent 25%, rgba(180,215,240,0.6) 55%, rgba(150,200,235,0.85) 100%)", pointerEvents: "none" }} />

          {/* Logo + Welcome + Loading */}
          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
            {/* Logo avatar */}
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #0062ff, #00b4ff)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 28px rgba(0,98,255,0.3)" }}>
              <img src="/logo/1.png" alt="Ayres" style={{ height: 26, width: "auto", filter: "brightness(0) invert(1)" }} />
            </div>

            {/* Welcome text */}
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, fontStyle: "italic", fontFamily: "var(--font-playfair), Georgia, serif", color: "#1a3564" }}>
                Welcome to
              </p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "2.2rem", fontWeight: 900, fontStyle: "italic", fontFamily: "var(--font-playfair), Georgia, serif", color: "#0062ff", letterSpacing: "-0.02em" }}>
                Dashboard SSB Partner
              </p>
            </div>

            {/* Loading animation */}
            <div className="uv-loader">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="uv-text"><span>Loading</span></div>
              ))}
              <div className="uv-line" />
            </div>
          </div>

          <style>{`
            .uv-loader{--s:5.5em;--c:#0d2f6e;--sh:#0062ff40;--sd:#94b8db;display:flex;justify-content:center;align-items:center;overflow:hidden;user-select:none;position:relative;font-size:var(--s);font-weight:900;text-transform:uppercase;color:var(--c);width:7.3em;height:1em;filter:drop-shadow(0 0 .05em var(--sh))}
            .uv-loader .uv-text{display:flex;align-items:center;justify-content:center;text-align:center;white-space:nowrap;overflow:hidden;position:absolute}
            .uv-loader .uv-text:nth-child(1){clip-path:polygon(0 0,11.11% 0,11.11% 100%,0 100%);font-size:calc(var(--s)/20);margin-left:-2.1em;opacity:.6}
            .uv-loader .uv-text:nth-child(2){clip-path:polygon(11.11% 0,22.22% 0,22.22% 100%,11.11% 100%);font-size:calc(var(--s)/16);margin-left:-.98em;opacity:.7}
            .uv-loader .uv-text:nth-child(3){clip-path:polygon(22.22% 0,33.33% 0,33.33% 100%,22.22% 100%);font-size:calc(var(--s)/13);margin-left:-.33em;opacity:.8}
            .uv-loader .uv-text:nth-child(4){clip-path:polygon(33.33% 0,44.44% 0,44.44% 100%,33.33% 100%);font-size:calc(var(--s)/11);margin-left:-.05em;opacity:.9}
            .uv-loader .uv-text:nth-child(5){clip-path:polygon(44.44% 0,55.55% 0,55.55% 100%,44.44% 100%);font-size:calc(var(--s)/10);margin-left:0;opacity:1}
            .uv-loader .uv-text:nth-child(6){clip-path:polygon(55.55% 0,66.66% 0,66.66% 100%,55.55% 100%);font-size:calc(var(--s)/11);margin-left:.05em;opacity:.9}
            .uv-loader .uv-text:nth-child(7){clip-path:polygon(66.66% 0,77.77% 0,77.77% 100%,66.66% 100%);font-size:calc(var(--s)/13);margin-left:.33em;opacity:.8}
            .uv-loader .uv-text:nth-child(8){clip-path:polygon(77.77% 0,88.88% 0,88.88% 100%,77.77% 100%);font-size:calc(var(--s)/16);margin-left:.98em;opacity:.7}
            .uv-loader .uv-text:nth-child(9){clip-path:polygon(88.88% 0,100% 0,100% 100%,88.88% 100%);font-size:calc(var(--s)/20);margin-left:2.1em;opacity:.6}
            .uv-loader .uv-text span{animation:uv-sc 2s cubic-bezier(.1,.6,.9,.4) infinite,uv-sh 2s cubic-bezier(.1,.6,.9,.4) infinite}
            .uv-loader .uv-text:nth-child(1) span{background:linear-gradient(to right,var(--c) 4%,var(--sd) 7%);background-size:200% auto;background-clip:text;color:transparent}
            .uv-loader .uv-text:nth-child(2) span{background:linear-gradient(to right,var(--c) 9%,var(--sd) 13%);background-size:200% auto;background-clip:text;color:transparent}
            .uv-loader .uv-text:nth-child(3) span{background:linear-gradient(to right,var(--c) 15%,var(--sd) 18%);background-size:200% auto;background-clip:text;color:transparent}
            .uv-loader .uv-text:nth-child(4) span{background:linear-gradient(to right,var(--c) 20%,var(--sd) 23%);background-size:200% auto;background-clip:text;color:transparent}
            .uv-loader .uv-text:nth-child(6) span{background:linear-gradient(to right,var(--sd) 29%,var(--c) 32%);background-size:200% auto;background-clip:text;color:transparent}
            .uv-loader .uv-text:nth-child(7) span{background:linear-gradient(to right,var(--sd) 34%,var(--c) 37%);background-size:200% auto;background-clip:text;color:transparent}
            .uv-loader .uv-text:nth-child(8) span{background:linear-gradient(to right,var(--sd) 39%,var(--c) 42%);background-size:200% auto;background-clip:text;color:transparent}
            .uv-loader .uv-text:nth-child(9) span{background:linear-gradient(to right,var(--sd) 45%,var(--c) 48%);background-size:200% auto;background-clip:text;color:transparent}
            .uv-loader .uv-line{position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;height:.05em;width:calc(var(--s)/2);margin-top:.9em;border-radius:.05em}
            .uv-loader .uv-line::before{content:"";position:absolute;height:100%;width:100%;background-color:var(--c);opacity:.2}
            .uv-loader .uv-line::after{content:"";position:absolute;height:100%;width:100%;background-color:var(--c);border-radius:.05em;transform:translateX(-90%);animation:uv-w 2s cubic-bezier(.5,.8,.5,.2) infinite}
            @keyframes uv-w{0%{transform:translateX(-90%)}50%{transform:translateX(90%)}100%{transform:translateX(-90%)}}
            @keyframes uv-sc{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
            @keyframes uv-sh{0%{background-position:-98% 0}100%{background-position:102% 0}}
          `}</style>
        </div>
      )}

      <div style={{ opacity: show && !fade ? 0 : 1, transition: "opacity 0.6s ease" }}>
        {children}
      </div>
    </>
  );
}
