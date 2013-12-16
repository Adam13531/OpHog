( function(){

    window.game.AnimatedSpriteManager = {

        sprites: new Array(),

        /**
         * Remove dead sprites and update the living ones.
         * @param  {Number} delta - time in ms since this function was last
         * called.
         */
        update: function(delta) {
            for (var i = 0; i < this.sprites.length; i++) {
                if ( this.sprites[i].isDead ) {
                    this.sprites.splice(i, 1);
                    i--;
                    continue;
                }

                this.sprites[i].update(delta);
            };
        },

	    // TODO: make these constants
	    /**
	     * Factory function to create an animated sprite.
	     * @param  {game.AnimatedSpriteID} id - ID for this sprite
	     * @param  {Number} x  - world coordinate
	     * @param  {Number} y  - world coordinate
	     */
		createAnimatedSpriteByID: function(id, x, y) {
	        var animatedSprite = null;
	        var MS_PER_FRAME = 20;
	        switch(id) {
	            case game.AnimatedSpriteID.BLUE_BURST:
	            	var indices = [
	            		game.Graphic.MEDIUM_BLUE_CIRCLE_1,
	            		game.Graphic.MEDIUM_BLUE_CIRCLE_2,
	            		game.Graphic.MEDIUM_BLUE_CIRCLE_3,
	            		game.Graphic.MEDIUM_BLUE_CIRCLE_4
	            		];
	                animatedSprite = new game.AnimatedSprite(eff24Sheet, indices, x, y, MS_PER_FRAME);
	                break;
	            default:
	                console.log('Animated sprite ID not recognized: ' + id);
	                break;
	        };

	        if ( animatedSprite != null ) {
	        	this.sprites.push(animatedSprite);
	        }
	    },

	    draw: function(ctx) {
	    	for (var i = 0; i < this.sprites.length; i++) {
	    		this.sprites[i].draw(ctx);
	    	};
	    }
	};

}());