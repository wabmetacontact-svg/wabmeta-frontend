import React from 'react';
import { Handle, Position } from 'reactflow';
import { MousePointer } from 'lucide-react';

const ButtonNode: React.FC<{ data: any; selected?: boolean }> = ({ 
  data, 
  selected 
}) => {
  const buttons = data.buttons || [];

  return (
    <div className={`
      px-4 py-3 bg-[#0a0e27] dark:bg-gray-700 rounded-xl shadow-lg 
      border-2 min-w-[220px] max-w-[280px] transition-all
      ${selected 
        ? 'border-purple-600 shadow-purple-200 dark:shadow-purple-900' 
        : 'border-purple-400'
      }
    `}>
      {/* Input */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-purple-500 !border-2 !border-white" 
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-purple-100 dark:bg-purple-900/40 rounded">
          <MousePointer className="w-3 h-3 text-purple-600 dark:text-purple-400" />
        </div>
        <span className="font-semibold text-white text-sm">
          Buttons
        </span>
        <span className="ml-auto text-[10px] text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded-full">
          {buttons.length}/3
        </span>
      </div>

      {/* Message Preview */}
      {data.message && (
        <p className="text-xs text-gray-400 mb-2 bg-[#0a0e27] rounded p-1.5 line-clamp-2">
          {data.message}
        </p>
      )}

      {/* Buttons - har button ka apna source handle */}
      <div className="space-y-1.5">
        {buttons.map((btn: any, i: number) => (
          <div key={btn.id || i} className="relative flex items-center">
            {/* Button display */}
            <div className="flex-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium border border-purple-200 dark:border-purple-700 pr-6">
              <span className="text-purple-400 mr-1">{i + 1}.</span>
              {btn.text || `Button ${i + 1}`}
            </div>

            {/* ✅ CRITICAL: har button ka unique sourceHandle = btn.id */}
            <Handle
              type="source"
              position={Position.Right}
              id={btn.id}
              className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
              style={{ 
                right: -6,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {buttons.length === 0 && (
        <div className="text-center py-2 text-xs text-gray-400">
          No buttons added
        </div>
      )}

      {/* Info */}
      <div className="mt-2 text-[10px] text-purple-500 dark:text-purple-400 text-center">
        Connect each button to a different node →
      </div>
    </div>
  );
};

export default ButtonNode;
