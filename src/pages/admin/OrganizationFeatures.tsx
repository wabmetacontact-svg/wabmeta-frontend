// src/pages/admin/OrganizationFeatures.tsx

import { useState, useEffect, useMemo } from 'react';
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
  LockOpen,
  AlertTriangle,
} from 'lucide-react';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';
import PageLoader from '../../components/common/PageLoader';
import {
  FEATURES,
  FEATURE_GROUPS,
  emptyLockState,
  type FeatureDefinition,
  type FeatureGroup,
} from '../../constants/features';

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
      className={`relative inline-flex items-center rounded-full shrink-0
        transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${sz.track}
        ${checked ? colorMap[color] : 'bg-gray-300'}`}
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
// FEATURE ROW
// ============================================

/**
 * Toggle ON = the organisation gets the feature.
 *
 * Three things decide that, and they are not the same thing:
 *   - locks[wireKey]  - the admin's own lock. Always wins.
 *   - planLocked      - the plan does not include it.
 *   - overrides[key]  - this organisation gets it anyway, plan or not.
 *
 * The toggle used to write only the admin lock, so switching a plan-blocked
 * feature to "Enabled" changed a column the server never consulted: the row
 * said Enabled and the customer still saw a padlock. Turning on a
 * plan-blocked feature now writes the override that actually grants it.
 */
