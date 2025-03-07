import { HandyManager } from './handyIntegration.js';
import { FileHandler } from './fileHandler.js';
import { FilterManager } from './filterManager.js';
import { createVideoWrapper, setupVideoControls, preloadVideo, logVideoState } from './videoControls.js';
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

// Debug flag - set to true to enable verbose logging
const DEBUG = true;

// Debug logging function
function debugLog(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

function initializeApp() {
    debugLog('🚀 Initializing app');
    if (document.readyState === 'loading') {
        debugLog('📄 Document still loading, waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', startInitialization);
    } else {
        debugLog('📄 Document already loaded, starting initialization');
        startInitialization();
    }
}

function startInitialization() {
    debugLog('🏁 Starting app initialization');
    
    // Setup UI elements
    setupFileInput();
    setupFilterButtons();
    setupListViewNavigation();
    setupHandyInput();
    setupVideoControls(currentVideo);
    
    // Register event handlers for global state changes
    window.addEventListener('filterComplete', () => {
        debugLog('🔍 Filter complete event received');
        // Additional actions after filtering if needed
    });
    
    // Load saved settings and preferences
    loadSettings();
    
    debugLog('✅ App initialization complete');
}

function loadSettings() {
    debugLog('⚙️ Loading saved settings');
    // Load any saved settings like favorites, filters, etc.
    // This can be expanded later
}

function setupFileInput() {
    debugLog('📂 Setting up file input');
    const fileInput = document.getElementById('fileInput');
    
    fileInput.addEventListener('change', async (event) => {
        debugLog('📂 File input change event triggered');
        
        // Create and show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-videos';
        loadingIndicator.textContent = 'Loading videos...';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.background = 'rgba(0,0,0,0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.borderRadius = '5px';
        loadingIndicator.style.zIndex = '9999';
        document.body.appendChild(loadingIndicator);
        debugLog('⏳ Added loading indicator to DOM');
        
        try {
            // Process files
            debugLog('📁 Getting files from input');
            const files = Array.from(event.target.files || []);
            debugLog(`📁 Found ${files.length} files`);
            
            if (files.length === 0) {
                debugLog('⚠️ No files selected, removing loading indicator');
                if (document.body.contains(loadingIndicator)) {
                    document.body.removeChild(loadingIndicator);
                }
                return; // Exit early if no files
            }
            
            debugLog('🔄 Processing files with FileHandler');
            const startTime = performance.now();
            const [videos, funscripts] = await FileHandler.getVideosFromFiles(files);
            const endTime = performance.now();
            debugLog(`✅ File processing complete in ${(endTime - startTime).toFixed(2)}ms`);
            debugLog(`📊 Found ${videos.length} videos and ${funscripts.length} funscripts`);
            
            // Clear existing videos
            debugLog('🧹 Clearing existing videos from containers');
            document.querySelector('#pcContainer .video-grid').innerHTML = '';
            document.querySelector('#phoneContainer .video-grid').innerHTML = '';
            
            // Track loading progress
            let loadedVideos = 0;
            const totalVideos = videos.length;
            debugLog(`📊 Total videos to load: ${totalVideos}`);
            
            // Set a maximum wait time (30 seconds) to ensure loading indicator eventually gets removed
            const maxWaitTime = 30000; // 30 seconds in milliseconds
            debugLog(`⏱️ Setting loading timeout for ${maxWaitTime}ms`);
            const loadingTimeout = setTimeout(() => {
                debugLog('⚠️ Loading timeout reached, forcing completion');
                if (document.body.contains(loadingIndicator)) {
                    document.body.removeChild(loadingIndicator);
                    debugLog('🗑️ Removed loading indicator due to timeout');
                }
            }, maxWaitTime);
            
            // Function to update loading indicator
            const updateProgress = () => {
                loadedVideos++;
                loadingIndicator.textContent = `Loading videos: ${loadedVideos}/${totalVideos}`;
                debugLog(`📊 Video loading progress: ${loadedVideos}/${totalVideos}`);
                
                if (loadedVideos >= totalVideos) {
                    // All videos loaded, remove indicator and clear timeout
                    debugLog('✅ All videos loaded, removing indicator');
                    clearTimeout(loadingTimeout);
                    if (document.body.contains(loadingIndicator)) {
                        document.body.removeChild(loadingIndicator);
                        debugLog('🗑️ Removed loading indicator after all videos loaded');
                    }
                }
            };
            
            // If there are no videos, remove the loading indicator immediately
            if (totalVideos === 0) {
                debugLog('⚠️ No videos found, removing loading indicator');
                clearTimeout(loadingTimeout);
                if (document.body.contains(loadingIndicator)) {
                    document.body.removeChild(loadingIndicator);
                }
                return;
            }
            
            // Add event listener to track when each video is loaded
            const videoLoadedListener = (event) => {
                debugLog(`🎬 Video loaded event: ${event.type} for ${event.target.src}`);
                updateProgress();
                // Remove all event listeners to prevent duplicate counts
                event.target.removeEventListener('canplay', videoLoadedListener);
                event.target.removeEventListener('loadeddata', videoLoadedListener);
                event.target.removeEventListener('playing', videoLoadedListener);
                event.target.removeEventListener('error', videoLoadedListener);
            };
            
            // Add videos to the DOM
            for (let i = 0; i < videos.length; i++) {
                const videoData = videos[i];
                debugLog(`🎬 Creating wrapper for video ${i+1}/${videos.length}: ${videoData.file.name}`);
                
                // Make sure videoData exists
                if (!videoData) {
                    debugLog(`⚠️ Missing video data for index ${i}, skipping`);
                    updateProgress(); // Count as loaded to avoid blocking
                    continue;
                }
                
                try {
                    // Pass all required parameters to createVideoWrapper
                    const wrapper = createVideoWrapper(
                        videoData, 
                        funscripts, 
                        favoriteManager, 
                        handyManager,
                        scriptFavoriteManager, 
                        scriptHateManager,
                        currentVideoWrapper,
                        currentVideo,
                        hateManager
                    );
                    
                    // Add event listener to track loading
                    const videoElement = wrapper.querySelector('video');
                    if (videoElement) {
                        debugLog(`🎬 Adding load event listeners for: ${videoData.file.name}`);
                        // Add multiple event listeners to catch any possible video ready state
                        videoElement.addEventListener('canplay', videoLoadedListener);
                        videoElement.addEventListener('loadeddata', videoLoadedListener);
                        videoElement.addEventListener('playing', videoLoadedListener);
                        videoElement.addEventListener('error', videoLoadedListener);
                        
                        // If video is already in ready state, count it as loaded
                        if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA or better
                            debugLog(`✅ Video already loaded: ${videoData.file.name}`);
                            updateProgress();
                        }
                        
                        // Log video state for debugging
                        setTimeout(() => {
                            logVideoState(videoElement, `Initial state for ${videoData.file.name}`);
                        }, 500);
                    } else {
                        // If no video element found, count it as loaded to avoid blocking
                        debugLog(`⚠️ No video element found in wrapper for ${videoData?.file?.name || 'unknown'}`);
                        updateProgress();
                    }
                    
                    // Add to appropriate container based on orientation
                    debugLog(`📱 Adding video to ${videoData.isPortrait ? 'phone' : 'PC'} container: ${videoData.file.name}`);
                    if (videoData.isPortrait) {
                        const phoneContainer = document.querySelector('#phoneContainer .video-grid');
                        if (phoneContainer) {
                            phoneContainer.appendChild(wrapper);
                            debugLog(`✅ Added to phone container: ${videoData.file.name}`);
                        } else {
                            debugLog(`⚠️ Phone container not found for: ${videoData.file.name}`);
                        }
                    } else {
                        const pcContainer = document.querySelector('#pcContainer .video-grid');
                        if (pcContainer) {
                            pcContainer.appendChild(wrapper);
                            debugLog(`✅ Added to PC container: ${videoData.file.name}`);
                        } else {
                            debugLog(`⚠️ PC container not found for: ${videoData.file.name}`);
                        }
                    }
                } catch (error) {
                    debugLog(`🔴 Error creating video wrapper for ${videoData?.file?.name || 'unknown'}:`, error);
                    updateProgress(); // Count as loaded to avoid blocking
                }
            }
            
            // Apply filters to newly added videos
            debugLog('🔍 Applying filters to videos');
            filterVideos();
            
            // Add a fallback to ensure the loading indicator is removed
            // This helps if some videos never fire their load events
            debugLog('⏱️ Setting fallback for loading indicator removal');
            setTimeout(() => {
                if (document.body.contains(loadingIndicator) && loadedVideos < totalVideos) {
                    debugLog(`⚠️ Fallback: Forcing removal of loading indicator. Loaded ${loadedVideos}/${totalVideos} videos`);
                    document.body.removeChild(loadingIndicator);
                }
            }, Math.min(5000, maxWaitTime / 2)); // Use either 5 seconds or half the max wait time
            
        } catch (error) {
            debugLog('🔴 Error processing files:', error);
            // Make sure to remove loading indicator if there's an error
            if (document.body.contains(loadingIndicator)) {
                document.body.removeChild(loadingIndicator);
                debugLog('🗑️ Removed loading indicator due to error');
            }
        }
    });
    
    debugLog('✅ File input setup complete');
}

