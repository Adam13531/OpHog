( function() {

    /**
     * Tiles do not currently have any other functions because there is only
     * data in this class and everything is essentially constant. This will
     * change when we add animation.
     * @param {Number} graphicIndex - the index used to represent this tile
     */
    window.game.Tile = function Tile(graphicIndex, tileIndex, tileX, tileY) {
        this.graphicIndex = graphicIndex;
        this.isSpawnerPoint = (this.graphicIndex == 67);
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


}());
