let url = ''
const HANDY = Handy.init();
let checkView
if (!checkView){
  checkView = setInterval(testView, 200)
}

function testView(){
  // Remove this entire function as it's extension-specific
}

let isPhoneMode = false;
let isPcMode = false;
let isFavMode = false;
let videoDataArray = []; // Declare the array to hold video data globally
let funscripts = []; // Declare funscripts globally
let favVideos = []; // Declare the array to hold favorite video titles

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('folderInput').addEventListener('change', handleFileInputChange);
    document.getElementById('saveButton').addEventListener('click', generateJsonFile);
    document.getElementById('phoneBtn').addEventListener('click', function() {
        isPhoneMode = !isPhoneMode;
        this.classList.toggle('active');
        filterVideos();
    });
    
    document.getElementById('pcBtn').addEventListener('click', function() {
        isPcMode = !isPcMode;
        this.classList.toggle('active');
        filterVideos();
    });

    document.getElementById('favBtn').addEventListener('click', function() {
        isFavMode = !isFavMode;
        this.classList.toggle('active');
        filterVideos();
    })
    
    

    // Add slider functionality
    const slider = document.getElementById('columns-slider');
    const sliderValue = document.getElementById('slider-value');
    
    slider.addEventListener('input', function() {
        sliderValue.textContent = this.value;
    });

    // Create a new star button
    const starButton = document.createElement('button');
    starButton.innerHTML = '★'; // Use a star icon
    starButton.setAttribute('class', 'control-btn'); // Use the same class as the phone button

    // Get the controls container
    const controlsContainer = document.querySelector('.controls-container');

    // Insert the star button to the left of the controls
    controlsContainer.insertBefore(starButton, controlsContainer.firstChild);

    // Add event listener for the "Fav" button in the controls container
    document.getElementById('favBtn').addEventListener('click', function() {
        // Toggle the favorite state
        const isFavorited = this.classList.toggle('favorited'); // Toggle the class

        // Update the button style based on the favorite state
        if (isFavorited) {
            this.style.backgroundColor = '#FFD700'; // Set background to deep yellow
            this.style.color = '#424242'; // Set star color to match the Load Script button
        } else {
            this.style.backgroundColor = ''; // Reset background color
            this.style.color = ''; // Reset star color
        }

        // Filter video wrappers based on the favorite state
        const allVideoWrappers = document.querySelectorAll('.video-wrapper');
        allVideoWrappers.forEach(wrapper => {
            const title = wrapper.querySelector('p').textContent; // Get the title of the video
            if (isFavorited && favVideos.includes(title)) {
                wrapper.style.display = 'block'; // Show if it's favorited
            } else {
                wrapper.style.display = 'none'; // Hide if it's not favorited
            }
        });
    });

    // Save button functionality
    document.getElementById('saveButton').addEventListener('click', () => {
        console.log('Save button clicked'); // Debugging log

        // Create an object to save
        const dataToSave = {
            favorites: favVideos // Save the favorite videos array
        };

        console.log('Data to save:', dataToSave); // Log the data being saved

        // Call the function to generate the JSON file
        generateJsonFile(dataToSave, 'database.json');
    });
});
  
