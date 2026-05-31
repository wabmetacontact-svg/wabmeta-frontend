import React from 'react';
import { Handle, Position } from 'reactflow';
import { List } from 'lucide-react';

const ListNode: React.FC<{ data: any; selected?: boolean }> = ({ 
  data, 
  selected 
}) => {
  const sections = data.listSections || [];
  
  // All rows flatten karo count ke liye
  const totalRows = sections.reduce(
    (acc: number, sec: any) => acc + (sec.rows?.length || 0), 0
  );

  return (
    <div className={`
      px-4 py-3 bg-[#0a0e27] dark:bg-gray-700 rounded-xl shadow-lg 
      border-2 min-w-[230px] max-w-[300px] transition-all
      ${selected 
        ? 'border-indigo-600 shadow-indigo-200 dark:shadow-indigo-900' 
        : 'border-indigo-400'
      }
    `}>
      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-indigo-500 !border-2 !border-white" 
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 bg-indigo-100 dark:bg-indigo-900/40 rounded">
          <List className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="font-semibold text-white text-sm">
          List Menu
        </span>
        <span className="ml-auto text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded-full">
          {totalRows} options
        </span>
      </div>

      {/* Message Preview */}
      {data.message && (
        <p className="text-xs text-gray-400 mb-2 bg-[#0a0e27] rounded p-1.5 line-clamp-2">
          {data.message}
        </p>
      )}

      {/* Menu Button */}
      <div className="mb-3">
        <span className="text-xs font-medium px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-700">
          📋 {data.listButtonText || 'View Options'}
        </span>
      </div>

      {/* Sections & Rows */}
      <div className="space-y-2">
        {sections.map((sec: any, sIdx: number) => (
          <div key={sIdx}>
            {/* Section Title */}
            {sec.title && (
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                {sec.title}
              </div>
            )}

            {/* Rows */}
            <div className="space-y-1 pl-2 border-l-2 border-indigo-200 dark:border-indigo-700">
              {(sec.rows || []).map((row: any, rIdx: number) => (
                <div key={row.id || rIdx} className="relative flex items-center">
                  {/* Row display */}
                  <div className="flex-1 py-1 pr-6">
                    <div className="text-xs text-gray-200 font-medium leading-tight">
                      {row.title || `Option ${rIdx + 1}`}
                    </div>
                    {row.description && (
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                        {row.description}
                      </div>
                    )}
                  </div>

                  {/* ✅ CRITICAL: har row ka unique sourceHandle = row.id */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={row.id}
                    className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white"
                    style={{
                      right: -6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {totalRows === 0 && (
        <div className="text-center py-2 text-xs text-gray-400">
          No options added
        </div>
      )}

      {/* Info */}
      <div className="mt-2 text-[10px] text-indigo-500 dark:text-indigo-400 text-center">
        Connect each option to a different node →
      </div>
    </div>
  );
};

export default ListNode;
