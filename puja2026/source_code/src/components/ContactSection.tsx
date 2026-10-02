import React, { useState } from 'react';
import { Phone, PhoneCall, Copy, Check } from 'lucide-react';
import { SiteConfig } from '../types';

interface ContactSectionProps {
  siteConfig: SiteConfig;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteConfig }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const contacts = [
    {
      name: siteConfig.primaryContact.name || 'কৃষ্ণ কান্ত রায়',
      designation: siteConfig.primaryContact.designation || 'সভাপতি',
      phone: siteConfig.primaryContact.phone || '+8801345280094',
      rawPhone: siteConfig.primaryContact.phone || '+8801345280094',
    },
    {
      name: siteConfig.secondaryContact.name || 'তাপস চন্দ্র রায়',
      designation: siteConfig.secondaryContact.designation || 'সাধারণ সম্পাদক',
      phone: siteConfig.secondaryContact.phone || '+8801345388711',
      rawPhone: siteConfig.secondaryContact.phone || '+8801345388711',
    },
  ];

  const handleCopy = (phone: string, index: number) => {
    navigator.clipboard.writeText(phone);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="px-4 py-5 max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        {/* Heading */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              যোগাযোগ করুন
            </h3>
            <p className="text-xs text-slate-500">
              যেকোনো জিজ্ঞাসা বা সহযোগিতার জন্য সরাসরি কথা বলুন
            </p>
          </div>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-rose-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100/70 text-rose-700 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{contact.name}</h4>
                  <span className="text-xs text-rose-600 font-semibold">{contact.designation}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${contact.rawPhone}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-mono">{contact.phone}</span>
                </a>

                <button
                  onClick={() => handleCopy(contact.rawPhone, index)}
                  title="নম্বর কপি করুন"
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
