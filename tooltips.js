// Tooltip Manager Class
class TooltipManager {
    constructor() {
        // Race tooltip elements
        this.raceDropdown = document.getElementById('race-dropdown');
        this.raceButton = this.raceDropdown.querySelector('button');
        this.raceDropdownContent = this.raceDropdown.querySelector('.dropdown-content');
        this.raceOptions = this.raceDropdown.querySelectorAll('.race-option');
        this.selectedRaceText = this.raceDropdown.querySelector('.selected-race');
        this.raceTooltip = document.getElementById('race-tooltip');

        // Deity tooltip elements
        this.deityDropdown = document.getElementById('deity-dropdown');
        this.deityButton = this.deityDropdown.querySelector('button');
        this.deityDropdownContent = this.deityDropdown.querySelector('.dropdown-content');
        this.deityOptions = this.deityDropdown.querySelectorAll('.deity-option');
        this.selectedDeityText = this.deityDropdown.querySelector('.selected-deity');
        this.deityTooltip = document.getElementById('deity-tooltip');

        // Lifepath tooltip elements
        this.lifepathDropdown = document.getElementById('lifepath-dropdown');
        this.lifepathButton = this.lifepathDropdown.querySelector('button');
        this.lifepathDropdownContent = this.lifepathDropdown.querySelector('.dropdown-content');
        this.lifepathOptions = this.lifepathDropdown.querySelectorAll('.lifepath-option');
        this.selectedLifepathText = this.lifepathDropdown.querySelector('.selected-lifepath');
        this.lifepathTooltip = document.getElementById('lifepath-tooltip');

        // Birthsign tooltip elements
        this.birthsignDropdown = document.getElementById('birthsign-dropdown');
        this.birthsignButton = this.birthsignDropdown.querySelector('button');
        this.birthsignDropdownContent = this.birthsignDropdown.querySelector('.dropdown-content');
        this.birthsignOptions = this.birthsignDropdown.querySelectorAll('.birthsign-option');
        this.selectedBirthsignText = this.birthsignDropdown.querySelector('.selected-birthsign');
        this.birthsignTooltip = document.getElementById('birthsign-tooltip');

        this.loadDeityData();
        this.loadLifepathData();
        this.loadBirthsignData();
        this.initializeEventListeners();
        this.initializeLifepathTooltips();
    }

    async loadDeityData() {
        try {
            const response = await fetch('./dieties.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Convert the array to an object for faster lookups
            this.deityData = data.reduce((acc, deity) => {
                if (!deity.name.includes('&mdash;')) {
                    // Store with consistent formatting
                    const key = deity.name
                        .toLowerCase()
                        .replace(/^the\s+/, 'the ') // Consistent handling of "The" prefix
                        .replace(/['-]/g, ''); // Remove apostrophes and hyphens for matching
                    acc[key] = deity;
                }
                return acc;
            }, {});
            console.log('Processed deity data:', this.deityData); // Debug log
        } catch (error) {
            console.error('Error loading deity data:', error);
        }
    }

    async loadLifepathData() {
        try {
            const response = await fetch('lifepaths.json');
            this.lifepathData = await response.json();
        } catch (error) {
            console.error('Error loading lifepath data:', error);
        }
    }

    async loadBirthsignData() {
        try {
            const response = await fetch('birthsigns.json');
            this.birthsignData = await response.json();
        } catch (error) {
            console.error('Error loading birthsign data:', error);
        }
    }

    initializeEventListeners() {
        // Race dropdown events
        this.raceButton.addEventListener('click', () => {
            this.raceDropdownContent.classList.toggle('hidden');
        });

        this.raceOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedRace = e.target.dataset.race;
                this.selectedRaceText.textContent = e.target.textContent;
                this.raceDropdownContent.classList.add('hidden');
                this.updateRaceTooltip(selectedRace);
            });

            option.addEventListener('mouseenter', (e) => {
                const race = e.target.dataset.race;
                this.showRaceTooltip(race);
            });

            option.addEventListener('mouseleave', () => {
                this.hideRaceTooltip();
            });
        });

        // Deity dropdown events
        this.deityButton.addEventListener('click', () => {
            this.deityDropdownContent.classList.toggle('hidden');
        });

