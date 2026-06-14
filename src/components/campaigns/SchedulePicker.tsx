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
      {/* Schedule Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Send Now */}
        <button
          onClick={() => onTypeChange('now')}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            scheduleType === 'now'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5'
          }`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
            scheduleType === 'now'
              ? 'bg-emerald-100 dark:bg-emerald-500/20'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Send className={`w-7 h-7 ${
              scheduleType === 'now'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 dark:text-gray-400'
            }`} />
          </div>
          <h4 className={`font-semibold mb-1 ${
            scheduleType === 'now'
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-gray-900 dark:text-white'
          }`}>
            Send Now
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Start campaign immediately
          </p>
        </button>

        {/* Schedule */}
        <button
          onClick={() => onTypeChange('later')}
          className={`p-6 rounded-xl border-2 text-center transition-all ${
            scheduleType === 'later'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5'
          }`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
            scheduleType === 'later'
              ? 'bg-emerald-100 dark:bg-emerald-500/20'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Clock className={`w-7 h-7 ${
              scheduleType === 'later'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-500 dark:text-gray-400'
            }`} />
          </div>
          <h4 className={`font-semibold mb-1 ${
            scheduleType === 'later'
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-gray-900 dark:text-white'
          }`}>
            Schedule
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send at a specific time
          </p>
        </button>
      </div>

      {/* Schedule Details */}
      {scheduleType === 'later' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4 animate-fade-in">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Schedule Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="date"
                  value={scheduledDate}
                  min={today}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="time"
                  value={scheduledTime}
                  min={scheduledDate === today ? minTime : undefined}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Timezone Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Timezone: India Standard Time (IST)</span>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
              Best Practices
            </h4>
            <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
              <li>• Avoid sending messages between 9 PM - 9 AM</li>
              <li>• Best engagement is typically during 10 AM - 6 PM</li>
              <li>• Consider your audience's timezone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePicker;