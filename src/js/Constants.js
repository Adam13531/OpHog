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
     * Each class has 5 costumes (the default is specified in UnitData.js). The
     * classes are only 1x1, so we only need to specify an array of length 1 for
     * each.
     *
     * These are the 4 alternate costumes.
     * @type {Array:Number}
     */
    window.game.EXTRA_ARCHER_COSTUMES = [[352],[353],[354],[355]];
    window.game.EXTRA_WARRIOR_COSTUMES = [[356],[357],[358],[359]];
    window.game.EXTRA_WIZARD_COSTUMES = [[360],[361],[362],[363]];

}());
