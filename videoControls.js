import { showScriptModal } from "./modals/scriptModal.js";

export function createVideoWrapper(videoData, funscripts, favoriteManager, handyManager, scriptFavoriteManager, scriptHateManager, currentVideoWrapper, currentVideo, hateManager) {
    // Add defensive check for videoData
    if (!videoData) {
        console.error('🔴 createVideoWrapper called with undefined videoData');
        return document.createElement('div'); // Return empty div to prevent further errors
    }
    
    console.log(`🎬 Creating video wrapper for: ${videoData.file.name}`);
    
    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper';
    
    // Add orientation class with defensive programming
    if (videoData.isPortrait === true) {
        wrapper.classList.add('portrait');
        console.log(`📱 Video orientation: portrait - ${videoData.file.name}`);
    } else {
        wrapper.classList.add('landscape');
        console.log(`🖥️ Video orientation: landscape - ${videoData.file.name}`);
    }
    
    wrapper.dataset.funscriptCount = videoData.funscriptCount;

    // Create video container
    console.log(`📼 Creating video element for: ${videoData.file.name}`);
    const video = document.createElement('video');
    
    // Force preload of video data
    video.preload = 'auto';
    console.log(`⚙️ Set preload=auto for: ${videoData.file.name}`);
    
    // Set up event listeners before setting source
    console.log(`📡 Adding event listeners for: ${videoData.file.name}`);
    
    video.addEventListener('loadstart', () => {
        console.log(`🚀 loadstart event fired for: ${videoData.file.name}`);
    });
    
    video.addEventListener('durationchange', () => {
        console.log(`⏱️ durationchange event fired for: ${videoData.file.name}, duration: ${video.duration}`);
    });
    
    video.addEventListener('loadedmetadata', () => {
        console.log(`📊 Metadata loaded for: ${videoData.file.name}`);
        console.log(`📐 Video dimensions: ${video.videoWidth}x${video.videoHeight}`);
        console.log(`⏳ Video duration: ${video.duration}`);
        
        // Delayed setting of preview to ensure video has time to process metadata
        console.log(`⏰ Setting timeout to set preview for: ${videoData.file.name}`);
        setTimeout(() => {
            if (video.duration && isFinite(video.duration)) {
                const midpoint = video.duration / 2;
                console.log(`⏩ Setting preview time to ${midpoint.toFixed(2)}s for: ${videoData.file.name}`);
                try {
                    video.currentTime = midpoint;
                    console.log(`✅ Preview time set successfully for: ${videoData.file.name}`);
                } catch (error) {
                    console.error(`🔴 Error setting preview time for: ${videoData.file.name}`, error);
                }
            } else {
                console.warn(`⚠️ Invalid duration for: ${videoData.file.name}: ${video.duration}`);
            }
        }, 300); // Increased delay to give more time
    });
    
    video.addEventListener('seeked', () => {
        console.log(`⏭️ Video seeked event fired for: ${videoData.file.name}, currentTime: ${video.currentTime}`);
    });
    
    // Add an additional listener for when the video can actually play
    video.addEventListener('canplay', () => {
        console.log(`🎮 canplay event fired for: ${videoData.file.name}`);
        if (!wrapper.classList.contains('video-loaded')) {
            console.log(`🟢 Marking video as loaded: ${videoData.file.name}`);
            wrapper.classList.add('video-loaded');
        }
    });
    
    video.addEventListener('canplaythrough', () => {
        console.log(`🎯 canplaythrough event fired for: ${videoData.file.name} - video can play without buffering`);
    });
    
    video.addEventListener('error', (e) => {
        console.error(`🔴 Video error for: ${videoData.file.name}`, video.error);
        console.error(`🔴 Error details - code: ${video.error?.code}, message: ${video.error?.message}`);
    });
    
    // Set source after adding event listeners
    try {
        console.log(`🔗 Creating object URL for: ${videoData.file.name}`);
        video.src = URL.createObjectURL(videoData.file);
        console.log(`📌 Source set for: ${videoData.file.name} - ${video.src}`);
    } catch (error) {
        console.error(`🔴 Error creating object URL for: ${videoData.file.name}`, error);
    }
    
    video.controls = true;
    console.log(`🎛️ Video controls enabled for: ${videoData.file.name}`);

    const title = document.createElement('p');
    title.textContent = videoData.file.name;

    // Add funscript count display with tooltip and click functionality
    const funscriptInfo = document.createElement('span');
    funscriptInfo.className = 'funscript-count';
    funscriptInfo.textContent = `📜 ${videoData.funscriptCount}`;
    console.log(`📜 Funscript count for ${videoData.file.name}: ${videoData.funscriptCount}`);

    if (videoData.funscriptCount > 0) {
        funscriptInfo.style.cursor = 'pointer';
        funscriptInfo.addEventListener('click', () => {
            console.log(`📜 Funscript info clicked for: ${videoData.file.name}`);
            showScriptModal(videoData, funscripts, scriptFavoriteManager, scriptHateManager, wrapper);
        });
    }

    
    // Style the funscript count
    funscriptInfo.style.position = 'absolute';
    funscriptInfo.style.top = '15px';
    funscriptInfo.style.left = '15px';
    funscriptInfo.style.padding = '5px 10px';
    funscriptInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    funscriptInfo.style.borderRadius = '5px';
    funscriptInfo.style.cursor = 'pointer';

    const favoriteButton = createFavoriteButton(title.textContent, favoriteManager);
    const handyButton = createHandyButton(videoData, funscripts, video, handyManager, scriptFavoriteManager);
    const hateButton = createHateButton(title.textContent, hateManager);

    wrapper.appendChild(video);
    wrapper.appendChild(title);
    wrapper.appendChild(funscriptInfo);
    wrapper.appendChild(favoriteButton);
    wrapper.appendChild(handyButton);
    wrapper.appendChild(hateButton);
    
    console.log(`✅ Video wrapper fully created for: ${videoData.file.name}`);
    
    // Log the current readyState
    const readyStateMap = [
        'HAVE_NOTHING(0) - No information',
        'HAVE_METADATA(1) - Duration and dimensions available',
        'HAVE_CURRENT_DATA(2) - Current frame available',
        'HAVE_FUTURE_DATA(3) - Next frame available',
        'HAVE_ENOUGH_DATA(4) - Enough data to play through'
    ];
    console.log(`🔄 Current readyState for ${videoData.file.name}: ${readyStateMap[video.readyState] || video.readyState}`);

    return wrapper;
}

