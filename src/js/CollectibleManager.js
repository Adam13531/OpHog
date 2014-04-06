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

    // There is only one CollectibleManager.
    window.game.CollectibleManager = {
        /**
         * The list of collectibles.
         * @type {Array:Collectible}
         */
        collectibles: new Array(),

        /**
         * Adds a collectible to the manager.
         * @param  {Collectible} collectible - the collectible to add
         */
        addCollectible: function(collectible) {
            this.collectibles.push(collectible);
        },

        /**
         * Constructs and adds a Collectible to the manager.
         * @param  {game.CollectibleType} type - the type of the Collectible
         */
        addNewCollectible: function(type) {
            // If you don't pass in a type, randomly generate ANY collectible.
            // This is debug code.
            if ( type === undefined ) {
                var key = game.util.randomKeyFromDict(game.CollectibleType);
                type = game.CollectibleType[key];
            }

            // Get a random walkable point
            var randomWalkableTile = game.currentMap.getRandomWalkableTile();

            // Make the Collectible based on that.
            var collectible = new game.Collectible(randomWalkableTile.x, randomWalkableTile.y, type);
            this.addCollectible(collectible);
        },

        /**
         * Draws all collectibles.
         * @param  {Object} ctx - the canvas context
         */
        draw: function(ctx) {
            for (var i = 0; i < this.collectibles.length; i++) {
                this.collectibles[i].draw(ctx);
            };
        },

        /**
         * Removes the specified collectible from this manager.
         * @param  {Collectible} collectible - the collectible to remove
         */
        removeCollectible: function(collectible) {
            for (var i = 0; i < this.collectibles.length; i++) {
                if (collectible === this.collectibles[i]) {
                    this.collectibles.splice(i, 1);
                    return;
                }
            }
        },

        /**
         * Removes all collectibles.
         * @return {undefined}
         */
        removeAllCollectibles: function() {
            this.collectibles = [];
        },

        /**
         * @param  {Number} tileX - tile coord
         * @param  {Number} tileY - tile coord
         * @return {Array:Collectible} - list of collectibles at the specified
         * location
         */
        getCollectiblesAtLocation: function(tileX, tileY) {
            var collectible;
            var collectibleList = [];
            for (var i = 0; i < this.collectibles.length; i++) {
                collectible = this.collectibles[i];
                if (tileX == collectible.tileX && tileY == collectible.tileY) {
                    collectibleList.push(collectible);
                }
            }

            return collectibleList;
        },

        /**
         * Attempts to collect any collectibles at the specified location.
         * @param  {Unit} unit  - the unit who is attempting to collect them
         * @param  {Number} tileX - tile coord of the unit
         * @param  {Number} tileY - tile coord of the unit
         */
        collectAtLocation: function(unit, tileX, tileY) {
            var collectibleList = this.getCollectiblesAtLocation(tileX, tileY);
            for (var i = 0; i < collectibleList.length; i++) {
                collectibleList[i].collectedBy(unit);
                // Don't splice the list based on 'i' in this specific instance;
                // it'll result in a hang that is just miserable to debug
                this.removeCollectible(collectibleList[i]);
            };
        },

        /**
         * @return {Boolean} true if the CollectibleManager can spawn a
         * collectible. This is based on the game state.
         */
        canSpawnCollectible: function() {
            if ( game.GameStateManager.isNormalGameplay() ) {
                return true;
            }
        },

        /**
         * This function will determine whether a collectible should spawn (it's
         * random).
         */
        potentiallyProduceCollectible: function() {
            if ( !this.canSpawnCollectible() ) return;

            // Random chance to generate a collectible is very low and gets
            // lower as we spawn more.
            // 
            // It's based on the size of the map, so a 25x25 map will have a
            // .004 initial chance to spawn a collectible.
            var initialChanceToSpawn = game.currentMap.areaInTiles * .0000064;

            var chanceToSpawnCollectible = initialChanceToSpawn / (this.collectibles.length + 1);
            if ( Math.random() < chanceToSpawnCollectible ) this.addNewCollectible();
        },

        /**
         * Updates all collectibles and possibly spawns more.
         * @param  {Number} delta - time in ms since this was last called
         */
        update: function(delta) {
            this.potentiallyProduceCollectible();

            // Remove dead collectibles first
            for (var i = 0; i < this.collectibles.length; i++) {
                if ( !this.collectibles[i].isLiving() ) {
                    this.collectibles.splice(i, 1);
                    i--;
                    continue;
                }

                this.collectibles[i].update(delta);
            };
        }
    };
}()); 