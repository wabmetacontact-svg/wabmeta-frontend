import { createContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeResolved = 'light' | 'dark';

export interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ThemeResolved;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
