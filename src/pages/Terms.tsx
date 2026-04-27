// src/pages/Terms.tsx

import React, { useState, useEffect } from "react";
import { FileText, ChevronRight, Mail, Shield, AlertTriangle, CreditCard, Ban, Zap, Globe, XCircle, RefreshCw, Phone } from "lucide-react";

const LAST_UPDATED = "April 27, 2025";

interface Section {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
}

const sections: Section[] = [
  { id: "introduction",          number: "1",  title: "Introduction",            icon: FileText      },
  { id: "services",              number: "2",  title: "Services Offered",        icon: Zap           },
  { id: "user-responsibility",   number: "3",  title: "User Responsibility",     icon: Shield        },
  { id: "payment",               number: "4",  title: "Payment & Billing",       icon: CreditCard    },
  { id: "refund",                number: "5",  title: "Refund Policy",           icon: RefreshCw     },
  { id: "onboarding",            number: "6",  title: "Onboarding Disclaimer",   icon: AlertTriangle },
  { id: "limitations",           number: "7",  title: "Service Limitations",     icon: Ban           },
  { id: "third-party",           number: "8",  title: "Third-Party Dependency",  icon: Globe         },
  { id: "termination",           number: "9",  title: "Termination of Service",  icon: XCircle       },
  { id: "liability",             number: "10", title: "Limitation of Liability", icon: Shield        },
  { id: "changes",               number: "11", title: "Changes to Terms",        icon: RefreshCw     },
  { id: "contact",               number: "12", title: "Contact Us",              icon: Mail          },
];

