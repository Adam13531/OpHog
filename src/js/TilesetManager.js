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
            var tileset = game.util.getItemInContainerByProperty(this.tilesets, 'id', id);
            if ( tileset != null ) return tileset;

            console.log('Error: no tileset with ID==' + id);
            return null;
        },

        constructDesertTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.DESERT_TILESET_ID, game.Graphic.SPAWNER, game.Graphic.DESERT_SAND, game.Graphic.DARK_MUD_PATH_FULL_TEXTURE);

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_GRAY_STONE], 1, 2));
            tileset.addDoodad(new game.Doodad([game.Graphic.CACTUS_1], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.CACTUS_2], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.CACTUS_3], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_BLUE_POND], 1, 50));
            tileset.addDoodad(new game.Doodad([game.Graphic.SMALL_BLUE_POND], 1, 50));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES], 1, 5));
            tileset.addDoodad(new game.Doodad([game.Graphic.ANIMAL_SKULL], 1, 20));

            this.tilesets.push(tileset);
        },

        constructLavaTileset: function() {
            var lava1 = game.Graphic.RED_WATER_1;
            var lava2 = game.Graphic.RED_WATER_2;

            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.LAVA_TILESET_ID, game.Graphic.SPAWNER, lava1, game.Graphic.DARK_COBBLESTONE);

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
            

            this.tilesets.push(tileset);
        },

        constructMarshTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.MARSH_TILESET_ID, game.Graphic.SPAWNER, game.Graphic.LIGHT_GREEN_BRUSH, game.Graphic.DIRT_PATH);

            var water1 = game.Graphic.BLUE_WATER_1;
            var water2 = game.Graphic.BLUE_WATER_2;

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
            tileset.addDoodad(new game.Doodad([game.Graphic.GREEN_TREE], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.GREEN_TREE_WITH_FRUIT], 1, 5));
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_GREEN_BUSH], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.MEDIUM_GREEN_BUSH], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.SMALL_GRAY_ROCKS], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.TWO_FLOWERS], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.THREE_FLOWERS], 1, 1));

            this.tilesets.push(tileset);
        }

    };
}()); 