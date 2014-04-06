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

    game.BLUE_GRADIENT = null;
    game.GREEN_GRADIENT = null;
    game.RED_GRADIENT = null;
    game.PURPLE_GRADIENT = null;

    /**
     * This class exists so that you can specify gradients without needing to
     * add all of the color stops yourself every single time. There are some
     * parameters to createRadialGradient that change, so when you want to use
     * this gradient in the canvas context, you'll pass those in as arguments.
     */
    window.game.Gradient = function Gradient() {
        this.colorStops = [];
    };

    /**
     * This is simply a wrapper around the HTML5 gradient's addColorStop, so
     * look here: http://w3schools.com/tags/canvas_addcolorstop.asp
     *
     * FYI: I'm nearly positive that the HTML5 gradient's addColorStop can take
     * the color stops in any order.
     */
    window.game.Gradient.prototype.addColorStop = function(stop, r, g, b) {
        this.colorStops.push([stop, r, g, b]);
    };

    /**
     * Creates a gradient that the canvas can understand. This is a simple
     * wrapper around createRadialGradient.
     */
    window.game.Gradient.prototype.getRadialGradiant = function(ctx, x1, y1, r1, x2, y2, r2, alpha) {
        var gradient = ctx.createRadialGradient(x1,y1,r1,x2,y2,r2);
        for (var i = 0; i < this.colorStops.length; i++) {
            var cs = this.colorStops[i];
            gradient.addColorStop(cs[0], 'rgba('+cs[1]+','+cs[2]+','+cs[3]+','+alpha+')');
        };
        return gradient;
    };

    /**
     * This is run immediately.
     */
    ( function initializeAllStaticGradients() {
        game.BLUE_GRADIENT = new game.Gradient();
        game.BLUE_GRADIENT.addColorStop(0, 0, 255, 255);
        game.BLUE_GRADIENT.addColorStop(.4, 0, 0, 255);
        game.BLUE_GRADIENT.addColorStop(1, 0, 0, 0);

        game.GREEN_GRADIENT = new game.Gradient();
        game.GREEN_GRADIENT.addColorStop(0, 255, 255, 0);
        game.GREEN_GRADIENT.addColorStop(.4, 0, 255, 0);
        game.GREEN_GRADIENT.addColorStop(1, 0, 0, 0);

        game.RED_GRADIENT = new game.Gradient();
        game.RED_GRADIENT.addColorStop(0, 255, 0, 255);
        game.RED_GRADIENT.addColorStop(.4, 255, 0, 0);
        game.RED_GRADIENT.addColorStop(1, 0, 0, 0);

        game.PURPLE_GRADIENT = new game.Gradient();
        game.PURPLE_GRADIENT.addColorStop(0, 163, 73, 164);
        game.PURPLE_GRADIENT.addColorStop(.6, 64, 0, 128);
        game.PURPLE_GRADIENT.addColorStop(1, 0, 0, 0);
    }());

}());
