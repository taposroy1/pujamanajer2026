/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DonationSummary } from './components/DonationSummary';
import { ProjectSection } from './components/ProjectSection';
import { DonationForm } from './components/DonationForm';
import { TrustSection } from './components/TrustSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ConfirmationModal } from './components/ConfirmationModal';
import { MyDonationsModal } from './components/MyDonationsModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { donationService } from './services/donationService';
import { Donation, Project, PaymentMethodType, SiteConfig } from './types';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => donationService.getProjects());
  const [totalAmount, setTotalAmount] = useState<number>(() => donationService.getTotalCollected());
  const [totalDonors, setTotalDonors] = useState<number>(() => donationService.getTotalDonors());
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => donationService.getSiteConfig());

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || 'project-tin-shed'
  );

  // Modals state
  const [recentDonation, setRecentDonation] = useState<Donation | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState<boolean>(false);
  const [isMyDonationsOpen, setIsMyDonationsOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Subscribe to reactive service changes
  useEffect(() => {
    const unsubscribe = donationService.subscribe(() => {
      setProjects(donationService.getProjects());
      setTotalAmount(donationService.getTotalCollected());
      setTotalDonors(donationService.getTotalDonors());
      setSiteConfig(donationService.getSiteConfig());
    });
    return () => unsubscribe();
  }, []);

  const handleScrollToForm = () => {
    const formElement = document.getElementById('donation-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectProjectFromCard = (projId: string) => {
    setSelectedProjectId(projId);
    handleScrollToForm();
  };

  const handleDonationSubmit = (data: {
    donorName: string;
    mobile?: string;
    email?: string;
    amount: number;
    paymentMethod: PaymentMethodType;
    trxId?: string;
    projectId: string;
  }) => {
    const newDonation = donationService.createDonation(data);
    setRecentDonation(newDonation);
    setIsConfirmationOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* Top Navbar with discreet Admin Login */}
      <Navbar
        onOpenMyDonations={() => setIsMyDonationsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onScrollToForm={handleScrollToForm}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto pb-12">
        {/* Hero Section */}
        <Hero
          siteConfig={siteConfig}
          onScrollToForm={handleScrollToForm}
          onOpenMyDonations={() => setIsMyDonationsOpen(true)}
        />

        {/* Donation Summary Animated Gradient Card */}
        <DonationSummary totalAmount={totalAmount} totalDonors={totalDonors} />

        {/* Projects Section */}
        <ProjectSection
          projects={projects}
          onSelectProject={handleSelectProjectFromCard}
        />

        {/* Donation Form */}
        <DonationForm
          projects={projects}
          selectedProjectId={selectedProjectId}
          siteConfig={siteConfig}
          onSelectProjectId={setSelectedProjectId}
          onSubmitDonation={handleDonationSubmit}
        />

        {/* Trust Section */}
        <TrustSection />

        {/* Contact Section */}
        <ContactSection siteConfig={siteConfig} />
      </main>

      {/* Footer */}
      <Footer siteConfig={siteConfig} onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        donation={recentDonation}
        projects={projects}
      />

      {/* My Donations Finder Modal */}
      <MyDonationsModal
        isOpen={isMyDonationsOpen}
        onClose={() => setIsMyDonationsOpen(false)}
        projects={projects}
      />

      {/* Admin Management Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        projects={projects}
      />
    </div>
  );
}