        this.deityOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedDeity = e.target.dataset.deity;
                this.selectedDeityText.textContent = e.target.textContent;
                this.deityDropdownContent.classList.add('hidden');
                this.updateDeityTooltip(selectedDeity);
            });

            option.addEventListener('mouseenter', (e) => {
                const deity = e.target.dataset.deity;
                this.showDeityTooltip(deity);
            });

            option.addEventListener('mouseleave', () => {
                this.hideDeityTooltip();
            });
        });

        // Dropdown hover events
        this.raceDropdown.addEventListener('mouseenter', () => {
            const selectedRace = this.selectedRaceText.textContent;
            if (selectedRace !== 'Select Race') {
                this.showRaceTooltip(selectedRace.toLowerCase());
            }
        });

        this.raceDropdown.addEventListener('mouseleave', () => {
            this.hideRaceTooltip();
        });

        this.deityDropdown.addEventListener('mouseenter', () => {
            const selectedDeity = this.selectedDeityText.textContent;
            if (selectedDeity !== 'Choose Deity') {
                this.showDeityTooltip(selectedDeity.toLowerCase());
            }
        });

        this.deityDropdown.addEventListener('mouseleave', () => {
            this.hideDeityTooltip();
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.raceDropdown.contains(e.target)) {
                this.raceDropdownContent.classList.add('hidden');
            }
            if (!this.deityDropdown.contains(e.target)) {
                this.deityDropdownContent.classList.add('hidden');
            }
        });

        // Lifepath dropdown events
        this.lifepathButton.addEventListener('click', () => {
            this.lifepathDropdownContent.classList.toggle('hidden');
        });

        this.lifepathOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedLifepath = e.target.dataset.lifepath;
                this.selectedLifepathText.textContent = e.target.textContent;
                this.lifepathDropdownContent.classList.add('hidden');
                this.showLifepathTooltip(selectedLifepath);
            });

            option.addEventListener('mouseenter', (e) => {
                const lifepath = e.target.dataset.lifepath;
                this.showLifepathTooltip(lifepath);
            });

            option.addEventListener('mouseleave', () => {
                this.hideLifepathTooltip();
            });
        });

        // Birthsign dropdown events
        this.birthsignButton.addEventListener('click', () => {
            this.birthsignDropdownContent.classList.toggle('hidden');
        });

        this.birthsignOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedBirthsign = e.target.dataset.birthsign;
                this.selectedBirthsignText.textContent = e.target.textContent;
                this.birthsignDropdownContent.classList.add('hidden');
                this.updateBirthsignTooltip(selectedBirthsign);
            });

            option.addEventListener('mouseenter', (e) => {
                const birthsign = e.target.dataset.birthsign;
                this.showBirthsignTooltip(birthsign);
            });

            option.addEventListener('mouseleave', () => {
                this.hideBirthsignTooltip();
            });
        });

        // Birthsign hover events
        this.birthsignDropdown.addEventListener('mouseenter', () => {
            const selectedBirthsign = this.selectedBirthsignText.textContent;
            if (selectedBirthsign !== 'Choose Birthsign') {
                this.showBirthsignTooltip(selectedBirthsign.toLowerCase());
            }
        });

        this.birthsignDropdown.addEventListener('mouseleave', () => {
            this.hideBirthsignTooltip();
        });
    }

    initializeLifepathTooltips() {
        this.lifepathOptions.forEach(option => {
            option.addEventListener('mouseenter', () => {
                const lifepath = option.getAttribute('data-lifepath');
                this.showLifepathTooltip(lifepath);
            });

            option.addEventListener('mouseleave', () => {
                this.hideLifepathTooltip();
            });
        });
    }

    // Race tooltip methods
    showRaceTooltip(race) {
        const tooltips = this.raceTooltip.querySelectorAll('[class^="tooltip-"]');
        tooltips.forEach(tooltip => tooltip.classList.add('hidden'));
        
        const activeTooltip = this.raceTooltip.querySelector(`.tooltip-${race}`);
        if (activeTooltip) {
            this.raceTooltip.classList.remove('hidden');
            activeTooltip.classList.remove('hidden');
        }
    }

    hideRaceTooltip() {
        this.raceTooltip.classList.add('hidden');
    }

    updateRaceTooltip(race) {
        if (race) {
            this.showRaceTooltip(race);
        }
    }

    // Deity tooltip methods
    showDeityTooltip(deity) {
        if (!this.deityData) {
            console.log('Deity data not loaded yet');
            return;
        }
        
        // Convert deity name to match the JSON format
        let deityKey = deity
            .replace(/-/g, ' ')          // Convert hyphens to spaces
            .replace(/^the-/, 'The ')    // Handle "The" prefix
            .replace(/-/g, "'")          // Convert remaining hyphens to apostrophes
            .toLowerCase();              // Convert to lowercase

        // Special case handling for specific deities
        const specialCases = {
            'riddlethar': "Riddle'Thar",
            'hoondling': 'The HoonDing',
            'all maker': 'The All-Maker',
            'magna ge': 'The Magna-Ge',
            'old ways': 'The Old Ways'
        };

        if (specialCases[deityKey]) {
            deityKey = specialCases[deityKey].toLowerCase();
        }

        console.log('Looking for deity:', deityKey); // Debug log
        
        const deityInfo = this.deityData[deityKey];
        if (!deityInfo) {
            console.log('Deity not found:', deityKey);
            return;
        }

        console.log('Showing tooltip for:', deity);
        this.deityTooltip.innerHTML = `
            <h4 class="font-bold text-amber-500">${deityInfo.name}</h4>
            ${deityInfo.shrine !== '-' ? `<p class="text-sm mb-2 text-blue-400">Shrine Blessing: ${deityInfo.shrine}</p>` : ''}
            ${deityInfo.follower !== '-' ? `<p class="text-sm mb-2 text-green-400">Follower Ability: ${deityInfo.follower}</p>` : ''}
            ${deityInfo.devotee !== '-' ? `<p class="text-sm mb-2 text-purple-400">Devotee Power: ${deityInfo.devotee}</p>` : ''}
            ${deityInfo.tenets !== '-' ? `<p class="text-sm mb-2 text-gray-300">Tenets: ${deityInfo.tenets}</p>` : ''}
            ${deityInfo.race !== '-' ? `<p class="text-sm text-yellow-400">Available to: ${deityInfo.race}</p>` : ''}
            ${deityInfo.starting !== '' ? `<p class="text-sm text-orange-400">Starting Option for: ${deityInfo.starting}</p>` : ''}
            ${deityInfo.req !== '-' ? `<p class="text-sm text-red-400">Requirements: ${deityInfo.req}</p>` : ''}
        `;
        this.deityTooltip.classList.remove('hidden');
    }

    hideDeityTooltip() {
        this.deityTooltip.classList.add('hidden');
    }

    updateDeityTooltip(deity) {
        if (deity) {
            this.showDeityTooltip(deity);
        }
    }

    showLifepathTooltip(lifepath) {
        const tooltipContent = document.querySelector(`.tooltip-${lifepath.toLowerCase()}`);
        if (tooltipContent) {
            // Hide all tooltips first
            const allTooltips = this.lifepathTooltip.querySelectorAll('[class^="tooltip-"]');
            allTooltips.forEach(t => t.classList.add('hidden'));
            
            // Show the selected tooltip
            tooltipContent.classList.remove('hidden');
            this.lifepathTooltip.classList.remove('hidden');
        }
    }

    hideLifepathTooltip() {
        this.lifepathTooltip.classList.add('hidden');
    }

    showBirthsignTooltip(birthsign) {
        if (!this.birthsignData) {
            console.log('Birthsign data not loaded yet');
            return;
        }

        const birthsignInfo = this.birthsignData.find(b => b.name.toLowerCase() === birthsign.toLowerCase());
        if (!birthsignInfo) {
            console.log('Birthsign not found:', birthsign);
            return;
        }

        let bonusHtml = '';
        if (birthsignInfo.bonus) {
            bonusHtml = '<div class="mt-2">';
            for (const [stat, details] of Object.entries(birthsignInfo.bonus)) {
                const formattedStat = stat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                bonusHtml += `<p class="text-green-400">${formattedStat}: ${details.value}${details.type === 'percent' ? '%' : ''}</p>`;
            }
            bonusHtml += '</div>';
        }

        let enhancedBonusHtml = '';
        if (birthsignInfo.enhanced_bonus) {
            enhancedBonusHtml = `
                <div class="mt-2">
                    <p class="text-blue-400">Enhanced Effects (with skills):</p>
                    <p class="text-gray-300 text-sm">Trigger Skills: ${birthsignInfo.enhanced_bonus.trigger_skills.join(', ')}</p>
                    ${Object.entries(birthsignInfo.enhanced_bonus.effects).map(([stat, details]) => {
                        const formattedStat = stat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        return `<p class="text-green-400">${formattedStat}: ${details.value}${details.type === 'percent' ? '%' : ''}</p>`;
                    }).join('')}
                </div>`;
        }

        this.birthsignTooltip.innerHTML = `
            <h4 class="font-bold text-amber-500 mb-2">${birthsignInfo.name}</h4>
            <p class="text-gray-300 mb-2">${birthsignInfo.description}</p>
            ${birthsignInfo.group ? `<p class="text-blue-300 text-sm mb-2">${birthsignInfo.group}</p>` : ''}
            ${bonusHtml}
            ${enhancedBonusHtml}
        `;
        
        this.birthsignTooltip.classList.remove('hidden');
    }

    hideBirthsignTooltip() {
        this.birthsignTooltip.classList.add('hidden');
    }

    updateBirthsignTooltip(birthsign) {
        this.showBirthsignTooltip(birthsign);
    }
}

// Initialize tooltips when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing TooltipManager...');
    new TooltipManager();
}); 