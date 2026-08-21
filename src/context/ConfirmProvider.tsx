// src/context/ConfirmProvider.tsx
//
// Promise-based replacement for window.confirm(). Native confirm blocks the
// whole page, can't be styled, and is suppressed outright in some browsers —
// so a "delete" that silently never happens looks like a broken button.
//
//   const confirm = useConfirm();
//   if (!(await confirm({ title: 'Delete this contact?', tone: 'danger' }))) return;

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../components/common/Modal';
import { ConfirmContext, type ConfirmOptions } from './ConfirmContext';

type PendingState = ConfirmOptions & { isOpen: boolean };

const CLOSED: PendingState = { isOpen: false, title: '' };

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PendingState>(CLOSED);
  const [typed, setTyped] = useState('');
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState(CLOSED);
    setTyped('');
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    // A second call while one is open cancels the first rather than orphaning
    // its promise.
    resolverRef.current?.(false);
    setTyped('');
    setState({ ...options, isOpen: true });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const isDanger = state.tone === 'danger';
  const typedOk = !state.requireTyped || typed === state.requireTyped;

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Modal
        isOpen={state.isOpen}
        onClose={() => settle(false)}
        size="sm"
        showClose={false}
      >
        <div className="flex gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDanger ? 'bg-red-50' : 'bg-amber-50'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${isDanger ? 'text-red-600' : 'text-amber-600'}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              {state.title}
            </h2>
            {state.message && (
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                {state.message}
              </p>
            )}

            {state.requireTyped && (
              <div className="mt-4">
                <label
                  htmlFor="confirm-typed"
                  className="block text-xs font-medium text-gray-700 mb-1.5"
                >
                  Type <span className="font-bold">{state.requireTyped}</span> to confirm
                </label>
                <input
                  id="confirm-typed"
                  type="text"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => settle(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              >
                {state.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                disabled={!typedOk}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                  isDanger
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                }`}
              >
                {state.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
