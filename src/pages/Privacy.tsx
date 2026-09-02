// src/pages/Privacy.tsx

import React, { useState, useEffect } from "react";
import {
  Shield,
  ChevronRight,
  Mail,
  FileText,
  Database,
  Smartphone,
  Zap,
  Globe,
  Clock,
  Lock,
  UserCheck,
  RefreshCw,
} from "lucide-react";

const LAST_UPDATED = "September 2, 2026";

interface Section {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
}

const sections: Section[] = [
  { id: "introduction", number: "1", title: "Introduction", icon: FileText },
  { id: "data-we-collect", number: "2", title: "Data We Collect", icon: Database },
  { id: "mobile-app", number: "3", title: "The Mobile App", icon: Smartphone },
  { id: "how-we-use", number: "4", title: "How We Use Your Data", icon: Zap },
  { id: "sharing", number: "5", title: "Who We Share With", icon: Globe },
  { id: "retention", number: "6", title: "How Long We Keep It", icon: Clock },
  { id: "security", number: "7", title: "Security", icon: Lock },
  { id: "your-rights", number: "8", title: "Your Rights", icon: UserCheck },
  { id: "responsibilities", number: "9", title: "Your Responsibilities", icon: Shield },
  { id: "changes", number: "10", title: "Changes to This Policy", icon: RefreshCw },
  { id: "contact", number: "11", title: "Contact Us", icon: Mail },
];

