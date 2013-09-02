( function() {

    /**
     * A very simple class to hold a rectangle and a function so that the
     * portrait UI can put buttons wherever it wants and not have to rely on
     * weird tricks to figure out which one was clicked.
     *
     * Ideally, this would have draw and update code and everything instead of
     * just a function.
     */
    window.game.PortraitUIButton = function PortraitUIButton(x, y, w, h, callback) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.callback = callback;

        // Compute right and bottom for convenience.
        this.right = this.x + this.w;
        this.bottom = this.y + this.h;

        this.centerX = this.x + this.w / 2;
        this.centerY = this.y + this.h / 2;
        this.centerTileX = Math.floor(this.centerX / game.TILESIZE);
        this.centerTileY = Math.floor(this.centerY / game.TILESIZE);
    };
}());
