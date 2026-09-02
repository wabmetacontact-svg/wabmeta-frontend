// src/pages/DataDeletion.tsx

import React, { useState, useEffect } from "react";
import {
  Trash2,
  ChevronRight,
  Mail,
  FileText,
  Database,
  Smartphone,
  AlertTriangle,
  Clock,
  Shield,
  RefreshCw,
  Globe,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const LAST_UPDATED = "September 2, 2026";

interface Section {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
}

const sections: Section[] = [
  { id: "overview", number: "1", title: "Overview & Policy", icon: FileText },
  { id: "in-app-deletion", number: "2", title: "Option 1: In-App Deletion", icon: Smartphone },
  { id: "email-request", number: "3", title: "Option 2: Email Request", icon: Mail },
  { id: "what-gets-deleted", number: "4", title: "What Gets Deleted", icon: Database },
  { id: "before-you-delete", number: "5", title: "Before You Delete", icon: AlertTriangle },
  { id: "data-retention", number: "6", title: "What We Keep (Exceptions)", icon: Clock },
  { id: "meta-compliance", number: "7", title: "Meta Platform Compliance", icon: Globe },
  { id: "contact", number: "8", title: "Questions & Support", icon: HelpCircle },
];

const DataDeletion: React.FC = () => {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-green-100 text-sm font-medium tracking-wide uppercase">
              User Data &amp; Privacy
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
            Data Deletion Instructions
          </h1>
          <p className="text-green-100 text-base max-w-2xl leading-relaxed">
            Learn how to delete your WabMeta account and associated personal or business data. We believe in complete transparency, user autonomy, and permanent erasure upon request.
          </p>
          <div className="mt-6 flex items-center gap-2 text-green-200 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>Last updated: <strong className="text-white">{LAST_UPDATED}</strong></span>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8 items-start">

          {/* ── Sticky TOC Sidebar ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                Table of Contents
              </p>
              <nav className="space-y-0.5">
                {sections.map((s) => {
                  const Icon = s.icon;
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-all ${
                        isActive
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-green-600" : "text-gray-400"}`} />
                      <span className="leading-tight">{s.number}. {s.title}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-green-500" />}
                    </button>
                  );
                })}
              </nav>

              {/* Related Links */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  Related Documents
                </p>
                <div className="space-y-1">
                  <Link
                    to="/privacy"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-green-700 transition-colors"
                  >
                    <span>Privacy Policy</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  </Link>
                  <Link
                    to="/terms"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-green-700 transition-colors"
                  >
                    <span>Terms &amp; Conditions</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* 1. Overview */}
            <Section id="overview" number="1" title="Overview & Policy" icon={FileText}>
              <p>
                At <strong>WabMeta</strong>, we respect your right to privacy and give you full control over your personal and business data. You can delete your WabMeta account and all of its associated data at any time.
              </p>
              <p className="mt-3">
                Deletion is <strong>immediate, permanent, and irreversible</strong> &mdash; we do not retain copies of your messages, contacts, or media once deleted, and deleted accounts cannot be recovered.
              </p>
              <AlertBox type="info">
                This document provides step-by-step instructions for deleting your account and data, whether you are using the WabMeta Web Platform, WabMeta Mobile App (Android/iOS), or connected through Meta / Facebook Login.
              </AlertBox>
            </Section>

            {/* 2. Option 1: In-App Deletion */}
            <Section id="in-app-deletion" number="2" title="Option 1: In the WabMeta Mobile / Web App" icon={Smartphone}>
              <p className="mb-4">
                The fastest and most direct way to delete your account is through the self-service settings inside the WabMeta application:
              </p>

              <div className="space-y-3">
                <StepItem
                  step="1"
                  title="Sign In"
                  description="Open the WabMeta mobile application or visit the web portal and log in to your account."
                />
                <StepItem
                  step="2"
                  title="Go to Settings"
                  description="Navigate to Settings &rarr; Profile Information (or Account Settings)."
                />
                <StepItem
                  step="3"
                  title="Locate Danger Zone"
                  description="Scroll down to the Danger Zone section at the bottom of the page and click 'Delete Account'."
                />
                <StepItem
                  step="4"
                  title="Confirm with Password"
                  description="Enter your account password to verify ownership and confirm the deletion request."
                />
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-900 leading-relaxed">
                  <strong>Immediate Effect:</strong> Your account is erased immediately upon confirmation, all active sessions are invalidated, and you are signed out across all devices.
                </p>
              </div>
            </Section>

            {/* 3. Option 2: Email Request */}
            <Section id="email-request" number="3" title="Option 2: Request Deletion via Email" icon={Mail}>
              <p className="mb-3">
                If you cannot access your account, have lost access to your device, or prefer manual processing by our data protection team, you can submit a deletion request via email.
              </p>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-4 space-y-3">
                <p className="font-semibold text-gray-900 text-sm">Send your request to:</p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:privacy@wabmeta.com?subject=Data%20Deletion%20Request"
                    className="inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    privacy@wabmeta.com
                  </a>
                  <span className="text-xs text-gray-500">or</span>
                  <a
                    href="mailto:wabmetacontact@gmail.com?subject=Data%20Deletion%20Request"
                    className="text-sm font-medium text-emerald-800 hover:underline"
                  >
                    wabmetacontact@gmail.com
                  </a>
                </div>

                <div className="pt-2 text-xs text-gray-600 space-y-1">
                  <p><strong>Subject:</strong> Data Deletion Request</p>
                  <p><strong>Include in message:</strong> Your registered email address and registered business phone number.</p>
                </div>
              </div>

              <InfoBox icon="⏱️" title="Processing Timeframe" color="blue">
                We verify the authenticity of the request to prevent unauthorized deletions and complete the total data erasure within <strong>30 calendar days</strong>, in compliance with GDPR and global privacy standards.
              </InfoBox>
            </Section>

            {/* 4. What Gets Deleted */}
            <Section id="what-gets-deleted" number="4" title="What Data Gets Deleted" icon={Database}>
              <p className="mb-4">
                When your deletion request is processed, all of the following data categories are permanently purged from our active databases and file storage:
              </p>

              <BulletList
                items={[
                  "Account & Identity — Full name, email address, phone number, password hashes, and profile photo.",
                  "Organizations & Workspaces — Workspace configurations, organization metadata, and team permissions.",
                  "Customer Contacts — All contacts imported via files, manual entries, or phone address book synchronization.",
                  "Messages & Media Storage — Full chat history, sent & received messages, images, audio notes, documents, and videos.",
                  "Campaigns & Templates — WhatsApp message templates, scheduled broadcasts, analytics, and performance logs.",
                  "Chatbots & Automations — Flow diagrams, auto-reply rules, AI chatbot prompts, and webhook configurations.",
                  "WhatsApp API Credentials — Meta access tokens, Phone Number IDs, and WABA connection records.",
                  "Billing History & Balances — Wallet records, recharge logs, and stored payment references.",
                ]}
              />
            </Section>

            {/* 5. Before You Delete */}
            <Section id="before-you-delete" number="5" title="Before You Delete" icon={AlertTriangle}>
              <p className="mb-3">
                Please review these important considerations before confirming your account deletion:
              </p>

              <div className="space-y-3">
                <InfoBox icon="👥" title="Team & Organization Ownership" color="green">
                  If you are the owner of an organization that contains other team members, you will need to transfer ownership to another administrator or remove all members first. This ensures remaining teammates do not lose their business access unexpectedly.
                </InfoBox>

                <InfoBox icon="📱" title="Your WhatsApp Business Account (WABA)" color="blue">
                  Deleting your WabMeta account disconnects WabMeta from your WhatsApp Business Account. However, your WhatsApp Business Account itself continues to exist under your Meta Business Manager. WabMeta only removes its API connection and access tokens.
                </InfoBox>
              </div>

              <AlertBox type="warning">
                <strong>Irreversible Action:</strong> Once deletion is complete, data cannot be recovered under any circumstances. If you wish to retain your customer contacts or conversation archives, please export them before proceeding.
              </AlertBox>
            </Section>

            {/* 6. What We Keep (Exceptions) */}
            <Section id="data-retention" number="6" title="What We Keep (Legal Exceptions)" icon={Clock}>
              <p>
                Where strictly required by statutory, tax, or accounting laws, we retain a minimal record of past financial invoices and transaction amounts:
              </p>
              <div className="mt-3">
                <BulletList
                  items={[
                    "Invoice numbers, transaction IDs, tax amounts, and dates for statutory financial audits.",
                    "No customer contacts, chats, templates, or communication media are included in these financial records.",
                  ]}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600">
                These minimal financial logs are held in isolated, restricted storage solely to satisfy statutory legal compliance and are automatically purged once the statutory retention window expires.
              </p>
            </Section>

            {/* 7. Meta Platform Compliance */}
            <Section id="meta-compliance" number="7" title="Meta Platform Data Deletion Compliance" icon={Globe}>
              <p className="mb-3">
                In compliance with Meta Platform Terms and Facebook Login Data Deletion requirements, users who authenticated or connected services via Meta/Facebook can request data removal directly:
              </p>
              <BulletList
                items={[
                  "Remove the WabMeta app connection in your Facebook Settings &rarr; Apps and Websites.",
                  "Facebook sends an automated Data Deletion Callback to WabMeta's secure server endpoint.",
                  "WabMeta immediately initiates deletion of your platform identifiers and returns a unique confirmation tracking code.",
                  "You can also use this page or contact our privacy desk to verify the completion of your deletion request.",
                ]}
              />
            </Section>

            {/* 8. Questions & Support */}
            <Section id="contact" number="8" title="Questions & Support" icon={HelpCircle}>
              <p className="mb-4">
                If you have questions about our data deletion practices, need assistance exporting your records, or want to verify data erasure status, please reach out to us:
              </p>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Platform</p>
                    <p className="font-semibold text-gray-900">WabMeta Privacy &amp; Data Protection</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Privacy Desk Email</p>
                    <a
                      href="mailto:privacy@wabmeta.com"
                      className="font-semibold text-green-700 hover:underline"
                    >
                      privacy@wabmeta.com
                    </a>
                  </div>
                </div>
              </div>
            </Section>

            {/* Footer note */}
            <div className="bg-gray-100 rounded-2xl p-5 text-center border border-gray-200">
              <p className="text-sm text-gray-500">
                WabMeta adheres to strict data privacy regulations including GDPR, CCPA, and Meta Platform Policies.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                © {new Date().getFullYear()} WabMeta. All rights reserved.
              </p>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

/* ─── Reusable Sub-components (Matching Privacy & Terms style) ───────────── */

interface SectionProps {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, number, title, icon: Icon, children }) => (
  <section
    id={id}
    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm scroll-mt-6"
  >
    {/* Section header */}
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
      <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          {number}
        </span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
    </div>
    <div className="text-gray-700 leading-relaxed text-sm space-y-2">
      {children}
    </div>
  </section>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const AlertBox: React.FC<{ type: "warning" | "info"; children: React.ReactNode }> = ({ type, children }) => {
  const styles = {
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };
  return (
    <div className={`${styles[type]} rounded-xl p-4 border text-sm leading-relaxed mt-4`}>
      {type === "warning" && <span className="mr-2">⚠️</span>}
      {children}
    </div>
  );
};

const InfoBox: React.FC<{ icon: string; title: string; color: "blue" | "green"; children: React.ReactNode }> = ({
  icon,
  title,
  color,
  children,
}) => {
  const styles = {
    blue: "bg-blue-50 border-blue-100",
    green: "bg-green-50 border-green-100",
  };
  return (
    <div className={`${styles[color]} rounded-xl p-4 border`}>
      <p className="font-semibold text-gray-800 text-sm mb-1.5">
        {icon} {title}
      </p>
      <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
};

const StepItem: React.FC<{ step: string; title: string; description: string }> = ({
  step,
  title,
  description,
}) => (
  <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3.5">
    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
      {step}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{description}</p>
    </div>
  </div>
);

export default DataDeletion;
