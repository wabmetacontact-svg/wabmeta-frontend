// src/pages/Settings.tsx

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Smartphone,
  User,
  Bell,
  Shield,
  Code,
  Globe,
  CreditCard,
  Phone,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { organizations, handleApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Import settings components
import WhatsAppSettings from '../components/settings/WhatsAppSettings';
import BusinessProfile from '../components/settings/BusinessProfile';
import WhatsAppBusinessProfile from '../components/settings/WhatsAppBusinessProfile';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import ApiConfig from '../components/settings/ApiConfig';
import CallingSettings from '../components/settings/CallingSettings';
import PaymentsSettings from '../components/settings/PaymentsSettings';

type SettingsTab = 'whatsapp' | 'general' | 'business' | 'payments' | 'notifications' | 'security' | 'api' | 'calling';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('whatsapp');
  const { organization, updateOrganization } = useAuth();

  const handleUpdateOrganization = async (data: any) => {
    if (!organization?.id) return { success: false };
    try {
      const res = await organizations.update(organization.id, data);
      const updated = res.data?.data;
      if (updated) updateOrganization(updated);
      toast.success('Business profile updated');
      return { success: true };
    } catch (err: any) {
      toast.error(handleApiError(err) || 'Could not save your changes.');
      return { success: false };
    }
  };

  const tabs = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: Smartphone,
      description: 'Connect & manage WhatsApp accounts',
    },
    {
      id: 'general',
      name: 'General',
      icon: SettingsIcon,
      description: 'Name, logo, website & timezone',
    },
    {
      id: 'business',
      name: 'Business Profile',
      icon: Building2,
      description: 'How customers see you on WhatsApp',
    },
    {
      id: 'payments',
      name: 'Payments',
      icon: CreditCard,
      description: 'Your Razorpay account for customer payments',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Email & push notifications',
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Password & 2FA',
    },
    {
      id: 'api',
      name: 'API & Webhooks',
      icon: Code,
      description: 'API keys & webhook config',
    },
    {
      id: 'calling',
      name: 'Calling',
      icon: Phone,
      description: 'WhatsApp calling settings',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'whatsapp':
        return <WhatsAppSettings />;
      // General = organization settings (name, logo, website, industry,
      // timezone). Pehle yahan GeneralSettings tha jo ek dead static form
      // tha - na state, na API call, na save handler. Asli form
      // BusinessProfile component mein hai, wahi ab yahan render hota hai.
      case 'general':
        return (
          <BusinessProfile
            organization={organization}
            onUpdate={handleUpdateOrganization}
          />
        );

      // Business Profile = WhatsApp par jo customers ko dikhta hai.
      // Pehle ye WhatsApp tab ke andar ek modal mein chhupa hua tha.
      case 'business':
        return <WhatsAppBusinessProfile />;
      // Client ka apna Razorpay - customer ka paisa seedha unke account me
      case 'payments':
        return <PaymentsSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'api':
        return <ApiConfig />;
      case 'calling':
        return <CallingSettings />;
      default:
        return <WhatsAppSettings />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="w-8 h-8 mr-3 text-gray-500" />
          Settings
        </h1>
        <p className="mt-1 text-gray-600">
          Manage your account and application settings
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 sticky top-6 shadow-sm">
            <nav className="flex flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center px-4 py-3 text-left transition-all border-l-4 ${activeTab === tab.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-500'
                    }`} />
                  <div>
                    <p className={`font-medium ${activeTab === tab.id ? 'text-emerald-600 font-semibold' : 'text-gray-700'
                      }`}>
                      {tab.name}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      {tab.description}
                    </p>
                  </div>
                </button>
              ))}
            </nav>

            {/* Quick Links */}
            <div className="border-t border-gray-200 p-4 relative z-10 bg-gray-50/50">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                Quick Links
              </p>
              <div className="space-y-2">
                <Link
                  to="/dashboard/settings/profile"
                  className="flex items-center text-sm text-gray-600 hover:text-emerald-600"
                >
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
                <Link
                  to="/dashboard/settings/team"
                  className="flex items-center text-sm text-gray-600 hover:text-emerald-600"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Team Members
                </Link>
                <Link
                  to="/dashboard/settings/billing"
                  className="flex items-center text-sm text-gray-600 hover:text-emerald-600"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing & Plans
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="relative z-10">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;