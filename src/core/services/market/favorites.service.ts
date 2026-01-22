/**
 * Favorites Service
 * Manages user's favorite market symbols using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@elsaif_favorites';

export interface FavoritesService {
    getFavorites: () => Promise<string[]>;
    addFavorite: (symbol: string) => Promise<void>;
    removeFavorite: (symbol: string) => Promise<void>;
    isFavorite: (symbol: string, favorites: string[]) => boolean;
}

class FavoritesServiceImpl implements FavoritesService {
    async getFavorites(): Promise<string[]> {
        try {
            const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('[Favorites] Failed to get favorites:', error);
            return [];
        }
    }

    async addFavorite(symbol: string): Promise<void> {
        try {
            const favorites = await this.getFavorites();
            if (!favorites.includes(symbol)) {
                favorites.push(symbol);
                await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
            }
        } catch (error) {
            console.error('[Favorites] Failed to add favorite:', error);
        }
    }

    async removeFavorite(symbol: string): Promise<void> {
        try {
            const favorites = await this.getFavorites();
            const updated = favorites.filter(s => s !== symbol);
            await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('[Favorites] Failed to remove favorite:', error);
        }
    }

    isFavorite(symbol: string, favorites: string[]): boolean {
        return favorites.includes(symbol);
    }
}

export const favoritesService = new FavoritesServiceImpl();
