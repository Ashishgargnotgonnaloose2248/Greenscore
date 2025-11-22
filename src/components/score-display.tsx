'use client';

import React, { useEffect, useRef } from 'react';

type ScoreDisplayProps = {
  score: number; // 0-100
  treeCount: number;
  className?: string;
};

export function ScoreDisplay({ score, treeCount, className = '' }: ScoreDisplayProps) {
  // clamp
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const size = 180;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const gradientId = 'gauge-gradient';

  // small animation on mount
  const circleRef = useRef<SVGCircleElement | null>(null);
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.transition = 'stroke-dashoffset 900ms cubic-bezier(.22,.9,.41,1)';
      circleRef.current.style.strokeDashoffset = String(offset);
    }
  }, [offset]);

  const label =
    value >= 75 ? 'Excellent' : value >= 50 ? 'Good' : value >= 30 ? 'Fair' : 'Poor';

  return (
    <div
      className={`w-full max-w-[520px] mx-auto flex flex-col items-center gap-4 ${className}`}
    >
      <div className="relative">
        {/* Glow ring */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full blur-3xl opacity-30"
          style={{
            background:
              value >= 75
                ? 'radial-gradient(circle, rgba(34,197,94,0.25), transparent 40%)'
                : value >= 50
                ? 'radial-gradient(circle, rgba(250,204,21,0.18), transparent 40%)'
                : 'radial-gradient(circle, rgba(239,68,68,0.14), transparent 40%)',
            filter: 'blur(30px)',
            zIndex: -1,
          }}
        />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="1">
              <stop offset="0%" stopColor="#6EEB83" />
              <stop offset="60%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
            fill="none"
          />

          {/* Progress arc */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference}
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))' }}
          />
          {/* inner circle for dark center */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - stroke / 2}
            fill="rgba(0,0,0,0.45)"
            stroke="transparent"
          />
          {/* Text */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="36"
            fontWeight={800}
            fill="white"
          >
            {value}
          </text>
          <text
            x="50%"
            y={size / 2 + 28}
            textAnchor="middle"
            fontSize="12"
            fill="rgba(255,255,255,0.7)"
          >
            /100
          </text>
        </svg>
      </div>

      <div className="text-center">
        <div className="text-sm text-white/80 font-medium">{label}</div>
        <div className="mt-2 flex items-center justify-center gap-4">
          <div className="text-xs text-white/70">
            Trees detected
            <div className="text-2xl font-bold text-emerald-400">{treeCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreDisplay;
