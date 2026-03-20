import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2, Loader2, MessageSquare, Users,
  Clock, Webhook, Tag, Send, Music, Video, Image, FileText,
  Layout, UserPlus, Layers
} from 'lucide-react';
import { automations as automationsApi, templates as templatesApi, contacts as contactsApi } from '../services/api';
import toast from 'react-hot-toast';

interface Action {
  id: string;
  type: string;
  config: any;
}

interface ContactGroup {
  id: string;
  name: string;
  contactCount: number;
}

const triggerOptions = [
  { value: 'NEW_CONTACT', label: 'New Contact Added', icon: Users, description: 'When a new contact is created' },
  { value: 'KEYWORD', label: 'Keyword Match', icon: MessageSquare, description: 'When message contains keyword' },
  { value: 'UNKNOWN_MESSAGE', label: 'Unknown Contact', icon: UserPlus, description: 'When unknown number messages' },
  { value: 'SCHEDULE', label: 'Scheduled Time', icon: Clock, description: 'At a specific time' },
  { value: 'WEBHOOK', label: 'Webhook Received', icon: Webhook, description: 'When webhook is called' },
  { value: 'INACTIVITY', label: 'Contact Inactivity', icon: Clock, description: 'After period of no messages' },
];

const actionOptions = [
  { value: 'send_text', label: 'Send Text Message', icon: MessageSquare },
  { value: 'send_template', label: 'Send Template', icon: Send },
  { value: 'send_audio', label: 'Send Audio', icon: Music },
  { value: 'send_video', label: 'Send Video', icon: Video },
  { value: 'send_image', label: 'Send Image', icon: Image },
  { value: 'send_document', label: 'Send Document', icon: FileText },
  { value: 'send_buttons', label: 'Send Buttons (CTA)', icon: Layout },
  { value: 'wait_for_response', label: 'Wait for Response', icon: Clock },
  { value: 'delay', label: 'Wait/Delay', icon: Clock },
  { value: 'add_tag', label: 'Add Tag', icon: Tag },
  { value: 'add_to_group', label: 'Add to Group', icon: Layers },
  { value: 'create_lead', label: 'Create CRM Lead', icon: Users },
  { value: 'webhook', label: 'Call Webhook', icon: Webhook },
];

