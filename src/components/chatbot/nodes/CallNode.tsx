import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Phone, PhoneOff } from 'lucide-react';

const CallNode: React.FC<{ data: any }> = ({ data }) => {
  const isHangup = data.callAction === 'hangup';
  return (
    <div className={`px-4 py-3 bg-[#0a0e27] rounded-lg shadow-lg border-2 min-w-[180px] ${isHangup ? 'border-red-400' : 'border-green-400'}`}>
      <Handle type="target" position={Position.Top} className={`w-3 h-3 ${isHangup ? 'bg-red-500' : 'bg-green-500'}`} />
      <div className="flex items-center gap-2 mb-1">
        {isHangup ? (
          <PhoneOff className="w-4 h-4 text-red-500" />
        ) : (
          <Phone className="w-4 h-4 text-green-500" />
        )}
        <span className="font-medium text-white">{isHangup ? 'End Call' : 'Call'}</span>
      </div>
      <p className="text-xs text-gray-500">
        {isHangup ? 'Hang up the call' : `Max duration: ${data.callDuration || 60}s${data.callRecording ? ' • Recording ON' : ''}`}
      </p>
      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${isHangup ? 'bg-red-500' : 'bg-green-500'}`} />
    </div>
  );
};

export default CallNode;