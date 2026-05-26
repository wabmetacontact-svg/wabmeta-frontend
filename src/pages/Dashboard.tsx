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
import { Link } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);

  const { socket, isConnected } = useSocket();

  // Mock values as high-fidelity fallbacks to ensure mockup-identical representation
  const defaultStats = {
    contacts: { total: 12589, change: '+24.5%', history: [8000, 9200, 10100, 9800, 11500, 12589] },
    messages: { sent: 45678, change: '+18.2%', history: [30000, 35000, 42000, 39000, 43000, 45678] },
    delivery: { rate: '98.6%', change: '+6.3%', history: [92, 94, 96, 95, 97, 98.6] },
    campaigns: { active: 24, change: '+8', history: [12, 15, 18, 16, 21, 24] }
  };

  const overviewBarData = [
    { label: 'Tue', sent: 12000, delivered: 10500, read: 8000, failed: 800 },
    { label: 'Wed', sent: 16000, delivered: 14500, read: 11000, failed: 400 },
    { label: 'Thu', sent: 14500, delivered: 13000, read: 9500, failed: 600 },
    { label: 'Fri', sent: 13000, delivered: 12000, read: 9000, failed: 300 },
    { label: 'Sat', sent: 12500, delivered: 11500, read: 8500, failed: 500 },
    { label: 'Mon', sent: 15500, delivered: 14000, read: 10500, failed: 700 },
  ];

  const donutData = [
    { name: 'Delivered', value: 30245, percentage: 66.2, color: '#22c55e' },
    { name: 'Read', value: 10245, percentage: 22.4, color: '#3b82f6' },
    { name: 'Failed', value: 2145, percentage: 4.7, color: '#ef4444' },
    { name: 'Pending', value: 3043, percentage: 6.7, color: '#94a3b8' }
  ];

  const topCampaigns = [
    { name: 'Festive Offer', sent: 12456, delivered: 11234, read: 8932, ctr: '21.5%', color: '#22c55e' },
    { name: 'New Year Blast', sent: 8965, delivered: 8123, read: 6543, ctr: '18.7%', color: '#22c55e' },
    { name: 'Summer Sale', sent: 6789, delivered: 6102, read: 4987, ctr: '16.3%', color: '#22c55e' }
  ];

  const contactsGrowthData = [6000, 7000, 6800, 8500, 9200, 8900, 10500, 11000, 10800, 12589];

  useEffect(() => {
    // Mimic API loading but transition nicely
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Dashboard refreshed');
    }, 600);
  };

  if (loading) {
    return <PageSkeleton />;
  }

  // Calculate grouped bar chart heights (max height is 120px)
  const maxSentVal = Math.max(...overviewBarData.map(d => d.sent));

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
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight flex items-center gap-2">
                  Good Afternoon, WabMeta! <span className="animate-bounce">👋</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1.5 font-medium">
                  Here's what's happening with your WhatsApp business today.
                </p>
              </div>

              {/* Actions Row */}
              <div className="flex flex-wrap gap-2.5">
                <button className="flex items-center gap-1.5 px-4.5 py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs rounded-xl shadow-md transition-all">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Campaign</span>
                </button>
                <button className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-gray-200 dark:border-slate-700 shadow-2xs transition-all">
                  <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                  <span>Import Contacts</span>
                </button>
                <button className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-gray-200 dark:border-slate-700 shadow-2xs transition-all">
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
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white">12,589</span>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    24.5%
                  </span>
                </div>
              </div>
              <div className="mt-3 overflow-hidden">
                <Sparkline data={defaultStats.contacts.history} color="#22c55e" fillId="contacts-grad" />
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
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white">45,678</span>
                  <span className="text-[10px] font-bold text-blue-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    18.2%
                  </span>
                </div>
              </div>
              <div className="mt-3 overflow-hidden">
                <Sparkline data={defaultStats.messages.history} color="#3b82f6" fillId="messages-grad" />
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
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white">98.6%</span>
                  <span className="text-[10px] font-bold text-purple-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    6.3%
                  </span>
                </div>
              </div>
              <div className="mt-3 overflow-hidden">
                <Sparkline data={defaultStats.delivery.history} color="#8b5cf6" fillId="delivery-grad" />
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
                  <span className="text-2xl font-extrabold text-gray-950 dark:text-white">24</span>
                  <span className="text-[10px] font-bold text-orange-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +8
                  </span>
                </div>
              </div>
              <div className="mt-3 overflow-hidden">
                <Sparkline data={defaultStats.campaigns.history} color="#f97316" fillId="campaigns-grad" />
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
                  {overviewBarData.map((item, idx) => {
                    const groupWidth = 65;
                    const startX = 40 + idx * 75;

                    const heightRatio = 145 / maxSentVal;
                    const sentHeight = item.sent * heightRatio;
                    const delivHeight = item.delivered * heightRatio;
                    const readHeight = item.read * heightRatio;
                    const failHeight = item.failed * heightRatio;

                    return (
                      <g key={item.label}>
                        {/* Sent Bar (Green) */}
                        <rect
                          x={startX}
                          y={160 - sentHeight}
                          width="6"
                          height={sentHeight}
                          fill="#22c55e"
                          rx="1.5"
                          className="hover:opacity-85 cursor-pointer transition-opacity"
                        />
                        {/* Delivered Bar (Blue) */}
                        <rect
                          x={startX + 7.5}
                          y={160 - delivHeight}
                          width="6"
                          height={delivHeight}
                          fill="#3b82f6"
                          rx="1.5"
                          className="hover:opacity-85 cursor-pointer transition-opacity"
                        />
                        {/* Read Bar (Purple) */}
                        <rect
                          x={startX + 15}
                          y={160 - readHeight}
                          width="6"
                          height={readHeight}
                          fill="#8b5cf6"
                          rx="1.5"
                          className="hover:opacity-85 cursor-pointer transition-opacity"
                        />
                        {/* Failed Bar (Red) */}
                        <rect
                          x={startX + 22.5}
                          y={160 - failHeight}
                          width="6"
                          height={failHeight}
                          fill="#ef4444"
                          rx="1.5"
                          className="hover:opacity-85 cursor-pointer transition-opacity"
                        />
                        {/* X-axis Label */}
                        <text
                          x={startX + 14}
                          y="176"
                          className="text-[10px] font-bold fill-gray-400 dark:fill-slate-500"
                          textAnchor="middle"
                        >
                          {item.label}
                        </text>
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
                    <DonutSegment percentage={66.2} color="#22c55e" offset={0} />
                    <DonutSegment percentage={22.4} color="#3b82f6" offset={66.2} />
                    <DonutSegment percentage={4.7} color="#ef4444" offset={88.6} />
                    <DonutSegment percentage={6.7} color="#94a3b8" offset={93.3} />
                  </svg>
                  {/* Absolute total center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 leading-none">Total</span>
                    <span className="text-base font-extrabold text-gray-950 dark:text-white mt-0.5 leading-none">45,678</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-2 min-w-0">
                  {donutData.map((item) => (
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
                  <span className="text-sm font-extrabold text-emerald-600 block mt-0.5">30,245</span>
                </div>
                <div className="bg-red-500/5 rounded-xl p-2 text-center">
                  <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase block">Failed</span>
                  <span className="text-sm font-extrabold text-red-500 block mt-0.5">2,145</span>
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
                    {topCampaigns.map((camp) => (
                      <tr key={camp.name} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 flex items-center gap-2 min-w-[120px]">
                          <span className="w-1.5 h-6 rounded bg-emerald-500 shrink-0" />
                          <span className="font-bold text-gray-900 dark:text-white">{camp.name}</span>
                        </td>
                        <td className="py-3 text-right">{camp.sent.toLocaleString()}</td>
                        <td className="py-3 text-right">{camp.delivered.toLocaleString()}</td>
                        <td className="py-3 text-right">{camp.read.toLocaleString()}</td>
                        <td className="py-3 text-right text-emerald-500 font-bold">{camp.ctr}</td>
                      </tr>
                    ))}
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
                    <span className="text-2xl font-extrabold text-gray-950 dark:text-white">12,589</span>
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      24.5% vs last 7 days
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
                  <path d="M 0 70 C 25 72, 40 50, 60 55 C 80 60, 100 30, 120 40 C 140 50, 160 15, 200 10 L 200 80 L 0 80 Z" fill="url(#growth-grad)" />
                  <path d="M 0 70 C 25 72, 40 50, 60 55 C 80 60, 100 30, 120 40 C 140 50, 160 15, 200 10" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Tooltip bubble representation */}
                  <circle cx="120" cy="40" r="5" fill="#22c55e" stroke="white" strokeWidth="2" className="drop-shadow-sm" />
                </svg>

                {/* Absolute overlay tooltip */}
                <div className="absolute top-1 left-24 bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 flex flex-col text-center shadow-md animate-fade-in pointer-events-none scale-90">
                  <span className="text-[10px] font-extrabold leading-tight">1,259</span>
                  <span className="text-[8px] font-medium text-slate-400 leading-none mt-0.5">12 May</span>
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

              <button className="w-full flex items-center justify-center gap-1 py-2 bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs rounded-xl shadow-md transition-all">
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
              <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all">
                <Send className="w-4.5 h-4.5 text-emerald-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block break-words">New Campaign</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all">
                <Radio className="w-4.5 h-4.5 text-purple-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block">Broadcast</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all">
                <UserPlus className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block">Add Contacts</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all">
                <FileText className="w-4.5 h-4.5 text-orange-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block">Create Template</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all">
                <Bot className="w-4.5 h-4.5 text-blue-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block">AI Chatbot</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 dark:bg-slate-850 dark:hover:bg-slate-800/80 border border-gray-100 dark:border-slate-800 gap-1.5 text-center transition-all">
                <Workflow className="w-4.5 h-4.5 text-blue-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-slate-300 block">Automation</span>
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-950 dark:text-white">Recent Activity</h3>
            
            <div className="space-y-4 relative pl-3.5 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-slate-800 select-none">
              
              {/* Event 1 */}
              <div className="relative space-y-0.5">
                <span className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                <p className="text-xs font-bold text-gray-900 dark:text-white">Campaign 'Festive Blast' sent</p>
                <span className="text-[9px] font-semibold text-gray-400 block">2 mins ago</span>
              </div>

              {/* Event 2 */}
              <div className="relative space-y-0.5">
                <span className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                <p className="text-xs font-bold text-gray-900 dark:text-white">New contact added</p>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400">Amit Verma</p>
                <span className="text-[9px] font-semibold text-gray-400 block">10 mins ago</span>
              </div>

              {/* Event 3 */}
              <div className="relative space-y-0.5">
                <span className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                <p className="text-xs font-bold text-gray-900 dark:text-white">Template 'Discount Offer' updated</p>
                <span className="text-[9px] font-semibold text-gray-400 block">15 mins ago</span>
              </div>

              {/* Event 4 */}
              <div className="relative space-y-0.5">
                <span className="absolute -left-5 top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                <p className="text-xs font-bold text-gray-900 dark:text-white">Webhook connected</p>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400">WhatsApp Cloud API</p>
                <span className="text-[9px] font-semibold text-gray-400 block">30 mins ago</span>
              </div>

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