function filterVideos() {
    debugLog('🔍 Filtering videos');
    
    // Get all video wrappers
    const allWrappers = document.querySelectorAll('.video-wrapper');
    debugLog(`📊 Found ${allWrappers.length} total video wrappers`);
    
    // Get favorite and hate lists
    const favVideos = favoriteManager.getAllFavorites();
    const hateVideos = hateManager.getAllHated();
    debugLog(`⭐ Found ${favVideos.size} favorite videos`);
    debugLog(`💔 Found ${hateVideos.size} hated videos`);
    
    // Apply filtering
    filterManager.filterVideos(allWrappers, favVideos, hateVideos);
    debugLog('✅ Filtering complete');
}

function setupFilterButtons() {
    debugLog('🔍 Setting up filter buttons');
    
    const scriptButton = document.getElementById('scriptButton');
    const phoneButton = document.getElementById('phoneButton');
    const pcButton = document.getElementById('pcButton');
    const favButton = document.getElementById('favButton');
    const hateButton = document.getElementById('hateButton')
    const listViewButton = document.getElementById('listViewButton')
    const generateButton = document.getElementById('generateButton')

    listViewButton.addEventListener('click', () => {
        const isActive = filterManager.toggleMode('isListView');
        listViewButton.style.backgroundColor = isActive ? '#FFD700' : '';
        listViewButton.style.color = isActive ? '#424242' : '';
        listViewButton.textContent = isActive ? '📋 Grid View' : '📋 List View';
        filterVideos();
    });

    generateButton.addEventListener('click', () => {
        console.clear()
        const diffMapSet = new Set()
        const diffMapArray = new Array()
        let promptCheck = ''
        console.log(scriptHateManager.getAllHated())

        scriptHateManager.getAllHated().forEach(x => {
            diffMapSet.add(x.slice(0, x.indexOf('/')))
        })  
        console.log(diffMapSet)

        diffMapSet.forEach(x => {
            const templist = new Array()
            scriptHateManager.getAllHated().forEach(y => {
                if (x == y.slice(0, y.indexOf('/'))) {
                    templist.push(y.slice(y.indexOf('/') + 1))
                }
            }) 
            diffMapArray.push({Mapname: x, MapList: templist})
            console.log(diffMapArray)
        })

        diffMapArray.forEach(x => {
        
            let tempString = ''
            
            x.MapList.forEach(y => {
                tempString = tempString + '\n' + "del " + `\"${y}\"`
            })
            promptCheck = prompt(x.Mapname + " place file in this map before clicking it \n if you are sure you wan't to clear you storage and create the .bat file type in 'yes'")
            if (promptCheck == 'yes') {
                console.log(x.Mapname + " in this map we gonna delete some funscripts")
                console.log(tempString.replaceAll("/", "\\"))
                const file = new Blob([tempString.replaceAll("/", "\\") + "\n" + "\n"+ "\n" + cmdScript], {type: 'text/plain'})
                saveAs(file, "delete.bat")
            } else {
                console.log("generated canceled")
            }

        })  

        promptCheck == "yes" ? scriptHateManager.clearhated() : console.log("script hated not cleared")
    })
    

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
    
    debugLog('✅ Filter buttons setup complete');
}

