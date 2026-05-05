import React from 'react';
import { Handle, Position } from 'reactflow';
import { Sparkles, MessageCircle } from 'lucide-react';

const AiNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border-2 border-emerald-400 min-w-[200px] max-w-[280px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500" />
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <span className="font-medium text-gray-900 dark:text-white">Meta AI</span>
        {/* ✅ Always show conversation mode badge since AI always waits for replies */}
        <span className="ml-auto flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
          <MessageCircle className="w-3 h-3" />
          Chat
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">System Prompt:</p>
      <div className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded max-h-16 overflow-hidden line-clamp-3">
        {data.systemPrompt || 'You are a helpful AI assistant...'}
      </div>
      {/* ✅ Conversation mode info */}
      <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
        💬 AI user se baat karta rahega
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500" />
    </div>
  );
};

export default AiNode;
