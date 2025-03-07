export class ScriptHateManager {
    constructor() {
        this.hatedScripts = new Map();
        this.STORAGE_KEY = 'scriptHated';
        this.loadHated();
    }

    toggleHate(videoPath, scriptName) {
        const key = `${videoPath}/${scriptName}`;
        if (this.hatedScripts.has(key)) {
            this.hatedScripts.delete(key);
            return false;
        } else {
            this.hatedScripts.set(key, true);
            return true;
        }
    }

    isHated(videoPath, scriptName) {
        const key = `${videoPath}/${scriptName}`;
        return this.hatedScripts.has(key);
    }

    loadHated() {
        try {
            const saved = localStorage.getItem('scriptHated');
            if (saved) {
                this.hatedScripts = new Map(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading hated scripts:', error);
            this.hatedScripts = new Map();
        }
    }

    saveHated() {
        try {
            localStorage.setItem('scriptHated', 
                JSON.stringify(Array.from(this.hatedScripts.entries())));
        } catch (error) {
            console.error('Error saving hated scripts:', error);
        }
    }

    getAllHated() {
        return Array.from(this.hatedScripts.keys());
    }

    clearhated() {
        try {
            this.hatedScripts.clear();
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('Cleared all script hated');
        } catch (error) {
            console.error('Error clearing script hated:', error);
        }
    }
}