function createFavoriteButton(videoTitle, favoriteManager) {
    console.log(`⭐ Creating favorite button for: ${videoTitle}`);
    const button = document.createElement('button');
    button.className = 'favorite-button';
    
    // Set initial state
    if (favoriteManager.isFavorite(videoTitle)) {
        button.textContent = '⭐';
        button.classList.add('favorited');
        console.log(`⭐ Video is favorited: ${videoTitle}`);
    } else {
        button.textContent = '☆';
        console.log(`☆ Video is not favorited: ${videoTitle}`);
    }
    
    button.addEventListener('click', () => {
        const isNowFavorite = favoriteManager.toggleFavorite(videoTitle);
        button.textContent = isNowFavorite ? '⭐' : '☆';
        button.classList.toggle('favorited', isNowFavorite);
        console.log(`${isNowFavorite ? '⭐' : '☆'} Favorite toggled for: ${videoTitle}, is now: ${isNowFavorite ? 'favorited' : 'not favorited'}`);
    });
    
    return button;
}

function createHandyButton(videoData, funscripts, video, handyManager, scriptFavoriteManager) {
    console.log(`🤖 Creating Handy button for: ${videoData.file.name}`);
    const button = document.createElement('button');
    button.textContent = '🤖';
    button.className = 'handy-button';

    const matchingScripts = funscripts.filter(script => 
        script.fullPath === videoData.fullPath
    );
    
    console.log(`🤖 Found ${matchingScripts.length} matching scripts for: ${videoData.file.name}`);

    if (matchingScripts.length > 0) {
        button.addEventListener('click', () => {
            console.log(`🤖 Handy button clicked for: ${videoData.file.name}`);
            const handyCodeInput = document.getElementById('handyCodeInput');
            const handyCode = handyCodeInput.value.trim();
            
            if (!handyCode) {
                console.warn(`⚠️ No Handy code entered for: ${videoData.file.name}`);
                alert('Please enter a Handy code in the input field at the top');
                handyCodeInput.focus();
                return;
            }
            
            console.log(`🤖 Handy code entered for: ${videoData.file.name}: ${handyCode}`);

            // Get selected script or favorite script or default to first one
            let selectedIndex = parseInt(video.closest('.video-wrapper').dataset.selectedScript);
            console.log(`🤖 Initial selectedIndex for ${videoData.file.name}: ${selectedIndex}`);
            
            if (isNaN(selectedIndex)) {
                const favScript = scriptFavoriteManager.getFavoriteScript(videoData.fullPath);
                console.log(`🤖 Favorite script for ${videoData.file.name}: ${favScript || 'none'}`);
                selectedIndex = favScript ? 
                    matchingScripts.findIndex(s => s.fileName === favScript) : 0;
                console.log(`🤖 Updated selectedIndex for ${videoData.file.name}: ${selectedIndex}`);
            }
            
            // Add safety check for selectedIndex
            if (selectedIndex < 0 || selectedIndex >= matchingScripts.length) {
                console.warn(`⚠️ selectedIndex out of bounds for ${videoData.file.name}, resetting to 0`);
                selectedIndex = 0;
            }
            
            const selectedScript = matchingScripts[selectedIndex];
            
            // Add logging for script selection
            console.log(`📜 Selected script for ${videoData.file.name}:`, {
                name: selectedScript.fileName,
                index: selectedIndex,
                isFavorite: selectedScript.fileName === scriptFavoriteManager.getFavoriteScript(videoData.fullPath),
                totalScripts: matchingScripts.length
            });
            
            handyManager.connectAndLoadScript(video, handyCode, selectedScript, button);
        });
    } else {
        button.disabled = true;
        button.style.opacity = '0.5';
        console.log(`🤖 Handy button disabled for: ${videoData.file.name} (no scripts)`);
    }

    return button;
}

function createHateButton(videoTitle, hateManager) {
    console.log(`💔 Creating hate button for: ${videoTitle}`);
    const button = document.createElement('button');
    button.className = 'hate-button';
    
    // Set initial state
    if (hateManager.isHated(videoTitle)) {
        button.innerHTML = '💔';
        button.classList.add('hated');
        console.log(`💔 Video is hated: ${videoTitle}`);
    } else {
        button.innerHTML = '💔︎';
        console.log(`🤍 Video is not hated: ${videoTitle}`);
    }
    
    button.addEventListener('click', () => {
        const isNowHated = hateManager.toggleHate(videoTitle);
        button.innerHTML = isNowHated ? '💔' : '💔︎';
        button.classList.toggle('hated', isNowHated);
        console.log(`${isNowHated ? '💔' : '🤍'} Hate toggled for: ${videoTitle}, is now: ${isNowHated ? 'hated' : 'not hated'}`);
    });
    
    return button;
}

export function setupVideoControls(currentVideo) {
    console.log(`🎮 Setting up video controls`);
    document.addEventListener('keydown', (event) => {
        if (!currentVideo) {
            console.log(`⌨️ Key pressed but no current video: ${event.code}`);
            return;
        }

        console.log(`⌨️ Key pressed for video control: ${event.code}`);
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                if (currentVideo.paused) {
                    console.log(`▶️ Playing video: ${currentVideo.src}`);
                    currentVideo.play();
                } else {
                    console.log(`⏸️ Pausing video: ${currentVideo.src}`);
                    currentVideo.pause();
                }
                break;
            case 'ArrowLeft':
                console.log(`⏪ Seeking back 5s: ${currentVideo.src}, from ${currentVideo.currentTime}`);
                currentVideo.currentTime -= 5;
                break;
            case 'ArrowRight':
                console.log(`⏩ Seeking forward 5s: ${currentVideo.src}, from ${currentVideo.currentTime}`);
                currentVideo.currentTime += 5;
                break;
        }
    });
    console.log(`✅ Video controls setup complete`);
}

// Add a function to preload video for better handling
export function preloadVideo(video) {
    console.log(`🔄 Preloading video: ${video.src}`);
    return new Promise((resolve, reject) => {
        // Set a timeout to ensure this doesn't hang indefinitely
        const timeout = setTimeout(() => {
            console.warn(`⚠️ Preload timeout for ${video.src}`);
            resolve(); // Resolve anyway to prevent hanging
        }, 5000);
        
        const handleLoaded = () => {
            clearTimeout(timeout);
            console.log(`✅ Preload complete for ${video.src}`);
            video.removeEventListener('canplay', handleLoaded);
            video.removeEventListener('error', handleError);
            resolve();
        };
        
        const handleError = (e) => {
            clearTimeout(timeout);
            console.error(`🔴 Preload error for ${video.src}:`, e);
            video.removeEventListener('canplay', handleLoaded);
            video.removeEventListener('error', handleError);
            resolve(); // Resolve anyway to prevent hanging
        };
        
        video.addEventListener('canplay', handleLoaded);
        video.addEventListener('error', handleError);
        
        // If video is already loaded, resolve immediately
        if (video.readyState >= 3) { // HAVE_FUTURE_DATA or better
            console.log(`🎯 Video already loaded, skipping preload: ${video.src}`);
            clearTimeout(timeout);
            resolve();
        }
    });
}

// Add a utility function to log video loading progress
export function logVideoState(video, label = "") {
    const readyStateMap = [
        'HAVE_NOTHING(0)',
        'HAVE_METADATA(1)',
        'HAVE_CURRENT_DATA(2)',
        'HAVE_FUTURE_DATA(3)',
        'HAVE_ENOUGH_DATA(4)'
    ];
    
    console.log(`📊 Video State ${label}: 
    - src: ${video.src}
    - readyState: ${readyStateMap[video.readyState]}
    - paused: ${video.paused}
    - duration: ${video.duration}
    - currentTime: ${video.currentTime}
    - networkState: ${video.networkState}
    - error: ${video.error ? `Code ${video.error.code}` : 'none'}
    - videoWidth: ${video.videoWidth}
    - videoHeight: ${video.videoHeight}
    `);
}