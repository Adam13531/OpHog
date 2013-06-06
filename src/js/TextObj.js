( function() {

    /**
     * This is hard-coded because this class hasn't been polished yet.
     *
     * When this is no longer hard-coded, the height will need to be pulled from
     * the font so that the object can be positioned correctly (search this file
     * for "height").
     */
    window.game.TextObjFont = '12px Futura, Helvetica, sans-serif';
    window.game.BigFont = '40px Futura, Helvetica, sans-serif';

    /**
     * A text object. A nearly infinite amount of polish can go into this class
     * to get it to be much, much flashier, so I'm going to make it as basic as
     * possible and leave it for now.
     * @param {Number} centerX The center X coordinate (in pixels)
     * @param {Number} centerY The center Y coordinate (in pixels)
     * @param {String} text    The text to display
     * @param {Boolean} bigFont If true, this'll make the font big and green
     */
    window.game.TextObj = function TextObj(centerX, centerY, text, bigFont, fontColor) {
        this.text = text;

        this.bigFont = bigFont;

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
     * @return {null}
     */
    window.game.TextObj.prototype.draw = function(ctx) {
        ctx.save();

        ctx.font = this.font;
        var text = this.text;
        var width = ctx.measureText(text).width;

        // We need the canvas in order to position the text since that's what
        // lets us compute width needed.
        if ( !this.hasBeenPositioned ) {
            this.x = this.x - width / 2;
            this.y = this.y - this.height / 2;
            this.hasBeenPositioned = true;
        }

        ctx.textBaseline = 'top';
        ctx.fillStyle = this.fontColor;
        ctx.fillText(text, this.x, this.y);
        ctx.restore();
    };

}());