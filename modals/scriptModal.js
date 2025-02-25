export function showScriptModal(videoData, funscripts, scriptFavoriteManager, scriptHateManager,  wrapper) {
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'script-modal';
    modal.style.display = 'flex';

    const modalContent = document.createElement('div');
    modalContent.className = 'script-modal-content';

    // Create header
    const header = document.createElement('div');
    header.className = 'script-modal-header';

    const title = document.createElement('h3');
    title.className = 'script-modal-title';
    title.textContent = 'Select Script';

    const closeButton = document.createElement('button');
    closeButton.className = 'script-modal-close';
    closeButton.textContent = '×';
    closeButton.onclick = () => modal.remove();

    header.appendChild(title);
    header.appendChild(closeButton);

    // Create script list
    const scriptList = document.createElement('div');
    scriptList.className = 'script-list';

    const favScript = scriptFavoriteManager.getFavoriteScript(videoData.fullPath);
    const selectedIndex = parseInt(wrapper.dataset.selectedScript);

    videoData.scriptNames.forEach((scriptName, index) => {
        const scriptItem = document.createElement('div');
        scriptItem.className = 'script-item';
        if (index === parseInt(wrapper.dataset.selectedScript)) {
            scriptItem.classList.add('selected');
        }

        const nameSpan = document.createElement('span');
        nameSpan.className = 'script-name';
        nameSpan.textContent = scriptName;

        // Create buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'script-buttons';

        // Favorite button
        const favButton = document.createElement('button');
        favButton.className = 'script-favorite-button';
        favButton.textContent = '☆';
        if (scriptName === favScript) {
            favButton.classList.add('favorited');
        }

        favButton.onclick = (e) => {
            e.stopPropagation();
            const isFav = scriptFavoriteManager.toggleFavorite(videoData.fullPath, scriptName);
            scriptFavoriteManager.saveFavorites();

            document.querySelectorAll('.script-favorite-button').forEach(btn => 
                btn.classList.remove('favorited'));
            if (isFav) {
                favButton.classList.add('favorited');
            }
        };

        // Hate button
        const hateButton = document.createElement('button');
        hateButton.className = 'script-hate-button';
        const isHated = scriptHateManager.isHated(videoData.fullPath, scriptName);
        hateButton.innerHTML = '💔︎';
        if (isHated) {
            hateButton.classList.add('hated');
        }

        hateButton.onclick = (e) => {
            e.stopPropagation();
            const isNowHated = scriptHateManager.toggleHate(videoData.fullPath, scriptName);
            scriptHateManager.saveHated();

            document.querySelectorAll('.script-hate-button').forEach(btn => 
                btn.classList.remove('hated'));
            if (isNowHated) {
                hateButton.classList.add('hated');
            }
        };

        // Script item click handler
        scriptItem.addEventListener('click', () => {
            document.querySelectorAll('.script-item').forEach(item => 
                item.classList.remove('selected'));
            scriptItem.classList.add('selected');
            wrapper.dataset.selectedScript = index;
            modal.remove();
        });
   

        buttonContainer.appendChild(favButton);
        buttonContainer.appendChild(hateButton);
        scriptItem.appendChild(nameSpan);
        scriptItem.appendChild(buttonContainer);
        scriptList.appendChild(scriptItem);
    });

    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(scriptList);
    modal.appendChild(modalContent);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}