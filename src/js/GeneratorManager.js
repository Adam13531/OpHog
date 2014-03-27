( function() {

    /**
     * This keeps track of generators, updates, and draws them.
     */
    window.game.GeneratorManager = {

        /**
         * @type {Array:Generator}
         */
        generators: new Array(),

        /**
         * Draws each generator.
         * @param  {Object} ctx - canvas context
         */
        draw: function(ctx) {
            for (var i = 0; i < this.generators.length; i++) {
                this.generators[i].draw(ctx);
            };
        },

        /**
         * @return {Boolean} true if the GeneratorManager should update. This is
         * based on the game state.
         */
        shouldUpdate: function() {
            return game.GameStateManager.isNormalGameplay();
        },

        /**
         * Updates each generator
         * @param  {Number} delta - time elapsed in ms since last call
         */
        update: function(delta) {
            if ( !this.shouldUpdate() ) return;
            for (var i = 0; i < this.generators.length; i++) {
                this.generators[i].update(delta);
            }
        },

        /**
         * Gets all of the generators at the specified location.
         * @param  {Number} tileX - x coordinate
         * @param  {Number} tileY - y coordinate
         * @return {Array:Generator} - list of generators at the location
         */
        getGeneratorsAtLocation: function(tileX, tileY) {
            var generator;
            var generatorList = [];
            for (var i = 0; i < this.generators.length; i++) {
                generator = this.generators[i];
                if (tileX == generator.tileX && tileY == generator.tileY) {
                    generatorList.push(generator);
                }
            }

            return generatorList;
        },

        /**
         * Removes all generators at the specified location
         * @param  {Number} tileX - x coordinate
         * @param  {Number} tileY - y coordinate
         */
        removeGeneratorsAtLocation: function(tileX, tileY) {
            var generatorList = this.getGeneratorsAtLocation(tileX, tileY);
            for (var i = 0; i < generatorList.length; i++) {
                // Don't splice the list based on 'i' in this specific instance;
                // it'll result in a hang that is just miserable to debug
                this.removeGenerator(generatorList[i]);
            };
        },

        /**
         * Removes all generators.
         */
        removeAllGenerators: function() {
            this.generators = [];
        },

        /**
         * Removes a generator
         * @param  {Generator} generator - the generator to remove
         */
        removeGenerator: function(generator) {
            for (var i = 0; i < this.generators.length; i++) {
                if (generator === this.generators[i]) {
                    this.generators.splice(i, 1);
                    game.AudioManager.playAudio(game.Audio.EXPLODE_3);
                    return;
                }
            }
        },

        /**
         * Adds a generator to the map
         * @param {Generator} generator - generator to add
         */
        addGenerator: function(generator) {
            this.generators.push(generator);
        }

    };
}()); 