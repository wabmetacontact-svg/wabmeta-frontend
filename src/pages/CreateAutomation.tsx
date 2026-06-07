import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2, Loader2, MessageSquare, Users,
  Clock, Webhook, Tag, Send, Music, Video, Image, FileText,
  Layout, UserPlus, Layers, Settings, ChevronRight, Play
} from 'lucide-react';
import { automations as automationsApi, templates as templatesApi, contacts as contactsApi } from '../services/api';
import toast from 'react-hot-toast';
import PageSkeleton from '../components/common/PageSkeleton';

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

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/automations')}
            className="p-2 hover:bg-gray-150 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'Create Automation' : 'Edit Automation'}
            </h1>
            <p className="text-sm text-gray-550">Design your automated message sequence</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50 shadow-md active:scale-95 transition-all font-semibold"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Automation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              General Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Welcome Sequence"
                  className="w-full px-4 py-2.5 bg-white border border-gray-205 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this automation do?"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white border border-gray-250 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-150 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">Status</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none ${
                    formData.isActive ? 'bg-green-500' : 'bg-gray-250'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Targeting
             </h3>
             <p className="text-xs text-gray-500 mb-4">Select which contacts trigger this automation</p>

             <div className="space-y-4">
               <div>
                  <h4 className="text-xs font-bold text-gray-550 uppercase tracking-wider mb-2">Target Groups</h4>
                  <div className="flex flex-wrap gap-2">
                    {groups.map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          formData.targetGroupIds.includes(group.id)
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {group.name}
                      </button>
                    ))}
                  </div>
                  {groups.length === 0 && (
                    <p className="text-xs text-gray-500 italic mt-2">No groups found. Create groups in Contacts to target specific audiences.</p>
                  )}
               </div>

               {formData.trigger === 'UNKNOWN_MESSAGE' && (
                 <div className="pt-4 border-t border-gray-200">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.excludeExisting}
                          onChange={(e) => setFormData({ ...formData, excludeExisting: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors ${formData.excludeExisting ? 'bg-blue-600' : 'bg-gray-250'}`} />
                        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${formData.excludeExisting ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        Skip existing CRM contacts
                      </span>
                   </label>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Builder Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trigger Section */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-150">
              <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <div className="p-1.5 bg-blue-500 rounded-lg text-white">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                Automation Trigger
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {triggerOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.trigger === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, trigger: opt.value })}
                      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Trigger Config */}
              {formData.trigger === 'KEYWORD' && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Keyword(s)</label>
                  <input
                    type="text"
                    value={formData.triggerConfig.keywords?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      triggerConfig: { ...formData.triggerConfig, keywords: e.target.value.split(',').map(k => k.trim()) }
                    })}
                    placeholder="e.g., pricing, demo, help"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="exactMatch"
                      checked={formData.triggerConfig.exactMatch || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        triggerConfig: { ...formData.triggerConfig, exactMatch: e.target.checked }
                      })}
                      className="rounded text-blue-500"
                    />
                    <label htmlFor="exactMatch" className="text-xs font-medium text-gray-500 cursor-pointer">Exact match only</label>
                  </div>
                </div>
              )}

              {formData.trigger === 'SCHEDULE' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={formData.triggerConfig.time || '09:00'}
                      onChange={(e) => setFormData({
                        ...formData,
                        triggerConfig: { ...formData.triggerConfig, time: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Recursion</label>
                    <select
                      value={formData.triggerConfig.days || 'daily'}
                      onChange={(e) => setFormData({
                        ...formData,
                        triggerConfig: { ...formData.triggerConfig, days: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="daily">Every Day</option>
                      <option value="weekdays">Weekdays (M-F)</option>
                      <option value="weekends">Weekends (S-S)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 py-2">
              <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
              Response Workflow
            </h3>
            
            {actions.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                 </div>
                 <p className="font-bold text-gray-700">Your workflow is empty</p>
                 <p className="text-sm text-gray-500 max-w-xs mt-1 italic">Click "Add Action" below to start building your automated response sequence.</p>
              </div>
            ) : (
              <div className="space-y-4 relative">
                {/* Visual Line */}
                <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gray-200 -z-10" />
                
                {actions.map((action, index) => (
                  <ActionItem
                    key={action.id}
                    action={action}
                    index={index}
                    templates={templates}
                    onUpdate={updateAction}
                    onRemove={removeAction}
                  />
                ))}
              </div>
            )}

            {/* Add Action Button Group */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Available Actions</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {actionOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => addAction(opt.value)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-150 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group shadow-sm"
                    >
                      <div className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-650 text-center tracking-tight leading-tight group-hover:text-gray-900 transition-colors">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActionItemProps {
  action: Action;
  index: number;
  templates: any[];
  onUpdate: (id: string, config: any) => void;
  onRemove: (id: string) => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ action, index, templates, onUpdate, onRemove }) => {
  const config = action.config || {};
  const option = actionOptions.find((o) => o.value === action.type);
  const Icon = option?.icon || MessageSquare;

  return (
    <div className="flex gap-4 group animate-in slide-in-from-left-4 duration-500">
      <div className="flex-none">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-emerald-500/10">
          {index + 1}
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
        <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Icon className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">{option?.label}</h4>
          </div>
          <button
            onClick={() => onRemove(action.id)}
            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {action.type === 'send_text' && (
            <div>
              <label className="block text-xs font-bold text-gray-550 uppercase tracking-widest mb-1.5 ml-1">Message Body</label>
              <textarea
                value={config.text || ''}
                onChange={(e) => onUpdate(action.id, { ...config, text: e.target.value })}
                rows={3}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
              />
            </div>
          )}

          {action.type === 'send_template' && (
            <div>
              <label className="block text-xs font-bold text-gray-550 uppercase tracking-widest mb-1.5 ml-1">Select Template</label>
              <select
                value={config.templateId || ''}
                onChange={(e) => onUpdate(action.id, { ...config, templateId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
              >
                <option value="">-- Choose Template --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                ))}
              </select>
            </div>
          )}

          {(action.type === 'delay' || action.type === 'wait_for_response') && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-550 uppercase tracking-widest mb-1.5 ml-1">Value</label>
                <input
                  type="number"
                  value={config.value || 0}
                  onChange={(e) => onUpdate(action.id, { ...config, value: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-550 uppercase tracking-widest mb-1.5 ml-1">Unit</label>
                <select
                  value={config.unit || 'minutes'}
                  onChange={(e) => onUpdate(action.id, { ...config, unit: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          )}

          {action.type === 'add_tag' && (
             <div>
                <label className="block text-xs font-bold text-gray-550 uppercase tracking-widest mb-1.5 ml-1">Tag Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.tagName || ''}
                    onChange={(e) => onUpdate(action.id, { ...config, tagName: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900"
                    placeholder="e.g., hot_lead"
                  />
                  <div className="px-3 bg-blue-100 text-blue-600 rounded-xl flex items-center">
                    <Tag className="w-4 h-4" />
                  </div>
                </div>
             </div>
          )}

          {action.type === 'webhook' && (
            <div>
              <label className="block text-xs font-bold text-gray-550 uppercase tracking-widest mb-1.5 ml-1">Webhook URL (POST)</label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => onUpdate(action.id, { ...config, url: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                placeholder="https://your-api.com/webhooks"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAutomation;