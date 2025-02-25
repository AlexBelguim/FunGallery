
import { showScriptModal } from "./modals/scriptModal.js";

export function createVideoWrapper(videoData, funscripts, favoriteManager, handyManager, scriptFavoriteManager, scriptHateManager, currentVideoWrapper, currentVideo, hateManager) {
    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper';
    
    // Add orientation class
    if (videoData.isPortrait) {
        wrapper.classList.add('portrait');
    } else {
        wrapper.classList.add('landscape');
    }
    
    wrapper.dataset.funscriptCount = videoData.funscriptCount;

    // Create video container
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoData.file);
    video.controls = true;

    const title = document.createElement('p');
    title.textContent = videoData.file.name;

    // Set preview frame at video midpoint using a named function
    function setPreviewToMidpoint(event) {
        const midpoint = video.duration / 2;
        video.currentTime = midpoint;
        console.log(`Setting preview for ${videoData.file.name} to ${midpoint.toFixed(2)} seconds`);
        video.removeEventListener('loadedmetadata', setPreviewToMidpoint);
    }
    
    video.addEventListener('loadedmetadata', setPreviewToMidpoint);

    // Add funscript count display with tooltip and click functionality
    const funscriptInfo = document.createElement('span');
    funscriptInfo.className = 'funscript-count';
    funscriptInfo.textContent = `📜 ${videoData.funscriptCount}`;

    if (videoData.funscriptCount > 0) {
        funscriptInfo.style.cursor = 'pointer';
        funscriptInfo.addEventListener('click', () => {
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
    const hateButton = createHateButton(title.textContent, hateManager)

    wrapper.appendChild(video);
    wrapper.appendChild(title);
    wrapper.appendChild(funscriptInfo);
    wrapper.appendChild(favoriteButton);
    wrapper.appendChild(handyButton);
    wrapper.appendChild(hateButton)

    return wrapper;
}

function createFavoriteButton(videoTitle, favoriteManager) {
    const button = document.createElement('button');
    button.className = 'favorite-button';
    
    // Set initial state
    if (favoriteManager.isFavorite(videoTitle)) {
        button.textContent = '⭐';
        button.classList.add('favorited');
    } else {
        button.textContent = '☆';
    }
    
    button.addEventListener('click', () => {
        const isNowFavorite = favoriteManager.toggleFavorite(videoTitle);
        button.textContent = isNowFavorite ? '⭐' : '☆';
        button.classList.toggle('favorited', isNowFavorite);
    });
    
    return button;
}

function createHandyButton(videoData, funscripts, video, handyManager, scriptFavoriteManager) {
    const button = document.createElement('button');
    button.textContent = '🤖';
    button.className = 'handy-button';

    const matchingScripts = funscripts.filter(script => 
        script.fullPath === videoData.fullPath
    );

    if (matchingScripts.length > 0) {
        button.addEventListener('click', () => {
            const handyCodeInput = document.getElementById('handyCodeInput');
            const handyCode = handyCodeInput.value.trim();
            
            if (!handyCode) {
                alert('Please enter a Handy code in the input field at the top');
                handyCodeInput.focus();
                return;
            }

            // Get selected script or favorite script or default to first one
            let selectedIndex = parseInt(video.closest('.video-wrapper').dataset.selectedScript);
            if (isNaN(selectedIndex)) {
                const favScript = scriptFavoriteManager.getFavoriteScript(videoData.fullPath);
                selectedIndex = favScript ? 
                    matchingScripts.findIndex(s => s.fileName === favScript) : 0;
            }
            const selectedScript = matchingScripts[selectedIndex];
            
            // Add logging for script selection
            console.log('📜 Selected script:', {
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
    }

    return button;
}

function createHateButton(videoTitle, hateManager) {
    const button = document.createElement('button');
    button.className = 'hate-button';
    
    // Set initial state
    if (hateManager.isHated(videoTitle)) {
        button.innerHTML = '💔';
        button.classList.add('hated');
    } else {
        button.innerHTML = '💔︎';
    }
    
    button.addEventListener('click', () => {
        const isNowHated = hateManager.toggleHate(videoTitle);
        button.innerHTML = isNowHated ? '💔' : '💔︎';
        button.classList.toggle('hated', isNowHated);
    });
    
    return button;
}


export function setupVideoControls(currentVideo) {
    document.addEventListener('keydown', (event) => {
        if (!currentVideo) return;

        switch(event.code) {
            case 'Space':
                event.preventDefault();
                currentVideo.paused ? currentVideo.play() : currentVideo.pause();
                break;
            case 'ArrowLeft':
                currentVideo.currentTime -= 5;
                break;
            case 'ArrowRight':
                currentVideo.currentTime += 5;
                break;
        }
    });
} 

