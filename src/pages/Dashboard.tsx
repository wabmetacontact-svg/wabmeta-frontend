// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw,
  ArrowUpRight,
  Mail,
  FileText,
  BarChart3,
  ChevronDown,
  Bot,
  Workflow,
  PlusCircle,
  Radio,
  UserPlus,
  BrainCircuit,
  Sparkles,
  Inbox,
  Phone,
} from 'lucide-react';
import { dashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import PageSkeleton from '../components/common/PageSkeleton';

// ============================================
// HELPERS
// ============================================

const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 22) return 'Good evening';
  return 'Good night';
};

const formatNum = (n: number): string => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
};

const formatRelativeTime = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// ============================================
// SPARKLINE COMPONENT
// ============================================

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (!data || data.length < 2) {
    return (
      <div className="h-11 flex items-center justify-center">
        <div className="w-full h-px bg-[#0a0e27]/[0.05]" />
      </div>
    );
  }

  const width = 140;
  const height = 45;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return { x, y };
  });

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = p0.x + (p1.x - p0.x) / 2;
    path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;
  const gradId = `sparkline-${color.replace('#', '')}`;

  return (
    <svg className="w-full h-11 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ============================================
// MAIN DASHBOARD
// ============================================

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);

  const [stats, setStats] = useState<any>(null);
  const [widgets, setWidgets] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);

  // Real-time greeting
  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    const timer = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // ✅ FIXED: Properly handle axios response structure
  const fetchDashboardData = async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    try {
      const [statsRes, widgetsRes, activityRes] = await Promise.all([
        dashboard.getStats(),
        dashboard.getWidgets(dateRange),
        dashboard.getActivity(10),
      ]);

      // ✅ FIXED: axios wraps response — access .data.data
      if (statsRes?.data?.success && statsRes?.data?.data) {
        setStats(statsRes.data.data);
        console.log('✅ Stats loaded:', statsRes.data.data);
      } else {
        console.warn('⚠️ Stats response invalid:', statsRes);
      }

      if (widgetsRes?.data?.success && widgetsRes?.data?.data) {
        setWidgets(widgetsRes.data.data);
        console.log('✅ Widgets loaded:', widgetsRes.data.data);
      }

      if (activityRes?.data?.success && Array.isArray(activityRes?.data?.data)) {
        setActivity(activityRes.data.data);
      }
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, [dateRange]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchDashboardData(false);

    socket.on('message:new', handleUpdate);
    socket.on('message:status', handleUpdate);
    socket.on('campaign:update', handleUpdate);
    socket.on('campaign:progress', handleUpdate);
    socket.on('campaign:completed', handleUpdate);

    return () => {
      socket.off('message:new', handleUpdate);
      socket.off('message:status', handleUpdate);
      socket.off('campaign:update', handleUpdate);
      socket.off('campaign:progress', handleUpdate);
      socket.off('campaign:completed', handleUpdate);
    };
  }, [socket]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData(false);
      toast.success('Dashboard refreshed');
    } catch {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <PageSkeleton />;

  // ✅ Pull REAL data from API response (with safe defaults of 0)
  const contactsTotal = stats?.contacts?.total ?? 0;
  const contactsGrowth = stats?.contacts?.growth ?? 0;
  const contactsThisMonth = stats?.contacts?.thisMonth ?? 0;

  const messagesSent = stats?.messages?.sent ?? 0;
  const messagesGrowth = stats?.messages?.growth ?? 0;
  const messagesToday = stats?.messages?.today ?? 0;

  const deliveryRate = stats?.delivery?.deliveryRate ?? 0;
  const readRate = stats?.delivery?.readRate ?? 0;
  const totalDelivered = stats?.delivery?.delivered ?? 0;
  const totalFailed = stats?.delivery?.failed ?? 0;

  const activeCampaigns = stats?.campaigns?.active ?? 0;
  const completedCampaigns = stats?.campaigns?.completed ?? 0;
  const campaignsThisMonth = stats?.campaigns?.thisMonth ?? 0;

  const conversationsUnread = stats?.conversations?.unread ?? 0;
  const conversationsActive = stats?.conversations?.active ?? 0;
  const templatesApproved = stats?.templates?.approved ?? 0;
  const whatsappConnected = stats?.whatsapp?.connected ?? 0;

  // Sparkline data from widgets
  const getContactsHistory = (): number[] => {
    if (!widgets?.contactsGrowth?.length) return [];
    let current = Math.max(0, contactsTotal - widgets.contactsGrowth.reduce((a: number, b: any) => a + (b.count || 0), 0));
    return widgets.contactsGrowth.map((d: any) => { current += (d.count || 0); return current; });
  };

  const getMessagesHistory = (): number[] => {
    if (!widgets?.messagesOverview?.length) return [];
    let current = Math.max(0, messagesSent - widgets.messagesOverview.reduce((a: number, b: any) => a + (b.sent || 0), 0));
    return widgets.messagesOverview.map((d: any) => { current += (d.sent || 0); return current; });
  };

  const getDeliveryHistory = (): number[] => {
    if (!widgets?.messagesOverview?.length) return [];
    return widgets.messagesOverview.map((d: any) => d.sent > 0 ? Math.round((d.delivered / d.sent) * 100) : 0);
  };

  const chartData = widgets?.messagesOverview?.map((item: any) => ({
    label: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    sent: item.sent || 0,
    delivered: item.delivered || 0,
    read: item.read || 0,
    failed: item.failed || 0,
  })) || [];

  const hasAnyData = contactsTotal > 0 || messagesSent > 0 || activeCampaigns > 0;
  const hasChartData = chartData.length > 0 && chartData.some((d: any) => d.sent > 0);
  const recentCampaigns = widgets?.recentCampaigns || [];
  const userName = user?.firstName || 'there';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* ✅ HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-xs font-mono uppercase tracking-[0.15em] text-gray-400">
              {greeting}
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Welcome back, {userName} 👋
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {hasAnyData
              ? `Here's what's happening with your WhatsApp business today`
              : `Let's get your WhatsApp business set up. It takes ~6 minutes.`
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0a0e27]/[0.04] backdrop-blur-xl border border-white/[0.08]">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days as 7 | 14 | 30)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300
                  ${dateRange === days
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                    : 'text-gray-400 hover:text-white border border-transparent'
                  }
                `}
              >
                {days}d
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-[#0a0e27]/[0.04] backdrop-blur-xl border border-white/[0.08]
              hover:bg-[#0a0e27]/[0.08] hover:border-white/[0.15]
              text-gray-400 hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ✅ NEW USER ONBOARDING CARD (only if no data) */}
      {!hasAnyData && (
        <div className="relative rounded-2xl overflow-hidden
          bg-[#0a0e27]/[0.04] backdrop-blur-2xl
          border border-white/[0.1]
          p-6 lg:p-8">

          <div className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)',
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                bg-green-500/10 border border-green-400/20 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-wider text-green-300">
                  Quick setup
                </span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                You're all set up. <span className="italic font-light text-gray-400">Almost.</span>
              </h2>
              <p className="text-sm text-gray-400 mb-5 max-w-lg">
                Connect WhatsApp, import contacts, and send your first message. Most users finish in under 10 minutes.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('/dashboard/settings?tab=whatsapp')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                    bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold
                    shadow-[0_8px_24px_rgba(16,185,129,0.35)]
                    hover:shadow-[0_12px_32px_rgba(16,185,129,0.5)]
                    hover:-translate-y-0.5 transition-all duration-500"
                >
                  <Phone className="w-4 h-4" />
                  Connect WhatsApp
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard/contacts/import')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                    bg-[#0a0e27]/[0.06] border border-white/[0.12]
                    hover:bg-[#0a0e27]/[0.1] hover:border-white/[0.2]
                    text-gray-300 hover:text-white text-sm font-medium transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4" />
                  Import contacts
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { step: '01', label: 'Connect WhatsApp', done: whatsappConnected > 0 },
                { step: '02', label: 'Import contacts', done: contactsTotal > 0 },
                { step: '03', label: 'Create template', done: templatesApproved > 0 },
                { step: '04', label: 'Send first campaign', done: activeCampaigns > 0 || completedCampaigns > 0 },
              ].map((item) => (
                <div key={item.step}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all
                    ${item.done
                      ? 'bg-green-500/10 border-green-400/20'
                      : 'bg-[#0a0e27]/[0.03] border-white/[0.06]'
                    }
                  `}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold
                    ${item.done
                      ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                      : 'bg-[#0a0e27]/[0.05] text-gray-500 border border-white/[0.08]'
                    }
                  `}>
                    {item.done ? <CheckCircle className="w-3.5 h-3.5" /> : item.step}
                  </div>
                  <span className={`text-xs font-medium ${item.done ? 'text-white' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* LEFT: 3/4 width */}
        <div className="xl:col-span-3 space-y-6">

          {/* STATS CARDS - REAL DATA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Contacts"
              value={contactsTotal}
              change={contactsGrowth}
              subtitle={contactsThisMonth > 0 ? `+${contactsThisMonth} this month` : 'Import to get started'}
              icon={Users}
              accentColor="#10b981"
              sparkline={getContactsHistory()}
              emptyAction={contactsTotal === 0 ? { text: 'Add contacts', href: '/dashboard/contacts/import' } : undefined}
            />
            <StatCard
              title="Messages Sent"
              value={messagesSent}
              change={messagesGrowth}
              subtitle={messagesToday > 0 ? `${messagesToday} today` : 'No messages yet'}
              icon={Send}
              accentColor="#3b82f6"
              sparkline={getMessagesHistory()}
            />
            <StatCard
              title="Delivery Rate"
              value={`${deliveryRate}%`}
              subtitle={totalDelivered > 0 ? `${totalDelivered} delivered` : 'No data yet'}
              icon={CheckCircle}
              accentColor="#a855f7"
              sparkline={getDeliveryHistory()}
              showAsPercentage
            />
            <StatCard
              title="Active Campaigns"
              value={activeCampaigns}
              subtitle={completedCampaigns > 0 ? `${completedCampaigns} completed` : 'Create your first'}
              icon={Zap}
              accentColor="#f59e0b"
              sparkline={[]}
              emptyAction={activeCampaigns === 0 && completedCampaigns === 0 ? { text: 'New campaign', href: '/dashboard/campaigns/create' } : undefined}
            />
          </div>

          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Messages Overview Chart */}
            <GlassCard className="lg:col-span-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-400/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Messages Overview</h3>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[10px] font-medium text-gray-500">
                  {[
                    { color: '#10b981', label: 'Sent' },
                    { color: '#3b82f6', label: 'Delivered' },
                    { color: '#a855f7', label: 'Read' },
                    { color: '#ef4444', label: 'Failed' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {hasChartData ? (
                <MessagesChart data={chartData} />
              ) : (
                <EmptyChart
                  icon={MessageSquare}
                  title="No messages yet"
                  subtitle="Send your first message to see the chart"
                  actionText="Send first message"
                  actionHref="/dashboard/campaigns/create"
                />
              )}
            </GlassCard>

            {/* Delivery Performance Donut */}
            <GlassCard className="lg:col-span-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Delivery</h3>
              </div>

              {messagesSent > 0 ? (
                <DonutChart
                  delivered={totalDelivered}
                  read={stats?.delivery?.read ?? 0}
                  failed={totalFailed}
                  total={messagesSent}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#0a0e27]/[0.04] border border-white/[0.08]
                    flex items-center justify-center mb-3">
                    <BarChart3 className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-400">No delivery data</p>
                  <p className="text-xs text-gray-500 mt-1">Send messages to see stats</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                <div className="p-2.5 rounded-xl bg-green-500/[0.06] border border-green-400/15">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Delivered</span>
                  </div>
                  <p className="text-sm font-bold text-green-400 mt-1">{formatNum(totalDelivered)}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-red-500/[0.06] border border-red-400/15">
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Failed</span>
                  </div>
                  <p className="text-sm font-bold text-red-400 mt-1">{formatNum(totalFailed)}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* RECENT CAMPAIGNS */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Recent Campaigns</h3>
              <Link to="/dashboard/campaigns"
                className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 group"
              >
                View all
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {recentCampaigns.length > 0 ? (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray-500 border-b border-white/[0.06]">
                      <th className="pb-3 px-2 font-medium">Campaign</th>
                      <th className="pb-3 px-2 font-medium">Status</th>
                      <th className="pb-3 px-2 font-medium text-right">Sent</th>
                      <th className="pb-3 px-2 font-medium text-right">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {recentCampaigns.map((campaign: any) => (
                      <tr key={campaign.id} className="hover:bg-[#0a0e27]/[0.03] transition-colors">
                        <td className="py-3 px-2">
                          <Link to={`/dashboard/campaigns/${campaign.id}`}
                            className="text-sm font-medium text-white hover:text-green-400 transition-colors"
                          >
                            {campaign.name}
                          </Link>
                        </td>
                        <td className="py-3 px-2">
                          <StatusBadge status={campaign.status} />
                        </td>
                        <td className="py-3 px-2 text-right text-xs text-gray-400 font-mono">
                          {campaign.sentCount || 0}/{campaign.totalContacts || 0}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <DeliveryRateBadge rate={campaign.deliveryRate || 0} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-[#0a0e27]/[0.04] border border-white/[0.08]
                  flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-sm text-gray-400">No campaigns yet</p>
                <Link to="/dashboard/campaigns/create"
                  className="mt-3 inline-block text-xs text-green-400 hover:text-green-300 font-medium"
                >
                  Create your first campaign →
                </Link>
              </div>
            )}
          </GlassCard>
        </div>

        {/* RIGHT SIDEBAR: 1/4 width */}
        <div className="xl:col-span-1 space-y-6">

          {/* QUICK STATS */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-4">At a glance</h3>
            <div className="space-y-2">
              <QuickStatItem label="Unread chats" value={conversationsUnread} icon={Mail} color="#f59e0b" href="/dashboard/inbox" />
              <QuickStatItem label="Active chats" value={conversationsActive} icon={MessageSquare} color="#3b82f6" href="/dashboard/inbox" />
              <QuickStatItem label="Templates" value={templatesApproved} icon={FileText} color="#10b981" href="/dashboard/templates" />
              <QuickStatItem label="WhatsApp accounts" value={whatsappConnected} icon={Phone} color="#a855f7" href="/dashboard/settings" />
            </div>
          </GlassCard>

          {/* QUICK ACTIONS */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-4">Quick actions</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Send, label: 'Campaign', color: '#10b981', href: '/dashboard/campaigns/create' },
                { icon: Radio, label: 'Broadcast', color: '#a855f7', href: '/dashboard/campaigns/create' },
                { icon: UserPlus, label: 'Contacts', color: '#10b981', href: '/dashboard/contacts/import' },
                { icon: FileText, label: 'Template', color: '#f59e0b', href: '/dashboard/templates/create' },
                { icon: Bot, label: 'Chatbot', color: '#3b82f6', href: '/dashboard/chatbots' },
                { icon: Workflow, label: 'Automation', color: '#3b82f6', href: '/dashboard/automations' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.href)}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl
                    bg-[#0a0e27]/[0.03] border border-white/[0.06]
                    hover:bg-[#0a0e27]/[0.06] hover:border-white/[0.12]
                    transition-all duration-300 group"
                >
                  <action.icon className="w-4 h-4 group-hover:scale-110 transition-transform" 
                    style={{ color: action.color }} 
                  />
                  <span className="text-[10px] font-medium text-gray-300 group-hover:text-white">{action.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* RECENT ACTIVITY */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-4">Recent activity</h3>
            
            {activity.length > 0 ? (
              <div className="space-y-3 relative pl-3.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#0a0e27]/[0.05]">
                {activity.slice(0, 5).map((act) => (
                  <div key={act.id} className="relative">
                    <span className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0a0e27]" />
                    <p className="text-xs font-medium text-white">
                      {act.action?.replace(/_/g, ' ').toLowerCase() || 'Activity'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                      {formatRelativeTime(act.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No activity yet</p>
                <p className="text-[10px] text-gray-500 mt-1">Your actions will show up here</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// ============================================
// REUSABLE COMPONENTS
// ============================================

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative rounded-2xl
    bg-[#0a0e27]/[0.04] backdrop-blur-2xl
    border border-white/[0.08]
    p-6
    ${className}
  `}>
    <div className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)' }}
    />
    <div className="relative">{children}</div>
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  icon: React.ElementType;
  accentColor: string;
  sparkline?: number[];
  showAsPercentage?: boolean;
  emptyAction?: { text: string; href: string };
}> = ({ title, value, change, subtitle, icon: Icon, accentColor, sparkline = [], emptyAction }) => {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
  const isEmpty = numValue === 0;

  return (
    <div className="group relative rounded-2xl overflow-hidden
      bg-[#0a0e27]/[0.04] backdrop-blur-2xl
      border border-white/[0.08]
      hover:border-white/[0.15]
      hover:-translate-y-0.5
      p-5
      transition-all duration-500">

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse 80% 60% at 0% 0%, ${accentColor}15 0%, transparent 60%)` }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}15)`,
              border: `1px solid ${accentColor}40`,
              boxShadow: `0 4px 16px ${accentColor}25`,
            }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color: accentColor }} />
          </div>

          {change !== undefined && change !== 0 && (
            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold
              ${change >= 0
                ? 'bg-green-500/15 text-green-300 border border-green-400/20'
                : 'bg-red-500/15 text-red-300 border border-red-400/20'
              }
            `}>
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400">{title}</p>
        <p className="text-2xl lg:text-3xl font-bold text-white mt-1 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>

        {subtitle && (
          <p className="text-[10px] text-gray-500 mt-1.5 font-mono">{subtitle}</p>
        )}

        <div className="mt-3 h-11">
          {!isEmpty && sparkline.length > 1 ? (
            <Sparkline data={sparkline} color={accentColor} />
          ) : emptyAction ? (
            <Link to={emptyAction.href}
              className="inline-flex items-center gap-1 text-[10px] font-medium mt-2
                hover:underline"
              style={{ color: accentColor }}
            >
              {emptyAction.text}
              <ArrowUpRight className="w-2.5 h-2.5" />
            </Link>
          ) : (
            <div className="h-px bg-[#0a0e27]/[0.04] mt-5" />
          )}
        </div>
      </div>
    </div>
  );
};

const MessagesChart: React.FC<{ data: any[] }> = ({ data }) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.sent, d.delivered, d.read, d.failed]), 1);

  return (
    <div className="relative w-full overflow-x-auto select-none pt-2">
      <svg className="w-full min-w-[420px] h-48 overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
        {[0, 45, 90, 135].map((y) => (
          <line key={y} x1="35" y1={y + 10} x2="495" y2={y + 10}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
        ))}

        {data.map((item, idx) => {
          const N = data.length;
          const chartWidth = 440;
          const step = chartWidth / N;
          const startX = 40 + idx * step;
          const barWidth = Math.max(1.5, Math.min(6, step / 6));
          const gap = barWidth * 0.25;
          const heightRatio = maxVal > 0 ? 145 / maxVal : 0;

          return (
            <g key={idx}>
              {[
                { val: item.sent, color: '#10b981', offset: 0 },
                { val: item.delivered, color: '#3b82f6', offset: 1 },
                { val: item.read, color: '#a855f7', offset: 2 },
                { val: item.failed, color: '#ef4444', offset: 3 },
              ].map((bar) => (
                <rect
                  key={bar.offset}
                  x={startX + (barWidth + gap) * bar.offset}
                  y={160 - bar.val * heightRatio}
                  width={barWidth}
                  height={bar.val * heightRatio}
                  fill={bar.color}
                  rx={barWidth / 4}
                  style={{ filter: `drop-shadow(0 0 4px ${bar.color}40)` }}
                  className="hover:opacity-80 cursor-pointer transition-opacity"
                />
              ))}
              {(N <= 10 || idx % Math.ceil(N / 7) === 0) && (
                <text x={startX + (barWidth + gap) * 1.5} y="176"
                  className="text-[9px] font-mono fill-gray-500"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const DonutChart: React.FC<{ delivered: number; read: number; failed: number; total: number }> = ({
  delivered, read, failed, total
}) => {
  const segments = [
    { name: 'Delivered', value: delivered, color: '#10b981' },
    { name: 'Read', value: read, color: '#3b82f6' },
    { name: 'Failed', value: failed, color: '#ef4444' },
  ];

  const sum = segments.reduce((a, s) => a + s.value, 0);
  if (sum === 0) return null;

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="flex items-center gap-4 justify-center py-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="transparent"
            stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
          {segments.map((s) => {
            const pct = (s.value / sum) * 100;
            const strokeLen = (pct / 100) * circumference;
            const offset = circumference - (currentOffset / 100) * circumference;
            currentOffset += pct;
            return (
              <circle key={s.name}
                cx="50" cy="50" r={radius} fill="transparent"
                stroke={s.color} strokeWidth="9"
                strokeDasharray={`${strokeLen} ${circumference}`}
                strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
                style={{ filter: `drop-shadow(0 0 4px ${s.color}40)` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider">Total</span>
          <span className="text-base font-bold text-white">{formatNum(total)}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-gray-400">{s.name}</span>
            <span className="text-white font-semibold ml-auto">{Math.round((s.value / sum) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyChart: React.FC<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  actionText: string;
  actionHref: string;
}> = ({ icon: Icon, title, subtitle, actionText, actionHref }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[#0a0e27]/[0.04] border border-white/[0.08]
      flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-gray-500" />
    </div>
    <p className="text-sm font-medium text-white mb-1">{title}</p>
    <p className="text-xs text-gray-500 mb-4">{subtitle}</p>
    <Link to={actionHref}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full
        bg-green-500/10 border border-green-400/20
        text-green-300 text-xs font-medium
        hover:bg-green-500/20 hover:border-green-400/30
        transition-all duration-300"
    >
      {actionText}
      <ArrowUpRight className="w-3 h-3" />
    </Link>
  </div>
);

const QuickStatItem: React.FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  href: string;
}> = ({ label, value, icon: Icon, color, href }) => (
  <Link to={href}
    className="flex items-center justify-between p-2.5 rounded-xl
      hover:bg-[#0a0e27]/[0.04] border border-transparent hover:border-white/[0.06]
      transition-all duration-300 group"
  >
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span className="text-xs text-gray-300 group-hover:text-white">{label}</span>
    </div>
    <span className="text-sm font-bold text-white">{value}</span>
  </Link>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    COMPLETED: 'bg-green-500/15 text-green-300 border border-green-400/20',
    RUNNING: 'bg-blue-500/15 text-blue-300 border border-blue-400/20',
    FAILED: 'bg-red-500/15 text-red-300 border border-red-400/20',
    PAUSED: 'bg-yellow-500/15 text-yellow-300 border border-yellow-400/20',
  };
  return (
    <span className={`px-2 py-1 text-[10px] font-mono font-semibold rounded-full
      ${styles[status] || 'bg-[#0a0e27]/[0.06] text-gray-400 border border-white/[0.1]'}
    `}>
      {status}
    </span>
  );
};

const DeliveryRateBadge: React.FC<{ rate: number }> = ({ rate }) => (
  <span className={`text-sm font-bold
    ${rate >= 90 ? 'text-green-400'
      : rate >= 70 ? 'text-yellow-400'
      : 'text-red-400'
    }
  `}>
    {rate}%
  </span>
);

export default Dashboard;