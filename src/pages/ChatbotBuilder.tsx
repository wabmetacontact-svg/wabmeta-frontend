// src/pages/ChatbotBuilder.tsx - COMPLETE REPLACE

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  type Connection,
  type Node,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Save, Play, ArrowLeft, Loader2, Settings, GitBranch,
  Plus, X, Zap, ToggleLeft, ToggleRight, Pause, Info
} from 'lucide-react';
import { chatbots as chatbotsApi } from '../services/api';
import toast from 'react-hot-toast';

import PageSkeleton from '../components/common/PageSkeleton';
import {
  StartNode, MessageNode, ButtonNode, ConditionNode,
  DelayNode, ActionNode, EndNode, ListNode,
  NodeSidebar, NodeConfigPanel
} from '../components/chatbot';

// ============================================
// NODE TYPES
// ============================================
const nodeTypes: NodeTypes = {
  start: StartNode,
  message: MessageNode,
  button: ButtonNode,
  list: ListNode,
  condition: ConditionNode,
  delay: DelayNode,
  action: ActionNode,
  end: EndNode,
};

// ============================================
// SETTINGS PANEL COMPONENT
// ============================================
interface SettingsPanelProps {
  chatbot: any;
  onChange: (data: any) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ chatbot, onChange, onClose }) => {
  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    const kw = newKeyword.trim().toLowerCase();
    if (!kw) return;

    const existing = chatbot.triggerKeywords || [];
    if (existing.includes(kw)) {
      toast.error('Keyword already exists');
      return;
    }
    if (existing.length >= 20) {
      toast.error('Maximum 20 keywords allowed');
      return;
    }

    onChange({ triggerKeywords: [...existing, kw] });
    setNewKeyword('');
  };

  const removeKeyword = (index: number) => {
    const updated = (chatbot.triggerKeywords || []).filter((_: string, i: number) => i !== index);
    onChange({ triggerKeywords: updated });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Chatbot Settings
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* ── Chatbot Name ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Chatbot Name *
          </label>
          <input
            type="text"
            value={chatbot.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., Welcome Bot"
          />
        </div>

        {/* ── Description ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={chatbot.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-16 focus:ring-2 focus:ring-green-500"
            placeholder="Optional description..."
          />
        </div>

        {/* ── TRIGGER KEYWORDS ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            🎯 Trigger Keywords
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            User in words mein se kuch bhi bhejega toh ye chatbot start hoga
          </p>

          {/* Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              placeholder="e.g., hi, hello, start"
            />
            <button
              onClick={addKeyword}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Keywords List */}
          {(chatbot.triggerKeywords || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(chatbot.triggerKeywords || []).map((kw: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full"
                >
                  {kw}
                  <button
                    onClick={() => removeKeyword(i)}
                    className="hover:text-red-500 transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
              <p className="text-xs text-gray-400">
                Koi keyword nahi hai
              </p>
            </div>
          )}

          {/* Info box */}
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                <p><strong>Keywords kaise kaam karte hain:</strong></p>
                <p>• User "hi" ya "hello" bhejega → bot start</p>
                <p>• Case-insensitive matching hoti hai</p>
                <p>• Partial match bhi work karta hai</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Default Chatbot Toggle ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            ⚡ Default Chatbot
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Naye users jo pehli baar message karein, unhe automatically ye chatbot milega
          </p>

          <button
            onClick={() => onChange({ isDefault: !chatbot.isDefault })}
            className={`flex items-center gap-3 w-full p-3 rounded-lg border-2 transition-all ${chatbot.isDefault
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
              }`}
          >
            {chatbot.isDefault ? (
              <ToggleRight className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-gray-400 flex-shrink-0" />
            )}
            <div className="text-left">
              <p className={`text-sm font-medium ${chatbot.isDefault
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-400'
                }`}>
                {chatbot.isDefault ? 'Default ON ✓' : 'Default OFF'}
              </p>
              <p className="text-xs text-gray-500">
                {chatbot.isDefault
                  ? 'Naye conversations pe automatically trigger hoga'
                  : 'Sirf keywords se trigger hoga'}
              </p>
            </div>
          </button>
        </div>

        {/* ── Welcome Message ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            👋 Welcome Message
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Flow start hone se pehle send hoga (optional)
          </p>
          <textarea
            value={chatbot.welcomeMessage || ''}
            onChange={(e) => onChange({ welcomeMessage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-20 focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Welcome! 👋"
          />
        </div>

        {/* ── Fallback Message ── */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            🔄 Fallback Message
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Jab bot samajh na paye tab send hoga
          </p>
          <textarea
            value={chatbot.fallbackMessage || ''}
            onChange={(e) => onChange({ fallbackMessage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none h-20 focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Sorry, main samajh nahi paya. Please dobara try karo."
          />
        </div>

        {/* ── Trigger Summary ── */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3 uppercase tracking-wide">
            Trigger Summary
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <span>
                {(chatbot.triggerKeywords || []).length > 0
                  ? `Keywords: ${(chatbot.triggerKeywords || []).join(', ')}`
                  : 'Koi keyword set nahi hai'}
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
              <GitBranch className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                {chatbot.isDefault
                  ? 'Naye users ke liye default hai'
                  : 'Default nahi hai'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================
// MAIN CHATBOT BUILDER
// ============================================
const ChatbotBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [chatbot, setChatbot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // ✅ NEW: Panel state - 'settings' | 'node' | null
  const [activePanel, setActivePanel] = useState<'settings' | 'node' | null>('settings');

  const isNewChatbot = id === 'new';

  // ─────────────────────────────────────────
  useEffect(() => {
    if (!isNewChatbot && id) {
      loadChatbot();
    } else {
      setNodes([
        {
          id: 'start-1',
          type: 'start',
          position: { x: 300, y: 80 },
          data: { label: 'Start' },
        },
      ]);
      setChatbot({
        name: 'New Chatbot',
        description: '',
        triggerKeywords: [],
        isDefault: false,
        welcomeMessage: '',
        fallbackMessage: '',
      });
      setLoading(false);
    }
  }, [id]);

  // ─────────────────────────────────────────
  const loadChatbot = async () => {
    try {
      const res = await chatbotsApi.getById(id!);
      if (res.data.success) {
        const data = res.data.data;
        setChatbot(data);
        if (data.flowData?.nodes?.length) setNodes(data.flowData.nodes);
        if (data.flowData?.edges?.length) setEdges(data.flowData.edges);
      }
    } catch {
      toast.error('Failed to load chatbot');
      navigate('/dashboard/chatbots');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 2 },
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: getDefaultNodeData(type),
    };

    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance]);

  // ─────────────────────────────────────────
  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'message':
        return { label: 'Message', message: 'Apna message yahan likhein...', messageType: 'text' };
      case 'button':
        return {
          label: 'Buttons',
          message: 'Kya chahiye aapko?',
          buttons: [
            { id: `btn-${Date.now()}-1`, text: 'Option 1' },
            { id: `btn-${Date.now()}-2`, text: 'Option 2' },
          ],
        };
      case 'list':
        return {
          label: 'List',
          message: 'Please choose from the menu:',
          listButtonText: 'View Options',
          listSections: [
            {
              title: 'Section 1',
              rows: [
                { id: `row-${Date.now()}-1`, title: 'Option 1', description: 'Description here' }
              ]
            }
          ]
        };
      case 'condition':
        return {
          label: 'Condition',
          condition: { variable: 'lastInput', operator: 'equals', value: '' },
        };
      case 'delay':
        return { label: 'Delay', delay: 2000 };
      case 'action':
        return { label: 'Action', action: { type: 'tagContact', params: {} } };
      case 'end':
        return { label: 'End' };
      default:
        return { label: type };
    }
  };

  // ─────────────────────────────────────────
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setActivePanel('node');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    // Settings panel open raho
    if (activePanel === 'node') {
      setActivePanel(null);
    }
  }, [activePanel]);

  // ─────────────────────────────────────────
  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
    setSelectedNode((prev) =>
      prev ? { ...prev, data: { ...prev.data, ...newData } } : null
    );
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    setActivePanel(null);
  };

  // ─────────────────────────────────────────
  const updateChatbotSettings = (data: any) => {
    setChatbot((prev: any) => ({ ...prev, ...data }));
  };

  // ─────────────────────────────────────────
  const handleSave = async () => {
    if (!chatbot?.name?.trim()) {
      toast.error('Chatbot name required hai');
      return;
    }

    setSaving(true);
    try {
      const flowData = { nodes, edges };
      const payload = {
        name: chatbot.name,
        description: chatbot.description,
        triggerKeywords: chatbot.triggerKeywords || [],
        isDefault: chatbot.isDefault || false,
        welcomeMessage: chatbot.welcomeMessage || '',
        fallbackMessage: chatbot.fallbackMessage || '',
        flowData,
      };

      if (isNewChatbot) {
        const res = await chatbotsApi.create(payload);
        if (res.data.success) {
          toast.success('Chatbot created! ✅');
          navigate(`/dashboard/chatbots/${res.data.data.id}`);
        }
      } else {
        await chatbotsApi.update(id!, payload);
        toast.success('Chatbot saved! ✅');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    if (isNewChatbot) {
      toast.error('Pehle save karo');
      return;
    }
    try {
      await chatbotsApi.activate(id!);
      toast.success('Chatbot activated! 🚀');
      loadChatbot();
    } catch {
      toast.error('Activate failed');
    }
  };

  const handleDeactivate = async () => {
    if (isNewChatbot) return;
    try {
      await chatbotsApi.deactivate(id!);
      toast.success('Chatbot paused');
      loadChatbot();
    } catch {
      toast.error('Deactivate failed');
    }
  };

  // ─────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  // ─────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">

      {/* ══ HEADER ══════════════════════════════ */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/chatbots')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {chatbot?.name || 'Untitled Chatbot'}
                </span>

                {/* Status Badge */}
                {chatbot?.status && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${chatbot.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : chatbot.status === 'PAUSED'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                    {chatbot.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {nodes.length} nodes • {edges.length} connections
                {(chatbot?.triggerKeywords?.length > 0) && (
                  <span className="ml-2 text-green-600">
                    🎯 {chatbot.triggerKeywords.length} keywords
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right - Action Buttons */}
          <div className="flex items-center gap-2">

            {/* Settings Toggle */}
            <button
              onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${activePanel === 'settings'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            {/* Activate / Deactivate */}
            {chatbot?.status === 'ACTIVE' ? (
              <button
                onClick={handleDeactivate}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            ) : (
              <button
                onClick={handleActivate}
                disabled={isNewChatbot}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg hover:bg-green-200 disabled:opacity-40 transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                Activate
              </button>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />
              }
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT ════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* Node Sidebar (left) */}
        <NodeSidebar />

        {/* Flow Canvas (center) */}
        <div ref={reactFlowWrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#22c55e', strokeWidth: 2 },
            }}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'start': return '#22c55e';
                  case 'message': return '#3b82f6';
                  case 'button': return '#a855f7';
                  case 'list': return '#6366f1';
                  case 'condition': return '#eab308';
                  case 'delay': return '#f97316';
                  case 'action': return '#ec4899';
                  case 'end': return '#ef4444';
                  default: return '#6b7280';
                }
              }}
            />
            <Background gap={15} color="#e5e7eb" />
          </ReactFlow>

          {/* Empty state hint */}
          {nodes.length <= 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 shadow-lg pointer-events-none">
              <p className="text-sm text-gray-500 text-center">
                👈 Left sidebar se nodes drag karo canvas pe
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Settings ya Node Config */}
        {activePanel === 'settings' && (
          <SettingsPanel
            chatbot={chatbot}
            onChange={updateChatbotSettings}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'node' && selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={(data: any) => updateNodeData(selectedNode.id, data)}
            onDelete={() => deleteNode(selectedNode.id)}
            onClose={() => {
              setSelectedNode(null);
              setActivePanel(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// ============================================
// WRAPPER
// ============================================
const ChatbotBuilderWrapper: React.FC = () => (
  <ReactFlowProvider>
    <ChatbotBuilder />
  </ReactFlowProvider>
);

export default ChatbotBuilderWrapper;