import React, { useState } from "react";
import {
  Instagram,
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
  Zap,
  Eye,
  ArrowUpRight,
  Play,
  Settings,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── GlassCard ────────────────────────────────────────────────────────────────

const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`relative rounded-2xl
      bg-white/[0.04] backdrop-blur-2xl
      border border-white/[0.08]
      p-6 ${className}`}
  >
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)",
      }}
    />
    <div className="relative">{children}</div>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const IGStatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}> = ({ title, value, change, icon: Icon, color, subtitle }) => (
  <div
    className="group relative rounded-2xl overflow-hidden
      bg-white/[0.04] backdrop-blur-2xl
      border border-white/[0.08] hover:border-white/[0.15]
      hover:-translate-y-0.5 p-5
      transition-all duration-500"
  >
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 0% 0%, ${color}15 0%, transparent 60%)`,
      }}
    />
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}30, ${color}15)`,
            border: `1px solid ${color}40`,
            boxShadow: `0 4px 16px ${color}25`,
          }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {change !== undefined && change !== 0 && (
          <div
            className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold
              ${change >= 0
                ? "bg-green-500/15 text-green-300 border border-green-400/20"
                : "bg-red-500/15 text-red-300 border border-red-400/20"
              }`}
          >
            <TrendingUp className="w-3 h-3" />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-2xl lg:text-3xl font-bold text-white mt-1 tracking-tight">
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px] text-gray-500 mt-1.5 font-mono">{subtitle}</p>
      )}
    </div>
  </div>
);

// ─── Feature Card ─────────────────────────────────────────────────────────────

const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: string;
  comingSoon?: boolean;
  active?: boolean;
}> = ({ icon: Icon, title, description, href, color, comingSoon, active }) => (
  <Link
    to={comingSoon ? "#" : href}
    onClick={(e) => comingSoon && e.preventDefault()}
    className={`group relative flex flex-col p-5 rounded-2xl
      bg-white/[0.04] backdrop-blur-xl
      border transition-all duration-500
      ${comingSoon
        ? "opacity-60 cursor-not-allowed border-white/[0.06]"
        : "border-white/[0.08] hover:border-white/[0.15] hover:-translate-y-1 cursor-pointer"
      }
    `}
    style={{
      boxShadow: active ? `0 4px 24px ${color}20` : undefined,
    }}
  >
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background: `linear-gradient(135deg, ${color}12 0%, transparent 60%)`,
      }}
    />

    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center
            group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, ${color}30, ${color}15)`,
            border: `1px solid ${color}40`,
            boxShadow: `0 8px 20px ${color}25`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>

        {comingSoon ? (
          <span
            className="px-2 py-0.5 rounded-full text-[9px] font-bold"
            style={{
              background: "rgba(99,102,241,0.2)",
              color: "#818cf8",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            Coming Soon
          </span>
        ) : (
          <ArrowUpRight
            className="w-4 h-4 text-gray-600
              group-hover:text-white
              group-hover:translate-x-0.5 group-hover:-translate-y-0.5
              transition-all duration-300"
          />
        )}
      </div>

      <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    </div>
  </Link>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const InstagramDashboard: React.FC = () => {
  // Placeholder - real data API se aayega
  const isConnected = false;

  const igColor = "#e1306c";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
              }}
            >
              <Instagram className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-mono uppercase tracking-[0.15em] text-gray-400">
              Instagram Automation
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Instagram Hub
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Automate your Instagram DMs, comments, and story interactions
          </p>
        </div>

        {isConnected ? (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-green-500/10 border border-green-400/20"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300 font-medium">
              Instagram Connected
            </span>
          </div>
        ) : (
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl
              text-white text-sm font-semibold
              hover:-translate-y-0.5 transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
              boxShadow: "0 8px 24px rgba(131,58,180,0.35)",
            }}
          >
            <LinkIcon className="w-4 h-4" />
            Connect Instagram
          </button>
        )}
      </div>

      {/* ── Not Connected Banner ── */}
      {!isConnected && (
        <GlassCard>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
                boxShadow: "0 12px 32px rgba(131,58,180,0.4)",
              }}
            >
              <Instagram className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-white mb-2">
                Connect your Instagram account
              </h2>
              <p className="text-sm text-gray-400 mb-4 max-w-lg">
                Link your Instagram Business account via Meta to start
                automating DMs, comments, and story interactions.
              </p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {[
                  "Auto-reply to DMs",
                  "Comment automation",
                  "Story mention detection",
                  "Lead capture",
                ].map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(131,58,180,0.15)",
                      color: "#c084fc",
                      border: "1px solid rgba(131,58,180,0.3)",
                    }}
                  >
                    ✓ {feature}
                  </span>
                ))}
              </div>
            </div>

            <button
              className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl
                text-white text-sm font-semibold
                hover:-translate-y-0.5 transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
                boxShadow: "0 8px 24px rgba(131,58,180,0.35)",
              }}
            >
              <LinkIcon className="w-4 h-4" />
              Connect Now
            </button>
          </div>
        </GlassCard>
      )}

      {/* ── Stats (placeholder / real data when connected) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <IGStatCard
          title="DMs Automated"
          value={isConnected ? "0" : "—"}
          icon={MessageCircle}
          color="#e1306c"
          subtitle="This month"
        />
        <IGStatCard
          title="Comments Replied"
          value={isConnected ? "0" : "—"}
          icon={Heart}
          color="#833ab4"
          subtitle="This month"
        />
        <IGStatCard
          title="Followers"
          value={isConnected ? "0" : "—"}
          icon={Users}
          color="#fcb045"
          subtitle="Total"
        />
        <IGStatCard
          title="Engagement Rate"
          value={isConnected ? "0%" : "—"}
          icon={TrendingUp}
          color="#fd1d1d"
          subtitle="Last 30 days"
        />
      </div>

      {/* ── Feature Cards ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
            Features
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={MessageCircle}
            title="DM Automation"
            description="Auto-reply to DMs, keyword-based responses, ice-breaker messages, and story reply automation."
            href="/instagram/dm-automation"
            color="#e1306c"
          />
          <FeatureCard
            icon={Heart}
            title="Comment Automation"
            description="Auto-reply to comments, monitor keywords, and trigger DM flows from comments."
            href="/instagram/comments"
            color="#833ab4"
          />
          <FeatureCard
            icon={BookOpen}
            title="Story Automation"
            description="Detect story mentions, auto-reply to story interactions, and track story analytics."
            href="/instagram/stories"
            color="#fcb045"
          />
          <FeatureCard
            icon={Eye}
            title="Post Management"
            description="Schedule posts, auto-publish content, manage your content calendar."
            href="/instagram/posts"
            color="#fd1d1d"
            comingSoon
          />
          <FeatureCard
            icon={Users}
            title="Lead Generation"
            description="Capture leads from DMs, auto-qualify, and push directly to your CRM."
            href="/instagram/leads"
            color="#f59e0b"
            comingSoon
          />
          <FeatureCard
            icon={TrendingUp}
            title="Analytics"
            description="Follower growth, engagement metrics, DM response rates, and content performance."
            href="/instagram/analytics"
            color="#6366f1"
            comingSoon
          />
        </div>
      </div>

      {/* ── Quick Setup Steps ── */}
      <GlassCard>
        <h3 className="text-base font-semibold text-white mb-5">
          Get started in 3 steps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              title: "Connect Instagram",
              desc: "Link your Instagram Business account via Meta Business Manager.",
              icon: Instagram,
              color: "#e1306c",
            },
            {
              step: "02",
              title: "Create Automation",
              desc: "Set up keyword triggers, auto-replies, and DM flows.",
              icon: Zap,
              color: "#833ab4",
            },
            {
              step: "03",
              title: "Go Live",
              desc: "Activate your automations and watch your engagement grow.",
              icon: Play,
              color: "#10b981",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 p-4 rounded-xl
                bg-white/[0.03] border border-white/[0.06]"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${item.color}20`,
                  border: `1px solid ${item.color}40`,
                }}
              >
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-gray-600">
                    {item.step}
                  </span>
                  <h4 className="text-sm font-semibold text-white">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// Missing imports fix
const BookOpen = ({ className, style }: any) => (
  <svg
    className={className}
    style={style}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

export default InstagramDashboard;
