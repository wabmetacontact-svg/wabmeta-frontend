import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { instagram } from '../../services/api';
import { useModalA11y } from '../../hooks/useModalA11y';

type IgTriggerType = 'KEYWORD' | 'DM_RECEIVED' | 'STORY_REPLY' | 'COMMENT_TO_DM';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Called after the rule is created, so the list can refresh. */
  onCreated: () => void;
}

const TRIGGERS: { value: IgTriggerType; label: string; hint: string }[] = [
  { value: 'KEYWORD', label: 'Keyword', hint: 'Reply when a DM contains one of your keywords.' },
  { value: 'DM_RECEIVED', label: 'Any DM', hint: 'Reply to every new DM.' },
  { value: 'STORY_REPLY', label: 'Story reply', hint: 'Reply when someone answers your story.' },
  { value: 'COMMENT_TO_DM', label: 'Comment → DM', hint: 'DM someone who comments on a post.' },
];

const CreateDmRuleModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  const panelRef = useModalA11y(isOpen, onClose);
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<IgTriggerType>('KEYWORD');
  const [keywords, setKeywords] = useState('');
  const [matchType, setMatchType] = useState<'contains' | 'exact' | 'starts_with'>('contains');
  const [responseText, setResponseText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setName('');
    setTriggerType('KEYWORD');
    setKeywords('');
    setMatchType('contains');
    setResponseText('');
    setError(null);
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedKeywords = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (!name.trim()) return setError('Give the rule a name.');
    if (!responseText.trim()) return setError('Write the reply this rule should send.');
    if (triggerType === 'KEYWORD' && parsedKeywords.length === 0) {
      return setError('Add at least one keyword, separated by commas.');
    }

    setSaving(true);
    setError(null);
    try {
      await instagram.createAutomation({
        name: name.trim(),
        triggerType,
        keywords: parsedKeywords,
        matchType,
        responseText: responseText.trim(),
      });
      reset();
      onCreated();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Could not create the rule. Check that an Instagram account is connected.'
      );
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#e1306c] focus:border-transparent outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={close} />

      <div
        ref={panelRef}
        className="relative w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">New DM rule</h2>
            <p className="mt-1 text-sm text-gray-500">
              Rules run on your connected Instagram account.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="ml-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#e1306c] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="rule-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Rule name
            </label>
            <input
              id="rule-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pricing enquiry"
              className={field}
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-1.5">Trigger</legend>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGERS.map((t) => (
                <label
                  key={t.value}
                  className={`p-3 border rounded-xl cursor-pointer transition-colors ${
                    triggerType === t.value
                      ? 'border-[#e1306c] bg-pink-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="trigger"
                    value={t.value}
                    checked={triggerType === t.value}
                    onChange={() => setTriggerType(t.value)}
                    className="sr-only"
                  />
                  <span className="block text-sm font-medium text-gray-900">{t.label}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{t.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {triggerType === 'KEYWORD' && (
            <>
              <div>
                <label htmlFor="rule-keywords" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Keywords
                </label>
                <input
                  id="rule-keywords"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="price, cost, how much"
                  className={field}
                />
                <p className="mt-1 text-xs text-gray-500">Separate keywords with commas.</p>
              </div>

              <div>
                <label htmlFor="rule-match" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Match
                </label>
                <select
                  id="rule-match"
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value as typeof matchType)}
                  className={field}
                >
                  <option value="contains">Message contains the keyword</option>
                  <option value="exact">Message is exactly the keyword</option>
                  <option value="starts_with">Message starts with the keyword</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label htmlFor="rule-response" className="block text-sm font-medium text-gray-700 mb-1.5">
              Auto-reply
            </label>
            <textarea
              id="rule-response"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
              placeholder="Hi! Our plans start at ₹899/month. Want the details?"
              className={`${field} resize-none`}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
              }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Creating…' : 'Create rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDmRuleModal;
