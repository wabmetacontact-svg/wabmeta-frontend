import React from 'react';
import { Handle, Position } from 'reactflow';
import { List } from 'lucide-react';

const ListNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-700 rounded-lg shadow-lg border-2 border-indigo-400 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500" />
      <div className="flex items-center gap-2 mb-2">
        <List className="w-4 h-4 text-indigo-500" />
        <span className="font-medium text-gray-900 dark:text-white">List Options</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{data.message || 'Choose from list:'}</p>
      <div className="mb-2">
         <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
           {data.listButtonText || 'View Menu'}
         </span>
      </div>
      <div className="space-y-2 mt-3">
        {(data.listSections || []).map((sec: any, i: number) => (
          <div key={i} className="text-xs">
            {sec.title && <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1">{sec.title}</div>}
            <div className="space-y-1 pl-2 border-l-2 border-indigo-200 dark:border-indigo-800">
               {(sec.rows || []).map((row: any, j: number) => (
                 <div key={j} className="relative py-1">
                   <div className="text-gray-800 dark:text-gray-200">{row.title}</div>
                   {row.description && <div className="text-[10px] text-gray-400 truncate">{row.description}</div>}
                   <Handle
                     type="source"
                     position={Position.Right}
                     id={row.id}
                     className="w-2 h-2 bg-indigo-500"
                     style={{ top: '50%' }}
                   />
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListNode;
