// src/components/campaigns/SchedulePicker.tsx
import React from 'react';
import { Send, Clock, Calendar, AlertCircle } from 'lucide-react';

interface SchedulePickerProps {
  scheduleType: 'now' | 'later';
  onTypeChange: (type: 'now' | 'later') => void;
  scheduledDate: string;
  scheduledTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const SchedulePicker: React.FC<SchedulePickerProps> = ({
  scheduleType,
  onTypeChange,
  scheduledDate,
  scheduledTime,
  onDateChange,
  onTimeChange
}) => {
  const today = new Date().toISOString().split('T')[0];
  const minTime = scheduledDate === today
    ? new Date().toTimeString().slice(0, 5)
    : '00:00';

  return (
    <div className="space-y-6">
      {/* ── Schedule Type Selection ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Send Now */}
        <button
          type="button"
          onClick={() => onTypeChange('now')}
          className={`p-6 rounded-2xl border text-center transition-all duration-200 select-none ${scheduleType === 'now'
              ? 'border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/10'
              : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 shadow-sm'
            }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 transition-colors ${scheduleType === 'now' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
            }`}>
            <Send className="w-7 h-7" />
          </div>
          <h4 className={`font-bold text-base mb-1 ${scheduleType === 'now' ? 'text-emerald-950' : 'text-gray-900'
            }`}>
            Send Now
          </h4>
          <p className={`text-xs font-semibold ${scheduleType === 'now' ? 'text-emerald-800' : 'text-gray-500'
            }`}>
            Launch campaign broadcast queue immediately
          </p>
        </button>

        {/* Schedule */}
        <button
          type="button"
          onClick={() => onTypeChange('later')}
          className={`p-6 rounded-2xl border text-center transition-all duration-200 select-none ${scheduleType === 'later'
              ? 'border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/10'
              : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 shadow-sm'
            }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 transition-colors ${scheduleType === 'later' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
            }`}>
            <Clock className="w-7 h-7" />
          </div>
          <h4 className={`font-bold text-base mb-1 ${scheduleType === 'later' ? 'text-emerald-950' : 'text-gray-900'
            }`}>
            Schedule
          </h4>
          <p className={`text-xs font-semibold ${scheduleType === 'later' ? 'text-emerald-800' : 'text-gray-500'
            }`}>
            Set specific future date and time
          </p>
        </button>
      </div>

      {/* ── Schedule Details ── */}
      {scheduleType === 'later' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm animate-in fade-in duration-200">
          <h4 className="font-bold text-sm text-gray-900">Configure Date & Time</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Execution Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input aria-label="Send date"
                  type="date"
                  value={scheduledDate}
                  min={today}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-bold text-gray-900 transition-all"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Execution Time *
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input aria-label="Send time"
                  type="time"
                  value={scheduledTime}
                  min={scheduledDate === today ? minTime : undefined}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-bold text-gray-900 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Timezone: Indian Standard Time (IST / UTC+5:30)</span>
          </div>
        </div>
      )}

      {/* ── High-Contrast Best Practices Warning Box ── */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-950">
              WhatsApp Broadcast Best Practices
            </h4>
            <ul className="text-xs text-amber-900 font-semibold space-y-1 leading-relaxed">
              <li>• Avoid sending promotional broadcasts late at night (9 PM – 9 AM IST).</li>
              <li>• Highest open rates occur during business hours (10 AM – 6 PM IST).</li>
              <li>• Ensure all variables are correctly mapped to avoid broadcast rejections.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePicker;