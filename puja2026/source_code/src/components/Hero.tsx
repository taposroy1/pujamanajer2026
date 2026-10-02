import React from 'react';
import { Heart, Sparkles, User, ChevronDown } from 'lucide-react';
import durgaImg from '../assets/images/durga_idol_portrait_1790847301885.jpg';
import { SiteConfig } from '../types';

interface HeroProps {
  siteConfig: SiteConfig;
  onScrollToForm: () => void;
  onOpenMyDonations: () => void;
}

export const Hero: React.FC<HeroProps> = ({ siteConfig, onScrollToForm, onOpenMyDonations }) => {
  return (
    <section className="relative pt-6 pb-4 px-4 text-center overflow-hidden">
      {/* Decorative festive subtle background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-20 right-4 w-44 h-44 bg-amber-200/30 rounded-full blur-2xl -z-10 pointer-events-none" />

      {/* Circular Durga Idol Portrait */}
      <div className="relative inline-block mx-auto mb-4 group">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-red-600 shadow-xl shadow-rose-900/10 transition-transform duration-300 group-hover:scale-105">
          <div className="w-full h-full rounded-full overflow-hidden bg-rose-50 ring-4 ring-white">
            <img
              src={durgaImg}
              alt="মা দুর্গার প্রতিমা"
              className="w-full h-full object-cover object-top scale-105 group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Heart badge indicator */}
        <div className="absolute bottom-2 -left-1 w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md border-2 border-white ring-2 ring-rose-200 animate-pulse-subtle">
          <Heart className="w-5 h-5 fill-current" />
        </div>

        {/* Small floating "ডোনেশন" badge */}
        <div className="absolute bottom-1 -right-2 px-3 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-semibold rounded-full shadow-md border-2 border-white flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>ডোনেশন</span>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="max-w-lg mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {siteConfig.templeName || 'শারদীয়া দুর্গাপূজা'}
        </h1>

        <p className="text-sm sm:text-base font-semibold text-rose-700/90 leading-snug">
          {siteConfig.location || 'মহারাজপুর (প্রীতি বাজার), বোচাগঞ্জ – দিনাজপুর'}
        </p>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 px-4">
          {siteConfig.heroDescription || 'আপনার দান মন্দিরের উন্নয়ন ও ধর্মীয়-সামাজিক কার্যক্রমে ব্যবহার করা হবে।'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
        <button
          onClick={onScrollToForm}
          className="w-full sm:w-auto flex-1 min-h-[46px] px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-base shadow-lg shadow-rose-600/25 hover:from-rose-700 hover:to-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>🤲</span>
          <span>ডোনেশন করুন</span>
          <ChevronDown className="w-4 h-4 ml-0.5 opacity-80" />
        </button>

        <button
          onClick={onOpenMyDonations}
          className="w-full sm:w-auto flex-1 min-h-[46px] px-5 py-2.5 rounded-2xl bg-white text-slate-700 hover:text-slate-900 font-semibold text-sm border border-slate-200/90 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4 text-slate-500" />
          <span>আমার ডোনেশন দেখুন</span>
        </button>
      </div>
    </section>
  );
};
