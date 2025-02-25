export class HateManager {
    constructor() {
        this.hated = new Set();
        this.STORAGE_KEY = 'videoHated'
        this.loadHated();
    }

    toggleHate(videoTitle) {
        if (this.hated.has(videoTitle)) {
            console.log(`Removing video from hated: "${videoTitle}"`);
            this.hated.delete(videoTitle);
        } else {
            console.log(`Adding video to hated: "${videoTitle}"`);
            this.hated.add(videoTitle);
        }
        this.saveHated();
        return this.hated.has(videoTitle);
    }

    isHated(videoTitle) {
        return this.hated.has(videoTitle);
    }

    loadHated() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.hated = new Set(JSON.parse(saved));
                console.log('Loaded video favorites:', Array.from(this.hated));
            } else {
                console.log('No saved video favorites found');
            }

        } catch (error) {
            console.error('Error loading hated:', error);
            this.hated = new Set();
        }
    }

    saveHated() {
        try {
            localStorage.setItem(this.STORAGE_KEY, 
                JSON.stringify(Array.from(this.hated)));
            console.log('Saved video hated:', Array.from(this.hated));
        } catch (error) {
            console.error('Error saving hated:', error);
        }
    }

    getAllHated() {
        return Array.from(this.hated);
    }
}