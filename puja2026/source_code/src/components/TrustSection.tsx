import React from 'react';
import { ShieldCheck, BarChart2, Zap } from 'lucide-react';

export const TrustSection: React.FC = () => {
  return (
    <section className="px-4 py-3 max-w-2xl mx-auto">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Card 1: Safe */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100/90 shadow-xs flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-800">নিরাপদ</h4>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
            আপনার তথ্য সুরক্ষিত রাখা হবে
          </p>
        </div>

        {/* Card 2: Transparent */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100/90 shadow-xs flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-800">স্বচ্ছ</h4>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
            ডোনেশনের হিসাব স্বচ্ছভাবে সংরক্ষণ
          </p>
        </div>

        {/* Card 3: Fast */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100/90 shadow-xs flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-800">দ্রুত</h4>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
            ডোনেশন তথ্য দ্রুত যাচাই করা হবে
          </p>
        </div>
      </div>
    </section>
  );
};
