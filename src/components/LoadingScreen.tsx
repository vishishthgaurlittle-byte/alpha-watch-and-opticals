"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Premium animated loading screen: watch parts assembling into the logo,
// gold particles, lens flare glow and a live progress bar.
export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(100, v + Math.random() * 6 + 2);
      setProgress(Math.floor(v));
      if (v >= 100) clearInterval(id);
    }, 90);
    return () => clearInterval(id);
  }, []);

  const done = progress >= 100;
  const gap = Math.max(0, 110 - progress * 1.1);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy-950 text-ivory overflow-hidden"
      animate={done ? { opacity: 0, scale: 1.06 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      style={{ pointerEvents: done ? "none" : "auto" }}
    >
      {/* gold particle field */}
      {Array.from({ length: 26 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold"
          style={{ width: 3 + (i % 3), height: 3 + (i % 3), left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.1 }}
        />
      ))}

      {/* lens flare glow */}
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(198,161,91,0.35), transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Watch parts assembling into emblem */}
      <div className="relative w-40 h-40 mb-8">
        {/* case ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-gold/80"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transform: `translateY(${gap * 0.3}px)` }}
        />
        {/* gear */}
        <motion.svg
          viewBox="0 0 100 100" className="absolute inset-3"
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transform: `translateY(${gap * 0.4}px)` }}
        >
          <g fill="var(--accent)">
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x="47" y="4" width="6" height="14" rx="2"
                transform={`rotate(${i * 30} 50 50)`} />
            ))}
            <circle cx="50" cy="50" r="26" />
          </g>
          <circle cx="50" cy="50" r="12" fill="var(--bg)" />
        </motion.svg>
        {/* hands */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `translateY(${gap * 0.2}px)`, opacity: 1 - gap / 130 }}
        >
          <svg viewBox="0 0 100 100" className="w-16 h-16">
            <line x1="50" y1="50" x2="50" y2="26" stroke="var(--text)" strokeWidth="4" strokeLinecap="round" />
            <line x1="50" y1="50" x2="68" y2="58" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="50" cy="50" r="3" fill="var(--accent)" />
          </svg>
        </motion.div>
      </div>

      {/* Logo text reveal */}
      <motion.h1
        className="font-serif text-3xl sm:text-4xl tracking-wide"
        initial={{ opacity: 0, y: 10, letterSpacing: "0.4em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0.12em" }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <span className="gold-text">ALPHA</span>
      </motion.h1>
      <motion.p
        className="uppercase tracking-[0.35em] text-xs sm:text-sm mt-2 text-ivory/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Watch &amp; Opticals
      </motion.p>

      {/* Progress bar */}
      <div className="w-56 h-1.5 mt-10 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold to-gold-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-3 text-xs text-ivory/60 tabular-nums">{progress}%</div>

      <div className="mt-8 text-[10px] uppercase tracking-[0.3em] text-ivory/40">
        Indira Nagar · Raebareli
      </div>
    </motion.div>
  );
}
