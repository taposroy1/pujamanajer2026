import React from 'react';
import { Lock } from 'lucide-react';
import durgaImg from '../assets/images/durga_idol_portrait_1790847301885.jpg';
import { SiteConfig } from '../types';

interface FooterProps {
  siteConfig: SiteConfig;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ siteConfig, onOpenAdmin }) => {
  return (
    <footer className="mt-8 border-t border-rose-100 bg-white/60 py-8 px-4 text-center">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Emblem */}
        <div className="w-12 h-12 rounded-full overflow-hidden mx-auto ring-2 ring-rose-300">
          <img
            src={durgaImg}
            alt="শারদীয়া দুর্গাপূজা"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">
            {siteConfig.templeName || 'শারদীয়া দুর্গাপূজা'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {siteConfig.location || 'মহারাজপুর (প্রীতি বাজার), বোচাগঞ্জ, দিনাজপুর'}
          </p>
        </div>

        {/* Social Icons (Facebook & YouTube) */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook Page"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#1877F2] text-slate-600 hover:text-white flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube Channel"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#FF0000] text-slate-600 hover:text-white flex items-center justify-center transition-all duration-200"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-slate-500 pt-2">
          © 2026 শারদীয়া দুর্গাপূজা। সর্বস্বত্ব সংরক্ষিত।
        </p>

        {/* Admin Link */}
        <div className="pt-2">
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>অ্যাডমিন ম্যানেজমেন্ট পোর্টাল</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
