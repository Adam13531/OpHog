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
        DESERT_TILESET_ID: 2,

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
            this.constructDesertTileset();
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

        constructDesertTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.DESERT_TILESET_ID, game.SPAWNER_GRAPHIC_INDEX, 713, 1340);

            var cactus = 162;
            var cactus2 = 163;
            var cactus3 = 164;
            var grayStone = 105;
            var pond = 108;
            var smallPond = 109;
            var bones = 31;
            var animalSkull = 497;

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([grayStone], 1, 2));
            tileset.addDoodad(new game.Doodad([cactus], 1, 1));
            tileset.addDoodad(new game.Doodad([cactus2], 1, 1));
            tileset.addDoodad(new game.Doodad([cactus3], 1, 1));
            tileset.addDoodad(new game.Doodad([pond], 1, 50));
            tileset.addDoodad(new game.Doodad([smallPond], 1, 50));
            tileset.addDoodad(new game.Doodad([bones], 1, 5));
            tileset.addDoodad(new game.Doodad([animalSkull], 1, 20));

            this.tilesets.push(tileset);
        },

        constructLavaTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.LAVA_TILESET_ID, game.SPAWNER_GRAPHIC_INDEX, 1720, 801);

            var lava1 = 1720;
            var lava2 = 1777;
            var crackedRedBlock = 1263;
            var bones = 31;
            var fire = 38;

            // A big pond
            tileset.addDoodad(new game.Doodad(
                [
                lava1,lava1,lava1,lava1,lava1,
                lava1,lava1,lava1,lava1,lava1,
                lava1,lava1,lava1,lava1,lava1,
                lava1,lava1,lava1,lava1,lava1,
                lava1,lava1,lava1,lava1,lava1,
                ], 5, 5
                ));

            // Medium-sized ponds
            tileset.addDoodad(new game.Doodad(
                [
                lava1,lava1,lava1,
                lava1,lava1,lava1,
                lava1,lava1,lava1,
                ], 3, 5
                ));
            tileset.addDoodad(new game.Doodad(
                [
                lava2,lava2,lava2,
                lava2,lava2,lava2,
                lava2,lava2,lava2,
                ], 3, 5
                ));

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([crackedRedBlock], 1, 5));
            tileset.addDoodad(new game.Doodad([bones], 1, 5));
            tileset.addDoodad(new game.Doodad([fire], 1, 5));
            tileset.addDoodad(new game.Doodad([1254], 1, 1));
            tileset.addDoodad(new game.Doodad([1255], 1, 1));
            tileset.addDoodad(new game.Doodad([1256], 1, 1));
            tileset.addDoodad(new game.Doodad([1257], 1, 1));
            tileset.addDoodad(new game.Doodad([1258], 1, 1));
            tileset.addDoodad(new game.Doodad([1259], 1, 1));

            // Rock structures
            tileset.addDoodad(new game.Doodad([1264,1265,1266], 3, 20));
            

            this.tilesets.push(tileset);
        },

        constructMarshTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.MARSH_TILESET_ID, game.SPAWNER_GRAPHIC_INDEX, 769, 715);

            var water1 = 1714;
            var water2 = 1771;
            var greenTree = 214;
            var fullGreenTree = 215;
            var greenBush1 = 43;
            var greenBush2 = 44;
            var smallGrayRock = 161;
            var twoFlowers = 101;
            var flowers = 100;

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
            tileset.addDoodad(new game.Doodad([fullGreenTree], 1, 5));
            tileset.addDoodad(new game.Doodad([greenBush1], 1, 1));
            tileset.addDoodad(new game.Doodad([greenBush2], 1, 1));
            tileset.addDoodad(new game.Doodad([smallGrayRock], 1, 1));
            tileset.addDoodad(new game.Doodad([twoFlowers], 1, 1));
            tileset.addDoodad(new game.Doodad([flowers], 1, 1));

            this.tilesets.push(tileset);
        }

    };
}()); 