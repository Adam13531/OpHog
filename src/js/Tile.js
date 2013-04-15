( function() {

    /**
     * A tile. For now, this is just a graphic index and some properties that
     * are based on that index.
     *
     * Tiles do not currently have any other functions because there is only
     * data in this class and everything is essentially constant. This will
     * change when we add animation.
     * @param {Number} graphicIndex - the index used to represent this tile
     */
    window.game.Tile = function Tile(graphicIndex) {
        this.graphicIndex = graphicIndex;
        this.isSpawnerPoint = (this.graphicIndex == 67);
        this.isWalkable = (this.graphicIndex == 88);
    };

}());
