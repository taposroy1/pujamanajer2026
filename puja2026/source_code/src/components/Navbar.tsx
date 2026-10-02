import React from 'react';
import { Heart, Search, ShieldCheck } from 'lucide-react';
import durgaImg from '../assets/images/durga_idol_portrait_1790847301885.jpg';

interface NavbarProps {
  onOpenMyDonations: () => void;
  onOpenAdmin: () => void;
  onScrollToForm: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMyDonations,
  onOpenAdmin,
  onScrollToForm,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-rose-100/80 transition-all">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full ring-2 ring-rose-400/80 overflow-hidden bg-rose-100 shrink-0">
            <img
              src={durgaImg}
              alt="মা দুর্গা"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
              শারদীয়া দুর্গাপূজা
            </h1>
            <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 truncate max-w-[170px] sm:max-w-xs">
              মহারাজপুর (প্রীতি বাজার), দিনাজপুর
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenMyDonations}
            title="আমার ডোনেশন খুঁজুন"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition-colors active:scale-95"
          >
            <Search className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">আমার ডোনেশন</span>
            <span className="sm:hidden">খুঁজুন</span>
          </button>

          <button
            onClick={onScrollToForm}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>দান করুন</span>
          </button>

          {/* Discreet Admin Secret Login */}
          <button
            onClick={onOpenAdmin}
            title="গোপন অ্যাডমিন লগইন"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">লগইন</span>
          </button>
        </div>
      </div>
    </header>
  );
};
