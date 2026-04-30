import React from 'react';
import { Handle, Position } from 'reactflow';
import { Sparkles } from 'lucide-react';

const AiNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border-2 border-emerald-400 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500" />
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <span className="font-medium text-gray-900 dark:text-white">AI Response</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">System Prompt:</p>
      <div className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded max-h-16 overflow-hidden line-clamp-3">
        {data.systemPrompt || 'You are a helpful AI assistant...'}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500" />
    </div>
  );
};

export default AiNode;
