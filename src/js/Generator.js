/*
 * OpHog - https://github.com/Adam13531/OpHog
 * Copyright (C) 2014  Adam Damiano
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
( function() {

    /**
     * A generator creates enemies.
     * @param {Number} tileX - x coordinate
     * @param {Number} tileY - y coordinate
     * @param {Array:PossibleEnemy} possibleEnemies - the set of possible
     * enemies that this generator can produce.
     * @param {Array:MovementAI} movementAIs List of possible movement AIs that
     * enemies can have that get spawned from this generator.
     * @param {Number} maxEnemiesToSpawn Maximum number of enemies that this
     * generator is allowed to spawn.
     */
    window.game.Generator = function Generator(tileX, tileY, possibleEnemies, movementAIs, maxEnemiesToSpawn) {
        this.tileX = tileX;
        this.tileY = tileY;
        this.possibleEnemies = possibleEnemies;
        this.numGeneratedEnemies = 0;
        this.maxEnemiesToSpawn = maxEnemiesToSpawn;

        /**
         * The units this generator produced.
         * @type {Array:Unit}
         */
        this.unitsProduced = [];

        this.movementAIs = [];
        for (var i = 0; i < movementAIs.length; i++) {
            var movementAI = {};
            game.util.copyProps(movementAIs[i], movementAI);
            this.movementAIs.push(movementAI);
        };
    };

    /**
     * Draws the generator.
     * @param  {Object} ctx - canvas context
     * @return {null}
     */
    window.game.Generator.prototype.draw = function(ctx) {
        // Only draw if the camera can see this
        if ( !game.Camera.canSeeTileCoordinates(this.tileX, this.tileY) ) return; 

        envSheet.drawSprite(ctx, game.Graphic.GENERATOR, this.tileX * game.TILESIZE, this.tileY * game.TILESIZE);
    };


    /**
     * Updates the generator, potentially producing a unit
     * @param  {Number} delta - time elapsed in ms since last call
     * @return {null}
     */
    window.game.Generator.prototype.update = function(delta) {
        var deltaAsSec = delta / 1000;

        // Hard-code some relatively small percent for now.
        if ( Math.random() < .004 &&
             this.numGeneratedEnemies < this.maxEnemiesToSpawn ) {
            this.produceEnemy();
        }
    };

    /**
     * Tell the units that their generator was destroyed so that they don't try
     * to update a generator that doesn't exist.
     */
    window.game.Generator.prototype.aboutToDestroy = function() {
        for (var i = 0; i < this.unitsProduced.length; i++) {
            this.unitsProduced[i].generator = undefined;
        };
    };

    window.game.Generator.prototype.unitWasRemovedFromMap = function(unit) {
        // Checking to see if 'unit' was actually produced by this generator is
        // unnecessary since the generator is only ever set in produceEnemy.
        this.numGeneratedEnemies--;
    };

    /**
     * Creates an enemy.
     */
    window.game.Generator.prototype.produceEnemy = function() {
        var possibleEnemy = game.util.randomFromWeights(this.possibleEnemies);

        // Add one here since randomInteger is exclusive.
        var level = game.util.randomInteger(possibleEnemy.minLevel, possibleEnemy.maxLevel + 1);

        var newUnit = new game.Unit(possibleEnemy.enemyID, game.PlayerFlags.ENEMY, level);

        newUnit.placeUnit(this.tileX, this.tileY, game.MovementAI.FOLLOW_PATH);
        game.UnitManager.addUnit(newUnit);
        this.numGeneratedEnemies++;
        this.unitsProduced.push(newUnit);
        newUnit.generator = this;
    };

}());
