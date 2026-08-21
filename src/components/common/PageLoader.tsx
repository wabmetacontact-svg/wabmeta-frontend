import React, { useEffect, useState } from 'react';

interface PageLoaderProps {
  /** Milliseconds to wait before showing anything. */
  delay?: number;
  label?: string;
  /** Fill the viewport height instead of sitting inline in the content area. */
  full?: boolean;
}

/**
 * The app's single loading state.
 *
 * It stays blank for the first `delay` ms, so anything that resolves quickly
 * shows nothing at all rather than flashing a spinner — a flash of loading UI
 * reads as slower than no loading UI.
 *
 * This deliberately does not mimic the page being loaded. A skeleton that
 * guesses wrong (stat cards and a chart in front of a detail page) makes the
 * wait feel longer, because the layout visibly changes when the real content
 * arrives.
 */
const PageLoader: React.FC<PageLoaderProps> = ({
  delay = 150,
  label = 'Loading…',
  full = false,
}) => {
  const [show, setShow] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!show) return null;

  return (
    <div
      className={`w-full flex items-center justify-center ${full ? 'min-h-[60vh]' : 'py-20'}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    </div>
  );
};

export default PageLoader;
