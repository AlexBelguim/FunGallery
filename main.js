import { HandyManager } from './handyIntegration.js';
import { FileHandler } from './fileHandler.js';
import { FilterManager } from './filterManager.js';
import { createVideoWrapper, setupVideoControls } from './videoControls.js';
import { FavoriteManager, ScriptFavoriteManager, HateManager, ScriptHateManager } from './favManager/export.js';

// Initialize managers
const handyManager = new HandyManager();
const favoriteManager = new FavoriteManager();
const filterManager = new FilterManager();
const scriptFavoriteManager = new ScriptFavoriteManager();
const hateManager = new HateManager();
const scriptHateManager = new ScriptHateManager();

// Global variables
let currentVideoWrapper = null;
let currentVideo = null;

function initializeApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startInitialization);
    } else {
        startInitialization();
    }
}

function startInitialization() {
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favoriteManager.loadFavorites(savedFavorites);

    // Load favorites from LocalStorage
    const savedHated = JSON.parse(localStorage.getItem('hated') || '[]');
    hateManager.loadHated(savedHated)

    // Initialize UI elements
    setupFilterButtons();
    setupFileInput();
    setupVideoControls(currentVideo);

    // Add event listener for filtering
    window.addEventListener('filterVideos', filterVideos);
}

function setupFilterButtons() {
    const scriptButton = document.getElementById('scriptButton');
    const phoneButton = document.getElementById('phoneButton');
    const pcButton = document.getElementById('pcButton');
    const favButton = document.getElementById('favButton');
    const hateButton = document.getElementById('hateButton')

    scriptButton.addEventListener('click', () => {
        const mode = filterManager.toggleMode('scriptMode');
        const state = filterManager.getScriptButtonState();
        scriptButton.textContent = state.text;
        scriptButton.style.backgroundColor = state.bgColor;
        scriptButton.style.color = state.color;
        filterVideos();
    });

    phoneButton.addEventListener('click', () => {
        const isActive = filterManager.toggleMode('isPhoneMode');
        phoneButton.style.backgroundColor = isActive ? '#FFD700' : '';
        phoneButton.style.color = isActive ? '#424242' : '';
        filterVideos();
    });

    pcButton.addEventListener('click', () => {
        const isActive = filterManager.toggleMode('isPcMode');
        pcButton.style.backgroundColor = isActive ? '#FFD700' : '';
        pcButton.style.color = isActive ? '#424242' : '';
        filterVideos();
    });

    favButton.addEventListener('click', () => {
        const isActive = filterManager.toggleMode('isFavMode');
        favButton.style.backgroundColor = isActive ? '#FFD700' : '';
        favButton.style.color = isActive ? '#424242' : '';
        filterVideos();
    });

    hateButton.addEventListener('click', () => {
        const isActive = filterManager.toggleMode('isHateMode');
        hateButton.style.backgroundColor = isActive ? '#FFD700' : '';
        hateButton.style.color = isActive ? '#424242' : '';
        filterVideos();
    });
}

function setupFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', async (event) => {
        const files = Array.from(event.target.files);
        const [videos, funscripts] = await FileHandler.getVideosFromFiles(files);
        
        // Clear existing videos
        document.querySelector('#pcContainer .video-grid').innerHTML = '';
        document.querySelector('#phoneContainer .video-grid').innerHTML = '';
        
        for (const videoData of videos) {
            const wrapper = createVideoWrapper(
                videoData, 
                funscripts, 
                favoriteManager, 
                handyManager,
                scriptFavoriteManager, 
                scriptHateManager, // Add this parameter
                currentVideoWrapper,
                currentVideo,
                hateManager,
            );

            // Add to appropriate container based on orientation
            if (videoData.isPortrait) {
                document.querySelector('#phoneContainer .video-grid').appendChild(wrapper);
            } else {
                document.querySelector('#pcContainer .video-grid').appendChild(wrapper);
            }
        }

        filterVideos();
    });
}

async function filterVideos() {
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    await filterManager.filterVideos(videoWrappers, favoriteManager.getAllFavorites(), hateManager.getAllHated());
}


// Start initialization
initializeApp();

// Export functions that might be needed by other modules
export {
    filterVideos,
    currentVideo,
    currentVideoWrapper
};