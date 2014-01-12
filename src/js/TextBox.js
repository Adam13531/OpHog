( function() {

    window.game.TextBox = function TextBox(centerX, centerY, text, useWorldCoordinates) {
        this.text = text;

        this.useWorldCoordinates = useWorldCoordinates;

        // Text objects require a canvas in order to figure out their metrics,
        // so we can't actually position anything here.
        this.hasBeenPositioned = false;
        this.x = centerX;
        this.y = centerY;

        this.opacity = 1;

        // These dimensions will be computed later when we have a canvas context
        this.height = 100;
        this.width = 400;
        this.computedMetrics = false;

        this.padding = 5;
        this.textOutlineColor = '#000';
        this.textColor = '#fff';
        this.borderColor = 'rgba(0,200,0,.75)';

        this.leftPaddingBeforeText = this.padding;
        this.minHeight = 0;
    };

    window.game.TextBox.prototype.update = function(delta) {
        var deltaAsSec = delta / 1000;
        var change = this.speed * deltaAsSec;
    };

    window.game.TextBox.prototype.isDead = function() {
        return false;
    };

    window.game.TextBox.prototype.computeMetrics = function(ctx) {
        if ( this.computedMetrics ) {
            return;
        }

        this.lines = [];
        this.padding = 5;
        this.fontHeight = 20;
        this.computedMetrics = true;
        // var itemSize = this.padding * 2 + game.ITEM_SPRITE_SIZE;
        // this.leftPaddingBeforeText = itemSize;
        // this.minHeight = itemSize;

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

    window.game.TextBox.prototype.preRender = function(ctx) {  };

    window.game.TextBox.prototype.draw = function(ctx) {
        ctx.save();

        // We need the ctx before being able to compute the metrics, but we only
        // need to compute them once.
        if ( !this.computedMetrics ) {
            this.computeMetrics(ctx);
        }


        var x = this.x - this.width / 2;
        var y = this.y - this.height / 2;
        
        // Draw the background
        ctx.fillStyle = '#373737';
        // ctx.globalAlpha = this.opacity / 2;
        ctx.fillRect(x, y, this.width, this.height);

        this.preRender(ctx);

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
                    ctx.strokeText(line, x + this.fontDrawX, y + textY);
                } else {
                    ctx.fillText(line, x + this.fontDrawX, y + textY);
                }
                textY += this.fontHeight;
            };
        };

        // Draw border
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.borderColor;
        ctx.strokeRect(x, y, this.width, this.height);

        ctx.restore();
    
    };

}());