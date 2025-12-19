import { Niche } from '../types';

const getStorageKey = (userId: string) => `nichescope_saved_${userId}`;

export const storageService = {
  saveNiche: (userId: string, niche: Niche) => {
    const key = getStorageKey(userId);
    const savedStr = localStorage.getItem(key);
    const saved: Niche[] = savedStr ? JSON.parse(savedStr) : [];

    // Check for duplicates based on ID or Name + Description to be safe
    if (!saved.find(n => n.id === niche.id || n.name === niche.name)) {
      // Assign a persistent ID if it doesn't have one or relies on session ID
      const nicheToSave = { ...niche, id: niche.id || `saved_${Date.now()}` };
      const updated = [nicheToSave, ...saved];
      localStorage.setItem(key, JSON.stringify(updated));
    }
  },

  removeNiche: (userId: string, nicheId: string) => {
    const key = getStorageKey(userId);
    const savedStr = localStorage.getItem(key);
    if (!savedStr) return;

    const saved: Niche[] = JSON.parse(savedStr);
    const updated = saved.filter(n => n.id !== nicheId);
    localStorage.setItem(key, JSON.stringify(updated));
  },

  getSavedNiches: (userId: string): Niche[] => {
    const key = getStorageKey(userId);
    const savedStr = localStorage.getItem(key);
    return savedStr ? JSON.parse(savedStr) : [];
  }
};