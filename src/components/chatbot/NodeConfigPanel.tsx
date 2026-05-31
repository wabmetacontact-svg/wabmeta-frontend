import React from 'react';
import { X, Trash2, Plus, Info, Sparkles } from 'lucide-react';
import type { Node } from 'reactflow';

interface Props {
  node: Node;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onClose: () => void;
}

const NodeConfigPanel: React.FC<Props> = ({ node, onUpdate, onDelete, onClose }) => {
  const renderConfig = () => {
    switch (node.type) {

      // ─────────────────────────────────
      case 'start':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                The flow starts here. Set trigger keywords in chatbot settings.
              </p>
            </div>
          </div>
        );

      // ─────────────────────────────────
      case 'message':
        const msgType = node.data.messageType || 'text';
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Message Type
              </label>
              <select
                value={msgType}
                onChange={(e) => onUpdate({ messageType: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white mb-4"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
              </select>

              {msgType !== 'text' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Media URL
                  </label>
                  <input
                    type="url"
                    value={node.data.mediaUrl || ''}
                    onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/media.jpg"
                  />
                </div>
              )}

              <label className="block text-sm font-medium mb-1 text-gray-300">
                {msgType === 'text' ? 'Message Text' : 'Media Caption (Optional)'}
              </label>
              <textarea
                value={node.data.message || ''}
                onChange={(e) => onUpdate({ message: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] rounded-lg resize-none h-32 text-sm bg-[#0a0e27] dark:bg-gray-700 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={msgType === 'text' ? "Enter your message..." : "Enter caption..."}
              />
              <div className="mt-2 p-2 bg-[#0a0e27]/[0.02] rounded text-xs">
                <p className="font-medium text-gray-400 mb-1">
                  📝 Variables use kar sakte ho:
                </p>
                <div className="flex flex-wrap gap-1">
                  {['{{phone}}', '{{lastInput}}', '{{selectedButton}}', 
                    '{{selectedOption}}', '{{userName}}'].map(v => (
                    <code key={v} className="bg-[#0a0e27] dark:bg-gray-600 border border-white/[0.1] dark:border-gray-500 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded text-[10px]">
                      {v}
                    </code>
                  ))}
                </div>
              </div>
            </div>

            {/* Wait for user reply toggle */}
            <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-3 bg-orange-50 dark:bg-orange-900/20">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={!!node.data.waitForInput}
                    onChange={(e) => onUpdate({ waitForInput: e.target.checked })}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${
                      node.data.waitForInput ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-[#0a0e27] rounded-full shadow transition-transform ${
                        node.data.waitForInput ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Wait for user reply
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                    ON: Pause after sending message and wait for user's reply<br/>
                    OFF: Automatically advance to the next node (default)
                  </p>
                </div>
              </label>
            </div>
          </div>
        );

      // ─────────────────────────────────
      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Message
              </label>
              <textarea
                value={node.data.message || ''}
                onChange={(e) => onUpdate({ message: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] rounded-lg resize-none h-20 text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                placeholder="Choose an option:"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Buttons (max 3)
              </label>
              <div className="space-y-2">
                {(node.data.buttons || []).map((btn: any, i: number) => (
                  <div key={btn.id || i} className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                    <input
                      type="text"
                      value={btn.text}
                      maxLength={20}
                      onChange={(e) => {
                        const newButtons = [...(node.data.buttons || [])];
                        newButtons[i] = { ...newButtons[i], text: e.target.value };
                        onUpdate({ buttons: newButtons });
                      }}
                      className="flex-1 px-3 py-1.5 border border-white/[0.12] rounded text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                      placeholder={`Button ${i + 1} text`}
                    />
                    <button
                      onClick={() => {
                        const newButtons = (node.data.buttons || []).filter(
                          (_: any, idx: number) => idx !== i
                        );
                        onUpdate({ buttons: newButtons });
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {(node.data.buttons || []).length < 3 && (
                  <button
                    onClick={() => {
                      const newButtons = [
                        ...(node.data.buttons || []),
                        { id: `btn-${Date.now()}`, text: '' },
                      ];
                      onUpdate({ buttons: newButtons });
                    }}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 mt-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Button
                  </button>
                )}
              </div>

              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-600 dark:text-blue-300">
                <Info className="w-3 h-3 inline mr-1" />
                Connect a separate edge for each button
              </div>
            </div>
          </div>
        );

      // ─────────────────────────────────
      case 'list':
        const sections = node.data.listSections || [{ title: 'Section 1', rows: [{ id: `row-${Date.now()}`, title: 'Option 1' }] }];
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Message Body
              </label>
              <textarea
                value={node.data.message || ''}
                onChange={(e) => onUpdate({ message: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] rounded-lg resize-none h-16 text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                placeholder="Please select an option:"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Menu Button Text (max 20 chars)
              </label>
              <input
                type="text"
                value={node.data.listButtonText || 'View Options'}
                maxLength={20}
                onChange={(e) => onUpdate({ listButtonText: e.target.value })}
                className="w-full px-3 py-1.5 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                List Sections (max 10)
              </label>
              <div className="space-y-4">
                {sections.map((sec: any, sIdx: number) => (
                  <div key={sIdx} className="p-3 border border-white/[0.1] dark:border-gray-600 rounded-lg bg-[#0a0e27]/[0.02]">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={sec.title || ''}
                        maxLength={24}
                        placeholder="Section Title"
                        onChange={(e) => {
                          const newSecs = [...sections];
                          newSecs[sIdx].title = e.target.value;
                          onUpdate({ listSections: newSecs });
                        }}
                        className="flex-1 px-2 py-1 border border-white/[0.12] rounded text-sm font-medium bg-[#0a0e27] dark:bg-gray-700 text-white"
                      />
                      <button
                        onClick={() => {
                          const newSecs = sections.filter((_: any, i: number) => i !== sIdx);
                          onUpdate({ listSections: newSecs });
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(sec.rows || []).map((row: any, rIdx: number) => (
                        <div key={rIdx} className="relative pl-2 border-l-2 border-indigo-200 dark:border-indigo-600">
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="text"
                              value={row.title || ''}
                              maxLength={24}
                              placeholder="Row Title"
                              onChange={(e) => {
                                const newSecs = [...sections];
                                newSecs[sIdx].rows[rIdx].title = e.target.value;
                                onUpdate({ listSections: newSecs });
                              }}
                              className="flex-1 px-2 py-1 border border-white/[0.12] rounded text-xs bg-[#0a0e27] dark:bg-gray-700 text-white"
                            />
                            <button
                              onClick={() => {
                                const newSecs = [...sections];
                                newSecs[sIdx].rows = newSecs[sIdx].rows.filter((_: any, i: number) => i !== rIdx);
                                onUpdate({ listSections: newSecs });
                              }}
                              className="text-red-400 hover:text-red-500 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={row.description || ''}
                            maxLength={72}
                            placeholder="Description (Optional)"
                            onChange={(e) => {
                              const newSecs = [...sections];
                              newSecs[sIdx].rows[rIdx].description = e.target.value;
                              onUpdate({ listSections: newSecs });
                            }}
                            className="w-full px-2 py-1 border border-white/[0.12] rounded text-xs bg-[#0a0e27] dark:bg-gray-700 text-gray-400"
                          />
                        </div>
                      ))}
                    </div>
                    {(sec.rows || []).length < 10 && (
                      <button
                        onClick={() => {
                          const newSecs = [...sections];
                          if (!newSecs[sIdx].rows) newSecs[sIdx].rows = [];
                          newSecs[sIdx].rows.push({ id: `row-${Date.now()}-${Math.random()}`, title: 'New Option' });
                          onUpdate({ listSections: newSecs });
                        }}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-2"
                      >
                        <Plus className="w-3 h-3" /> Add Row
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {sections.length < 10 && (
                <button
                  onClick={() => {
                    const newSecs = [...sections, { title: `Section ${sections.length + 1}`, rows: [] }];
                    onUpdate({ listSections: newSecs });
                  }}
                  className="flex items-center justify-center w-full gap-1 p-2 border-2 border-dashed border-white/[0.12] rounded-lg text-sm text-gray-500 hover:text-gray-300 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 mt-3"
                >
                  <Plus className="w-4 h-4" /> Add Section
                </button>
              )}
            </div>
          </div>
        );

      // ─────────────────────────────────
      case 'ai':
        return (
          <div className="space-y-4">
            {/* Conversation Mode Info */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Conversation Mode</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    AI will automatically keep conversing with the user. Every message will get an AI response and the conversation will continue.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI System Prompt
              </label>
              <textarea
                value={node.data.systemPrompt || ''}
                onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] rounded-lg resize-none h-40 text-sm bg-[#0a0e27] dark:bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ex: You are a helpful customer support agent. Answer questions politely in Hindi."
              />
              <p className="text-xs text-gray-500 mt-1">
                The AI will behave according to this prompt. The more specific your prompt, the better the responses.
              </p>
            </div>

            {/* Context Settings */}
            <div className="p-3 bg-[#0a0e27]/[0.02] rounded-lg border border-white/[0.1] dark:border-gray-600">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-300 mb-2">
                📊 AI Capabilities (Auto-enabled)
              </p>
              <div className="space-y-1">
                {[
                  { icon: '✅', text: 'Conversation history yaad rakhega' },
                  { icon: '✅', text: 'Hindi + English (Hinglish) support' },
                  { icon: '✅', text: 'Context-aware replies' },
                  { icon: '✅', text: 'Auto conversation summary (long chats)' },
                  { icon: '✅', text: 'Off-topic questions handle karega' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Variable Reference */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                📝 Available Variables in Prompt
              </p>
              <div className="space-y-1">
                {[
                  { var: '{{phone}}', desc: 'User phone number' },
                  { var: '{{lastInput}}', desc: 'User ka last message' },
                  { var: '{{conversationId}}', desc: 'Conversation ID' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <code className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1 rounded">
                      {item.var}
                    </code>
                    <span className="text-gray-400">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample prompts */}
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">💡 Sample Prompts (Click to use):</p>
              <div className="space-y-1">
                {[
                  'You are a helpful customer support agent. Answer questions politely.',
                  'You are a FAQ bot. Only answer questions related to our services. If the question is out of scope, politely redirect.',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onUpdate({ systemPrompt: prompt })}
                    className="w-full text-left text-xs p-2 bg-[#0a0e27]/[0.02] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded border border-white/[0.1] dark:border-gray-600 hover:border-emerald-300 transition-colors text-gray-400"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      // ─────────────────────────────────
      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Variable
              </label>
              <select
                value={node.data.condition?.variable || 'lastInput'}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...node.data.condition, variable: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
              >
                <option value="lastInput">Last User Input</option>
                <option value="phone">Phone Number</option>
                <option value="name">Contact Name</option>
                <option value="tag">Contact Tag</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Operator
              </label>
              <select
                value={node.data.condition?.operator || 'equals'}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...node.data.condition, operator: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
              >
                <option value="equals">Equals (=)</option>
                <option value="not_equals">Not Equals (≠)</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
                <option value="is_empty">Is Empty</option>
                <option value="is_not_empty">Has Value</option>
              </select>
            </div>

            {!['is_empty', 'is_not_empty'].includes(node.data.condition?.operator || '') && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Value
                </label>
                <input
                  type="text"
                  value={node.data.condition?.value || ''}
                  onChange={(e) =>
                    onUpdate({
                      condition: { ...node.data.condition, value: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                  placeholder="Compare value..."
                />
              </div>
            )}

            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
              <Info className="w-3 h-3 inline mr-1" />
              Connect: Yes edge → true handle | No edge → false handle
            </div>
          </div>
        );

      // ─────────────────────────────────
      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Delay (seconds)
              </label>
              <input
                type="number"
                value={Math.round((node.data.delay || 1000) / 1000)}
                onChange={(e) => onUpdate({ delay: Number(e.target.value) * 1000 })}
                className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                min={1}
                max={300}
              />
              <p className="text-xs text-gray-400 mt-1">
                Maximum 5 seconds will be applied in the engine (production limit)
              </p>
            </div>
          </div>
        );

      // ─────────────────────────────────
      case 'action':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Action Type
              </label>
              <select
                value={node.data.action?.type || 'tagContact'}
                onChange={(e) =>
                  onUpdate({ action: { type: e.target.value, params: {} } })
                }
                className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
              >
                <option value="tagContact">Tag a Contact</option>
                <option value="setVariable">Set a Variable</option>
                <option value="createLead">Create CRM Lead</option>
                <option value="webhook">Call a Webhook</option>
              </select>
            </div>

            {node.data.action?.type === 'tagContact' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={node.data.action?.params?.tag || ''}
                  onChange={(e) =>
                    onUpdate({
                      action: {
                        ...node.data.action,
                        params: { tag: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                  placeholder="e.g., interested, customer"
                />
              </div>
            )}

            {node.data.action?.type === 'setVariable' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Variable Name
                  </label>
                  <input
                    type="text"
                    value={node.data.action?.params?.name || ''}
                    onChange={(e) =>
                      onUpdate({
                        action: {
                          ...node.data.action,
                          params: { ...node.data.action?.params, name: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                    placeholder="variableName"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Value
                  </label>
                  <input
                    type="text"
                    value={node.data.action?.params?.value || ''}
                    onChange={(e) =>
                      onUpdate({
                        action: {
                          ...node.data.action,
                          params: { ...node.data.action?.params, value: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                    placeholder="value"
                  />
                </div>
              </div>
            )}

            {node.data.action?.type === 'createLead' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Lead Title
                </label>
                <input
                  type="text"
                  value={node.data.action?.params?.title || ''}
                  onChange={(e) =>
                    onUpdate({
                      action: {
                        ...node.data.action,
                        params: { title: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                  placeholder="Lead title..."
                />
              </div>
            )}

            {node.data.action?.type === 'webhook' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={node.data.action?.params?.url || ''}
                    onChange={(e) =>
                      onUpdate({
                        action: {
                          ...node.data.action,
                          params: {
                            ...node.data.action?.params,
                            url: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">
                    Method
                  </label>
                  <select
                    value={node.data.action?.params?.method || 'POST'}
                    onChange={(e) =>
                      onUpdate({
                        action: {
                          ...node.data.action,
                          params: {
                            ...node.data.action?.params,
                            method: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-white/[0.12] rounded-lg text-sm bg-[#0a0e27] dark:bg-gray-700 text-white"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );

      // ─────────────────────────────────
      case 'end':
        return (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              The flow ends here. The session will be deleted.
            </p>
          </div>
        );

      default:
        return (
          <p className="text-sm text-gray-500">No configuration available for this node type.</p>
        );
    }
  };

  return (
    <div className="w-80 bg-[#0a0e27] border-l border-white/[0.1] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.1]">
        <div>
          <h3 className="font-medium text-white">Configure Node</h3>
          <p className="text-xs text-gray-500 capitalize">{node.type} node</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#0a0e27]/[0.04] dark:hover:bg-gray-700 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Config */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderConfig()}
      </div>

      {/* Delete button - not shown for start node */}
      {node.type !== 'start' && (
        <div className="p-4 border-t border-white/[0.1]">
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Node
          </button>
        </div>
      )}
    </div>
  );
};

export default NodeConfigPanel;