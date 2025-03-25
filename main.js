document.addEventListener('DOMContentLoaded', () => {
    const tooltipManager = new TooltipManager();
    
    // Debug logging
    console.log('TooltipManager initialized');
    
    // Test level input connection
    const levelInput = document.querySelector('#character-level input');
    if (levelInput) {
        console.log('Level input found');
    } else {
        console.error('Level input not found');
    }
}); 