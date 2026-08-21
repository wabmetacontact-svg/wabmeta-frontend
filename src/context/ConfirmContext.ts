// src/context/ConfirmContext.ts
import { createContext, useContext } from 'react';

export interface ConfirmOptions {
  title: string;
  /** Supporting line under the title. Say what will happen, not "are you sure". */
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` for destructive actions — irreversible deletes, revokes, wipes. */
  tone?: 'danger' | 'default';
  /**
   * When set, the confirm button stays disabled until the user types this exact
   * string. Reserve it for actions that cannot be undone at all.
   */
  requireTyped?: string;
}

export interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = (): ConfirmContextType['confirm'] => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx.confirm;
};
