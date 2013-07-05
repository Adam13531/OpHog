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

    window.game.CASTLE_GRAPHIC_INDEX = 93;

    /**
     * Tiles do not currently have any other functions because there is only
     * data in this class and everything is essentially constant. This will
     * change when we add animation.
     * @param {Tileset} tileset - the tileset used for this map
     * @param {Number} graphicIndex - the index used to represent this tile
     */
    window.game.Tile = function Tile(tileset, graphicIndex, tileIndex, tileX, tileY) {
        this.tileset = tileset;
        this.graphicIndex = graphicIndex;

        /**
         * See game.TileFlags.
         * @type {game.TileFlags}
         */
        this.tileFlags = 0;

        if (this.graphicIndex == this.tileset.spawnTileGraphic) {
            this.tileFlags |= game.TileFlags.SPAWNER | game.TileFlags.WALKABLE;
        }

        if (this.graphicIndex == this.tileset.walkableTileGraphic) {
            this.tileFlags |= game.TileFlags.WALKABLE;
        }

        if (this.graphicIndex == game.CASTLE_GRAPHIC_INDEX) {
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
        return this.x * tileSize + tileSize / 2;
    };

    /**
     * Convenience function to get the the world Y of this tile's center.
     */
    window.game.Tile.prototype.getPixelCenterY = function() {
        return this.y * tileSize + tileSize / 2;
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
        this.graphicIndex = this.tileset.spawnTileGraphic;
        this.tileFlags |= game.TileFlags.SPAWNER;
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
        this.graphicIndex = game.CASTLE_GRAPHIC_INDEX;
        this.tileFlags |= game.TileFlags.CASTLE;
    };

}());
