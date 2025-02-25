export class ScriptFavoriteManager {
    constructor() {
        this.favScripts = new Map();
        this.STORAGE_KEY = 'scriptFavorites';
        this.loadFavorites();
    }

    toggleFavorite(videoPath, scriptName) {
        const currentFav = this.favScripts.get(videoPath);
        
        if (currentFav === scriptName) {
            console.log(`Unfavoriting script "${scriptName}" for video at ${videoPath}`);
            this.favScripts.delete(videoPath);
            this.saveFavorites();
            return null;
        } else {
            console.log(`Favoriting script "${scriptName}" for video at ${videoPath}`);
            if (currentFav) {
                console.log(`Replacing previous favorite "${currentFav}"`);
            }
            this.favScripts.set(videoPath, scriptName);
            this.saveFavorites();
            return scriptName;
        }
    }

    getFavoriteScript(videoPath) {
        const favorite = this.favScripts.get(videoPath);
        if (favorite) {
            console.log(`Found favorite script "${favorite}" for video at ${videoPath}`);
        }
        return favorite || null;
    }

    loadFavorites() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.favScripts = new Map(JSON.parse(saved));
                console.log('Loaded script favorites:', 
                    Object.fromEntries(this.favScripts.entries()));
            } else {
                console.log('No saved script favorites found');
            }
        } catch (error) {
            console.error('Error loading script favorites:', error);
            this.favScripts = new Map();
        }
    }

    saveFavorites() {
        try {
            const saveData = Array.from(this.favScripts.entries());
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
            console.log('Saved script favorites:', 
                Object.fromEntries(this.favScripts.entries()));
        } catch (error) {
            console.error('Error saving script favorites:', error);
        }
    }

    clearFavorites() {
        try {
            this.favScripts.clear();
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('Cleared all script favorites');
        } catch (error) {
            console.error('Error clearing script favorites:', error);
        }
    }

    getAllFavorites() {
        return Object.fromEntries(this.favScripts.entries());
    }
}