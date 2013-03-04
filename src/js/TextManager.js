( function() {

    // There's only one text manager, so we'll define everything in a single
    // object.
    window.game.TextManager = {
        textObjs: new Array(),

        /**
         * Adds a text object for this to keep track of.
         * @param {TextObj} textObj The object to add.
         */
        addTextObj: function(textObj) {
            this.textObjs.push(textObj);
        },

        /**
         * Updates all text objects.
         * @param  {Number} delta Time since last update (in ms)
         */
        update: function(delta) {
            for (var i = 0; i < this.textObjs.length; i++) {
                if ( this.textObjs[i].isDead() ) {
                    this.textObjs.splice(i, 1);
                    i--;
                    continue;
                }

                this.textObjs[i].update(delta);
            };
        },

        /**
         * Draws all text objects.
         */
        draw: function(ctx) {
            for (var i = 0; i < this.textObjs.length; i++) {
                this.textObjs[i].draw(ctx);
            };
        }
    };
}()); 