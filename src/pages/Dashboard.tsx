// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Zap,
  RefreshCw,
  ArrowUpRight,
  Mail,
  FileText,
  BarChart3,
  Bot,
  Workflow,
  Radio,
  UserPlus,
  Sparkles,
  Inbox,
  Phone,
  Instagram,
  Target,
} from 'lucide-react';
import { dashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FaWhatsapp } from "react-icons/fa";
import SocialFollowCard from '../components/dashboard/SocialFollowCard';

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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingWidgets, setLoadingWidgets] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);

  const [stats, setStats] = useState<any>(null);
  const [widgets, setWidgets] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);

  const refetchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    const timer = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await dashboard.getStats();
      if (res?.data?.success && res?.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchWidgets = useCallback(async () => {
    try {
      const res = await dashboard.getWidgets(dateRange);
      if (res?.data?.success && res?.data?.data) {
        setWidgets(res.data.data);
      }
    } catch (err) {
      console.error('Widgets fetch error:', err);
    } finally {
      setLoadingWidgets(false);
    }
  }, [dateRange]);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await dashboard.getActivity(10);
      if (res?.data?.success && Array.isArray(res?.data?.data)) {
        setActivity(res.data.data);
      }
    } catch (err) {
      console.error('Activity fetch error:', err);
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  const fetchAll = useCallback(() => {
    fetchStats();
    fetchWidgets();
    fetchActivity();
  }, [fetchStats, fetchWidgets, fetchActivity]);

  // Mount: load everything once.
  useEffect(() => {
    fetchStats();
    fetchActivity();
  }, [fetchStats, fetchActivity]);

  // Widgets reload whenever the range changes -- fetchWidgets is keyed on it.
  useEffect(() => {
    setLoadingWidgets(true);
    fetchWidgets();
  }, [fetchWidgets]);

  useEffect(() => {
    if (!socket) return;

    const debouncedRefetch = () => {
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
      refetchTimerRef.current = setTimeout(fetchAll, 3000);
    };

    socket.on('message:new', debouncedRefetch);
    socket.on('message:status', debouncedRefetch);
    socket.on('campaign:update', debouncedRefetch);
    socket.on('campaign:progress', debouncedRefetch);
    socket.on('campaign:completed', debouncedRefetch);

    return () => {
      socket.off('message:new', debouncedRefetch);
      socket.off('message:status', debouncedRefetch);
      socket.off('campaign:update', debouncedRefetch);
      socket.off('campaign:progress', debouncedRefetch);
      socket.off('campaign:completed', debouncedRefetch);
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    };
  }, [socket, fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchStats(), fetchWidgets(), fetchActivity()]);
      toast.success('Dashboard refreshed');
    } catch {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const contactsTotal = stats?.contacts?.total ?? 0;
  const messagesSent = stats?.messages?.sent ?? 0;
  const deliveryRate = stats?.delivery?.deliveryRate ?? 0;
  const totalDelivered = stats?.delivery?.delivered ?? 0;
  const totalFailed = stats?.delivery?.failed ?? 0;
  const activeCampaigns = stats?.campaigns?.active ?? 0;
  const completedCampaigns = stats?.campaigns?.completed ?? 0;
  const conversationsUnread = stats?.conversations?.unread ?? 0;
  const conversationsActive = stats?.conversations?.active ?? 0;
  const templatesApproved = stats?.templates?.approved ?? 0;
  const whatsappConnected = stats?.whatsapp?.connected ?? 0;

  const chartData = useMemo(() => {
    return widgets?.messagesOverview?.map((item: any) => ({
      label: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      sent: item.sent || 0,
      delivered: item.delivered || 0,
      read: item.read || 0,
      failed: item.failed || 0,
    })) || [];
  }, [widgets?.messagesOverview]);

  const hasAnyData = contactsTotal > 0 || messagesSent > 0 || activeCampaigns > 0;
  const hasChartData = chartData.length > 0 && chartData.some((d: any) => d.sent > 0);
  const recentCampaigns = widgets?.recentCampaigns || [];
  const userName = user?.firstName || 'there';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 px-1 sm:px-4 lg:px-6">

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
              {greeting}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {userName} 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 font-normal">
            {loadingStats
              ? 'Loading your dashboard...'
              : hasAnyData
                ? `Here's what's happening with your WhatsApp business today`
                : `Let's get your WhatsApp business set up. It takes ~6 minutes.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200 shadow-sm">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days as 7 | 14 | 30)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300
                  ${dateRange === days
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 border border-transparent'
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
            className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 text-gray-500 hover:text-gray-900 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <SocialFollowCard />

      {/* Dynamic onboarding Card */}
      {!loadingStats && !hasAnyData && (
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(16, 185, 129, 0.06) 0%, transparent 60%)' }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mb-3 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Quick setup</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                You're all set up. <span className="italic font-light text-gray-500">Almost.</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-5 max-w-lg">
                Connect WhatsApp, import contacts, and send your first message. Most users finish in under 10 minutes.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('/dashboard/settings?tab=whatsapp')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-emerald-700 hover:-translate-y-0.5 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Connect WhatsApp
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard/contacts/import')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900 text-xs font-bold shadow-sm transition-all"
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
                    ${item.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-100'}
                  `}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold
                    ${item.done ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}
                  `}>
                    {item.done ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : item.step}
                  </div>
                  <span className={`text-xs font-medium ${item.done ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid container */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">

        {/* Left main area */}
        <div className="xl:col-span-3 space-y-6 min-w-0 w-full">

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingStats ? (
              <>
                <QuickStatSkeleton />
                <QuickStatSkeleton />
                <QuickStatSkeleton />
              </>
            ) : (
              <>
                <div className="relative overflow-hidden rounded-2xl bg-emerald-50/40 border border-emerald-100 p-6 group shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] text-emerald-600 group-hover:scale-110 transition-transform">
                    <FaWhatsapp size={80} />
                  </div>
                  <div className="relative">
                    <p className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest mb-1 font-semibold">WhatsApp</p>
                    <h3 className="text-3xl font-bold text-gray-900">{formatNum(messagesSent)}</h3>
                    <p className="text-xs text-gray-500 font-normal mt-2">Messages sent this month</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">{deliveryRate}% Delivery</span>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-pink-50/40 border border-pink-100 p-6 group shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] text-pink-600 group-hover:scale-110 transition-transform">
                    <Instagram size={80} />
                  </div>
                  <div className="relative">
                    <p className="text-[10px] font-mono text-pink-700 uppercase tracking-widest mb-1 font-semibold">Instagram</p>
                    <h3 className="text-3xl font-bold text-gray-900">0</h3>
                    <p className="text-xs text-gray-500 font-normal mt-2">Automated interactions</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full font-semibold">Coming soon</span>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-indigo-50/40 border border-indigo-100 p-6 group shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] text-indigo-600 group-hover:scale-110 transition-transform">
                    <Target size={80} />
                  </div>
                  <div className="relative">
                    <p className="text-[10px] font-mono text-indigo-700 uppercase tracking-widest mb-1 font-semibold">Efficiency</p>
                    <h3 className="text-3xl font-bold text-gray-900">84%</h3>
                    <p className="text-xs text-gray-500 font-normal mt-2">AI Response Accuracy</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Zap size={12} className="text-indigo-600" />
                      <span className="text-[10px] text-indigo-700 font-semibold">Saving hours/week</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Charts view */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Overview chart card */}
            <GlassCard className="lg:col-span-8 overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Messages Overview</h3>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {[
                    { color: '#10b981', label: 'Sent' },
                    { color: '#3b82f6', label: 'Delivered' },
                    { color: '#a855f7', label: 'Read' },
                    { color: '#ef4444', label: 'Failed' },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                      <span>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {loadingWidgets ? (
                <ChartSkeleton />
              ) : hasChartData ? (
                // ✅ FIXED: Touch scroll containment stops SVG chart overflows from stretching cards on 320px
                <div className="w-full overflow-x-auto scrollbar-none mt-6">
                  <div className="h-80 min-w-[500px] w-full">
                    <MessagesChart data={chartData} />
                  </div>
                </div>
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

            {/* Donut chart */}
            <GlassCard className="lg:col-span-4">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">Delivery</h3>
              </div>

              {loadingStats ? (
                <DonutSkeleton />
              ) : messagesSent > 0 ? (
                <DonutChart
                  delivered={totalDelivered}
                  read={stats?.delivery?.read ?? 0}
                  failed={totalFailed}
                  total={messagesSent}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-3">
                    <BarChart3 className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-semibold">No delivery data</p>
                  <p className="text-xs text-gray-400 mt-1">Send messages to see stats</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Delivered</span>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 mt-1">
                    {loadingStats ? '...' : formatNum(totalDelivered)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-red-50/50 border border-red-100">
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-3 h-3 text-red-600" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Failed</span>
                  </div>
                  <p className="text-sm font-bold text-red-700 mt-1">
                    {loadingStats ? '...' : formatNum(totalFailed)}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Table list card */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Recent Campaigns</h3>
              <Link to="/dashboard/campaigns" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
                View all
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {loadingWidgets ? (
              <TableSkeleton />
            ) : recentCampaigns.length > 0 ? (
              // ✅ FIXED: Scroll wrapper container handles tabular layouts on narrow viewport screens without cropping limits
              <div className="w-full overflow-x-auto scrollbar-none -mx-2 px-2">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="pb-3 px-2 font-bold">Campaign</th>
                      <th className="pb-3 px-2 font-bold">Status</th>
                      <th className="pb-3 px-2 font-bold text-right">Sent</th>
                      <th className="pb-3 px-2 font-bold text-right">Delivery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentCampaigns.map((campaign: any) => (
                      <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-2">
                          <Link to={`/dashboard/campaigns/${campaign.id}`} className="text-sm font-semibold text-gray-800 hover:text-emerald-600 transition-colors">
                            {campaign.name}
                          </Link>
                        </td>
                        <td className="py-3 px-2">
                          <StatusBadge status={campaign.status} />
                        </td>
                        <td className="py-3 px-2 text-right text-xs text-gray-500 font-mono font-semibold">
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
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-semibold">No campaigns yet</p>
                <Link to="/dashboard/campaigns/create" className="mt-3 inline-block text-xs text-emerald-600 hover:text-emerald-700 font-bold">
                  Create your first campaign →
                </Link>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right side widgets column */}
        <div className="xl:col-span-1 space-y-6 w-full">

          {/* Quick stats list */}
          <GlassCard>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">At a glance</h3>
            {loadingStats ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <QuickStatItem label="Unread chats" value={conversationsUnread} icon={Mail} color="#f59e0b" href="/dashboard/inbox" />
                <QuickStatItem label="Active chats" value={conversationsActive} icon={MessageSquare} color="#3b82f6" href="/dashboard/inbox" />
                <QuickStatItem label="Templates" value={templatesApproved} icon={FileText} color="#10b981" href="/dashboard/templates" />
                <QuickStatItem label="WhatsApp accounts" value={whatsappConnected} icon={Phone} color="#a855f7" href="/dashboard/settings" />
              </div>
            )}
          </GlassCard>

          {/* Quick actions buttons grids */}
          <GlassCard>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick actions</h3>
            {/* ✅ FIXED: Dynamic grid auto-adjusts boundaries preventing tight box content spills on small 320px screens */}
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
              {[
                { icon: Send, label: 'Campaign', color: '#059669', href: '/dashboard/campaigns/create' },
                { icon: Radio, label: 'Broadcast', color: '#7c3aed', href: '/dashboard/campaigns/create' },
                { icon: UserPlus, label: 'Contacts', color: '#059669', href: '/dashboard/contacts/import' },
                { icon: FileText, label: 'Template', color: '#d97706', href: '/dashboard/templates/create' },
                { icon: Bot, label: 'Chatbot', color: '#2563eb', href: '/dashboard/chatbots' },
                { icon: Workflow, label: 'Automation', color: '#2563eb', href: '/dashboard/automations' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.href)}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gray-50/50 border border-gray-200/60 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all duration-300 group"
                >
                  <action.icon className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: action.color }} />
                  <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900 truncate w-full text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Activity updates list */}
          <GlassCard>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recent activity</h3>

            {loadingActivity ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : activity.length > 0 ? (
              <div className="space-y-3 relative pl-3.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {activity.slice(0, 5).map((act) => (
                  <div key={act.id} className="relative">
                    <span className="absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                    <p className="text-xs font-semibold text-gray-800">
                      {act.action?.replace(/_/g, ' ').toLowerCase() || 'Activity'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                      {formatRelativeTime(act.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-semibold">No activity yet</p>
                <p className="text-[10px] text-gray-400 mt-1">Your actions will show up here</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

const QuickStatSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-200 p-6 shadow-sm animate-pulse">
    <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
    <div className="h-8 w-24 bg-gray-200 rounded mb-3" />
    <div className="h-3 w-32 bg-gray-200 rounded mb-3" />
    <div className="h-4 w-16 bg-gray-200 rounded-full" />
  </div>
);

const ChartSkeleton = () => (
  <div className="h-80 flex items-end gap-2 pt-8 animate-pulse">
    {[40, 60, 45, 80, 55, 70, 90].map((h, i) => (
      <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${h}%` }} />
    ))}
  </div>
);

const DonutSkeleton = () => (
  <div className="flex items-center justify-center py-4 animate-pulse">
    <div className="w-28 h-28 rounded-full border-8 border-gray-100" />
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-3 py-2">
        <div className="h-4 flex-1 bg-gray-100 rounded" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
        <div className="h-4 w-16 bg-gray-100 rounded" />
      </div>
    ))}
  </div>
);

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_1px_2px_0_rgba(0,0,0,0.03)] border border-gray-200 p-6 ${className}`}>
    <div className="relative">{children}</div>
  </div>
);

const MessagesChart: React.FC<{ data: any[] }> = ({ data }) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.sent, d.delivered, d.read, d.failed]), 1);

  return (
    <div className="relative w-full overflow-x-auto select-none pt-2 scrollbar-none">
      <svg className="w-full min-w-[480px] h-48 overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
        {[0, 45, 90, 135].map((y) => (
          <line key={y} x1="35" y1={y + 10} x2="495" y2={y + 10} stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="4 4" />
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
                  style={{ filter: `drop-shadow(0 1px 3px ${bar.color}25)` }}
                  className="hover:opacity-80 cursor-pointer transition-opacity"
                />
              ))}
              {(N <= 10 || idx % Math.ceil(N / 7) === 0) && (
                <text x={startX + (barWidth + gap) * 1.5} y="176" className="text-[9px] font-mono fill-gray-400 font-bold" textAnchor="middle">
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
    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center py-2">
      <div className="relative w-28 h-28 shrink-0">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="rgba(0,0,0,0.05)" strokeWidth="9" />
          {segments.map((s) => {
            const pct = (s.value / sum) * 100;
            const strokeLen = (pct / 100) * circumference;
            const offset = circumference - (currentOffset / 100) * circumference;
            currentOffset += pct;
            return (
              <circle key={s.name} cx="50" cy="50" r={radius} fill="transparent"
                stroke={s.color} strokeWidth="9"
                strokeDasharray={`${strokeLen} ${circumference}`}
                strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
                style={{ filter: `drop-shadow(0 1px 3px ${s.color}25)` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Total</span>
          <span className="text-base font-bold text-gray-900">{formatNum(total)}</span>
        </div>
      </div>

      <div className="space-y-1.5 w-full">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-500 font-semibold">{s.name}</span>
            <span className="text-gray-900 font-bold ml-auto">{Math.round((s.value / sum) * 100)}%</span>
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
    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
      <Icon className="w-7 h-7 text-gray-400" />
    </div>
    <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
    <p className="text-xs text-gray-400 font-semibold mb-4">{subtitle}</p>
    <Link to={actionHref} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-all shadow-sm">
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
  <Link to={href} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
        style={{ background: `${color}10`, border: `1px solid ${color}20` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span className="text-xs text-gray-600 font-medium group-hover:text-gray-900">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </Link>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    RUNNING: 'bg-blue-50 text-blue-700 border-blue-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
    PAUSED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };
  return (
    <span className={`px-2 py-1 text-[10px] font-mono font-semibold rounded-full border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
};

const DeliveryRateBadge: React.FC<{ rate: number }> = ({ rate }) => (
  <span className={`text-sm font-semibold ${rate >= 90 ? 'text-emerald-600' : rate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
    {rate}%
  </span>
);

export default Dashboard;