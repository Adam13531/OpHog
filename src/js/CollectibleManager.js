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
         * @return {null}
         */
        addCollectible: function(collectible) {
            this.collectibles.push(collectible);
        },

        /**
         * Constructs and adds a Collectible to the manager.
         * @param  {game.CollectibleType} type - the type of the Collectible
         * @return {null}
         */
        addNewCollectible: function(type) {
            // If you don't pass in a type, randomly generate ANY collectible.
            // This is debug code.
            if ( type === undefined ) {
                var key = game.util.randomKeyFromDict(game.CollectibleType);
                type = game.CollectibleType[key];
            }

            // Get a random walkable point
            var randomWalkableTile = currentMap.getRandomWalkableTile();

            // Make the Collectible based on that.
            var collectible = new game.Collectible(randomWalkableTile.x, randomWalkableTile.y, type);
            this.addCollectible(collectible);
        },

        /**
         * Draws all collectibles.
         * @param  {Object} ctx - the canvas context
         * @return {null}
         */
        draw: function(ctx) {
            for (var i = 0; i < this.collectibles.length; i++) {
                this.collectibles[i].draw(ctx);
            };
        },

        /**
         * Removes the specified collectible from this manager.
         * @param  {Collectible} collectible - the collectible to remove
         * @return {null}
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
         * @return {null}
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
         * Updates all collectibles and possibly spawns more.
         * @param  {Number} delta - time in ms since this was last called
         * @return {null}
         */
        update: function(delta) {
            // Random chance to generate a collectible is very low and gets
            // lower as we spawn more.
            var chanceToSpawnCollectible = .004 / (this.collectibles.length + 1);
            if ( Math.random() < chanceToSpawnCollectible ) this.addNewCollectible();

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