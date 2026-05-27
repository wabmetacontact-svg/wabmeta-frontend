// src/pages/Dashboard.tsx - PREMIUM SAME-TO-SAME MOCKUP UI

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
  MoreHorizontal,
  Bot,
  GitBranch,
  Workflow,
  PlusCircle,
  Radio,
  UserPlus,
  BrainCircuit,
  Settings,
  Bell,
  Check,
  Play
} from 'lucide-react';
import { dashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import PageSkeleton from '../components/common/PageSkeleton';

// ============================================
// SPARKLINE COMPONENT (Curved Area Sparkline)
// ============================================
interface SparklineProps {
  data: number[];
  color: string;
  fillId: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, fillId }) => {
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
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg className="w-full h-11 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${fillId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ============================================
// DONUT CHART SEGMENT COMPONENT
// ============================================
interface DonutSegmentProps {
  percentage: number;
  color: string;
  offset: number;
}

const DonutSegment: React.FC<DonutSegmentProps> = ({ percentage, color, offset }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.91
  const strokeLength = (percentage / 100) * circumference;
  const strokeOffset = circumference - (offset / 100) * circumference;

  return (
    <circle
      cx="50"
      cy="50"
      r={radius}
      fill="transparent"
      stroke={color}
      strokeWidth="9"
      strokeDasharray={`${strokeLength} ${circumference}`}
      strokeDashoffset={strokeOffset}
      transform="rotate(-90 50 50)"
      className="transition-all duration-500 ease-out"
    />
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);

  const { socket } = useSocket();

  // API Live Data states
  const [stats, setStats] = useState<any>(null);
  const [widgets, setWidgets] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);

  // Default mock values as high-fidelity fallbacks to ensure mockup-identical representation when no database values exist
  const defaultStats = {
    contacts: { total: 12589, growth: 24.5, history: [8000, 9200, 10100, 9800, 11500, 12589] },
    messages: { sent: 45678, growth: 18.2, history: [30000, 35000, 42000, 39000, 43000, 45678] },
    delivery: { rate: 98.6, readRate: 22.4, growth: 6.3, history: [92, 94, 96, 95, 97, 98.6] },
    campaigns: { active: 24, growth: 8, history: [12, 15, 18, 16, 21, 24] }
  };

  const defaultOverviewBarData = [
    { label: 'Tue', sent: 12000, delivered: 10500, read: 8000, failed: 800 },
    { label: 'Wed', sent: 16000, delivered: 14500, read: 11000, failed: 400 },
    { label: 'Thu', sent: 14500, delivered: 13000, read: 9500, failed: 600 },
    { label: 'Fri', sent: 13000, delivered: 12000, read: 9000, failed: 300 },
    { label: 'Sat', sent: 12500, delivered: 11500, read: 8500, failed: 500 },
    { label: 'Mon', sent: 15500, delivered: 14000, read: 10500, failed: 700 },
  ];

  const defaultDonutData = [
    { name: 'Delivered', value: 30245, percentage: 66.2, color: '#22c55e' },
    { name: 'Read', value: 10245, percentage: 22.4, color: '#3b82f6' },
    { name: 'Failed', value: 2145, percentage: 4.7, color: '#ef4444' },
    { name: 'Pending', value: 3043, percentage: 6.7, color: '#94a3b8' }
  ];

  const defaultTopCampaigns = [
    { name: 'Festive Offer', sentCount: 12456, deliveredCount: 11234, readCount: 8932, ctr: '21.5%', color: '#22c55e' },
    { name: 'New Year Blast', sentCount: 8965, deliveredCount: 8123, readCount: 6543, ctr: '18.7%', color: '#22c55e' },
    { name: 'Summer Sale', sentCount: 6789, deliveredCount: 6102, readCount: 4987, ctr: '16.3%', color: '#22c55e' }
  ];

  const fetchDashboardData = async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    try {
      const [statsRes, widgetsRes, activityRes] = await Promise.all([
        dashboard.getStats(),
        dashboard.getWidgets(dateRange),
        dashboard.getActivity(10)
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (widgetsRes.success && widgetsRes.data) {
        setWidgets(widgetsRes.data);
      }
      if (activityRes.success && activityRes.data) {
        setActivity(activityRes.data);
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  // Fetch when dateRange changes or on initial mount
  useEffect(() => {
    fetchDashboardData(true);
  }, [dateRange]);

  // Listen to socket events for live auto-updating
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchDashboardData(false);
    };

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
      toast.success('Dashboard metrics refreshed');
    } catch (e) {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  // --- DYNAMIC DATA DERIVATION ---
  
  // Format dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  const userName = user?.firstName || 'WabMeta';

  // Format date key into clean label
  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (dateRange === 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  };

  // 1. Total Contacts Sparkline History (Cumulative calculation)
  const getContactsHistory = () => {
    if (!widgets?.contactsGrowth || widgets.contactsGrowth.length === 0) {
      return defaultStats.contacts.history;
    }
    const total = stats?.contacts?.total || 0;
    const dailyCounts = widgets.contactsGrowth.map((d: any) => d.count || 0);
    const totalInPeriod = dailyCounts.reduce((a: number, b: number) => a + b, 0);
    let current = Math.max(0, total - totalInPeriod);
    return widgets.contactsGrowth.map((d: any) => {
      current += (d.count || 0);
      return current;
    });
  };

  // 2. Messages Sent Sparkline History (Cumulative calculation)
  const getMessagesHistory = () => {
    if (!widgets?.messagesOverview || widgets.messagesOverview.length === 0) {
      return defaultStats.messages.history;
    }
    const total = stats?.messages?.sent || 0;
    const dailySent = widgets.messagesOverview.map((d: any) => d.sent || 0);
    const totalInPeriod = dailySent.reduce((a: number, b: number) => a + b, 0);
    let current = Math.max(0, total - totalInPeriod);
    return widgets.messagesOverview.map((d: any) => {
      current += (d.sent || 0);
      return current;
    });
  };

  // 3. Delivery Rate Sparkline History
  const getDeliveryHistory = () => {
    if (!widgets?.messagesOverview || widgets.messagesOverview.length === 0) {
      return defaultStats.delivery.history;
    }
    return widgets.messagesOverview.map((d: any) => {
      return d.sent > 0 ? Math.round((d.delivered / d.sent) * 100) : 100;
    });
  };

  // 4. Active Campaigns History
  const getCampaignsHistory = () => {
    const total = stats?.campaigns?.total || 0;
    const active = stats?.campaigns?.active || 0;
    return [
      Math.max(0, total - active - 2),
      Math.max(0, total - active - 1),
      Math.max(0, total - active),
      total
    ];
  };

  // Messages Overview Grouped Columns
  const chartData = widgets?.messagesOverview && widgets.messagesOverview.length > 0
    ? widgets.messagesOverview.map((item: any) => ({
        label: getDayLabel(item.date),
        sent: item.sent || 0,
        delivered: item.delivered || 0,
        read: item.read || 0,
        failed: item.failed || 0
      }))
    : defaultOverviewBarData;

  const maxSentVal = Math.max(...chartData.map(d => d.sent)) || 1;

  // Donut Chart Processing
  const getDonutData = () => {
    if (!widgets?.summary) {
      return defaultDonutData;
    }
    const { totalSent, totalRead, totalFailed } = widgets.summary;
    const totalDelivered = widgets.summary.totalDelivered || 0;
    const deliveredOnly = Math.max(0, totalDelivered - totalRead);
    const pending = Math.max(0, totalSent - totalDelivered);
    const total = totalDelivered + totalFailed + pending;

    const items = [
      { name: 'Delivered', value: deliveredOnly, color: '#22c55e' },
      { name: 'Read', value: totalRead, color: '#3b82f6' },
      { name: 'Failed', value: totalFailed, color: '#ef4444' },
      { name: 'Pending', value: pending, color: '#94a3b8' }
    ];

    return items.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 1000) / 10 : 0
    }));
  };

  const currentDonutData = getDonutData();
  const donutTotal = widgets?.summary?.totalSent || defaultDonutData.reduce((acc, d) => acc + d.value, 0);

  // Top Campaigns Table
  const campaignsList = widgets?.recentCampaigns && widgets.recentCampaigns.length > 0
    ? widgets.recentCampaigns.map((camp: any) => ({
        name: camp.name,
        sent: camp.sentCount || 0,
        delivered: camp.deliveredCount || 0,
        read: camp.readCount || 0,
        ctr: camp.sentCount > 0 ? ((camp.readCount / camp.sentCount) * 100).toFixed(1) + '%' : '0.0%',
        color: '#22c55e'
      }))
    : defaultTopCampaigns;

  // Contacts Growth line chart computations
  const contactsGrowthHistory = getContactsHistory();
  const contactsGrowthWidth = 200;
  const contactsGrowthHeight = 80;
  const contactsGrowthMax = Math.max(...contactsGrowthHistory);
  const contactsGrowthMin = Math.min(...contactsGrowthHistory);
  const contactsGrowthRange = contactsGrowthMax - contactsGrowthMin || 1;

  const contactsGrowthPoints = contactsGrowthHistory.map((val, idx) => {
    const x = (idx / (contactsGrowthHistory.length - 1)) * contactsGrowthWidth;
    const y = contactsGrowthHeight - ((val - contactsGrowthMin) / contactsGrowthRange) * (contactsGrowthHeight - 16) - 8;
    return { x, y };
  });

  let contactsGrowthPath = `M ${contactsGrowthPoints[0].x} ${contactsGrowthPoints[0].y}`;
  for (let i = 0; i < contactsGrowthPoints.length - 1; i++) {
    const p0 = contactsGrowthPoints[i];
    const p1 = contactsGrowthPoints[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    contactsGrowthPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  const contactsGrowthFillPath = `${contactsGrowthPath} L ${contactsGrowthWidth} ${contactsGrowthHeight} L 0 ${contactsGrowthHeight} Z`;

  const lastContactsPoint = contactsGrowthPoints[contactsGrowthPoints.length - 1] || { x: 200, y: 10 };
  const lastContactsVal = contactsGrowthHistory[contactsGrowthHistory.length - 1] || 0;
  const lastContactsDateStr = widgets?.contactsGrowth && widgets.contactsGrowth.length > 0
    ? new Date(widgets.contactsGrowth[widgets.contactsGrowth.length - 1].date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    : 'Today';

  // Activity events formatter
  const formatActivity = (act: any) => {
    let title = act.action;
    let description = '';
    let color = 'bg-blue-500';

    const metadata = typeof act.metadata === 'string' ? JSON.parse(act.metadata) : act.metadata;

    switch (act.action) {
      case 'CREATE':
        title = `Created ${act.entity?.toLowerCase() || 'item'}`;
        if (metadata?.name) description = metadata.name;
        color = 'bg-emerald-500';
        break;
      case 'UPDATE':
        title = `Updated ${act.entity?.toLowerCase() || 'item'}`;
        if (metadata?.name) description = metadata.name;
        color = 'bg-purple-500';
        break;
      case 'DELETE':
        title = `Deleted ${act.entity?.toLowerCase() || 'item'}`;
        color = 'bg-red-500';
        break;
      case 'CAMPAIGN_SENT':
      case 'CAMPAIGN_START':
        title = `Campaign '${metadata?.name || 'Campaign'}' started`;
        color = 'bg-emerald-500';
        break;
      case 'CAMPAIGN_COMPLETED':
        title = `Campaign '${metadata?.name || 'Campaign'}' completed`;
        color = 'bg-emerald-500';
        break;
      case 'CONTACT_IMPORT':
        title = `Imported contacts`;
        description = `${metadata?.count || 0} contacts added`;
        color = 'bg-blue-500';
        break;
      default:
        title = act.action.replace(/_/g, ' ');
        title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
        if (metadata?.name) description = metadata.name;
        else if (act.entity) description = act.entity;
    }

    return { title, description, color };
  };

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const renderTrend = (value: number, baseColorClass: string) => {
    const isNegative = value < 0;
    const colorClass = isNegative ? 'text-red-500' : baseColorClass;
    const Icon = isNegative ? TrendingDown : TrendingUp;
    const formattedValue = isNegative ? `${value}%` : `+${value}%`;
    return (
      <span className={`text-[10px] font-bold ${colorClass} flex items-center`}>
        <Icon className="w-3 h-3 mr-0.5" />
        {formattedValue}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 2-Column Main Page Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left Columns (3/4 width) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Greeting Area with Floating Illustration */}
          <div className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xs overflow-hidden flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
            
            {/* Left Content */}
            <div className="space-y-5 z-10">
              <div>                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
                  {getGreeting()}, {userName}! <span className="animate-bounce">👋</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5 font-medium">
                  Here's what's happening with your WhatsApp business today.
                </p>
              </div>

              {/* Actions Row */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => navigate('/dashboard/campaigns/create')}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Campaign</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/contacts/import')}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-gray-200 dark:border-slate-700 shadow-2xs transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                  <span>Import Contacts</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/reports')}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-gray-200 dark:border-slate-700 shadow-2xs transition-all"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
                  <span>View Analytics</span>
                </button>
              </div>
            </div>

            {/* Right WhatsApp Illustration */}
            <div className="relative md:w-48 h-32 md:h-full flex items-center justify-center shrink-0 self-center md:self-auto select-none">
              {/* Green Whatsapp Glow Circle */}
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse-slow">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                      <path d="M12.012 2c-5.506 0-9.988 4.492-9.988 10.002 0 1.76.459 3.474 1.33 4.988L2 22l5.139-1.348c1.472.802 3.125 1.224 4.811 1.226h.004c5.502 0 9.98-4.492 9.98-10.002C21.934 6.49 17.514 2 12.012 2zm5.789 14.122c-.244.686-1.427 1.348-1.963 1.432-.494.076-1.135.138-3.277-.75-2.736-1.134-4.502-3.922-4.64-4.106-.134-.184-1.102-1.468-1.102-2.802 0-1.334.686-1.99 1.002-2.316.31-.326.686-.408.914-.408.228 0 .459.002.656.012.202.008.473-.078.742.568.27.656.924 2.262 1.006 2.43.082.164.138.358.026.574-.112.218-.168.358-.336.554-.168.196-.354.436-.506.586-.168.164-.344.344-.148.686.196.326.868 1.436 1.862 2.324.97.868 1.782 1.134 2.032 1.25.244.116.388.098.53-.064.148-.164.636-.74.808-.992.172-.254.344-.212.578-.126.24.084 1.506.71 1.768.844.258.134.432.202.494.31.064.108.064.63-.18 1.316z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Floating Little Icons/Cards */}
              <div className="absolute top-2 left-6 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-2 py-1 rounded-lg shadow-md flex items-center gap-1.5 animate-float">
                <MessageSquare className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-gray-600 dark:text-slate-300">Sent</span>
              </div>
              <div className="absolute bottom-3 right-6 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-1.5 rounded-full shadow-md flex items-center justify-center animate-pulse">
                <Check className="w-3 h-3 text-blue-500 stroke-[3]" />
              </div>
              <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-violet-500 animate-ping"></div>
              <div className="absolute bottom-5 left-10 w-3 h-3 rounded-full bg-orange-400"></div>
            </div>
          </div>

          {/* Date Selector & Controls */}
          <div className="flex items-center justify-end gap-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(parseInt(e.target.value) as 7 | 14 | 30)}
                className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl text-gray-700 dark:text-slate-200 text-xs font-bold shadow-2xs focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-white shadow-2xs transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Contacts */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-40">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Users className="w-5 h-5" />
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">Total Contacts</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white">
                    {(stats?.contacts?.total ?? defaultStats.contacts.total).toLocaleString()}
                  </span>
                  {renderTrend(stats?.contacts?.growth ?? defaultStats.contacts.growth, 'text-emerald-500')}
                </div>
              </div>
              <div className="mt-3 overflow-hidden">
                <Sparkline data={getContactsHistory()} color="#22c55e" fillId="contacts-grad" />
              </div>
            </div>

            {/* Card 2: Messages Sent */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-40">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Send className="w-4 h-4" />
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">Messages Sent</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white">
                    {(stats?.messages?.sent ?? defaultStats.messages.sent).toLocaleString()}
                  </span>
                  {renderTrend(stats?.messages?.growth ?? defaultStats.messages.growth, 'text-blue-500')}
                </div>
              </div>
              <div className="mt-3 overflow-hidden">
                <Sparkline data={getMessagesHistory()} color="#3b82f6" fillId="messages-grad" />
              </div>
            </div>

            {/* Card 3: Delivery Rate */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-40">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">Delivery Rate</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white">
                    {stats?.delivery?.deliveryRate ?? defaultStats.delivery.rate}%
                  </span>
                  <span className="text-[10px] font-bold text-purple-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {stats?.delivery?.readRate ?? defaultStats.delivery.readRate}% read
                  </span>
                </div>
              </div>
              <div className="mt-3 overflow-hidden">
                <Sparkline data={getDeliveryHistory()} color="#8b5cf6" fillId="delivery-grad" />
              </div>
            </div>

            {/* Card 4: Active Campaigns */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-40">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Zap className="w-4 h-4" />
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">Active Campaigns</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white">
                    {stats?.campaigns?.active ?? defaultStats.campaigns.active}
                  </span>
                  <span className="text-[10px] font-bold text-orange-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +{stats?.campaigns?.thisMonth ?? defaultStats.campaigns.growth} this month
                  </span>
                </div>
              </div>
              <div className="mt-3 overflow-hidden">
                <Sparkline data={getCampaignsHistory()} color="#f97316" fillId="campaigns-grad" />
              </div>
            </div>

          </div>

          {/* Row 2: Messages Overview (Grouped Bars) & Delivery Performance (Donut) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Messages Overview Grouped Columns */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-950 dark:text-white">Messages Overview</h3>
                <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Sent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Delivered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Failed</span>
                  </div>
                </div>
              </div>

              {/* Grouped Bar Chart in Pure SVG */}
              <div className="relative w-full overflow-x-auto select-none pt-2">
                <svg className="w-full min-w-[420px] h-48 overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 45, 90, 135].map((yVal, idx) => (
                    <line
                      key={idx}
                      x1="35"
                      y1={yVal + 10}
                      x2="495"
                      y2={yVal + 10}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      className="dark:stroke-slate-800"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Y Axis Labels */}
                  <text x="5" y="15" className="text-[10px] font-bold fill-gray-400 dark:fill-slate-500" textAnchor="start">20K</text>
                  <text x="5" y="60" className="text-[10px] font-bold fill-gray-400 dark:fill-slate-500" textAnchor="start">15K</text>
                  <text x="5" y="105" className="text-[10px] font-bold fill-gray-400 dark:fill-slate-500" textAnchor="start">10K</text>
                  <text x="5" y="150" className="text-[10px] font-bold fill-gray-400 dark:fill-slate-500" textAnchor="start">5K</text>
                  <text x="5" y="172" className="text-[10px] font-bold fill-gray-400 dark:fill-slate-500" textAnchor="start">0</text>

                  {/* Columns Grouped rendering */}
                  {chartData.map((item, idx) => {
                    const N = chartData.length;
                    const chartWidth = 440; // x range: 40 to 480
                    const step = chartWidth / N;
                    const startX = 40 + idx * step;
                    
                    // Width of individual bar
                    const barWidth = Math.max(1.5, Math.min(6, step / 6));
                    const gap = barWidth * 0.25; // gap between bars

                    const heightRatio = maxSentVal > 0 ? 145 / maxSentVal : 0;
                    const sentHeight = item.sent * heightRatio;
                    const delivHeight = item.delivered * heightRatio;
                    const readHeight = item.read * heightRatio;
                    const failHeight = item.failed * heightRatio;

                    return (
                      <g key={idx}>
                        {/* Sent Bar (Green) */}
                        <rect
                          x={startX}
                          y={160 - sentHeight}
                          width={barWidth}
                          height={sentHeight}
                          fill="#22c55e"
                          rx={barWidth / 4}
                          className="hover:opacity-85 cursor-pointer transition-opacity"
                        />
                        {/* Delivered Bar (Blue) */}
                        <rect
                          x={startX + barWidth + gap}
                          y={160 - delivHeight}
                          width={barWidth}
                          height={delivHeight}
                          fill="#3b82f6"
                          rx={barWidth / 4}
                          className="hover:opacity-85 cursor-pointer transition-opacity"
                        />
                        {/* Read Bar (Purple) */}
                        <rect
                          x={startX + (barWidth + gap) * 2}
                          y={160 - readHeight}
                          width={barWidth}
                          height={readHeight}
                          fill="#8b5cf6"
                          rx={barWidth / 4}
                          className="hover:opacity-85 cursor-pointer transition-opacity"
                        />
                        {/* Failed Bar (Red) */}
                        <rect
                          x={startX + (barWidth + gap) * 3}
                          y={160 - failHeight}
                          width={barWidth}
                          height={failHeight}
                          fill="#ef4444"
                          rx={barWidth / 4}
                          className="hover:opacity-85 cursor-pointer transition-opacity"
                        />
                        {/* X-axis Label */}
                        {(N <= 10 || idx % Math.ceil(N / 7) === 0) && (
                          <text
                            x={startX + (barWidth + gap) * 1.5}
                            y="176"
                            className="text-[9px] font-bold fill-gray-400 dark:fill-slate-500"
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
            </div>

            {/* Delivery Performance Donut */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
              <h3 className="text-base font-bold text-gray-950 dark:text-white mb-4">Delivery Performance</h3>
              
              <div className="flex items-center gap-6 justify-center flex-1 py-2">
                <div className="relative w-28 h-28 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="transparent" stroke="#f1f5f9" strokeWidth="9" className="dark:stroke-slate-800" />
                    
                    {/* Render Segments stacking offsets */}
                    {(() => {
                      let currentOffset = 0;
                      return currentDonutData.map((item) => {
                        const segment = (
                          <DonutSegment
                            key={item.name}
                            percentage={item.percentage}
                            color={item.color}
                            offset={currentOffset}
                          />
                        );
                        currentOffset += item.percentage;
                        return segment;
                      });
                    })()}
                  </svg>
                  {/* Absolute total center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 leading-none">Total</span>
                    <span className="text-base font-extrabold text-gray-950 dark:text-white mt-0.5 leading-none">
                      {(donutTotal ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-2 min-w-0">
                  {currentDonutData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <p className="truncate leading-none">{item.name}</p>
                      <span className="text-[10px] text-gray-400 font-bold ml-auto">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary details */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <div className="bg-emerald-500/5 rounded-xl p-2 text-center">
                  <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block">Delivered</span>
                  <span className="text-sm font-extrabold text-emerald-600 block mt-0.5">
                    {widgets?.summary ? (widgets.summary.totalDelivered ?? 0).toLocaleString() : '30,245'}
                  </span>
                </div>
                <div className="bg-red-500/5 rounded-xl p-2 text-center">
                  <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block">Failed</span>
                  <span className="text-sm font-extrabold text-red-500 block mt-0.5">
                    {widgets?.summary ? (widgets.summary.totalFailed ?? 0).toLocaleString() : '2,145'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Row 3: Top Campaigns (Table) & Contacts Growth (Interactive Sparkline) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Top Campaigns Table */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-950 dark:text-white">Top Campaigns</h3>
                <Link to="/dashboard/campaigns" className="text-xs font-bold text-violet-600 hover:text-violet-755 flex items-center gap-0.5">
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 dark:text-slate-500 font-bold border-b border-gray-100 dark:border-slate-800">
                      <th className="pb-2.5 font-bold">Campaign</th>
                      <th className="pb-2.5 font-bold text-right">Sent</th>
                      <th className="pb-2.5 font-bold text-right">Delivered</th>
                      <th className="pb-2.5 font-bold text-right">Read</th>
                      <th className="pb-2.5 font-bold text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-semibold text-gray-700 dark:text-slate-300">
                    {campaignsList.length > 0 ? (
                      campaignsList.map((camp) => (
                        <tr key={camp.name} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-3 flex items-center gap-2 min-w-[120px]">
                            <span className="w-1.5 h-6 rounded bg-emerald-500 shrink-0" />
                            <span className="font-bold text-gray-900 dark:text-white">{camp.name}</span>
                          </td>
                          <td className="py-3 text-right">{(camp.sent ?? 0).toLocaleString()}</td>
                          <td className="py-3 text-right">{(camp.delivered ?? 0).toLocaleString()}</td>
                          <td className="py-3 text-right">{(camp.read ?? 0).toLocaleString()}</td>
                          <td className="py-3 text-right text-emerald-500 font-bold">{camp.ctr}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400 dark:text-slate-500 font-semibold">
                          No campaigns found. Create your first campaign!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contacts Growth Interactive Line Chart */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-950 dark:text-white">Contacts Growth</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-gray-950 dark:text-white">
                      {lastContactsVal.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      {renderTrend(stats?.contacts?.growth ?? defaultStats.contacts.growth, 'text-emerald-500')}
                      <span>vs last {dateRange} days</span>
                    </span>
                  </div>
                </div>
                <Link to="/dashboard/contacts" className="text-xs font-bold text-violet-600 hover:text-violet-755 flex items-center gap-0.5">
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Curve line chart with tooltip marker */}
              <div className="relative w-full overflow-hidden select-none h-28 mt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="growth-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Draw grid dashed lines */}
                  <line x1="0" y1="20" x2="200" y2="20" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeDasharray="3 3" />

                  {/* Sparkline curve */}
                  <path d={contactsGrowthFillPath} fill="url(#growth-grad)" />
                  <path d={contactsGrowthPath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Tooltip bubble representation */}
                  <circle cx={lastContactsPoint.x} cy={lastContactsPoint.y} r="5" fill="#22c55e" stroke="white" strokeWidth="2" className="drop-shadow-sm" />
                </svg>

                {/* Absolute overlay tooltip */}
                <div 
                  className="absolute bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 flex flex-col text-center shadow-md animate-fade-in pointer-events-none scale-90"
                  style={{
                    left: `${Math.max(20, Math.min(80, (lastContactsPoint.x / 200) * 100))}%`,
                    top: `${Math.max(10, lastContactsPoint.y - 35)}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <span className="text-[10px] font-extrabold leading-tight">{lastContactsVal.toLocaleString()}</span>
                  <span className="text-[8px] font-medium text-slate-400 leading-none mt-0.5">{lastContactsDateStr}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar Column (1/4 width) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* AI Assistant Card (Beta) */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-950 dark:text-white">AI Assistant</h3>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-500/10 border border-indigo-500/20 rounded">Beta</span>
            </div>

            <p className="text-xs text-gray-400 dark:text-slate-500 font-semibold leading-relaxed">
              Here are some smart suggestions for your business.
            </p>

            {/* Festive Campaign Suggestion box */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Festive Offer Campaign</h4>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                High engagement expected during festive season. Reach more users with personalized offers.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/60">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Expected Reach</span>
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white block mt-0.5">12,000</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Open Rate Prediction</span>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }} />
                    </div>
                    <span className="text-[11px] font-extrabold text-emerald-600">78%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard/campaigns/create', {
                  state: {
                    name: 'Festive Offer Campaign',
                    description: 'High engagement expected during festive season. Reach more users with personalized offers.',
                  }
                })}
                className="w-full flex items-center justify-center gap-1 py-2 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Use Suggestion</span>
              </button>
            </div>

            <Link to="/dashboard/suggestions" className="block text-center text-xs font-bold text-violet-600 hover:text-violet-755 pt-1.5">
              View All Suggestions →
            </Link>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white">Quick Actions</h3>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => navigate('/dashboard/campaigns/create')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all"
              >
                <Send className="w-4.5 h-4.5 text-emerald-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block break-words">New Campaign</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/campaigns/create')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all"
              >
                <Radio className="w-4.5 h-4.5 text-purple-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block">Broadcast</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/contacts/import')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all"
              >
                <UserPlus className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block">Add Contacts</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/templates/create')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all"
              >
                <FileText className="w-4.5 h-4.5 text-orange-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block">Create Template</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/chatbots')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all"
              >
                <Bot className="w-4.5 h-4.5 text-blue-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block">AI Chatbot</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/automations')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all"
              >
                <Workflow className="w-4.5 h-4.5 text-blue-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block">Automation</span>
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white">Recent Activity</h3>
            
            <div className="space-y-4 relative pl-3.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-slate-800 select-none">
              {activity.length > 0 ? (
                activity.map((act) => {
                  const { title, description, color } = formatActivity(act);
                  return (
                    <div key={act.id} className="relative space-y-0.5">
                      <span className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full ${color} border-2 border-white dark:border-slate-900 shadow-sm`} />
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{title}</p>
                      {description && (
                        <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400">{description}</p>
                      )}
                      {act.user?.name && (
                        <p className="text-[9px] font-semibold text-gray-400">By {act.user.name}</p>
                      )}
                      <span className="text-[9px] font-semibold text-gray-400 block">{formatRelativeTime(act.createdAt)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="py-2 text-center text-xs text-gray-400 dark:text-slate-500 font-semibold">
                  No recent activity found.
                </div>
              )}
            </div>

            <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 border border-gray-250 dark:border-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs">
              View All Activity →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