async function handleFileInputChange(event) {
    const files = event.target.files;
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear previous content

    // Check for database files
    const databaseFiles = Array.from(files).filter(file => 
        file.name.startsWith('database') && file.name.endsWith('.json')
    );

    let datapase = { handyCode: '', favVideos: [] }; // Initialize the datapase object

    if (databaseFiles.length > 0) {
        // Find the database file with the highest number
        const highestDatabaseFile = databaseFiles.reduce((prev, current) => {
            const prevNumber = getDatabaseFileNumber(prev.name);
            const currentNumber = getDatabaseFileNumber(current.name);
            return (currentNumber > prevNumber) ? current : prev;
        });

        const content = await readFile(highestDatabaseFile);
        try {
            datapase = JSON.parse(content); // Parse the JSON content
            console.log('Loaded datapase:', datapase); // Log the loaded data

            // Replace global variables if the properties are valid
            if (datapase.favVideos && Array.isArray(datapase.favVideos)) {
                favVideos = datapase.favVideos; // Update favVideos if valid
            }
            if (datapase.handyCode) {
                document.getElementById('handyCode').value = datapase.handyCode; // Update handyCode input if valid
            }
        } catch (error) {
            console.error('Error parsing database.json:', error);
        }
    }

    const mainArray = await getVideosFromFiles(files);
    const videos = mainArray[0];
    funscripts = mainArray[1];

    console.log("Videos:", videos);
    console.log("Funscripts:", funscripts);

    // Clear the previous video data array
    videoDataArray = []; // Reset the array for new uploads

    // Combine videos and funscripts
    const combinedData = videos.map(video => {
        const associatedFunscripts = funscripts
            .filter(f => f.folderName === video.folderName)
            .map(f => ({
                content: f.content, // Store the content of the funscript
                name: f.name || f.fileName || f.file // Ensure we get the correct filename
            })); // Collect all funscripts for this video
        return {
            ...video,
            funscripts: associatedFunscripts // Store an array of funscripts
        };
    });

    console.log("Combined Data:", combinedData); // Log the new combined array

    // Filter out videos that do not have any associated funscripts
    const filteredData = combinedData.filter(videoData => videoData.funscripts.length > 0);

    filteredData.forEach((videoData, index) => {
        console.log("Processing video:", videoData);
        
        // Initialize videoWrapper here
        const videoWrapper = document.createElement('div');
        videoWrapper.classList.add('video-wrapper');

        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(videoData.file) + "#t=50";
        videoElement.controls = true;
        videoElement.preload = "metadata";
        
        const title = document.createElement('p');
        title.textContent = videoData.folderName;

        // Add video data to the array
        videoDataArray.push({
            name: videoData.folderName,
            url: videoElement.src,
            funscripts: videoData.funscripts, // Store the array of funscripts with the video data
            // Add more properties as needed
        });

        const button = document.createElement('button');
        button.textContent = 'Load Script';
        button.setAttribute('class', "loader");
        
        // Create a new square button
        const squareButton = document.createElement('button');
        squareButton.innerHTML = '★'; // Use a star icon instead of text
        squareButton.setAttribute('class', "fav-button"); // Use the new fav-button class

        // Check if the video is already favorited
        if (favVideos.includes(videoData.folderName)) {
            squareButton.classList.add('favorited'); // Add the favorited class
            squareButton.style.backgroundColor = '#FFD700'; // Set background to deep yellow
            squareButton.style.color = '#424242'; // Set star color to match the Load Script button
        }

        // Create a container for both buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container'); // Ensure this class is applied

        // Append both buttons to the container
        buttonContainer.appendChild(button);
        buttonContainer.appendChild(squareButton);

        // Append the container to the video wrapper
        videoWrapper.appendChild(title);
        videoWrapper.appendChild(videoElement);
        videoWrapper.appendChild(buttonContainer);
        
        const uniqueId = `video_${index}`;
        videoElement.id = uniqueId;
        
        button.addEventListener('click', function() {
            // Load the script using the funscript if it exists
            let scriptData
            if (videoData.funscripts.length > 0) {
                if (videoData.funscripts.length > 1) {
                    // Show modal to select funscript
                    const funscriptModal = document.getElementById('funscriptModal');
                    const funscriptOptions = document.getElementById('funscriptOptions');
                    funscriptOptions.innerHTML = ''; // Clear previous options
                    videoData.funscripts.forEach((funscript, index) => {
                        const optionButton = document.createElement('button');
                        optionButton.textContent = funscript.name || `Funscript ${index + 1}`;
                        optionButton.classList.add('funscript-option', 'control-btn'); // Add class for styling
                        optionButton.dataset.index = index; // Store index for selection
                        funscriptOptions.appendChild(optionButton);

                        // Add event listener for button click
                        optionButton.addEventListener('click', function() {
                            // Remove 'selected' class from all buttons
                            const allOptions = document.querySelectorAll('.funscript-option');
                            allOptions.forEach(opt => opt.classList.remove('selected'));
                            // Add 'selected' class to the clicked button
                            this.classList.add('selected');

                            // Load the script using the funscript if it exists
                            const selectedIndex = this.dataset.index;
                            scriptData = videoData.funscripts[selectedIndex].content; // Access the content of the selected funscript
                            console.log('Selected Funscript Content:', videoData.funscripts[selectedIndex].name); // Log the content to console
                            funscriptModal.style.display = 'none'; // Hide modal
                            button.textContent = "loading";
                            button.setAttribute('style', "color: orange; border-color: orange");
                    
                            HANDY.disconnect();
                            HANDY.setVideoPlayer(document.getElementById(videoElement.id));
                            console.log(videoElement.id);
                    
                            const handyConnectCode = document.getElementById('handyCode').value;
                            
                            if (!handyConnectCode) {
                                console.error("No Handy code provided");
                                button.textContent = "Error: No Code";
                                button.setAttribute("style", "color: red; border-color: red");
                                return;
                            }
                    
                            HANDY.connect(handyConnectCode).then(response => {
                                console.log('Handy connected:', response);
                                if (response === Handy.ConnectResult.CONNECTED) {
                                    console.log('Connected');
                                    HANDY.setScript(url).then(response => {
                                        button.textContent = "Done";
                                        button.setAttribute("style", 'border-color: limegreen;color: limegreen');
                                        
                                        // Keep video source and settings unchanged
                                        videoElement.style.objectFit = 'contain';
                                        videoElement.style.minHeight = videoElement.offsetHeight + 'px';
                                        
                                        // Reset playback position to start
                                        videoElement.currentTime = 0;
                                    });
                                } else {
                                    console.log("Not connected");
                                    button.textContent = "Connection Failed";
                                    button.setAttribute("style", "color: red; border-color: red");
                                }
                            }).catch((error) => {
                                console.error("Error connecting to Handy:", error);
                                button.textContent = "Error";
                                button.setAttribute("style", "color: red; border-color: red");
                            });
                    
                            Handy.uploadDataToServer(scriptData)
                                .then(response => {
                                    console.log('Upload successful:', response);
                                    url = response;
                                })
                                .catch(error => {
                                    console.error('Upload failed:', error);
                                    button.textContent = "Upload Failed";
                                    button.setAttribute("style", "color: red; border-color: red");
                                });
                        });
                    });

                    funscriptModal.style.display = 'block'; // Show the modal

                    // Close modal functionality
                    document.querySelector('.close-button').onclick = function() {
                        funscriptModal.style.display = 'none'; // Hide modal
                    };

                } else {
                    scriptData = videoData.funscripts[0].content; // Access the content of the first funscript
                    button.textContent = "loading";
                    button.setAttribute('style', "color: orange; border-color: orange");
            
                    HANDY.disconnect();
                    HANDY.setVideoPlayer(document.getElementById(videoElement.id));
                    console.log(videoElement.id);
            
                    const handyConnectCode = document.getElementById('handyCode').value;
                    
                    if (!handyConnectCode) {
                        console.error("No Handy code provided");
                        button.textContent = "Error: No Code";
                        button.setAttribute("style", "color: red; border-color: red");
                        return;
                    }
            
                    HANDY.connect(handyConnectCode).then(response => {
                        console.log('Handy connected:', response);
                        if (response === Handy.ConnectResult.CONNECTED) {
                            console.log('Connected');
                            HANDY.setScript(url).then(response => {
                                button.textContent = "Done";
                                button.setAttribute("style", 'border-color: limegreen;color: limegreen');
                                
                                // Keep video source and settings unchanged
                                videoElement.style.objectFit = 'contain';
                                videoElement.style.minHeight = videoElement.offsetHeight + 'px';
                                
                                // Reset playback position to start
                                videoElement.currentTime = 0;
                            });
                        } else {
                            console.log("Not connected");
                            button.textContent = "Connection Failed";
                            button.setAttribute("style", "color: red; border-color: red");
                        }
                    }).catch((error) => {
                        console.error("Error connecting to Handy:", error);
                        button.textContent = "Error";
                        button.setAttribute("style", "color: red; border-color: red");
                    });
            
                    Handy.uploadDataToServer(scriptData)
                        .then(response => {
                            console.log('Upload successful:', response);
                            url = response;
                        })
                        .catch(error => {
                            console.error('Upload failed:', error);
                            button.textContent = "Upload Failed";
                            button.setAttribute("style", "color: red; border-color: red");
                        });
                }
            } else {
                console.error("No funscript available for this video.");
            }

        });
        
        // Add event listener for the "Fav" button
        squareButton.addEventListener('click', function() {
            const videoTitle = videoData.folderName; // Get the title of the video

            // Check if the video is already favorited
            if (this.classList.contains('favorited')) {
                // If it is favorited, remove it from the array and update the button style
                favVideos = favVideos.filter(title => title !== videoTitle);
                this.classList.remove('favorited'); // Remove the favorited class
                this.style.backgroundColor = ''; // Reset background color
                this.style.color = ''; // Reset star color
            } else {
                // If it is not favorited, add it to the array and update the button style
                favVideos.push(videoTitle);
                this.classList.add('favorited'); // Add the favorited class
                this.style.backgroundColor = '#FFD700'; // Set background to deep yellow
                this.style.color = '#424242'; // Set star color to match the Load Script button
            }

            console.log('Favorite Videos:', favVideos); // Log the current favorites
        });
        
        videoElement.addEventListener('loadedmetadata', () => {
            // Check if the video has valid frames
            const checkPreview = videoElement.mozHasAudio || 
                               videoElement.webkitDecodedFrameCount > 0 ||
                               videoElement.videoWidth > 0;

            if (!checkPreview) {
                console.log("No preview available for:", videoData.folderName);
                videoWrapper.remove();
                return;
            }

            const isPortrait = videoElement.videoHeight > videoElement.videoWidth;
            videoWrapper.setAttribute('data-orientation', isPortrait ? 'portrait' : 'landscape');

            if (videoElement.videoWidth > videoElement.videoHeight) {
                videoElement.style.width = '100%';
                videoElement.style.height = 'auto';
                videoElement.style.aspectRatio = '16/9';
                videoElement.style.objectFit = 'cover';
            } else {
                videoElement.style.width = '100%';
                videoElement.style.height = 'auto';
                videoElement.style.objectFit = 'cover';
            }
            
            // Add to gallery in correct order
            const existingVideos = Array.from(gallery.children);
            if (isPortrait) {
                // Remove existing divider if it exists
                const existingDivider = gallery.querySelector('.orientation-divider');
                if (existingDivider) existingDivider.remove();
                
                // Find the first landscape video or append at the end
                const firstLandscape = existingVideos.find(el => el.getAttribute('data-orientation') === 'landscape');
                if (firstLandscape) {
                    gallery.insertBefore(videoWrapper, firstLandscape);
                } else {
                    gallery.appendChild(videoWrapper);
                }
                
                // Add divider after all portrait videos
                const divider = document.createElement('div');
                divider.className = 'orientation-divider';
                divider.style.width = '100%';
                divider.style.gridColumn = '1 / -1'; // Span all columns
                if (firstLandscape) {
                    gallery.insertBefore(divider, firstLandscape);
                } else {
                    gallery.appendChild(divider);
                }
            } else {
                gallery.appendChild(videoWrapper);
            }
            
            console.log("Video processed and added to gallery");
        });
        
        // Handle video loading errors
        videoElement.addEventListener('error', () => {
            console.log("Failed to load video:", videoData.folderName);
            videoWrapper.remove();
        });
    });
}

