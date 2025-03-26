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
    
    // Logic to update perk availability based on skill level
    updatePerkAvailability(e.target.dataset.skill, value);
}

function updatePerkAvailability(skillName, level) {
    // Add logic here to enable/disable perks based on skill level
    console.log(`${skillName} level changed to ${level}`);
}

async function loadSkillTreeData(skillName) {
    try {
        const response = await fetch(`/skilltrees/${skillName}.json`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error loading skill tree data for ${skillName}:`, error);
        return null;
    }
}

function createPerkElement(perk) {
    const perkElement = document.createElement('div');
    perkElement.className = 'perk-node bg-gray-700 p-4 rounded-lg m-2';
    perkElement.innerHTML = `
        <h4 class="text-amber-500 font-bold mb-2">${perk.name}</h4>
        <p class="text-gray-300 text-sm mb-2">${perk.description}</p>
        <div class="text-gray-400 text-xs">
            Required Skill Level: ${perk.requirements.skill}
        </div>
    `;
    // Use the same spacing and offset as the connections
    perkElement.style.position = 'absolute';
    perkElement.style.left = `${perk.position.x * 150 + 125}px`;
    perkElement.style.top = `${perk.position.y * 150 + 100}px`;
    return perkElement;
}
