import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  /** What failed, in the user's terms. */
  message?: string;
  onRetry?: () => void;
  title?: string;
}

/**
 * Shown in place of a list when its fetch failed.
 *
 * A failed load must not fall through to the empty state: "No chatbots yet —
 * create your first one" is a lie when the request errored, and it pushes people
 * to re-create data they already have.
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Couldn't load this",
  message,
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
      <AlertCircle className="w-6 h-6 text-red-500" />
    </div>

    <p className="text-gray-900 font-semibold mb-1">{title}</p>
    <p className="text-sm text-gray-500 max-w-sm">
      {message || 'Something went wrong on our side. Your data is safe.'}
    </p>

    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Try again
      </button>
    )}
  </div>
);

export default ErrorState;
