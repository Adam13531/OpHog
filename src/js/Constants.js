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
     * Constants.js is the first file to be included from index.html, so it will
     * contain our top-level objects, e.g. the game. These aren't technically
     * constants, but they need to be defined somewhere.
     */
    window.game = {};
    window.ui = {};
    window.game.util = {};
    window.game.graphicsUtil = {};

    /**
     * Specifies a direction
     * @type {Object}
     */
    window.game.DirectionFlags = {
        UP: 1,    // 0001
        RIGHT: 2, // 0010
        DOWN: 4,  // 0100
        LEFT: 8   // 1000
    };

    /**
     * The relative path from Javascript files to the resource folder.
     *
     * WARNING: this can only be used from files in the 'src' folder, not
     * something like 'src/child', but in production we will minify and condense
     * all code into a single file.
     *
     * WARNING #2: all paths are case-sensitive for us.
     * @type {String}
     */
    window.game.resourcePath = "../res";

    /**
     * The relative path from Javascript files to the image folder.
     * @type {String}
     */
    window.game.imagePath = window.game.resourcePath + "/img";

    /**
     * The relative path from Javascript files to the sound folder.
     * @type {String}
     */
    window.game.SOUND_PATH = window.game.resourcePath + "/sound";

    /**
     * The relative path from Javascript files to the music folder.
     * @type {String}
     */
    window.game.MUSIC_PATH = window.game.resourcePath + "/music";

    /**
     * One thousand divided by this number is the target framerate.
     * @type {Number}
     */
    window.game.MS_PER_FRAME = 16;

    /**
     * The most of one stackable item that can fit in a slot. It's set to 99
     * because that's the highest 2-digit number.
     * @type {Number}
     */
    window.game.maxSlotQuantity = 99;

    /**
     * The default font size, in pixels.
     * @type {Number}
     */
    window.game.DEFAULT_FONT_SIZE = 12;

    /**
     * The number of each unit you can have. E.g. for 5 archers, 5 wizards, and
     * 5 warriors, you'd specify 5 here.
     * @type {Number}
     */
    window.game.MAX_UNITS_PER_CLASS = 5;

    /**
     * The size of a tile.
     * @type {Number}
     */
    window.game.TILESIZE = 24;

    /**
     * The size a sprite on the item spritesheet. Oryx made them 32x32 even
     * though most of the other sprites are 24x24.
     * @type {Number}
     */
    window.game.ITEM_SPRITE_SIZE = 32;

    /**
     * The size of a sprite on the icon spritesheet.
     * @type {Number}
     */
    window.game.ICON_SPRITE_SIZE = 16;

    /**
     * Amount of ms it takes to fade in dialogs.
     * @type {Number}
     */
    window.game.DIALOG_SHOW_MS = 150;

    /**
     * There is a constant unit placement cost of this many coins.
     * @type {Number}
     */
    window.game.UNIT_PLACEMENT_COST = 200;

    /**
     * Amount of ms it takes to fade out dialogs.
     * @type {Number}
     */
    window.game.DIALOG_HIDE_MS = 400;

    /**
     * This is set to 4 because the width of the UI will only allow four enemies
     * to be displayed.
     * @type {Number}
     */
    window.game.MAXIMUM_ENEMY_TYPES_IN_MINIGAME = 4;

    /**
     * Extension for OGG files (case-sensitive).
     * @type {String}
     */
    window.game.OGG_EXT = 'ogg';

    /**
     * Extension for MP3 files (case-sensitive).
     * @type {String}
     */
    window.game.MP3_EXT = 'mp3';

    /**
     * Extension for AAC files. I chose mp4 and not m4a because of IE10.
     * @type {String}
     */
    window.game.AAC_EXT = 'mp4';

    /**
     * These are official audio responses... a browser apparently doesn't know
     * 100% for sure if it can play a file format.
     *
     * http://www.w3schools.com/tags/av_met_canplaytype.asp
     * @type {String}
     */
    window.game.PROBABLY = 'probably';

    /**
     * See window.game.PROBABLY.
     * @type {String}
     */
    window.game.MAYBE = 'maybe';
    
    /**
     * Tells us whether or not the user has ever pressed a key on their keyboard
     * @type {Boolean}
     */
    window.game.playerUsedKeyboard = false;

    /**
     * The game autosaves on the overworld every X ms.
     * @type {Number}
     */
    window.game.SAVE_GAME_ON_OVERWORLD_INTERVAL = 10000;

    /**
     * Default sound volume
     * @type {Number}
     */
    window.game.DEFAULT_SOUND_VOLUME = 50;

    /**
     * Default music volume
     * @type {Number}
     */
    window.game.DEFAULT_MUSIC_VOLUME = 50;

    /**
     * Default position of the minimap
     * @type {game.DirectionFlags}
     */
    window.game.MINIMAP_DEFAULT_POSITION = game.DirectionFlags.RIGHT | game.DirectionFlags.UP;

    /**
     * Default visibility for the minimap
     * @type {Boolean}
     */
    window.game.MINIMAP_DEFAULT_VISIBILITY = true;

    /**
     * Default that tells us if audio should be enabled
     * @type {Boolean}
     */
    window.game.AUDIO_DEFAULT_ENABLED = true;

    /**
     * These values indicate where a puzzle piece can be used in the map
     * generation algorithm.
     *
     * LEFT would be the single left column. MIDDLE would indicate in any of the
     * middle columns. RIGHT indicates the last column.
     */
    window.game.PuzzlePieceType = {
        LEFT: 1,
        MIDDLE: 2,
        RIGHT: 4
    };

    /**
     * Length of a side of a puzzle piece
     */
    window.game.PUZZLE_PIECE_SIZE = 5;

    /**
     * The number of "options" you have in the minigame. For now, this is how
     * many divs will show with choices of enemies.
     * @type {Number}
     */
    window.game.NUM_MINIGAME_DIFFICULTIES = 5;

    /**
     * These are the movement AIs. Each individual AI is commented.
     */
    window.game.MovementAI = {
        // Units with this AI will follow a path from start to finish.
        FOLLOW_PATH: 'follow path',

        // Units with this AI will be leashed to a certain point. They are given
        // leashTileX and leashTileY. These units can walk on unwalkable tiles.
        LEASH_TO_TILE: 'leash to tile',

        // Wander around the walkable tiles that aren't covered in fog. Units
        // can move in any direction as long as tiles
        // are walkable. Backtracking is allowed.
        // 
        // This is intended for the overworld for now.
        WANDER_UNFOGGY_WALKABLE: 'wander unfoggy walkable',

        // Moves to a specific tile, only following walkable tiles that aren't
        // foggy. Units can move in any direction as long as tiles are walkable.
        // Backtracking is allowed.
        // 
        // This is intended for the overworld for now.
        MOVE_TO_SPECIFIC_TILE: 'move to specific point',

        NONE: 'this unit will not move',
    };

    /**
     * IDs for animated sprites for use in the factory method.
     *
     * Make sure each ID is unique.
     * @type {Object}
     */
    window.game.AnimatedSpriteID = {
        BLUE_BURST: 0,
        BLACK_BURST: 1,
        GRAY_BURST: 2,
        PURPLE_BURST: 3,
        GREEN_BURST: 4,
        YELLOW_BURST: 5,
        BLUE_SMOKE_CLOUD: 6,
    };

    /**
     * When specifying a summonedUnitLevel, you can provide this, and the
     * summoned unit will be the level of the summoner.
     * @type {Number}
     */
    window.game.SUMMON_AT_LEVEL_OF_SUMMONER = -1;

    /**
     * When specifying a summonedUnitLevel, you can provide this, and the
     * summoned unit will be half the level of the summoner.
     * @type {Number}
     */
    window.game.SUMMON_AT_HALF_LEVEL_OF_SUMMONER = -2;

    /**
     * The relative weight used if an ability doesn't have one specified.
     * @type {Number}
     */
    window.game.DEFAULT_ABILITY_RELATIVE_WEIGHT = 1000;

    /**
     * The levels at which classes learn their special skills.
     * @type {Number}
     */
    window.game.ARCHER_SKILL_1_REQUIRED_LVL = 5;
    window.game.ARCHER_SKILL_2_REQUIRED_LVL = 15;
    window.game.ARCHER_SKILL_3_REQUIRED_LVL = 25;
    window.game.WIZARD_SKILL_1_REQUIRED_LVL = 5;
    window.game.WIZARD_SKILL_2_REQUIRED_LVL = 15;
    window.game.WIZARD_SKILL_3_REQUIRED_LVL = 25;
    window.game.WARRIOR_SKILL_1_REQUIRED_LVL = 5;
    window.game.WARRIOR_SKILL_2_REQUIRED_LVL = 15;
    window.game.WARRIOR_SKILL_3_REQUIRED_LVL = 25;

    window.game.WARRIOR_CRIT_CHANCE = .25;
    window.game.WARRIOR_CRIT_DAMAGE_MULT = 1.5;
}());