const CreateAutomation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'UNKNOWN_MESSAGE',
    triggerConfig: {} as any,
    isActive: false,
    targetGroupIds: [] as string[],
    excludeExisting: true,
  });

  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    loadData();
    if (!isNew && id) loadAutomation();
  }, [id]);

  const loadData = async () => {
    try {
      const [templatesRes, groupsRes] = await Promise.all([
        templatesApi.getAll({}),
        contactsApi.getGroups(),
      ]);
      if (templatesRes.data.success) setTemplates(templatesRes.data.data || []);
      if (groupsRes.data.success) setGroups(groupsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load data');
    }
  };

  const loadAutomation = async () => {
    try {
      const res = await automationsApi.getById(id!);
      if (res.data.success) {
        const data = res.data.data;
        setFormData({
          name: data.name,
          description: data.description || '',
          trigger: data.trigger,
          triggerConfig: data.triggerConfig || {},
          isActive: data.isActive,
          targetGroupIds: data.targetGroupIds || [],
          excludeExisting: data.excludeExisting ?? true,
        });
        setActions(data.actions || []);
      }
    } catch (err) {
      toast.error('Failed to load automation');
      navigate('/dashboard/automations');
    } finally {
      setLoading(false);
    }
  };

  const addAction = (type: string) => {
    const newAction: Action = {
      id: `action-${Date.now()}`,
      type,
      config: type === 'send_buttons' ? { buttons: [] } : {},
    };
    setActions([...actions, newAction]);
  };

  const updateAction = (actionId: string, config: any) => {
    setActions(actions.map((a) => (a.id === actionId ? { ...a, config } : a)));
  };

  const removeAction = (actionId: string) => {
    setActions(actions.filter((a) => a.id !== actionId));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Automation name is required');
      return;
    }

    if (actions.length === 0) {
      toast.error('Add at least one action');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData, actions };

      if (isNew) {
        await automationsApi.create(payload);
        toast.success('Automation created');
      } else {
        await automationsApi.update(id!, payload);
        toast.success('Automation updated');
      }
      navigate('/dashboard/automations');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setFormData((prev) => ({
      ...prev,
      targetGroupIds: prev.targetGroupIds.includes(groupId)
        ? prev.targetGroupIds.filter((id) => id !== groupId)
        : [...prev.targetGroupIds, groupId],
    }));
  };

  const renderTriggerConfig = () => {
    return (
      <>
        {/* ✅ GROUP SELECTION */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Target Groups (Optional)
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Leave empty to apply to all contacts. Select groups to limit automation.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                  formData.targetGroupIds.includes(group.id)
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="truncate">{group.name}</span>
                <span className="text-xs text-gray-400">({group.contactCount})</span>
              </button>
            ))}
          </div>

          {groups.length === 0 && (
            <p className="text-sm text-gray-400 italic">No groups found</p>
          )}
        </div>

        {/* ✅ EXCLUDE EXISTING TOGGLE */}
        {formData.trigger === 'UNKNOWN_MESSAGE' && (
          <div className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="excludeExisting"
              checked={formData.excludeExisting}
              onChange={(e) => setFormData({ ...formData, excludeExisting: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="excludeExisting" className="text-sm">
              Skip if contact already exists in CRM
            </label>
          </div>
        )}

        {/* TRIGGER SPECIFIC CONFIG */}
        {formData.trigger === 'KEYWORD' && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Keywords (comma separated)</label>
              <input
                type="text"
                value={formData.triggerConfig.keywords?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    triggerConfig: {
                      ...formData.triggerConfig,
                      keywords: e.target.value.split(',').map((k) => k.trim()),
                    },
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., hello, hi, start"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="exactMatch"
                checked={formData.triggerConfig.exactMatch || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    triggerConfig: { ...formData.triggerConfig, exactMatch: e.target.checked },
                  })
                }
                className="rounded"
              />
              <label htmlFor="exactMatch" className="text-sm">
                Exact match only
              </label>
            </div>
          </div>
        )}

        {formData.trigger === 'SCHEDULE' && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                value={formData.triggerConfig.time || '09:00'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    triggerConfig: { ...formData.triggerConfig, time: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Days</label>
              <select
                value={formData.triggerConfig.days || 'daily'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    triggerConfig: { ...formData.triggerConfig, days: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="daily">Every Day</option>
                <option value="weekdays">Weekdays Only</option>
                <option value="weekends">Weekends Only</option>
              </select>
            </div>
          </div>
        )}

        {formData.trigger === 'INACTIVITY' && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Inactive for (hours)</label>
            <input
              type="number"
              value={formData.triggerConfig.hours || 24}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  triggerConfig: { ...formData.triggerConfig, hours: Number(e.target.value) },
                })
              }
              className="w-full px-3 py-2 border rounded-lg"
              min={1}
              max={168}
            />
          </div>
        )}
      </>
    );
  };

  const renderActionConfig = (action: Action) => {
    switch (action.type) {
      case 'send_text':
      case 'send_message':
        return (
          <div className="mt-2">
            <textarea
              value={action.config.text || action.config.message || ''}
              onChange={(e) => updateAction(action.id, { text: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Enter message... Use {{firstName}}, {{phone}} for variables"
            />
          </div>
        );

      case 'send_audio':
        return (
          <div className="mt-2">
            <input
              type="url"
              value={action.config.audioUrl || ''}
              onChange={(e) => updateAction(action.id, { audioUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://example.com/audio.mp3"
            />
            <p className="text-xs text-gray-500 mt-1">Supported: MP3, OGG, AAC (max 16MB)</p>
          </div>
        );

      case 'send_video':
        return (
          <div className="mt-2 space-y-2">
            <input
              type="url"
              value={action.config.videoUrl || ''}
              onChange={(e) => updateAction(action.id, { ...action.config, videoUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://example.com/video.mp4"
            />
            <input
              type="text"
              value={action.config.caption || ''}
              onChange={(e) => updateAction(action.id, { ...action.config, caption: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Caption (optional)"
            />
            <p className="text-xs text-gray-500">Supported: MP4, 3GPP (max 16MB)</p>
          </div>
        );

      case 'send_image':
        return (
          <div className="mt-2 space-y-2">
            <input
              type="url"
              value={action.config.imageUrl || ''}
              onChange={(e) => updateAction(action.id, { ...action.config, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://example.com/image.jpg"
            />
            <input
              type="text"
              value={action.config.caption || ''}
              onChange={(e) => updateAction(action.id, { ...action.config, caption: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Caption (optional)"
            />
          </div>
        );

      case 'send_document':
        return (
          <div className="mt-2 space-y-2">
            <input
              type="url"
              value={action.config.documentUrl || ''}
              onChange={(e) => updateAction(action.id, { ...action.config, documentUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://example.com/document.pdf"
            />
            <input
              type="text"
              value={action.config.caption || ''}
              onChange={(e) => updateAction(action.id, { ...action.config, caption: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Caption (optional)"
            />
          </div>
        );

      case 'send_buttons':
        return (
          <div className="mt-2 space-y-3">
            <textarea
              value={action.config.text || ''}
              onChange={(e) => updateAction(action.id, { ...action.config, text: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
              placeholder="Message before buttons..."
            />

            <div className="space-y-2">
              {(action.config.buttons || []).map((btn: any, i: number) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={btn.id || ''}
                    onChange={(e) => {
                      const newButtons = [...(action.config.buttons || [])];
                      newButtons[i] = { ...newButtons[i], id: e.target.value };
                      updateAction(action.id, { ...action.config, buttons: newButtons });
                    }}
                    className="w-24 px-2 py-2 border rounded-lg text-sm"
                    placeholder="ID"
                  />
                  <input
                    type="text"
                    value={btn.text || ''}
                    onChange={(e) => {
                      const newButtons = [...(action.config.buttons || [])];
                      newButtons[i] = { ...newButtons[i], text: e.target.value };
                      updateAction(action.id, { ...action.config, buttons: newButtons });
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder={`Button ${i + 1} text (max 20 chars)`}
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newButtons = action.config.buttons.filter((_: any, idx: number) => idx !== i);
                      updateAction(action.id, { ...action.config, buttons: newButtons });
                    }}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {(action.config.buttons?.length || 0) < 3 && (
                <button
                  type="button"
                  onClick={() => {
                    const newButtons = [
                      ...(action.config.buttons || []),
                      { id: `btn_${Date.now()}`, text: '' },
                    ];
                    updateAction(action.id, { ...action.config, buttons: newButtons });
                  }}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500"
                >
                  + Add Button (max 3)
                </button>
              )}
            </div>
          </div>
        );

      case 'wait_for_response':
        return (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={action.config.buttonIds?.join(', ') || ''}
              onChange={(e) =>
                updateAction(action.id, {
                  ...action.config,
                  buttonIds: e.target.value.split(',').map((s) => s.trim()),
                })
              }
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Button IDs to wait for (comma separated)"
            />
            <p className="text-xs text-gray-500">
              ⏸️ Sequence pauses until user clicks matching button
            </p>
          </div>
        );

      case 'send_template':
        return (
          <select
            value={action.config.templateId || ''}
            onChange={(e) => updateAction(action.id, { templateId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg mt-2"
          >
            <option value="">Select template...</option>
            {templates.filter((t) => t.status === 'APPROVED').map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.language})
              </option>
            ))}
          </select>
        );

      case 'add_tag':
        return (
          <input
            type="text"
            value={action.config.tag || ''}
            onChange={(e) => updateAction(action.id, { tag: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg mt-2"
            placeholder="Enter tag name..."
          />
        );

      case 'add_to_group':
        return (
          <select
            value={action.config.groupId || ''}
            onChange={(e) => updateAction(action.id, { groupId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg mt-2"
          >
            <option value="">Select group...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        );

      case 'delay':
        return (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              value={action.config.duration || 1}
              onChange={(e) =>
                updateAction(action.id, { ...action.config, duration: Number(e.target.value) })
              }
              className="w-24 px-3 py-2 border rounded-lg"
              min={1}
            />
            <select
              value={action.config.unit || 'seconds'}
              onChange={(e) => updateAction(action.id, { ...action.config, unit: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </div>
        );

      case 'webhook':
        return (
          <input
            type="url"
            value={action.config.url || ''}
            onChange={(e) => updateAction(action.id, { url: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg mt-2"
            placeholder="https://..."
          />
        );

      case 'create_lead':
        return (
          <input
            type="text"
            value={action.config.title || ''}
            onChange={(e) => updateAction(action.id, { title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg mt-2"
            placeholder="Lead title (optional)"
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/automations')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isNew ? 'Create Automation' : 'Edit Automation'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Set up automated message sequences
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Automation
        </button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                placeholder="e.g., Welcome New Leads"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm">
                  Active (Enable automation)
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                rows={2}
                placeholder="What does this automation do?"
              />
            </div>
          </div>
        </div>

        {/* Trigger */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">When to Trigger</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {triggerOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, trigger: option.value, triggerConfig: {} })
                }
                className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                  formData.trigger === option.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    formData.trigger === option.value
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
          {renderTriggerConfig()}
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Actions (Sequence)</h2>

          <div className="space-y-3 mb-4">
            {actions.map((action, index) => {
              const actionOption = actionOptions.find((o) => o.value === action.type);
              return (
                <div
                  key={action.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        {actionOption && <actionOption.icon className="w-4 h-4 text-gray-500" />}
                        <span className="font-medium">{actionOption?.label || action.type}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAction(action.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {renderActionConfig(action)}
                </div>
              );
            })}
          </div>

          {/* Add Action Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const menu = document.getElementById('action-menu');
                menu?.classList.toggle('hidden');
              }}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-green-500 hover:text-green-600 w-full justify-center transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Action Step
            </button>
            <div
              id="action-menu"
              className="hidden absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl py-2 max-h-64 overflow-y-auto"
            >
              {actionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    addAction(option.value);
                    document.getElementById('action-menu')?.classList.add('hidden');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-600 text-left"
                >
                  <option.icon className="w-4 h-4 text-gray-500" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAutomation;