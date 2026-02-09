"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
}

export default function CountdownTimer({
  targetDate,
  onComplete,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (isComplete) {
    return (
      <div className="text-center">
        <p className="text-lg font-bold gradient-text">LIVE NOW</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-center">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="text-center">
          <div className="w-16 h-16 rounded-lg bg-white/5 border border-[var(--card-border)] flex items-center justify-center">
            <span className="text-2xl font-bold font-mono">
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 capitalize">{label}</p>
        </div>
      ))}
    </div>
  );
}
