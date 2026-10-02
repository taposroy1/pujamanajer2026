import React, { useState } from 'react';
import { Donation, Project } from '../types';
import { donationService } from '../services/donationService';
import { formatBengaliCurrency, formatBengaliDate, toBengaliNumber } from '../utils/bengali';
import { Search, X, CheckCircle, Clock, AlertCircle, Printer, ArrowLeft } from 'lucide-react';

interface MyDonationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

export const MyDonationsModal: React.FC<MyDonationsModalProps> = ({
  isOpen,
  onClose,
  projects,
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Donation[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Donation | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const res = donationService.searchDonations(query);
    setResults(res);
    setHasSearched(true);
  };

  const getStatusBadge = (status: Donation['status']) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>অনুমোদিত</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>বাতিলকৃত</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>অপেক্ষমাণ</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">আমার ডোনেশন খুঁজুন</h3>
            <p className="text-xs text-slate-500">
              আপনার মোবাইল নম্বর বা ডোনেশন রেফারেন্স আইডি দিয়ে স্থিতি দেখুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedReceipt ? (
          /* Receipt View */
          <div className="pt-4 overflow-y-auto flex-1 space-y-4">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ফলাফলে ফিরে যান</span>
            </button>

            <div
              id="printable-receipt"
              className="p-5 rounded-2xl bg-[#FAF8F5] border border-amber-200/80 text-left text-xs space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">শারদীয়া দুর্গাপূজা</h4>
                  <p className="text-[11px] text-slate-500">মহারাজপুর (প্রীতি বাজার), দিনাজপুর</p>
                </div>
                <div>{getStatusBadge(selectedReceipt.status)}</div>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">রেফারেন্স আইডি:</span>
                <span className="font-mono font-bold text-rose-700">{selectedReceipt.referenceId}</span>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">দাতার নাম:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.donorName}</span>
              </div>

              {selectedReceipt.mobile && (
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">মোবাইল:</span>
                  <span className="font-mono text-slate-800">{toBengaliNumber(selectedReceipt.mobile)}</span>
                </div>
              )}

              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">প্রকল্প:</span>
                <span className="font-semibold text-slate-800">
                  {projects.find((p) => p.id === selectedReceipt.projectId)?.title || 'সাধারণ তহবিল'}
                </span>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">পেমেন্ট মাধ্যম:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {selectedReceipt.paymentMethod}
                </span>
              </div>

              {selectedReceipt.trxId && (
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">TrxID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceipt.trxId}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-t border-amber-200 pt-2">
                <span className="text-slate-700 font-bold">মোট অনুদান:</span>
                <span className="text-base font-extrabold text-[#0DA983]">
                  {formatBengaliCurrency(selectedReceipt.amount)}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 text-center pt-2">
                অনুরোধের সময়: {formatBengaliDate(selectedReceipt.createdAt)}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট রসিদ</span>
              </button>
            </div>
          </div>
        ) : (
          /* Search Input & List */
          <div className="pt-4 overflow-y-auto flex-1 flex flex-col">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="মোবাইল নম্বর বা রেফারেন্স আইডি লিখুন..."
                  className="w-full h-11 pl-4 pr-11 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {results.length > 0 ? (
                results.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedReceipt(d)}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-rose-200 bg-slate-50/50 hover:bg-rose-50/30 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{d.donorName}</span>
                        {getStatusBadge(d.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        আইডি: <span className="font-mono font-medium">{d.referenceId}</span> · {formatBengaliCurrency(d.amount)}
                      </p>
                    </div>

                    <button className="text-xs font-bold text-rose-600 hover:underline">
                      রসিদ দেখুন
                    </button>
                  </div>
                ))
              ) : hasSearched ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  কোনো ডোনেশন রেকর্ড খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর বা আইডি দিন।
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  আপনার মোবাইল নম্বর বা রেফারেন্স আইডি দিয়ে সার্চ করুন।
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
