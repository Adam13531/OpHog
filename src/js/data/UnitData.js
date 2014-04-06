/*
 * OpHog - https://github.com/Adam13531/OpHog
 * Copyright (C) 2014  Adam Damiano
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
( function() {

    /**
     * Every possible item is in this array with a relative weight of 1.
     *
     * See setupLootClasses.
     * @type {Array:LootTableEntry}
     */
    var equalChanceAllLoot = [];

    /**
     * Every possible item is in this array, but usable items are given a much
     * higher weight than equippable items, meaning it should be rare to get
     * equippable items.
     *
     * See setupLootClasses.
     * @type {Array}
     */
    var higherChanceForUsableItems = [];

    /**
     * See higherChanceForUsableItems and setupLootClasses.
     * @type {Array}
     */
    var higherChanceForEquippableItems = [];

    /**
     * There are no items in this array.
     * 
     * See setupLootClasses.
     * @type {Array}
     */
    var noItems = [];

    /**
     * This function sets up loot "classes". It is called immediately after it
     * is defined (it's an IIFE).
     *
     * Loot "classes" are arrays of LootTableEntry objects. They are all
     * exclusive to this file and can be assigned to any unit.
     *
     * Some will be unused and are only around for testing purposes should the
     * need ever arise.
     */
    ( function setupLootClasses() {
        for ( var key in game.ItemType ) {
            var item = game.ItemType[key];
            var highUsableWeight = item.usable ? 10 : 1;
            var highEquippableWeight = item.usable ? 1 : 10;

            equalChanceAllLoot.push(new game.LootTableEntry(item.id, 1));
            higherChanceForUsableItems.push(new game.LootTableEntry(item.id, highUsableWeight));
            higherChanceForEquippableItems.push(new game.LootTableEntry(item.id, highEquippableWeight));
        }
    }());

    /**
     * Basic stat growths.
     *
     * See 'statClass' comment above the definition for game.UnitType.
     * @type {Object}
     */
    var basicStats = {
        atk: {
            start: 10,
            minGrowth: 2,
            maxGrowth: 4
        },
        def: {
            start: 0,
            minGrowth: 1,
            maxGrowth: 2
        },
        life: {
            start: 50,
            minGrowth: 5,
            maxGrowth: 15
        },
    };

    /**
     * Boss stat growths.
     *
     * See 'statClass' comment above the definition for game.UnitType.
     * @type {Object}
     */
    var bossStats = {
        atk: {
            start: 10,
            minGrowth: 2,
            maxGrowth: 12
        },
        def: {
            start: 0,
            minGrowth: 0,
            maxGrowth: 2
        },
        life: {
            start: 50,
            minGrowth: 50,
            maxGrowth: 120
        },
    };

    var DEFAULT_UNIT_WIDTH = 1;
    var DEFAULT_UNIT_HEIGHT = 1;

    // Unit IDs are hard-coded instead of doing something like "id:
    // getNextAvailableID()" so that they don't change based on location in the
    // code, and also so that they don't change across game versions.
    //
    // If any of the following properties are ignored, a default will be used
    // when possible (see constants in this file). If not possible, you will get
    // a warning.
    //
    // Properties:
    //  id - Number - the unit's ID
    //  width - Number - the width, in tiles, of the unit
    //  height - Number - the height, in tiles, of the unit
    //  name - String - the name of the unit
    //  graphicIndexes - Array:Number - see Unit
    //  shadowGraphic - Number - a graphic index to draw for the shadow. Defaults 
    //      to game.Graphic.MED_SHADOW_LOW.
    //  atk - Object containing the below:
    //      start - Number - the starting value for this stat
    //      minGrowth - Number - when this unit levels, this is the minimum value that will be added to the stat
    //      maxGrowth - Number - when this unit levels, this is the maximum value that will be added to the stat
    //  def - see atk
    //  life - see atk
    //  Note: instead of providing atk, def, and life explicitly, you can bundle
    //      them all into an object and provide that object as 'statClass'. That
    //      way, multiple units can share the same stat growths without duplicating
    //      their definitions.
    //      
    //      If you do this, you can override the statClass's stats by explicitly
    //      including atk or def or life (or any combination).
    //  chanceToDropItem - Number - the chance to drop any item
    //  itemsDropped - Array:LootTableEntry
    //  abilities - Array:Object - abilities that this unit will have. You only 
    //      need to fill in the ID and any parameters you want to override. 
    //      For example, if you want the ATTACK ability but with a different 
    //      graphic, you can specify game.Ability.ATTACK.id and a graphicIndex.
    //      Default relativeWeight is game.DEFAULT_ABILITY_RELATIVE_WEIGHT and 
    //      is set in AbilityManager.js.
    window.game.UnitType = {
        ORC: {
            id: 0,
            graphicIndexes:[game.Graphic.ORC_FIGHTER],

            statClass: basicStats,

            abilities: [
                {
                    id: game.Ability.SKULL_THROW.id
                }
            ],
        },

        SPIDER: {
            id: 1,
            graphicIndexes:[game.Graphic.BLACK_SPIDER],
            shadowGraphic: game.Graphic.SMALL_SHADOW_LOW,

            statClass: basicStats,

            abilities: [
                {
                    id: game.Ability.SPIT_WEB.id
                }
            ],
        },

        SCORPION: {
            id: 2,
            graphicIndexes:[game.Graphic.GIANT_BLACK_SCORPION],

            statClass: basicStats,

            abilities: [
                {
                    id: game.Ability.SCORPION_STING.id
                },
                {
                    id: game.Ability.SUMMON.id,
                }
            ],

            abilityAI: game.AbilityAI.RANDOM,
        },

        SNAKE: {
            id: 3,
            graphicIndexes:[game.Graphic.COBRA],

            statClass: basicStats,

            abilities: [
                {
                    id: game.Ability.SNAKE_VENOM.id
                }
            ],
        },

        TREE: {
            id: 4,
            name:'Treant',
            graphicIndexes:[game.Graphic.TREANT],

            statClass: basicStats,

            abilities: [
                {
                    id: game.Ability.BRANCH_WHIP.id
                }
            ],
        },

        WOLF: {
            id: 5,
            graphicIndexes:[game.Graphic.BLACK_WOLF],
            atk: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            def: {
                start: 0,
                minGrowth: 1,
                maxGrowth: 1
            },
            life: {
                start: 50,
                minGrowth: 5,
                maxGrowth: 10
            },

            abilities: [
                {
                    id: game.Ability.BOULDER_DROP.id
                }
            ],
        },

        DRAGON: {
            id: 6,
            graphicIndexes:[game.Graphic.GREEN_DRAGON],
            atk: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            def: {
                start: 0,
                minGrowth: 1,
                maxGrowth: 1
            },
            life: {
                start: 50,
                minGrowth: 5,
                maxGrowth: 10
            },

            abilities: [
                {
                    id: game.Ability.FLAME_THROWER.id
                }
            ],
        },

        PLAYER_ARCHER: {
            id: 7,
            name:'Archer',
            graphicIndexes:[game.Graphic.RANGER_M],
            shadowGraphic: game.Graphic.BIG_SHADOW_LOW,

            atk: {
                start: 30,
                minGrowth: 3,
                maxGrowth: 9
            },
            def: {
                start: 0,
                minGrowth: 0,
                maxGrowth: 3
            },
            life: {
                start: 100,
                minGrowth: 5,
                maxGrowth: 15
            },

            abilities: [
                {
                    id: game.Ability.ATTACK.id,
                    graphicIndex: game.Graphic.HORIZONTAL_NEEDLE,
                }
            ],
            
            chanceToDropItem: 0,
        },

        PLAYER_WARRIOR: {
            id: 8,
            name:'Warrior',
            graphicIndexes:[game.Graphic.KNIGHT_M],
            shadowGraphic: game.Graphic.BIG_SHADOW_LOW,

            atk: {
                start: 30,
                minGrowth: 3,
                maxGrowth: 9
            },
            def: {
                start: 0,
                minGrowth: 0,
                maxGrowth: 3
            },
            life: {
                start: 100,
                minGrowth: 5,
                maxGrowth: 15
            },

            abilities: [
                {
                    id: game.Ability.ATTACK.id
                }
            ],

            abilityAI: game.AbilityAI.RANDOM,
            
            chanceToDropItem: 0,
        },

        PLAYER_WIZARD: {
            id: 9,
            name:'Wizard',
            graphicIndexes:[game.Graphic.WIZARD_M],
            shadowGraphic: game.Graphic.BIG_SHADOW_LOW,

            atk: {
                start: 30,
                minGrowth: 3,
                maxGrowth: 9
            },
            def: {
                start: 0,
                minGrowth: 0,
                maxGrowth: 3
            },
            life: {
                start: 100,
                minGrowth: 5,
                maxGrowth: 15
            },

            abilities: [
                {
                    id: game.Ability.ATTACK.id
                }
            ],

            abilityAI: game.AbilityAI.RANDOM,
            
            chanceToDropItem: 0,
        },

        NPC_OLD_MAN_WIZARD: {
            id: 10,
            name: 'Old Man Wizard',
            graphicIndexes:[game.Graphic.KING_1],

            atk: {
                start: 30,
                minGrowth: 3,
                maxGrowth: 9
            },
            def: {
                start: 0,
                minGrowth: 0,
                maxGrowth: 3
            },
            life: {
                start: 100,
                minGrowth: 5,
                maxGrowth: 15
            },
            
            chanceToDropItem: 0,
        },

        YETI: {
            id: 11,
            graphicIndexes:[game.Graphic.YETI],

            statClass: basicStats,
        },

        ICE_WATER_ELEMENTAL: {
            id: 12,
            graphicIndexes:[game.Graphic.ICE_WATER_ELEMENTAL],

            statClass: basicStats,
        },

        // PLAYER_ARCHER's summon
        WOLF_SUMMON: {
            id: 13,
            graphicIndexes:[game.Graphic.BLACK_WOLF],
            atk: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            def: {
                start: 0,
                minGrowth: 1,
                maxGrowth: 1
            },
            life: {
                start: 50,
                minGrowth: 5,
                maxGrowth: 10
            },

            abilities: [
                {
                    id: game.Ability.BOULDER_DROP.id
                }
            ],
        },

        // PLAYER_ARCHER's summon
        RAVEN_SUMMON: {
            id: 14,
            graphicIndexes:[game.Graphic.CROW_RAVEN],
            atk: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            def: {
                start: 0,
                minGrowth: 1,
                maxGrowth: 1
            },
            life: {
                start: 50,
                minGrowth: 5,
                maxGrowth: 10
            },

            abilities: [
                {
                    id: game.Ability.BOULDER_DROP.id
                }
            ],
        },

        // PLAYER_ARCHER's summon
        DRAGON_SUMMON: {
            id: 15,
            graphicIndexes:[game.Graphic.GREEN_DRAGON],
            atk: {
                start: 10,
                minGrowth: 1,
                maxGrowth: 1
            },
            def: {
                start: 0,
                minGrowth: 1,
                maxGrowth: 1
            },
            life: {
                start: 50,
                minGrowth: 5,
                maxGrowth: 10
            },

            abilities: [
                {
                    id: game.Ability.BOULDER_DROP.id
                }
            ],
        },
        TURNIP_BOSS: {
            id: 16,
            graphicIndexes:[game.Graphic.ROTTEN_TURNIP],

            statClass: bossStats,

            abilities: [
            ],
        },
        GNOME_WIZARD_ALT_BOSS: {
            id: 17,
            graphicIndexes:[game.Graphic.GNOME_WIZARD_ALT],

            statClass: bossStats,

            abilities: [
            ],
        },
        TROLL_BOSS: {
            id: 18,
            graphicIndexes:[game.Graphic.TROLL],

            statClass: bossStats,

            abilities: [
            ],
        },
        TREANT_BOSS: {
            id: 19,
            graphicIndexes:[game.Graphic.TREANT],

            statClass: bossStats,

            abilities: [
            ],
        },
        BANDIT_3_BOSS: {
            id: 20,
            graphicIndexes:[game.Graphic.BANDIT_3],

            statClass: bossStats,

            abilities: [
            ],
        },
        RED_SPIDER_BOSS: {
            id: 21,
            graphicIndexes:[game.Graphic.RED_SPIDER],

            statClass: bossStats,

            abilities: [
            ],
        },
        BROWN_WOLF_BOSS: {
            id: 22,
            graphicIndexes:[game.Graphic.BROWN_WOLF],

            statClass: bossStats,

            abilities: [
            ],
        },
        TURNIP: {
            id: 23,
            graphicIndexes:[game.Graphic.TURNIP],

            statClass: basicStats,
            chanceToDropItem: 0,
        },
        BLACK_BAT: {
            id: 24,
            graphicIndexes:[game.Graphic.BLACK_BAT],

            statClass: basicStats,
        },
        LIZARDMAN_SHAMAN: {
            id: 25,
            graphicIndexes:[game.Graphic.LIZARDMAN_SHAMAN],

            statClass: basicStats,
        },
        LIZARDMAN_CAPTAIN: {
            id: 26,
            graphicIndexes:[game.Graphic.LIZARDMAN_CAPTAIN],

            statClass: basicStats,
        },
        LIZARDMAN_ARCHER: {
            id: 27,
            graphicIndexes:[game.Graphic.LIZARDMAN_ARCHER],

            statClass: basicStats,
        },
        LIZARDMAN_WARRIOR: {
            id: 28,
            graphicIndexes:[game.Graphic.LIZARDMAN_WARRIOR],

            statClass: basicStats,
        },
        GIANT_WORM: {
            id: 29,
            graphicIndexes:[game.Graphic.GIANT_WORM],

            statClass: basicStats,
        },
        FLAME: {
            id: 30,
            graphicIndexes:[game.Graphic.FLAME],

            statClass: basicStats,
        },
        IMP_DEMON_DEVIL: {
            id: 31,
            graphicIndexes:[game.Graphic.IMP_DEMON_DEVIL],

            statClass: basicStats,
        },
        RED_BAT: {
            id: 32,
            graphicIndexes:[game.Graphic.RED_BAT],

            statClass: basicStats,
        },
        FIRE_MINION: {
            id: 33,
            graphicIndexes:[game.Graphic.FIRE_MINION],

            statClass: basicStats,
        },
        GIANT_SCORPION: {
            id: 34,
            graphicIndexes:[game.Graphic.GIANT_SCORPION],

            statClass: basicStats,
        },
        ORC_MYSTIC: {
            id: 35,
            graphicIndexes:[game.Graphic.ORC_MYSTIC],

            statClass: basicStats,
        },
        ORC_CAPTAIN: {
            id: 36,
            graphicIndexes:[game.Graphic.ORC_CAPTAIN],

            statClass: basicStats,
        },
        ORC_FIGHTER: {
            id: 37,
            graphicIndexes:[game.Graphic.ORC_FIGHTER],

            statClass: basicStats,
        },
        VAMPIRE: {
            id: 38,
            graphicIndexes:[game.Graphic.VAMPIRE],

            statClass: basicStats,
        },
        MUMMY: {
            id: 39,
            graphicIndexes:[game.Graphic.MUMMY],

            statClass: basicStats,
        },
        GHOST: {
            id: 40,
            graphicIndexes:[game.Graphic.GHOST],

            statClass: basicStats,
        },
        SKELETON_WARRIOR: {
            id: 41,
            graphicIndexes:[game.Graphic.SKELETON_WARRIOR],

            statClass: basicStats,
        },
        SKELETON_ARCHER: {
            id: 42,
            graphicIndexes:[game.Graphic.SKELETON_ARCHER],

            statClass: basicStats,
        },
        SKELETON: {
            id: 43,
            graphicIndexes:[game.Graphic.SKELETON],

            statClass: basicStats,
        },
        HEADLESS_ZOMBIE: {
            id: 44,
            graphicIndexes:[game.Graphic.HEADLESS_ZOMBIE],

            statClass: basicStats,
        },
        ZOMBIE: {
            id: 45,
            graphicIndexes:[game.Graphic.ZOMBIE],

            statClass: basicStats,
        },
        GNOME_WIZARD: {
            id: 46,
            graphicIndexes:[game.Graphic.GNOME_WIZARD],

            statClass: basicStats,
        },
        GNOME_FIGHTER_ALT_1: {
            id: 47,
            graphicIndexes:[game.Graphic.GNOME_FIGHTER_ALT_1],

            statClass: basicStats,
        },
        GNOME_FIGHTER_ALT_2: {
            id: 48,
            graphicIndexes:[game.Graphic.GNOME_FIGHTER_ALT_2],

            statClass: basicStats,
        },
        GNOME_FIGHTER: {
            id: 49,
            graphicIndexes:[game.Graphic.GNOME_FIGHTER],

            statClass: basicStats,
        },
        GOBLIN_MYSTIC: {
            id: 50,
            graphicIndexes:[game.Graphic.GOBLIN_MYSTIC],

            statClass: basicStats,
        },
        GOBLIN_CAPTAIN: {
            id: 51,
            graphicIndexes:[game.Graphic.GOBLIN_CAPTAIN],

            statClass: basicStats,
        },
        GOBLIN_ARCHER: {
            id: 52,
            graphicIndexes:[game.Graphic.GOBLIN_ARCHER],

            statClass: basicStats,
        },
        GOBLIN_FIGHTER: {
            id: 53,
            graphicIndexes:[game.Graphic.GOBLIN_FIGHTER],

            statClass: basicStats,
        },
        GREEN_SLIME: {
            id: 54,
            graphicIndexes:[game.Graphic.GREEN_SLIME],

            statClass: basicStats,
        },
        COBRA: {
            id: 55,
            graphicIndexes:[game.Graphic.COBRA],

            statClass: basicStats,
        },
        EYE: {
            id: 56,
            graphicIndexes:[game.Graphic.EYE],

            statClass: basicStats,
        },
        DOVE_PIGEON: {
            id: 57,
            graphicIndexes:[game.Graphic.DOVE_PIGEON],

            statClass: basicStats,
        },
        BEETLE: {
            id: 58,
            graphicIndexes:[game.Graphic.BEETLE],

            statClass: basicStats,
        },
        MUD_MINION: {
            id: 59,
            graphicIndexes:[game.Graphic.MUD_MINION],

            statClass: basicStats,
        },
        COLD_FLAME: {
            id: 60,
            graphicIndexes:[game.Graphic.COLD_FLAME],

            statClass: basicStats,
        },
        ICE_MINION: {
            id: 61,
            graphicIndexes:[game.Graphic.ICE_MINION],

            statClass: basicStats,
        },
        AIR_ELEMENTAL: {
            id: 62,
            graphicIndexes:[game.Graphic.AIR_ELEMENTAL],

            statClass: basicStats,
        },
        POLAR_BEAR: {
            id: 63,
            graphicIndexes:[game.Graphic.POLAR_BEAR],

            statClass: basicStats,
        },
        BLUE_BIRD: {
            id: 64,
            graphicIndexes:[game.Graphic.BLUE_BIRD],

            statClass: basicStats,
        },
        HOODED_HUMAN_1_BOSS: {
            id: 65,
            graphicIndexes:[game.Graphic.HOODED_HUMAN_1],

            statClass: bossStats,
        },
        HORNED_DEMON_BOSS: {
            id: 66,
            graphicIndexes:[game.Graphic.HORNED_DEMON],

            statClass: bossStats,
        },
        DEATH_KNIGHT_ALT_1_BOSS: {
            id: 67,
            graphicIndexes:[game.Graphic.DEATH_KNIGHT_ALT_1],

            statClass: bossStats,
        },
        RED_DRAGON_BOSS: {
            id: 68,
            graphicIndexes:[game.Graphic.RED_DRAGON],

            statClass: bossStats,
        },
        FIRE_DEMON_BOSS: {
            id: 69,
            graphicIndexes:[game.Graphic.FIRE_DEMON],

            statClass: bossStats,
        },
        LAVA_GOLEM_BOSS: {
            id: 70,
            graphicIndexes:[game.Graphic.LAVA_GOLEM],

            statClass: bossStats,
        },
        DEATH_KNIGHT_BOSS: {
            id: 71,
            graphicIndexes:[game.Graphic.DEATH_KNIGHT],

            statClass: bossStats,
        },
        RED_SPECTER_BOSS: {
            id: 72,
            graphicIndexes:[game.Graphic.RED_SPECTER],

            statClass: bossStats,
        },
        VAMPIRE_LORD_BOSS: {
            id: 73,
            graphicIndexes:[game.Graphic.VAMPIRE_LORD],

            statClass: bossStats,
        },
        DEATH_BOSS: {
            id: 74,
            graphicIndexes:[game.Graphic.DEATH],

            statClass: bossStats,
        },
        DARK_WIZARD_BOSS: {
            id: 75,
            graphicIndexes:[game.Graphic.DARK_WIZARD],

            statClass: bossStats,
        },
        PHAROAH_BOSS: {
            id: 76,
            graphicIndexes:[game.Graphic.PHAROAH],

            statClass: bossStats,
        },
        SHADOW_BOSS: {
            id: 77,
            graphicIndexes:[game.Graphic.SHADOW],

            statClass: bossStats,
        },
        WITCH_BOSS: {
            id: 78,
            graphicIndexes:[game.Graphic.WITCH],

            statClass: bossStats,
        },
        GNOME_WIZARD_ALT_BOSS: {
            id: 79,
            graphicIndexes:[game.Graphic.GNOME_WIZARD_ALT],

            statClass: bossStats,
        },
        TROLL_CAPTAIN_BOSS: {
            id: 80,
            graphicIndexes:[game.Graphic.TROLL_CAPTAIN],

            statClass: bossStats,
        },
        BROWN_BEAR_BOSS: {
            id: 81,
            graphicIndexes:[game.Graphic.BROWN_BEAR],

            statClass: bossStats,
        },
        YETI_ALT_BOSS: {
            id: 82,
            graphicIndexes:[game.Graphic.YETI_ALT],

            statClass: bossStats,
        },
        GOBLIN_KING_BOSS: {
            id: 83,
            graphicIndexes:[game.Graphic.GOBLIN_KING],

            statClass: bossStats,
        },
        GREEN_WITCH_BOSS: {
            id: 84,
            graphicIndexes:[game.Graphic.GREEN_WITCH],

            statClass: bossStats,
        },
        GREEN_DRAGON_BOSS: {
            id: 85,
            graphicIndexes:[game.Graphic.GREEN_DRAGON],

            statClass: bossStats,
        },
        TROLL_BOSS: {
            id: 86,
            graphicIndexes:[game.Graphic.TROLL],

            statClass: bossStats,
        },
        PURPLE_SLIME_BOSS: {
            id: 87,
            graphicIndexes:[game.Graphic.PURPLE_SLIME],

            statClass: bossStats,
        },
        EYES_BOSS: {
            id: 88,
            graphicIndexes:[game.Graphic.EYES],

            statClass: bossStats,
        },
        MIMIC_BOSS: {
            id: 89,
            graphicIndexes:[game.Graphic.MIMIC],

            statClass: bossStats,
        },
        WISP_BOSS: {
            id: 90,
            graphicIndexes:[game.Graphic.WISP],

            statClass: bossStats,
        },
        PURPLE_DRAGON_BOSS: {
            id: 91,
            graphicIndexes:[game.Graphic.PURPLE_DRAGON],

            statClass: bossStats,
        },
        PIXIE_FAIRY_SPRITE_BOSS: {
            id: 92,
            graphicIndexes:[game.Graphic.PIXIE_FAIRY_SPRITE],

            statClass: bossStats,
        },
        ELDER_DEMON_BOSS: {
            id: 93,
            graphicIndexes:[game.Graphic.ELDER_DEMON],

            statClass: bossStats,
        },
        BLUE_SPECTER_BOSS: {
            id: 94,
            graphicIndexes:[game.Graphic.BLUE_SPECTER],

            statClass: bossStats,
        },
        FROST_WITCH_BOSS: {
            id: 95,
            graphicIndexes:[game.Graphic.FROST_WITCH],

            statClass: bossStats,
        },
        VAMPIRE_ALT_BOSS: {
            id: 96,
            graphicIndexes:[game.Graphic.VAMPIRE_ALT],

            statClass: bossStats,
        },
        DEATH_KNIGHT_ALT_2_BOSS: {
            id: 97,
            graphicIndexes:[game.Graphic.DEATH_KNIGHT_ALT_2],

            statClass: bossStats,
        },
        ICE_WATER_ELEMENTAL_BOSS: {
            id: 98,
            graphicIndexes:[game.Graphic.ICE_WATER_ELEMENTAL],

            statClass: bossStats,
        },
    };

    /**
     * Each class has 5 costumes (the default is specified in game.UnitType).
     * The classes are only 1x1, so we only need to specify an array of length 1
     * for each.
     * 
     * @type {Array:(Array:Number)}
     */
    window.game.EXTRA_ARCHER_COSTUMES = [game.UnitType.PLAYER_ARCHER.graphicIndexes, [game.Graphic.RANGER_F],[game.Graphic.HIGH_ELF_RANGER_F],[game.Graphic.DROW_RANGER],[game.Graphic.WOOD_ELF_RANGER_F]];
    window.game.EXTRA_WARRIOR_COSTUMES = [game.UnitType.PLAYER_WARRIOR.graphicIndexes, [game.Graphic.BERSERKER_M],[game.Graphic.PALADIN_M],[game.Graphic.KNIGHT_F],[game.Graphic.PALADIN_F]];
    window.game.EXTRA_WIZARD_COSTUMES = [game.UnitType.PLAYER_WIZARD.graphicIndexes, [game.Graphic.SHAMAN_F],[game.Graphic.SHAMAN_M],[game.Graphic.PRIEST_F],[game.Graphic.WIZARD_F]];

    /**
     * Gets unit data based on the ID passed in. 'level' is used to level up the
     * unit a certain number of times before returning the data.
     *
     * Final stats get stored in finalAtk, finalDef, and finalLife.
     * @param {Number} unitID - the ID of the unit
     * @param {Number} level  - the level to produce the unit at. If you omit
     * this or specify -1, you will simply get the unit data without final
     * stats.
     * @return {game.UnitType} the associated unit data
     */
    window.game.GetUnitDataFromID = function(unitID, level) {
        var unitData = null;
        for ( var key in game.UnitType ) {
            var unitDataTemplate = game.UnitType[key];
            if ( unitDataTemplate.id == unitID ) {
                unitData = unitDataTemplate;

                if ( level === undefined || level == -1) {
                    break;
                }

                // Store in different variables in case the caller still wants
                // to know the starting value or growth amounts.
                unitData.finalAtk = unitData.atk.start;
                unitData.finalDef = unitData.def.start;
                unitData.finalLife = unitData.life.start;

                // Level up the unit as many times as needed
                for (var i = 0; i < level - 1; i++) {
                    unitData.finalAtk += game.util.randomInteger(unitData.atk.minGrowth, unitData.atk.maxGrowth);
                    unitData.finalDef += game.util.randomInteger(unitData.def.minGrowth, unitData.def.maxGrowth);
                    unitData.finalLife += game.util.randomInteger(unitData.life.minGrowth, unitData.life.maxGrowth);
                };

                unitData.level = level;

                break;
            }
        }

        if ( unitData == null ) {
            console.log('Error - ' + unitID + ' is not a valid unit ID');
            if ( typeof(unitID) !== 'number' ) {
                // If you hit this, it's likely that you passed in the entire
                // unitData instead of just the ID.
                console.log('The above error happened because unitID isn\'t even a number.');
            }
        }

        return unitData;
    };

    /**
     * There is a circular dependency between units and abilities. Abilities
     * happen to be defined first since every single unit depends on abilities,
     * but only some abilities (summons) depend on units.
     *
     * When you declare an ability that depends on a unit, you declare it with a
     * string that corresponds to game.UnitType. This function is what resolves
     * those strings into the numerical IDs that correspond to a unit type.
     */
    ( function fillInSummonData() {
        for ( var key in game.Ability ) {
            var ability = game.Ability[key];
            var originalSummonedUnitID = ability.summonedUnitID;
            if ( originalSummonedUnitID !== undefined ) {
                ability.summonedUnitID = game.UnitType[originalSummonedUnitID];
                if ( ability.summonedUnitID === undefined ) {
                    // To fix this error, just go into AbilityData.js and
                    // correct summonedUnitID.
                    var err = 'Error: "' + ability.name + '" defines a ' +
                    'summonedUnitID that doesn\'t exist in game.Ability. Name: ' + originalSummonedUnitID;
                    game.util.debugDisplayText(err);
                    console.log(err);
                } else {
                    ability.summonedUnitID = ability.summonedUnitID.id;
                }
            }
        };
    }());

    /**
     * This function ensures you didn't define an unit ID twice, and it will
     * insert default values where necessary. It is called immediately after it
     * is defined (it's an IIFE).
     */
    ( function verifyAllUnitData() {
        var unitIDs = [];
        
        for ( var key in game.UnitType ) {
            var unitType = game.UnitType[key];

            // ID is necessary
            if ( unitType.id === undefined ) {
                game.util.debugDisplayText('Fatal error: there is a unitType missing an ID!', 'id missing');
            }

            // If you left off a name, form it based on the name of the key.
            if ( unitType.name === undefined ) {
                if ( key.length > 1 ) {
                    // ORC --> Orc
                    unitType.name = key[0] + key.substring(1).toLowerCase();
                } else {
                    unitType.name = key;
                }
            }

            for (var i = 0; i < unitType.graphicIndexes.length; i++) {
                if ( unitType.graphicIndexes[i] === undefined ) {
                    game.util.debugDisplayText('Invalid graphic index(es) chosen for ' + unitType.name, 'invalid graphic' + unitType.id);
                }
            };

            if ( unitType.statClass !== undefined ) {
                game.util.copyPropsIfUndefined(unitType.statClass, unitType);
                delete unitType.statClass;
            }

            if ( unitType.atk === undefined ) {
                game.util.debugDisplayText('Atk not defined for ' + unitType.name, 'no atk' + unitType.id);
            }

            if ( unitType.def === undefined ) {
                game.util.debugDisplayText('Def not defined for ' + unitType.name, 'no def' + unitType.id);
            }

            if ( unitType.life === undefined ) {
                game.util.debugDisplayText('Life not defined for ' + unitType.name, 'no life' + unitType.id);
            }

            // If absolutely no abilities are defined, give this unit an empty
            // array for abilities.
            if ( unitType.abilities === undefined ) {
                unitType.abilities = [];
            }

            // Makes sure that each unit type can attack. If the basic attack ability 
            // isn't present, add it to the ability list.
            var abilityIndex = game.AbilityManager.hasAbility(game.Ability.ATTACK.id, unitType.abilities);
            if ( abilityIndex == -1 ) {
                unitType.abilities.push( {id:game.Ability.ATTACK.id} );
            }
            
            // Now that it at least has ATTACK, fill in any missing ability
            // data.
            game.AbilityManager.setDefaultAbilityAttrIfUndefined(unitType.abilities);

            // If absolutely no ability AI is defined, give this unit a default 
            // one here.
            if ( unitType.abilityAI === undefined ) {
                unitType.abilityAI = game.AbilityAI.RANDOM;
            }

            if ( unitType.shadowGraphic === undefined ) {
                unitType.shadowGraphic = game.Graphic.MED_SHADOW_LOW;
            }

            game.util.useDefaultIfUndefined(unitType, 'width', DEFAULT_UNIT_WIDTH);
            game.util.useDefaultIfUndefined(unitType, 'height', DEFAULT_UNIT_HEIGHT);

            var id = unitType.id;
            if ( unitIDs.indexOf(id) != -1 ) {
                // Get the first unit with that ID
                var first = game.GetUnitDataFromID(id, 1);
                console.log('Fatal error! You duplicated a unit id (' + id + 
                    '). Duplicates: ' + first.name + ' and ' + unitType.name);

                game.util.debugDisplayText('Check console log - duplicate unit ID detected.', 'unit');
            }

            // Default chance to drop item
            if ( unitType.chanceToDropItem === undefined ) {
                unitType.chanceToDropItem = .02;
                unitType.itemsDropped = equalChanceAllLoot;
            }

            if ( unitType.chanceToDropItem == 0 ) {
                unitType.itemsDropped = noItems;
            }

            if ( unitType.chanceToDropItem > 0 && 
                (unitType.itemsDropped === undefined || unitType.itemsDropped.length == 0 ) ) {
                game.util.debugDisplayText('Fatal error: a unit has a chanceToDropItem but no itemsDropped! ID: ' + 
                    unitType.id, 'no items dropped' + unitType.id);
            }

            unitIDs.push(id);
        }
    }());

}());
