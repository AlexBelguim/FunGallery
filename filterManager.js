export class FilterManager {
    constructor() {
        this.isPhoneMode = false;
        this.isPcMode = false;
        this.isFavMode = false;
        this.scriptMode = false; // 0 = off, 1 = any scripts, 2 = exactly 1 script, 3 = more than 1 script
        this.isHateMode = false
    }
    async filterVideos(videos, favVideos, hateVideos) {
        const pcVideos = document.querySelector('#pcContainer');
        const phoneVideos = document.querySelector('#phoneContainer');
    
        // Show/hide containers based on filter modes
        pcVideos.style.display = this.isPcMode ? 'none' : 'block';
        phoneVideos.style.display = this.isPhoneMode ? 'none' : 'block';
    
        // Filter videos within each container
        for (const wrapper of videos) {
            const video = wrapper.querySelector('video');
            if (!video) continue;
    
            try {
                const isFav = favVideos.includes(wrapper.querySelector('p').textContent);
                const isHate = hateVideos.includes(wrapper.querySelector('p').textContent)
                const funscriptCount = parseInt(wrapper.dataset.funscriptCount) || 0;
                
                wrapper.style.display = this.calculateVisibility(isFav, isHate, funscriptCount);
            } catch (error) {
                console.error('Error processing video:', error);
            }
        }
    }
    
    calculateVisibility(isFav, isHate, funscriptCount) {
        // Check favorites
        if (this.isFavMode && !isFav) return 'none';

        if (this.isHateMode && !isHate) return 'none'
    
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
}