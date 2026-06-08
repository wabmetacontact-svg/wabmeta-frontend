import { Link } from 'react-router-dom';
import {
  ArrowRight, Megaphone, Target, TrendingUp, RefreshCw,
  Search, PenTool, Rocket, BarChart3, ArrowUp, Star,
  Home, Send, LayoutGrid, MonitorPlay, Users, FileBarChart,
  CreditCard, Settings, Plant
} from 'lucide-react';

const MetaAdsService = () => {
  return (
    <section className="relative py-24 bg-gradient-to-br from-blue-50/40 via-white to-green-50/30 overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-blue-200/35 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-green-200/35 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-100/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none bg-white/[0.01]" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          
          {/* ═══════ LEFT: Content ═══════ */}
          <div className="space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <Megaphone size={14} className="text-green-600" />
              <span className="text-green-700 text-sm font-semibold tracking-wider">
                META ADS MARKETING SERVICE
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              We Run Meta Ads That Bring{' '}
              <span className="text-green-500">Real Results</span>{' '}
              For Your Business.
            </h2>

            {/* Subheading */}
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl">
              From strategy to scaling – we create high-performing Meta ad 
              campaigns that drive leads, sales and growth.
            </p>

            {/* Features List */}
            <div className="space-y-5 pt-4">
              {[
                {
                  icon: Target,
                  title: 'Laser Targeting',
                  desc: 'Reach the right audience with precision.',
                },
                {
                  icon: TrendingUp,
                  title: 'Better ROI',
                  desc: 'More leads, lower cost, higher returns.',
                },
                {
                  icon: RefreshCw,
                  title: 'Data Driven Approach',
                  desc: 'Optimize. Test. Scale. Repeat.',
                },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <feature.icon size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-gray-900 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
              >
                Let's Grow Your Business
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {[
                  'from-blue-400 to-blue-600',
                  'from-purple-400 to-purple-600',
                  'from-pink-400 to-pink-600',
                  'from-orange-400 to-orange-600',
                ].map((grad, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} border-2 border-white shadow-sm`} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  Trusted by 100+ Businesses
                </p>
              </div>
            </div>
          </div>

          {/* ═══════ RIGHT: Dashboard Mockup with Floating Elements ═══════ */}
          <div className="relative h-[600px] lg:h-[700px]">
            
            {/* Meta Ads Logo Bubble (Top Left) */}
            <div className="absolute top-0 left-[5%] z-20 animate-float-slow">
              <div className="bg-white border border-gray-200 rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-xl relative">
                <div className="text-3xl font-bold text-blue-600 mb-1">∞</div>
                <span className="text-xs font-semibold text-gray-800">Meta Ads</span>
                {/* Small green icon */}
                <div className="absolute -bottom-2 right-0 w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Megaphone size={16} className="text-white" />
                </div>
              </div>
              
              {/* Dotted connecting line */}
              <svg className="absolute top-16 -right-20 w-24 h-16 pointer-events-none" viewBox="0 0 100 60">
                <path 
                  d="M 0 10 Q 50 -10 100 30" 
                  fill="none" 
                  stroke="#9ca3af" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3"
                />
              </svg>
            </div>

            {/* "Data Driven Results That Speak" handwritten text */}
            <div className="absolute top-2 right-[30%] z-20 hidden md:block">
              <p 
                className="text-gray-700 text-sm leading-tight"
                style={{ fontFamily: 'Caveat, cursive', fontSize: '1.25rem' }}
              >
                Data Driven<br />
                Results That<br />
                Speak
              </p>
              {/* Arrow */}
              <svg className="w-12 h-6 mt-1" viewBox="0 0 50 25" fill="none">
                <path d="M0 12 Q 20 12 35 18" stroke="#374151" strokeWidth="1.5" fill="none"/>
                <path d="M30 14 L 38 18 L 32 22" stroke="#374151" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>

            {/* ROAS Floating Card (Top Right) */}
            <div className="absolute top-12 right-0 z-30 animate-float">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xl w-48">
                <p className="text-xs text-gray-500 font-medium mb-1">ROAS</p>
                <div className="font-heading font-bold text-3xl text-gray-900 mb-1">4.32x</div>
                <div className="flex items-center gap-1 mb-2">
                  <ArrowUp size={12} className="text-green-500" />
                  <span className="text-xs font-semibold text-green-500">28.6%</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-2">vs last 30 days</p>
                {/* Mini chart */}
                <svg className="w-full" height="30" viewBox="0 0 120 30">
                  <path 
                    d="M0,20 Q20,18 35,15 T70,10 T105,5 T120,8" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            {/* ═══════ MAIN DASHBOARD MOCKUP ═══════ */}
            <div className="absolute top-[18%] left-[5%] right-[5%] z-10">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                
                {/* Browser dots */}
                <div className="bg-gray-100 px-4 py-2 flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                </div>

                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-32 md:w-36 bg-gray-50/50 border-r border-gray-100 p-3 space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                      <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">M</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-800">Meta Ads</span>
                    </div>
                    
                    {[
                      { icon: Home, label: 'Overview', active: true },
                      { icon: Send, label: 'Campaigns', active: false },
                      { icon: LayoutGrid, label: 'Ad Sets', active: false },
                      { icon: MonitorPlay, label: 'Ads', active: false },
                      { icon: Users, label: 'Audience', active: false },
                      { icon: FileBarChart, label: 'Reports', active: false },
                      { icon: CreditCard, label: 'Billing', active: false },
                      { icon: Settings, label: 'Settings', active: false },
                    ].map((item, i) => (
                      <div 
                        key={i}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                          item.active 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-600'
                        }`}
                      >
                        <item.icon size={12} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-3 md:p-4">
                    <p className="text-xs font-semibold text-gray-800 mb-3">Overview</p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                      {[
                        { label: 'Conversions', value: '1,248', change: '34.5%', up: true },
                        { label: 'Cost per Result', value: '₹21.45', change: '18.3%', up: false },
                        { label: 'Amount Spent', value: '₹26,780', change: '12.8%', up: true },
                        { label: 'Reach', value: '152K', change: '23.1%', up: true },
                      ].map((stat, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-2">
                          <p className="text-[8px] text-gray-500 mb-0.5">{stat.label}</p>
                          <p className="text-xs md:text-sm font-bold text-gray-900">{stat.value}</p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            <span className={`text-[8px] ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                              {stat.up ? '↑' : '↓'}
                            </span>
                            <span className={`text-[8px] font-semibold ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                              {stat.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Performance Chart */}
                    <div className="bg-white border border-gray-100 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-semibold text-gray-700">Performance Over Time</p>
                        <div className="bg-green-500 text-white text-[8px] px-2 py-0.5 rounded font-bold">
                          1,248 Conversions
                        </div>
                      </div>
                      <svg className="w-full" height="60" viewBox="0 0 300 60">
                        {/* Y-axis labels */}
                        <text x="0" y="10" className="text-[6px] fill-gray-400">1K</text>
                        <text x="0" y="30" className="text-[6px] fill-gray-400">750</text>
                        <text x="0" y="50" className="text-[6px] fill-gray-400">500</text>
                        
                        {/* Chart lines */}
                        <polyline
                          points="20,40 50,32 80,30 110,25 140,28 170,18 200,22 230,15 260,12 290,8"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="1.5"
                        />
                        <polyline
                          points="20,45 50,42 80,38 110,40 140,35 170,38 200,32 230,30 260,28 290,25"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                        
                        {/* X-axis labels */}
                        <text x="20" y="58" className="text-[6px] fill-gray-400">Apr 21</text>
                        <text x="80" y="58" className="text-[6px] fill-gray-400">Apr 28</text>
                        <text x="140" y="58" className="text-[6px] fill-gray-400">May 5</text>
                        <text x="200" y="58" className="text-[6px] fill-gray-400">May 12</text>
                        <text x="260" y="58" className="text-[6px] fill-gray-400">May 19</text>
                      </svg>
                    </div>

                    {/* Top Campaigns */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-700 mb-2">Top Performing Campaigns</p>
                      <div className="space-y-1">
                        <div className="grid grid-cols-4 gap-2 text-[8px] text-gray-400 font-medium pb-1 border-b border-gray-100">
                          <span>Campaign</span>
                          <span>Results</span>
                          <span>Cost per Result</span>
                          <span>ROAS</span>
                        </div>
                        {[
                          { name: 'Leads Campaign', results: '612', cost: '₹18.32', roas: '4.91x' },
                          { name: 'Sales Campaign', results: '436', cost: '₹24.11', roas: '4.21x' },
                          { name: 'Retargeting Campaign', results: '200', cost: '₹16.21', roas: '3.84x' },
                        ].map((camp, i) => (
                          <div key={i} className="grid grid-cols-4 gap-2 text-[9px] text-gray-700 py-1">
                            <span className="truncate">{camp.name}</span>
                            <span>{camp.results}</span>
                            <span>{camp.cost}</span>
                            <span className="text-green-600 font-semibold">{camp.roas}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Target/Bullseye Icon (Right side) */}
            <div className="absolute top-[30%] right-0 z-20 animate-float-delay">
              <div className="relative w-24 h-24">
                {/* Bullseye circles */}
                <div className="absolute inset-0 bg-blue-500 rounded-full" />
                <div className="absolute inset-3 bg-white rounded-full" />
                <div className="absolute inset-6 bg-blue-500 rounded-full" />
                <div className="absolute inset-9 bg-white rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full" />
                {/* Arrow/Dart */}
                <div className="absolute -top-2 -right-2">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M30 10 L 38 2" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M28 8 L 36 0 L 40 4 L 32 12 Z" fill="#22c55e"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Leads Generated Floating Card (Bottom Right) */}
            <div className="absolute bottom-[20%] right-0 z-30 animate-float-slow">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xl w-48">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users size={14} className="text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Leads Generated</span>
                </div>
                <div className="font-heading font-bold text-3xl text-gray-900 mb-1">1,248</div>
                <div className="flex items-center gap-1 mb-2">
                  <ArrowUp size={12} className="text-green-500" />
                  <span className="text-xs font-semibold text-green-500">37.8%</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-2">vs last 30 days</p>
                {/* Mini chart */}
                <svg className="w-full" height="25" viewBox="0 0 120 25">
                  <path 
                    d="M0,20 Q20,15 35,18 T70,10 T105,5 T120,3" 
                    fill="none" 
                    stroke="#22c55e" 
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>


          </div>
        </div>

        {/* ═══════ 5-Step Process Bar ═══════ */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {[
              {
                icon: Search,
                title: 'Strategy',
                desc: 'We analyze, research and plan winning ad strategies.',
              },
              {
                icon: PenTool,
                title: 'Create',
                desc: 'We craft scroll-stopping ads that attract and convert.',
              },
              {
                icon: Rocket,
                title: 'Launch',
                desc: 'We launch high-performing campaigns with the right targeting.',
              },
              {
                icon: BarChart3,
                title: 'Optimize',
                desc: 'We test, optimize and improve for maximum performance.',
              },
              {
                icon: TrendingUp,
                title: 'Scale',
                desc: 'We scale what works and deliver consistent results.',
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                {/* Icon */}
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <step.icon size={20} className="text-green-600" />
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-base text-gray-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-snug">
                    {step.desc}
                  </p>
                </div>

                {/* Separator dot (between items) */}
                {i < 4 && (
                  <div className="hidden md:block absolute -right-3 top-5 w-1 h-1 bg-green-400 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetaAdsService;
