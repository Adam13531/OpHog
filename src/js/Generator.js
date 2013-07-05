( function() {

    /**
     * A generator creates enemies.
     * @param {Number} tileX - x coordinate
     * @param {Number} tileY - y coordinate
     * @param {Array:PossibleEnemy} possibleEnemies - the set of possible
     * enemies that this generator can produce.
     */
    window.game.Generator = function Generator(tileX, tileY, possibleEnemies) {
        this.tileX = tileX;
        this.tileY = tileY;
        this.possibleEnemies = possibleEnemies;
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
        var possibleEnemy = game.util.randomFromWeights(this.possibleEnemies);

        // Add one here since randomInteger is exclusive.
        var level = game.util.randomInteger(possibleEnemy.minLevel, possibleEnemy.maxLevel + 1);

        var newUnit = new game.Unit(possibleEnemy.enemyID, false, level);

        newUnit.placeUnit(this.tileX, this.tileY, game.MovementAI.FOLLOW_PATH);
        game.UnitManager.addUnit(newUnit);
    };

}());
