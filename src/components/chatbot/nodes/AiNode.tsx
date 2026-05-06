import React from 'react';
import { Handle, Position } from 'reactflow';
import { MessageCircle, Brain } from 'lucide-react';

const AiNode: React.FC<{ data: any; selected?: boolean }> = ({ 
  data, 
  selected 
}) => {
  const hasPrompt = data.systemPrompt && data.systemPrompt.trim().length > 0;
  
  return (
    <div className={`
      px-4 py-3 bg-white dark:bg-gray-700 rounded-xl shadow-lg 
      border-2 min-w-[220px] max-w-[300px] transition-all
      ${selected 
        ? 'border-emerald-500 shadow-emerald-200 dark:shadow-emerald-900' 
        : 'border-emerald-400'
      }
    `}>
      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-emerald-500 !border-2 !border-white" 
      />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
          <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          Gemini AI
        </span>
        <span className="ml-auto flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
          <MessageCircle className="w-3 h-3" />
          Smart Chat
        </span>
      </div>

      {/* System Prompt Preview */}
      <div className="mb-2">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">
          System Prompt:
        </p>
        <div className={`
          text-xs rounded-lg p-2 max-h-16 overflow-hidden
          ${hasPrompt 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300' 
            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 italic'
          }
        `}>
          {hasPrompt 
            ? data.systemPrompt.substring(0, 100) + (data.systemPrompt.length > 100 ? '...' : '')
            : 'No system prompt set...'
          }
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-1 mb-2">
        {[
          { icon: '🧠', label: 'Context Memory' },
          { icon: '💬', label: 'Natural Chat' },
          { icon: '🌐', label: 'Hindi + English' },
          { icon: '⚡', label: 'Fast Replies' },
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
            <span>{feature.icon}</span>
            <span>{feature.label}</span>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg text-center font-medium">
        💬 AI continuously chats with user
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-emerald-500 !border-2 !border-white" 
      />
    </div>
  );
};

export default AiNode;
