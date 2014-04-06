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

    window.game.TextBox = function TextBox(x, y, text, maxWidth) {
        this.text = text;

        // Text objects require a canvas in order to figure out their metrics,
        // so we can't actually position anything here.
        this.hasBeenPositioned = false;
        this.x = x;
        this.y = y;

        /**
         * Time to live in seconds.
         * @type {Number}
         */
        this.ttl = game.NUM_SEC_TO_SHOW_OBTAINED_ITEMS;

        this.backgroundOpacity = 1;
        this.foregroundOpacity = 1;

        this.padding = 5;
        this.textOutlineColor = '#000';
        this.textColor = '#fff';
        this.borderColor = 'rgba(0,200,0,.75)';

        // Height will be computed later when we have a canvas context
        this.height = 0;

        // Keep track of the maxWidth that the caller intends for this textbox
        // so have. Even if it can never be set, we remember it so that if the
        // browser ever gets larger, we can try setting it (otherwise, you might
        // make a textbox that is squished due to the size of the browser, and
        // it would never expand).
        this.initialMaxWidth = maxWidth;
        this.setMaxWidth(maxWidth);
        this.computedMetrics = false;

        /**
         * Subclasses can use this to push the dedicated text area to the right.
         * @type {Number}
         */
        this.leftPaddingBeforeText = this.padding;

        /**
         * The minimum height of this textbox. If the textbox doesn't reach the
         * minimum height due to the text alone, then blank space is added to
         * the bottom (as opposed to reflowing the text to take up more vertical
         * space). This is useful for things like the loot notifications where
         * you want the textboxes to be at least the height of the item icon
         * that they show.
         * @type {Number}
         */
        this.minHeight = 0;
    };

    /**
     * This will also reflow all of the next on the next redraw.
     */
    window.game.TextBox.prototype.setMaxWidth = function(maxWidth) {
        this.width = maxWidth;
        this.computedMetrics = false;
        
        var browserWidth = $(window).width();
        if ( this.x + this.width > browserWidth ) {
            this.width = browserWidth - this.x - this.padding;
        }
    };

    window.game.TextBox.prototype.update = function(delta) {
        var deltaAsSec = delta / 1000;
        this.ttl -= deltaAsSec;
    };

    /**
     * This function figures out how to break up the text so that it fits in the
     * width set in the constructor. This requires the canvas context so that we
     * can measure the text (so it can't be called from the constructor), but
     * this function only needs to be called once.
     */
    window.game.TextBox.prototype.computeMetrics = function(ctx) {
        if ( this.computedMetrics ) {
            return;
        }

        this.lines = [];
        this.padding = 5;
        this.fontHeight = 20;
        this.computedMetrics = true;

        this.fontDrawX = this.leftPaddingBeforeText;
        ctx.font = game.MediumFont;
        var maxWidth = this.width - this.padding - this.leftPaddingBeforeText;

        // Split into words.
        var words = this.text.split(' ');

        // Figure out how many lines there will be without going beyond
        // maxWidth.
        var widthSoFar = 0;
        var lineSoFar = '';
        for (var i = 0; i < words.length; i++) {
            var word = words[i];

            widthSoFar += ctx.measureText(word).width;

            // If this word pushed us past the max...
            if ( widthSoFar > maxWidth ) {

                // If it's the only word on the line, then that's now our line;
                // we don't split words except at boundaries.
                if ( lineSoFar == '' ) {
                    this.lines.push(word);
                    widthSoFar = 0;
                } else {
                    // Otherwise, this word will go to the next line.
                    this.lines.push(lineSoFar);
                    lineSoFar = word + ' ';
                    widthSoFar = ctx.measureText(word + ' ').width;
                }
            } else {
                // It fits in this line, so add it to the line string.
                lineSoFar += word + ' ';
                widthSoFar += ctx.measureText(' ').width;
            }
        };

        // If we had some remaining words, throw them in the array too.
        if ( lineSoFar != '' ) {
            this.lines.push(lineSoFar);
        }
        
        // Figure out the height of the whole object now.
        this.heightNeededForLines = this.lines.length * this.fontHeight + this.padding * 2;

        this.height = Math.max(this.minHeight, this.heightNeededForLines);
    };

    /**
     * This is a function to be overridden so that subclasses can add their own
     * draw code for the foreground.
     */
    window.game.TextBox.prototype.drawForeground = function(ctx) {  };

    window.game.TextBox.prototype.draw = function(ctx) {
        ctx.save();

        // We need the ctx before being able to compute the metrics, but we only
        // need to compute them once.
        if ( !this.computedMetrics ) {
            this.computeMetrics(ctx);
        }

        // Draw the background
        ctx.fillStyle = '#373737';
        ctx.globalAlpha = this.backgroundOpacity;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.globalAlpha = this.foregroundOpacity;
        this.drawForeground(ctx);

        // Draw the line(s) of text
        ctx.font = game.MediumFont;
        ctx.textBaseline = 'top';
        ctx.strokeStyle = this.textOutlineColor;
        ctx.fillStyle = this.textColor;
        ctx.lineWidth = 2;
        var startTextY = this.height / 2 - this.heightNeededForLines / 2 + 1;

        // Do two passes over the text.
        // Pass #0: stoke the text for an outline
        // Pass #1: fill the text
        for (var pass = 0; pass < 2; pass++) {

            var textY = startTextY;
            for (var i = 0; i < this.lines.length; i++) {
                var line = this.lines[i];
                if ( pass == 0 ) {
                    ctx.strokeText(line, this.x + this.fontDrawX, this.y + textY);
                } else {
                    ctx.fillText(line, this.x + this.fontDrawX, this.y + textY);
                }
                textY += this.fontHeight;
            };
        };

        // Draw border
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.borderColor;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    
    };

}());