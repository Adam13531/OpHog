( function() {

    /**
     * The tileset manager keeps track of each tileset.
     */
    window.game.TilesetManager = {

        // These IDs are hard-coded instead of autocomputed so that we can
        // always change the order and not worry about screwing up people's save
        // files.
        LAVA_TILESET_ID: 0,
        MARSH_TILESET_ID: 1,

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

        /**
         * Retrieves a tileset based on its ID.
         * @param  {Number} id - the ID of the tileset, e.g. LAVA_TILESET_ID.
         * @return {Tileset}    the tileset corresponding to this ID.
         */
        getTilesetByID: function(id) {
            for (var i = 0; i < this.tilesets.length; i++) {
                if ( this.tilesets[i].id == id ) {
                    return this.tilesets[i];
                }
            };

            console.log('Error: no tileset with ID==' + id);
            return null;
        },

        constructLavaTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.LAVA_TILESET_ID, 65, 116, 100);

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
            var tileset = new game.Tileset(this.MARSH_TILESET_ID, 65, 70, 72);

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