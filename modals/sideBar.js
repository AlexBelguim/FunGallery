document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');

    // Track button states
    let leftButtonDown = false;
    let rightButtonDown = false;

    // Prevent context menu from showing on right click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Mouse down handler
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left click
            leftButtonDown = true;
        } else if (e.button === 2) { // Right click
            rightButtonDown = true;
        }

        // Check if both buttons are pressed
        if (leftButtonDown && rightButtonDown) {
            sidebar.classList.toggle('hidden');
        }
    });

    // Mouse up handler
    document.addEventListener('mouseup', (e) => {
        if (e.button === 0) { // Left click
            leftButtonDown = false;
        } else if (e.button === 2) { // Right click
            rightButtonDown = false;
        }
    });

    // Reset button states when mouse leaves window
    document.addEventListener('mouseleave', () => {
        leftButtonDown = false;
        rightButtonDown = false;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    

    // Add dropdown functionality
    const categoryHeader = document.querySelector('.category-header');
    const filterButtons = document.querySelector('.filter-buttons');

    categoryHeader.addEventListener('click', () => {
        categoryHeader.classList.toggle('collapsed');
        filterButtons.classList.toggle('collapsed');
    });

    const categoryHeaderTag = document.querySelector('.tag-tittle')
    const tagButtons = document.querySelector('.tag-buttons')

    categoryHeaderTag.addEventListener('click', () => {
        categoryHeaderTag.classList.toggle('collapsed');
        tagButtons.classList.toggle('collapsed');
    })


});

function optimizeTagButtonLayout() {
    const container = document.querySelector('.filter-buttons.tag-buttons.bin-packing');
    if (!container) return;
    
    const buttons = Array.from(container.children);
    if (buttons.length === 0) return;
    
    // Save the scroll position
    const scrollTop = container.scrollTop;
    
    // Calculate button widths (including gap)
    const gap = 8; // match CSS gap value
    const buttonSizes = buttons.map(button => {
        return {
            element: button,
            width: button.offsetWidth + gap
        };
    });
    
    const containerWidth = container.clientWidth - gap - 6; // Account for padding and scrollbar
    
    // Sort buttons by width (descending) for better packing
    buttonSizes.sort((a, b) => b.width - a.width);
    
    // Initialize rows
    const rows = [{ remainingWidth: containerWidth, buttons: [] }];
    
    // Place each button in the row with the most remaining space
    buttonSizes.forEach(buttonData => {
        // Find the row where this button fits best
        let bestRowIndex = -1;
        let bestRemainingWidth = -1;
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.remainingWidth >= buttonData.width) {
                // This button fits in this row
                if (bestRowIndex === -1 || row.remainingWidth < bestRemainingWidth) {
                    bestRowIndex = i;
                    bestRemainingWidth = row.remainingWidth;
                }
            }
        }
        
        // If we found a row, add the button to it
        if (bestRowIndex !== -1) {
            rows[bestRowIndex].buttons.push(buttonData.element);
            rows[bestRowIndex].remainingWidth -= buttonData.width;
        } else {
            // Create a new row for this button
            rows.push({
                remainingWidth: containerWidth - buttonData.width,
                buttons: [buttonData.element]
            });
        }
    });
    
    // Apply the order based on the calculated rows
    let orderIndex = 0;
    rows.forEach(row => {
        row.buttons.forEach(button => {
            button.style.order = orderIndex++;
        });
    });
    
    // Restore scroll position after optimization
    setTimeout(() => {
        container.scrollTop = scrollTop;
    }, 0);
    
    console.log(`Optimized ${buttons.length} buttons into ${rows.length} rows`);
}

document.addEventListener('DOMContentLoaded', () => {
    // Previous sidebar code remains...
    
    // Optimize tag button layout
    const tagButtonsContainer = document.querySelector('.filter-buttons.tag-buttons');
    if (tagButtonsContainer) {
        // Initial optimization
        setTimeout(optimizeTagButtonLayout, 100);
        
        // Re-optimize on window resize
        window.addEventListener('resize', () => {
            optimizeTagButtonLayout();
        });
        
        // Re-optimize when category is expanded
        const categoryHeader = document.querySelector('.category-header');
        if (categoryHeader) {
            categoryHeader.addEventListener('click', () => {
                // Wait for animation to complete
                setTimeout(optimizeTagButtonLayout, 300);
            });
        }
        
        // Re-optimize when scrollbar appears/disappears
        const resizeObserver = new ResizeObserver(() => {
            optimizeTagButtonLayout();
        });
        resizeObserver.observe(tagButtonsContainer);
    }
});