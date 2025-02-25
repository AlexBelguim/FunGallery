export class HandyManager {
    constructor() {
        this.HANDY = Handy.init();
        this.url = '';
        this.activeButton = null;
    }

    resetButton(button) {
        button.textContent = '🤖';
        button.setAttribute('style', '');
        button.disabled = false;
    }

    setButtonLoading(button) {
        button.textContent = '⌛';
        button.setAttribute('style', 'color: #FFD700; border-color: #FFD700');
        button.disabled = true;
    }

    connectAndLoadScript(videoElement, handyCode, scriptData, button) {
        // Reset previous active button if it's different from the current one
        if (this.activeButton && this.activeButton !== button) {
            this.resetButton(this.activeButton);
        }
        this.activeButton = button;

        // Set loading state
        this.setButtonLoading(button);

        this.HANDY.disconnect();
        this.HANDY.setVideoPlayer(videoElement);

        if (!handyCode) {
            console.error("No Handy code provided");
            button.textContent = "Error: No Code";
            button.setAttribute("style", "color: red; border-color: red");
            button.disabled = false;
            return;
        }

        // Parse the script content if it's a string
        let parsedScript;
        try {
            parsedScript = typeof scriptData.content === 'string' 
                ? JSON.parse(scriptData.content) 
                : scriptData.content;
        } catch (error) {
            console.error("Error parsing script:", error);
            button.textContent = "Script Error";
            button.setAttribute("style", "color: red; border-color: red");
            button.disabled = false;
            return;
        }

        console.log('🔄 Uploading script:', scriptData.fileName);

        // Upload script first
        Handy.uploadDataToServer(parsedScript)
            .then(response => {
                console.log('✅ Script upload successful:', scriptData.fileName);
                this.url = response;
                button.textContent = '📤'; // Upload complete
                
                // Then connect to Handy
                return this.HANDY.connect(handyCode);
            })
            .then(response => {
                console.log('Handy connected:', response);
                if (response === Handy.ConnectResult.CONNECTED) {
                    console.log('Connected');
                    button.textContent = '🔗'; // Connection complete
                    return this.HANDY.setScript(this.url);
                } else {
                    console.log("Not connected");
                    button.textContent = "Connection Failed";
                    button.setAttribute("style", "color: red; border-color: red");
                    button.disabled = false;
                    throw new Error("Connection failed");
                }
            })
            .then(() => {
                button.textContent = "✅";
                button.setAttribute("style", 'border-color: limegreen; color: limegreen');
                button.disabled = false;
                
                videoElement.style.objectFit = 'contain';
                videoElement.style.minHeight = videoElement.offsetHeight + 'px';
                
                videoElement.currentTime = 0;
            })
            .catch(error => {
                console.error("Error:", error);
                button.textContent = "❌";
                button.setAttribute("style", "color: red; border-color: red");
                button.disabled = false;
            });
    }
}