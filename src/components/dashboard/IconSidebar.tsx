import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, Users, Send, FileText, Bot, Zap,
  BarChart3, Wallet, CreditCard, Settings, UserCircle, MessageCircle,
  BookOpen, TrendingUp, Image as ImageIcon, Megaphone,
} from 'lucide-react';

type Channel = 'whatsapp' | 'instagram';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const whatsappNav: NavItem[] = [
  { name: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard },
  { name: 'Inbox',        href: '/dashboard/inbox',        icon: Inbox },
  { name: 'Contacts',     href: '/dashboard/contacts',     icon: Users },
  { name: 'CRM',          href: '/dashboard/crm',          icon: UserCircle },
  { name: 'Campaigns',    href: '/dashboard/campaigns',    icon: Send },
  { name: 'Templates',    href: '/dashboard/templates',    icon: FileText },
  { name: 'Chatbots',     href: '/dashboard/chatbots',     icon: Bot },
  { name: 'Automations',  href: '/dashboard/automations',  icon: Zap },
  { name: 'Reports',      href: '/dashboard/reports',      icon: BarChart3 },
  { name: 'Wallet',       href: '/dashboard/wallet',       icon: Wallet },
  { name: 'Billing',      href: '/dashboard/billing',      icon: CreditCard },
  { name: 'Settings',     href: '/dashboard/settings',     icon: Settings },
];

const instagramNav: NavItem[] = [
  { name: 'Dashboard',     href: '/instagram/dashboard',      icon: LayoutDashboard },
  { name: 'DM Automation', href: '/instagram/dm-automation',  icon: MessageCircle },
  { name: 'Comments',      href: '/instagram/comments',       icon: BookOpen },
  { name: 'Stories',       href: '/instagram/stories',        icon: ImageIcon },
  { name: 'Campaigns',     href: '/instagram/campaigns',      icon: Megaphone },
  { name: 'Analytics',     href: '/instagram/analytics',      icon: TrendingUp },
  { name: 'Settings',      href: '/instagram/settings',       icon: Settings },
];

const IconSidebar: React.FC = () => {
  const location = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);

  const [channel, setChannel] = useState<Channel>(
    location.pathname.startsWith('/instagram') ? 'instagram' : 'whatsapp'
  );

  useEffect(() => {
    setChannel(location.pathname.startsWith('/instagram') ? 'instagram' : 'whatsapp');
  }, [location.pathname]);

  const navigation = channel === 'instagram' ? instagramNav : whatsappNav;

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/instagram/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className="
        fixed left-3 top-1/2 -translate-y-1/2 z-40
        flex flex-col items-center gap-1.5 px-2 py-4
        rounded-full
        bg-white/80 dark:bg-[#1A2331]/80
        backdrop-blur-xl
        border border-cream-300 dark:border-[#2A3441]
        shadow-card
        max-h-[90vh] overflow-y-auto scrollbar-thin
      "
    >
      {navigation.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <div
            key={item.name}
            className="relative"
            onMouseEnter={() => setHovered(item.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <Link
              to={item.href}
              aria-label={item.name}
              className={`
                relative flex items-center justify-center
                w-10 h-10 rounded-full
                transition-all duration-300
                ${active
                  ? 'bg-ink-900 dark:bg-mint-500 text-white dark:text-ink-900 shadow-float scale-105'
                  : 'text-ink-500 dark:text-ink-400 hover:bg-cream-100 dark:hover:bg-[#131922] hover:text-ink-900 dark:hover:text-cream-100'
                }
              `}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </Link>

            {/* Tooltip */}
            {hovered === item.name && (
              <div
                className="
                  absolute left-full top-1/2 -translate-y-1/2 ml-3
                  px-3 py-1.5 rounded-lg
                  bg-ink-900 dark:bg-white
                  text-white dark:text-ink-900
                  text-xs font-medium whitespace-nowrap
                  shadow-float
                  z-50
                  animate-fadeIn
                  pointer-events-none
                "
              >
                {item.name}
                <span
                  className="
                    absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1
                    w-2 h-2 rotate-45
                    bg-ink-900 dark:bg-white
                  "
                />
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};

export default IconSidebar;
