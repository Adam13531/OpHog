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

    /**
     * This is hard-coded because this class hasn't been polished yet.
     *
     * When this is no longer hard-coded, the height will need to be pulled from
     * the font so that the object can be positioned correctly (search this file
     * for "height").
     */
    window.game.TextObjFont = '12px Futura, Helvetica, sans-serif';
    window.game.MediumFont = '20px Futura, Helvetica, sans-serif';
    window.game.BigFont = '40px Futura, Helvetica, sans-serif';

    /**
     * A TextObj is single-line text that displays for a certain amount of time
     * and can have velocity. A nearly infinite amount of polish can go into
     * this class to get it to be much, much flashier, so I'm going to make it
     * as basic as possible and leave it for now.
     * @param {Number} centerX The center X coordinate (in pixels)
     * @param {Number} centerY The center Y coordinate (in pixels)
     * @param {String} text    The text to display
     * @param {Boolean} bigFont If true, this'll make the font big and green
     * @param {String} fontColor - the color of the font
     * @param {Boolean} useWorldCoordinates - if true, this text object will be
     * displayed in world coordinates, otherwise it will be displayed in screen
     * coordinates.
     */
    window.game.TextObj = function TextObj(centerX, centerY, text, bigFont, fontColor, useWorldCoordinates) {
        this.text = text;

        this.bigFont = bigFont;
        this.useWorldCoordinates = useWorldCoordinates;

        // Text objects require a canvas in order to figure out their metrics,
        // so we can't actually position anything here.
        this.hasBeenPositioned = false;
        this.x = centerX;
        this.y = centerY;

        // Life in seconds
        this.ttl = 1;

        // Height of the font (in pixels)
        this.height = 12;

        // Speed in pixels/second that the font moves
        this.speed = 100;

        this.fontColor = fontColor;

        if ( this.bigFont ) {
            this.font = game.BigFont;
            this.ttl = 2;
            this.height = 40;
            this.speed = 50;
        } else {
            this.font = game.TextObjFont;
            this.ttl = 1;
            this.height = 12;
            this.speed = 100;
        }
    };

    /**
     * Updates this text object.
     * @param  {Number} delta Time since last update (in ms)
     */
    window.game.TextObj.prototype.update = function(delta) {
        var deltaAsSec = delta / 1000;
        var change = this.speed * deltaAsSec;

        this.y -= change;
        this.ttl -= deltaAsSec;
    };

    /**
     * Returns true if this text object should be removed.
     */
    window.game.TextObj.prototype.isDead = function() {
        return this.ttl < 0;
    };

    /**
     * Draws this text object.
     * @param  {Object} ctx The canvas.
     */
    window.game.TextObj.prototype.draw = function(ctx) {
        ctx.save();

        if ( this.useWorldCoordinates ) {
            game.Camera.scaleAndTranslate(ctx);
        }

        ctx.font = this.font;
        var text = this.text;
        var width = ctx.measureText(text).width;

        // We need the canvas in order to position the text since that's what
        // lets us compute width needed.
        if ( !this.hasBeenPositioned ) {
            this.hasBeenPositioned = true;
            this.x = this.x - width / 2;
            this.y = this.y - this.height / 2;

            // Make sure the text object can't start off-screen.
            if ( this.useWorldCoordinates ) {
                this.x = Math.min(game.currentMap.widthInPixels - width, Math.max(0, this.x));
                this.y = Math.min(game.currentMap.heightInPixels - this.height, Math.max(0, this.y));
            } else {
                this.x = Math.min(game.canvasWidth - width, Math.max(0, this.x));
                this.y = Math.min(game.canvasHeight - this.height, Math.max(0, this.y));
            }
        }

        ctx.textBaseline = 'top';
        ctx.fillStyle = this.fontColor;
        ctx.fillText(text, this.x, this.y);
        ctx.restore();
    };

}());