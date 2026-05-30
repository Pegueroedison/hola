import { create } from 'zustand';
import type { ModuleKey } from '@/types';

export interface AppSettings {
  appName: string;
  logoUrl?: string;
  darkMode: boolean;
  currency: string;
  moduleOrder: ModuleKey[];
  hiddenModules: ModuleKey[];
  ticketWidth: '58mm' | '80mm';
  notificationPromptSnoozeDays: number;
}

const defaultOrder: ModuleKey[] = [
  'dashboard', 'pos', 'inventory', 'sales', 'purchases', 'customers', 'suppliers',
  'receivables', 'payables', 'cash', 'accounting', 'payroll', 'hr', 'workflow',
  'labels', 'tickets', 'reports', 'authorizations', 'audit', 'settings'
];

interface SettingsState extends AppSettings {
  setDarkMode: (value: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  appName: import.meta.env.VITE_APP_NAME || 'ERP POS',
  darkMode: false,
  currency: 'DOP',
  moduleOrder: defaultOrder,
  hiddenModules: [],
  ticketWidth: '80mm',
  notificationPromptSnoozeDays: 15,
  setDarkMode: (darkMode) => set({ darkMode }),
  updateSettings: (settings) => set(settings)
}));
