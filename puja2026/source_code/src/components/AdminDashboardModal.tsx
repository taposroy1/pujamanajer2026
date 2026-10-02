import React, { useState, useRef } from 'react';
import { Donation, Project, DonationStatus, SiteConfig } from '../types';
import { donationService } from '../services/donationService';
import { formatBengaliCurrency, formatBengaliDate, toBengaliNumber, toEnglishNumber } from '../utils/bengali';
import {
  X,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Lock,
  LogOut,
  Download,
  Upload,
  FileSpreadsheet,
  Plus,
  Edit2,
  Trash2,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  Settings,
  FolderKanban,
  Coins,
  Database,
  Phone,
  AlertTriangle,
  FileCode,
  Check,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

type AdminTab = 'donations' | 'projects' | 'settings' | 'backup' | 'password';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  projects,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('sdp_admin_auth') === 'true';
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('donations');

  // Filter & Search
  const [filterStatus, setFilterStatus] = useState<'all' | DonationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals inside Admin
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [isAddingDonation, setIsAddingDonation] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Settings Form State
  const [siteConfigState, setSiteConfigState] = useState<SiteConfig>(() => donationService.getSiteConfig());
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // JSON Raw Source Editor State
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [jsonSuccess, setJsonSuccess] = useState('');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (donationService.verifyPassword(passwordInput)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('sdp_admin_auth', 'true');
      setAuthError('');
      setSiteConfigState(donationService.getSiteConfig());
      setRawJsonText(donationService.getRawDataJSON());
    } else {
      setAuthError('ভুল পাসওয়ার্ড! সঠিক গোপন পাসওয়ার্ড দিন।');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sdp_admin_auth');
    setPasswordInput('');
  };

  const donations = donationService.getDonations();
  const stats = donationService.getStats();

  // Filtered donations
  const filteredDonations = donations.filter((d) => {
    const matchesStatus = filterStatus === 'all' ? true : d.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesSearch =
      d.donorName.toLowerCase().includes(q) ||
      (d.mobile && d.mobile.includes(q)) ||
      d.referenceId.toLowerCase().includes(q) ||
      (d.trxId && d.trxId.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  // --- Donations Handlers ---
  const handleStatusChange = (id: string, newStatus: DonationStatus) => {
    donationService.updateDonationStatus(id, newStatus);
  };

  const handleDeleteDonation = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই ডোনেশন রেকর্ডটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      donationService.deleteDonation(id);
    }
  };

  // --- Project Handlers ---
  const handleDeleteProject = (id: string) => {
    if (window.confirm('এই প্রকল্পটি ডিলিট করলে এর অধীনে থাকা ডোনেশন তথ্য সমন্বয় হতে পারে। নিশ্চিত?')) {
      donationService.deleteProject(id);
    }
  };

  // --- Settings Handlers ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    donationService.updateSiteConfig(siteConfigState);
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  // --- Password Handlers ---
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!donationService.verifyPassword(oldPassword)) {
      setPasswordMsg({ type: 'error', text: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মিলছে না।' });
      return;
    }

    const ok = donationService.updatePassword(newPassword);
    if (ok) {
      setPasswordMsg({ type: 'success', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // --- Backup & JSON Source Handlers ---
  const handleDownloadJSON = () => {
    donationService.downloadBackupFile();
  };

  const handleDownloadCSV = () => {
    donationService.downloadDonationsCSV();
  };

  const handleDownloadNetlifyZip = async () => {
    setIsDownloadingZip(true);
    try {
      await donationService.downloadNetlifyZip();
    } catch (err) {
      console.error('Failed to download Netlify ZIP:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = donationService.updateRawDataJSON(content);
        if (res.success) {
          setJsonSuccess('ফাইল থেকে সমস্ত ডাটা সফলভাবে রিস্টোর ও আপডেট করা হয়েছে!');
          setJsonError('');
          setRawJsonText(donationService.getRawDataJSON());
          setSiteConfigState(donationService.getSiteConfig());
        } else {
          setJsonError(`রিস্টোর ব্যর্থ: ${res.error}`);
          setJsonSuccess('');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveRawJson = () => {
    setJsonError('');
    setJsonSuccess('');
    const res = donationService.updateRawDataJSON(rawJsonText);
    if (res.success) {
      setJsonSuccess('সোর্স ডাটা সফলভাবে আপডেট ও সেভ করা হয়েছে!');
      setSiteConfigState(donationService.getSiteConfig());
    } else {
      setJsonError(`ত্রুটি: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-2 sm:my-6 max-h-[95vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold leading-tight">অ্যাডমিন কন্ট্রোল সেন্টার</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40">
                  নিরাপদ মোড
                </span>
              </div>
              <p className="text-xs text-slate-400">শারদীয়া দুর্গাপূজা পরিচালনা প্যানেল (A to Z নিয়ন্ত্রণ)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAuthenticated ? (
          /* Secret Password Screen */
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">গোপন অ্যাডমিন পাসওয়ার্ড দিন</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              শুধুমাত্র অনুমোদিত পরিচালনা কমিটির জন্য সংরক্ষিত। অনুমোদন ছাড়া প্রবেশ নিষেধ।
            </p>

            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="পাসওয়ার্ড লিখুন..."
                  className="w-full h-12 pl-4 pr-11 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && <p className="text-xs text-red-600 font-medium">{authError}</p>}

              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                লগইন করুন
              </button>

              <div className="pt-2 text-[11px] text-slate-400">
                ডিফল্ট পাসওয়ার্ড: <span className="font-mono font-bold text-slate-700">durga2026</span> (লগইন করে পরিবর্তনযোগ্য)
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Management Tabs */
          <div className="overflow-hidden flex-1 flex flex-col">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 overflow-x-auto">
              <button
                onClick={() => setActiveTab('donations')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'donations'
                    ? 'border-rose-600 text-rose-700 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>ডোনেশন ({toBengaliNumber(donations.length)})</span>
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'projects'
                    ? 'border-rose-600 text-rose-700 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                <span>প্রকল্পসমূহ ({toBengaliNumber(projects.length)})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'settings'
                    ? 'border-rose-600 text-rose-700 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>ওয়েবসাইট ও পেমেন্ট তথ্য</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('backup');
                  setRawJsonText(donationService.getRawDataJSON());
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'backup'
                    ? 'border-rose-600 text-rose-700 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>ডাটা সোর্স ও ব্যাকআপ</span>
              </button>

              <button
                onClick={() => setActiveTab('password')}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'password'
                    ? 'border-rose-600 text-rose-700 bg-white rounded-t-xl shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>পাসওয়ার্ড পরিবর্তন</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              {/* TAB 1: DONATIONS */}
              {activeTab === 'donations' && (
                <div className="space-y-5">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase block">সর্বমোট সংগৃহীত</span>
                      <span className="text-lg sm:text-2xl font-extrabold text-[#0DA983] block mt-1">
                        {formatBengaliCurrency(stats.totalCollected)}
                      </span>
                      <span className="text-[10px] text-emerald-700">অনুমোদিত: {toBengaliNumber(stats.verifiedCount)}টি</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                      <span className="text-[11px] font-bold text-amber-800 uppercase block">অপেক্ষমাণ অনুরোধ</span>
                      <span className="text-lg sm:text-2xl font-extrabold text-amber-600 block mt-1">
                        {toBengaliNumber(stats.pendingCount)}টি
                      </span>
                      <span className="text-[10px] text-amber-700">{formatBengaliCurrency(stats.pendingAmount)}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200">
                      <span className="text-[11px] font-bold text-blue-800 uppercase block">মোট দাতা</span>
                      <span className="text-lg sm:text-2xl font-extrabold text-blue-700 block mt-1">
                        {toBengaliNumber(stats.totalDonors)} জন
                      </span>
                      <span className="text-[10px] text-blue-600">স্বতন্ত্র দাতা</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
                      <span className="text-[11px] font-bold text-rose-800 uppercase block">বাতিলকৃত</span>
                      <span className="text-lg sm:text-2xl font-extrabold text-rose-700 block mt-1">
                        {toBengaliNumber(stats.rejectedCount)}টি
                      </span>
                      <span className="text-[10px] text-rose-600">{formatBengaliCurrency(stats.rejectedAmount)}</span>
                    </div>
                  </div>

                  {/* Actions & Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      <button
                        onClick={() => setIsAddingDonation(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        <span>নতুন ডোনেশন যুক্ত করুন</span>
                      </button>

                      <button
                        onClick={handleDownloadCSV}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>এক্সেল / CSV</span>
                      </button>
                    </div>

                    {/* Filter Segment */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                        {(['all', 'pending', 'verified', 'rejected'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                              filterStatus === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                            }`}
                          >
                            {st === 'all' && 'সব'}
                            {st === 'pending' && 'অপেক্ষমাণ'}
                            {st === 'verified' && 'অনুমোদিত'}
                            {st === 'rejected' && 'বাতিল'}
                          </button>
                        ))}
                      </div>

                      <div className="relative min-w-[200px]">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="নাম, ফোন বা আইডি..."
                          className="w-full h-8 pl-7 pr-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Donations Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-3">রেফারেন্স / তারিখ</th>
                            <th className="py-3 px-3">দাতার নাম ও যোগাযোগ</th>
                            <th className="py-3 px-3">প্রকল্প</th>
                            <th className="py-3 px-3">পরিমাণ ও মাধ্যম</th>
                            <th className="py-3 px-3">TrxID</th>
                            <th className="py-3 px-3">স্ট্যাটাস</th>
                            <th className="py-3 px-3 text-right">পদক্ষেপ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDonations.length > 0 ? (
                            filteredDonations.map((d) => (
                              <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-3">
                                  <span className="font-mono font-bold text-slate-900 block">{d.referenceId}</span>
                                  <span className="text-[10px] text-slate-400 block">{formatBengaliDate(d.createdAt)}</span>
                                </td>

                                <td className="py-3 px-3">
                                  <span className="font-bold text-slate-900 block">{d.donorName}</span>
                                  {d.mobile && <span className="font-mono text-[11px] text-slate-500 block">{d.mobile}</span>}
                                </td>

                                <td className="py-3 px-3 max-w-[140px]">
                                  <span className="truncate block font-medium text-slate-700">
                                    {projects.find((p) => p.id === d.projectId)?.title || 'সাধারণ তহবিল'}
                                  </span>
                                </td>

                                <td className="py-3 px-3">
                                  <span className="font-bold text-emerald-700 text-sm block">
                                    {formatBengaliCurrency(d.amount)}
                                  </span>
                                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                                    {d.paymentMethod}
                                  </span>
                                </td>

                                <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                                  {d.trxId || <span className="text-slate-400">—</span>}
                                </td>

                                <td className="py-3 px-3">
                                  {d.status === 'verified' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      <CheckCircle className="w-3 h-3" />
                                      <span>অনুমোদিত</span>
                                    </span>
                                  )}
                                  {d.status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      <Clock className="w-3 h-3" />
                                      <span>অপেক্ষমাণ</span>
                                    </span>
                                  )}
                                  {d.status === 'rejected' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                      <XCircle className="w-3 h-3" />
                                      <span>বাতিল</span>
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {d.status !== 'verified' && (
                                      <button
                                        onClick={() => handleStatusChange(d.id, 'verified')}
                                        title="অনুমোদন করুন"
                                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                                      >
                                        অনুমোদন
                                      </button>
                                    )}
                                    {d.status !== 'rejected' && (
                                      <button
                                        onClick={() => handleStatusChange(d.id, 'rejected')}
                                        title="বাতিল করুন"
                                        className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[10px]"
                                      >
                                        বাতিল
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setEditingDonation(d)}
                                      title="এডিট করুন"
                                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDonation(d.id)}
                                      title="মুছে ফেলুন"
                                      className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                                কোনো ডোনেশন রেকর্ড পাওয়া যায়নি।
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROJECTS */}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">মন্দির উন্নয়ন ও সেবামূলক প্রকল্পসমূহ</h4>
                      <p className="text-xs text-slate-500">নতুন প্রকল্প যোগ করুন বা চলমান প্রকল্পের বিবরণ ও লক্ষ্য এডিট করুন</p>
                    </div>
                    <button
                      onClick={() => setIsAddingProject(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>নতুন প্রকল্প যোগ করুন</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {projects.map((proj) => {
                      const percent = Math.min(100, Math.round((proj.collected / proj.target) * 100));
                      return (
                        <div key={proj.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-sm text-slate-900">{proj.title}</h5>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{proj.description}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingProject(proj)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                                title="এডিট"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                title="ডিলিট"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-bold text-[#0DA983]">{formatBengaliCurrency(proj.collected)} সংগৃহীত</span>
                              <span className="text-slate-500 font-medium">লক্ষ্য: {formatBengaliCurrency(proj.target)} ({toBengaliNumber(percent)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="bg-[#0DA983] h-full rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS & CONTACTS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">ওয়েবসাইট বিবরণ ও তথ্য আপডেট</h4>
                    <p className="text-xs text-slate-500">মন্দিরের নাম, স্থান, সভাপতি ও সাধারণ সম্পাদকের মোবাইল নম্বর এবং পেমেন্ট ওয়ালেট আপডেট করুন</p>
                  </div>

                  {settingsSavedMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 border border-emerald-200">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>তথ্য সফলভাবে সংরক্ষিত হয়েছে!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">মন্দির / উৎসবের নাম</label>
                      <input
                        type="text"
                        value={siteConfigState.templeName}
                        onChange={(e) => setSiteConfigState({ ...siteConfigState, templeName: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">স্থান ও ঠিকানা</label>
                      <input
                        type="text"
                        value={siteConfigState.location}
                        onChange={(e) => setSiteConfigState({ ...siteConfigState, location: e.target.value })}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">হিরো বিবরণী বার্তা</label>
                    <textarea
                      rows={2}
                      value={siteConfigState.heroDescription}
                      onChange={(e) => setSiteConfigState({ ...siteConfigState, heroDescription: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  {/* Committee Contacts */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-rose-600" />
                      <span>কমিটি পরিচালনা পরিষদ যোগাযোগ</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">সভাপতি নাম ও পদবি</label>
                        <input
                          type="text"
                          value={siteConfigState.primaryContact.name}
                          onChange={(e) =>
                            setSiteConfigState({
                              ...siteConfigState,
                              primaryContact: { ...siteConfigState.primaryContact, name: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">সভাপতি মোবাইল (+880...)</label>
                        <input
                          type="text"
                          value={siteConfigState.primaryContact.phone}
                          onChange={(e) =>
                            setSiteConfigState({
                              ...siteConfigState,
                              primaryContact: { ...siteConfigState.primaryContact, phone: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">সাধারণ সম্পাদক নাম</label>
                        <input
                          type="text"
                          value={siteConfigState.secondaryContact.name}
                          onChange={(e) =>
                            setSiteConfigState({
                              ...siteConfigState,
                              secondaryContact: { ...siteConfigState.secondaryContact, name: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">সাধারণ সম্পাদক মোবাইল</label>
                        <input
                          type="text"
                          value={siteConfigState.secondaryContact.phone}
                          onChange={(e) =>
                            setSiteConfigState({
                              ...siteConfigState,
                              secondaryContact: { ...siteConfigState.secondaryContact, phone: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Account Numbers */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      ডিজিটাল পেমেন্ট নম্বরসমূহ
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">বিকাশ (Send Money)</label>
                        <input
                          type="text"
                          value={siteConfigState.paymentNumbers.bkash}
                          onChange={(e) =>
                            setSiteConfigState({
                              ...siteConfigState,
                              paymentNumbers: { ...siteConfigState.paymentNumbers, bkash: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">নগদ (Send Money)</label>
                        <input
                          type="text"
                          value={siteConfigState.paymentNumbers.nagad}
                          onChange={(e) =>
                            setSiteConfigState({
                              ...siteConfigState,
                              paymentNumbers: { ...siteConfigState.paymentNumbers, nagad: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">রকেট (Send Money)</label>
                        <input
                          type="text"
                          value={siteConfigState.paymentNumbers.rocket}
                          onChange={(e) =>
                            setSiteConfigState({
                              ...siteConfigState,
                              paymentNumbers: { ...siteConfigState.paymentNumbers, rocket: e.target.value },
                            })
                          }
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>সেটিংস সংরক্ষণ করুন</span>
                  </button>
                </form>
              )}

              {/* TAB 4: BACKUP & DATA SOURCE (SOURCE AND UPDATE) */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">ডাটা সোর্স, ব্যাকআপ ও সম্পূর্ণ আপডেট</h4>
                    <p className="text-xs text-slate-500">
                      এখানে থেকে সম্পূর্ণ ওয়েবসাইটের ডাটাবেজ (ডোনেশন, প্রজেক্ট ও সেটিংস) এক ক্লিকে ডাউনলোড, ফাইল থেকে রিস্টোর বা লাইভ কোড এডিট করতে পারবেন।
                    </p>
                  </div>

                  {/* PROMINENT NETLIFY FULL WEBSITE ZIP DOWNLOAD */}
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 text-white shadow-xl border border-rose-500/20 relative overflow-hidden">
                    <div className="relative z-10 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-rose-600/90 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-900/40">
                            <Download className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-base sm:text-lg text-white">
                                সম্পূর্ণ ওয়েবসাইট জিপ (ZIP) ডাউনলোড — Netlify Ready
                              </h5>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                ১-ক্লিক ডিপ্লয়
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">
                              Netlify-তে মাত্র ১০ সেকেন্ডে ফ্রি হোস্টিংয়ে রান করার উপযোগী পূর্ণাঙ্গ ওয়েবসাইট ও সোর্স কোড প্যাকেজ
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleDownloadNetlifyZip}
                          disabled={isDownloadingZip}
                          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 active:scale-95 transition-all whitespace-nowrap cursor-pointer disabled:opacity-70"
                        >
                          {isDownloadingZip ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>প্যাকেজ তৈরি হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>ফুল ওয়েবসাইট ZIP ডাউনলোড করুন</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Netlify Deploy Steps */}
                      <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="font-bold text-amber-300 block mb-0.5">ধাপ ১: আনজিপ করুন</span>
                          <span className="text-slate-300 text-[11px] leading-relaxed">
                            ডাউনলোড করা ZIP ফাইলটি আনজিপ করুন। ভেতরে <code className="text-rose-300 font-mono">netlify_deploy_ready_dist</code> ফোল্ডারটি পাবেন।
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="font-bold text-emerald-300 block mb-0.5">ধাপ ২: Netlify Drop</span>
                          <span className="text-slate-300 text-[11px] leading-relaxed">
                            ব্রাউজারে যান: <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-rose-400 underline font-semibold">app.netlify.com/drop</a> এবং লগইন করুন।
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="font-bold text-blue-300 block mb-0.5">ধাপ ৩: ড্র্যাগ অ্যান্ড ড্রপ</span>
                          <span className="text-slate-300 text-[11px] leading-relaxed">
                            <code className="text-rose-300 font-mono">netlify_deploy_ready_dist</code> ফোল্ডারটি সরাসরি টেনে ছেড়ে দিন। সাথে সাথে সাইটটি লাইভ হয়ে যাবে!
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Download Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* JSON Database Backup */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2.5 text-slate-800">
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                          <Download className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm">সম্পূর্ণ ডাটাবেজ ব্যাকআপ (JSON)</h5>
                          <p className="text-[11px] text-slate-500">সকল তথ্য সহ একক ব্যাকআপ ফাইল ডাউনলোড</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadJSON}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>ডাটা ব্যাকআপ ডাউনলোড (JSON)</span>
                      </button>
                    </div>

                    {/* CSV / Excel Export */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2.5 text-slate-800">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm">ডোনেশন শিট এক্সপোর্ট (Excel / CSV)</h5>
                          <p className="text-[11px] text-slate-500">হিসাব-নিকাশ ও প্রিন্ট করার জন্য এক্সেল স্প্রেডশিট</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadCSV}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>এক্সেল / CSV শিট ডাউনলোড</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload / Restore Source File */}
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-amber-900">ফাইল থেকে সোর্স ডাটা আপলোড ও রিস্টোর</h5>
                        <p className="text-[11px] text-amber-800">পূর্বে ডাউনলোড করা যেকোনো .json ব্যাকআপ ফাইল আপলোড করলেই সাথে সাথে সম্পূর্ণ ডাটা আপডেট হয়ে যাবে।</p>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span>JSON সোর্স ফাইল নির্বাচন করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Live JSON Source Code Editor */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-rose-600" />
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900">সরাসরি ডাটা সোর্স (Raw JSON) এডিট ও আপডেট</h5>
                      </div>
                      <button
                        onClick={handleSaveRawJson}
                        className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>সোর্স সেভ ও সিঙ্ক করুন</span>
                      </button>
                    </div>

                    {jsonSuccess && (
                      <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl font-bold border border-emerald-200">
                        {jsonSuccess}
                      </p>
                    )}
                    {jsonError && (
                      <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-xl font-bold border border-red-200">
                        {jsonError}
                      </p>
                    )}

                    <textarea
                      rows={12}
                      value={rawJsonText}
                      onChange={(e) => setRawJsonText(e.target.value)}
                      className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      spellCheck={false}
                    />
                    <p className="text-[11px] text-slate-500">
                      টিপস: যেকোনো প্রোগ্রামার বা অ্যাডমিন এই JSON কোড সরাসরি এডিট করে প্রজেক্ট, অনুদান ও সেটিংস একবারে আপডেট করতে পারবেন।
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: PASSWORD CHANGE */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 max-w-md">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">গোপন অ্যাডমিন পাসওয়ার্ড পরিবর্তন</h4>
                    <p className="text-xs text-slate-500">যাতে অন্য কেউ ড্যাশবোর্ডে প্রবেশ করতে না পারে, আপনার পছন্দমতো গোপন পাসওয়ার্ড সেট করুন।</p>
                  </div>

                  {passwordMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold border ${
                        passwordMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {passwordMsg.text}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">বর্তমান পাসওয়ার্ড</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="বর্তমান গোপন পাসওয়ার্ড দিন"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পাসওয়ার্ড</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর)"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="আবার নতুন পাসওয়ার্ড লিখুন"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>পাসওয়ার্ড আপডেট করুন</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD MANUAL DONATION */}
      {isAddingDonation && (
        <AddDonationModal
          projects={projects}
          onClose={() => setIsAddingDonation(false)}
          onAdd={(data) => {
            donationService.addDonationDirectly(data);
            setIsAddingDonation(false);
          }}
        />
      )}

      {/* MODAL: EDIT DONATION */}
      {editingDonation && (
        <EditDonationModal
          donation={editingDonation}
          projects={projects}
          onClose={() => setEditingDonation(null)}
          onSave={(updated) => {
            donationService.updateDonation(editingDonation.id, updated);
            setEditingDonation(null);
          }}
        />
      )}

      {/* MODAL: ADD PROJECT */}
      {isAddingProject && (
        <AddProjectModal
          onClose={() => setIsAddingProject(false)}
          onAdd={(data) => {
            donationService.addProject(data);
            setIsAddingProject(false);
          }}
        />
      )}

      {/* MODAL: EDIT PROJECT */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={(updated) => {
            donationService.updateProject(editingProject.id, updated);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

/* --- SUB-MODALS FOR A-TO-Z EDITING --- */

interface AddDonationModalProps {
  projects: Project[];
  onClose: () => void;
  onAdd: (data: any) => void;
}

const AddDonationModal: React.FC<AddDonationModalProps> = ({ projects, onClose, onAdd }) => {
  const [donorName, setDonorName] = useState('');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'rocket'>('cash');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [trxId, setTrxId] = useState('');
  const [status, setStatus] = useState<DonationStatus>('verified');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(toEnglishNumber(amount), 10);
    if (!donorName.trim() || !amt || amt <= 0) return;

    onAdd({
      donorName: donorName.trim(),
      mobile: mobile.trim() || undefined,
      amount: amt,
      paymentMethod,
      projectId: projectId || projects[0]?.id,
      trxId: trxId.trim() || undefined,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
        <h4 className="text-base font-bold text-slate-900 mb-3">নতুন ডোনেশন যুক্ত করুন (অ্যাডমিন এন্ট্রি)</h4>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">দাতার নাম *</label>
            <input
              type="text"
              required
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">পরিমাণ (৳) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">মোবাইল</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">পেমেন্ট মাধ্যম</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-9 px-2 rounded-lg border border-slate-300"
              >
                <option value="cash">ক্যাশ</option>
                <option value="bkash">বিকাশ</option>
                <option value="nagad">নগদ</option>
                <option value="rocket">রকেট</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">স্ট্যাটাস</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-9 px-2 rounded-lg border border-slate-300"
              >
                <option value="verified">অনুমোদিত (Verified)</option>
                <option value="pending">অপেক্ষমাণ (Pending)</option>
                <option value="rejected">বাতিল (Rejected)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">প্রকল্প</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-slate-300"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {paymentMethod !== 'cash' && (
            <div>
              <label className="block font-semibold mb-1">TrxID</label>
              <input
                type="text"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono uppercase"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              যোগ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditDonationModalProps {
  donation: Donation;
  projects: Project[];
  onClose: () => void;
  onSave: (updated: Partial<Donation>) => void;
}

const EditDonationModal: React.FC<EditDonationModalProps> = ({ donation, projects, onClose, onSave }) => {
  const [donorName, setDonorName] = useState(donation.donorName);
  const [mobile, setMobile] = useState(donation.mobile || '');
  const [amount, setAmount] = useState(donation.amount.toString());
  const [paymentMethod, setPaymentMethod] = useState(donation.paymentMethod);
  const [projectId, setProjectId] = useState(donation.projectId);
  const [trxId, setTrxId] = useState(donation.trxId || '');
  const [status, setStatus] = useState<DonationStatus>(donation.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount, 10);
    if (!donorName.trim() || !amt) return;

    onSave({
      donorName: donorName.trim(),
      mobile: mobile.trim() || undefined,
      amount: amt,
      paymentMethod,
      projectId,
      trxId: trxId.trim() || undefined,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
        <h4 className="text-base font-bold text-slate-900 mb-3">ডোনেশন এডিট করুন ({donation.referenceId})</h4>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">দাতার নাম</label>
            <input
              type="text"
              required
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">পরিমাণ (৳)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">মোবাইল</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">পেমেন্ট মাধ্যম</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-9 px-2 rounded-lg border border-slate-300"
              >
                <option value="cash">ক্যাশ</option>
                <option value="bkash">বিকাশ</option>
                <option value="nagad">নগদ</option>
                <option value="rocket">রকেট</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">স্ট্যাটাস</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-9 px-2 rounded-lg border border-slate-300"
              >
                <option value="verified">অনুমোদিত (Verified)</option>
                <option value="pending">অপেক্ষমাণ (Pending)</option>
                <option value="rejected">বাতিল (Rejected)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">প্রকল্প</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-slate-300"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">TrxID</label>
            <input
              type="text"
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              সেভ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddProjectModalProps {
  onClose: () => void;
  onAdd: (data: Omit<Project, 'id' | 'collected'>) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState<'crane' | 'book' | 'education'>('crane');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tgt = parseInt(target, 10);
    if (!title.trim() || !tgt) return;

    onAdd({
      title: title.trim(),
      description: description.trim(),
      target: tgt,
      icon,
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
        <h4 className="text-base font-bold text-slate-900 mb-3">নতুন প্রকল্প তৈরি করুন</h4>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">প্রকল্পের শিরোনাম *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: ভোগ রান্নাঘর নির্মাণ"
              className="w-full h-9 px-3 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">বিবরণী *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="প্রকল্পের বিস্তারিত উদ্দেশ্য..."
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">লক্ষ্য পরিমাণ (টাকা) *</label>
              <input
                type="number"
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="যেমন: 50000"
                className="w-full h-9 px-3 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">আইকন ধরন</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value as any)}
                className="w-full h-9 px-2 rounded-lg border border-slate-300"
              >
                <option value="crane">🏗️ নির্মাণ (Construction)</option>
                <option value="book">📚 গ্রন্থ / শিক্ষা (Book)</option>
                <option value="education">🎓 শিশু / নীতিশিক্ষা (Child)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              প্রকল্প যুক্ত করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSave: (updated: Partial<Project>) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onSave }) => {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [target, setTarget] = useState(project.target.toString());
  const [icon, setIcon] = useState(project.icon);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tgt = parseInt(target, 10);
    if (!title.trim() || !tgt) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      target: tgt,
      icon,
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
        <h4 className="text-base font-bold text-slate-900 mb-3">প্রকল্প এডিট করুন</h4>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">প্রকল্পের শিরোনাম</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">বিবরণী</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">লক্ষ্য পরিমাণ (টাকা)</label>
              <input
                type="number"
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">আইকন ধরন</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value as any)}
                className="w-full h-9 px-2 rounded-lg border border-slate-300"
              >
                <option value="crane">🏗️ নির্মাণ (Construction)</option>
                <option value="book">📚 গ্রন্থ / শিক্ষা (Book)</option>
                <option value="education">🎓 শিশু / নীতিশিক্ষা (Child)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              আপডেট করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
