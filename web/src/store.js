import { create } from 'zustand'

export const useAppStore = create((set) => ({
  user: {
    id: 'user-123',
    name: 'Alex',
    email: 'alex@example.com',
    xp: 1240,
    streak: 12,
    tier: 'free',
  },
  setUser: (user) => set({ user }),
  
  translation: {
    sourceLanguage: 'en',
    targetLanguage: 'es',
    history: [],
  },
  setTranslation: (translation) => set({ translation }),
  
  addTranslationHistory: (entry) =>
    set((state) => ({
      translation: {
        ...state.translation,
        history: [entry, ...state.translation.history].slice(0, 10),
      },
    })),

  payment: {
    selectedTier: null,
    selectedChain: 'polygon',
    status: null,
  },
  setPayment: (payment) => set({ payment }),
}))
