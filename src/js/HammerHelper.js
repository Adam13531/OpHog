( function() {

    /**
     * This entire class exists because there's no way to tell if a 'release'
     * event from Hammer happened at the end of a 'drag' or 'transform' event,
     * so there were lots of bugs where you would try panning the map and you'd
     * accidentally use an item or close the unit placement UI.
     * @type {Object}
     */
    window.game.HammerHelper = {
        /**
         * This represents whether you're currently dragging.
         * @type {Boolean}
         */
        hammerDragging: false,

        /**
         * If this is true, then hammerDragging will be reset on the next update
         * loop. We can't reset it immediately because 'release' always seems to
         * be called after 'dragend'.
         * @type {Boolean}
         */
        hammerResetDragging: false,

        /**
         * This represents whether you're currently transforming.
         * @type {Boolean}
         */
        hammerTransforming: false,
        
        /**
         * See hammerResetDragging.
         * @type {Boolean}
         */
        hammerResetTransforming: false,

        /**
         * See hammerResetDragging.
         */
        update: function() {
            if ( this.hammerResetDragging ) {
                this.hammerResetDragging = false;
                this.hammerDragging = false;
            }

            if ( this.hammerResetTransforming ) {
                this.hammerResetTransforming = false;
                this.hammerTransforming = false;
            }
        }

    };

}()); 