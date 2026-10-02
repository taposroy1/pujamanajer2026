import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatBengaliCurrency } from '../utils/bengali';

interface DonationSummaryProps {
  totalAmount: number;
  totalDonors: number;
}

export const DonationSummary: React.FC<DonationSummaryProps> = ({ totalAmount, totalDonors }) => {
  const [displayAmount, setDisplayAmount] = useState<number>(0);

  // Smooth count-up animation
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200; // 1.2s animation
    const startValue = displayAmount;
    const targetValue = totalAmount;

    if (startValue === targetValue) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(startValue + (targetValue - startValue) * ease);
      setDisplayAmount(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayAmount(targetValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [totalAmount]);

  return (
    <section className="px-4 py-3 max-w-2xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0DA983] via-[#0E9776] to-[#0A7B5F] text-white p-6 sm:p-7 shadow-xl shadow-[#0E9776]/20">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-black/10 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Header indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold tracking-wide text-emerald-50 mb-2 border border-white/20">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>সর্বমোট সংগ্রহ</span>
          </div>

          {/* Large animated amount */}
          <div className="my-1.5">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans drop-shadow-xs">
              {formatBengaliCurrency(displayAmount)}
            </h2>
          </div>

          {/* Description */}
          <p className="text-emerald-100 text-xs sm:text-sm font-medium max-w-sm mt-1">
            আপনার দানে এগিয়ে চলছে আমাদের প্রকল্পগুলো
          </p>

          {/* Transparent stats bar */}
          <div className="mt-5 pt-4 border-t border-white/20 w-full flex items-center justify-around text-center text-xs">
            <div className="flex items-center gap-1.5 text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>১০০% স্বচ্ছ হিসাব</span>
            </div>
            <div className="h-3 w-px bg-white/25" />
            <div className="flex items-center gap-1.5 text-emerald-100">
              <TrendingUp className="w-4 h-4 text-emerald-200" />
              <span>সরাসরি মন্দির তহবিল</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
