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
     * The amount of life that the castles start with.
     * @type {Number}
     */
    window.game.FULL_CASTLE_LIFE = 100;

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
     * Amount of ms it takes to fade in dialogs.
     * @type {Number}
     */
    window.game.DIALOG_SHOW_MS = 150;

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
     * The graphic index of spawners.
     * @type {Number}
     */
    window.game.SPAWNER_GRAPHIC_INDEX = 371;

    /**
     * Graphic index of generators.
     * @type {Number}
     */
    window.game.GENERATOR_GRAPHIC_INDEX = 155;

}());
