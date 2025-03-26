// Tooltip Manager Class - Handles all tooltip and dropdown interactions
class TooltipManager {
    constructor() {
        // Initialize DOM element references for race tooltips
        this.raceDropdown = document.getElementById('race-dropdown');
        this.raceButton = this.raceDropdown.querySelector('button');
        this.raceDropdownContent = this.raceDropdown.querySelector('.dropdown-content');
        this.raceOptions = this.raceDropdown.querySelectorAll('.race-option');
        this.selectedRaceText = this.raceDropdown.querySelector('.selected-race');
        this.raceTooltip = document.getElementById('race-tooltip');

        // Initialize DOM element references for deity tooltips
        this.deityDropdown = document.getElementById('deity-dropdown');
        this.deityButton = this.deityDropdown.querySelector('button');
        this.deityDropdownContent = this.deityDropdown.querySelector('.dropdown-content');
        this.deityOptions = this.deityDropdown.querySelectorAll('.deity-option');
        this.selectedDeityText = this.deityDropdown.querySelector('.selected-deity');
        this.deityTooltip = document.getElementById('deity-tooltip');

        // Initialize DOM element references for lifepath tooltips
        this.lifepathDropdown = document.getElementById('lifepath-dropdown');
        this.lifepathButton = this.lifepathDropdown.querySelector('button');
        this.lifepathDropdownContent = this.lifepathDropdown.querySelector('.dropdown-content');
        this.lifepathOptions = this.lifepathDropdown.querySelectorAll('.lifepath-option');
        this.selectedLifepathText = this.lifepathDropdown.querySelector('.selected-lifepath');
        this.lifepathTooltip = document.getElementById('lifepath-tooltip');

        // Initialize DOM element references for birthsign tooltips
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

        // Load race data
        this.races = [];
        this.loadRaceData();
        
        // Add event listeners for race selection
        this.setupRaceListeners();

        // Initialize attribute management
        this.levelInput = document.querySelector('#character-level input');
        this.healthButton = document.querySelector('#attribute-points .flex-1:nth-child(1) button:first-child');
        this.magickaButton = document.querySelector('#attribute-points .flex-1:nth-child(2) button:first-child');
        this.staminaButton = document.querySelector('#attribute-points .flex-1:nth-child(3) button:first-child');
        
        // Get attribute buttons with more specific selectors
        this.healthDecreaseButton = document.querySelector('#attribute-points .flex-1:nth-child(1) button:last-child');
        this.magickaDecreaseButton = document.querySelector('#attribute-points .flex-1:nth-child(2) button:last-child');
        this.staminaDecreaseButton = document.querySelector('#attribute-points .flex-1:nth-child(3) button:last-child');
        
        // Reset level input on page load
        this.levelInput.value = '';
        
        this.baseAttributes = {
            health: 100,
            magicka: 100,
            stamina: 100
        };
        
        this.attributePoints = {
            available: 0,
            spent: {
                health: 0,
                magicka: 0,
                stamina: 0
            }
        };

        this.setupAttributeSystem();

        // Initialize resistance tracking
        this.resistances = {
            fire: 0,
            frost: 0,
            shock: 0,
            poison: 0,
            disease: 0,
            magic: 0,
            damage: 0
        };

        // Modify resistance sources to include lifepath and birthsign
        this.resistanceSources = {
            racial: {},
            lifepath: {},
            birthsign: {},
            perks: {},
        };

        this.initializeSkillTrees();

        // Add perk points tracking
        this.perkPoints = {
            available: 0,
            spent: 0
        };
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializePerkPointSystem());
        } else {
            this.initializePerkPointSystem();
        }

        // Add tracking for current skill levels
        this.skillLevels = {};
        this.setupSkillLevels();
        this.setupSkillInputHandlers();

        // Perk positioning constants
        this.PERK_SPACING = 150;    // Space between perks
        this.PERK_OFFSET_X = 125;   // Horizontal offset from left
        this.PERK_OFFSET_Y = 100;   // Vertical offset from top
        this.PERK_DOT_SIZE = 24;    // Size of the perk dot
    }

    async loadDeityData() {
        try {
            const basePath = window.location.pathname.startsWith('/') ? window.location.pathname : '/' + window.location.pathname;
            const response = await fetch(`${basePath}dieties.json`);
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

    async loadRaceData() {
        try {
            const response = await fetch('races.json');
            this.races = await response.json();
            this.setupRaceTooltips();
        } catch (error) {
            console.error('Error loading race data:', error);
        }
    }

    setupRaceTooltips() {
        this.races.forEach(race => {
            const tooltipDiv = document.querySelector(`.tooltip-${race.name.toLowerCase()}`);
            if (tooltipDiv) {
                let tooltipHtml = `
                    <h4 class="font-bold text-amber-500 text-lg mb-3">${race.name}</h4>
                    <div class="mb-4">
                        <p class="text-sm mb-2 text-blue-300">Base Stats:</p>
                        <div class="grid grid-cols-3 gap-4 text-sm pl-3">
                            <p>Health: <span class="${race.bonusStats.health > 0 ? 'text-green-400' : 'text-gray-300'}">${race.baseStats.health}${race.bonusStats.health > 0 ? ' + ' + race.bonusStats.health : ''}</span></p>
                            <p>Magicka: <span class="${race.bonusStats.magicka > 0 ? 'text-green-400' : 'text-gray-300'}">${race.baseStats.magicka}${race.bonusStats.magicka > 0 ? ' + ' + race.bonusStats.magicka : ''}</span></p>
                            <p>Stamina: <span class="${race.bonusStats.stamina > 0 ? 'text-green-400' : 'text-gray-300'}">${race.baseStats.stamina}${race.bonusStats.stamina > 0 ? ' + ' + race.bonusStats.stamina : ''}</span></p>
                        </div>
                    </div>`;

                // Add resistances section if race has resistances
                if (race.resistances && Object.keys(race.resistances).length > 0) {
                    tooltipHtml += `
                        <div class="mb-4">
                            <p class="text-sm mb-2 text-blue-300">Resistances:</p>
                            <div class="grid grid-cols-3 gap-4 text-sm pl-3">
                                ${Object.entries(race.resistances).map(([type, value]) => 
                                    `<p>${type.charAt(0).toUpperCase() + type.slice(1)}: <span class="text-green-400">${value}%</span></p>`
                                ).join('')}
                            </div>
                        </div>`;
                }

                // Add starting skills section
                tooltipHtml += `
                    <div>
                        <p class="text-sm mb-2 text-blue-300">Starting Skills:</p>
                        <div class="grid grid-cols-3 gap-x-6 gap-y-1 text-sm pl-3">
                            <div class="text-gray-300">
                                <p class="text-amber-500 mb-1">Combat</p>
                                <p>One-Handed: ${race.startingSkills.oneHanded}</p>
                                <p>Two-Handed: ${race.startingSkills.twoHanded}</p>
                                <p>Marksman: ${race.startingSkills.marksman}</p>
                                <p>Block: ${race.startingSkills.block}</p>
                                <p>Heavy Armor: ${race.startingSkills.heavyArmor}</p>
                                <p>Evasion: ${race.startingSkills.evasion}</p>
                            </div>
                            <div class="text-gray-300">
                                <p class="text-amber-500 mb-1">Stealth</p>
                                <p>Sneak: ${race.startingSkills.sneak}</p>
                                <p>Wayfarer: ${race.startingSkills.wayfarer}</p>
                                <p>Finesse: ${race.startingSkills.finesse}</p>
                                <p>Speech: ${race.startingSkills.speech}</p>
                                <p>Alchemy: ${race.startingSkills.alchemy}</p>
                                <p>Smithing: ${race.startingSkills.smithing}</p>
                            </div>
                            <div class="text-gray-300">
                                <p class="text-amber-500 mb-1">Magic</p>
                                <p>Illusion: ${race.startingSkills.illusion}</p>
                                <p>Conjuration: ${race.startingSkills.conjuration}</p>
                                <p>Destruction: ${race.startingSkills.destruction}</p>
                                <p>Restoration: ${race.startingSkills.restoration}</p>
                                <p>Alteration: ${race.startingSkills.alteration}</p>
                                <p>Enchanting: ${race.startingSkills.enchanting}</p>
                            </div>
                        </div>
                    </div>`;

                tooltipDiv.innerHTML = tooltipHtml;
            }
        });
    }

    initializeEventListeners() {
        // Global click handler for dropdown management
        document.addEventListener('click', function(event) {
            const dropdowns = document.querySelectorAll('.dropdown-content');
            
            // Close all dropdowns when clicking outside
            if (!event.target.closest('.dropdown')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.add('hidden');
                });
            } else {
                // Close other dropdowns when selecting one
                const currentDropdown = event.target.closest('.dropdown').querySelector('.dropdown-content');
                dropdowns.forEach(dropdown => {
                    if (dropdown !== currentDropdown) {
                        dropdown.classList.add('hidden');
                    }
                });
            }
        });

        // Race dropdown event handlers
        this.raceButton.addEventListener('click', () => {
            this.raceDropdownContent.classList.toggle('hidden');
        });

        this.raceOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const selectedRace = e.target.dataset.race;
                this.selectedRaceText.textContent = selectedRace.charAt(0).toUpperCase() + selectedRace.slice(1);
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
            option.addEventListener('click', () => {
                const birthsign = option.getAttribute('data-birthsign');
                this.selectedBirthsignText.textContent = birthsign.charAt(0).toUpperCase() + birthsign.slice(1);
                this.selectedBirthsignText = this.selectedBirthsignText;
                
                // Hide dropdown
                option.closest('.dropdown-content').classList.add('hidden');
                
                // Update birthsign tooltip
                this.updateBirthsignTooltip(birthsign);
                
                // Update birthsign resistances
                this.updateBirthsignResistances(birthsign);
                
                // Update attributes to reflect new birthsign bonuses
                this.updateAttributeDisplay();
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

        // Add lifepath selection listener
        this.lifepathOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lifepathName = option.getAttribute('data-lifepath');
                this.updateLifepathStats(lifepathName);
            });
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

        // Additional hardcoded buffs for birthsigns
        const additionalBuffs = {
            'warrior': {
                'Base Effects': {
                    'Weapon Damage': '+10%',
                    'Unarmed Damage': '+10',
                    'Armor Penetration': '5%'
                },
                'Enhanced Effects': {
                    'requirements': 'At level 100 in One-Handed, Two-Handed, or Archery:',
                    'effects': {
                        'Armor Penetration': '10%'
                    }
                }
            },
            'lady': {
                'Base Effects': {
                    'Health Regeneration': '+40%',
                    'Stamina Regeneration': '+40%',
                    'Special': 'Run and swim without exhaustion'
                },
                'Enhanced Effects': {
                    'requirements': 'At level 100 in Block, Heavy Armor, One-Handed, Smithing, Two-Handed, or Archery:',
                    'effects': {
                        'Health Regeneration': '+80%',
                        'Stamina Regeneration': '+80%'
                    }
                }
            },
            'lord': {
                'Base Effects': {
                    'Armor Rating': '+150',
                },
                'Enhanced Effects': {
                    'requirements': 'At level 100 in Block, Heavy Armor, One-Handed, Smithing, Two-Handed, or Archery:',
                    'effects': {
                        'Fire Weakness': 'Removed'
                    }
                }
            },
            'steed': {
                'Base Effects': {
                    'Movement Speed': '+10%',
                    'Carry Weight': '+25',
                    'Special': 'Immunity to most movement-reducing effects'
                },
                'Enhanced Effects': {
                    'requirements': 'At level 100 in Block, Heavy Armor, One-Handed, Smithing, Two-Handed, or Archery:',
                    'effects': {
                        'Stamina Regeneration': '+1 per second'
                    }
                }
            },
            'mage': {
                'Base Effects': {
                    'Spell Effectiveness': '+20%'
                }
            },
            'apprentice': {
                'Base Effects': {
                    'Magicka Regeneration': '+300%',
                }
            },
            'atronach': {
                'Base Effects': {
                    'Spell Absorption': '+30%',
                    'Special': [
                        'Cannot regenerate magicka naturally',
                    ]
                }
            },
            'ritual': {
                'Base Effects': {
                    'Powers': [
                        'Blessed Fire',
                        'Dead Horde',
                        'Salvation'
                    ]
                },
                'Enhanced Effects': {
                    'requirements': 'At level 100 in Enchanting:',
                    'effects': {
                        'Enchanting Effectiveness': '+10%'
                    }
                }
            },
            'thief': {
                'Base Effects': {
                    'Lockpicking': '+30% lockpick durability',
                    'Pickpocketing': '+30% success chance',
                    'Stealth': '-30% detection chance',
                    'Physical Damage Avoidance': '+10%',
                    'Special': 'Can sneak without proficiency'
                },
                'Enhanced Effects': {
                    'requirements': 'At level 100 in Alchemy:',
                    'effects': {
                        'Alchemy': '+1 poison dose when crafting'
                    }
                }
            },
            'lover': {
                'Base Effects': {
                    'Stamina Regeneration': '+40%',
                    'Physical Damage Avoidance': '+25%',
                    'Speech': '+25 skill',
                    'Shouts': '-5% cooldown'
                },
                'Enhanced Effects': {
                    'requirements': 'At level 100 in Speech:',
                    'effects': {
                        'Shouts': '-10% cooldown'
                    }
                }
            },
            'shadow': {
                'Base Effects': {
                    'Stealth': '-50% detection chance',
                    'Movement Noise': '-30%',
                    'Special': 'Can sneak without proficiency',
                    'Powers': 'Moonshadow'
                },
                'Enhanced Effects': {
                    'requirements': 'At level 100 in Wayfarer, Finesse, or Sneak:',
                    'effects': {
                        'Armor Penetration': '+5%'
                    }
                }
            },
            'tower': {
                'Base Effects': {
                    'Barter': '+20% better prices',
                    'Carry Weight': '+50',
                    'Lockpicking': '+40% lockpick durability',
                    'Lockpicking Expertise': '+4',
                    'Special': 'Can pick effortless locks in plain sight without detection'
                },
                'Enhanced Effects': {
                    'requirements': 'At level 100 in Light Armor, Heavy Armor, or Block:',
                    'effects': {
                        'Damage Reflection': '+10%'
                    }
                }
            },
            'serpent': {
                'Base Effects': {
                    'Special': 'Immune to most paralysis effects',
                    'Powers': 'Serpent\'s Curse'
                },
                'Enhanced Effects': {
                    'requirements': 'At level 40:',
                    'effects': {
                        'Poison Resistance': '+100%',
                        'Special': 'Serpent\'s Curse deals double damage'
                    }
                }
            },
        };

        // Combine JSON bonus data with additional buffs
        let allEffectsHtml = '<div class="mt-2">';
        allEffectsHtml += '<p class="text-blue-300 mb-1">Base Effects:</p>';
        
        // Add bonuses from JSON with better formatting
        if (birthsignInfo.bonus) {
            for (const [stat, details] of Object.entries(birthsignInfo.bonus)) {
                // Format the stat name to be more readable
                let formattedStat = stat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                // Add "Fortify" prefix for certain stats
                if (['health', 'magicka', 'stamina'].includes(stat)) {
                    formattedStat = 'Fortify ' + formattedStat;
                }
                allEffectsHtml += `<p class="text-green-400">${formattedStat}: +${details.value}${details.type === 'percent' ? '%' : ''}</p>`;
            }
        }

        // Add additional base effects
        if (additionalBuffs[birthsign.toLowerCase()]?.['Base Effects']) {
            for (const [buff, value] of Object.entries(additionalBuffs[birthsign.toLowerCase()]['Base Effects'])) {
                if (Array.isArray(value)) {
                    // Handle array of special effects
                    value.forEach(effect => {
                        allEffectsHtml += `<p class="text-green-400">${buff}: ${effect}</p>`;
                    });
                } else {
                    // Handle normal effects
                    allEffectsHtml += `<p class="text-green-400">${buff}: ${value}</p>`;
                }
            }
        }
        allEffectsHtml += '</div>';

        // Add Enhanced Effects
        let enhancedEffectsHtml = '';
        if (additionalBuffs[birthsign.toLowerCase()]?.['Enhanced Effects']) {
            const enhancedEffects = additionalBuffs[birthsign.toLowerCase()]['Enhanced Effects'];
            enhancedEffectsHtml = `
                <div class="mt-2">
                    <p class="text-blue-300 mb-1">Enhanced Effects:</p>
                    <p class="text-gray-300 text-sm">${enhancedEffects.requirements}</p>
                    ${Object.entries(enhancedEffects.effects).map(([buff, value]) => 
                        `<p class="text-green-400">${buff}: ${value}</p>`
                    ).join('')}
                </div>`;
        }

        this.birthsignTooltip.innerHTML = `
            <h4 class="font-bold text-amber-500 mb-2">${birthsignInfo.name}</h4>
            <p class="text-gray-300 mb-2">${birthsignInfo.description}</p>
            ${birthsignInfo.group ? `<p class="text-blue-300 text-sm mb-2">${birthsignInfo.group}</p>` : ''}
            ${allEffectsHtml}
            ${enhancedEffectsHtml}
        `;
        
        this.birthsignTooltip.classList.remove('hidden');
    }

    hideBirthsignTooltip() {
        this.birthsignTooltip.classList.add('hidden');
    }

    updateBirthsignTooltip(birthsign) {
        this.showBirthsignTooltip(birthsign);
    }

    setupRaceListeners() {
        const raceOptions = document.querySelectorAll('.race-option');
        
        raceOptions.forEach(option => {
            option.addEventListener('click', () => {
                const selectedRace = option.getAttribute('data-race');
                this.updateRaceStats(selectedRace);
            });
        });
    }

    updateRaceStats(raceName) {
        const raceData = this.races.find(race => 
            race.name.toLowerCase() === raceName.toLowerCase()
        );

        if (raceData) {
            // Reset racial resistances
            this.resistanceSources.racial = {};

            // Apply new racial resistances if they exist
            if (raceData.resistances) {
                this.resistanceSources.racial = { ...raceData.resistances };
            }

            // Update resistance display
            this.updateResistances();

            // Store base racial stats
            this.baseAttributes = raceData.baseStats;
            
            // Update display with current attribute points
            this.updateAttributeDisplay();

            // Update race selection display
            this.selectedRaceText.textContent = raceData.name;

            // Update skill levels with the race's starting skills
            this.updateSkillLevelsFromRace(raceData);
        }
    }

    setupAttributeSystem() {
        let previousLevel = 1; // Start from level 1
        
        // Listen for level changes
        this.levelInput.addEventListener('change', () => {
            const newLevel = parseInt(this.levelInput.value) || 1; // Default to 1 instead of 0
            if (newLevel > previousLevel) {
                // Only add points for levels above 1
                const pointsToAdd = Math.max(0, newLevel - Math.max(previousLevel, 1));
                this.attributePoints.available += pointsToAdd;
            } else if (newLevel < previousLevel) {
                const pointsToRemove = previousLevel - newLevel;
                this.attributePoints.available = Math.max(0, this.attributePoints.available - pointsToRemove);
            }
            previousLevel = newLevel;
            this.updateAttributeButtons();
        });

        // Add attribute button listeners
        this.healthButton.addEventListener('click', () => this.addAttributePoint('health'));
        this.magickaButton.addEventListener('click', () => this.addAttributePoint('magicka'));
        this.staminaButton.addEventListener('click', () => this.addAttributePoint('stamina'));
        
        // Add decrease button listeners
        this.healthDecreaseButton.addEventListener('click', () => this.removeAttributePoint('health'));
        this.magickaDecreaseButton.addEventListener('click', () => this.removeAttributePoint('magicka'));
        this.staminaDecreaseButton.addEventListener('click', () => this.removeAttributePoint('stamina'));

        // Initial update
        this.updateAttributeButtons();
    }

    addAttributePoint(attribute) {
        if (this.attributePoints.available > 0) {
            this.attributePoints.spent[attribute] += 5;
            this.attributePoints.available--;
            this.updateAttributeDisplay();
            this.updateAttributeButtons();
        }
    }

    removeAttributePoint(attribute) {
        if (this.attributePoints.spent[attribute] > 0) {
            this.attributePoints.spent[attribute] -= 5;
            this.attributePoints.available++;
            this.updateAttributeDisplay();
            this.updateAttributeButtons();
        }
    }

    updateAttributeDisplay() {
        const healthValue = document.getElementById('health-value');
        const magickaValue = document.getElementById('magicka-value');
        const staminaValue = document.getElementById('stamina-value');

        // Calculate base values (racial base + racial bonus)
        const raceBonus = this.races.find(race => 
            race.name === this.selectedRaceText.textContent
        )?.bonusStats || { health: 0, magicka: 0, stamina: 0 };

        // Get birthsign bonus if any
        const birthsignBonus = { health: 0, magicka: 0, stamina: 0 };
        const selectedBirthsign = this.birthsignData?.find(sign => 
            sign.name === this.selectedBirthsignText.textContent
        );

        if (selectedBirthsign?.bonus) {
            // Check each attribute in the birthsign bonus
            if (selectedBirthsign.bonus.health) {
                birthsignBonus.health = selectedBirthsign.bonus.health.value;
            }
            if (selectedBirthsign.bonus.magicka) {
                birthsignBonus.magicka = selectedBirthsign.bonus.magicka.value;
            }
            if (selectedBirthsign.bonus.stamina) {
                birthsignBonus.stamina = selectedBirthsign.bonus.stamina.value;
            }
        }

        const baseHealth = this.baseAttributes.health + raceBonus.health + birthsignBonus.health;
        const baseMagicka = this.baseAttributes.magicka + raceBonus.magicka + birthsignBonus.magicka;
        const baseStamina = this.baseAttributes.stamina + raceBonus.stamina + birthsignBonus.stamina;

        // Format the display with base + allocated points, only showing bonus if it exists
        healthValue.innerHTML = baseHealth + 
            (this.attributePoints.spent.health > 0 ? ` <span class="text-green-400">+${this.attributePoints.spent.health} (${this.attributePoints.spent.health/5})</span>` : '');
        magickaValue.innerHTML = baseMagicka + 
            (this.attributePoints.spent.magicka > 0 ? ` <span class="text-green-400">+${this.attributePoints.spent.magicka} (${this.attributePoints.spent.magicka/5})</span>` : '');
        staminaValue.innerHTML = baseStamina + 
            (this.attributePoints.spent.stamina > 0 ? ` <span class="text-green-400">+${this.attributePoints.spent.stamina} (${this.attributePoints.spent.stamina/5})</span>` : '');
    }

    updateAttributeButtons() {
        const buttonsEnabled = this.attributePoints.available > 0;
        const decreaseButtons = [this.healthDecreaseButton, this.magickaDecreaseButton, this.staminaDecreaseButton];
        
        // Update increase buttons
        [this.healthButton, this.magickaButton, this.staminaButton].forEach((button, index) => {
            if (buttonsEnabled) {
                button.classList.remove('opacity-50', 'cursor-not-allowed');
                button.removeAttribute('disabled');
            } else {
                button.classList.add('opacity-50', 'cursor-not-allowed');
                button.setAttribute('disabled', 'true');
            }

            // Update button text to show available points
            const pointsText = this.attributePoints.available > 0 ? 
                ` (${this.attributePoints.available} left)` : '';
            const attribute = ['Health', 'Magicka', 'Stamina'][index];
            button.innerHTML = `<i class="fa-solid ${index === 0 ? 'fa-heart text-red-500' : index === 1 ? 'fa-droplet text-blue-500' : 'fa-bolt text-green-500'} mr-1"></i>${attribute} +5${pointsText}`;
        });
        
        // Update decrease buttons
        decreaseButtons.forEach((button, index) => {
            const attribute = ['health', 'magicka', 'stamina'][index];
            const canDecrease = this.attributePoints.spent[attribute] > 0;
            
            if (canDecrease) {
                button.classList.remove('opacity-50', 'cursor-not-allowed');
                button.removeAttribute('disabled');
            } else {
                button.classList.add('opacity-50', 'cursor-not-allowed');
                button.setAttribute('disabled', 'true');
            }

            // Keep the icon in the decrease buttons
            const attribute_name = ['Health', 'Magicka', 'Stamina'][index];
            button.innerHTML = `<i class="fa-solid ${index === 0 ? 'fa-heart text-red-500/75' : index === 1 ? 'fa-droplet text-blue-500/75' : 'fa-bolt text-green-500/75'} mr-1"></i>${attribute_name} -5`;
        });
    }

    updateResistances() {
        // Reset all resistances
        for (const type in this.resistances) {
            this.resistances[type] = 0;
        }

        // Combine all resistance sources
        const allSources = [
            this.resistanceSources.racial,
            this.resistanceSources.lifepath,
            this.resistanceSources.birthsign,
            this.resistanceSources.perks
        ];

        // Add up resistances from all sources
        allSources.forEach(source => {
            for (const [type, value] of Object.entries(source)) {
                if (this.resistances.hasOwnProperty(type)) {
                    this.resistances[type] += value;
                }
            }
        });

        // Update the display
        for (const type in this.resistances) {
            const element = document.getElementById(`${type}-resistance`);
            if (element) {
                const value = this.resistances[type];
                element.textContent = `${value > 0 ? '+' : ''}${value}%`;
                element.className = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-300';
            }
        }
    }

    updateLifepathStats(lifepathName) {
        const lifepathData = this.lifepathData.find(path => 
            path.name.toLowerCase() === lifepathName.toLowerCase()
        );

        if (lifepathData) {
            // Reset lifepath resistances
            this.resistanceSources.lifepath = {};

            // Apply new lifepath resistances if they exist
            if (lifepathData.baseResistances) {
                this.resistanceSources.lifepath = { ...lifepathData.baseResistances };
            }

            // Update resistance display
            this.updateResistances();

            // Update lifepath selection display
            this.selectedLifepathText.textContent = lifepathData.name;
        }
    }

    initializeSkillTrees() {
        const skillTreeContainer = document.getElementById('skill-trees');
        const skillCards = document.querySelectorAll('.skill-tree-card');
        
        skillCards.forEach(card => {
            // Create close button with proper positioning and initial state
            const closeButton = document.createElement('button');
            closeButton.className = 'skill-tree-close-btn hidden';
            closeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            card.appendChild(closeButton);
            
            // Main card click handler
            card.addEventListener('click', async (e) => {
                // Ignore if clicking the close button
                if (e.target.closest('.skill-tree-close-btn')) return;
                
                // Only expand if the card isn't already expanded
                if (!card.classList.contains('skill-tree-expanded')) {
                    // Close all other cards first
                    skillCards.forEach(c => {
                        const otherCloseButton = c.querySelector('.skill-tree-close-btn');
                        c.classList.remove('skill-tree-expanded');
                        if (otherCloseButton) {
                            otherCloseButton.classList.add('hidden');
                        }
                        // Clean up any existing perk containers
                        const oldPerkContainer = c.querySelector('.expanded-content');
                        if (oldPerkContainer) {
                            oldPerkContainer.remove();
                        }
                        // Ensure original content is visible
                        const originalContent = c.querySelector('.flex.flex-col');
                        if (originalContent) {
                            originalContent.style.display = 'flex';
                        }
                    });
                    
                    // Load skill tree data
                    const skillName = card.id;
                    const skillTreeData = await this.loadSkillTreeData(skillName);
                    
                    if (skillTreeData) {
                        // Get the current skill level
                        const originalContent = card.querySelector('.flex.flex-col');
                        const currentValue = card.querySelector('.skill-level-input').value;
                        
                        // Hide original content
                        originalContent.style.display = 'none';
                        
                        // Create expanded content container
                        const expandedContent = document.createElement('div');
                        expandedContent.className = 'expanded-content w-full h-full flex flex-col';

                        // Add header with skill level input
                        expandedContent.innerHTML = `
                            <div class="text-center p-4">
                                <h3 class="text-2xl text-amber-500 mb-4">${skillTreeData.name}</h3>
                                <p class="text-gray-300 mb-4">${skillTreeData.description}</p>
                                <div class="skill-level-container mb-4">
                                    <div class="skill-level mt-1">
                                        <span class="skill-level-display text-center text-lg block">${currentValue}</span>
                                        <input type="number" 
                                            min="0" 
                                            max="100" 
                                            value="${currentValue}" 
                                            class="skill-level-input w-full bg-gray-700 p-2 rounded border border-gray-600 text-center"
                                            data-skill="${card.id}">
                                    </div>
                                </div>
                            </div>
                        `;

                        // Create perk container
                        const perkContainer = document.createElement('div');
                        perkContainer.className = 'perk-container relative flex-grow';
                        
                        // Draw connections first
                        this.drawPerkConnections(skillTreeData.perks, skillTreeData.connections, perkContainer);
                        
                        // Add perks
                        skillTreeData.perks.forEach(perk => {
                            const perkElement = this.createPerkElement(perk);
                            perkContainer.appendChild(perkElement);
                        });
                        
                        // Add perk container to expanded content
                        expandedContent.appendChild(perkContainer);
                        
                        // Add expanded content to card
                        card.appendChild(expandedContent);

                        // Add event listener to sync values
                        const expandedInput = expandedContent.querySelector('.skill-level-input');
                        expandedInput.addEventListener('input', (e) => {
                            const value = e.target.value;
                            const originalInput = card.querySelector('.flex.flex-col .skill-level-input');
                            const originalDisplay = card.querySelector('.flex.flex-col .skill-level-display');
                            originalInput.value = value;
                            originalDisplay.textContent = value;
                            this.updateSkillLevel(card.id, value);
                        });
                    }
                    
                    // Calculate and set transform origin
                    const rect = card.getBoundingClientRect();
                    const containerRect = skillTreeContainer.getBoundingClientRect();
                    const originX = ((rect.left - containerRect.left) / containerRect.width) * 100;
                    const originY = ((rect.top - containerRect.top) / containerRect.height) * 100;
                    card.style.transformOrigin = `${originX}% ${originY}%`;
                    
                    // Expand the card
                    card.classList.add('skill-tree-expanded');
                    skillTreeContainer.classList.add('skill-tree-fullview');
                    closeButton.classList.remove('hidden');
                }
            });

            // Update close button handler
            closeButton.addEventListener('click', () => {
                const card = closeButton.closest('.skill-tree-card');
                const expandedContent = card.querySelector('.expanded-content');
                const originalContent = card.querySelector('.flex.flex-col');
                
                // Remove expanded content
                if (expandedContent) {
                    // Get the final value before removing
                    const finalValue = expandedContent.querySelector('.skill-level-input').value;
                    
                    // Update original content values
                    const originalInput = originalContent.querySelector('.skill-level-input');
                    const originalDisplay = originalContent.querySelector('.skill-level-display');
                    originalInput.value = finalValue;
                    originalDisplay.textContent = finalValue;
                    
                    expandedContent.remove();
                }
                
                // Show original content
                if (originalContent) {
                    originalContent.style.display = 'flex';
                }
                
                // Reset card state
                card.classList.remove('skill-tree-expanded');
                skillTreeContainer.classList.remove('skill-tree-fullview');
                closeButton.classList.add('hidden');
            });
        });
    }

    async loadSkillTreeData(skillName) {
        try {
            const basePath = window.location.pathname.startsWith('/') ? window.location.pathname : '/' + window.location.pathname;
            const response = await fetch(`${basePath}skilltrees/${skillName}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error loading skill tree data for ${skillName}:`, error);
            return null;
        }
    }

    // New utility function for calculating perk positions
    calculatePerkPosition(perk) {
        return {
            x: perk.position.x * this.PERK_SPACING + this.PERK_OFFSET_X,
            y: perk.position.y * this.PERK_SPACING + this.PERK_OFFSET_Y,
            centerX: perk.position.x * this.PERK_SPACING + this.PERK_OFFSET_X + (this.PERK_DOT_SIZE / 2),
            centerY: perk.position.y * this.PERK_SPACING + this.PERK_OFFSET_Y + (this.PERK_DOT_SIZE / 2)
        };
    }

    createPerkElement(perk) {
        const perkElement = document.createElement('div');
        perkElement.className = 'perk-node';
        perkElement.innerHTML = `
            <div class="perk-dot" data-perk-id="${perk.id}"></div>
            <div class="perk-name">${perk.name}</div>
        `;
        
        // Use the utility function for positioning
        const position = this.calculatePerkPosition(perk);
        perkElement.style.left = `${position.x}px`;
        perkElement.style.top = `${position.y}px`;
        
        // Add tooltip functionality
        const perkDot = perkElement.querySelector('.perk-dot');
        perkDot.addEventListener('mouseenter', (e) => this.showPerkTooltip(e, perk));
        perkDot.addEventListener('mouseleave', () => this.hidePerkTooltip());
        
        // Add click handler for toggling perk state
        perkDot.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card from collapsing when clicking perk
            this.togglePerkState(perkElement, perk);
        });
        
        return perkElement;
    }

    togglePerkState(perkElement, perk) {
        const perkDot = perkElement.querySelector('.perk-dot');
        const isActive = perkDot.classList.toggle('active');
        
        // Toggle active state on the entire perk node for name color change
        perkElement.classList.toggle('active', isActive);
    }

    showPerkTooltip(event, perk) {
        // Remove any existing tooltip
        this.hidePerkTooltip();
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'perk-tooltip';
        
        // Format effects text
        const effectsText = Object.entries(perk.effects)
            .map(([key, effect]) => {
                const sign = effect.value > 0 ? '+' : '';
                return `${sign}${effect.value}${effect.type === 'percent' ? '%' : ''} ${key.replace(/_/g, ' ')}`;
            })
            .join(', ');
        
        tooltip.innerHTML = `
            <div class="perk-tooltip-title">${perk.name}</div>
            <div class="perk-tooltip-description">${perk.description}</div>
            <div class="perk-tooltip-effect">${effectsText}</div>
            ${perk.requirements.skill > 0 ? 
                `<div class="perk-tooltip-requirement">Requires ${perk.requirements.skill} skill level</div>` : ''}
        `;
        
        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        
        // Add to DOM
        document.body.appendChild(tooltip);
        
        // Show tooltip
        requestAnimationFrame(() => tooltip.classList.add('visible'));
    }

    hidePerkTooltip() {
        const tooltip = document.querySelector('.perk-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    drawPerkConnections(perks, connections, container) {
        const connectionsContainer = document.createElement('div');
        connectionsContainer.className = 'connections-layer';
        container.appendChild(connectionsContainer);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'perk-connections');
        connectionsContainer.appendChild(svg);
        
        connections.forEach(connection => {
            const fromPerk = perks.find(p => p.id === connection.from);
            const toPerk = perks.find(p => p.id === connection.to);
            
            if (fromPerk && toPerk) {
                const fromPos = this.calculatePerkPosition(fromPerk);
                const toPos = this.calculatePerkPosition(toPerk);
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', fromPos.centerX);
                line.setAttribute('y1', fromPos.centerY);
                line.setAttribute('x2', toPos.centerX);
                line.setAttribute('y2', toPos.centerY);
                line.setAttribute('stroke', 'rgb(251 191 36)');
                line.setAttribute('stroke-width', '2');
                
                svg.appendChild(line);
            }
        });
    }

    updateBirthsignResistances(birthsign) {
        // Reset previous birthsign resistances
        this.resistanceSources.birthsign = {};

        // Find the birthsign data
        const birthsignInfo = this.birthsignData?.find(sign => 
            sign.name.toLowerCase() === birthsign.toLowerCase()
        );

        if (birthsignInfo?.bonus) {
            // Check for resistance-related bonuses
            for (const [stat, details] of Object.entries(birthsignInfo.bonus)) {
                if (stat.includes('resist') || stat.includes('weakness')) {
                    // Convert stat name to match resistance system
                    let resistType = stat
                        .replace('_resist', '')
                        .replace('_weakness', '');
                    
                    // Handle weakness by making the value negative
                    let value = details.value;
                    if (stat.includes('weakness')) {
                        value = -value;
                    }

                    this.resistanceSources.birthsign[resistType] = value;
                }
            }
        }

        // Update resistance display
        this.updateResistances();
    }

    initializePerkPointSystem() {
        const levelInput = document.querySelector('#character-level input');
        if (!levelInput) {
            console.error('Level input element not found!');
            return;
        }

        levelInput.addEventListener('input', (e) => this.handleLevelChange(e));
    }

    handleLevelChange(event) {
        const level = parseInt(event.target.value) || 0;
        // Subtract 1 from level to start perk points from level 2
        this.perkPoints.available = Math.max(0, level - 1);
        this.updatePerkPointsDisplay();
    }

    updatePerkPointsDisplay() {
        const levelContainer = document.querySelector('#character-level');
        let perkPointsDisplay = document.querySelector('#perk-points-display');

        if (!perkPointsDisplay) {
            perkPointsDisplay = document.createElement('div');
            perkPointsDisplay.id = 'perk-points-display';
            perkPointsDisplay.className = 'text-amber-500 text-sm mt-2 text-center font-bold bg-gray-800 p-1.5 rounded-lg border border-gray-700';
            levelContainer.appendChild(perkPointsDisplay);
        }

        perkPointsDisplay.textContent = `Available Perk Points: ${Math.max(0, this.perkPoints.available)}`;
    }

    setupSkillLevels() {
        // Initialize all skills to 0
        const skillInputs = document.querySelectorAll('.skill-level-input');
        skillInputs.forEach(input => {
            const skillName = input.dataset.skill;
            this.skillLevels[skillName] = 0;
        });
    }

    setupSkillInputHandlers() {
        document.querySelectorAll('.skill-level-input').forEach(input => {
            input.addEventListener('click', (e) => e.stopPropagation());
            
            input.addEventListener('input', (e) => {
                this.updateSkillLevel(e.target.dataset.skill, e.target.value);
            });
        });
    }

    updateSkillLevel(skillName, value) {
        value = parseInt(value);
        if (isNaN(value)) value = 0;
        if (value < 0) value = 0;
        if (value > 100) value = 100;

        this.skillLevels[skillName] = value;

        // Update UI
        const skillCard = document.querySelector(`[data-skill="${skillName}"]`).closest('.skill-tree-card');
        if (skillCard) {
            const display = skillCard.querySelector('.skill-level-display');
            const input = skillCard.querySelector('.skill-level-input');
            if (display) display.textContent = value;
            if (input) input.value = value;
        }
    }

    updateSkillLevelsFromRace(race) {
        if (!race || !race.startingSkills) return;
        
        Object.entries(race.startingSkills).forEach(([skill, value]) => {
            this.updateSkillLevel(skill, value);
        });
    }
} 