const Privacy: React.FC = () => {
  const [activeSection, setActiveSection] = useState("introduction");

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
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-green-100 text-sm font-medium tracking-wide uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-green-100 text-base max-w-2xl leading-relaxed">
            What we collect, why we collect it, who it reaches and how you stay in control. This policy covers the Wabmeta website and the Wabmeta mobile app for Android and iOS.
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-all ${isActive
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
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* 1. Introduction */}
            <Section id="introduction" number="1" title="Introduction" icon={FileText}>
              <p>
                <strong>Wabmeta</strong> is a WhatsApp Business messaging platform for businesses. This policy explains what personal data we collect, why we collect it, who we share it with, and how you can control it. It applies to both the Wabmeta website and the Wabmeta mobile application.
              </p>
              <p className="mt-3">
                Wabmeta is a business tool intended for people aged 18 and over. We do not knowingly collect data from children.
              </p>
            </Section>

            {/* 2. Data We Collect */}
            <Section id="data-we-collect" number="2" title="Data We Collect" icon={Database}>
              <BulletList items={[
                "Account information — your name, email address, phone number, password (stored hashed) and profile photo",
                "Organisation and billing information — your business name, plan, wallet balance and invoice history",
                "WhatsApp Business Account information — your business profile, registered phone numbers, message templates and the access tokens that let us send on your behalf",
                "Contacts — the customer contacts you add, import from a file, or import from your phone's address book",
                "Messages and media — the conversations exchanged between your business and your customers, including images, video, documents and voice messages",
                "Usage data — the delivery, read and failure statistics we generate so you can see how your campaigns performed",
                "Device information — a push notification token and basic device details, used only to deliver notifications to you",
              ]} />
            </Section>

            {/* 3. The Mobile App */}
            <Section id="mobile-app" number="3" title="The Wabmeta Mobile App" icon={Smartphone}>
              <p className="mb-4">
                The mobile app asks for the device permissions below. Each one is optional, is requested only when you use the feature that needs it, and can be revoked at any time in your device settings.
              </p>

              <div className="space-y-3">
                <InfoBox icon="👥" title="Contacts" color="green">
                  When you choose to import contacts from your phone, we read the names, phone numbers and email addresses in your address book so you can pick which ones to add. Only the contacts you select are uploaded to your Wabmeta workspace and stored on our servers. We never upload your address book automatically, and we do not modify or delete anything in it.
                </InfoBox>
                <InfoBox icon="📷" title="Camera" color="blue">
                  To take a photo or video to send in a conversation.
                </InfoBox>
                <InfoBox icon="🖼️" title="Photos, media and files" color="blue">
                  To attach an existing image, video or document to a conversation or a message template.
                </InfoBox>
                <InfoBox icon="🎙️" title="Microphone" color="blue">
                  To record a voice message when you press and hold the record button in a chat.
                </InfoBox>
                <InfoBox icon="🔔" title="Notifications" color="blue">
                  To alert you about new customer messages and campaign results.
                </InfoBox>
              </div>

              <p className="mt-4">
                Media you capture or attach is uploaded to our servers so it can be delivered through WhatsApp. The app does not track your location, and it contains no advertising or third-party analytics software.
              </p>
            </Section>

            {/* 4. How We Use Your Data */}
            <Section id="how-we-use" number="4" title="How We Use Your Data" icon={Zap}>
              <BulletList items={[
                "To provide and maintain the Wabmeta messaging service",
                "To send messages on your behalf to the customers you choose",
                "To show you delivery, engagement and campaign reporting",
                "To process payments and maintain your wallet and invoices",
                "To provide customer support when you contact us",
                "To detect abuse and keep the platform secure",
                "To meet our legal and tax obligations",
              ]} />
              <AlertBox type="info">
                We do not sell your personal data, and we do not use your contacts or the contents of your conversations for advertising or to train machine learning models.
              </AlertBox>
            </Section>

            {/* 5. Who We Share With */}
            <Section id="sharing" number="5" title="Who We Share Data With" icon={Globe}>
              <p className="mb-3">We share data only with the service providers needed to run Wabmeta:</p>
              <BulletList items={[
                "Meta Platforms (WhatsApp Business Platform) — message content and recipient phone numbers, so your messages can be delivered. Meta processes this under its own terms and privacy policy.",
                "Razorpay — handles payments and wallet top-ups. Card and banking details are entered directly with Razorpay; Wabmeta never receives or stores them.",
                "Cloud hosting and storage providers — our servers, database and media storage, which hold data on our behalf under confidentiality obligations.",
                "Google Analytics — used on the Wabmeta website only, for aggregate traffic statistics. It is not present in the mobile app.",
              ]} />
              <p className="mt-4">
                We may also disclose data where the law requires it, or to protect our rights and the safety of our users.
              </p>
            </Section>

            {/* 6. Retention */}
            <Section id="retention" number="6" title="How Long We Keep It" icon={Clock}>
              <p>
                We keep your data for as long as your account is active. When you delete your account, your profile, contacts, conversations, media, campaigns and WhatsApp connection are erased immediately.
              </p>
              <p className="mt-3">
                Where the law requires it, we retain a minimal record of financial transactions to meet tax and accounting obligations. These records contain no contacts, messages or campaign content.
              </p>
            </Section>

            {/* 7. Security */}
            <Section id="security" number="7" title="Security" icon={Lock}>
              <p>
                All traffic between our apps and our servers is encrypted with HTTPS. Passwords are stored hashed and are never readable by us. On mobile, authentication tokens are held in the device's encrypted secure storage. We apply appropriate technical and organisational measures to protect your data against unauthorised access, alteration, disclosure or destruction.
              </p>
            </Section>

            {/* 8. Your Rights */}
            <Section id="your-rights" number="8" title="Your Rights" icon={UserCheck}>
              <p className="mb-3">You have the right to:</p>
              <BulletList items={[
                "Access the personal data we hold about you",
                "Correct inaccurate data",
                "Export your data",
                "Object to or restrict how we process your data",
                "Withdraw a device permission at any time in your device settings",
              ]} />
              <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  You can delete your account and all of its data at any time.{" "}
                  <a href="/data-deletion" className="text-green-700 font-semibold hover:underline">
                    See our account deletion page →
                  </a>
                </p>
              </div>
            </Section>

            {/* 9. Your Responsibilities */}
            <Section id="responsibilities" number="9" title="Your Responsibilities" icon={Shield}>
              <p>
                When you upload contacts and message customers through Wabmeta, you are the controller of that data and we process it on your behalf. You are responsible for having a lawful basis to contact those people, for honouring their opt-outs, and for complying with WhatsApp's Business Messaging Policy.
              </p>
            </Section>

            {/* 10. Changes */}
            <Section id="changes" number="10" title="Changes to This Policy" icon={RefreshCw}>
              <p>
                If we make material changes to this policy we will update the date at the top of this page and, where the change is significant, notify you in the app or by email.
              </p>
            </Section>

            {/* 11. Contact */}
            <Section id="contact" number="11" title="Contact Us" icon={Mail}>
              <p className="mb-3">
                For any privacy question or request, get in touch and we will help.
              </p>
              <a
                href="mailto:privacy@wabmeta.com"
                className="inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
              >
                <Mail className="w-4 h-4" />
                privacy@wabmeta.com
              </a>
            </Section>

          </main>
        </div>
      </div>
    </div>
  );
};

/* ── Reusable pieces (same as Terms, so both legal pages read alike) ───────── */

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

const InfoBox: React.FC<{ icon: string; title: string; color: "blue" | "green"; children: React.ReactNode }> = ({ icon, title, color, children }) => {
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

export default Privacy;
