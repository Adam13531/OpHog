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
        SNOW_TILESET_ID: 4,
        AUTUMN_TILESET_ID: 5,
        MUD_TILESET_ID: 6,
        JUNGLE_TILESET_ID: 7,
        SALT_TILESET_ID: 8,

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
            this.constructSnowTileset();
            this.constructAutumnTileset();
            this.constructMudTileset();
            this.constructJungleTileset();
            this.constructSaltTileset();
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
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES_1], 1, 5));
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
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES_1], 1, 5));
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
            tileset.addDoodad(new game.Doodad([game.Graphic.EVERGREEN_TREE], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_GREEN_BUSH], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.MEDIUM_GREEN_BUSH], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.SMALL_GRAY_ROCKS], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.TWO_FLOWERS], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.THREE_FLOWERS], 1, 3));

            this.addTileset(tileset);
        },

        constructSnowTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.SNOW_TILESET_ID, game.Graphic.SPAWNER, game.Graphic.SNOW_BANK, game.Graphic.PATH_TILE_SNOW_BLUE);

            var f1 = game.Graphic.SNOWY_EVERGREEN_TREE_PATCH_1;
            var f2 = game.Graphic.SNOWY_EVERGREEN_TREE_PATCH_2;
            var f3 = game.Graphic.SNOWY_EVERGREEN_TREE_PATCH_3;
            var f4 = game.Graphic.SNOWY_EVERGREEN_TREE_PATCH_4;
            var f5 = game.Graphic.SNOWY_EVERGREEN_TREE_PATCH_5;
            var f6 = game.Graphic.SNOWY_EVERGREEN_TREE_PATCH_6;
            var f7 = game.Graphic.SNOWY_EVERGREEN_TREE_PATCH_7;
            var f8 = game.Graphic.SNOWY_EVERGREEN_TREE_PATCH_8;
            var f9 = game.Graphic.SNOWY_EVERGREEN_TREE_PATCH_9;

            var d1 = game.Graphic.SNOWY_EVERGREEN_DUO_1;
            var d2 = game.Graphic.SNOWY_EVERGREEN_DUO_2;
            var d3 = game.Graphic.SNOWY_EVERGREEN_DUO_3;
            var d4 = game.Graphic.SNOWY_EVERGREEN_DUO_4;
            var d5 = game.Graphic.SNOWY_EVERGREEN_DUO_5;
            var d6 = game.Graphic.SNOWY_EVERGREEN_DUO_6;

            tileset.addDoodad(new game.Doodad(
                [
                f1,f2,f3,
                f4,f5,f6,
                f7,f8,f9,
                ], 3, 3
                ));

            tileset.addDoodad(new game.Doodad(
                [
                d1,d2,d3,
                d4,d5,d6,
                ], 3, 5
                ));

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([game.Graphic.SNOWY_EVERGREEN_TREE], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.ONE_FLOWER], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.WELL_WITH_BROWN_WATER], 1, 10));
            tileset.addDoodad(new game.Doodad([game.Graphic.PILE_OF_STONE], 1, 10));
 
            this.addTileset(tileset);
        },

        constructAutumnTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.AUTUMN_TILESET_ID, game.Graphic.SPAWNER, game.Graphic.AUTUMN_BRUSH, game.Graphic.PATH_TILE_DIRT);

            var f1 = game.Graphic.AUTUMN_FOREST_PATCH_1;
            var f2 = game.Graphic.AUTUMN_FOREST_PATCH_2;
            var f3 = game.Graphic.AUTUMN_FOREST_PATCH_3;
            var f4 = game.Graphic.AUTUMN_FOREST_PATCH_4;
            var f5 = game.Graphic.AUTUMN_FOREST_PATCH_5;
            var f6 = game.Graphic.AUTUMN_FOREST_PATCH_6;
            var f7 = game.Graphic.AUTUMN_FOREST_PATCH_7;
            var f8 = game.Graphic.AUTUMN_FOREST_PATCH_8;
            var f9 = game.Graphic.AUTUMN_FOREST_PATCH_9;

            var d1 = game.Graphic.AUTUMN_DUO_1;
            var d2 = game.Graphic.AUTUMN_DUO_2;
            var d3 = game.Graphic.AUTUMN_DUO_3;
            var d4 = game.Graphic.AUTUMN_DUO_4;
            var d5 = game.Graphic.AUTUMN_DUO_5;
            var d6 = game.Graphic.AUTUMN_DUO_6;

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
            tileset.addDoodad(new game.Doodad([game.Graphic.AUTUMN_TREE], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_AUTUMN_BUSH], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.MEDIUM_AUTUMN_BUSH], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.TWO_AUTUMN_BUSHES_2], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.TWO_AUTUMN_BUSHES_2], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.BALE_OF_HAY], 1, 20));
            tileset.addDoodad(new game.Doodad([game.Graphic.SMALL_AUTUMN_BUSH], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.TREE_STUMP], 1, 10));

            this.addTileset(tileset);
        },

        constructMudTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.MUD_TILESET_ID, game.Graphic.SPAWNER, game.Graphic.MUD_PATH, game.Graphic.PATH_TILE_DIRT);

            var f1 = game.Graphic.FENCE_LEFT_CORNER;
            var f2 = game.Graphic.FENCE_MIDDLE_HORIZ_PIECE;
            var f3 = game.Graphic.FENCE_RIGHT_CORNER;
            var f4 = game.Graphic.FENCE_MIDDLE_VERT_PIECE;

            // Higher-than-normal doodad density
            tileset.doodadDensity = 3;

            tileset.addDoodad(new game.Doodad(
                [
                f1,f2,f3,
                f4,game.Graphic.LIGHT_GRAY_DOWN_STAIRS,f4,
                f1,f2,f3,
                ], 3, 40
                ));

            var skullLeft = game.Graphic.SKULL_HEDGE_LEFT_END;
            var skullMidH = game.Graphic.SKULL_HEDGE_MIDDLE_HORIZ;
            var skullRight = game.Graphic.SKULL_HEDGE_RIGHT_END;
            var skullTop = game.Graphic.SKULL_HEDGE_TOP_END;
            var skullMidV = game.Graphic.SKULL_HEDGE_MIDDLE_VERT;
            var skullBottom = game.Graphic.SKULL_HEDGE_BOTTOM_END;
            var skullUpperRight = game.Graphic.SKULL_HEDGE_UPPER_RIGHT;
            var skullBottomLeft = game.Graphic.SKULL_HEDGE_BOTTOM_LEFT;
            var skullLeftBottomRight = game.Graphic.SKULL_HEDGE_LEFT_BOTTOM_RIGHT;

            tileset.addDoodad(new game.Doodad(
                [
                skullLeft,skullMidH,skullRight
                ], 3, 20
                ));
            tileset.addDoodad(new game.Doodad(
                [
                skullLeft,skullMidH,skullMidH,skullRight
                ], 4, 30
                ));
            tileset.addDoodad(new game.Doodad(
                [
                skullLeft,skullMidH,skullMidH,skullMidH,skullRight
                ], 5, 50
                ));

            tileset.addDoodad(new game.Doodad(
                [
                skullTop,
                skullMidV,
                skullBottom
                ], 1, 20
                ));
            tileset.addDoodad(new game.Doodad(
                [
                skullTop,game.Graphic.MUD_PATH,game.Graphic.MUD_PATH,
                skullBottomLeft,skullLeftBottomRight,skullUpperRight,
                game.Graphic.MUD_PATH,skullBottom,skullBottom,
                ], 3, 35
                ));

            // Single-tile doodads
            tileset.addDoodad(new game.Doodad([game.Graphic.RIP_TOMBSTONE], 1, 4));
            tileset.addDoodad(new game.Doodad([game.Graphic.CRACKED_TOMBSTONE], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.ERODED_TOMBSTONE], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.SMALL_BROWN_POOL], 1, 5));
            tileset.addDoodad(new game.Doodad([game.Graphic.DYING_TREE], 1, 5));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES_1], 1, 15));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES_2], 1, 15));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES_3], 1, 15));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES_4], 1, 15));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES_5], 1, 15));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES_6], 1, 15));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES_7], 1, 15));
            tileset.addDoodad(new game.Doodad([game.Graphic.TOMBSTONE_PURPLE_GEM], 1, 7));
            tileset.addDoodad(new game.Doodad([game.Graphic.TOMBSTONE_TWISTED], 1, 7));
            tileset.addDoodad(new game.Doodad([game.Graphic.TOMBSTONE_PURPLE_FACE], 1, 7));
            tileset.addDoodad(new game.Doodad([game.Graphic.TOMBSTONE_WITH_LOOP], 1, 7));
            tileset.addDoodad(new game.Doodad([game.Graphic.TOMBSTONE_WITH_CROSS], 1, 7));
            tileset.addDoodad(new game.Doodad([game.Graphic.TOMBSTONE_RUBBLE], 1, 7));

            this.addTileset(tileset);
        },

        constructJungleTileset: function() {
            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.JUNGLE_TILESET_ID, game.Graphic.SPAWNER, game.Graphic.LUSH_GREEN_BRUSH_2, game.Graphic.PATH_TILE_JUNGLE);

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
            tileset.addDoodad(new game.Doodad([game.Graphic.EVERGREEN_TREE], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_JUNGLE_PLANT], 1, 6));
            tileset.addDoodad(new game.Doodad([game.Graphic.MEDIUM_JUNGLE_PLANT], 1, 6));
            tileset.addDoodad(new game.Doodad([game.Graphic.TWO_FLOWERS], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.THREE_FLOWERS], 1, 3));
            tileset.addDoodad(new game.Doodad([game.Graphic.BIG_BLUE_POND], 1, 15));
            tileset.addDoodad(new game.Doodad([game.Graphic.SMALL_BLUE_POND], 1, 15));
            tileset.addDoodad(new game.Doodad([game.Graphic.WELL_WITH_WOOD_FRAME], 1, 20));

            this.addTileset(tileset);
        },

        constructSaltTileset: function() {
            var saltStreak = game.Graphic.PATH_TILE_SALT_STREAK;


            // spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic
            var tileset = new game.Tileset(this.SALT_TILESET_ID, game.Graphic.SPAWNER, saltStreak, game.Graphic.PATH_TILE_SALT);

            var greenSteps = game.Graphic.FOUR_GREEN_STEPS;
            var crackedStone1 = game.Graphic.CRACKED_BROWN_FOUR_POINT_STONE_1;
            var crackedStone2 = game.Graphic.CRACKED_BROWN_FOUR_POINT_STONE_2;

            tileset.addDoodad(new game.Doodad(
                [
                greenSteps,
                greenSteps,
                greenSteps,
                ], 1, 20
                ));
            tileset.addDoodad(new game.Doodad(
                [
                crackedStone1,saltStreak,
                saltStreak,crackedStone1,
                ], 2, 20
                ));
            tileset.addDoodad(new game.Doodad(
                [
                saltStreak,crackedStone2,
                crackedStone2,saltStreak,
                ], 2, 20
                ));
            tileset.addDoodad(new game.Doodad([game.Graphic.BONES_1], 1, 5));
            tileset.addDoodad(new game.Doodad([game.Graphic.TAN_STONE_PATH_1], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.TAN_STONE_PATH_2], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.TAN_STONE_PATH_3], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.TAN_STONE_PATH_4], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.TAN_STONE_PATH_5], 1, 1));
            tileset.addDoodad(new game.Doodad([game.Graphic.TAN_STONE_PATH_6], 1, 1));

            // Rock structures
            tileset.addDoodad(new game.Doodad(
                [
                    game.Graphic.CRACKED_TAN_BLOCK_HORIZ_RIDGE_1,
                    game.Graphic.CRACKED_TAN_BLOCK_HORIZ_RIDGE_2,
                    game.Graphic.CRACKED_TAN_BLOCK_HORIZ_RIDGE_3
                ], 3, 20
                ));
            
            this.addTileset(tileset);
        },

    };
}()); 