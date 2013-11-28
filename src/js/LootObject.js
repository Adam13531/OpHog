( function() {

    /**
     * A class representing a row in the loot UI.
     */
    window.game.LootObject = function LootObject(item, originalQuantity, didFit) {
        /**
         * Time to live in seconds.
         * @type {Number}
         */
        this.ttl = game.NUM_SEC_TO_SHOW_OBTAINED_ITEMS;
        this.item = item;
        this.graphicIndex = this.item.getGraphicIndex();
        this.opacity = 1;

        // These dimensions will be computed later when we have a canvas context
        this.height = 100;
        this.width = 400;
        this.computedMetrics = false;

        this.padding = 5;
        this.computeItemText(originalQuantity, didFit);
    };

    /**
     * The canvas context is required to be able to measure the text, but this
     * function only needs to be called once.
     *
     * This function figures out how to break up the text so that it fits in the
     * notification. It can also resize this loot object.
     */
    window.game.LootObject.prototype.computeMetrics = function(ctx) {
        if ( this.computedMetrics ) {
            return;
        }

        this.lines = [];
        this.padding = 5;
        this.fontHeight = 20;
        this.computedMetrics = true;
        var itemSize = this.padding * 2 + game.ITEM_SPRITE_SIZE;
        this.fontDrawX = itemSize;
        ctx.font = game.MediumFont;
        var maxWidth = this.width - this.padding - itemSize;

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

        this.height = Math.max(itemSize, this.heightNeededForLines);
    };

    /**
     * Figures out what the text of this object should read. For argument
     * comments, see the caller of this function.
     */
    window.game.LootObject.prototype.computeItemText = function(originalQuantity, didFit) {
        this.text = 'Obtained ' + this.item.name;
        if ( this.item.stackable ) {
            if ( !originalQuantity ) {
                originalQuantity = item.quantity;
            }
            this.text += ' (' + originalQuantity + ')';
        }
        if ( !didFit ) {
            this.text += ' - not enough room in inventory!';
        }
    };

    window.game.LootObject.prototype.draw = function(x, y, ctx) {
        ctx.save();

        // We need the ctx before being able to compute the metrics, but we only
        // need to compute them once.
        if ( !this.computedMetrics ) {
            this.computeMetrics(ctx);
        }
        
        // Draw the background
        ctx.fillStyle = '#373737';
        ctx.globalAlpha = this.opacity / 2;
        ctx.fillRect(x, y, this.width, this.height);

        // Draw the item
        ctx.globalAlpha = this.opacity;
        itemSheet.drawSprite(ctx, this.graphicIndex, x + this.padding, y + this.height / 2 - game.ITEM_SPRITE_SIZE / 2);

        // Draw the line(s) of text
        ctx.font = game.MediumFont;
        ctx.textBaseline = 'top';
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#fff';
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
                    ctx.strokeText(line, x + this.fontDrawX, y + textY);
                } else {
                    ctx.fillText(line, x + this.fontDrawX, y + textY);
                }
                textY += this.fontHeight;
            };
        };

        // Draw border
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(0,200,0,.75)';
        ctx.strokeRect(x, y, this.width, this.height);

        ctx.restore();
    };

}());
