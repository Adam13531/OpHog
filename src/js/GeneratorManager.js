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
         * @return {null}
         */
        draw: function(ctx) {
            for (var i = 0; i < this.generators.length; i++) {
                this.generators[i].draw(ctx);
            };
        },

        /**
         * Updates each generator
         * @param  {Number} delta - time elapsed in ms since last call
         * @return {null}
         */
        update: function(delta) {
            for (var i = 0; i < this.generators.length; i++) {
                this.generators[i].update(delta);
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