function getDatabaseFileNumber(fileName) {
    const match = fileName.match(/database(?: \((\d+)\))?\.json/);
    return match && match[1] ? parseInt(match[1], 10) : 0; // Return the number or 0 if not found
}

async function getVideosFromFiles(files) {
  const videos = [];
  const funscripts = []
  for (const file of files) {
    if (file.name.endsWith('.funscript')) {
      const content = await readFile(file);
      const folderName = getFolderName(file.webkitRelativePath);
      const fileName = file.name;
      funscripts.push({content, folderName, fileName})
      
    }
    if (!file.isDirectory && file.name.match(/\.(mp4|webm|ogg|mkv)$/i)) {
      const folderName = getFolderName(file.webkitRelativePath);
      videos.push({ file, folderName});
    }
  }
  return [videos, funscripts];
}

function getFolderName(webkitRelativePath) {
  const parts = webkitRelativePath.split('/');
  // The folder name is the second to last part in the path
  return parts[parts.length - 2];
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const content = event.target.result;
      resolve(content); // Resolve with the content
    };
    reader.onerror = function(error) {
      reject(error);
    };
    reader.readAsText(file);
  });
}

function getFunscriptWithFolderName(name){
  return funscripts.find(obj => obj['folderName'] === name)
}
function getFunscriptWithFileName(fileName) {
    return funscripts.find(obj => obj.fileName === fileName);
}

