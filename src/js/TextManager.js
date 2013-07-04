( function() {

    // Falls back to Helvetica if Futura doesn't exist
    window.game.FuturaFont = 'Futura, Helvetica, sans-serif';

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
         * Draws text a single time. 
         * @param  {Object} ctx     - the canvas context
         * @param  {String} text    - the text to draw
         * @param  {Number} centerX - the center X coordinate (see below for which coordinate system they're in)
         * @param  {Number} centerY - the center Y coordinate (see below for which coordinate system they're in)
         * @param  {Boolean} useScreenCoordinates - if true, x and y are in screen coordinates, otherwise they're in world coordinates.
         * @param  {Number} fontSize- the font size to use in px
         * @param  {String} font    - the font to use (don't put font size in this string), e.g. 'Verdana, sans-serif'
         * @param  {String} color   - the color (e.g. '#fff')
         */
        drawTextImmediate: function(ctx, text, centerX, centerY, useScreenCoordinates, fontSize, font, color) {
            ctx.save();
            game.Camera.resetScaleAndTranslate(ctx);

            if ( !useScreenCoordinates ) {
                game.Camera.scaleAndTranslate(ctx);
            }

            ctx.font = fontSize + 'px ' + font;
            var width = ctx.measureText(text).width;
            var height = Math.ceil(fontSize / 2);

            ctx.textBaseline = 'top';
            ctx.fillStyle = color;

            var x = centerX - width / 2;
            var y = centerY - height;

            // Clamp to world coordinates
            if ( !useScreenCoordinates ) {
                x = Math.max(0, Math.min(x, currentMap.widthInPixels - width));
                y = Math.max(0, Math.min(y, currentMap.heightInPixels - height));
            }
            
            ctx.fillText(text, x, y);
            ctx.restore();
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