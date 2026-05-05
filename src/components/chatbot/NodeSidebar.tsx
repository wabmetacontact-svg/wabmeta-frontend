import React from 'react';
import { MessageSquare, MousePointer, GitBranch, Clock, Zap, StopCircle, List, Sparkles } from 'lucide-react';

const nodeTypes = [
  {
    type: 'message',
    label: 'Message',
    icon: MessageSquare,
    color: 'bg-blue-500',
    desc: 'Send text or media',
  },
  {
    type: 'button',
    label: 'Buttons',
    icon: MousePointer,
    color: 'bg-purple-500',
    desc: 'Up to 3 reply buttons',
  },
  {
    type: 'list',
    label: 'List Menu',
    icon: List,
    color: 'bg-indigo-500',
    desc: 'Multiple options menu',
  },
  {
    type: 'ai',
    label: 'Meta AI',
    icon: Sparkles,
    color: 'bg-emerald-500',
    desc: 'Chat with AI',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranch,
    color: 'bg-yellow-500',
    desc: 'If / else branch',
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    color: 'bg-orange-500',
    desc: 'Wait before next step',
  },
  {
    type: 'action',
    label: 'Action',
    icon: Zap,
    color: 'bg-pink-500',
    desc: 'Tag, variable, webhook',
  },
  {
    type: 'end',
    label: 'End',
    icon: StopCircle,
    color: 'bg-red-500',
    desc: 'End the flow',
  },
];

const NodeSidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-52 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-3 flex flex-col">
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
        Nodes — Drag to Add
      </h3>
      <div className="space-y-1.5 flex-1 overflow-y-auto">
        {nodeTypes.map(({ type, label, icon: Icon, color, desc }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="flex items-center gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-700/60 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-600/80 transition-all hover:shadow-sm group"
            title={`Drag to add: ${label}`}
          >
            <div className={`w-7 h-7 flex-shrink-0 ${color} rounded-md flex items-center justify-center shadow-sm`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-700 dark:text-gray-200 text-xs leading-tight">{label}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-[10px] text-blue-500 dark:text-blue-400 text-center">
          🖱️ Drag to canvas, then connect nodes
        </p>
      </div>
    </div>
  );
};

export default NodeSidebar;