import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { ArborealLogo } from "@/components/arboreal-logo";
import Aurora from "@/components/backgrounds/Aurora";
import React from "react";

// SplitText component
const SplitText = ({ text }: { text: string }) => {
  return (
    <>
      {text.split("").map((char, idx) => (
        <span
          key={idx}
          className="inline-block transition-transform duration-500 ease-out hover:-translate-y-2"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  );
};

type HeroSectionProps = {
  onGetStartedClick: () => void;
};

export function HeroSection({ onGetStartedClick }: HeroSectionProps) {
  return (
    <section
      className="
        relative flex min-h-screen w-full flex-col items-center justify-center
        overflow-hidden px-4 py-20
        bg-black
      "
    >
      {/* AURORA */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Aurora
          colorStops={["#ffffff", "#23FF00", "#ffffff"]}
          blend={0.9}
          amplitude={1.1}
          speed={2.5}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-4">
          <ArborealLogo className="h-16 w-16 text-EMERALD-400" />
          <h1 className="font-body text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl text-white">
            <SplitText text="GREENSCORE AI" />
          </h1>
        </div>

        <p className="font-body max-w-[700px] text-lg text-white/80 md:text-xl">
          Unlock the ecological potential of your land. Upload an image to detect
          trees and calculate your property's GreenScore.
        </p>

        <Button
          size="lg"
          onClick={onGetStartedClick}
          className="font-body rounded-full border border-white bg-black text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          Get Started
          <ArrowDown className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
