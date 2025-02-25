export class FavoriteManager {
    constructor() {
        this.favorites = new Set();
        this.STORAGE_KEY = 'videoFavorites';
        this.loadFavorites();
    }

    toggleFavorite(videoTitle) {
        if (this.favorites.has(videoTitle)) {
            console.log(`Removing video from favorites: "${videoTitle}"`);
            this.favorites.delete(videoTitle);
        } else {
            console.log(`Adding video to favorites: "${videoTitle}"`);
            this.favorites.add(videoTitle);
        }
        this.saveFavorites();
        return this.favorites.has(videoTitle);
    }

    isFavorite(videoTitle) {
        return this.favorites.has(videoTitle);
    }

    loadFavorites() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.favorites = new Set(JSON.parse(saved));
                console.log('Loaded video favorites:', Array.from(this.favorites));
            } else {
                console.log('No saved video favorites found');
            }
        } catch (error) {
            console.error('Error loading video favorites:', error);
            this.favorites = new Set();
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem(this.STORAGE_KEY, 
                JSON.stringify(Array.from(this.favorites)));
            console.log('Saved video favorites:', Array.from(this.favorites));
        } catch (error) {
            console.error('Error saving video favorites:', error);
        }
    }

    clearFavorites() {
        try {
            this.favorites.clear();
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('Cleared all video favorites');
        } catch (error) {
            console.error('Error clearing video favorites:', error);
        }
    }

    getAllFavorites() {
        return Array.from(this.favorites);
    }
}