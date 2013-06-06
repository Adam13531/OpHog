( function() {

    /**
     * This is the graphic index of a spawner tile. We only use one tile sheet
     * and all spawner tiles look the same for now.
     * @type {Number}
     */
    window.game.SPAWN_TILE_GRAPHIC_INDEX = 67;

    /**
     * Tiles do not currently have any other functions because there is only
     * data in this class and everything is essentially constant. This will
     * change when we add animation.
     * @param {Number} graphicIndex - the index used to represent this tile
     */
    window.game.Tile = function Tile(graphicIndex, tileIndex, tileX, tileY) {
        this.graphicIndex = graphicIndex;
        this.isSpawnerPoint = (this.graphicIndex == game.SPAWN_TILE_GRAPHIC_INDEX);
        this.isWalkable = (this.graphicIndex == 88) || this.isSpawnerPoint;
        this.tileIndex = tileIndex;
        this.x = tileX;
        this.y = tileY;
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
     * @return {[type]} [description]
     */
    window.game.Tile.prototype.convertToSpawner = function() {
        if ( !this.isWalkable ) {
            console.log('Can\'t convert a non-walkable tile into a spawner, ' + 
                'because it wouldn\'t be in any of the map\'s paths. Tile index: ' + this.tileIndex);
            return;
        }
        this.graphicIndex = game.SPAWN_TILE_GRAPHIC_INDEX;
        this.isSpawnerPoint = true;
    };

}());
