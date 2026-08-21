// ✅ CREATE: src/types/chatbot.ts

export interface Chatbot {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
  isDefault: boolean;
  triggerKeywords: string[];
  welcomeMessage?: string;
  fallbackMessage?: string;
  flowData: FlowData;
  createdAt: string;
  updatedAt: string;
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowNode {
  id: string;
  type: 'start' | 'message' | 'button' | 'list' | 'condition' | 'delay' | 'action' | 'ai' | 'end';
  position: { x: number; y: number };
  data: NodeData;
}

export interface NodeData {
  label?: string;
  message?: string;
  buttons?: { id: string; text: string; nextNodeId?: string }[];
  condition?: { variable: string; operator: string; value: string };
  delay?: number;
  action?: { type: string; params: any };
  systemPrompt?: string;
  nextNodeId?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
// ============================================
// FLOW BUILDER NODE DATA
// ============================================
// Declared as a `type` (not an interface) so it stays assignable to
// Record<string, unknown>, which @xyflow/react's Node<T> generic requires.

export type ChatbotListRow = {
  id: string;
  title: string;
  description?: string;
};

export type ChatbotListSection = {
  title: string;
  rows: ChatbotListRow[];
};

export type ChatbotButton = {
  id: string;
  text: string;
  nextNodeId?: string;
};

// Fields are optional because the builder writes them one control at a time;
// a node is only validated as complete on save.
export type ChatbotCondition = {
  variable?: string;
  operator?: string;
  value?: string;
};

export type ChatbotAction = {
  type?: string;
  params?: Record<string, string>;
};

export type ChatbotNodeData = {
  label?: string;
  message?: string;
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  waitForInput?: boolean;
  buttons?: ChatbotButton[];
  listSections?: ChatbotListSection[];
  listButtonText?: string;
  condition?: ChatbotCondition;
  delay?: number;
  action?: ChatbotAction;
  systemPrompt?: string;
  nextNodeId?: string;
};

export type ChatbotFlowNode = import('@xyflow/react').Node<ChatbotNodeData>;
