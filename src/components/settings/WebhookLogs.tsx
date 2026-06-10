import React, { useState } from 'react';
import {
  CheckCircle2, XCircle, Filter, RefreshCw,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import type { WebhookLog } from '../../types/settings';

const WebhookLogs: React.FC = () => {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const logs: WebhookLog[] = [
    {
      id: 'evt_1',
      event: 'message_received',
      status: 'success',
      timestamp: '2024-01-20 10:30:45',
      payload: JSON.stringify({ type: 'text', from: '919876543210', content: 'Hello' }, null, 2),
    },
    {
      id: 'evt_2',
      event: 'message_status',
      status: 'success',
      timestamp: '2024-01-20 10:31:00',
      payload: JSON.stringify({ status: 'delivered', message_id: 'msg_123' }, null, 2),
    },
    {
      id: 'evt_3',
      event: 'template_update',
      status: 'failed',
      timestamp: '2024-01-20 10:35:12',
      payload: JSON.stringify({ error: 'Signature verification failed' }, null, 2),
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-900">Webhook Logs</h3>
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Items */}
      <div className="divide-y divide-slate-100">
        {logs.map((log) => (
          <div key={log.id} className="group">
            <div
              className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
            >
              <div className="flex items-center space-x-4">
                {log.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">{log.event}</p>
                  <p className="text-xs text-slate-500">{log.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {log.status.toUpperCase()}
                </span>
                {expandedLog === log.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {expandedLog === log.id && (
              <div className="px-4 pb-4 bg-slate-50">
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto font-mono">
                  {log.payload}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebhookLogs;