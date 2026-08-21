// src/pages/CreateCampaign.tsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, Send, Users,
  FileText, Settings, Clock, Loader2, Eye,
  AlertCircle, Wifi, Wallet, Info,
} from "lucide-react";

import TemplateSelector from "../components/campaigns/TemplateSelector";
import AudienceSelector from "../components/campaigns/AudienceSelector";
import VariableMapper from "../components/campaigns/VariableMapper";
import SchedulePicker from "../components/campaigns/SchedulePicker";
import TemplatePreview from "../components/templates/TemplatePreview";

import type { CampaignFormData } from "../types/campaign";
import {
  templates as templateApi,
  contacts as contactApi,
  campaigns as campaignApi,
  whatsapp as whatsappApi,
} from "../services/api";

interface MappedTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  headerType: string;
  headerContent?: string;
  body: string;
  buttons: { text: string; type?: string }[];
  variables: string[];
  headerVariables: string[];
  status: string;
  whatsappAccountId?: string;
}

interface MappedContact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
}

interface WhatsAppAccountLite {
  id: string;
  phoneNumberId?: string;
  phoneNumber?: string;
  displayName?: string;
  isDefault?: boolean;
  status?: string;
}

interface WalletEstimate {
  hasWallet: boolean;
  walletActive: boolean;
  availableBalance: number;
  estimatedCost: number;
  canProceed: boolean;
  shortfall: number;
  currency: string;
  estimatedCostBreakdown?: {
    totalRecipients: number;
    ratePerMessage: number;
    category: string;
    countryBreakdown?: {
      country: string;
      count: number;
      rate: number;
      cost: number;
    }[];
  };
}

// ✅ FIXED: Expanded variable matching regex extraction loop to parse alphanumeric vars (like {{name}}, {{company_name}}, etc.)
const extractVars = (text: string): string[] => {
  if (!text) return [];
  const matches = text.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, "")))]
    .sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (isNaN(numA) || isNaN(numB)) return a.localeCompare(b);
      return numA - numB;
    });
};

const parseApiArray = <T,>(resp: any, keys: string[] = []): T[] => {
  const data = resp?.data ?? resp;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (data?.data && typeof data.data === "object") {
    for (const k of keys) {
      if (Array.isArray(data.data[k])) return data.data[k];
    }
  }
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k];
  }
  return [];
};

const mapHeaderForPreview = (headerType: string, headerContent?: string) => {
  const ht = String(headerType || "none").toLowerCase();
  if (ht === "none" || ht === "null") return { type: "none" as const };
  if (ht === "text") return { type: "text" as const, text: headerContent || "" };
  if (ht === "image") return { type: "image" as const, cloudinaryUrl: headerContent, mediaUrl: headerContent };
  if (ht === "video") return { type: "video" as const, cloudinaryUrl: headerContent, mediaUrl: headerContent };
  if (ht === "document") return { type: "document" as const, cloudinaryUrl: headerContent };
  return { type: "none" as const };
};