function setupListViewNavigation() {
    debugLog('📋 Setting up list view navigation');
    
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
    
    // Current video index in list view
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
    
    // Navigation event handlers
    prevButton.addEventListener('click', () => {
        debugLog('📋 List view: Previous button clicked');
        if (currentIndex > 0) {
            currentIndex--;
            updateListView();
        }
    });
    
    nextButton.addEventListener('click', () => {
        debugLog('📋 List view: Next button clicked');
        const allVisibleWrappers = getAllVisibleWrappers();
        if (currentIndex < allVisibleWrappers.length - 1) {
            currentIndex++;
            updateListView();
        }
    });
    
    // Update the list view nav visibility when toggling list view
    const listViewToggle = document.getElementById('listViewButton');
    listViewToggle.addEventListener('click', () => {
        debugLog(`📋 List view toggled: ${filterManager.isListView}`);
        toggleListView(filterManager.isListView);
        listViewNav.style.display = listViewToggle.checked ? 'block' : 'none';
        
        // Reset index when entering list view
        currentIndex = 0;
        updateListView();
    });
    
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
    
    
    // Listen for filter changes and update list view
    window.addEventListener('filterComplete', updateListView);
    
    debugLog('✅ List view navigation setup complete');
}

function setupHandyInput() {
    debugLog('🤖 Setting up Handy input');
    
    const handyCodeInput = document.getElementById('handyCodeInput');
    const storedHandyCode = localStorage.getItem('handyCode');
    
    if (storedHandyCode) {
        handyCodeInput.value = storedHandyCode;
        debugLog('🤖 Loaded saved Handy code from localStorage');
    }
    
    handyCodeInput.addEventListener('change', () => {
        localStorage.setItem('handyCode', handyCodeInput.value);
        debugLog('🤖 Saved Handy code to localStorage');
    });
    
    debugLog('✅ Handy input setup complete');
}



