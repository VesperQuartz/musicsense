import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/lib/storage';

type AppState = {
  count: number;
  increment: () => void;
  decrement: () => void;
};

type TokenAction = {
  access_token: string;
  setToken: (token: string) => void;
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

export const useTokenStore = create<TokenAction>()(
  persist(
    (set) => ({
      access_token: '',
      setToken: (token: string) => set(() => ({ access_token: token })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