const parseWalletError = (msg: string): { isWalletError: boolean; type?: string; required?: string; available?: string } => {
  if (msg.includes("WALLET_LOW_BALANCE")) {
    const parts = msg.split("::");
    return { isWalletError: true, type: "LOW_BALANCE", required: parts[1], available: parts[2] };
  }
  if (msg.includes("WALLET_INSUFFICIENT")) {
    const parts = msg.split("::");
    return { isWalletError: true, type: "INSUFFICIENT", required: parts[1], available: parts[2] };
  }
  return { isWalletError: false };
};

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [templates, setTemplates] = useState<MappedTemplate[]>([]);
  const [contacts, setContacts] = useState<MappedContact[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccountLite[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [walletEstimate, setWalletEstimate] = useState<WalletEstimate | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);

  const [totalAllContactsCount, setTotalAllContactsCount] = useState<number>(0);
  const [totalTagsCount, setTotalTagsCount] = useState<number>(0);
  const [groupMemberCount, setGroupMemberCount] = useState<number>(0);

  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const [formData, setFormData] = useState<CampaignFormData>(() => {
    const s = location.state as any;
    return {
      name: s?.name || "",
      description: s?.description || "",
      templateId: s?.templateId || "",
      audienceType: "all",
      selectedTags: [],
      selectedContacts: [],
      selectedGroup: "",
      csvContacts: [],
      variableMapping: {},
      scheduleType: "now",
      scheduledDate: "",
      scheduledTime: "",
    };
  });

  // Load Accounts
  useEffect(() => {
    (async () => {
      setApiError(null);
      try {
        setLoadingAccounts(true);
        const res = await whatsappApi.accounts();
        if (!isMountedRef.current) return;

        const arr = parseApiArray<any>(res, ["accounts", "items", "data"]);
        const conn = arr.filter(a => String(a.status || "").toUpperCase() === "CONNECTED");

        if (!conn.length) {
          throw new Error("No WhatsApp accounts connected. Please connect one in Settings → WhatsApp first.");
        }

        setWhatsappAccounts(conn);
        const def = conn.find(a => a.isDefault) || conn[0];
        setSelectedAccountId(def.id);
      } catch (e: any) {
        if (isMountedRef.current) {
          setApiError(e?.response?.data?.message || e?.message || "Failed to load WhatsApp accounts.");
        }
      } finally {
        if (isMountedRef.current) setLoadingAccounts(false);
      }
    })();
  }, []);

  // Fetch templates and contacts
  useEffect(() => {
    if (loadingAccounts || !selectedAccountId) {
      if (!loadingAccounts && isMountedRef.current) setLoadingData(false);
      return;
    }

    (async () => {
      setLoadingData(true);
      setApiError(null);
      try {
        const [tplRes, cntRes] = await Promise.all([
          templateApi.getAll({
            whatsappAccountId: selectedAccountId,
            status: "APPROVED",
            limit: 200,
          }),
          contactApi.getAll({ limit: 500, status: "ACTIVE" }),
        ]);

        if (!isMountedRef.current) return;

        const tplArr = parseApiArray<any>(tplRes, ["templates", "data"]);
        const mapped: MappedTemplate[] = tplArr
          .filter(t => String(t.status || "").toLowerCase() === "approved")
          .map(t => ({
            id: t._id || t.id,
            name: t.name || "Untitled",
            category: (t.category || "UTILITY").toLowerCase(),
            language: t.language || "en_US",
            headerType: (t.headerType || "NONE").toLowerCase(),
            headerContent: t.headerContent || undefined,
            body: t.bodyText || t.body || "",
            buttons: (Array.isArray(t.buttons) ? t.buttons : [])
              .map((b: any) => ({ text: b.text || "", type: b.type || "" })),
            variables: extractVars(t.bodyText || t.body || ""),
            headerVariables: extractVars(t.headerContent || ""),
            status: String(t.status || "PENDING").toLowerCase(),
            whatsappAccountId: t.whatsappAccountId,
          }));
        setTemplates(mapped);

        const cntArr = parseApiArray<any>(cntRes, ["contacts", "data"]);
        const cMapped: MappedContact[] = cntArr.map((c: any) => ({
          id: c._id || c.id,
          name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.phone || "Unknown",
          phone: c.phone || "",
          tags: Array.isArray(c.tags) ? c.tags : [],
        }));
        setContacts(cMapped);

        const tagsSet = new Set<string>();
        cMapped.forEach(c => c.tags.forEach(t => tagsSet.add(t)));
        setAvailableTags([...tagsSet]);
      } catch (err: any) {
        if (isMountedRef.current) {
          setApiError(err?.response?.data?.message || err?.message || "Failed to fetch template resources.");
        }
      } finally {
        if (isMountedRef.current) setLoadingData(false);
      }
    })();
  }, [loadingAccounts, selectedAccountId]);

  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === formData.templateId),
    [formData.templateId, templates]
  );

  useEffect(() => {
    contactApi.getAudienceCount({ type: 'all' })
      .then(res => {
        if (isMountedRef.current) setTotalAllContactsCount(res.data?.data?.count || 0);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (formData.selectedTags.length === 0) {
      setTotalTagsCount(0);
      return;
    }

    contactApi.getAudienceCount({
      type: 'tags',
      tags: formData.selectedTags.join(','),
    })
      .then(res => {
        if (isMountedRef.current) setTotalTagsCount(res.data?.data?.count || 0);
      })
      .catch(() => {
        if (isMountedRef.current) setTotalTagsCount(0);
      });
  }, [formData.selectedTags]);

  const totalRecipients = useMemo(() => {
    switch (formData.audienceType) {
      case "all": return totalAllContactsCount;
      case "tags": return totalTagsCount;
      case "manual": return formData.selectedContacts.length;
      case "group": return groupMemberCount;
      case "csv": return formData.csvContacts?.length || 0;
      default: return 0;
    }
  }, [formData.audienceType, formData.selectedContacts, formData.csvContacts, totalAllContactsCount, totalTagsCount, groupMemberCount]);

  const fetchWalletEstimate = useCallback(async (campaignId: string) => {
    try {
      setLoadingEstimate(true);
      const res = await campaignApi.estimateCost(campaignId);
      const data = res.data?.data || res.data;
      if (isMountedRef.current) setWalletEstimate(data);
    } catch (e: any) {
      console.warn("Wallet estimate calc error:", e.message);
    } finally {
      if (isMountedRef.current) setLoadingEstimate(false);
    }
  }, []);

  const steps = [
    { number: 1, title: "Template", icon: FileText },
    { number: 2, title: "Audience", icon: Users },
    { number: 3, title: "Variables", icon: Settings },
    { number: 4, title: "Schedule", icon: Clock },
  ];

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.name.trim() && !!formData.templateId && !!selectedAccountId;
      case 2:
        if (formData.audienceType === 'group') return !!formData.selectedGroup;
        if (formData.audienceType === 'csv') return !!(formData.csvContacts && formData.csvContacts.length > 0);
        if (formData.audienceType === 'tags') return formData.selectedTags.length > 0;
        if (formData.audienceType === 'manual') return formData.selectedContacts.length > 0;
        return true;
      case 3:
        if (!selectedTemplate) return true;
        const allVars = [
          ...(selectedTemplate.variables || []),
          ...(selectedTemplate.headerVariables || []),
        ];
        if (allVars.length === 0) return true;
        return allVars.every(v => {
          const val = formData.variableMapping[v];
          return val && String(val).trim().length > 0;
        });
      case 4:
        if (formData.scheduleType === 'later') {
          if (!formData.scheduledDate || !formData.scheduledTime) return false;
          // ✅ FIXED: iOS Safari cross-browser safe Date Builder (avoids dynamic NaN crashes)
          const [year, month, day] = formData.scheduledDate.split('-').map(Number);
          const [hours, minutes] = formData.scheduledTime.split(':').map(Number);
          const scheduled = new Date(year, month - 1, day, hours, minutes, 0);
          const now = new Date();
          return scheduled.getTime() > now.getTime() + 2 * 60 * 1000;
        }
        return true;
      default:
        return true;
    }
  };

  const validateTemplateMedia = (template: any): string | null => {
    const headerType = template.headerType?.toLowerCase();
    if (!['image', 'video', 'document'].includes(headerType)) return null;

    const content = template.headerContent;
    if (!content) {
      return `Template "${template.name}" media placeholder is empty. Please re-upload media file under Templates.`;
    }

    if (content.includes('scontent.whatsapp') || content.includes('scontent-') || content.includes('lookaside.fbsbx.com')) {
      return `Template "${template.name}" media link has expired from Meta CDN. Please re-upload your files.`;
    }
    return null;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(s => s + 1);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleBack5 = async () => {
    if (createdCampaignId) {
      try {
        await campaignApi.delete(createdCampaignId);
      } catch { /* ignore */ }
      if (isMountedRef.current) {
        setCreatedCampaignId(null);
        setWalletEstimate(null);
      }
    }
    setCurrentStep(4);
  };

  const handleCreate = async () => {
    setSending(true);
    setApiError(null);

    try {
      const account = whatsappAccounts.find(a => a.id === selectedAccountId);
      if (!account?.id) throw new Error("Invalid WhatsApp account mapping.");
      if (!formData.templateId) throw new Error("Please select a template configuration.");

      if (selectedTemplate) {
        const mediaError = validateTemplateMedia(selectedTemplate);
        if (mediaError) {
          setApiError(mediaError);
          setSending(false);
          return;
        }
      }

      let contactIds: string[] | undefined;
      let contactGroupId: string | undefined;
      let audienceFilter: any;
      let csvContactsPayload: any[] | undefined;

      switch (formData.audienceType) {
        case "all":
          audienceFilter = { all: true };
          break;
        case "tags":
          audienceFilter = { tags: formData.selectedTags };
          break;
        case "manual":
          if (!formData.selectedContacts.length) throw new Error("No contacts selected.");
          contactIds = formData.selectedContacts;
          break;
        case "group":
          if (!formData.selectedGroup) throw new Error("No dynamic group selected.");
          contactGroupId = formData.selectedGroup;
          break;
        case "csv":
          if (!formData.csvContacts?.length) throw new Error("No contacts uploaded from CSV file.");
          csvContactsPayload = formData.csvContacts;
          break;
      }

      const variableMapping: Record<string, string> = {};
      Object.entries(formData.variableMapping).forEach(([key, value]) => {
        const trimmed = String(value ?? '').trim();
        if (trimmed) {
          variableMapping[key] = trimmed;
        }
      });

      if (selectedTemplate) {
        const allVars = [
          ...(selectedTemplate.variables || []),
          ...(selectedTemplate.headerVariables || []),
        ];

        const missing = allVars.filter(v => !variableMapping[v]?.trim());
        if (missing.length > 0) {
          setApiError(`Please fill values for missing fields: ${missing.map(v => `{{${v}}}`).join(', ')}`);
          setSending(false);
          setCurrentStep(3);
          return;
        }
      }

      const scheduledAt =
        formData.scheduleType === "later"
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`).toISOString()
          : undefined;

      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        templateId: formData.templateId,
        whatsappAccountId: account.id,
        contactIds,
        contactGroupId,
        audienceFilter,
        csvContacts: csvContactsPayload,
        variableMapping: Object.keys(variableMapping).length > 0 ? variableMapping : undefined,
        scheduledAt,
      };

      console.log("📤 Initializing Campaign:", payload);

      const res = await campaignApi.create(payload);
      const campaignId = res.data?.data?.id || (res.data as any)?.id;

      if (!campaignId) {
        throw new Error("Campaign created but failed to retrieve transaction identifier");
      }

      if (isMountedRef.current) setCreatedCampaignId(campaignId);

      if (formData.scheduleType === "later") {
        navigate("/dashboard/campaigns");
        return;
      }

      await fetchWalletEstimate(campaignId);
      if (isMountedRef.current) setCurrentStep(5);

    } catch (error: any) {
      console.error("❌ Campaign instantiation failure:", error);
      const raw = error?.response?.data?.message || error?.message || "";
      const wall = parseWalletError(raw);

      if (wall.isWalletError && isMountedRef.current) {
        setApiError(
          wall.type === "LOW_BALANCE"
            ? `💳 Wallet balance too low (₹${wall.available}). Minimum ₹${wall.required} required to execute processing.`
            : `💳 Insufficient balance. Need ₹${wall.required}, have ₹${wall.available}. Please top up wallet.`
        );
      } else if (isMountedRef.current) {
        setApiError(raw || "Failed to initialize campaign");
      }
    } finally {
      if (isMountedRef.current) setSending(false);
    }
  };

  const handleStartCampaign = async () => {
    if (!createdCampaignId) return;
    setSending(true);
    setApiError(null);

    try {
      await campaignApi.start(createdCampaignId);
      navigate("/dashboard/campaigns");
    } catch (error: any) {
      const raw = error?.response?.data?.message || error?.message || "";
      const wall = parseWalletError(raw);

      if (wall.isWalletError && isMountedRef.current) {
        setApiError(
          wall.type === "LOW_BALANCE"
            ? `💳 Wallet balance low (₹${wall.available}). Please top up to proceed.`
            : `💳 Insufficient balance. Need ₹${wall.required}, have ₹${wall.available}.`
        );
      } else if (isMountedRef.current) {
        setApiError(raw || "Failed to trigger campaign processing queue");
      }
    } finally {
      if (isMountedRef.current) setSending(false);
    }
  };

  if (loadingAccounts || loadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-3">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-gray-500 text-sm font-semibold">
          {loadingAccounts ? "Loading WhatsApp accounts..." : "Loading template datasets..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky layout header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard/campaigns" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Create Campaign</h1>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                  {currentStep <= 4 && <span>Step {currentStep} of 4</span>}
                  <span>•</span>
                  <span className="flex items-center text-emerald-600"><Wifi className="w-3.5 h-3.5 mr-1" /> Connected</span>
                </div>
              </div>
            </div>
            {selectedTemplate && currentStep <= 4 && (
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Eye className="w-5 h-5" />
                <span className="text-sm font-semibold">Preview</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in slide-in-from-top-4 duration-200">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 font-bold text-sm">Error</p>
              <p className="text-red-600 text-sm font-semibold mt-0.5">{apiError}</p>
            </div>
            <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600 text-xl font-bold">×</button>
          </div>
        )}

        {/* Dynamic step progress indicators */}
        {currentStep <= 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => (
                <React.Fragment key={step.number}>
                  <div className="flex items-center select-none">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                                  ${step.number < currentStep
                          ? "bg-emerald-600 text-white"
                          : step.number === currentStep
                            ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                            : "bg-gray-200 text-gray-500"}`}
                    >
                      {step.number < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <span className={`ml-3 font-semibold hidden sm:inline ${step.number <= currentStep ? "text-gray-900" : "text-gray-400"}`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full ${step.number < currentStep ? "bg-emerald-600" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Forms box */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Campaign Details</h2>
                <p className="text-sm text-gray-400 font-semibold">Set up the foundational details for your bulk campaign.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Account *</label>
                  <select
                    value={selectedAccountId}
                    onChange={e => setSelectedAccountId(e.target.value)}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    {whatsappAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.displayName || "WhatsApp"} — {a.phoneNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Diwali Mega Sale"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="Brief notes about this campaign..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700">Message Template *</label>
                  <p className="text-xs text-gray-400 font-semibold">Only approved templates are shown</p>
                </div>
                {templates.length === 0 ? (
                  <div className="text-center py-8 bg-yellow-50 rounded-xl border border-yellow-200">
                    <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2 animate-bounce" />
                    <p className="text-yellow-800 font-bold">No approved templates found</p>
                    <p className="text-yellow-600 text-xs mt-1 font-semibold">
                      Create and get a template approved under{" "}
                      <Link to="/dashboard/templates/new" className="underline font-bold">Templates</Link> section.
                    </p>
                  </div>
                ) : (
                  <TemplateSelector
                    templates={templates}
                    selectedId={formData.templateId}
                    onSelect={t => setFormData(f => ({ ...f, templateId: t.id }))}
                    onPreview={() => setShowPreview(true)}
                  />
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Select Audience</h2>
                <p className="text-sm text-gray-400 font-semibold">Choose who should receive this campaign broadcast</p>
              </div>
              <AudienceSelector
                audienceType={formData.audienceType}
                onTypeChange={type => setFormData(f => ({ ...f, audienceType: type }))}
                selectedTags={formData.selectedTags}
                onTagsChange={tags => setFormData(f => ({ ...f, selectedTags: tags }))}
                selectedContacts={formData.selectedContacts}
                onContactsChange={c => setFormData(f => ({ ...f, selectedContacts: c }))}
                selectedGroup={formData.selectedGroup || ""}
                onGroupChange={g => { setFormData(f => ({ ...f, selectedGroup: g })); }}
                onGroupMemberCountChange={setGroupMemberCount}
                csvContacts={formData.csvContacts}
                onCsvContactsChange={c => setFormData(f => ({ ...f, csvContacts: c }))}
                availableTags={availableTags}
                contacts={contacts}
                totalSelected={totalRecipients}
                allContactsCount={totalAllContactsCount}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Map Variables</h2>
                <p className="text-sm text-gray-400 font-semibold">Personalize your templates variables parameters</p>
              </div>

              {(selectedTemplate?.variables?.length || 0) + (selectedTemplate?.headerVariables?.length || 0) > 0 ? (
                <VariableMapper
                  variables={[
                    ...(selectedTemplate?.variables || []),
                    ...(selectedTemplate?.headerVariables || []),
                  ]}
                  mapping={formData.variableMapping}
                  onMappingChange={m => setFormData(f => ({ ...f, variableMapping: m }))}
                />
              ) : (
                <div className="text-center py-10 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-sm animate-scale-in">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200"><Check className="w-8 h-8 text-emerald-600" /></div>
                  <p className="text-lg text-emerald-700 font-bold">No Variables Required</p>
                  <p className="text-emerald-600 mt-1 max-w-sm mx-auto text-xs font-semibold">This template configuration sends uniform static messages to all recipients.</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Schedule Campaign</h2>
                <p className="text-sm text-gray-400 font-semibold">Choose when to launch your broadcast queue</p>
              </div>

              <SchedulePicker
                scheduleType={formData.scheduleType}
                onTypeChange={t => setFormData(f => ({ ...f, scheduleType: t }))}
                scheduledDate={formData.scheduledDate || ""}
                scheduledTime={formData.scheduledTime || ""}
                onDateChange={d => setFormData(f => ({ ...f, scheduledDate: d }))}
                onTimeChange={t => setFormData(f => ({ ...f, scheduledTime: t }))}
              />

              {formData.scheduleType === "later" && formData.scheduledDate && formData.scheduledTime && (() => {
                const [year, month, day] = formData.scheduledDate.split('-').map(Number);
                const [hours, minutes] = formData.scheduledTime.split(':').map(Number);
                const scheduled = new Date(year, month - 1, day, hours, minutes, 0);
                return scheduled <= new Date();
              })() && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Scheduled execution time is mapped in the past. Please select a valid future time coordinates.
                  </div>
                )}

              {/* Summary card */}
              <div className="mt-6 p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-inner">
                <h3 className="text-base font-bold text-gray-900 mb-4">Campaign Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  {[
                    { label: "Campaign Name", value: formData.name || "Untitled" },
                    { label: "Template", value: selectedTemplate?.name || "Not selected" },
                    { label: "Recipients", value: `${totalRecipients.toLocaleString()} ${totalRecipients === 1 ? "recipient" : "recipients"}` },
                    { label: "Timing", value: formData.scheduleType === "now" ? "Send immediately" : `${formData.scheduledDate} at ${formData.scheduledTime}` },
                  ].map(item => (
                    <div key={item.label} className="bg-white p-4 rounded-xl border border-gray-200/50 shadow-sm">
                      <span className="text-gray-400 block mb-1 font-bold uppercase tracking-wider text-[9px]">{item.label}</span>
                      <p className="text-sm font-bold text-gray-800 truncate" title={item.value}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Confirm & Send</h2>
                <p className="text-sm text-gray-400 font-semibold">Review your balance deduction estimation parameters before confirming launch.</p>
              </div>

              {loadingEstimate ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-400 text-sm font-semibold">Calculating cost estimate...</p>
                  </div>
                </div>
              ) : walletEstimate ? (
                <div className="space-y-4">
                  {!walletEstimate.hasWallet || !walletEstimate.walletActive ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 shadow-sm">
                      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-bold text-sm">No wallet configured</p>
                        <p className="text-blue-700 text-xs mt-1 font-semibold">Charges will be applied directly to your Meta Business account matrix.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          {
                            label: "Available Balance",
                            value: `₹${walletEstimate.availableBalance.toFixed(2)}`,
                            color: "text-emerald-700",
                            bg: "bg-emerald-50 border-emerald-200",
                          },
                          {
                            label: "Estimated Cost",
                            value: `₹${walletEstimate.estimatedCost.toFixed(2)}`,
                            color: "text-blue-700",
                            bg: "bg-blue-50 border-blue-200",
                          },
                          {
                            label: "After Deduction",
                            value: `₹${Math.max(
                              0,
                              walletEstimate.availableBalance - walletEstimate.estimatedCost
                            ).toFixed(2)}`,
                            color: walletEstimate.canProceed ? "text-gray-700" : "text-red-700",
                            bg: walletEstimate.canProceed ? "bg-gray-50 border-gray-200" : "bg-red-50 border-red-200",
                          },
                        ].map(card => (
                          <div key={card.label} className={`p-4 rounded-xl border font-black ${card.bg}`}>
                            <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">{card.label}</p>
                            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                          </div>
                        ))}
                      </div>

                      {walletEstimate.estimatedCostBreakdown && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 space-y-2 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span>Recipients</span>
                            <span className="text-gray-800 font-bold">{walletEstimate.estimatedCostBreakdown.totalRecipients.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-gray-200/50 pt-2">
                            <span>Avg rate/message</span>
                            <span className="text-gray-800 font-bold">₹{walletEstimate.estimatedCostBreakdown.ratePerMessage.toFixed(4)}</span>
                          </div>
                        </div>
                      )}

                      {!walletEstimate.canProceed && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm animate-shake">
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-red-700 font-bold text-sm">Insufficient Balance</p>
                            <p className="text-red-600 text-xs mt-1 font-semibold">You need ₹{walletEstimate.shortfall.toFixed(2)} more to run this campaign. Please top up your wallet.</p>
                            <Link to="/dashboard/wallet" className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-red-600 hover:text-red-700 underline">
                              <Wallet className="w-4 h-4" /> Go to Wallet
                            </Link>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 font-bold">Campaign drafts initialized. Ready to execute.</div>
              )}
            </div>
          )}
        </div>

        {/* Buttons bottom row */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => { if (currentStep === 5) handleBack5(); else handleBack(); }}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-bold transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-bold transition-all shadow-md active:scale-95 disabled:shadow-none"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : currentStep === 4 ? (
            <button
              onClick={handleCreate}
              disabled={sending || !validateStep(currentStep)}
              className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-black transition-all shadow-md active:scale-95"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{formData.scheduleType === "now" ? "Review & Send" : "Schedule Campaign"}</span>
            </button>
          ) : (
            <button
              onClick={handleStartCampaign}
              disabled={sending || loadingEstimate || (walletEstimate?.hasWallet && walletEstimate?.walletActive && !walletEstimate?.canProceed)}
              className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-black transition-all shadow-md active:scale-95"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Confirm & Send</span>
            </button>
          )}
        </div>
      </div>

      {showPreview && selectedTemplate && (
        <TemplatePreview
          template={{
            name: selectedTemplate.name,
            category: selectedTemplate.category as any,
            language: selectedTemplate.language,
            header: mapHeaderForPreview(selectedTemplate.headerType, selectedTemplate.headerContent) as any,
            body: selectedTemplate.body,
            footer: "",
            buttons: selectedTemplate.buttons.map((b, i) => ({ id: String(i), type: "quick_reply" as const, text: b.text })),
          }}
          sampleVariables={formData.variableMapping}
          isModal
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CreateCampaign;