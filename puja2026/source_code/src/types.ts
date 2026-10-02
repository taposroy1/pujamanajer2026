export type PaymentMethodType = 'cash' | 'bkash' | 'nagad' | 'rocket';

export type DonationStatus = 'pending' | 'verified' | 'rejected';

export interface Donation {
  id: string;
  donorName: string;
  mobile?: string;
  email?: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  trxId?: string;
  projectId: string;
  referenceId: string;
  status: DonationStatus;
  createdAt: string;
  notes?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  collected: number;
  target: number;
  icon: 'crane' | 'book' | 'education';
}

export interface PaymentMethodConfig {
  id: PaymentMethodType;
  name: string;
  iconName: string;
  badge: string;
  accountNumber?: string;
  accountType?: string;
  instructions: string[];
}

export interface SiteConfig {
  templeName: string;
  location: string;
  heroDescription: string;
  primaryContact: {
    name: string;
    designation: string;
    phone: string;
  };
  secondaryContact: {
    name: string;
    designation: string;
    phone: string;
  };
  paymentNumbers: {
    bkash: string;
    nagad: string;
    rocket: string;
  };
  adminPassword: string;
}

export interface FullBackupData {
  exportedAt: string;
  version: string;
  siteConfig: SiteConfig;
  projects: Project[];
  donations: Donation[];
}

