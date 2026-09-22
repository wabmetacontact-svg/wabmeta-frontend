// src/components/automation/StepConfigs.tsx
//
// Settings forms for automation pieces the builder offered without a form:
// the Image / Video trigger, Send Buttons, Create CRM Lead and Add to Group.
// Field names match what the backend reads (automation.engine and
// automation.media).

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const labelCls = 'block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1';
const inputCls =
  'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900';
const hintCls = 'text-xs text-gray-500 mt-1.5 ml-1';

type OnChange = (next: any) => void;

export const VARIABLES_HINT = 'Variables: {{name}}, {{firstName}}, {{phone}}, {{message}}, {{caption}}, {{media_type}}';

// ─── Trigger: Image / Video received ───────────────────────────────────────

const MEDIA_CHOICES = [
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'DOCUMENT', label: 'Document / PDF' },
  { value: 'AUDIO', label: 'Audio / voice note' },
];

export const MediaTriggerConfig: React.FC<{ config: any; onChange: OnChange }> = ({ config, onChange }) => {
  const selected: string[] = Array.isArray(config.mediaTypes) && config.mediaTypes.length ? config.mediaTypes : ['IMAGE', 'VIDEO'];
  // Raw text kept separately so typing a comma is not eaten on every keystroke.
  const [keywords, setKeywords] = useState<string>((config.captionKeywords || []).join(', '));

  const toggle = (value: string) => {
    const next = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
    onChange({ ...config, mediaTypes: next.length ? next : [value] });
  };

  return (
    <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
      <div>
        <p className={labelCls}>When the customer sends</p>
        <div className="flex flex-wrap gap-2">
          {MEDIA_CHOICES.map((m) => (
            <label
              key={m.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer ${
                selected.includes(m.value) ? 'border-blue-500 bg-white text-blue-900' : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <input type="checkbox" checked={selected.includes(m.value)} onChange={() => toggle(m.value)} />
              {m.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="media-caption-keywords" className={labelCls}>Only if the caption contains (optional)</label>
        <input
          id="media-caption-keywords"
          value={keywords}
          onChange={(e) => {
            setKeywords(e.target.value);
            onChange({
              ...config,
              mediaTypes: selected,
              captionKeywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
            });
          }}
          placeholder="e.g. payment, receipt, order"
          className={inputCls}
        />
        <p className={hintCls}>
          Leave empty to run for every matching photo or video. With words set, media without a caption does not run it.
          Use {'{{caption}}'} and {'{{media_type}}'} in your messages.
        </p>
      </div>
    </div>
  );
};

// ─── Action: Send Buttons ──────────────────────────────────────────────────

export const ButtonsConfig: React.FC<{ config: any; onChange: OnChange }> = ({ config, onChange }) => {
  const mode: 'reply' | 'url' = config.mode === 'url' ? 'url' : 'reply';
  const buttons: { id?: string; text: string }[] = config.buttons || [];

  const setButton = (i: number, text: string) =>
    onChange({ ...config, buttons: buttons.map((b, j) => (j === i ? { ...b, text } : b)) });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {([
          ['reply', 'Quick reply buttons (up to 3)'],
          ['url', 'Link button (opens a URL)'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange({ ...config, mode: value })}
            className={`flex-1 px-3 py-2 rounded-xl border text-sm ${
              mode === value ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium' : 'border-gray-200 text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="buttons-header" className={labelCls}>Header (optional)</label>
        <input id="buttons-header" maxLength={60} value={config.header || ''} onChange={(e) => onChange({ ...config, header: e.target.value })} className={inputCls} placeholder="e.g. Order update" />
      </div>
      <div>
        <label htmlFor="buttons-body" className={labelCls}>Message</label>
        <textarea
          id="buttons-body"
          rows={3}
          maxLength={1024}
          value={config.text || ''}
          onChange={(e) => onChange({ ...config, text: e.target.value })}
          placeholder="Hi {{name}}, what would you like to do?"
          className={inputCls}
        />
        <p className={hintCls}>{VARIABLES_HINT}</p>
      </div>

      {mode === 'reply' ? (
        <div className="space-y-2">
          <p className={labelCls}>Buttons</p>
          {buttons.map((b, i) => (
            <div key={i} className="flex gap-2">
              <input
                aria-label={`Button ${i + 1}`}
                maxLength={20}
                value={b.text || ''}
                onChange={(e) => setButton(i, e.target.value)}
                placeholder={`Button ${i + 1} (max 20 characters)`}
                className={inputCls}
              />
              <button
                type="button"
                aria-label={`Remove button ${i + 1}`}
                onClick={() => onChange({ ...config, buttons: buttons.filter((_, j) => j !== i) })}
                className="px-3 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {buttons.length < 3 && (
            <button
              type="button"
              onClick={() => onChange({ ...config, buttons: [...buttons, { id: `btn_${Date.now().toString(36)}`, text: '' }] })}
              className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Add button
            </button>
          )}
          <p className={hintCls}>
            A tap comes back as the customer's reply - add a "Wait for Reply" step next to act on it.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="buttons-url-text" className={labelCls}>Button text</label>
            <input id="buttons-url-text" maxLength={20} value={config.urlText || ''} onChange={(e) => onChange({ ...config, urlText: e.target.value })} className={inputCls} placeholder="e.g. Pay now" />
          </div>
          <div>
            <label htmlFor="buttons-url" className={labelCls}>Link</label>
            <input id="buttons-url" type="url" value={config.url || ''} onChange={(e) => onChange({ ...config, url: e.target.value })} className={inputCls} placeholder="https://..." />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="buttons-footer" className={labelCls}>Footer (optional)</label>
        <input id="buttons-footer" maxLength={60} value={config.footer || ''} onChange={(e) => onChange({ ...config, footer: e.target.value })} className={inputCls} placeholder="e.g. Reply STOP to opt out" />
      </div>
    </div>
  );
};

/** What is missing from a buttons step, or null. Mirrors the backend check. */
export const buttonsProblem = (config: any): string | null => {
  if (!String(config?.text || '').trim()) return 'Send Buttons: write the message';
  if (config?.mode === 'url') {
    return /^https?:\/\/\S+$/i.test(String(config.url || '').trim()) ? null : 'Send Buttons: add a link starting with https://';
  }
  const titles = (config?.buttons || []).map((b: any) => String(b.text || '').trim()).filter(Boolean);
  if (titles.length === 0) return 'Send Buttons: add at least one button';
  if (new Set(titles.map((t: string) => t.toLowerCase())).size !== titles.length) return 'Send Buttons: two buttons have the same text';
  return null;
};

// ─── Action: Create CRM Lead ───────────────────────────────────────────────

export const CreateLeadConfig: React.FC<{ config: any; onChange: OnChange; pipelines: any[] }> = ({ config, onChange, pipelines }) => {
  const pipeline = pipelines.find((p) => p.id === config.pipelineId) || pipelines.find((p) => p.isDefault) || pipelines[0];
  const stages: any[] = pipeline?.stages || [];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="lead-title" className={labelCls}>Lead title (optional)</label>
        <input id="lead-title" maxLength={200} value={config.title || ''} onChange={(e) => onChange({ ...config, title: e.target.value })} className={inputCls} placeholder="e.g. {{name}} - sent a photo" />
        <p className={hintCls}>Empty = the contact's name. {VARIABLES_HINT}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="lead-pipeline" className={labelCls}>Pipeline</label>
          <select
            id="lead-pipeline"
            value={pipeline?.id || ''}
            onChange={(e) => onChange({ ...config, pipelineId: e.target.value || undefined, stageId: undefined })}
            className={inputCls}
          >
            {pipelines.length === 0 && <option value="">Default pipeline</option>}
            {pipelines.map((p) => <option key={p.id} value={p.id}>{p.name}{p.isDefault ? ' (default)' : ''}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lead-stage" className={labelCls}>Stage</label>
          <select id="lead-stage" value={config.stageId || ''} onChange={(e) => onChange({ ...config, pipelineId: pipeline?.id, stageId: e.target.value || undefined })} className={inputCls}>
            <option value="">First stage</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lead-value" className={labelCls}>Deal value ₹ (optional)</label>
          <input id="lead-value" type="number" min={0} value={config.value ?? ''} onChange={(e) => onChange({ ...config, value: e.target.value === '' ? undefined : Number(e.target.value) })} className={inputCls} placeholder="e.g. 2999" />
        </div>
        <div>
          <label htmlFor="lead-priority" className={labelCls}>Priority</label>
          <select id="lead-priority" value={config.priority || ''} onChange={(e) => onChange({ ...config, priority: e.target.value || undefined })} className={inputCls}>
            <option value="">Default</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="lead-notes" className={labelCls}>Note on the lead (optional)</label>
        <input id="lead-notes" value={config.notes || ''} onChange={(e) => onChange({ ...config, notes: e.target.value })} className={inputCls} placeholder="e.g. Sent: {{caption}}" />
      </div>
      <div>
        <label htmlFor="lead-ifexists" className={labelCls}>If the contact already has an open lead</label>
        <select id="lead-ifexists" value={config.ifExists || 'skip'} onChange={(e) => onChange({ ...config, ifExists: e.target.value })} className={inputCls}>
          <option value="skip">Leave it as it is</option>
          <option value="move_stage">Move it to the stage above</option>
        </select>
        <p className={hintCls}>A contact never gets two open leads. The lead is assigned and announced like any other new lead.</p>
      </div>
    </div>
  );
};

// ─── Action: Add to Group ──────────────────────────────────────────────────

export const AddToGroupConfig: React.FC<{ config: any; onChange: OnChange; groups: { id: string; name: string }[] }> = ({ config, onChange, groups }) => (
  <div>
    <label htmlFor="add-group" className={labelCls}>Group</label>
    <select id="add-group" value={config.groupId || ''} onChange={(e) => onChange({ ...config, groupId: e.target.value || undefined })} className={inputCls}>
      <option value="">-- Choose group --</option>
      {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
    </select>
  </div>
);
