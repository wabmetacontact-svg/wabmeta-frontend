// src/pages/instagram/InstagramDashboard.tsx
// Instagram hub. Every figure comes from a real endpoint — stats, rule counts,
// top rules and the activity feed are all live data, never placeholders.

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare, Users, Send, Zap, ArrowUpRight,
  MessageCircle, RefreshCw, TrendingUp, Activity,
  Heart, BarChart3, Sparkles, CheckCircle, AlertCircle,
  Settings, Shield, ChevronRight, Grid, BookOpen
} from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { instagram, inbox as inboxApi } from '../../services/api';
import PageLoader from '../../components/common/PageLoader';
import {
  GlassCard, StatCard,
  INSTAGRAM_THEME as T, primaryBtnStyle
} from '../../components/channel/channelUi';

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0));

/** Real relative time from a real timestamp. */
export const timeAgo = (iso?: string | null): string => {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return '';
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d}d ago`;
};

export interface ActivityItem { id: string; text: string; at?: string | null }

/** Recent conversations on a channel, shaped into an activity feed. */
export const loadChannelActivity = async (
  channel: 'INSTAGRAM' | 'TELEGRAM'
): Promise<ActivityItem[]> => {
  try {
    const res = await inboxApi.getConversations({ channel, limit: 5, isArchived: false });
    const raw = res.data?.data;
    const list: any[] = Array.isArray(raw) ? raw : raw?.conversations || [];
    return list.map((c) => {
      const name =
        [c.contact?.firstName, c.contact?.lastName].filter(Boolean).join(' ').trim() ||
        c.contact?.instagramUsername ||
        c.contact?.telegramUsername ||
        'Contact';
      return {
        id: c.id,
        text: c.lastMessagePreview ? `${name}: ${c.lastMessagePreview}` : `Conversation with ${name}`,
        at: c.lastMessageAt,
      };
    });
  } catch {
    return [];
  }
};

interface TopRule { id: string; name: string; triggerType: string; count: number }

interface IgStats {
  accounts: number;
  conversations: number;
  contacts: number;
  rangeDays?: number;
  messages: { inbound: number; outbound: number; total: number };
  automations: { rules: number; triggered: number };
  storyTriggered?: number;
  commentTriggered?: number;
  topRules?: TopRule[];
  daily: { date: string; label: string; inbound: number; outbound: number }[];
}

const InstagramDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<IgStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);

  const [dmRulesCount, setDmRulesCount] = useState(0);
  const [commentRulesCount, setCommentRulesCount] = useState(0);
  const [storyRulesCount, setStoryRulesCount] = useState(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const load = useCallback(async (days: 7 | 14 | 30, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsRes, dmRes, commentRes, storyRes, acts] = await Promise.all([
        instagram.getInboxStats(days),
        instagram.getAutomations().catch(() => ({ data: { data: [] } })),
        instagram.getCommentRules().catch(() => ({ data: { data: [] } })),
        instagram.getStoryRules().catch(() => ({ data: { data: [] } })),
        loadChannelActivity('INSTAGRAM'),
      ]);
      setStats(statsRes.data?.data ?? null);
      setDmRulesCount(Array.isArray(dmRes.data?.data) ? dmRes.data.data.length : 0);
      setCommentRulesCount(Array.isArray(commentRes.data?.data) ? commentRes.data.data.length : 0);
      setStoryRulesCount(Array.isArray(storyRes.data?.data) ? storyRes.data.data.length : 0);
      setActivity(acts);
    } catch {
      /* empty states render */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(dateRange); }, [load, dateRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(dateRange, true);
    toast.success('Dashboard refreshed');
  };

  if (loading) return <PageLoader />;

  const connected = (stats?.accounts ?? 0) > 0;
  const totalMessages = stats?.messages?.total ?? 0;
  const inbound = stats?.messages?.inbound ?? 0;
  const outbound = stats?.messages?.outbound ?? 0;
  const replyRate = inbound > 0 ? Math.round((outbound / inbound) * 100) : 0;
  const autoReplies = stats?.automations?.triggered ?? 0;
  const storyTriggered = stats?.storyTriggered ?? 0;
  const commentTriggered = stats?.commentTriggered ?? 0;
  const topRules = stats?.topRules ?? [];
  const totalRules = dmRulesCount + commentRulesCount + storyRulesCount;

  const onboardingSteps = [
    { step: '01', label: 'Connect Instagram account', done: connected, href: '/instagram/settings' },
    { step: '02', label: 'Create a DM automation rule', done: dmRulesCount > 0, href: '/instagram/dm-automation' },
    { step: '03', label: 'Set up comment automation', done: commentRulesCount > 0, href: '/instagram/comments' },
    { step: '04', label: 'Add a story auto-reply', done: storyRulesCount > 0, href: '/instagram/stories' },
  ];
  const completedSteps = onboardingSteps.filter((s) => s.done).length;
  const showQuickSetup = completedSteps < 4;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl ${T.softBg} border ${T.softBorder} flex items-center justify-center flex-shrink-0`}>
            <FaInstagram className={`w-6 h-6 ${T.iconText}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Instagram Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {connected ? 'Instagram Analytics' : 'Welcome to Instagram Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {connected
                ? 'Monitor DMs, comments, stories and automation performance.'
                : 'Connect your Instagram Business account to unlock automation.'}
            </p>
          </div>
        </div>

        {connected && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
              {([7, 14, 30] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setDateRange(days)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    dateRange === days
                      ? 'bg-pink-50 text-pink-700 border border-pink-200 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh"
              className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/instagram/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all"
              style={primaryBtnStyle(T)}
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </Link>
          </div>
        )}
      </div>

      {/* Quick setup — progress driven by real rule counts */}
      {showQuickSetup && (
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(225,48,108,0.06) 0%, transparent 60%)' }} />

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${T.softBg} border ${T.softBorder} mb-3 select-none`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.accent }} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${T.labelText}`}>
                  {completedSteps === 0 ? 'Quick setup' : `${completedSteps} of 4 completed`}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {connected
                  ? <>You're getting there. <span className="italic font-light text-gray-500">Keep going.</span></>
                  : <>Let's set up Instagram. <span className="italic font-light text-gray-500">Takes 5 mins.</span></>}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-5 max-w-lg">
                {connected
                  ? 'Finish the remaining steps to get the most out of Instagram automation.'
                  : 'Connect your Instagram Business account, then turn DMs, comments and story replies into conversations.'}
              </p>

              <div className="flex flex-wrap gap-2">
                {!connected ? (
                  <Link to="/instagram/settings" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all" style={primaryBtnStyle(T)}>
                    <FaInstagram className="w-4 h-4" /> Connect Instagram <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <>
                    {dmRulesCount === 0 && (
                      <Link to="/instagram/dm-automation" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all" style={primaryBtnStyle(T)}>
                        <MessageCircle className="w-4 h-4" /> Create DM rule <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {commentRulesCount === 0 && (
                      <Link to="/instagram/comments" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900 text-xs font-bold shadow-sm transition-all">
                        <MessageSquare className="w-4 h-4" /> Set up comments
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {onboardingSteps.map((item) => (
                <Link
                  key={item.step}
                  to={item.href}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all hover:shadow-sm ${
                    item.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-100 hover:border-pink-200'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold ${
                    item.done ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}>
                    {item.done ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : item.step}
                  </div>
                  <span className={`text-xs font-medium flex-1 ${item.done ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                  {!item.done && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard theme={T} icon={MessageSquare} label="Conversations" value={fmt(stats?.conversations ?? 0)} hint="Instagram DM threads" />
        <StatCard theme={T} icon={Users} label="Contacts" value={fmt(stats?.contacts ?? 0)} hint="Unique Instagram users" />
        <StatCard theme={T} icon={Send} label="Messages" value={fmt(totalMessages)} hint="Sent + received" pill={outbound > 0 ? `${fmt(outbound)} sent` : undefined} />
        <StatCard theme={T} icon={Zap} label="DM Auto-Replies" value={fmt(autoReplies)} hint="DM rule triggers fired" />
      </div>

      {/* Real secondary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-pink-600" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reply Rate</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{inbound > 0 ? `${replyRate}%` : '—'}</h3>
          <p className="text-[11px] text-gray-400 mt-1">{fmt(outbound)} outbound per {fmt(inbound)} inbound</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Comment Replies</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{fmt(commentTriggered)}</h3>
          <p className="text-[11px] text-gray-400 mt-1">Comment rules fired all-time</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Heart className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Automation Rules</span>
            </div>
            {totalRules > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Live</span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalRules}</h3>
          <p className="text-[11px] text-gray-400 mt-1">
            {dmRulesCount} DM · {commentRulesCount} comment · {storyRulesCount} story
            {storyTriggered > 0 ? ` · ${fmt(storyTriggered)} story fires` : ''}
          </p>
        </GlassCard>
      </div>

      {/* Chart + real activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-pink-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Message Volume · Last {dateRange} Days</h3>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: T.accent }} /> Inbound
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Outbound
              </span>
            </div>
          </div>

          {stats?.daily && stats.daily.some((d) => d.inbound || d.outbound) ? (
            <div className="w-full overflow-x-auto">
              <div className="h-52 min-w-[400px]">
                <ChannelChart data={stats.daily} accent={T.accent} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-3">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">No messages in this period</p>
              <p className="text-xs text-gray-400 mb-4">
                {connected ? 'Volume appears once conversations start' : 'Connect Instagram to start tracking'}
              </p>
              {!connected && (
                <Link to="/instagram/settings" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-50 border border-pink-100 text-pink-700 text-xs font-bold hover:bg-pink-100 transition-all">
                  Connect now <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </GlassCard>

        {/* Activity — real recent conversations */}
        <GlassCard className="lg:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-500" /> Recent Activity
            </h3>
            {activity.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </div>

          {activity.length > 0 ? (
            <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {activity.map((act) => (
                <Link key={act.id} to={`/dashboard/inbox/${act.id}`} className="relative block group">
                  <span className="absolute -left-[17px] top-1.5 w-3 h-3 rounded-full bg-pink-500 border-2 border-white shadow-sm" />
                  <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-pink-700">{act.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{timeAgo(act.at)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs font-semibold text-gray-600">No activity yet</p>
              <p className="text-[10px] text-gray-400 mt-1">Recent conversations appear here</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Top rules + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-500" /> Top Performing Rules
            </h3>
            <Link to="/instagram/dm-automation" className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {topRules.length > 0 ? (
            <div className="space-y-2">
              {topRules.map((rule, i) => {
                const maxCount = Math.max(...topRules.map((r) => r.count), 1);
                const pct = Math.round((rule.count / maxCount) * 100);
                return (
                  <div key={rule.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-[10px] font-mono font-bold text-pink-600 shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-800 truncate">{rule.name}</span>
                        <span className="text-xs font-bold text-gray-900 ml-2 shrink-0">{rule.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: T.gradient || T.accent }} />
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 uppercase bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded shrink-0">
                      {rule.triggerType}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-semibold">
                {totalRules === 0 ? 'No rules created yet' : 'No rule has fired yet'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {totalRules === 0 ? 'Create one to start automating' : 'Counts appear once automations trigger'}
              </p>
              {totalRules === 0 && (
                <Link to="/instagram/dm-automation" className="mt-3 inline-block text-xs text-pink-600 hover:text-pink-700 font-bold">
                  Create your first automation →
                </Link>
              )}
            </div>
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: MessageCircle, label: 'DM Rules', color: '#e1306c', href: '/instagram/dm-automation' },
              { icon: MessageSquare, label: 'Comments', color: '#833ab4', href: '/instagram/comments' },
              { icon: BookOpen, label: 'Stories', color: '#fcb045', href: '/instagram/stories' },
              { icon: Grid, label: 'Posts', color: '#fd1d1d', href: '/instagram/content' },
              { icon: Send, label: 'Inbox', color: '#e1306c', href: '/dashboard/inbox' },
              { icon: Settings, label: 'Settings', color: '#833ab4', href: '/instagram/settings' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.href)}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gray-50/50 border border-gray-200/60 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all group"
              >
                <action.icon className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: action.color }} />
                <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900 truncate w-full text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Connection + navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Connection</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[11px] text-gray-500">Instagram account</span>
              <span className={`text-[10px] font-bold flex items-center gap-1 ${connected ? 'text-emerald-600' : 'text-gray-400'}`}>
                {connected ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {connected ? `${stats?.accounts} connected` : 'Not connected'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[11px] text-gray-500">Automation rules</span>
              <span className="text-[10px] font-bold text-gray-700">{totalRules}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-t border-gray-100 pt-2">
              <span className="text-[11px] text-gray-500">Total rule fires</span>
              <span className="text-[10px] font-bold text-gray-700">
                {fmt(autoReplies + commentTriggered + storyTriggered)}
              </span>
            </div>
          </div>
          <Link to="/instagram/settings" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 hover:underline">
            Manage connection <ChevronRight className="w-3 h-3" />
          </Link>
        </GlassCard>

        {[
          { to: '/instagram/dm-automation', label: 'DM Automation', desc: 'Auto-reply to DMs with keywords', icon: MessageCircle, stat: `${dmRulesCount} rules` },
          { to: '/instagram/comments', label: 'Comment Automation', desc: 'Turn comments into DM conversations', icon: MessageSquare, stat: `${commentRulesCount} rules` },
          { to: '/instagram/content', label: 'Posts & Stories', desc: 'Target specific posts with automations', icon: Grid, stat: 'Explore' },
        ].map((c) => (
          <Link key={c.to} to={c.to}>
            <GlassCard className="hover:border-gray-300 transition-all hover:-translate-y-0.5 h-full">
              <div className={`w-10 h-10 rounded-xl ${T.softBg} border ${T.softBorder} flex items-center justify-center mb-3`}>
                <c.icon className={`w-5 h-5 ${T.iconText}`} />
              </div>
              <div className="text-sm font-bold text-gray-900">{c.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
              <div className="mt-3">
                <span className={`text-[10px] font-bold ${T.pill} px-2 py-0.5 rounded-full`}>{c.stat}</span>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
};

/** Grouped inbound/outbound bar chart, shared by both channel dashboards. */
export const ChannelChart: React.FC<{ data: any[]; accent: string }> = ({ data, accent }) => {
  const maxVal = Math.max(1, ...data.flatMap((d) => [d.inbound, d.outbound]));

  return (
    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
      {[0, 50, 100, 150].map((y) => (
        <line key={y} x1="35" y1={y + 10} x2="495" y2={y + 10} stroke="rgba(0,0,0,0.04)" strokeWidth="1" strokeDasharray="4 4" />
      ))}

      {data.map((d, idx) => {
        const N = data.length;
        const step = 440 / N;
        const startX = 40 + idx * step;
        const barWidth = Math.max(2, Math.min(12, step / 4));
        const gap = barWidth * 0.3;
        const heightRatio = 160 / maxVal;

        return (
          <g key={idx}>
            <rect
              x={startX}
              y={175 - d.inbound * heightRatio}
              width={barWidth}
              height={Math.max(1, d.inbound * heightRatio)}
              fill={accent}
              rx={barWidth / 3}
              opacity={0.85}
            >
              <title>{d.label}: {d.inbound} inbound</title>
            </rect>
            <rect
              x={startX + barWidth + gap}
              y={175 - d.outbound * heightRatio}
              width={barWidth}
              height={Math.max(1, d.outbound * heightRatio)}
              fill="#10b981"
              rx={barWidth / 3}
              opacity={0.85}
            >
              <title>{d.label}: {d.outbound} outbound</title>
            </rect>
            {(N <= 10 || idx % Math.ceil(N / 7) === 0) && (
              <text x={startX + barWidth + gap / 2} y="195" className="text-[9px] font-mono fill-gray-400 font-bold" textAnchor="middle">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default InstagramDashboard;
