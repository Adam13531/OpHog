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
     * These represent certain tile properties. Not all combinations are
     * possible, e.g. SPAWNER | CASTLE, and some combinations are necessary,
     * e.g. WALKABLE | SPAWNER.
     * @type {Object}
     */
    window.game.TileFlags = {
        WALKABLE: 1,
        SPAWNER:  2,
        CASTLE:   4,
        FOGGY:    8,

        // Sometimes you want to fetch a tile that does not have fog
        UNFOGGY: 16,
    };

     /**
      * A tile object.
      * @param {Number} tilesetID    - the ID of the tileset to use. This isn't
      * a Tileset itself so that tiles can be saved/loaded easily.
      * @param {Number} graphicIndex - the index used to represent this tile.
      * @param {Number} tileIndex    - this is the index into the current map's
      * tile array. It comes in handy a lot, but causes the tile to be tightly
      * coupled with our Map class.
      * @param {Number} tileX        - the X of this tile.
      * @param {Number} tileY        - the Y of this tile.
      * @param {Boolean} walkable     - whether or not this tile is walkable.
      */
    window.game.Tile = function Tile(tilesetID, graphicIndex, tileIndex, tileX, tileY, walkable) {
        this.tileset = game.TilesetManager.getTilesetByID(tilesetID);
        this.graphicIndex = graphicIndex;

        /**
         * See game.TileFlags.
         * @type {game.TileFlags}
         */
        this.tileFlags = 0;

        if (this.graphicIndex == this.tileset.spawnTileGraphic) {
            this.tileFlags |= game.TileFlags.SPAWNER | game.TileFlags.WALKABLE;
        }

        if (walkable) {
            this.tileFlags |= game.TileFlags.WALKABLE;
        }

        if (this.graphicIndex == game.Graphic.GENERATOR) {
            this.tileFlags |= game.TileFlags.CASTLE;
        }

        this.tileIndex = tileIndex;
        this.x = tileX;
        this.y = tileY;

        // If true, this tile is a left endpoint. See Map.js - isTileAnEndpoint.
        // This is set by the map.
        this.isLeftEndpoint = false;

        // See this.isLeftEndpoint
        this.isRightEndpoint = false;

        // This is an object that relates a left-neighbor's tileIndex (keys in a
        // dict can only be strings, otherwise it would be the left-neighbor
        // itself and not the tileIndex) to an array of right-neighbors. It
        // represents that when you come from a specific left-neighbor, any of
        // the right-neighbors are valid.
        //
        // Not all left-neighbors will exist in this list, for example, if A is
        // cardinally above B and B is not a right-endpoint, then B will not have A
        // in its leftList.
        // 
        // This tile itself will always appear as a key in leftList, because a
        // spawner can be placed on any tile. When units are spawned, they are
        // placed as though they came from that tile, which is why this is
        // necessary.
        //
        // If this tile is a right-endpoint, then any right-neighbors stored in
        // here will be this tile itself just to have a sane value.
        // 
        // A tile cannot be both a left and right endpoint.
        // 
        // This is only set for walkable tiles.
        this.leftList = {};

        // This is basically the same thing as leftList except it relates a
        // right-neighbor's tileIndex to an array of left-neighbors.
        this.rightList = {};
    };

    /**
     * Debug function to print a tile's lists.
     * @return {undefined}
     */
    window.game.Tile.prototype.printList = function() {
        this.realPrintList(true);
        this.realPrintList(false);
    };

    /**
     * Very straightforward functions below.
     */
    window.game.Tile.prototype.isWalkable = function() {
        return (this.tileFlags & game.TileFlags.WALKABLE) != 0;
    };
    window.game.Tile.prototype.isSpawnerPoint = function() {
        return (this.tileFlags & game.TileFlags.SPAWNER) != 0;
    };
    window.game.Tile.prototype.isCastle = function() {
        return (this.tileFlags & game.TileFlags.CASTLE) != 0;
    };

    /**
     * Debug function to print a tile's lists.
     * @param  {Boolean} printLeftList - if true, this will print leftList.
     * @return {String} - an empty string simply so that Chrome doesn't print
     * "undefined"
     */
    window.game.Tile.prototype.realPrintList = function(printLeftList) {
        var listToUse = printLeftList ? this.leftList : this.rightList;
        var stringToUse = printLeftList ? 'left' : 'right';
        console.log('tileIndex ' + this.tileIndex + '\'s ' + stringToUse + 'List: ');
        for( var stringIndex in listToUse ) {
            var indexAsNumber = Number(stringIndex);
            var rightString = '';
            var rightNeighbors = listToUse[stringIndex];
            for (var i = 0; i < rightNeighbors.length; i++) {
                if ( i > 0 ) rightString += ' ';
                rightString += rightNeighbors[i].tileIndex;
            };

            console.log(indexAsNumber + ': ' + rightString);
        };

        return '';
    };

    /**
     * Convenience function to get the the world X of this tile's center.
     */
    window.game.Tile.prototype.getPixelCenterX = function() {
        return this.x * game.TILESIZE + game.TILESIZE / 2;
    };

    /**
     * Convenience function to get the the world Y of this tile's center.
     */
    window.game.Tile.prototype.getPixelCenterY = function() {
        return this.y * game.TILESIZE + game.TILESIZE / 2;
    };

    /**
     * Converts this tile into a spawner point.
     */
    window.game.Tile.prototype.convertToSpawner = function() {
        if ( !this.isWalkable() ) {
            console.log('Can\'t convert a non-walkable tile into a spawner, ' + 
                'because it wouldn\'t be in any of the map\'s paths. Tile index: ' + this.tileIndex);
            return;
        }
        this.tileFlags |= game.TileFlags.SPAWNER;
    };

    /**
     * @param  {Tile} otherTile - some other tile (or null or undefined)
     * @return {Boolean}           - true if they're equal
     */
    window.game.Tile.prototype.equals = function(otherTile) {
        return otherTile !== undefined && otherTile !== null && this.tileIndex === otherTile.tileIndex;
    };

    //TODO: if there are starting LEFT puzzle pieces that look like these ones,
    // this code will fail:
    //0 0 0
    //1 1 1
    //0 0 0
    //0 0 0
    //
    //0 X 0
    //Y 1 0
    //0 1 1
    //0 0 0 (in this case, the castle needs to be where the X is, but it
    //      would be where the Y is)
    /**
     * Converts a tile into a castle
     * @return {[type]} [description]
     */
    window.game.Tile.prototype.convertToCastle = function() {
        if ( this.isWalkable() ) {
            console.log('Can\'t convert a walkable tile into a castle: ' + 
                        this.tileIndex);
            return;
        }
        this.tileFlags |= game.TileFlags.CASTLE;
    };

}());
