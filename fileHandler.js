export class FileHandler {
    static async getVideosFromFiles(files) {
        const videos = [];
        const funscripts = [];
        const scriptsByPath = new Map();
        
        // First, process funscripts
        for (const file of files) {
            if (file.name.toLowerCase().endsWith('.funscript')) {
                const fullPath = this.getFullPath(file.webkitRelativePath);
                
                if (!scriptsByPath.has(fullPath)) {
                    scriptsByPath.set(fullPath, []);
                }
                
                const content = await this.readFile(file);
                scriptsByPath.get(fullPath).push(file.name);
                funscripts.push({ content, fullPath, fileName: file.name });
            }
        }

        // Then process videos
        for (const file of files) {
            if (!file.isDirectory && file.name.match(/\.(mp4|webm|ogg|mkv)$/i)) {
                const fullPath = this.getFullPath(file.webkitRelativePath);
                const scriptsInFolder = scriptsByPath.get(fullPath) || [];
                
                // Create video element to check orientation
                const video = document.createElement('video');
                video.preload = 'metadata';
                
                try {
                    const isPortrait = await new Promise((resolve) => {
                        video.onloadedmetadata = () => {
                            const isPortrait = video.videoHeight > video.videoWidth;
                            URL.revokeObjectURL(video.src);
                            resolve(isPortrait);
                        };
                        
                        video.onerror = () => {
                            console.error('Error loading video metadata:', file.name);
                            URL.revokeObjectURL(video.src);
                            resolve(false); // Default to landscape on error
                        };
                        
                        video.src = URL.createObjectURL(file);
                    });

                    console.log(`Video ${file.name}: ${isPortrait ? 'portrait' : 'landscape'}`);
                    
                    videos.push({ 
                        file, 
                        fullPath,
                        funscriptCount: scriptsInFolder.length,
                        scriptNames: scriptsInFolder,
                        isPortrait: isPortrait
                    });
                } catch (error) {
                    console.error('Error processing video:', file.name, error);
                    // Add video anyway with default orientation
                    videos.push({ 
                        file, 
                        fullPath,
                        funscriptCount: scriptsInFolder.length,
                        scriptNames: scriptsInFolder,
                        isPortrait: false // Default to landscape
                    });
                }
            }
        }

        return [videos, funscripts];
    }

    static getFullPath(webkitRelativePath) {
        const parts = webkitRelativePath.split('/');
        return parts.slice(0, -1).join('/');
    }

    static async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }
}