( function() {
  
    /**
     * A doodad is a feature on a map that is drawn above the map background.
     * @param {Array:Number} graphicIndices - the graphic indices that form this
     * doodad
     * @param {Number} width          - the width of the doodad
     * @param {Number} rarity         - the higher this number is, the lower the
     * chance of finding this doodad on the map.
     */
    window.game.Doodad = function Doodad(graphicIndices, width, rarity) {
        this.graphicIndices = graphicIndices;
        this.width = width;
        this.height = this.graphicIndices.length / width;
        this.rarity = rarity;
    };

}());