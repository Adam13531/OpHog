( function() {

    /**
     * The minimap is a PANEL with a movable rectangle over (which I call the
     * VIEW). The VIEW always corresponds to what the camera is looking at.
     *
     * The PANEL itself is can be positioned anywhere.
     *
     * The minimap will only show the paths of the map, not the fog or unit
     * locations (the biggest reason is for performance, but also because the
     * minimap will be a relatively small area on the screen).
     * @type {Object}
     */
    window.game.Minimap = {

        /**
         * The X-coordinate of the PANEL.
         * @type {Number}
         */
        x: 5,

        /**
         * The Y-coordinate of the PANEL.
         * @type {Number}
         */
        y: 5,

        /**
         * The width of the PANEL.
         * @type {Number}
         */
        width: 100,

        /**
         * The height of the PANEL.
         * @type {Number}
         */
        height: 100,

        /**
         * The (x,y,w,h) specifying the VIEW rectangle.
         * @type {Number}
         */
        viewX: 0,
        viewY: 0,
        viewW: 5,
        viewH: 5,

        /**
         * We draw the entire map ONCE to a canvas so that the performance is
         * good.
         * @type {Object}
         */
        minimapCanvas: null,

        /**
         * The context for 'minimapCanvas'.
         * @type {Object}
         */
        minimapCtx: null,

        /**
         * We only need to initialize the canvas a single time. This indicates
         * whether we've already performed that initialization.
         * @type {Boolean}
         */
        initializedCanvas: false,

        /**
         * When you switch to a new map, you should call this function. It will
         * set up the canvas so that it reflects what the map is looking at.
         */
        initialize: function() {
            if ( !this.initializedCanvas ) {
                this.initializedCanvas = true;
                this.minimapCanvas = document.createElement("canvas");

                this.minimapCanvas.width = this.width;
                this.minimapCanvas.height = this.height;

                this.minimapCtx = this.minimapCanvas.getContext("2d");
            }

            this.drawMapToMinimapCanvas();

            this.zoomChanged();
            this.panChanged();
        },

        /**
         * Draws the entire map to the minimap's canvas.
         */
        drawMapToMinimapCanvas: function() {
            var tileWidth = this.width / game.currentMap.numCols;
            var tileHeight = this.height / game.currentMap.numRows;

            // Use "ceil" instead of "round" so that we're guaranteed to draw to
            // every pixel of the minimap's canvas. If we used "round", it might
            // round down, which may leave small gaps between rows/cols.
            tileWidth = Math.ceil(tileWidth);
            tileHeight = Math.ceil(tileHeight);

            for (var y = 0; y < game.currentMap.numRows; y++) {
                for (var x = 0; x < game.currentMap.numCols; x++) {
                    index = y * game.currentMap.numCols + x;
                    tile = game.currentMap.mapTiles[index];

                    if ( tile.isWalkable() ) {
                        this.minimapCtx.fillStyle = 'rgba(0,255,0,1)';
                    } else {
                        this.minimapCtx.fillStyle = 'rgba(37,37,37,1)';
                    }

                    var drawX = Math.round(x * tileWidth);
                    var drawY = Math.round(y * tileHeight);

                    this.minimapCtx.fillRect(drawX, drawY, tileWidth, tileHeight);
                }
            }
        },

        /**
         * Call this when the camera's zoom-level changes. It will update the
         * VIEW rectangle.
         */
        zoomChanged: function() {
            var widthRatio = game.Camera.viewWidth / game.currentMap.widthInPixels;
            var heightRatio = game.Camera.viewHeight / game.currentMap.heightInPixels;

            this.viewW = Math.round(widthRatio * this.width);
            this.viewH = Math.round(heightRatio * this.height);

            this.viewW = Math.min(this.width, this.viewW);
            this.viewH = Math.min(this.height, this.viewH);
        },

        /**
         * Call this when the camera's pan values change. It will update the
         * VIEW rectangle.
         */
        panChanged: function() {
            this.viewX = Math.round(game.Camera.curPanX / game.Camera.maxPanX * (this.width - this.viewW));
            this.viewY = Math.round(game.Camera.curPanY / game.Camera.maxPanY * (this.width - this.viewH));
        },

        /**
         * A debug function that I'll probably never call again.
         */
        printStuff: function() {
            game.util.debugDisplayText('Map dims: (' + game.currentMap.widthInPixels + ', ' + game.currentMap.heightInPixels + ')', 'map dims');
            game.util.debugDisplayText('Max pan: (' + game.Camera.maxPanX + ', ' + game.Camera.maxPanY + ')', 'pan values');
            game.util.debugDisplayText('Camera view: (' + game.Camera.viewWidth + ', ' + game.Camera.viewHeight + ')', 'view values');
            game.util.debugDisplayText('Camera coords: (' + game.Camera.curPanX + ', ' + game.Camera.curPanY + ')', 'cam coords');
            game.util.debugDisplayText('View dims: (' + this.viewW + ', ' + this.viewH + ')', 'view dims');
            game.util.debugDisplayText('View coords: (' + this.viewX + ', ' + this.viewY + ')', 'view coords');
            game.util.debugDisplayText('Tilesize: (' + game.TILESIZE * this.widthRatio + ')', 'ts');
        },

        /**
         * Draw the minimap PANEL.
         * @param  {Object} ctx - the canvas context
         */
        draw: function(ctx) {
            ctx.save();

            // Draw the PANEL rectangle
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Draw the minimap data
            ctx.drawImage(this.minimapCanvas, this.x, this.y);

            // Draw the VIEW rectangle
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x + this.viewX, this.y + this.viewY, this.viewW, this.viewH);

            // Draw a foreground rectangle around the whole minimap
            ctx.strokeStyle = '#aaaaaa';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.restore();
        }
    };
}());
