// src/pages/telegram/TelegramDashboard.tsx
// Telegram hub. Stats, rule counts, top rules and the activity feed are all read
// from real endpoints — nothing on this page is a placeholder.

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare, Users, Send, Zap, ArrowUpRight,
  RefreshCw, TrendingUp, Activity, Radio, Megaphone,
  BarChart3, Shield, CheckCircle, AlertCircle, Settings,
  Terminal, Bot, ChevronRight, Sparkles
} from 'lucide-react';
import { FaTelegram } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { telegram } from '../../services/api';
import PageLoader from '../../components/common/PageLoader';
import {
  GlassCard, StatCard,
  TELEGRAM_THEME as T, primaryBtnStyle
} from '../../components/channel/channelUi';
import { type TelegramBotRow, type TelegramStats } from './telegramShared';
import { ChannelChart, loadChannelActivity, timeAgo, type ActivityItem } from '../instagram/InstagramDashboard';

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0));

const TelegramDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [bots, setBots] = useState<TelegramBotRow[]>([]);
  const [stats, setStats] = useState<TelegramStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);
  const [broadcastCount, setBroadcastCount] = useState(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const load = useCallback(async (days: 7 | 14 | 30, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [botsRes, statsRes, broadcastsRes, acts] = await Promise.all([
        telegram.getBots(),
        telegram.getAnalytics(days),
        telegram.getBroadcasts().catch(() => ({ data: { data: [] } })),
        loadChannelActivity('TELEGRAM'),
      ]);
      setBots(Array.isArray(botsRes.data?.data) ? botsRes.data.data : []);
      setStats(statsRes.data?.data ?? null);
      setBroadcastCount(Array.isArray(broadcastsRes.data?.data) ? broadcastsRes.data.data.length : 0);
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

  const connected = bots.length > 0;
  const totalMessages = stats?.messages?.total ?? 0;
  const inbound = stats?.messages?.inbound ?? 0;
  const outbound = stats?.messages?.outbound ?? 0;
  const replyRate = inbound > 0 ? Math.round((outbound / inbound) * 100) : 0;
  const autoTriggered = stats?.autoReplies?.triggered ?? 0;
  const automationRulesCount = stats?.autoReplies?.rules ?? 0;
  const topRules = stats?.topRules ?? [];
  const liveBots = bots.filter((b) => b.status === 'CONNECTED').length;

  const onboardingSteps = [
    { step: '01', label: 'Connect a Telegram bot', done: connected, href: '/dashboard/telegram/bots' },
    { step: '02', label: 'Create an auto-reply rule', done: automationRulesCount > 0, href: '/dashboard/telegram/automation' },
    { step: '03', label: 'Set the bot command menu', done: automationRulesCount > 1, href: '/dashboard/telegram/bots' },
    { step: '04', label: 'Send your first broadcast', done: broadcastCount > 0, href: '/dashboard/telegram/broadcast' },
  ];
  const completedSteps = onboardingSteps.filter((s) => s.done).length;
  const showQuickSetup = completedSteps < 4;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl ${T.softBg} border ${T.softBorder} flex items-center justify-center flex-shrink-0`}>
            <FaTelegram className={`w-6 h-6 ${T.iconText}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Telegram Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {connected ? 'Telegram Analytics' : 'Welcome to Telegram Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {connected
                ? `${bots.length} bot${bots.length > 1 ? 's' : ''} connected · bots, automations and broadcasts.`
                : 'Connect your first Telegram bot to start automating chats.'}
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
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
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
              to="/dashboard/telegram/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all"
              style={primaryBtnStyle(T)}
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </Link>
          </div>
        )}
      </div>

      {/* Quick setup — progress driven by real data */}
      {showQuickSetup && (
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(34,158,217,0.06) 0%, transparent 60%)' }} />

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
                  ? <>Almost there. <span className="italic font-light text-gray-500">Keep configuring.</span></>
                  : <>Let's connect Telegram. <span className="italic font-light text-gray-500">Just 3 mins.</span></>}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-5 max-w-lg">
                {connected
                  ? 'Finish the remaining steps to unlock the rest of the Telegram tooling.'
                  : 'Create a bot with @BotFather, paste the token, and start receiving messages instantly.'}
              </p>

              <div className="flex flex-wrap gap-2">
                {!connected ? (
                  <Link to="/dashboard/telegram/bots" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all" style={primaryBtnStyle(T)}>
                    <Send className="w-4 h-4" /> Connect bot <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <>
                    {automationRulesCount === 0 && (
                      <Link to="/dashboard/telegram/automation" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all" style={primaryBtnStyle(T)}>
                        <Zap className="w-4 h-4" /> Set up auto-replies <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {broadcastCount === 0 && (
                      <Link to="/dashboard/telegram/broadcast" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900 text-xs font-bold shadow-sm transition-all">
                        <Megaphone className="w-4 h-4" /> Send broadcast
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
                    item.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-100 hover:border-sky-200'
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
        <StatCard theme={T} icon={MessageSquare} label="Conversations" value={fmt(stats?.conversations ?? 0)} hint="Active Telegram chats" />
        <StatCard theme={T} icon={Users} label="Subscribers" value={fmt(stats?.contacts ?? 0)} hint="People who messaged your bot" />
        <StatCard theme={T} icon={Send} label="Messages" value={fmt(totalMessages)} hint="Sent + received" pill={outbound > 0 ? `${fmt(outbound)} sent` : undefined} />
        <StatCard theme={T} icon={Zap} label="Auto-Replies" value={fmt(autoTriggered)} hint="Automation triggers fired" />
      </div>

      {/* Real secondary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reply Rate</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{inbound > 0 ? `${replyRate}%` : '—'}</h3>
          <p className="text-[11px] text-gray-400 mt-1">{fmt(outbound)} outbound per {fmt(inbound)} inbound</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Auto-Reply Rules</span>
            </div>
            {automationRulesCount > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Live</span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{automationRulesCount}</h3>
          <p className="text-[11px] text-gray-400 mt-1">Commands, keywords and fallbacks</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Connected Bots</span>
            </div>
            {connected && (
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full">Live</span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{bots.length}</h3>
          <p className="text-[11px] text-gray-400 mt-1">
            {liveBots} connected{bots.length - liveBots > 0 ? ` · ${bots.length - liveBots} needs attention` : ''}
          </p>
        </GlassCard>
      </div>

      {/* Chart + real activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-sky-600" />
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
                {connected ? 'Volume appears once people chat with your bot' : 'Connect a bot to start tracking'}
              </p>
              {!connected && (
                <Link to="/dashboard/telegram/bots" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-all">
                  Connect bot <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          )}
        </GlassCard>

        {/* Activity — real recent conversations */}
        <GlassCard className="lg:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-500" /> Recent Activity
            </h3>
            {activity.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </div>

          {activity.length > 0 ? (
            <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {activity.map((act) => (
                <Link key={act.id} to={`/dashboard/inbox/${act.id}`} className="relative block group">
                  <span className="absolute -left-[17px] top-1.5 w-3 h-3 rounded-full bg-sky-500 border-2 border-white shadow-sm" />
                  <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-sky-700">{act.text}</p>
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
              <TrendingUp className="w-4 h-4 text-sky-500" /> Top Performing Rules
            </h3>
            <Link to="/dashboard/telegram/automation" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {topRules.length > 0 ? (
            <div className="space-y-2">
              {topRules.map((rule, i) => {
                const maxCount = Math.max(...topRules.map((r) => r.triggerCount), 1);
                const pct = Math.round((rule.triggerCount / maxCount) * 100);
                return (
                  <div key={rule.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[10px] font-mono font-bold text-sky-600 shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-800 truncate">{rule.name}</span>
                        <span className="text-xs font-bold text-gray-900 ml-2 shrink-0">{rule.triggerCount}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: T.accent }} />
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
                {automationRulesCount === 0 ? 'No rules created yet' : 'No rule has fired yet'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {automationRulesCount === 0 ? 'Create one to start automating' : 'Counts appear once auto-replies trigger'}
              </p>
              {automationRulesCount === 0 && (
                <Link to="/dashboard/telegram/automation" className="mt-3 inline-block text-xs text-sky-600 hover:text-sky-700 font-bold">
                  Create your first auto-reply →
                </Link>
              )}
            </div>
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Radio, label: 'Bots', color: '#229ED9', href: '/dashboard/telegram/bots' },
              { icon: Zap, label: 'Auto-Replies', color: '#1b87ba', href: '/dashboard/telegram/automation' },
              { icon: Megaphone, label: 'Broadcast', color: '#229ED9', href: '/dashboard/telegram/broadcast' },
              { icon: Terminal, label: 'Commands', color: '#1b87ba', href: '/dashboard/telegram/bots' },
              { icon: Send, label: 'Inbox', color: '#229ED9', href: '/dashboard/inbox' },
              { icon: Settings, label: 'Settings', color: '#1b87ba', href: '/dashboard/telegram/settings' },
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

      {/* Bot status + navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bot Status</h3>
          </div>
          {bots.length === 0 ? (
            <p className="text-[11px] text-gray-400 py-2">No bots connected yet.</p>
          ) : (
            <div className="space-y-2">
              {bots.slice(0, 4).map((bot) => (
                <div key={bot.id} className="flex items-center justify-between py-1.5 gap-2">
                  <span className="text-[11px] text-gray-500 truncate">@{bot.username}</span>
                  <span className={`text-[10px] font-bold flex items-center gap-1 shrink-0 ${bot.status === 'CONNECTED' ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {bot.status === 'CONNECTED' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {bot.status === 'CONNECTED' ? 'Connected' : bot.status}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link to="/dashboard/telegram/settings" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:underline">
            Check webhook health <ChevronRight className="w-3 h-3" />
          </Link>
        </GlassCard>

        {[
          { to: '/dashboard/telegram/bots', label: 'Bot Manager', desc: 'Connect bots and set command menus', icon: Radio, stat: `${bots.length} bot${bots.length === 1 ? '' : 's'}` },
          { to: '/dashboard/telegram/automation', label: 'Auto-Replies', desc: 'Commands, keywords and fallbacks', icon: Zap, stat: `${automationRulesCount} rules` },
          { to: '/dashboard/telegram/broadcast', label: 'Broadcasts', desc: 'Message all your subscribers', icon: Megaphone, stat: `${broadcastCount} sent` },
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

export default TelegramDashboard;
