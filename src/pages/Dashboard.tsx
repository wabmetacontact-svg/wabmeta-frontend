import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, MessageSquare, Send, CheckCircle, XCircle,
  TrendingUp, TrendingDown, Zap, RefreshCw, ArrowUpRight,
  Mail, FileText, Bot, Workflow, Radio, UserPlus,
  Sparkles, Inbox, Phone, Instagram, Target, Play, Pause,
  MoreHorizontal, ArrowRight, BarChart3,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api, { dashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
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
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
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

  const [greeting, setGreeting] = useState(getGreeting());
  useEffect(() => {
    const timer = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    try {
      const [statsRes, widgetsRes, activityRes] = await Promise.all([
        dashboard.getStats(),
        dashboard.getWidgets(dateRange),
        dashboard.getActivity(10),
      ]);

      if (statsRes?.data?.success) setStats(statsRes.data.data);
      if (widgetsRes?.data?.success) setWidgets(widgetsRes.data.data);
      if (activityRes?.data?.success && Array.isArray(activityRes.data.data)) {
        setActivity(activityRes.data.data);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      toast.error('Failed to load dashboard');
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => { fetchData(true); }, [dateRange]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchData(false);
    socket.on('message:new', handler);
    socket.on('message:status', handler);
    socket.on('campaign:update', handler);
    socket.on('campaign:progress', handler);
    socket.on('campaign:completed', handler);
    return () => {
      socket.off('message:new', handler);
      socket.off('message:status', handler);
      socket.off('campaign:update', handler);
      socket.off('campaign:progress', handler);
      socket.off('campaign:completed', handler);
    };
  }, [socket]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData(false);
      toast.success('Refreshed');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <PageSkeleton />;

  // Real data
  const contactsTotal       = stats?.contacts?.total ?? 0;
  const contactsGrowth      = stats?.contacts?.growth ?? 0;
  const messagesSent        = stats?.messages?.sent ?? 0;
  const messagesGrowth      = stats?.messages?.growth ?? 0;
  const deliveryRate        = stats?.delivery?.deliveryRate ?? 0;
  const readRate            = stats?.delivery?.readRate ?? 0;
  const totalDelivered      = stats?.delivery?.delivered ?? 0;
  const totalRead           = stats?.delivery?.read ?? 0;
  const totalFailed         = stats?.delivery?.failed ?? 0;
  const activeCampaigns     = stats?.campaigns?.active ?? 0;
  const completedCampaigns  = stats?.campaigns?.completed ?? 0;
  const conversationsUnread = stats?.conversations?.unread ?? 0;
  const conversationsActive = stats?.conversations?.active ?? 0;
  const templatesApproved   = stats?.templates?.approved ?? 0;
  const whatsappConnected   = stats?.whatsapp?.connected ?? 0;

  const chartData = widgets?.messagesOverview?.map((item: any) => ({
    label: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    sent: item.sent || 0,
    delivered: item.delivered || 0,
    read: item.read || 0,
    failed: item.failed || 0,
  })) || [];

  const recentCampaigns = widgets?.recentCampaigns || [];
  const hasAnyData = contactsTotal > 0 || messagesSent > 0 || activeCampaigns > 0;
  const hasChartData = chartData.length > 0 && chartData.some((d: any) => d.sent > 0);
  const userName = user?.firstName || 'there';
  const initial = (userName.charAt(0) || 'U').toUpperCase();

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-6 animate-fadeIn">

      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
            bg-white dark:bg-[#1A2331] border border-cream-300 dark:border-[#2A3441] mb-2">
            <Sparkles className="w-3 h-3 text-ocean-500" />
            <span className="text-[10px] font-medium text-ink-700 dark:text-cream-100 uppercase tracking-wider">
              {greeting}
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-ink-900 dark:text-cream-100 tracking-tight">
            Welcome in, <span className="font-serif italic font-light">{userName}</span>
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {hasAnyData
              ? `Here's what's happening with your business today`
              : `Let's get your WhatsApp business set up`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 p-1 rounded-full
            bg-white dark:bg-[#1A2331]
            border border-cream-300 dark:border-[#2A3441]">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDateRange(d as 7 | 14 | 30)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all
                  ${dateRange === d
                    ? 'bg-ink-900 dark:bg-mint-500 text-white dark:text-ink-900'
                    : 'text-ink-500 hover:text-ink-900 dark:hover:text-cream-100'
                  }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-10 h-10 rounded-full flex items-center justify-center
              bg-white dark:bg-[#1A2331]
              border border-cream-300 dark:border-[#2A3441]
              text-ink-700 dark:text-cream-100
              hover:bg-cream-100 dark:hover:bg-[#131922]
              transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ═══════════════ PROGRESS BAR ROW (Crextio style) ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Progress segments */}
        <div className="lg:col-span-7">
          <div className="card-surface p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <ProgressLabel label="Delivered" value={`${deliveryRate}%`}  color="#1A2E4A" />
              <ProgressLabel label="Read"      value={`${readRate}%`}      color="#2DD4BF" highlight />
              <ProgressLabel label="Failed"    value={`${messagesSent > 0 ? Math.round((totalFailed / messagesSent) * 100) : 0}%`} color="#E8E2D5" muted />
              <ProgressLabel label="Active"    value={`${activeCampaigns}`} color="#FAF7F0" muted />
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-cream-200 dark:bg-[#131922]">
              <div className="bg-ink-900 dark:bg-ink-50" style={{ width: `${deliveryRate * 0.5}%` }} />
              <div className="bg-mint-500" style={{ width: `${readRate * 0.4}%` }} />
              <div className="bg-cream-300 dark:bg-[#2A3441]" style={{ width: '30%', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 8px)' }} />
            </div>
          </div>
        </div>

        {/* Right: Mini stats (like Employee/Hirings/Projects) */}
        <div className="lg:col-span-5">
          <div className="card-surface p-4">
            <div className="grid grid-cols-3 gap-2">
              <MiniStat icon={Users} value={formatNum(contactsTotal)} label="Contacts" />
              <MiniStat icon={Send} value={formatNum(messagesSent)} label="Messages" />
              <MiniStat icon={Zap} value={`${activeCampaigns + completedCampaigns}`} label="Campaigns" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ MAIN BENTO GRID ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* CARD 1: User profile (Crextio "Lora" style) */}
        <div className="lg:col-span-3 relative overflow-hidden rounded-3xl
          bg-gradient-to-br from-ocean-100 to-cream-200
          dark:from-[#1A2331] dark:to-[#0F1419]
          border border-cream-300 dark:border-[#2A3441]
          aspect-square min-h-[280px] group">

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full
              bg-gradient-to-br from-ocean-500 to-ocean-900
              flex items-center justify-center text-white text-5xl font-bold
              shadow-glow group-hover:scale-110 transition-transform duration-700">
              {initial}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4
            bg-gradient-to-t from-white/95 via-white/70 to-transparent
            dark:from-[#1A2331]/95 dark:via-[#1A2331]/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ink-900 dark:text-cream-100">{userName}</p>
                <p className="text-[10px] text-ink-500 font-mono uppercase tracking-wider">
                  {user?.role || 'Owner'}
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-white dark:bg-[#0F1419]
                border border-cream-300 dark:border-[#2A3441]
                text-[10px] font-bold text-ink-900 dark:text-cream-100">
                Pro
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Progress (messages this week) */}
        <div className="lg:col-span-3 card-surface p-5 aspect-square min-h-[280px] flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-semibold text-ink-900 dark:text-cream-100">Progress</h3>
            <button className="w-8 h-8 rounded-full bg-cream-100 dark:bg-[#131922]
              flex items-center justify-center
              hover:bg-cream-200 dark:hover:bg-[#0F1419] transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5 text-ink-700 dark:text-cream-100" />
            </button>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-ink-900 dark:text-cream-100 font-serif">
              {formatNum(messagesSent)}
            </span>
            <span className="text-xs text-ink-500">sent</span>
          </div>
          <p className="text-[10px] text-ink-500 mb-4">
            {messagesGrowth >= 0 ? '↑' : '↓'} {Math.abs(messagesGrowth)}% this week
          </p>

          {/* Bar chart */}
          <div className="flex-1 flex items-end justify-between gap-1 pt-2">
            {chartData.length > 0 ? chartData.slice(-7).map((d: any, i: number) => {
              const max = Math.max(...chartData.map((x: any) => x.sent), 1);
              const h = (d.sent / max) * 100;
              const isMax = d.sent === max && d.sent > 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative">
                    {isMax && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2
                        text-[9px] font-bold text-ink-900 dark:text-cream-100
                        bg-mint-500 px-1.5 py-0.5 rounded">
                        {d.sent}
                      </div>
                    )}
                    <div
                      className={`w-full rounded-full transition-all
                        ${isMax ? 'bg-mint-500' : 'bg-ink-900 dark:bg-cream-100'}
                      `}
                      style={{ height: `${Math.max(h, 4)}px`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-[9px] text-ink-400 font-mono uppercase">
                    {d.label?.[0]}
                  </span>
                </div>
              );
            }) : (
              <div className="w-full flex items-center justify-center text-xs text-ink-400">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* CARD 3: Delivery Tracker (donut) */}
        <div className="lg:col-span-3 card-surface p-5 aspect-square min-h-[280px] flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-semibold text-ink-900 dark:text-cream-100">Delivery</h3>
            <button className="w-8 h-8 rounded-full bg-cream-100 dark:bg-[#131922]
              flex items-center justify-center
              hover:bg-cream-200 dark:hover:bg-[#0F1419] transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5 text-ink-700 dark:text-cream-100" />
            </button>
          </div>

          {messagesSent > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <DonutChart delivered={totalDelivered} read={totalRead} failed={totalFailed} total={messagesSent} />
              <div className="flex items-center gap-3 mt-3 text-[10px]">
                <Legend color="#1A2E4A" label="Delivered" />
                <Legend color="#2DD4BF" label="Read" />
                <Legend color="#EF4444" label="Failed" />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <BarChart3 className="w-10 h-10 text-ink-400 mb-2" />
              <p className="text-xs text-ink-500">No data yet</p>
            </div>
          )}
        </div>

        {/* CARD 4: Onboarding tasks (dark accent card) */}
        <div className="lg:col-span-3 rounded-3xl card-dark p-5 aspect-square min-h-[280px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-cream-100">Setup Tasks</h3>
            <div className="text-xs font-mono text-cream-100/60">
              {[whatsappConnected, contactsTotal, templatesApproved, activeCampaigns].filter(x => x > 0).length}/4
            </div>
          </div>

          <div className="space-y-2 flex-1">
            {[
              { label: 'Connect WhatsApp', done: whatsappConnected > 0, href: '/dashboard/settings?tab=whatsapp', icon: Phone },
              { label: 'Import Contacts',  done: contactsTotal > 0,    href: '/dashboard/contacts/import',         icon: UserPlus },
              { label: 'Create Template',  done: templatesApproved > 0, href: '/dashboard/templates/create',       icon: FileText },
              { label: 'Send Campaign',    done: activeCampaigns + completedCampaigns > 0, href: '/dashboard/campaigns/create', icon: Send },
            ].map((task) => (
              <Link
                key={task.label}
                to={task.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl
                  transition-all hover:translate-x-0.5
                  ${task.done
                    ? 'bg-mint-500/10 border border-mint-500/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                  ${task.done ? 'bg-mint-500' : 'bg-white/10'}
                `}>
                  {task.done
                    ? <CheckCircle className="w-3.5 h-3.5 text-ink-900" />
                    : <task.icon className="w-3.5 h-3.5 text-cream-100" />
                  }
                </div>
                <span className={`text-xs flex-1 ${task.done ? 'text-cream-100' : 'text-cream-100/70'}`}>
                  {task.label}
                </span>
                {!task.done && <ArrowRight className="w-3 h-3 text-cream-100/40" />}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════ ROW 2: MAIN CONTENT ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* LEFT: Quick info card (Pension/Devices style) */}
        <div className="lg:col-span-4 space-y-4">

          {/* Channel performance */}
          <div className="card-surface p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-cream-100">Channels</h3>
              <MoreHorizontal className="w-4 h-4 text-ink-400" />
            </div>

            <div className="space-y-3">
              <ChannelRow
                icon={FaWhatsapp}
                color="#25D366"
                label="WhatsApp"
                value={formatNum(messagesSent)}
                subtitle={`${deliveryRate}% delivery`}
              />
              <ChannelRow
                icon={Instagram}
                color="#E1306C"
                label="Instagram"
                value="0"
                subtitle="Coming soon"
              />
            </div>
          </div>

          {/* Quick stats list */}
          <div className="card-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-cream-100">At a glance</h3>
              <MoreHorizontal className="w-4 h-4 text-ink-400" />
            </div>

            <div className="space-y-1.5">
              <QuickRow icon={Mail}        label="Unread chats"      value={conversationsUnread} href="/dashboard/inbox" />
              <QuickRow icon={MessageSquare} label="Active chats"    value={conversationsActive} href="/dashboard/inbox" />
              <QuickRow icon={FileText}    label="Templates"         value={templatesApproved}   href="/dashboard/templates" />
              <QuickRow icon={Phone}       label="WhatsApp accounts" value={whatsappConnected}   href="/dashboard/settings" />
              <QuickRow icon={Users}       label="Total contacts"    value={contactsTotal}       href="/dashboard/contacts" />
            </div>
          </div>
        </div>

        {/* CENTER: Calendar / Timeline (recent campaigns timeline) */}
        <div className="lg:col-span-5">
          <div className="card-surface p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-ink-900 dark:text-cream-100">Recent Campaigns</h3>
                <p className="text-[10px] text-ink-500 mt-0.5 font-mono uppercase tracking-wider">
                  Last {dateRange} days
                </p>
              </div>
              <Link
                to="/dashboard/campaigns"
                className="text-xs font-medium text-ocean-500 hover:text-ocean-600 flex items-center gap-1 group"
              >
                View all
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {recentCampaigns.length > 0 ? (
              <div className="space-y-2">
                {recentCampaigns.slice(0, 5).map((c: any) => (
                  <Link
                    key={c.id}
                    to={`/dashboard/campaigns/${c.id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl
                      bg-cream-50 dark:bg-[#131922]
                      border border-cream-200 dark:border-[#2A3441]
                      hover:bg-cream-100 dark:hover:bg-[#0F1419]
                      hover:-translate-y-0.5 hover:shadow-soft
                      transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1A2331]
                      border border-cream-300 dark:border-[#2A3441]
                      flex items-center justify-center flex-shrink-0">
                      <Send className="w-4 h-4 text-ocean-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 dark:text-cream-100 truncate">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={c.status} />
                        <span className="text-[10px] text-ink-500 font-mono">
                          {c.sentCount || 0}/{c.totalContacts || 0}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold
                        ${(c.deliveryRate || 0) >= 90 ? 'text-mint-600 dark:text-mint-400'
                          : (c.deliveryRate || 0) >= 70 ? 'text-amber-500'
                          : 'text-red-500'
                        }`}>
                        {c.deliveryRate || 0}%
                      </p>
                      <p className="text-[10px] text-ink-500 font-mono">delivery</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-cream-100 dark:bg-[#131922] flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-ink-400" />
                </div>
                <p className="text-sm font-medium text-ink-900 dark:text-cream-100 mb-1">No campaigns yet</p>
                <p className="text-xs text-ink-500 mb-4">Create your first campaign to see it here</p>
                <button
                  onClick={() => navigate('/dashboard/campaigns/create')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                    bg-ink-900 dark:bg-mint-500 text-white dark:text-ink-900 text-xs font-semibold
                    hover:scale-105 transition-transform"
                >
                  Create campaign
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Dark task card (Onboarding Task style) */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl card-dark p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-cream-100">Quick Actions</h3>
            </div>

            <div className="space-y-2 flex-1">
              {[
                { icon: Send,     label: 'New Campaign',  href: '/dashboard/campaigns/create' },
                { icon: UserPlus, label: 'Add Contacts',  href: '/dashboard/contacts/import' },
                { icon: FileText, label: 'New Template',  href: '/dashboard/templates/create' },
                { icon: Bot,      label: 'New Chatbot',   href: '/dashboard/chatbots' },
                { icon: Workflow, label: 'New Automation', href: '/dashboard/automations' },
                { icon: Radio,    label: 'Broadcast',     href: '/dashboard/campaigns/create' },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.href}
                  className="flex items-center gap-3 p-2.5 rounded-xl
                    bg-white/5 hover:bg-white/10
                    border border-white/10 hover:border-mint-500/30
                    transition-all hover:translate-x-0.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10
                    flex items-center justify-center
                    group-hover:bg-mint-500/20 transition-colors">
                    <a.icon className="w-3.5 h-3.5 text-cream-100 group-hover:text-mint-300" />
                  </div>
                  <span className="text-xs text-cream-100/90 group-hover:text-cream-100 flex-1">
                    {a.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-cream-100/30 group-hover:text-mint-300 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ ROW 3: CHART (large) + ACTIVITY ═══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Messages chart */}
        <div className="lg:col-span-8 card-surface p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-ink-900 dark:text-cream-100">Messages Overview</h3>
              <p className="text-[10px] text-ink-500 mt-0.5 font-mono uppercase tracking-wider">
                {dateRange} day trend
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Legend color="#1A2E4A" label="Sent" />
              <Legend color="#5B8DEF" label="Delivered" />
              <Legend color="#2DD4BF" label="Read" />
              <Legend color="#EF4444" label="Failed" />
            </div>
          </div>

          {hasChartData ? (
            <MessagesChart data={chartData} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-cream-100 dark:bg-[#131922] flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-ink-400" />
              </div>
              <p className="text-sm font-medium text-ink-900 dark:text-cream-100 mb-1">No messages yet</p>
              <p className="text-xs text-ink-500">Send your first message to see the chart</p>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="lg:col-span-4 card-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-ink-900 dark:text-cream-100">Activity</h3>
            <MoreHorizontal className="w-4 h-4 text-ink-400" />
          </div>

          {activity.length > 0 ? (
            <div className="space-y-3 relative pl-4
              before:absolute before:left-1.5 before:top-2 before:bottom-2
              before:w-px before:bg-cream-300 dark:before:bg-[#2A3441]">
              {activity.slice(0, 6).map((a) => (
                <div key={a.id} className="relative">
                  <span className="absolute -left-[18px] top-1 w-3 h-3 rounded-full
                    bg-mint-500 ring-4 ring-white dark:ring-[#1A2331]" />
                  <p className="text-xs font-medium text-ink-900 dark:text-cream-100 capitalize">
                    {a.action?.replace(/_/g, ' ').toLowerCase() || 'Activity'}
                  </p>
                  <p className="text-[10px] text-ink-500 mt-0.5 font-mono">
                    {formatRelativeTime(a.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Inbox className="w-8 h-8 text-ink-400 mx-auto mb-2" />
              <p className="text-xs text-ink-500">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

const ProgressLabel: React.FC<{ label: string; value: string; color: string; highlight?: boolean; muted?: boolean }> = ({ label, value, highlight, muted }) => (
  <div>
    <p className="text-[10px] text-ink-500 font-mono uppercase tracking-wider mb-1">{label}</p>
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold
      ${highlight
        ? 'bg-mint-500 text-ink-900'
        : muted
        ? 'bg-cream-200 dark:bg-[#131922] text-ink-500'
        : 'bg-ink-900 dark:bg-cream-100 text-cream-100 dark:text-ink-900'
      }`}>
      {value}
    </span>
  </div>
);

const MiniStat: React.FC<{ icon: React.ElementType; value: string; label: string }> = ({ icon: Icon, value, label }) => (
  <div className="text-center">
    <div className="w-9 h-9 mx-auto rounded-xl bg-cream-100 dark:bg-[#131922]
      border border-cream-300 dark:border-[#2A3441]
      flex items-center justify-center mb-1.5">
      <Icon className="w-4 h-4 text-ink-700 dark:text-cream-100" />
    </div>
    <p className="text-xl font-bold text-ink-900 dark:text-cream-100 font-serif">{value}</p>
    <p className="text-[10px] text-ink-500 uppercase tracking-wider">{label}</p>
  </div>
);

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
    <span className="text-[10px] text-ink-500 font-medium">{label}</span>
  </div>
);

const ChannelRow: React.FC<{ icon: React.ElementType; color: string; label: string; value: string; subtitle: string }> = ({ icon: Icon, color, label, value, subtitle }) => (
  <div className="flex items-center gap-3 p-2 rounded-xl
    hover:bg-cream-100 dark:hover:bg-[#131922] transition-colors">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-ink-900 dark:text-cream-100">{label}</p>
      <p className="text-[10px] text-ink-500">{subtitle}</p>
    </div>
    <p className="text-sm font-bold text-ink-900 dark:text-cream-100 font-serif">{value}</p>
  </div>
);

const QuickRow: React.FC<{ icon: React.ElementType; label: string; value: number; href: string }> = ({ icon: Icon, label, value, href }) => (
  <Link
    to={href}
    className="flex items-center justify-between p-2 rounded-xl
      hover:bg-cream-100 dark:hover:bg-[#131922] transition-colors group"
  >
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-cream-100 dark:bg-[#131922]
        border border-cream-300 dark:border-[#2A3441]
        flex items-center justify-center
        group-hover:border-ocean-500 transition-colors">
        <Icon className="w-3.5 h-3.5 text-ink-700 dark:text-cream-100" />
      </div>
      <span className="text-xs text-ink-700 dark:text-cream-100">{label}</span>
    </div>
    <span className="text-sm font-bold text-ink-900 dark:text-cream-100 font-mono">
      {value.toLocaleString()}
    </span>
  </Link>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    COMPLETED: 'bg-mint-500/15 text-mint-700 dark:text-mint-300 border-mint-500/30',
    RUNNING:   'bg-ocean-500/15 text-ocean-700 dark:text-ocean-300 border-ocean-500/30',
    FAILED:    'bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30',
    PAUSED:    'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    DRAFT:     'bg-cream-200 dark:bg-[#131922] text-ink-500 border-cream-300 dark:border-[#2A3441]',
    SCHEDULED: 'bg-ocean-500/15 text-ocean-700 dark:text-ocean-300 border-ocean-500/30',
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border
      ${styles[status] || 'bg-cream-200 dark:bg-[#131922] text-ink-500 border-cream-300 dark:border-[#2A3441]'}
    `}>
      {status}
    </span>
  );
};

// Donut Chart
const DonutChart: React.FC<{ delivered: number; read: number; failed: number; total: number }> = ({
  delivered, read, failed, total
}) => {
  const segments = [
    { value: delivered, color: '#1A2E4A' },
    { value: read,      color: '#2DD4BF' },
    { value: failed,    color: '#EF4444' },
  ];
  const sum = segments.reduce((a, s) => a + s.value, 0);
  if (sum === 0) return null;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="transparent"
          stroke="#E8E2D5" strokeWidth="10" className="dark:stroke-[#2A3441]" />
        {segments.map((s, i) => {
          const pct = (s.value / sum) * 100;
          const strokeLen = (pct / 100) * circumference;
          const offset = -((currentOffset / 100) * circumference);
          currentOffset += pct;
          return (
            <circle key={i}
              cx="50" cy="50" r={radius} fill="transparent"
              stroke={s.color} strokeWidth="10"
              strokeDasharray={`${strokeLen} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[9px] text-ink-500 uppercase tracking-wider font-mono">Total</span>
        <span className="text-xl font-bold text-ink-900 dark:text-cream-100 font-serif">{formatNum(total)}</span>
      </div>
    </div>
  );
};

// Messages Chart
const MessagesChart: React.FC<{ data: any[] }> = ({ data }) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.sent, d.delivered, d.read, d.failed]), 1);

  return (
    <div className="w-full overflow-x-auto pt-4">
      <svg className="w-full min-w-[420px] h-56" viewBox="0 0 500 200" preserveAspectRatio="none">
        {[0, 50, 100, 150].map((y) => (
          <line key={y} x1="20" y1={y + 10} x2="495" y2={y + 10}
            stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="4 4"
            className="text-ink-900 dark:text-cream-100" />
        ))}

        {data.map((item, idx) => {
          const N = data.length;
          const chartWidth = 460;
          const step = chartWidth / N;
          const startX = 25 + idx * step;
          const barWidth = Math.max(2, Math.min(8, step / 6));
          const gap = barWidth * 0.3;
          const heightRatio = maxVal > 0 ? 160 / maxVal : 0;

          return (
            <g key={idx}>
              {[
                { val: item.sent,      color: '#1A2E4A', offset: 0 },
                { val: item.delivered, color: '#5B8DEF', offset: 1 },
                { val: item.read,      color: '#2DD4BF', offset: 2 },
                { val: item.failed,    color: '#EF4444', offset: 3 },
              ].map((bar) => (
                <rect
                  key={bar.offset}
                  x={startX + (barWidth + gap) * bar.offset}
                  y={175 - bar.val * heightRatio}
                  width={barWidth}
                  height={Math.max(bar.val * heightRatio, 2)}
                  fill={bar.color}
                  rx={barWidth / 2}
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                />
              ))}
              {(N <= 10 || idx % Math.ceil(N / 7) === 0) && (
                <text x={startX + (barWidth + gap) * 1.5} y="195"
                  className="text-[9px] font-mono fill-current text-ink-500"
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

export default Dashboard;