const Terms: React.FC = () => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-green-100 text-sm font-medium tracking-wide uppercase">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-green-100 text-base max-w-2xl leading-relaxed">
            Please read these terms carefully before using Wabmeta's services. By accessing our platform, you agree to be bound by these terms.
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
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
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200"
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
                Welcome to <strong>Wabmeta</strong>. By accessing or using our services, you agree to comply with and be bound by these Terms &amp; Conditions. We encourage you to read them carefully to understand your rights and obligations while using our services.
              </p>
            </Section>

            {/* 2. Services Offered */}
            <Section id="services" number="2" title="Services Offered" icon={Zap}>
              <p className="mb-3">
                Wabmeta provides WhatsApp API-based solutions designed to help businesses communicate efficiently and professionally with their customers. Our services may include:
              </p>
              <BulletList items={[
                "WhatsApp API access setup",
                "Business account onboarding assistance",
                "Technical guidance and customer support",
                "Video tutorials and documentation for self-onboarding",
              ]} />
            </Section>

            {/* 3. User Responsibility */}
            <Section id="user-responsibility" number="3" title="User Responsibility" icon={Shield}>
              <p className="mb-3">To ensure a smooth experience, users are expected to:</p>
              <BulletList items={[
                "Provide accurate and complete business and personal information",
                "Comply with all applicable WhatsApp (Meta) policies and guidelines",
                "Complete all onboarding steps as required",
              ]} />

              <p className="mt-4 mb-3 font-medium text-gray-800 dark:text-gray-200">Users can choose between the following options:</p>

              <div className="space-y-3">
                <InfoBox icon="🖥️" title="a) Self-Onboarding" color="blue">
                  Users may independently complete the onboarding process using the resources, tutorials, and documentation provided by Wabmeta.
                </InfoBox>
                <InfoBox icon="🤝" title="b) Assisted Onboarding" color="green">
                  If required, Wabmeta offers support to assist users with the onboarding process. The overall timeline may depend on the accuracy of the information and cooperation provided by the user.
                </InfoBox>
              </div>
            </Section>

            {/* 4. Payment & Billing */}
            <Section id="payment" number="4" title="Payment & Billing" icon={CreditCard}>
              <BulletList items={[
                "All services offered by Wabmeta are paid services",
                "Payments are required in advance prior to service activation",
                "Pricing may vary depending on the selected plan or service",
                "Services will be initiated upon successful payment confirmation",
              ]} />
            </Section>

            {/* 5. Refund Policy */}
            <Section id="refund" number="5" title="Refund Policy" icon={RefreshCw}>
              <AlertBox type="warning">
                All payments made to Wabmeta are <strong>non-refundable</strong> and <strong>non-transferable</strong>. As our services involve time, resources, and third-party integrations, refunds are not applicable once payment is completed.
              </AlertBox>
              <p className="mt-4 mb-3">This applies in situations including, but not limited to:</p>
              <BulletList items={[
                "Change of decision or business requirements",
                "Delays due to incomplete or inaccurate information provided by the user",
                "Incomplete onboarding process from the user's end",
                "Delays or decisions from WhatsApp (Meta) or other third-party platforms",
              ]} />
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 italic">
                By proceeding with the payment, users acknowledge and accept this policy.
              </p>
            </Section>

            {/* 6. Onboarding Disclaimer */}
            <Section id="onboarding" number="6" title="Onboarding Disclaimer" icon={AlertTriangle}>
              <p className="mb-3">
                Wabmeta provides guidance and support throughout the onboarding process. However:
              </p>
              <BulletList items={[
                "Final approval is subject to WhatsApp (Meta) policies and verification processes",
                "Approval or rejection is determined solely by the respective platform",
              ]} />
              <p className="mt-4 mb-3">Wabmeta is <strong>not responsible</strong> for:</p>
              <BulletList items={[
                "Rejection of WhatsApp Business API applications",
                "Delays caused by third-party platforms",
              ]} />
            </Section>

            {/* 7. Service Limitations */}
            <Section id="limitations" number="7" title="Service Limitations" icon={Ban}>
              <p className="mb-3">
                Wabmeta focuses on providing reliable API access and onboarding support. However, we do <strong>not guarantee</strong>:
              </p>
              <BulletList items={[
                "Message delivery performance or rates",
                "Specific business outcomes, leads, or conversions",
                "Approval from WhatsApp (Meta)",
              ]} />
            </Section>

            {/* 8. Third-Party Dependency */}
            <Section id="third-party" number="8" title="Third-Party Dependency" icon={Globe}>
              <p className="mb-3">
                Our services rely on external platforms such as WhatsApp (Meta). As a result, Wabmeta cannot be held responsible for:
              </p>
              <BulletList items={[
                "API downtime or technical issues",
                "Changes in third-party policies",
                "Service interruptions beyond our control",
              ]} />
            </Section>

            {/* 9. Termination of Service */}
            <Section id="termination" number="9" title="Termination of Service" icon={XCircle}>
              <p className="mb-3">Wabmeta reserves the right to:</p>
              <BulletList items={[
                "Suspend or terminate services in case of policy violations",
                "Restrict access in cases of misuse or non-compliance",
              ]} />
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                We aim to maintain a safe and compliant platform for all users.
              </p>
            </Section>

            {/* 10. Limitation of Liability */}
            <Section id="liability" number="10" title="Limitation of Liability" icon={Shield}>
              <p className="mb-3">
                Wabmeta shall not be liable for any losses arising from the use of our services, including:
              </p>
              <BulletList items={[
                "Business interruptions",
                "Data loss",
                "Revenue or profit loss",
                "Service disruptions",
              ]} />
            </Section>

            {/* 11. Changes to Terms */}
            <Section id="changes" number="11" title="Changes to Terms" icon={RefreshCw}>
              <p>
                Wabmeta may update these Terms &amp; Conditions from time to time to reflect improvements or regulatory requirements. Continued use of our services indicates acceptance of the updated terms.
              </p>
            </Section>

            {/* 12. Contact Us */}
            <Section id="contact" number="12" title="Contact Us" icon={Mail}>
              <p className="mb-4">
                If you have any questions, feedback, or require support, feel free to reach out to us:
              </p>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-5 border border-green-200 dark:border-green-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Company Name</p>
                    <p className="font-semibold text-gray-900 dark:text-white">Wabmeta</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Email</p>
                    <a
                      href="mailto:wabmetacontact@gmail.com"
                      className="font-semibold text-green-700 dark:text-green-400 hover:underline"
                    >
                      wabmetacontact@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </Section>

            {/* Footer note */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By using Wabmeta's services you confirm that you have read, understood, and agree to be bound by these Terms &amp; Conditions.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                © {new Date().getFullYear()} Wabmeta. All rights reserved.
              </p>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────────

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
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm scroll-mt-6"
  >
    {/* Section header */}
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
      <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
          {number}
        </span>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
    </div>
    <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm space-y-2">
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
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
  };
  return (
    <div className={`${styles[type]} rounded-xl p-4 border text-sm leading-relaxed`}>
      {type === "warning" && <span className="mr-2">⚠️</span>}
      {children}
    </div>
  );
};

const InfoBox: React.FC<{ icon: string; title: string; color: "blue" | "green"; children: React.ReactNode }> = ({ icon, title, color, children }) => {
  const styles = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40",
    green: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/40",
  };
  return (
    <div className={`${styles[color]} rounded-xl p-4 border`}>
      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1.5">
        {icon} {title}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>
    </div>
  );
};

export default Terms;