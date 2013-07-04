( function() {

    // Falls back to Helvetica if Futura doesn't exist
    window.game.Futura12Font = '12px Futura, Helvetica, sans-serif';

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
         * @param  {Number} centerX - the center X coordinate in world coords
         * @param  {Number} centerY - the center Y coordinate in world coords
         * @param  {String} font    - the font to use
         * @param  {String} color   - the color (e.g. '#fff')
         */
        drawTextImmediate: function(ctx, text, centerX, centerY, font, color) {
            ctx.save();
            ctx.font = font;
            var width = ctx.measureText(text).width;
            var height = 6;

            ctx.textBaseline = 'top';
            ctx.fillStyle = color;

            var x = centerX - width / 2;
            var y = centerY - height;

            // Clamp to world coordinates
            x = Math.max(0, Math.min(x, currentMap.widthInPixels - width));
            y = Math.max(0, Math.min(y, currentMap.heightInPixels - height));
            
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