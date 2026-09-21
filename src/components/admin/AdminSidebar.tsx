import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Phone,
  Wallet,
  ShieldAlert,
  Building2,
  AlertTriangle,
  TrendingUp,
  Megaphone,
  Ticket
} from 'lucide-react';
import { adminCan } from '../../utils/adminPermissions';
import Logo from '../common/Logo';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/manage-wabmeta-admin/dashboard', icon: LayoutDashboard },
    { name: 'WhatsApp', href: '/manage-wabmeta-admin/whatsapp', icon: Phone },
    { name: 'Needs attention', href: '/manage-wabmeta-admin/risk', icon: AlertTriangle },
    { name: 'Organizations', href: '/manage-wabmeta-admin/organizations', icon: Building2 },
    { name: 'Users', href: '/manage-wabmeta-admin/users', icon: Users },
    { name: 'Subscriptions', href: '/manage-wabmeta-admin/subscriptions', icon: CreditCard },
    { name: 'Wallets', href: '/manage-wabmeta-admin/wallets', icon: Wallet },
    ...(adminCan('billing.read') ? [{ name: 'Revenue', href: '/manage-wabmeta-admin/revenue', icon: TrendingUp }] : []),
    ...(adminCan('billing.read') ? [{ name: 'Coupons', href: '/manage-wabmeta-admin/coupons', icon: Ticket }] : []),
    { name: 'Announcements', href: '/manage-wabmeta-admin/announcements', icon: Megaphone },
    ...(adminCan('audit.read') || adminCan('security.read')
      ? [{ name: 'Audit & Security', href: '/manage-wabmeta-admin/audit', icon: ShieldAlert }]
      : []),
    { name: 'Settings', href: '/manage-wabmeta-admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    // Clear admin session - this used to only navigate, leaving the token
    // behind so the next visit was still signed in.
    localStorage.removeItem('wabmeta_admin_token');
    localStorage.removeItem('wabmeta_admin_user');
    navigate('/manage-wabmeta-admin/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#0f172a] text-white border-r border-gray-800">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-800">
          <Logo variant="full" theme="dark" />
          <span className="ml-2 text-xs bg-red-600 px-2 py-0.5 rounded text-white font-bold">
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;