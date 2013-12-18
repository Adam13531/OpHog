( function(){
    
    /**
     * An animated sprite is basically just a set of graphic indices.
     * @param {SpriteSheet} spriteSheet    - the spritesheet to source the
     * graphic indices from.
     * @param {Array:Number} graphicIndices - the graphic indices
     * @param {Number} x              - world coordinates
     * @param {Number} y              - world coordinates
     * @param {Number} msPerFrame     - number of ms to spend per frame
     */
    window.game.AnimatedSprite = function AnimatedSprite(spriteSheet, graphicIndices, x, y, msPerFrame) {
        this.spriteSheet = spriteSheet;
        this.graphicIndices = graphicIndices;
        this.currentIndex = 0;
        this.msPerFrame = msPerFrame;
        this.timeUntilNextFrame = this.msPerFrame;
        this.isDead = false;
        this.x = x;
        this.y = y;

        this.size = this.spriteSheet.tileSize;

        // If the size is different from the size of a unit, then we need to
        // offset this sprite.
        this.x -= (this.size - game.TILESIZE) / 2;
        this.y -= (this.size - game.TILESIZE) / 2;
    };

    /**
     * Advance to next frame or set 'isDead' if finished.
     * @param  {Number} delta - number of ms passed since this was last called
     */
    window.game.AnimatedSprite.prototype.update = function(delta) {
        if ( this.isDead ) return;

        this.timeUntilNextFrame -= delta;

        if ( this.timeUntilNextFrame <= 0 ) {
            this.currentIndex++;
            this.timeUntilNextFrame = this.msPerFrame;
            if ( this.currentIndex == this.graphicIndices.length ) {
                this.isDead = true;
            }
        }
    };

    window.game.AnimatedSprite.prototype.draw = function(ctx) {
        if ( this.isDead ) return;
        
        var graphicIndex = this.graphicIndices[this.currentIndex];
        this.spriteSheet.drawSprite(ctx, graphicIndex, this.x, this.y);
    };

}());