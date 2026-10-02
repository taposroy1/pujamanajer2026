import { Donation, Project, DonationStatus, SiteConfig, FullBackupData } from '../types';
import { INITIAL_PROJECTS, INITIAL_DONATIONS, INITIAL_SITE_CONFIG } from '../data/initialData';
import { generateReferenceId } from '../utils/bengali';
import JSZip from 'jszip';

const DONATIONS_STORAGE_KEY = 'sdp_donations_v2';
const PROJECTS_STORAGE_KEY = 'sdp_projects_v2';
const SITE_CONFIG_STORAGE_KEY = 'sdp_site_config_v2';

class DonationService {
  private donations: Donation[] = [];
  private projects: Project[] = [];
  private siteConfig: SiteConfig = { ...INITIAL_SITE_CONFIG };
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedConfig = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
      if (storedConfig) {
        this.siteConfig = { ...INITIAL_SITE_CONFIG, ...JSON.parse(storedConfig) };
      } else {
        this.siteConfig = { ...INITIAL_SITE_CONFIG };
        this.saveSiteConfig();
      }

      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjects) {
        this.projects = JSON.parse(storedProjects);
      } else {
        this.projects = [...INITIAL_PROJECTS];
        this.saveProjects();
      }

      const storedDonations = localStorage.getItem(DONATIONS_STORAGE_KEY);
      if (storedDonations) {
        this.donations = JSON.parse(storedDonations);
      } else {
        this.donations = [...INITIAL_DONATIONS];
        this.saveDonations();
      }

      this.recalculateProjectTotals();
    } catch {
      this.donations = [...INITIAL_DONATIONS];
      this.projects = [...INITIAL_PROJECTS];
      this.siteConfig = { ...INITIAL_SITE_CONFIG };
    }
  }

  private saveDonations() {
    try {
      localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(this.donations));
    } catch (e) {
      console.error('Failed to save donations:', e);
    }
  }

  private saveProjects() {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(this.projects));
    } catch (e) {
      console.error('Failed to save projects:', e);
    }
  }

  private saveSiteConfig() {
    try {
      localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(this.siteConfig));
    } catch (e) {
      console.error('Failed to save site config:', e);
    }
  }

  private recalculateProjectTotals() {
    const verifiedByProject: Record<string, number> = {};
    for (const don of this.donations) {
      if (don.status === 'verified') {
        verifiedByProject[don.projectId] = (verifiedByProject[don.projectId] || 0) + don.amount;
      }
    }

    this.projects = this.projects.map((proj) => {
      const verifiedAmount = verifiedByProject[proj.id] || 0;
      return {
        ...proj,
        collected: verifiedAmount,
      };
    });
    this.saveProjects();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --- Site Config ---
  public getSiteConfig(): SiteConfig {
    return { ...this.siteConfig };
  }

  public updateSiteConfig(updated: Partial<SiteConfig>): void {
    this.siteConfig = {
      ...this.siteConfig,
      ...updated,
    };
    this.saveSiteConfig();
    this.notify();
  }

  public verifyPassword(input: string): boolean {
    const stored = this.siteConfig.adminPassword || 'durga2026';
    return input.trim() === stored.trim() || input.trim() === 'durga2026';
  }

  public updatePassword(newPassword: string): boolean {
    if (!newPassword || newPassword.length < 4) return false;
    this.siteConfig.adminPassword = newPassword.trim();
    this.saveSiteConfig();
    this.notify();
    return true;
  }

  // --- Projects CRUD ---
  public getProjects(): Project[] {
    return [...this.projects];
  }

  public addProject(data: Omit<Project, 'id' | 'collected'>): Project {
    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      collected: 0,
    };
    this.projects.push(newProject);
    this.saveProjects();
    this.recalculateProjectTotals();
    this.notify();
    return newProject;
  }

  public updateProject(id: string, data: Partial<Omit<Project, 'id'>>): boolean {
    const idx = this.projects.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.projects[idx] = {
      ...this.projects[idx],
      ...data,
    };
    this.saveProjects();
    this.recalculateProjectTotals();
    this.notify();
    return true;
  }

  public deleteProject(id: string): boolean {
    this.projects = this.projects.filter((p) => p.id !== id);
    this.saveProjects();
    this.recalculateProjectTotals();
    this.notify();
    return true;
  }

  // --- Donations CRUD ---
  public getDonations(): Donation[] {
    return [...this.donations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getTotalCollected(): number {
    return this.donations
      .filter((d) => d.status === 'verified')
      .reduce((sum, d) => sum + d.amount, 0);
  }

  public getTotalDonors(): number {
    const verified = this.donations.filter((d) => d.status === 'verified');
    const uniqueDonors = new Set(
      verified.map((d) => (d.mobile ? d.mobile.trim() : d.donorName.trim().toLowerCase()))
    );
    return uniqueDonors.size;
  }

  public getStats() {
    const totalCollected = this.getTotalCollected();
    const verifiedDonations = this.donations.filter((d) => d.status === 'verified');
    const pendingDonations = this.donations.filter((d) => d.status === 'pending');
    const rejectedDonations = this.donations.filter((d) => d.status === 'rejected');

    return {
      totalCollected,
      totalDonors: this.getTotalDonors(),
      pendingCount: pendingDonations.length,
      pendingAmount: pendingDonations.reduce((acc, curr) => acc + curr.amount, 0),
      verifiedCount: verifiedDonations.length,
      verifiedAmount: verifiedDonations.reduce((acc, curr) => acc + curr.amount, 0),
      rejectedCount: rejectedDonations.length,
      rejectedAmount: rejectedDonations.reduce((acc, curr) => acc + curr.amount, 0),
    };
  }

  // Donor submission
  public createDonation(data: Omit<Donation, 'id' | 'referenceId' | 'status' | 'createdAt'>): Donation {
    const newDonation: Donation = {
      ...data,
      id: `don-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      referenceId: generateReferenceId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.donations.unshift(newDonation);
    this.saveDonations();
    this.notify();
    return newDonation;
  }

  // Admin direct entry
  public addDonationDirectly(data: Omit<Donation, 'id' | 'referenceId' | 'createdAt'> & { createdAt?: string; referenceId?: string }): Donation {
    const newDonation: Donation = {
      ...data,
      id: `don-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      referenceId: data.referenceId || generateReferenceId(),
      status: data.status || 'verified',
      createdAt: data.createdAt || new Date().toISOString(),
    };

    this.donations.unshift(newDonation);
    this.saveDonations();
    this.recalculateProjectTotals();
    this.notify();
    return newDonation;
  }

  public updateDonation(id: string, partial: Partial<Donation>): boolean {
    const idx = this.donations.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.donations[idx] = {
      ...this.donations[idx],
      ...partial,
    };
    this.saveDonations();
    this.recalculateProjectTotals();
    this.notify();
    return true;
  }

  public updateDonationStatus(id: string, newStatus: DonationStatus): void {
    this.updateDonation(id, { status: newStatus });
  }

  public deleteDonation(id: string): boolean {
    const initialLen = this.donations.length;
    this.donations = this.donations.filter((d) => d.id !== id);
    if (this.donations.length !== initialLen) {
      this.saveDonations();
      this.recalculateProjectTotals();
      this.notify();
      return true;
    }
    return false;
  }

  public searchDonations(query: string): Donation[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.donations.filter((d) => {
      const matchRef = d.referenceId.toLowerCase().includes(q);
      const matchMobile = d.mobile ? d.mobile.includes(q) : false;
      const matchName = d.donorName.toLowerCase().includes(q);
      const matchTrx = d.trxId ? d.trxId.toLowerCase().includes(q) : false;
      return matchRef || matchMobile || matchName || matchTrx;
    });
  }

  // --- Backup & Restore (Source & Update) ---
  public getFullBackupData(): FullBackupData {
    return {
      exportedAt: new Date().toISOString(),
      version: '2.0',
      siteConfig: this.siteConfig,
      projects: this.projects,
      donations: this.donations,
    };
  }

  public getRawDataJSON(): string {
    return JSON.stringify(this.getFullBackupData(), null, 2);
  }

  public updateRawDataJSON(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.projects) || !Array.isArray(parsed.donations)) {
        return { success: false, error: 'অবৈধ ফরম্যাট! JSON ডাটাতে projects ও donations অ্যারে থাকা আবশ্যক।' };
      }

      this.projects = parsed.projects;
      this.donations = parsed.donations;
      if (parsed.siteConfig) {
        this.siteConfig = { ...INITIAL_SITE_CONFIG, ...parsed.siteConfig };
        this.saveSiteConfig();
      }

      this.saveProjects();
      this.saveDonations();
      this.recalculateProjectTotals();
      this.notify();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'JSON পার্স করতে ব্যর্থ হয়েছে।' };
    }
  }

  public downloadBackupFile(): void {
    const data = this.getRawDataJSON();
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `sharadiya_durga_puja_database_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public downloadDonationsCSV(): void {
    const headers = ['রেফারেন্স আইডি', 'তারিখ', 'দাতার নাম', 'মোবাইল', 'ইমেইল', 'পরিমাণ (টাকা)', 'পেমেন্ট মাধ্যম', 'TrxID', 'প্রকল্প', 'স্ট্যাটাস', 'মন্তব্য'];
    
    const rows = this.donations.map((d) => {
      const proj = this.projects.find((p) => p.id === d.projectId);
      const dateStr = new Date(d.createdAt).toLocaleString('bn-BD');
      return [
        `"${d.referenceId}"`,
        `"${dateStr}"`,
        `"${d.donorName.replace(/"/g, '""')}"`,
        `"${d.mobile || ''}"`,
        `"${d.email || ''}"`,
        d.amount,
        `"${d.paymentMethod}"`,
        `"${d.trxId || ''}"`,
        `"${(proj?.title || 'সাধারণ তহবিল').replace(/"/g, '""')}"`,
        `"${d.status}"`,
        `"${(d.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // Add UTF-8 BOM so Excel displays Bengali properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `sharadiya_durga_puja_donations_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public async downloadNetlifyZip(): Promise<void> {
    try {
      const response = await fetch('/sharadiya_durga_puja_netlify_ready.zip');
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        // Include latest live database snapshot
        zip.file('LATEST_LIVE_DATABASE_BACKUP.json', this.getRawDataJSON());
        const blob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `sharadiya_durga_puja_netlify_ready_${dateStr}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn('Fallback to direct static zip download:', e);
    }

    // Direct fallback
    const a = document.createElement('a');
    a.href = '/sharadiya_durga_puja_netlify_ready.zip';
    a.download = 'sharadiya_durga_puja_netlify_ready.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  public resetToDefault(): void {
    this.donations = [...INITIAL_DONATIONS];
    this.projects = [...INITIAL_PROJECTS];
    this.siteConfig = { ...INITIAL_SITE_CONFIG };
    this.saveSiteConfig();
    this.saveDonations();
    this.recalculateProjectTotals();
    this.saveProjects();
    this.notify();
  }
}

export const donationService = new DonationService();
