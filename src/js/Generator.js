( function() {

    /**
     * A generator creates enemies.
     * @param {Number} tileX - x coordinate
     * @param {Number} tileY - y coordinate
     */
    window.game.Generator = function Generator(tileX, tileY) {
        this.tileX = tileX;
        this.tileY = tileY;
    };

    /**
     * Draws the generator.
     * @param  {Object} ctx - canvas context
     * @return {null}
     */
    window.game.Generator.prototype.draw = function(ctx) {
        // Only draw if the camera can see this
        if ( !game.Camera.canSeeTileCoordinates(this.tileX, this.tileY) ) return; 

        envSheet.drawSprite(ctx, 91, this.tileX * tileSize, this.tileY * tileSize);
    };


    /**
     * Updates the generator, potentially producing a unit
     * @param  {Number} delta - time elapsed in ms since last call
     * @return {null}
     */
    window.game.Generator.prototype.update = function(delta) {
        var deltaAsSec = delta / 1000;

        // Hard-code some relatively small percent for now.
        if ( Math.random() < .004 ) this.produceEnemy();
    };

    /**
     * Creates an enemy.
     * @return {null}
     */
    window.game.Generator.prototype.produceEnemy = function() {
        // For now, every enemy will be the DEBUG type.
        var newUnit = new game.Unit(game.UnitType.DEBUG,false);
        newUnit.placeUnit(this.tileX, this.tileY);
        game.UnitManager.addUnit(newUnit);
    };

}());
