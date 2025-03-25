document.addEventListener('DOMContentLoaded', function() {
    // Handle skill level inputs
    document.querySelectorAll('.skill-level-input').forEach(input => {
        // Prevent expansion when clicking input
        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Update display when input changes
        input.addEventListener('input', updateSkillLevel);
        input.addEventListener('change', updateSkillLevel);
    });
});

function updateSkillLevel(e) {
    let value = parseInt(e.target.value);
    // Enforce min/max values
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    if (isNaN(value)) value = 0;
    
    // Update input value
    e.target.value = value;
    
    // Update the display span (find the closest display span within the same skill tree card)
    const skillCard = e.target.closest('.skill-tree-card');
    const display = skillCard.querySelector('.skill-level-display');
    if (display) {
        display.textContent = value;
    }
    
    // Here you can add logic to update perk availability based on skill level
    updatePerkAvailability(e.target.dataset.skill, value);
}

function updatePerkAvailability(skillName, level) {
    // Add logic here to enable/disable perks based on skill level
    console.log(`${skillName} level changed to ${level}`);
}
