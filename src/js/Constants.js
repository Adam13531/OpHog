( function() {

    /**
     * Constants.js is the first file to be included from index.html, so it will
     * contain our top-level objects, e.g. the game. These aren't technically
     * constants, but they need to be defined somewhere.
     */
    window.game = {};
    window.ui = {};
    window.game.util = {};

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
     * The amount of life that all castles share.
     * @type {Number}
     */
    window.game.FULL_CASTLE_LIFE = 100;

}());
