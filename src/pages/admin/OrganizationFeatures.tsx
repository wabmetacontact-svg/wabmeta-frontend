// src/pages/admin/OrganizationFeatures.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  FileSpreadsheet,
  Shield,
  Building2,
  Lock,
  Inbox,
  Megaphone,
  Bot,
  Zap,
  AlertTriangle,
  Link2Off,
} from 'lucide-react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';
import PageSkeleton from '../../components/common/PageSkeleton';

// ============================================
// TOGGLE SWITCH
// ============================================

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  color?: 'yellow' | 'blue' | 'purple' | 'red' | 'green';
  size?: 'sm' | 'md';
}> = ({ checked, onChange, disabled, color = 'blue', size = 'md' }) => {
  const colorMap = {
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
  };

  const sizeMap = {
    sm: {
      track: 'h-5 w-9',
      knob: 'h-4 w-4',
      translate: 'translate-x-4',
    },
    md: {
      track: 'h-6 w-11',
      knob: 'h-5 w-5',
      translate: 'translate-x-5',
    },
  };

  const sz = sizeMap[size];

  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex items-center rounded-full
        transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${sz.track}
        ${checked ? colorMap[color] : 'bg-white/[0.1]'}`}
    >
      <span
        className={`inline-block transform rounded-full bg-white shadow-md
          transition-transform ${sz.knob}
          ${checked ? sz.translate : 'translate-x-0.5'}`}
      />
    </button>
  );
};

// ============================================
// LOCK CARD
// ============================================

const LockCard: React.FC<{
  icon: React.ElementType;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (val: boolean) => void;
}> = ({ icon: Icon, label, checked, disabled, onChange }) => (
  <div
    className={`p-4 rounded-xl border flex items-center justify-between
      transition-all
      ${
        checked
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-[#050816] border-white/[0.06] hover:border-white/[0.1]'
      }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`p-2 rounded-lg ${
          checked ? 'bg-red-500/20' : 'bg-white/[0.04]'
        }`}
      >
        <Icon
          className={`w-4 h-4 ${
            checked ? 'text-red-400' : 'text-gray-400'
          }`}
        />
      </div>
      <span
        className={`text-sm font-medium ${
          checked ? 'text-red-300' : 'text-gray-300'
        }`}
      >
        {label}
      </span>
    </div>
    <ToggleSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      color="red"
      size="sm"
    />
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function OrganizationFeatures() {
  const { organizationId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [currentPlan, setCurrentPlan] = useState('');
  const [features, setFeatures] = useState({
    simpleBulkPaste: false,
    csvUpload: false,
    adminOverride: false,
    inboxLocked: false,
    campaignsLocked: false,
    chatbotLocked: false,
    automationLocked: false,
    connectionLocked: false,
  });

  useEffect(() => {
    fetchFeatures();
  }, [organizationId]);

  const fetchFeatures = async () => {
    try {
      const { data } = await admin.getOrganizationFeatures(organizationId!);
      setOrgName(data.data.organizationName);
      setCurrentPlan(data.data.currentPlan);
      setFeatures(data.data.features);
    } catch (error) {
      toast.error('Failed to fetch features');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await admin.updateOrganizationFeatures(organizationId!, {
        simpleBulkPaste: features.simpleBulkPaste,
        csvUpload: features.csvUpload,
        enableOverride: features.adminOverride,
        inboxLocked: features.inboxLocked,
        campaignsLocked: features.campaignsLocked,
        chatbotLocked: features.chatbotLocked,
        automationLocked: features.automationLocked,
        connectionLocked: features.connectionLocked,
      });
      toast.success('Features updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white
          transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Org Header */}
      <div className="bg-[#0a0e27] border border-white/[0.08] rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700
              rounded-2xl flex items-center justify-center shrink-0"
          >
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{orgName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Current Plan:</span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs
                  font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20"
              >
                {currentPlan}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Card */}
      <div className="bg-[#0a0e27] rounded-2xl border border-white/[0.08] p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/[0.06]">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Feature Access Control
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage what this organization can access
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* ────────── ADMIN OVERRIDE ────────── */}
          <div
            className={`p-5 rounded-xl border-2 transition-all ${
              features.adminOverride
                ? 'border-yellow-500/40 bg-yellow-500/5'
                : 'border-white/[0.08] bg-[#050816]'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    features.adminOverride
                      ? 'bg-yellow-500/20 border border-yellow-500/30'
                      : 'bg-white/[0.04]'
                  }`}
                >
                  <Shield
                    className={`w-5 h-5 ${
                      features.adminOverride
                        ? 'text-yellow-400'
                        : 'text-gray-400'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-base">
                    Admin Override
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    When enabled, plan restrictions are ignored and you control
                    access manually
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={features.adminOverride}
                onChange={(val) =>
                  setFeatures((prev) => ({
                    ...prev,
                    adminOverride: val,
                    // Reset child features when disabling override
                    ...(val ? {} : { simpleBulkPaste: false, csvUpload: false }),
                  }))
                }
                color="yellow"
                size="md"
              />
            </div>
          </div>

          {/* ────────── DEPENDENT FEATURES ────────── */}
          <div
            className={`space-y-3 transition-opacity ${
              features.adminOverride
                ? 'opacity-100'
                : 'opacity-40 pointer-events-none'
            }`}
          >
            {/* Simple Bulk Paste */}
            <div
              className="p-4 bg-[#050816] rounded-xl border border-white/[0.06]
                hover:border-white/[0.1] transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm">
                      Simple Bulk Paste
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Paste phone numbers directly · Normally requires ₹2,500+
                      plan
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={features.simpleBulkPaste}
                  onChange={(val) =>
                    setFeatures((prev) => ({
                      ...prev,
                      simpleBulkPaste: val,
                    }))
                  }
                  disabled={!features.adminOverride}
                  color="blue"
                />
              </div>
            </div>

            {/* CSV Upload */}
            <div
              className="p-4 bg-[#050816] rounded-xl border border-white/[0.06]
                hover:border-white/[0.1] transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm">
                      CSV Import
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Import contacts from CSV files
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={features.csvUpload}
                  onChange={(val) =>
                    setFeatures((prev) => ({ ...prev, csvUpload: val }))
                  }
                  disabled={!features.adminOverride}
                  color="purple"
                />
              </div>
            </div>

            {/* ────────── LOCK MODULES SECTION ────────── */}
            <div className="pt-4 pb-2 border-t border-white/[0.06] mt-2">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-red-400" />
                <h3 className="text-white font-semibold text-sm">
                  Disable / Lock Modules
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                Select modules to forcibly lock for this organization
              </p>
            </div>

            {/* Lock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LockCard
                icon={Inbox}
                label="Lock Inbox"
                checked={features.inboxLocked}
                disabled={!features.adminOverride}
                onChange={(val) =>
                  setFeatures((prev) => ({ ...prev, inboxLocked: val }))
                }
              />
              <LockCard
                icon={Megaphone}
                label="Lock Campaigns"
                checked={features.campaignsLocked}
                disabled={!features.adminOverride}
                onChange={(val) =>
                  setFeatures((prev) => ({ ...prev, campaignsLocked: val }))
                }
              />
              <LockCard
                icon={Bot}
                label="Lock Chatbot"
                checked={features.chatbotLocked}
                disabled={!features.adminOverride}
                onChange={(val) =>
                  setFeatures((prev) => ({ ...prev, chatbotLocked: val }))
                }
              />
              <LockCard
                icon={Zap}
                label="Lock Automation"
                checked={features.automationLocked}
                disabled={!features.adminOverride}
                onChange={(val) =>
                  setFeatures((prev) => ({ ...prev, automationLocked: val }))
                }
              />
            </div>
          </div>

          {/* ────────── CONNECTION LOCK (INDEPENDENT) ────────── */}
          <div className="pt-6 mt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1">
              <Link2Off className="w-4 h-4 text-orange-400" />
              <h3 className="text-white font-semibold text-sm">
                Connection Lock
              </h3>
              <span className="ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded
                bg-orange-500/10 text-orange-300 border border-orange-500/20">
                Independent
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Prevent this organization from connecting or disconnecting
              WhatsApp / Meta / Instagram accounts
            </p>

            <div
              className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all
                ${
                  features.connectionLocked
                    ? 'border-orange-500/40 bg-orange-500/5'
                    : 'border-white/[0.08] bg-[#050816]'
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    features.connectionLocked
                      ? 'bg-orange-500/20 border border-orange-500/30'
                      : 'bg-white/[0.04]'
                  }`}
                >
                  <Link2Off
                    className={`w-5 h-5 ${
                      features.connectionLocked ? 'text-orange-400' : 'text-gray-400'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm">
                    Lock Account Connection / Disconnection
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {features.connectionLocked
                      ? '🔒 Locked — user cannot connect or disconnect any account'
                      : 'Allow user to connect/disconnect WhatsApp, Meta, Instagram'}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={features.connectionLocked}
                onChange={(val) =>
                  setFeatures((prev) => ({ ...prev, connectionLocked: val }))
                }
                color="red"
                size="md"
              />
            </div>
          </div>

          {/* Warning message when override is off */}
          {!features.adminOverride && (
            <div
              className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20
                rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
              <p className="text-sm text-yellow-300">
                Enable <strong>"Admin Override"</strong> above to manually
                control feature access for this organization
              </p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600
              hover:bg-primary-700 text-white rounded-xl font-medium
              transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
