import { create } from 'zustand';
import { createCandidate } from '../services/candidateService';

const useCandidateStore = create((set) => ({
    candidates: [],
    error: null,

    // Yeni aday ekleme işlevi
    addCandidate: async (candidateData) => {
        try {
            const newCandidate = await createCandidate(candidateData);
            set((state) => ({
                candidates: [...state.candidates, newCandidate],
                error: null,
            }));
        } catch (error) {
            set({ error: error.message });
            console.error('Error creating candidate:', error);
        }
    },

    // Hata durumunu sıfırlama işlevi (isteğe bağlı)
    clearError: () => set({ error: null }),
}));

export default useCandidateStore;
