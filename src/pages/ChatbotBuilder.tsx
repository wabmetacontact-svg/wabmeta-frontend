// src/pages/ChatbotBuilder.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Save, Play, ArrowLeft, Loader2, Settings,
  Plus, X, ToggleLeft, ToggleRight, Pause, Info
} from 'lucide-react';
import { chatbots as chatbotsApi } from '../services/api';
import toast from 'react-hot-toast';

import PageLoader from '../components/common/PageLoader';
import {
  StartNode, MessageNode, ButtonNode, ConditionNode,
  DelayNode, ActionNode, EndNode, ListNode, AiNode,
  NodeSidebar, NodeConfigPanel
} from '../components/chatbot';

import { useConfirm } from '../context/ConfirmContext';
const nodeTypes: NodeTypes = {
  start: StartNode,
  message: MessageNode,
  button: ButtonNode,
  list: ListNode,
  ai: AiNode,
  condition: ConditionNode,
  delay: DelayNode,
  action: ActionNode,
  end: EndNode,
};

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
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-gray-900 text-sm">
            Chatbot Settings
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-all"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Chatbot Name *
          </label>
          <input aria-label="e.g., Welcome Bot"
            type="text"
            value={chatbot.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="e.g., Welcome Bot"
          />
        </div>

        <div>
          <label htmlFor="chatbotbuilder-description" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Description
          </label>
          <textarea id="chatbotbuilder-description"
            value={chatbot.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 resize-none h-16 focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="Optional description..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            🎯 Trigger Keywords
          </label>
          <p className="text-[10px] text-gray-400 font-semibold mb-3">
            If a user sends any of these words, this chatbot will trigger
          </p>

          <div className="flex gap-2 mb-3">
            <input aria-label="e.g., hi, hello, start"
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder="e.g., hi, hello, start"
            />
            <button
              onClick={addKeyword}
              className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {(chatbot.triggerKeywords || []).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {(chatbot.triggerKeywords || []).map((kw: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full"
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
            <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-200">
              <p className="text-xs text-gray-400 font-semibold">
                No keywords added yet
              </p>
            </div>
          )}

          <div className="mt-3 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 space-y-1 font-semibold leading-relaxed">
                <p className="font-bold text-blue-900">How keywords work:</p>
                <p>• User sends "hi" or "hello" → bot starts</p>
                <p>• Matching is case-insensitive</p>
                <p>• Partial matches also work</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            ⚡ Default Chatbot
          </label>
          <p className="text-[10px] text-gray-400 font-semibold mb-3">
            New users who message for the first time will automatically get this chatbot
          </p>

          <button
            onClick={() => onChange({ isDefault: !chatbot.isDefault })}
            className={`flex items-center gap-3 w-full p-3 rounded-2xl border-2 transition-all ${chatbot.isDefault
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
          >
            {chatbot.isDefault ? (
              <ToggleRight className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-gray-400 flex-shrink-0" />
            )}
            <div className="text-left font-semibold">
              <p className={`text-sm font-bold ${chatbot.isDefault ? 'text-emerald-700' : 'text-gray-400'}`}>
                {chatbot.isDefault ? 'Default ON ✓' : 'Default OFF'}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                {chatbot.isDefault ? 'Triggers automatically for new chats' : 'Only triggered by keywords'}
              </p>
            </div>
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            👋 Welcome Message
          </label>
          <p className="text-[10px] text-gray-400 font-semibold mb-2">
            Sent before the flow starts (optional)
          </p>
          <textarea aria-label="e.g., Welcome! 👋"
            value={chatbot.welcomeMessage || ''}
            onChange={(e) => onChange({ welcomeMessage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 resize-none h-20 focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="e.g., Welcome! 👋"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            🔄 Fallback Message
          </label>
          <p className="text-[10px] text-gray-400 font-semibold mb-2">
            Sent when the bot cannot understand the user
          </p>
          <textarea aria-label="e.g., Sorry, I didn"
            value={chatbot.fallbackMessage || ''}
            onChange={(e) => onChange({ fallbackMessage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 resize-none h-20 focus:ring-2 focus:ring-emerald-500 transition-all"
            placeholder="e.g., Sorry, I didn't understand that. Please try again."
          />
        </div>
      </div>
    </div>
  );
};

const ChatbotBuilder: React.FC = () => {
  const confirm = useConfirm();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [chatbot, setChatbot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [activePanel, setActivePanel] = useState<'settings' | 'node' | null>('settings');

  // ✅ Dirty state tracking to prevent accidental tab closing
  const [isDirty, setIsDirty] = useState(false);

  const isNewChatbot = id === 'new';

  // Alert user before closing window/tab if they have unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved chatbot workflow changes. Are you sure you want to exit?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Track edits
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    setIsDirty(true);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
    setIsDirty(true);
  }, [onEdgesChange]);

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

  const loadChatbot = async () => {
    try {
      const res = await chatbotsApi.getById(id!);
      if (res.data.success) {
        const data = res.data.data;
        setChatbot(data);
        if (data.flowData?.nodes?.length) setNodes(data.flowData.nodes);
        if (data.flowData?.edges?.length) setEdges(data.flowData.edges);
        // Freshly loaded - clean state
        setIsDirty(false);
      }
    } catch {
      toast.error('Failed to load chatbot');
      navigate('/dashboard/chatbots');
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({
        ...params,
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      }, eds));
      setIsDirty(true);
    },
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

    // ✅ FIXED: Edge-case protection - Block duplicate start nodes on the canvas
    if (type === 'start') {
      const hasStart = nodes.some(n => n.type === 'start');
      if (hasStart) {
        toast.error('Workflow limit: A chatbot can only have one "Start" node!');
        return;
      }
    }

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
    setIsDirty(true);
  }, [reactFlowInstance, nodes, setNodes]);

  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'message':
        return { label: 'Message', message: 'Type your message here...', messageType: 'text' };
      case 'button': {
        const uid = () => Math.random().toString(36).substring(2, 8);
        return {
          label: 'Buttons',
          message: 'What can I help you with?',
          buttons: [
            { id: `btn-${uid()}`, text: 'Option 1' },
            { id: `btn-${uid()}`, text: 'Option 2' },
          ],
        };
      }
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
      case 'ai':
        return {
          label: 'AI Response',
          systemPrompt: 'You are a helpful customer support agent. Answer questions politely.',
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

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setActivePanel('node');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    if (activePanel === 'node') {
      setActivePanel(null);
    }
  }, [activePanel]);

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
    setIsDirty(true);
  };

  const deleteNode = (nodeId: string) => {
    // Block deleting start node
    const node = nodes.find(n => n.id === nodeId);
    if (node?.type === 'start') {
      toast.error('Start node cannot be deleted');
      return;
    }

    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    setActivePanel(null);
    setIsDirty(true);
  };

  const updateChatbotSettings = (data: any) => {
    setChatbot((prev: any) => ({ ...prev, ...data }));
    setIsDirty(true);
  };

  // ✅ Graph/Flow Validation prior to Save
  const validateFlow = (): boolean => {
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) {
      toast.error('Workflow invalid: Missing "Start" node');
      return false;
    }

    // Check if start is connected to anything
    const startConnected = edges.some(e => e.source === startNode.id);
    if (!startConnected) {
      toast.error('Start node is not connected to any subsequent step!');
      return false;
    }

    // Warn about hanging nodes
    const hangingNodes = nodes.filter(node => {
      if (node.type === 'start') return false;
      const hasIncoming = edges.some(e => e.target === node.id);
      return !hasIncoming;
    });

    if (hangingNodes.length > 0) {
      toast(`ℹ️ Warning: ${hangingNodes.length} node(s) on the canvas have no incoming connection path.`, { icon: '⚠️' });
    }

    return true;
  };

  const handleSave = async () => {
    if (!chatbot?.name?.trim()) {
      toast.error('Chatbot name is required');
      return;
    }

    if (!validateFlow()) return;

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
          toast.success('Chatbot created successfully! ✅');
          setIsDirty(false); // Clean state after save
          navigate(`/dashboard/chatbots/${res.data.data.id}`);
        }
      } else {
        const res = await chatbotsApi.update(id!, payload);
        if (res.data.success) {
          setChatbot((prev: any) => ({ ...prev, ...res.data.data }));
          setIsDirty(false); // Clean state after save
          toast.success('Chatbot saved! ✅');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    if (isNewChatbot) {
      toast.error('Please save the chatbot first');
      return;
    }

    if (!validateFlow()) return;

    setSaving(true);
    try {
      const flowData = { nodes, edges };
      await chatbotsApi.update(id!, {
        name: chatbot.name,
        description: chatbot.description,
        triggerKeywords: chatbot.triggerKeywords || [],
        isDefault: chatbot.isDefault || false,
        welcomeMessage: chatbot.welcomeMessage || '',
        fallbackMessage: chatbot.fallbackMessage || '',
        flowData,
      });
    } catch {
      toast.error('Auto-save failed — cannot activate');
      setSaving(false);
      return;
    } finally {
      setSaving(false);
    }

    try {
      await chatbotsApi.activate(id!);
      toast.success('Chatbot activated! 🚀');
      setIsDirty(false);
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

  // ✅ Warn before manual routing navigation
  const handleBackNavigation = async () => {
    if (isDirty) {
      const confirmExit = await confirm({
        title: 'Discard unsaved changes?',
        message: 'Your edits to this flow will be lost.',
        confirmLabel: 'Discard',
        tone: 'danger',
      });
      if (!confirmExit) return;
    }
    navigate('/dashboard/chatbots');
  };

  if (loading) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden select-none">

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 shadow-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackNavigation}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                  {chatbot?.name || 'Untitled Chatbot'}
                </span>

                {chatbot?.status && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${chatbot.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }`}>
                    {chatbot.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                {nodes.length} nodes • {edges.length} connections
                {chatbot?.triggerKeywords?.length > 0 && (
                  <span className="ml-2 text-emerald-600 font-bold">
                    🎯 {chatbot.triggerKeywords.length} keywords
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors text-xs font-bold ${activePanel === 'settings'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            {chatbot?.status === 'ACTIVE' ? (
              <button
                onClick={handleDeactivate}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors text-xs font-bold"
              >
                <Pause className="w-4 h-4" />
                Pause
              </button>
            ) : (
              <button
                onClick={handleActivate}
                disabled={isNewChatbot}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 disabled:opacity-40 transition-colors text-xs font-bold"
              >
                <Play className="w-4 h-4" />
                Activate
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all text-xs font-bold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <NodeSidebar />

        <div ref={reactFlowWrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
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
              style: { stroke: '#10b981', strokeWidth: 2 },
            }}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'start': return '#10b981';
                  case 'message': return '#3b82f6';
                  case 'button': return '#a855f7';
                  case 'list': return '#6366f1';
                  case 'ai': return '#059669';
                  case 'condition': return '#eab308';
                  case 'delay': return '#f97316';
                  case 'action': return '#ec4899';
                  case 'end': return '#ef4444';
                  default: return '#6b7280';
                }
              }}
            />
            <Background gap={15} color="#e2e8f0" />
          </ReactFlow>

          {nodes.length <= 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-2xl px-6 py-3.5 shadow-lg pointer-events-none">
              <p className="text-xs text-gray-500 text-center font-semibold">
                👈 Drag nodes from the left sidebar onto the canvas to map out your bot
              </p>
            </div>
          )}
        </div>

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

const ChatbotBuilderWrapper: React.FC = () => (
  <ReactFlowProvider>
    <ChatbotBuilder />
  </ReactFlowProvider>
);

export default ChatbotBuilderWrapper;