const FeatureRow: React.FC<{
  feature: FeatureDefinition;
  locked: boolean;
  planLocked: boolean;
  overridden: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ feature, locked, planLocked, overridden, onChange }) => {
  const Icon = feature.icon;
  const enabled = !locked && (!planLocked || overridden);

  return (
    <div
      className={`p-4 rounded-xl border flex items-center justify-between gap-4
        transition-all
        ${!enabled ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
            ${!enabled ? 'bg-red-100' : 'bg-gray-100'}`}
        >
          <Icon className={`w-4 h-4 ${!enabled ? 'text-red-500' : 'text-gray-500'}`} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm">{feature.label}</p>

            {feature.lockedByDefault && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded
                  bg-gray-100 text-gray-500 border border-gray-200"
                title="New accounts start with this feature locked"
              >
                Locked by default
              </span>
            )}

            {planLocked && !overridden && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded
                  bg-amber-50 text-amber-700 border border-amber-200"
                title="Not included in this plan. Switch it on to grant this organisation an exception."
              >
                Not in plan
              </span>
            )}

            {planLocked && overridden && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded
                  bg-emerald-50 text-emerald-700 border border-emerald-200"
                title="Not included in this plan, but granted to this organisation anyway."
              >
                Plan exception
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {feature.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`text-xs font-semibold w-16 text-right
            ${!enabled ? 'text-red-500' : 'text-green-600'}`}
        >
          {enabled ? 'Enabled' : 'Locked'}
        </span>
        <ToggleSwitch
          checked={enabled}
          onChange={onChange}
          color="green"
          size="md"
        />
      </div>
    </div>
  );
};

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

  // Admin Override aur uske do child features (contacts import wale).
  const [extras, setExtras] = useState({
    simpleBulkPaste: false,
    csvUpload: false,
    adminOverride: false,
  });

  // Har module ka lock: { inboxLocked: false, telegramLocked: true, ... }
  const [locks, setLocks] = useState<Record<string, boolean>>(emptyLockState);

  // Features the plan does not include. The admin lock alone cannot open
  // these - only an override can.
  const [planLocked, setPlanLocked] = useState<Record<string, boolean>>({});

  // Per-organisation exceptions to the plan, keyed by feature key (not
  // wireKey): { telegram: true }. This is what the server reads when it asks
  // "the plan says no, but was this organisation granted it anyway?".
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFeatures();
    // Loads when the org id changes; fetchFeatures reads only that id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const fetchFeatures = async () => {
    try {
      const { data } = await admin.getOrganizationFeatures(organizationId!);
      const payload = data.data;
      const features = payload.features || {};

      setOrgName(payload.organizationName);
      setCurrentPlan(payload.currentPlan);
      setExtras({
        simpleBulkPaste: !!features.simpleBulkPaste,
        csvUpload: !!features.csvUpload,
        adminOverride: !!features.adminOverride,
      });

      // Sirf wahi keys lo jo registry me hain - purana backend naye
      // features nahi bhejega, unka default (unlocked) reh jayega.
      setLocks(
        FEATURES.reduce(
          (acc, f) => {
            acc[f.wireKey] = features[f.wireKey] === true;
            return acc;
          },
          {} as Record<string, boolean>
        )
      );
      setPlanLocked(payload.planLocked || {});
      setOverrides(payload.overrides || {});
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
        simpleBulkPaste: extras.simpleBulkPaste,
        csvUpload: extras.csvUpload,
        enableOverride: extras.adminOverride,
        // Without this the plan exceptions never reach the database, and a
        // feature switched on here stays locked for the customer.
        overrides,
        ...locks,
      });
      toast.success('Features updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Turn one feature on or off.
   *
   * On: clear the admin lock, and if the plan does not include the feature,
   * grant this organisation an exception - that second half is what was
   * missing, and why the toggle appeared to do nothing.
   *
   * Off: set the admin lock, which beats everything, and drop any exception
   * so it does not quietly come back if the lock is lifted later.
   */
  const setFeatureEnabled = (feature: FeatureDefinition, enabled: boolean) => {
    setLocks((prev) => ({ ...prev, [feature.wireKey]: !enabled }));

    setOverrides((prev) => {
      const next = { ...prev };
      if (enabled && planLocked[feature.wireKey]) {
        next[feature.key] = true;
      } else {
        delete next[feature.key];
      }
      return next;
    });
  };

  const setAll = (locked: boolean) => {
    FEATURES.forEach((f) => setFeatureEnabled(f, !locked));
  };

  const grouped = useMemo(() => {
    return FEATURE_GROUPS.map((group) => ({
      group,
      items: FEATURES.filter((f) => f.group === group),
    })).filter((g) => g.items.length > 0);
  }, []);

  // What the customer actually sees, not just the admin lock column.
  const isEnabled = (f: FeatureDefinition) =>
    !locks[f.wireKey] && (!planLocked[f.wireKey] || overrides[f.key] === true);

  const lockedCount = FEATURES.filter((f) => !isEnabled(f)).length;

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900
          transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Org Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700
              rounded-2xl flex items-center justify-center shrink-0"
          >
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{orgName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Current Plan:</span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs
                  font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20"
              >
                {currentPlan}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-200">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
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
              extras.adminOverride
                ? 'border-yellow-500/40 bg-yellow-500/5'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    extras.adminOverride
                      ? 'bg-yellow-500/20 border border-yellow-500/30'
                      : 'bg-gray-100'
                  }`}
                >
                  <Shield
                    className={`w-5 h-5 ${
                      extras.adminOverride ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-base">
                    Admin Override
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Grant these two contact-import features by hand, whatever
                    the plan allows. The module locks below work without it.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={extras.adminOverride}
                onChange={(val) =>
                  setExtras((prev) => ({
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

          {/* ────────── OVERRIDE-DEPENDENT FEATURES ────────── */}
          <div
            className={`space-y-3 transition-opacity ${
              extras.adminOverride
                ? 'opacity-100'
                : 'opacity-40 pointer-events-none'
            }`}
          >
            {/* Simple Bulk Paste */}
            <div
              className="p-4 bg-gray-50 rounded-xl border border-gray-200
                hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      Simple Bulk Paste
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Paste phone numbers directly · Included from Growth
                      onwards
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={extras.simpleBulkPaste}
                  onChange={(val) =>
                    setExtras((prev) => ({ ...prev, simpleBulkPaste: val }))
                  }
                  disabled={!extras.adminOverride}
                  color="blue"
                />
              </div>
            </div>

            {/* CSV Upload */}
            <div
              className="p-4 bg-gray-50 rounded-xl border border-gray-200
                hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      CSV Import
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Import contacts from CSV files
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={extras.csvUpload}
                  onChange={(val) =>
                    setExtras((prev) => ({ ...prev, csvUpload: val }))
                  }
                  disabled={!extras.adminOverride}
                  color="purple"
                />
              </div>
            </div>
          </div>

          {!extras.adminOverride && (
            <div
              className="p-4 bg-yellow-500/10 border border-yellow-500/20
                rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              <p className="text-sm text-yellow-700">
                Turn on <strong>Admin Override</strong> to grant bulk paste or
                CSV import. The module locks below are separate from this.
              </p>
            </div>
          )}

          {/* ────────── MODULE ACCESS ────────── */}
          <div className="pt-6 mt-2 border-t border-gray-200">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <h3 className="text-gray-900 font-semibold text-sm">
                    Module Access
                  </h3>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded border
                      ${
                        lockedCount > 0
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}
                  >
                    {lockedCount > 0
                      ? `${lockedCount} locked`
                      : 'All unlocked'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Toggle on and the organisation gets the feature. These apply
                  on the server too - they do more than hide a menu item. A
                  feature marked "Not in plan" is granted as an exception.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAll(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                    font-medium border border-gray-200 text-gray-600
                    hover:bg-gray-50 transition-colors"
                >
                  <LockOpen className="w-3.5 h-3.5" />
                  Unlock all
                </button>
                <button
                  type="button"
                  onClick={() => setAll(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                    font-medium border border-red-200 text-red-600
                    hover:bg-red-50 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Lock all
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {grouped.map(({ group, items }) => (
                <FeatureGroupSection
                  key={group}
                  group={group}
                  items={items}
                  locks={locks}
                  planLocked={planLocked}
                  overrides={overrides}
                  onChange={setFeatureEnabled}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-5 border-t border-gray-200 flex justify-end">
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

// ============================================
// GROUP SECTION
// ============================================

const FeatureGroupSection: React.FC<{
  group: FeatureGroup;
  items: FeatureDefinition[];
  locks: Record<string, boolean>;
  planLocked: Record<string, boolean>;
  overrides: Record<string, boolean>;
  onChange: (feature: FeatureDefinition, enabled: boolean) => void;
}> = ({ group, items, locks, planLocked, overrides, onChange }) => (
  <div>
    <p className="px-1 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
      {group}
    </p>
    <div className="space-y-2">
      {items.map((feature) => (
        <FeatureRow
          key={feature.key}
          feature={feature}
          locked={!!locks[feature.wireKey]}
          planLocked={!!planLocked[feature.wireKey]}
          overridden={overrides[feature.key] === true}
          onChange={(enabled) => onChange(feature, enabled)}
        />
      ))}
    </div>
  </div>
);
