import React, { useState, useEffect } from 'react';
import { Project, PaymentMethodType, SiteConfig } from '../types';
import { PAYMENT_CONFIGS } from '../data/initialData';
import { toBengaliNumber, toEnglishNumber } from '../utils/bengali';
import {
  User,
  Phone,
  Mail,
  Copy,
  Check,
  Building2,
  DollarSign,
} from 'lucide-react';

interface DonationFormProps {
  projects: Project[];
  selectedProjectId: string;
  siteConfig: SiteConfig;
  onSelectProjectId: (id: string) => void;
  onSubmitDonation: (data: {
    donorName: string;
    mobile?: string;
    email?: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    trxId?: string;
    projectId: string;
  }) => void;
}

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000];

export const DonationForm: React.FC<DonationFormProps> = ({
  projects,
  selectedProjectId,
  siteConfig,
  onSelectProjectId,
  onSubmitDonation,
}) => {
  const [donorName, setDonorName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [amountStr, setAmountStr] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync preset selection state
  const numericAmount = parseInt(toEnglishNumber(amountStr), 10) || 0;

  const handlePresetSelect = (preset: number) => {
    setAmountStr(preset.toString());
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = toEnglishNumber(raw).replace(/[^0-9]/g, '');
    setAmountStr(sanitized);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const handleCopyAccount = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!donorName.trim()) {
      newErrors.donorName = 'দয়া করে আপনার পুরো নাম লিখুন';
    }

    const parsedAmt = parseInt(toEnglishNumber(amountStr), 10);
    if (!parsedAmt || isNaN(parsedAmt) || parsedAmt <= 0) {
      newErrors.amount = 'সঠিক ডোনেশন পরিমাণ লিখুন (ন্যূনতম ৳১০)';
    }

    if (mobile.trim()) {
      const sanitizedMobile = toEnglishNumber(mobile.trim()).replace(/\D/g, '');
      if (sanitizedMobile.length < 10 || sanitizedMobile.length > 13) {
        newErrors.mobile = 'সঠিক মোবাইল নম্বর প্রদান করুন (১১ ডিজিট)';
      }
    }

    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'সঠিক ইমেইল ঠিকানা প্রদান করুন';
    }

    // If digital method, require transaction ID for real-world reconciliation
    if (paymentMethod !== 'cash' && !trxId.trim()) {
      newErrors.trxId = 'পেমেন্ট সফল হওয়ার পর ফিরতি এসএমএসের TrxID লিখুন';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitDonation({
        donorName: donorName.trim(),
        mobile: mobile.trim() ? toEnglishNumber(mobile.trim()) : undefined,
        email: email.trim() || undefined,
        amount: parsedAmt,
        paymentMethod,
        trxId: trxId.trim() || undefined,
        projectId: selectedProjectId || projects[0]?.id || 'project-tin-shed',
      });
      setIsSubmitting(false);
    }, 400);
  };

  const baseConfig = PAYMENT_CONFIGS[paymentMethod];
  const activeConfig = {
    ...baseConfig,
    accountNumber:
      paymentMethod !== 'cash' && siteConfig.paymentNumbers?.[paymentMethod]
        ? siteConfig.paymentNumbers[paymentMethod]
        : baseConfig.accountNumber,
  };

  return (
    <section className="px-4 py-5 max-w-2xl mx-auto" id="donation-form-section">
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-lg shadow-slate-100/80">
        {/* Quick Amount Section */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-800 mb-2.5">
            দ্রুত পরিমাণ নির্বাচন
          </label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = numericAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handlePresetSelect(amt)}
                  className={`min-h-[44px] py-2 px-1 rounded-2xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center border active:scale-95 ${
                    isSelected
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-400'
                      : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
                  }`}
                >
                  ৳{toBengaliNumber(amt)}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>প্রকল্প নির্বাচন</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProjectId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.title}
                </option>
              ))}
            </select>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>আপনার নাম <span className="text-rose-600">*</span></span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={donorName}
                onChange={(e) => {
                  setDonorName(e.target.value);
                  if (errors.donorName) setErrors((prev) => ({ ...prev, donorName: '' }));
                }}
                placeholder="পুরো নাম"
                className={`w-full h-12 px-4 rounded-2xl border bg-slate-50/40 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.donorName
                    ? 'border-red-400 ring-2 ring-red-100 focus:border-red-500'
                    : 'border-slate-200 focus:border-rose-500 focus:ring-rose-500/20'
                }`}
              />
            </div>
            {errors.donorName && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.donorName}</p>
            )}
          </div>

          {/* Mobile Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>মোবাইল নম্বর (ঐচ্ছিক)</span>
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
              }}
              placeholder="01XXXXXXXXX"
              className={`w-full h-12 px-4 rounded-2xl border bg-slate-50/40 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.mobile
                  ? 'border-red-400 ring-2 ring-red-100'
                  : 'border-slate-200 focus:border-rose-500 focus:ring-rose-500/20'
              }`}
            />
            {errors.mobile && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.mobile}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>ইমেইল (ঐচ্ছিক — রসিদ পেতে)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="email@example.com"
              className={`w-full h-12 px-4 rounded-2xl border bg-slate-50/40 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-red-400 ring-2 ring-red-100'
                  : 'border-slate-200 focus:border-rose-500 focus:ring-rose-500/20'
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" />
              <span>পরিমাণ (৳) <span className="text-rose-600">*</span></span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                ৳
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="পরিমাণ লিখুন"
                className={`w-full h-12 pl-9 pr-4 rounded-2xl border bg-slate-50/40 text-slate-900 text-base font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.amount
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-rose-500 focus:ring-rose-500/20'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.amount}</p>
            )}
          </div>

          {/* Payment Methods Section */}
          <div className="pt-2">
            <label className="block text-sm font-bold text-slate-800 mb-2.5">
              পেমেন্ট মাধ্যম
            </label>
            <div className="grid grid-cols-4 gap-2">
              {/* Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`min-h-[58px] p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  paymentMethod === 'cash'
                    ? 'bg-rose-50/80 border-rose-500 text-rose-700 shadow-xs ring-1 ring-rose-400'
                    : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center text-lg">
                  💵
                </div>
                <span className="text-xs font-bold leading-tight">ক্যাশ</span>
              </button>

              {/* bKash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`min-h-[58px] p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  paymentMethod === 'bkash'
                    ? 'bg-pink-50 border-[#D12053] text-[#D12053] shadow-xs ring-1 ring-[#D12053]'
                    : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center text-lg">
                  📱
                </div>
                <span className="text-xs font-bold leading-tight">বিকাশ</span>
              </button>

              {/* Nagad */}
              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`min-h-[58px] p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  paymentMethod === 'nagad'
                    ? 'bg-orange-50 border-[#F7941D] text-[#F7941D] shadow-xs ring-1 ring-[#F7941D]'
                    : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center text-lg">
                  📱
                </div>
                <span className="text-xs font-bold leading-tight">নগদ</span>
              </button>

              {/* Rocket */}
              <button
                type="button"
                onClick={() => setPaymentMethod('rocket')}
                className={`min-h-[58px] p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  paymentMethod === 'rocket'
                    ? 'bg-purple-50 border-[#8C3494] text-[#8C3494] shadow-xs ring-1 ring-[#8C3494]'
                    : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center text-lg">
                  🚀
                </div>
                <span className="text-xs font-bold leading-tight">রকেট</span>
              </button>
            </div>
          </div>

          {/* Payment Instructions Area */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 transition-all">
            {activeConfig.accountNumber && (
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {activeConfig.name} {activeConfig.accountType} নম্বর
                  </span>
                  <span className="text-base sm:text-lg font-mono font-bold text-slate-900 tracking-wider">
                    {activeConfig.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAccount(activeConfig.accountNumber!)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step by step guide */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 block">
                পেমেন্ট নির্দেশিকা:
              </span>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {activeConfig.instructions.map((inst, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {inst}
                  </li>
                ))}
              </ul>
            </div>

            {/* Digital payment TrxID field */}
            {paymentMethod !== 'cash' && (
              <div className="mt-4 pt-3 border-t border-slate-200/80">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  ট্রানজেকশন আইডি (TrxID) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => {
                    setTrxId(e.target.value.toUpperCase());
                    if (errors.trxId) setErrors((prev) => ({ ...prev, trxId: '' }));
                  }}
                  placeholder="যেমন: BKS90823412"
                  className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm font-mono font-bold placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 uppercase transition-all ${
                    errors.trxId
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-slate-300 focus:border-rose-500 focus:ring-rose-500/20'
                  }`}
                />
                {errors.trxId && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.trxId}</p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  টাকা পাঠানোর পর প্রাপ্ত SMS-এর TrxID এখানে লিখুন। অ্যাডমিন যাচাই করবেন।
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[50px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-base shadow-lg shadow-rose-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-lg">🤲</span>
                  <span>ডোনেশন জমা দিন</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 mt-2.5 font-medium">
              আপনার ডোনেশন অ্যাডমিন অনুমোদনের পর যুক্ত হবে
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};
