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
    setupListViewNavigation();
    
    // Add event listener for filtering
    window.addEventListener('filterVideos', filterVideos);
}

function setupFilterButtons() {
    const scriptButton = document.getElementById('scriptButton');
    const phoneButton = document.getElementById('phoneButton');
    const pcButton = document.getElementById('pcButton');
    const favButton = document.getElementById('favButton');
    const hateButton = document.getElementById('hateButton')
    const listViewButton = document.getElementById('listViewButton')

    listViewButton.addEventListener('click', () => {
        const isActive = filterManager.toggleMode('isListView');
        listViewButton.style.backgroundColor = isActive ? '#FFD700' : '';
        listViewButton.style.color = isActive ? '#424242' : '';
        listViewButton.textContent = isActive ? '📋 Grid View' : '📋 List View';
        filterVideos();
    });

    // Keep all other button handlers the same
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
        phoneButton.textContent = isActive ? '📱 Not Phone' : '📱 Phone';
        filterVideos();
    });

    pcButton.addEventListener('click', () => {
        const isActive = filterManager.toggleMode('isPcMode');
        pcButton.style.backgroundColor = isActive ? '#FFD700' : '';
        pcButton.style.color = isActive ? '#424242' : '';
        pcButton.textContent = isActive ? '💻 Not PC' : '💻 PC';
        filterVideos();
    });

    favButton.addEventListener('click', () => {
        const mode = filterManager.toggleMode('isFavMode');
        const state = filterManager.getToggleFilterButtonState('isFavMode', '⭐', 'Favorites');
        favButton.textContent = state.text
        favButton.style.backgroundColor = state.bgColor
        favButton.style.color = state.color 
        filterVideos();
    });

    hateButton.addEventListener('click', () => {
        const mode = filterManager.toggleMode('isHateMode');
        const state = filterManager.getToggleFilterButtonState('isHateMode', '💔', 'Hated');
        hateButton.textContent = state.text
        hateButton.style.backgroundColor = state.bgColor
        hateButton.style.color = state.color 
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

function filterVideos() {
    const pcVideoWrappers = Array.from(document.querySelectorAll('#pcContainer .video-wrapper'));
    const phoneVideoWrappers = Array.from(document.querySelectorAll('#phoneContainer .video-wrapper'));
    const allWrappers = [...pcVideoWrappers, ...phoneVideoWrappers];
    
    // Convert Sets to Arrays using the spread operator
    const favoritesArray = [...favoriteManager.favorites];
    const hatedArray = [...hateManager.hated];
    
    filterManager.filterVideos(allWrappers, favoritesArray, hatedArray);
    
    // Explicitly trigger list view update if in list view mode
    if (filterManager.isListView) {
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('listViewUpdate'));
        }, 50);
    }
}


