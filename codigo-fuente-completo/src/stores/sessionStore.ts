import { create } from 'zustand';
import type { UserSession } from '@/types';

const demoSession: UserSession = {
  id: 'demo-owner',
  fullName: 'Owner Demo',
  email: 'owner@empresa.com',
  role: 'owner',
  companyId: 'demo-company',
  branchId: 'demo-branch',
  permissions: []
};

interface SessionState {
  session: UserSession | null;
  setSession: (session: UserSession | null) => void;
  useDemo: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: demoSession,
  setSession: (session) => set({ session }),
  useDemo: () => set({ session: demoSession })
}));
