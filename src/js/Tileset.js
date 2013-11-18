( function() {
  
    /**
     * A tileset lets you know how to "skin" maps.
     * @param {Number} id - a unique ID for this tileset
     * @param {Number} spawnTileGraphic       - graphic index for the spawn
     * tiles on this map
     * @param {Number} nonwalkableTileGraphic - graphic index for the
     * nonwalkable tiles on this map
     * @param {Number} walkableTileGraphic    - graphic index for the walkable
     * tiles on this map
     */
    window.game.Tileset = function Tileset(id, spawnTileGraphic, nonwalkableTileGraphic, walkableTileGraphic) {
        this.doodads = [];

        this.id = id;
        this.spawnTileGraphic = spawnTileGraphic;
        this.nonwalkableTileGraphic = nonwalkableTileGraphic;
        this.walkableTileGraphic = walkableTileGraphic;

        // One doodad will show up approximately every 'doodadDensity' tiles,
        // making this number lower results in more doodads.
        this.doodadDensity = 5;
    };

    /**
     * Adds a doodad to this tileset.
     * @param  {Doodad} doodad - the doodad to add
     */
    window.game.Tileset.prototype.addDoodad = function(doodad) {
        this.doodads.push(doodad);
    };

}());