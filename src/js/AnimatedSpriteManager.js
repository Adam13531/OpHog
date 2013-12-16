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

	    /**
	     * Factory function to create an animated sprite.
	     * @param  {game.AnimatedSpriteID} id - ID for this sprite
	     * @param  {Number} x  - world coordinate
	     * @param  {Number} y  - world coordinate
	     */
		createAnimatedSpriteByID: function(id, x, y) {
	        var MS_PER_FRAME = 40;
	        var indices = null;

	        switch(id) {
	            case game.AnimatedSpriteID.BLUE_BURST:
	            	indices = [
	            		game.Graphic.MEDIUM_BLUE_CIRCLE_1,
	            		game.Graphic.MEDIUM_BLUE_CIRCLE_2,
	            		game.Graphic.MEDIUM_BLUE_CIRCLE_3,
	            		game.Graphic.MEDIUM_BLUE_CIRCLE_4
	            		];
	                break;
	            case game.AnimatedSpriteID.BLACK_BURST:
	            	indices = [
	            		game.Graphic.MEDIUM_BLACK_CIRCLE_1,
	            		game.Graphic.MEDIUM_BLACK_CIRCLE_2,
	            		game.Graphic.MEDIUM_BLACK_CIRCLE_3,
	            		game.Graphic.MEDIUM_BLACK_CIRCLE_4
	            		];
	                break;
	            case game.AnimatedSpriteID.PURPLE_BURST:
	            	indices = [
	            		game.Graphic.MEDIUM_PURPLE_CIRCLE_1,
	            		game.Graphic.MEDIUM_PURPLE_CIRCLE_2,
	            		game.Graphic.MEDIUM_PURPLE_CIRCLE_3,
	            		game.Graphic.MEDIUM_PURPLE_CIRCLE_4
	            		];
	                break;
	            case game.AnimatedSpriteID.GREEN_BURST:
	            	indices = [
	            		game.Graphic.MEDIUM_GREEN_CIRCLE_1,
	            		game.Graphic.MEDIUM_GREEN_CIRCLE_2,
	            		game.Graphic.MEDIUM_GREEN_CIRCLE_3,
	            		game.Graphic.MEDIUM_GREEN_CIRCLE_4
	            		];
	                break;
	            case game.AnimatedSpriteID.YELLOW_BURST:
	            	indices = [
	            		game.Graphic.MEDIUM_YELLOW_CIRCLE_1,
	            		game.Graphic.MEDIUM_YELLOW_CIRCLE_2,
	            		game.Graphic.MEDIUM_YELLOW_CIRCLE_3,
	            		];
	                break;
	            case game.AnimatedSpriteID.GRAY_BURST:
	            	indices = [
	            		game.Graphic.MEDIUM_GRAY_CIRCLE_1,
	            		game.Graphic.MEDIUM_GRAY_CIRCLE_2,
	            		game.Graphic.MEDIUM_GRAY_CIRCLE_3,
	            		game.Graphic.MEDIUM_GRAY_CIRCLE_4,
	            		game.Graphic.MEDIUM_GRAY_CIRCLE_5,
	            		];
	                break;
	            default:
	                console.log('Animated sprite ID not recognized: ' + id);
	                break;
	        };

	        if ( indices != null ) {
	            var animatedSprite = new game.AnimatedSprite(eff24Sheet, indices, x, y, MS_PER_FRAME);
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