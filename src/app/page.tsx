'use client';

import { useRef } from 'react';
import Aurora from '@/components/backgrounds/Aurora';
import { HeroSection } from '@/components/sections/hero-section';
import { CalculatorSection } from '@/components/sections/calculator-section';

export default function Home() {
  const calculatorSectionRef = useRef<HTMLDivElement>(null);

  const handleGetStartedClick = () => {
    calculatorSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-start bg-[#06060f] overflow-hidden">

      {/* 🌈 Aurora Background - FULL PAGE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Aurora
          colorStops={["#3A29FF", "#6EEB83", "#3A29FF"]}
          blend={0.1}
          amplitude={1.1}
          speed={0.6}
        />
      </div>

      {/* 🌙 Semi-transparent glass container (like React Bits) */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto mt-4 mb-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden">

        {/* Section 1 — Hero */}
        <HeroSection onGetStartedClick={handleGetStartedClick} />

        {/* Section 2 — Calculator */}
        <div ref={calculatorSectionRef}>
          <CalculatorSection />
        </div>
      </div>
    </main>
  );
}
