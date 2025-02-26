export class FilterManager {
    constructor() {
        this.isPhoneMode = false;
        this.isPcMode = false;
        this.isFavMode = false;
        this.scriptMode = false; // 0 = off, 1 = any scripts, 2 = exactly 1 script, 3 = more than 1 script
        this.isHateMode = false;
        this.isListView = false; // Added for list view mode
    }
    
    async filterVideos(videos, favVideos, hateVideos) {
        console.log(favVideos)
        const pcVideos = document.querySelector('#pcContainer');
        const phoneVideos = document.querySelector('#phoneContainer');
    
        // Set container visibility based on filters
        if (!this.isListView) {
            // Normal grid view behavior
            pcVideos.style.display = this.isPcMode ? 'none' : 'block';
            phoneVideos.style.display = this.isPhoneMode ? 'none' : 'block';
        }
        
        // Filter videos within each container
        for (const wrapper of videos) {
            const video = wrapper.querySelector('video');
            if (!video) continue;
    
            try {
                const isFav =  [...favVideos].includes(wrapper.querySelector('p').textContent);
                const isHate = [...hateVideos].includes(wrapper.querySelector('p').textContent);
                const funscriptCount = parseInt(wrapper.dataset.funscriptCount) || 0;
                
                wrapper.style.display = this.calculateVisibility(isFav, isHate, funscriptCount);
                
                // Store the intended visibility state for use with list view
                wrapper.dataset.shouldBeVisible = (wrapper.style.display === 'none') ? 'false' : 'true';
            } catch (error) {
                console.error('Error processing video:', error);
            }
        }
        
        // After filtering, trigger a custom event to update list view if needed
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('filterComplete'));
        }, 10);
    }
    
    calculateVisibility(isFav, isHate, funscriptCount) {
        // Check favorites
        switch (this.isHateMode) {
            case 1: 
                if (isHate) return 'block';
                if (!isHate) return 'none';
            case 2: 
                if (isHate) return 'none';
        }
        
        switch (this.isFavMode) {
            case 1: 
                if (isFav) return 'block';
                if (!isFav) return 'none';
            case 2: 
                if (isFav) return 'none';
        }

        // Check script filter
        switch (this.scriptMode) {
            case 1: // Any scripts
                if (funscriptCount === 0) return 'none';
                break;
            case 2: // Exactly 1 script
                if (funscriptCount !== 1) return 'none';
                break;
            case 3: // More than 1 script
                if (funscriptCount <= 1) return 'none';
                break;
        }
    
        return 'block';
    }

    toggleMode(mode) {
        if (mode === 'scriptMode') {
            this.scriptMode = (this.scriptMode + 1) % 4;
            return this.scriptMode;
        }
        if (mode === 'isListView') {
            this.isListView = !this.isListView;
            return this.isListView;
        }

        if (mode === 'isFavMode') {
            this.isFavMode = (this.isFavMode + 1) % 3;
            return this.isFavMode;
        }

        if (mode === 'isHateMode') {
            this.isHateMode = (this.isHateMode + 1) % 3;
            return this.isHateMode;
        }
        
        this[mode] = !this[mode];
        return this[mode];
    }

    getScriptButtonState() {
        switch (this.scriptMode) {
            case 0: return { text: '📜 Script', color: '', bgColor: '' };
            case 1: return { text: '📜 Any', color: '#424242', bgColor: '#FFD700' };
            case 2: return { text: '📜 One', color: '#424242', bgColor: '#FFD700' };
            case 3: return { text: '📜 Many', color: '#424242', bgColor: '#FFD700' };
        }
    }

    getToggleFilterButtonState(mode, icon, text) {
        switch(this[mode]) {
            case 0: return { text: icon + " " + text, color: '', bgColor: ''};
            case 1: return { text: icon + " Only " + text, color: '#424242', bgColor: '#FFD700'};
            case 2: return { text: icon + " Not " + text, color: '#424242', bgColor: '#FFD700'};
            default: return { text: icon + " " + text, color: '', bgColor: '' };
        }
    }
}