( function() {
  
    /**
     * A tileset lets you know how to "skin" maps.
     * @param {Number} spawnTileGraphic       - graphic index for the spawn
     * tiles on this map
     * @param {Number} nonwalkableTileGraphic - graphic index for the
     * nonwalkable tiles on this map
     * @param {Number} walkableTileGraphic    - graphic index for the walkable
     * tiles on this map
     */
    window.game.Tileset = function Tileset(spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic) {
        this.doodads = [];

        this.spawnTileGraphic = spawnTileGraphic;
        this.nonwalkableTileGraphic = nonwalkableTileGraphic;
        this.walkableTileGraphic = walkableTileGraphic;
    };

    /**
     * Adds a doodad to this tileset.
     * @param  {Doodad} doodad - the doodad to add
     */
    window.game.Tileset.prototype.addDoodad = function(doodad) {
        this.doodads.push(doodad);
    };

}());