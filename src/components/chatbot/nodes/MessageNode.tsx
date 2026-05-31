import React from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, PauseCircle } from 'lucide-react';

const MessageNode: React.FC<{ data: any }> = ({ data }) => {
  const isWaiting = !!data.waitForInput;
  return (
    <div className={`px-4 py-3 bg-[#0a0e27] dark:bg-gray-700 rounded-lg shadow-lg border-2 min-w-[200px] max-w-[280px] ${
      isWaiting ? 'border-orange-400' : 'border-blue-400'
    }`}>
      <Handle type="target" position={Position.Top} className={`w-3 h-3 ${isWaiting ? 'bg-orange-500' : 'bg-blue-500'}`} />
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className={`w-4 h-4 ${isWaiting ? 'text-orange-500' : 'text-blue-500'}`} />
        <span className="font-medium text-white">Message</span>
        {isWaiting && (
          <span className="ml-auto flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 px-1.5 py-0.5 rounded-full">
            <PauseCircle className="w-3 h-3" />
            Wait
          </span>
        )}
      </div>
      <p className="text-sm text-gray-400 dark:text-gray-300 line-clamp-3">
        {data.message || 'Enter message...'}
      </p>
      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${isWaiting ? 'bg-orange-500' : 'bg-blue-500'}`} />
    </div>
  );
};

export default MessageNode;