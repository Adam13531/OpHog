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

    // Falls back to Helvetica if Futura doesn't exist
    window.game.FuturaFont = 'Futura, Helvetica, sans-serif';

    // The TextManager keeps track of various text objets.
    window.game.TextManager = {

        // Array:game.TextObj (i.e. movable, single-line text)
        textObjs: new Array(),

        // Array:game.TextBox (i.e. stationary, multi-line text)
        textBoxes: new Array(),

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

            for (var i = 0; i < this.textBoxes.length; i++) {
                if ( this.textBoxes[i].ttl <= 0 ) {
                    this.textBoxes.splice(i, 1);
                    i--;
                    continue;
                }

                this.textBoxes[i].update(delta);
            };
        },

        removeAllTextObjects: function() {
            this.textObjs = [];
        },

        /**
         * Draws text a single time. 
         * @param  {Object} ctx     - the canvas context
         * @param  {String} text    - the text to draw
         * @param  {Number} x - the X coordinate (see treatXAsCenter for how this is used)
         * @param  {Number} y - the Y coordinate. Depending on the options you pass, this will either represent the top, middle, or bottom coordinate
         * @param  {Object} options - all other font-drawing options. You don't have to specify any of these, in which case defaults will be used.
         *         {Boolean} screenCoords - if true, x and y are in screen coordinates, otherwise they're in world coordinates. Default is false.
         *         {Number} fontSize- the font size to use in px. Default is game.DEFAULT_FONT_SIZE.
         *         {String} font    - the font to use (don't put font size in this string), e.g. 'Verdana, sans-serif'. Default is game.FuturaFont.
         *         {String} color   - the color. Default is '#fff' (white).
         *         {String} baseline- either 'top', 'middle', or 'bottom'. This
         *         dictates what 'y' represents. Default: 'top'. There are other
         *         values, but I can't reliably compute height, so they may appear
         *         out of bounds if you use them: http://www.w3schools.com/tags/canvas_textbaseline.asp
         *         {Boolean} clamp  - if true, this will clamp world coordinates to the world size or screen coordinates to the screen size. Defaults to true.
         *         {Boolean} treatXAsCenter  - if true, this will center the 
         *         text at that X coordinate, otherwise it will put the text's 
         *         left side at the X. Defaults to true.
         */
        drawTextImmediate: function(ctx, text, x, y, options) {
            // Set default values
            if ( options === undefined ) options = {};
            var useScreenCoordinates = (options.screenCoords === undefined ? false : options.screenCoords);
            var fontSize = (options.fontSize === undefined ? game.DEFAULT_FONT_SIZE : options.fontSize);
            var font = (options.font === undefined ? game.FuturaFont : options.font);
            var color = (options.color === undefined ? '#fff' : options.color);
            var baseline = (options.baseline === undefined ? 'top' : options.baseline);
            var clamp = (options.clamp === undefined ? true : options.clamp);
            var treatXAsCenter = (options.treatXAsCenter === undefined ? true : options.treatXAsCenter);

            // Translate to correct coordinate space
            ctx.save();
            game.Camera.resetScaleAndTranslate(ctx);

            if ( !useScreenCoordinates ) {
                game.Camera.scaleAndTranslate(ctx);
            }

            ctx.font = fontSize + 'px ' + font;
            var width = ctx.measureText(text).width;
            var height = fontSize;

            ctx.textBaseline = baseline;
            ctx.fillStyle = color;

            if ( treatXAsCenter ) {
                x -= width / 2;
            } 

            if ( clamp ) {
                // To figure out where the 'y' should be clamped, we need to
                // take our baseline into account.
                //
                // Set topY to be the coordinate where we'd draw if we were
                // using 'top' as our baseline.
                var topY;
                if ( baseline == 'top' ) {
                    topY = y;
                } else if ( baseline == 'middle' ) {
                    topY = y - height / 2;
                } else {
                    topY = y - height;
                }

                var bottomY = topY + height;
                var lowestPossibleYCoord;

                if ( useScreenCoordinates ) {
                    x = Math.max(0, Math.min(x, game.canvasWidth));
                    lowestPossibleYCoord = game.canvasHeight - height;

                } else {
                    x = Math.max(0, Math.min(x, game.currentMap.widthInPixels - width));
                    lowestPossibleYCoord = game.currentMap.heightInPixels - height;
                }

                // There should never be a case where our font is bigger than
                // the screen, so the below can be an 'else if' and not just an
                // 'if'.
                if ( topY < 0 ) {
                    y -= topY;
                } else if ( bottomY >= lowestPossibleYCoord ) {
                    y -= (bottomY - lowestPossibleYCoord);
                }
            }
            
            ctx.fillText(text, x, y);
            ctx.restore();
        },

        /**
         * Draws text objects.
         * @param {Boolean} drawWorldTexts - if true, this will only draw text
         * objects that are in world coordinates. If false, it will only draw
         * text objects in screen coordinates.
         */
        draw: function(ctx, drawWorldTexts) {
            for (var i = 0; i < this.textObjs.length; i++) {
                if ( this.textObjs[i].useWorldCoordinates == drawWorldTexts) {
                    this.textObjs[i].draw(ctx);
                }
            };
        },

        /**
         * Draws all TextBoxes.
         */
        drawTextBoxes: function(ctx) {
            for (var i = 0; i < this.textBoxes.length; i++) {
                this.textBoxes[i].draw(ctx);
            };  
        }

    };
}()); 