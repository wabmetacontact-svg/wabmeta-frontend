import React from 'react';
import { X, Trash2, Plus, Info, Sparkles } from 'lucide-react';
import type { ChatbotFlowNode, ChatbotNodeData } from '../../types/chatbot';

interface Props {
  node: ChatbotFlowNode;
  onUpdate: (data: Partial<ChatbotNodeData>) => void;
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
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
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
              <label htmlFor="nodeconfigpanel-message-type" className="block text-sm font-medium mb-1 text-gray-700">
                Message Type
              </label>
              <select id="nodeconfigpanel-message-type"
                value={msgType}
                onChange={(e) => onUpdate({ messageType: e.target.value as ChatbotNodeData['messageType'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 mb-4"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
              </select>

              {msgType !== 'text' && (
                <div className="mb-4">
                  <label htmlFor="nodeconfigpanel-media-url" className="block text-sm font-medium mb-1 text-gray-700">
                    Media URL
                  </label>
                  <input id="nodeconfigpanel-media-url"
                    type="url"
                    value={node.data.mediaUrl || ''}
                    onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/media.jpg"
                  />
                </div>
              )}

              <label className="block text-sm font-medium mb-1 text-gray-700">
                {msgType === 'text' ? 'Message Text' : 'Media Caption (Optional)'}
              </label>
              <textarea aria-label="Message text"
                value={node.data.message || ''}
                onChange={(e) => onUpdate({ message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none h-32 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={msgType === 'text' ? "Enter your message..." : "Enter caption..."}
              />
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                <p className="font-medium text-gray-500 mb-1">
                  📝 Variables use kar sakte ho:
                </p>
                <div className="flex flex-wrap gap-1">
                  {['{{phone}}', '{{lastInput}}', '{{selectedButton}}', 
                    '{{selectedOption}}', '{{userName}}'].map(v => (
                    <code key={v} className="bg-white border border-gray-200 text-green-600 px-1.5 py-0.5 rounded text-[10px]">
                      {v}
                    </code>
                  ))}
                </div>
              </div>
            </div>

            {/* Wait for user reply toggle */}
            <div className="border border-orange-200 rounded-lg p-3 bg-orange-50">
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
                      node.data.waitForInput ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        node.data.waitForInput ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Wait for user reply
                  </p>
                  <p className="text-xs text-orange-600 mt-0.5">
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
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Message
              </label>
              <textarea aria-label="Message"
                value={node.data.message || ''}
                onChange={(e) => onUpdate({ message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none h-20 text-sm bg-white text-gray-900"
                placeholder="Choose an option:"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Buttons (max 3)
              </label>
              <div className="space-y-2">
                {(node.data.buttons || []).map((btn: any, i: number) => (
                  <div key={btn.id || i} className="flex gap-2 items-center">
                    <span className="text-xs text-gray-500 w-5">{i + 1}.</span>
                    <input aria-label={`Button ${i + 1} label`}
                      type="text"
                      value={btn.text}
                      maxLength={20}
                      onChange={(e) => {
                        const newButtons = [...(node.data.buttons || [])];
                        newButtons[i] = { ...newButtons[i], text: e.target.value };
                        onUpdate({ buttons: newButtons });
                      }}
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm bg-white text-gray-900"
                      placeholder={`Button ${i + 1} text`}
                    />
                    <button
                      onClick={() => {
                        const newButtons = (node.data.buttons || []).filter(
                          (_: any, idx: number) => idx !== i
                        );
                        onUpdate({ buttons: newButtons });
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
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

              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-600">
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
              <label htmlFor="nodeconfigpanel-message-body" className="block text-sm font-medium mb-1 text-gray-700">
                Message Body
              </label>
              <textarea id="nodeconfigpanel-message-body"
                value={node.data.message || ''}
                onChange={(e) => onUpdate({ message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none h-16 text-sm bg-white text-gray-900"
                placeholder="Please select an option:"
              />
            </div>
            <div>
              <label htmlFor="nodeconfigpanel-menu-button-text-max-20-chars" className="block text-sm font-medium mb-1 text-gray-700">
                Menu Button Text (max 20 chars)
              </label>
              <input id="nodeconfigpanel-menu-button-text-max-20-chars"
                type="text"
                value={node.data.listButtonText || 'View Options'}
                maxLength={20}
                onChange={(e) => onUpdate({ listButtonText: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                List Sections (max 10)
              </label>
              <div className="space-y-4">
                {sections.map((sec: any, sIdx: number) => (
                  <div key={sIdx} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <input aria-label="Section Title"
                        type="text"
                        value={sec.title || ''}
                        maxLength={24}
                        placeholder="Section Title"
                        onChange={(e) => {
                          const newSecs = [...sections];
                          newSecs[sIdx].title = e.target.value;
                          onUpdate({ listSections: newSecs });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm font-medium bg-white text-gray-900"
                      />
                      <button
                        onClick={() => {
                          const newSecs = sections.filter((_: any, i: number) => i !== sIdx);
                          onUpdate({ listSections: newSecs });
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(sec.rows || []).map((row: any, rIdx: number) => (
                        <div key={rIdx} className="relative pl-2 border-l-2 border-indigo-200">
                          <div className="flex items-center gap-2 mb-1">
                            <input aria-label="Row Title"
                              type="text"
                              value={row.title || ''}
                              maxLength={24}
                              placeholder="Row Title"
                              onChange={(e) => {
                                const newSecs = [...sections];
                                newSecs[sIdx].rows[rIdx].title = e.target.value;
                                onUpdate({ listSections: newSecs });
                              }}
                              className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white text-gray-900"
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
                          <input aria-label="Description (Optional)"
                            type="text"
                            value={row.description || ''}
                            maxLength={72}
                            placeholder="Description (Optional)"
                            onChange={(e) => {
                              const newSecs = [...sections];
                              newSecs[sIdx].rows[rIdx].description = e.target.value;
                              onUpdate({ listSections: newSecs });
                            }}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white text-gray-500"
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
                  className="flex items-center justify-center w-full gap-1 p-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400 mt-3"
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
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-700">Conversation Mode</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    AI will automatically keep conversing with the user. Every message will get an AI response and the conversation will continue.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="nodeconfigpanel-ai-system-prompt" className="block text-sm font-medium mb-1 text-emerald-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI System Prompt
              </label>
              <textarea id="nodeconfigpanel-ai-system-prompt"
                value={node.data.systemPrompt || ''}
                onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none h-40 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ex: You are a helpful customer support agent. Answer questions politely in Hindi."
              />
              <p className="text-xs text-gray-500 mt-1">
                The AI will behave according to this prompt. The more specific your prompt, the better the responses.
              </p>
            </div>

            {/* Context Settings */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2">
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
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Variable Reference */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 mb-2">
                📝 Available Variables in Prompt
              </p>
              <div className="space-y-1">
                {[
                  { var: '{{phone}}', desc: 'User phone number' },
                  { var: '{{lastInput}}', desc: 'User ka last message' },
                  { var: '{{conversationId}}', desc: 'Conversation ID' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <code className="bg-blue-100 text-blue-700 px-1 rounded">
                      {item.var}
                    </code>
                    <span className="text-gray-500">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample prompts */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">💡 Sample Prompts (Click to use):</p>
              <div className="space-y-1">
                {[
                  'You are a helpful customer support agent. Answer questions politely.',
                  'You are a FAQ bot. Only answer questions related to our services. If the question is out of scope, politely redirect.',
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onUpdate({ systemPrompt: prompt })}
                    className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-emerald-50 rounded border border-gray-200 hover:border-emerald-300 transition-colors text-gray-500"
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
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Variable
              </label>
              <select aria-label="Variable"
                value={node.data.condition?.variable || 'lastInput'}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...node.data.condition, variable: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
              >
                <option value="lastInput">Last User Input</option>
                <option value="phone">Phone Number</option>
                <option value="name">Contact Name</option>
                <option value="tag">Contact Tag</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Operator
              </label>
              <select aria-label="Operator"
                value={node.data.condition?.operator || 'equals'}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...node.data.condition, operator: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
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
                <label htmlFor="nodeconfigpanel-value-2" className="block text-sm font-medium mb-1 text-gray-700">
                  Value
                </label>
                <input id="nodeconfigpanel-value-2"
                  type="text"
                  value={node.data.condition?.value || ''}
                  onChange={(e) =>
                    onUpdate({
                      condition: { ...node.data.condition, value: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
                  placeholder="Compare value..."
                />
              </div>
            )}

            <div className="p-2 bg-yellow-50 rounded text-xs text-yellow-700">
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
              <label htmlFor="nodeconfigpanel-delay-seconds" className="block text-sm font-medium mb-1 text-gray-700">
                Delay (seconds)
              </label>
              <input id="nodeconfigpanel-delay-seconds"
                type="number"
                value={Math.round((node.data.delay || 1000) / 1000)}
                onChange={(e) => onUpdate({ delay: Number(e.target.value) * 1000 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
                min={1}
                max={300}
              />
              <p className="text-xs text-gray-500 mt-1">
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
              <label htmlFor="nodeconfigpanel-action-type" className="block text-sm font-medium mb-1 text-gray-700">
                Action Type
              </label>
              <select id="nodeconfigpanel-action-type"
                value={node.data.action?.type || 'tagContact'}
                onChange={(e) =>
                  onUpdate({ action: { type: e.target.value, params: {} } })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
              >
                <option value="tagContact">Tag a Contact</option>
                <option value="setVariable">Set a Variable</option>
                <option value="createLead">Create CRM Lead</option>
                <option value="webhook">Call a Webhook</option>
              </select>
            </div>

            {node.data.action?.type === 'tagContact' && (
              <div>
                <label htmlFor="nodeconfigpanel-tag-name" className="block text-sm font-medium mb-1 text-gray-700">
                  Tag Name
                </label>
                <input id="nodeconfigpanel-tag-name"
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
                  placeholder="e.g., interested, customer"
                />
              </div>
            )}

            {node.data.action?.type === 'setVariable' && (
              <div className="space-y-2">
                <div>
                  <label htmlFor="nodeconfigpanel-variable-name" className="block text-sm font-medium mb-1 text-gray-700">
                    Variable Name
                  </label>
                  <input id="nodeconfigpanel-variable-name"
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
                    placeholder="variableName"
                  />
                </div>
                <div>
                  <label htmlFor="nodeconfigpanel-value" className="block text-sm font-medium mb-1 text-gray-700">
                    Value
                  </label>
                  <input id="nodeconfigpanel-value"
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
                    placeholder="value"
                  />
                </div>
              </div>
            )}

            {node.data.action?.type === 'createLead' && (
              <div>
                <label htmlFor="nodeconfigpanel-lead-title" className="block text-sm font-medium mb-1 text-gray-700">
                  Lead Title
                </label>
                <input id="nodeconfigpanel-lead-title"
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
                  placeholder="Lead title..."
                />
              </div>
            )}

            {node.data.action?.type === 'webhook' && (
              <div className="space-y-2">
                <div>
                  <label htmlFor="nodeconfigpanel-webhook-url" className="block text-sm font-medium mb-1 text-gray-700">
                    Webhook URL
                  </label>
                  <input id="nodeconfigpanel-webhook-url"
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label htmlFor="nodeconfigpanel-method" className="block text-sm font-medium mb-1 text-gray-700">
                    Method
                  </label>
                  <select id="nodeconfigpanel-method"
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
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
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">
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
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="font-medium text-gray-900">Configure Node</h3>
          <p className="text-xs text-gray-500 capitalize">{node.type} node</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-50 rounded transition-colors"
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
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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