function createVideoElement(file) {
    const wrapper = document.createElement("div");
    wrapper.className = "video-wrapper";

    const p = document.createElement("p");
    p.textContent = file.name;
    wrapper.appendChild(p);

    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.controls = true;
    video.addEventListener('loadedmetadata', () => {
        if (video.videoWidth > video.videoHeight) {
            video.style.width = '100%';
            video.style.height = 'auto';
            video.style.aspectRatio = '16/9';
            video.style.objectFit = 'cover';
        } else {
            video.style.width = '100%';
            video.style.height = 'auto';
            video.style.objectFit = 'cover';
        }
    });
    wrapper.appendChild(video);

    const loader = document.createElement("button");
    loader.textContent = "Load";
    loader.className = "loader";
    wrapper.appendChild(loader);

    return wrapper;
}

async function filterVideos() {
    console.log('Phone mode:', isPhoneMode,);
    console.log('PC mode:', isPcMode);
    console.log('Fav mode:', isFavMode);
    const videos = document.querySelectorAll('.video-wrapper');
    console.log('Found videos:', videos.length);
    

    for (const wrapper of videos) {
        const video = wrapper.querySelector('video');
        
        if (video) {
            try {
                if (!video.videoWidth || !video.videoHeight) {
                    await new Promise(resolve => video.addEventListener('loadedmetadata', resolve));
                }
                
                
                const isPortrait = video.videoHeight > video.videoWidth;
                const isFav = favVideos.includes(wrapper.querySelector('p').textContent)
                console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight, 'isPortrait:', isPortrait);
                console.log('isFav:', isFav);
                
                if(isFavMode){
                    if(isFav){
                        wrapper.style.display = 'block';
                        if (isPhoneMode && isPortrait) {

                            wrapper.style.display = 'none';
                        } else if (isPcMode && !isPortrait) {
                            wrapper.style.display = 'none';
                        } else {
                            wrapper.style.display = 'block';
                        }
                    } else {
                        wrapper.style.display = 'none'
                    }
                }
                if(!isFavMode){
                    if (isPhoneMode && isPortrait) {
                        wrapper.style.display = 'none';
                    } else if (isPcMode && !isPortrait) {
                        wrapper.style.display = 'none';
                    } else {
                        wrapper.style.display = 'block';
                    }
                }


            } catch (error) {
                console.error('Error processing video:', error);
            }

        }
    }
}
  
async function generateJsonFile() {
    const handyCode = document.getElementById('handyCode').value;
    console.log('Generating JSON file with data:'); // Debugging log
    const jsonString = JSON.stringify({handyCode, favVideos}, null, 2); // Pretty print with 2 spaces
    const blob = new Blob([jsonString], { type: 'application/json' });
    

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "database.json"; // Set the filename for the download

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

  