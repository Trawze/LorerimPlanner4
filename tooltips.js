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
        this.healthButton = document.querySelector('#attribute-points button:nth-child(1)');
        this.magickaButton = document.querySelector('#attribute-points button:nth-child(2)');
        this.staminaButton = document.querySelector('#attribute-points button:nth-child(3)');
        
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

        // Modify resistance sources to include lifepath
        this.resistanceSources = {
            racial: {},
            lifepath: {},
            perks: {},
        };
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
        }
    }

    setupAttributeSystem() {
        let previousLevel = 0;
        
        // Listen for level changes
        this.levelInput.addEventListener('change', () => {
            const newLevel = parseInt(this.levelInput.value) || 0;
            
            // Only add points for the difference in levels
            if (newLevel > previousLevel) {
                // Add one point per level gained
                this.attributePoints.available += (newLevel - previousLevel);
            } else if (newLevel < previousLevel) {
                // Remove points if level decreased (optional)
                const pointsToRemove = previousLevel - newLevel;
                this.attributePoints.available = Math.max(0, this.attributePoints.available - pointsToRemove);
            }
            
            previousLevel = newLevel;
            this.updateAttributeButtons();
        });

        // Attribute button listeners
        this.healthButton.addEventListener('click', () => this.addAttributePoint('health'));
        this.magickaButton.addEventListener('click', () => this.addAttributePoint('magicka'));
        this.staminaButton.addEventListener('click', () => this.addAttributePoint('stamina'));
    }

    addAttributePoint(attribute) {
        if (this.attributePoints.available > 0) {
            this.attributePoints.spent[attribute] += 5;
            this.attributePoints.available--;
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

        const baseHealth = this.baseAttributes.health + raceBonus.health;
        const baseMagicka = this.baseAttributes.magicka + raceBonus.magicka;
        const baseStamina = this.baseAttributes.stamina + raceBonus.stamina;

        // Format the display with base + allocated points, only showing bonus if it exists
        healthValue.innerHTML = baseHealth + 
            (this.attributePoints.spent.health > 0 ? ` <span class="text-green-400">+ ${this.attributePoints.spent.health}</span>` : '');
        magickaValue.innerHTML = baseMagicka + 
            (this.attributePoints.spent.magicka > 0 ? ` <span class="text-green-400">+ ${this.attributePoints.spent.magicka}</span>` : '');
        staminaValue.innerHTML = baseStamina + 
            (this.attributePoints.spent.stamina > 0 ? ` <span class="text-green-400">+ ${this.attributePoints.spent.stamina}</span>` : '');
    }

    updateAttributeButtons() {
        const buttonsEnabled = this.attributePoints.available > 0;
        
        // Update button states
        [this.healthButton, this.magickaButton, this.staminaButton].forEach(button => {
            if (buttonsEnabled) {
                button.classList.remove('opacity-50', 'cursor-not-allowed');
                button.removeAttribute('disabled');
            } else {
                button.classList.add('opacity-50', 'cursor-not-allowed');
                button.setAttribute('disabled', 'true');
            }
        });

        // Update button text to show available points
        const pointsText = this.attributePoints.available > 0 ? 
            ` (${this.attributePoints.available} left)` : '';
            
        this.healthButton.textContent = `Health +5${pointsText}`;
        this.magickaButton.textContent = `Magicka +5${pointsText}`;
        this.staminaButton.textContent = `Stamina +5${pointsText}`;
    }

    updateResistances() {
        // Reset base resistances
        const totalResistances = {
            fire: 0,
            frost: 0,
            shock: 0,
            poison: 0,
            disease: 0,
            magic: 0,
            damage: 0
        };

        // Add racial resistances
        Object.entries(this.resistanceSources.racial).forEach(([type, value]) => {
            totalResistances[type] = (totalResistances[type] || 0) + value;
        });

        // Add lifepath resistances
        Object.entries(this.resistanceSources.lifepath).forEach(([type, value]) => {
            totalResistances[type] = (totalResistances[type] || 0) + value;
        });

        // Add perk resistances (for future implementation)
        Object.entries(this.resistanceSources.perks).forEach(([type, value]) => {
            totalResistances[type] = (totalResistances[type] || 0) + value;
        });

        // Update the UI with stacked resistances
        Object.entries(totalResistances).forEach(([type, value]) => {
            const resistanceElement = document.querySelector(`#${type}-resistance`);
            if (resistanceElement) {
                const displayValue = value > 0 ? `+${value}` : value;
                const colorClass = value > 0 ? 'text-green-400' : 
                                 value < 0 ? 'text-red-400' : 
                                 'text-gray-300';
                resistanceElement.innerHTML = `<span class="${colorClass}">${displayValue}%</span>`;
            }
        });
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
}

// Initialize tooltip manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const tooltipManager = new TooltipManager();
}); 