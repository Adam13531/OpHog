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
     */
    window.game.resourcePath = "../res";

    /**
     * The relative path from Javascript files to the image folder.
     */
    window.game.imagePath = window.game.resourcePath + "/img";

    /**
     * One thousand divided by this number is the target framerate.
     * @type {Number}
     */
    window.game.msPerFrame = 16;

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
    window.game.TILESIZE = 32;

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

}());
