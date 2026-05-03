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
                Flow yahan se start hoga. Trigger keywords chatbot settings mein set karo.
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
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Message Type
              </label>
              <select
                value={msgType}
                onChange={(e) => onUpdate({ messageType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              >
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
              </select>

              {msgType !== 'text' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Media URL
                  </label>
                  <input
                    type="url"
                    value={node.data.mediaUrl || ''}
                    onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/media.jpg"
                  />
                </div>
              )}

              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {msgType === 'text' ? 'Message Text' : 'Media Caption (Optional)'}
              </label>
              <textarea
                value={node.data.message || ''}
                onChange={(e) => onUpdate({ message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-32 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={msgType === 'text' ? "Apna message likho..." : "Caption likho..."}
              />
              <p className="text-xs text-gray-400 mt-1">
                Variables: {'{{phone}}'}, {'{{lastInput}}'}
              </p>
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
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        node.data.waitForInput ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    User reply ka wait karo
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                    ON: Message bhejne ke baad ruk jao, user ke reply ka wait karo<br/>
                    OFF: Seedha agle node pe chale jao (default)
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
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Message
              </label>
              <textarea
                value={node.data.message || ''}
                onChange={(e) => onUpdate({ message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-20 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Choose an option:"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                      className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    Button Add Karo
                  </button>
                )}
              </div>

              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-600 dark:text-blue-300">
                <Info className="w-3 h-3 inline mr-1" />
                Har button ke liye alag edge connect karo
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
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Message Body
              </label>
              <textarea
                value={node.data.message || ''}
                onChange={(e) => onUpdate({ message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-16 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Please select an option:"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Menu Button Text (max 20 chars)
              </label>
              <input
                type="text"
                value={node.data.listButtonText || 'View Options'}
                maxLength={20}
                onChange={(e) => onUpdate({ listButtonText: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                List Sections (max 10)
              </label>
              <div className="space-y-4">
                {sections.map((sec: any, sIdx: number) => (
                  <div key={sIdx} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
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
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400"
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
                  className="flex items-center justify-center w-full gap-1 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 mt-3"
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
            <div>
              <label className="block text-sm font-medium mb-1 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI System Prompt
              </label>
              <textarea
                value={node.data.systemPrompt || ''}
                onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none h-48 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Ex: You are a sales assistant for WabMeta. You sell our software. Be polite and concise."
              />
              <p className="text-xs text-gray-500 mt-2">
                This prompt tells the AI how to behave. The AI will read the user's message and generate a response based on these instructions.
              </p>
            </div>
          </div>
        );

      // ─────────────────────────────────
      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Variable
              </label>
              <select
                value={node.data.condition?.variable || 'lastInput'}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...node.data.condition, variable: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="lastInput">Last User Input</option>
                <option value="phone">Phone Number</option>
                <option value="name">Contact Name</option>
                <option value="tag">Contact Tag</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Operator
              </label>
              <select
                value={node.data.condition?.operator || 'equals'}
                onChange={(e) =>
                  onUpdate({
                    condition: { ...node.data.condition, operator: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Compare value..."
                />
              </div>
            )}

            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
              <Info className="w-3 h-3 inline mr-1" />
              Yes edge = true handle | No edge = false handle se connect karo
            </div>
          </div>
        );

      // ─────────────────────────────────
      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Delay (seconds)
              </label>
              <input
                type="number"
                value={Math.round((node.data.delay || 1000) / 1000)}
                onChange={(e) => onUpdate({ delay: Number(e.target.value) * 1000 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min={1}
                max={300}
              />
              <p className="text-xs text-gray-400 mt-1">
                Max 5 seconds engine mein execute hoga (production limit)
              </p>
            </div>
          </div>
        );

      // ─────────────────────────────────
      case 'action':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Action Type
              </label>
              <select
                value={node.data.action?.type || 'tagContact'}
                onChange={(e) =>
                  onUpdate({ action: { type: e.target.value, params: {} } })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="tagContact">Contact ko Tag Karo</option>
                <option value="setVariable">Variable Set Karo</option>
                <option value="createLead">CRM Lead Banao</option>
                <option value="webhook">Webhook Call Karo</option>
              </select>
            </div>

            {node.data.action?.type === 'tagContact' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., interested, customer"
                />
              </div>
            )}

            {node.data.action?.type === 'setVariable' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="variableName"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="value"
                  />
                </div>
              </div>
            )}

            {node.data.action?.type === 'createLead' && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Lead title..."
                />
              </div>
            )}

            {node.data.action?.type === 'webhook' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              Flow yahan khatam hoga. Session delete ho jayega.
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
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">Configure Node</h3>
          <p className="text-xs text-gray-500 capitalize">{node.type} node</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Config */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderConfig()}
      </div>

      {/* Delete button - start/end pe nahi */}
      {node.type !== 'start' && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
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