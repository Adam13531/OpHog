( function() {

    /**
     * The tileset manager keeps track of each tileset.
     */
    window.game.TilesetManager = {

        /**
         * The available tilesets.
         * @type {Array:Tileset}
         */
        tilesets: new Array(),

        /**
         * True if this was already initialized.
         * @type {Boolean}
         */
        initialized: false,

        /**
         * Constructs each tileset.
         */
        init: function() {
            // Only allow this to be initialized once.
            if ( this.initialized ) return;

            this.tilesets = [];
            this.constructLavaTileset();
            this.constructMarshTileset();
            this.initialized = true;
        },

        constructLavaTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(65, 116, 100);

            var lava1 = 112;
            var lava2 = 128;
            var crackedRedBlock = 51;
            var charredTree = 76;
            var blackHole = 119;
            var stones = 117;

            // A big pond
            tileset.addDoodad(new game.Doodad(
                [
                lava1,lava1,lava1,lava1,lava1,
                lava1,lava1,lava1,lava1,lava1,
                lava1,lava1,lava1,lava1,lava1,
                lava1,lava1,lava1,lava1,lava1,
                lava1,lava1,lava1,lava1,lava1,
                ], 5, 1
                ));

            // Medium-sized ponds
            tileset.addDoodad(new game.Doodad(
                [
                lava1,lava1,lava1,
                lava1,lava1,lava1,
                lava1,lava1,lava1,
                ], 3, 1
                ));
            tileset.addDoodad(new game.Doodad(
                [
                lava2,lava2,lava2,
                lava2,lava2,lava2,
                lava2,lava2,lava2,
                ], 3, 1
                ));

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([crackedRedBlock], 1, 1));
            tileset.addDoodad(new game.Doodad([charredTree], 1, 1));
            tileset.addDoodad(new game.Doodad([blackHole], 1, 5));
            tileset.addDoodad(new game.Doodad([stones], 1, 1));

            this.tilesets.push(tileset);
        },

        constructMarshTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(65, 70, 72);

            var water1 = 130;
            var water2 = 114;
            var greenTree = 73;
            var bareBrownTree = 75;
            var fullGreenTree = 77;
            var greenBush1 = 78;
            var greenBush2 = 79;
            var smallGrayRock = 105;
            var smallMushroom = 108;
            var bigMushroom = 109;
            var greenPlants = 126;

            // A big pond
            tileset.addDoodad(new game.Doodad(
                [
                water1,water1,water1,water1,water1,
                water1,water1,water1,water1,water1,
                water1,water1,water1,water1,water1,
                water1,water1,water1,water1,water1,
                water1,water1,water1,water1,water1,
                ], 5, 1
                ));

            // Medium-sized ponds
            tileset.addDoodad(new game.Doodad(
                [
                water1,water1,water1,
                water1,water1,water1,
                water1,water1,water1,
                ], 3, 1
                ));
            tileset.addDoodad(new game.Doodad(
                [
                water2,water2,water2,
                water2,water2,water2,
                water2,water2,water2,
                ], 3, 1
                ));

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([greenTree], 1, 1));
            tileset.addDoodad(new game.Doodad([bareBrownTree], 1, 1));
            tileset.addDoodad(new game.Doodad([fullGreenTree], 1, 1));
            tileset.addDoodad(new game.Doodad([greenBush1], 1, 1));
            tileset.addDoodad(new game.Doodad([greenBush2], 1, 1));
            tileset.addDoodad(new game.Doodad([smallGrayRock], 1, 1));
            tileset.addDoodad(new game.Doodad([smallMushroom], 1, 5));
            tileset.addDoodad(new game.Doodad([bigMushroom], 1, 5));

            this.tilesets.push(tileset);
        }

    };
}()); 