function setupListViewNavigation() {
    // Create navigation controls
    const navContainer = document.createElement('div');
    navContainer.className = 'list-view-nav';
    navContainer.style.display = 'none';
    
    const prevButton = document.createElement('button');
    prevButton.textContent = '← Previous';
    prevButton.className = 'list-nav-btn';
    
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next →';
    nextButton.className = 'list-nav-btn';
    
    const counterDisplay = document.createElement('div');
    counterDisplay.className = 'video-counter';
    counterDisplay.textContent = '0 / 0';
    
    navContainer.appendChild(prevButton);
    navContainer.appendChild(counterDisplay);
    navContainer.appendChild(nextButton);
    document.body.appendChild(navContainer);
    
    // Current visible video index
    let currentIndex = 0;
    
    // Helper function to get all visible wrappers across containers
    function getAllVisibleWrappers() {
        // The issue is likely with the filtering criteria
        // Let's get ALL videos that match the filtering criteria, not just those that are currently visible
        
        const pcContainer = document.querySelector('#pcContainer');
        const phoneContainer = document.querySelector('#phoneContainer');
        
        // First check if the containers should be visible based on filter settings
        const includePcVideos = !filterManager.isPcMode && pcContainer;
        const includePhoneVideos = !filterManager.isPhoneMode && phoneContainer;
        
        let allVisibleWrappers = [];
        
        // Get all wrappers that should be visible according to filtering
        if (includePcVideos) {
            const pcWrappers = Array.from(pcContainer.querySelectorAll('.video-wrapper')).filter(
                wrapper => wrapper.dataset.shouldBeVisible === 'true'
            );
            allVisibleWrappers = [...allVisibleWrappers, ...pcWrappers];
        }
        
        if (includePhoneVideos) {
            const phoneWrappers = Array.from(phoneContainer.querySelectorAll('.video-wrapper')).filter(
                wrapper => wrapper.dataset.shouldBeVisible === 'true'
            );
            allVisibleWrappers = [...allVisibleWrappers, ...phoneWrappers];
        }
        
        console.log(`Found ${allVisibleWrappers.length} videos matching filters`);
        return allVisibleWrappers;
    }
    
    // Update the active video in list view
    function updateListView() {
        if (!filterManager.isListView) return;
        
        // Get fresh list of visible wrappers based on current filter state
        const allVisibleWrappers = getAllVisibleWrappers();
        console.log(`List view update: found ${allVisibleWrappers.length} visible videos`);
        
        // If we have no visible videos after filtering, show a message
        if (allVisibleWrappers.length === 0) {
            counterDisplay.textContent = "No videos match filters";
            prevButton.disabled = true;
            nextButton.disabled = true;
            return;
        }
        
        // Reset index if it's out of bounds after filtering
        if (currentIndex >= allVisibleWrappers.length) {
            currentIndex = 0;
        }
        
        // Hide all videos first (both containers)
        document.querySelectorAll('.video-wrapper').forEach(wrapper => {
            wrapper.style.display = 'none';
        });
        
        // Show only the current video
        if (allVisibleWrappers[currentIndex]) {
            allVisibleWrappers[currentIndex].style.display = 'block';
            console.log(`Showing video #${currentIndex + 1}: ${allVisibleWrappers[currentIndex].querySelector('p')?.textContent}`);
        }
        
        // Update counter display
        counterDisplay.textContent = `${currentIndex + 1} / ${allVisibleWrappers.length}`;
        
        // Update button states
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex >= allVisibleWrappers.length - 1;
    }
    
    // Function to toggle between list view and grid view
    function toggleListView(isListView) {
        // Show/hide navigation controls
        navContainer.style.display = isListView ? 'flex' : 'none';
        
        // Add/remove body class for styling
        if (isListView) {
            document.body.classList.add('list-view-active');
            
            // Hide container headings
            document.querySelectorAll('.video-group h2').forEach(heading => {
                heading.style.display = 'none';
            });
            
            // Change container layout
            document.getElementById('videoContainers').style.display = 'block';
            
            // Reset to first video
            currentIndex = 0;
            
            // Update list view
            updateListView();
        } else {
            // Exit list view mode
            document.body.classList.remove('list-view-active');
            
            // Show container headings again
            document.querySelectorAll('.video-group h2').forEach(heading => {
                heading.style.display = 'block';
            });
            
            // Restore container layout
            document.getElementById('videoContainers').style.display = 'flex';
            
            // Show all videos that should be visible
            document.querySelectorAll('.video-wrapper').forEach(wrapper => {
                if (wrapper.dataset.shouldBeVisible !== 'false') {
                    wrapper.style.display = 'block';
                } else {
                    wrapper.style.display = 'none';
                }
            });
            
            // Restore container visibility based on filter modes
            const pcVideos = document.querySelector('#pcContainer');
            const phoneVideos = document.querySelector('#phoneContainer');
            
            pcVideos.style.display = filterManager.isPcMode ? 'none' : 'block';
            phoneVideos.style.display = filterManager.isPhoneMode ? 'none' : 'block';
        }
    }
    
    // Button event listeners
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateListView();
        }
    });
    
    nextButton.addEventListener('click', () => {
        const allVisibleWrappers = getAllVisibleWrappers();
        
        if (currentIndex < allVisibleWrappers.length - 1) {
            currentIndex++;
            updateListView();
        }
    });
    
    // Add event listeners for all filter-related events
    // IMPORTANT: These need to be inside setupListViewNavigation to access updateListView
    
    // Listen for the listViewButton clicks
    const listViewButton = document.getElementById('listViewButton');
    listViewButton.addEventListener('click', () => {
        // Toggle list view state is handled in filterButtons setup
        // Just need to update the UI
        toggleListView(filterManager.isListView);
    });
    
    // Listen for filter events
    window.addEventListener('filterComplete', () => {
        if (filterManager.isListView) {
            console.log("Filter event captured, updating list view");
            updateListView();
        }
    });
    
    // This special event is dispatched by the filterVideos function
    window.addEventListener('listViewUpdate', () => {
        if (filterManager.isListView) {
            updateListView();
        }
    });
    
    // Also attach event listeners to all filter buttons to ensure we catch changes
    document.querySelectorAll('#scriptButton, #phoneButton, #pcButton, #favButton, #hateButton').forEach(button => {
        button.addEventListener('click', () => {
            if (filterManager.isListView) {
                // Give a small delay to allow filter processing
                setTimeout(updateListView, 50);
            }
        });
    });
    
    
}


// Start initialization
initializeApp();

// Export functions that might be needed by other modules
export {
    filterVideos,
    currentVideo,
    currentVideoWrapper
};