// Set up the application when the script loads
initializeApp();

// Expose global variables for debugging
window.debugGallery = {
    favoriteManager,
    filterManager,
    handyManager,
    scriptFavoriteManager,
    hateManager,
    scriptHateManager,
    currentVideo,
    currentVideoWrapper
};

debugLog('🚀 main.js loaded and executed');


const cmdScript = `
@echo off
setlocal enabledelayedexpansion

:: Loop through all first-layer subfolders
for /d %%d in ("*") do (
    echo Processing subfolder: "%%d"
    pushd "%%d"

    :: Check if the subfolder contains any nested folders
    set hasSubfolders=0
    for /f %%s in ('dir /b /ad 2^>nul') do set hasSubfolders=1

    :: If the subfolder has no nested folders, proceed
    if !hasSubfolders! equ 0 (
        set fileCount=0

        :: Count the number of files in the subfolder
        for /f "delims=" %%f in ('dir /b /a-d 2^>nul') do set /a fileCount+=1

        :: If there is exactly one file, move it to the parent folder and delete the subfolder
        if !fileCount! equ 1 (
            echo Subfolder "%%d" has 1 file. Moving file to parent folder...
            for /f "delims=" %%f in ('dir /b /a-d') do (
                echo Moving file: "%%f"
                move "%%f" "..\"
            )
            popd
            echo Deleting subfolder: "%%d"
            rmdir "%%d"
            echo Subfolder "%%d" deleted.
        ) else (
            echo Subfolder "%%d" has !fileCount! files. No action taken.
            popd
        )
    ) else (
        echo Subfolder "%%d" contains nested folders. Skipping.
        popd
    )
)

endlocal
pause`
