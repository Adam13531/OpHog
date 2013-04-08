( function() {


    /**
     * Arguments would eventually be passed to this class, but for now, we only
     * have one map, so it'll go here. Note that you should call
     * game.Camera.computeScrollBoundaries(); when you load a map for real.
     */
    window.game.Map = function Map() {
        /**
         * The tiles representing this map. A tile is simply a graphic index for
         * now; there's no additional state.
         * @type {Array:Number}
         */
        this.mapTiles = new Array(
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,67,88,88,88,88,88,88,88,88,88,88,88,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,67,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,93,
            5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,
            93,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,67,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 
            );

        this.numCols = 25;
        this.numRows = this.mapTiles.length / this.numCols;
    };

    /**
     * Draws this map.
     * @param  {Object} ctx The canvas context
     * @return {null}
     */
    window.game.Map.prototype.draw = function(ctx) {
        for (var y = 0; y < this.numRows; y++) {
            for (var x = 0; x < this.numCols; x++) {
                var graphic = this.mapTiles[y * this.numCols + x];
                envSheet.drawSprite(ctx, graphic, 0,0);
                ctx.translate(tileSize, 0);
            }
            ctx.translate(-tileSize * this.numCols, tileSize);
        }
    };

    /**
     * Tells whether or not the tiles passed in point to a spawner point
     * or not
     * @param  {Number}  tileX Tile X coordinate
     * @param  {Number}  tileY Tile Y coordinate
     * @return {Boolean}        Returns true if the point is a spawning point,
     *                                  otherwise returns false
     */
    window.game.Map.prototype.isSpawnerPoint = function(tileX, tileY) {
        var index = tileY * this.numCols + tileX;
        if (this.mapTiles[index] == 67) {
            return true;
        }
        return false;
    };

}());
