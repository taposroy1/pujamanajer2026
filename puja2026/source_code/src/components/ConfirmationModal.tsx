import React, { useState } from 'react';
import { Donation, Project } from '../types';
import { formatBengaliCurrency, formatBengaliDate, toBengaliNumber } from '../utils/bengali';
import { CheckCircle2, Copy, Check, Printer, Clock, X, HeartHandshake } from 'lucide-react';

interface ConfirmationModalProps {
  donation: Donation | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  donation,
  projects,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !donation) return null;

  const project = projects.find((p) => p.id === donation.projectId);

  const handleCopyId = () => {
    navigator.clipboard.writeText(donation.referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getPaymentName = (method: string) => {
    switch (method) {
      case 'cash':
        return 'ক্যাশ (নগদ)';
      case 'bkash':
        return 'বিকাশ';
      case 'nagad':
        return 'নগদ';
      case 'rocket':
        return 'রকেট';
      default:
        return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 text-center overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Verification Status Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center ring-8 ring-amber-50/50 mb-3.5">
          <Clock className="w-8 h-8" />
        </div>

        {/* Main Heading */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          আপনার ডোনেশন অনুরোধ গ্রহণ করা হয়েছে
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          অনুরোধটি মন্দির পরিচালনা কমিটির পর্যালোচনায় রয়েছে। তথ্য যাচাইয়ের পর এটি অনুমোদিত হিসেবে যুক্ত হবে।
        </p>

        {/* Reference ID card */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              ডোনেশন আইডি
            </span>
            <span className="text-base font-mono font-bold text-rose-700">
              {donation.referenceId}
            </span>
          </div>

          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>আইডি কপি</span>
              </>
            )}
          </button>
        </div>

        {/* Printable Receipt Voucher */}
        <div
          id="printable-receipt"
          className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 text-left text-xs space-y-2 mb-4"
        >
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 mb-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <HeartHandshake className="w-4 h-4 text-rose-600" />
              <span>শারদীয়া দুর্গাপূজা অনুদান রসিদ</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900">
              অপেক্ষমাণ
            </span>
          </div>

          <div className="flex justify-between py-0.5">
            <span className="text-slate-500 font-medium">দাতার নাম:</span>
            <span className="font-bold text-slate-900">{donation.donorName}</span>
          </div>

          {donation.mobile && (
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500 font-medium">মোবাইল:</span>
              <span className="font-mono text-slate-800">{toBengaliNumber(donation.mobile)}</span>
            </div>
          )}

          <div className="flex justify-between py-0.5">
            <span className="text-slate-500 font-medium">প্রকল্প:</span>
            <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
              {project ? project.title : 'সাধারণ তহবিল'}
            </span>
          </div>

          <div className="flex justify-between py-0.5">
            <span className="text-slate-500 font-medium">পেমেন্ট মাধ্যম:</span>
            <span className="font-medium text-slate-800">{getPaymentName(donation.paymentMethod)}</span>
          </div>

          {donation.trxId && (
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500 font-medium">TrxID:</span>
              <span className="font-mono font-bold text-slate-800">{donation.trxId}</span>
            </div>
          )}

          <div className="flex justify-between py-0.5 border-t border-amber-200/60 pt-2">
            <span className="text-slate-700 font-bold">পরিমাণ:</span>
            <span className="text-base font-extrabold text-rose-700">
              {formatBengaliCurrency(donation.amount)}
            </span>
          </div>

          <div className="text-[10px] text-slate-400 pt-1 text-center font-medium">
            তারিখ: {formatBengaliDate(donation.createdAt)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handlePrint}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>রসিদ প্রিন্ট / সেভ</span>
          </button>

          <button
            onClick={onClose}
            className="min-h-[44px] py-2.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold active:scale-95 transition-all"
          >
            ঠিক আছে
          </button>
        </div>
      </div>
    </div>
  );
};
