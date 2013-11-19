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
        FOREST_TILESET_ID: 3,

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
            this.constructForestTileset();
            this.initialized = true;
        },

        /**
         * Adds a tileset to the manager. This is only important because it
         * makes sure you don't have multiple tilesets with the same ID.
         * @param {Tileset} tileset - the tileset to add.
         */
        addTileset: function(tileset) {
            var id = tileset.id;
            var existingTileset = game.util.getItemInContainerByProperty(this.tilesets, 'id', id);
            if ( existingTileset != null ) {
                console.log('You have multiple tilesets with the ID: ' + id);
                game.util.debugDisplayText('Multiple tilesets with the same ID (check console)', 'dupe tileset' + id);
            }
            
            this.tilesets.push(tileset);
        },

        /**
         * Retrieves a tileset based on its ID.
         * @param  {Number} id - the ID of the tileset, e.g. LAVA_TILESET_ID.
         * @return {Tileset}    the tileset corresponding to this ID.
         */
        getTilesetByID: function(id) {
            var tileset = game.util.getItemInContainerByProperty(this.tilesets, 'id', id);
            if ( tileset != null ) return tileset;

            console.log('Error: no tileset with ID==' + id);
            return null;
        },

        constructDesertTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.DESERT_TILESET_ID, game.Graphic.SPAWNER, game.Graphic.DESERT_SAND, game.Graphic.PATH_TILE_SAND);

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_GRAY_STONE], 1, 2));
            tileset.addDoodad(new game.Doodad([game.Graphic.CACTUS_1], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.CACTUS_2], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.CACTUS_3], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_BLUE_POND], 1, 50));
            tileset.addDoodad(new game.Doodad([game.Graphic.SMALL_BLUE_POND], 1, 50));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES], 1, 5));
            tileset.addDoodad(new game.Doodad([game.Graphic.ANIMAL_SKULL], 1, 20));

            this.addTileset(tileset);
        },

        constructLavaTileset: function() {
            var lava1 = game.Graphic.RED_WATER_1;

            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.LAVA_TILESET_ID, game.Graphic.SPAWNER, lava1, game.Graphic.PATH_TILE_DARK_DIRT);

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
                lava1,lava1,lava1,
                lava1,lava1,lava1,
                lava1,lava1,lava1,
                ], 3, 5
                ));

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([game.Graphic.CRACKED_RED_BLOCK], 1, 5));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES], 1, 5));
            tileset.addDoodad(new game.Doodad([game.Graphic.FIRE_1], 1, 5));
            tileset.addDoodad(new game.Doodad([game.Graphic.RED_STONE_PATH_1], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.RED_STONE_PATH_2], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.RED_STONE_PATH_3], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.RED_STONE_PATH_4], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.RED_STONE_PATH_5], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.RED_STONE_PATH_6], 1, 1));

            // Rock structures
            tileset.addDoodad(new game.Doodad([game.Graphic.CRACKED_RED_BLOCK_HORIZ_RIDGE_1,game.Graphic.CRACKED_RED_BLOCK_HORIZ_RIDGE_2,game.Graphic.CRACKED_RED_BLOCK_HORIZ_RIDGE_3], 3, 20));
            

            this.addTileset(tileset);
        },

        constructMarshTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.MARSH_TILESET_ID, game.Graphic.SPAWNER, game.Graphic.LUSH_GREEN_BRUSH, game.Graphic.PATH_TILE_MUD);

            var water1 = game.Graphic.BLUE_WATER_1;

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
                water1,water1,water1,
                water1,water1,water1,
                water1,water1,water1,
                ], 3, 1
                ));

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([game.Graphic.GREEN_TREE], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.GREEN_TREE_WITH_FRUIT], 1, 5));
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_GREEN_BUSH], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.MEDIUM_GREEN_BUSH], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.SMALL_GRAY_ROCKS], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.TWO_FLOWERS], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.THREE_FLOWERS], 1, 1));

            this.addTileset(tileset);
        },

        constructForestTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.FOREST_TILESET_ID, game.Graphic.SPAWNER, game.Graphic.LIGHT_GREEN_BRUSH, game.Graphic.PATH_TILE_DIRT);

            var f1 = game.Graphic.EVERGREEN_FOREST_PATCH_1;
            var f2 = game.Graphic.EVERGREEN_FOREST_PATCH_2;
            var f3 = game.Graphic.EVERGREEN_FOREST_PATCH_3;
            var f4 = game.Graphic.EVERGREEN_FOREST_PATCH_4;
            var f5 = game.Graphic.EVERGREEN_FOREST_PATCH_5;
            var f6 = game.Graphic.EVERGREEN_FOREST_PATCH_6;
            var f7 = game.Graphic.EVERGREEN_FOREST_PATCH_7;
            var f8 = game.Graphic.EVERGREEN_FOREST_PATCH_8;
            var f9 = game.Graphic.EVERGREEN_FOREST_PATCH_9;

            var d1 = game.Graphic.EVERGREEN_DUO_1;
            var d2 = game.Graphic.EVERGREEN_DUO_2;
            var d3 = game.Graphic.EVERGREEN_DUO_3;
            var d4 = game.Graphic.EVERGREEN_DUO_4;
            var d5 = game.Graphic.EVERGREEN_DUO_5;
            var d6 = game.Graphic.EVERGREEN_DUO_6;

            // Lots of doodads
            tileset.doodadDensity = 1;

            tileset.addDoodad(new game.Doodad(
                [
                d1,d2,d3,
                d4,d5,d6,
                ], 3, 5
                ));

            tileset.addDoodad(new game.Doodad(
                [
                f1,f2,f3,
                f4,f5,f6,
                f7,f8,f9,
                ], 3, 3
                ));
            tileset.addDoodad(new game.Doodad(
                [
                f1,f2,f2,f3,
                f4,f5,f5,f6,
                f4,f5,f5,f6,
                f7,f8,f8,f9,
                ], 4, 3
                ));
            tileset.addDoodad(new game.Doodad(
                [
                f1,f2,f2,f2,f3,
                f4,f5,f5,f5,f6,
                f4,f5,f5,f5,f6,
                f4,f5,f5,f5,f6,
                f7,f8,f8,f8,f9,
                ], 4, 3
                ));
            tileset.addDoodad(new game.Doodad(
                [
                f1,f2,f2,f2,f2,f3,
                f4,f5,f5,f5,f5,f6,
                f4,f5,f5,f5,f5,f6,
                f4,f5,f5,f5,f5,f6,
                f7,f8,f8,f8,f8,f9,
                ], 6, 3
                ));

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([game.Graphic.EVERGREEN_TREE], 1, 1)); // evergreen
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_GREEN_BUSH], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.MEDIUM_GREEN_BUSH], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.SMALL_GRAY_ROCKS], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.TWO_FLOWERS], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.THREE_FLOWERS], 1, 3));

            this.addTileset(tileset);
        }

    };
}()); 