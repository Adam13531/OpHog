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
            var spriteSheet = eff24Sheet;

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
	            case game.AnimatedSpriteID.BLUE_SMOKE_CLOUD:
                    MS_PER_FRAME = 50;
	            	indices = [
	            		game.Graphic.BLUE_SMOKE_CLOUD_1,
	            		game.Graphic.BLUE_SMOKE_CLOUD_2,
	            		];
                    spriteSheet = eff32Sheet;
	                break;
	            default:
	                console.log('Animated sprite ID not recognized: ' + id);
	                break;
	        };

	        if ( indices != null ) {
	            var animatedSprite = new game.AnimatedSprite(spriteSheet, indices, x, y, MS_PER_FRAME);
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