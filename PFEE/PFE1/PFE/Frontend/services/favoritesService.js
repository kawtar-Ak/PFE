import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'football_favorites';
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('Erreur listener favoris:', error);
    }
  });
};

export const favoritesService = {
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getFavorites: async () => {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur getFavorites:', error);
      return [];
    }
  },

  isFavorite: async (matchId) => {
    try {
      const favorites = await favoritesService.getFavorites();
      return favorites.some((favorite) => favorite._id === matchId);
    } catch (error) {
      console.error('Erreur isFavorite:', error);
      return false;
    }
  },

  toggleFavorite: async (match) => {
    try {
      const favorites = await favoritesService.getFavorites();
      const exists = favorites.some((favorite) => favorite._id === match._id);

      const updatedFavorites = exists
        ? favorites.filter((favorite) => favorite._id !== match._id)
        : [...favorites, match];

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      notifyListeners();

      return {
        ok: true,
        isFavorite: !exists,
        favorites: updatedFavorites,
      };
    } catch (error) {
      console.error('Erreur toggleFavorite:', error);
      return {
        ok: false,
        isFavorite: false,
        favorites: [],
      };
    }
  },

  removeFavorite: async (matchId) => {
    try {
      const favorites = await favoritesService.getFavorites();
      const updatedFavorites = favorites.filter((favorite) => favorite._id !== matchId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      notifyListeners();
      return { ok: true, favorites: updatedFavorites };
    } catch (error) {
      console.error('Erreur removeFavorite:', error);
      return { ok: false, favorites: [] };
    }
  },

  clearFavorites: async () => {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      notifyListeners();
      return { ok: true };
    } catch (error) {
      console.error('Erreur clearFavorites:', error);
      return { ok: false };
    }
  },
};
