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
         * The position of the minimap panel. This should always be a corner
         * (e.g. LEFT | UP, RIGHT | DOWN, etc.).
         * @type {game.DirectionFlags}
         */
        position: game.MINIMAP_DEFAULT_POSITION,

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
         * This is used by the drag event handler to keep track of where the
         * mouse was when you started dragging. It contains two numbers: origX
         * and origY, which are offsets from the minimap's upper-left (which
         * means it already took the minimap's coordinates into account).
         * @type {Object}
         */
        dragStartPos: {},

        /**
         * Indicates whether the minimap is visible.
         * @type {Boolean}
         */
        visible: game.MINIMAP_DEFAULT_VISIBILITY,

        /**
         * When you switch to a new map, you should call this function. It will
         * set up the canvas so that it reflects what the map is looking at.
         *
         * This should be called after the Camera is initialized.
         */
        initialize: function() {
            if ( !this.initializedCanvas ) {
                this.initializedCanvas = true;
                this.minimapCanvas = document.createElement("canvas");

                this.minimapCanvas.width = this.width;
                this.minimapCanvas.height = this.height;

                this.minimapCtx = this.minimapCanvas.getContext("2d");

                // Set the initial minimap position
                this.setPanelPosition(this.position);
            }

            this.drawMapToMinimapCanvas();

            this.zoomChanged();
            this.panChanged();
        },

        /**
         * When the browser size changes, call this function. It will adjust the
         * position of the minimap so that it isn't offscreen.
         */
        browserSizeChanged: function() {
            this.setPanelPosition(this.position, false);
        },

        /**
         * Positions the panel according to the direction passed in.
         *
         * The Camera needs to have been initialized before this can be called.
         * @param {game.DirectionFlags} directionFlags - OR'd directions.
         * @param {Boolean} restoreIfHidden - if true, this will make the
         * minimap visible. That way, when you move the minimap, it
         * auto-restores so that you realize what you just did.
         */
        setPanelPosition: function(directionFlags, restoreIfHidden) {
            var PADDING = 5;
            var APPROXIMATE_BUTTON_WIDTH = 25;

            // If we don't set anything below, then these will be the final
            // coordinates.
            var x = PADDING;
            var y = PADDING;

            this.position = directionFlags;

            var rightFlagSet = (directionFlags & game.DirectionFlags.RIGHT) != 0;
            var downFlagSet = (directionFlags & game.DirectionFlags.DOWN) != 0;
            var upFlagSet = (directionFlags & game.DirectionFlags.UP) != 0;

            if ( rightFlagSet ) x = game.canvasWidth - this.width - PADDING - APPROXIMATE_BUTTON_WIDTH;
            if ( downFlagSet ) y = game.canvasHeight - this.height - PADDING;

            // If it's at the upper right, then we have to make sure the minimap
            // doesn't cover the settings button.
            if ( rightFlagSet && upFlagSet ) x -= PADDING + APPROXIMATE_BUTTON_WIDTH;

            if ( restoreIfHidden ) this.visible = true;

            this.setPanelPositionViaCoords(x, y);
        },

        /**
         * Position the minimap panel to the specified screen coordinates.
         * @param {Number} x - X, in screen coordinates
         * @param {Number} y - Y, in screen coordinates
         */
        setPanelPositionViaCoords: function(x,y) {
            this.x = x;
            this.y = y;

            // Update the location of the restore button.
            this.setVisible(this.visible);
        },

        /**
         * Toggle the visibility of the minimap.
         */
        toggleVisibility: function() {
            this.setVisible(!this.visible);
        },

        /**
         * Set the visibility of the minimap. This also modifies the position
         * and icon of the minimize/restore button.
         * @param {Boolean} visibility - if true, show the minimap.
         */
        setVisible: function(visibility) {
            var $toggleMinimapVisibility = $('#toggleMinimapVisibility');
            this.visible = visibility;

            // Change the icon and positioning
            var icon = this.visible ? 'ui-icon-minus' : 'ui-icon-arrow-4-diag';
            var leftPosition = this.visible ? this.width + 2 : 0;
            $toggleMinimapVisibility.button( 'option', 'icons', { primary: icon } );

            // Default position for the minimize/restore button is to the right of the minimap.
            var top = this.y - 5;
            var left = this.x + leftPosition;

            // Always set the minimize/restore button to be in a corner of the
            // screen when the minimap is hidden.
            if ( !this.visible ) {
                if ( (this.position & game.DirectionFlags.RIGHT) != 0 ) left += this.width;
                if ( (this.position & game.DirectionFlags.DOWN) != 0 ) top += this.height - $toggleMinimapVisibility.height();
            }

            $toggleMinimapVisibility.css({
                top: top + 'px',
                left: left + 'px'
            });
        },

        /**
         * Draws the entire map to the minimap's canvas.
         *
         * I'm going to explain the ceil/floor stuff that's going on in this
         * comment instead of down below. We're taking a large map and trying to
         * draw it accurately in a small space. Normally, this would work fine,
         * because we would use nearly exact ratios, e.g. drawing 2 tiles of
         * size 48 into a minimap of size 20 would mean that each pixel in the
         * minimap represents 2.4 pixels in the map. However, some browsers
         * don't like it when you draw to decimal values (e.g. drawing at x==2.4
         * could create a shearing effect).
         *
         * So if the size SHOULD be 2.4, we instead draw at the rounded
         * coordinate: 2. The next loop, we SHOULD be drawing at 4.8, so it
         * rounds to 5. After that, it SHOULD be 7.2, so it's 7. The differences
         * between this series ([0,2,5,7,10,12,14...]) are [2,3,2,3,2,2,...].
         * Those differences are the sizes we must use when drawing. The
         * algorithm below will compute them correctly by checking to see if the
         * next hop is equal to the Math.ceil value, and if so, it will
         * increment the size.
         */
        drawMapToMinimapCanvas: function() {
            var tileWidth = this.width / game.currentMap.numCols;
            var tileHeight = this.height / game.currentMap.numRows;

            var ceilTileWidth = Math.ceil(tileWidth);
            var ceilTileHeight = Math.ceil(tileHeight);
            var floorTileWidth = Math.floor(tileWidth);
            var floorTileHeight = Math.floor(tileHeight);

            // Clear the context first
            this.minimapCtx.clearRect(0, 0, this.width, this.height);

            for (var y = 0; y < game.currentMap.numRows; y++) {
                for (var x = 0; x < game.currentMap.numCols; x++) {
                    index = y * game.currentMap.numCols + x;
                    tile = game.currentMap.mapTiles[index];

                    if ( tile.isWalkable() ) {
                        this.minimapCtx.fillStyle = 'rgba(0,255,0,.55)';
                    } else {
                        this.minimapCtx.fillStyle = 'rgba(37,37,37,.55)';
                    }

                    var drawX = Math.round(x * tileWidth);
                    var drawY = Math.round(y * tileHeight);

                    var width = floorTileWidth;
                    var height = floorTileHeight;

                    // If the rounded value is always going to be the same, then
                    // ignore the computation below.
                    if ( ceilTileWidth != floorTileWidth ) {
                        var nextIncrementX = Math.round((x + 1) * tileWidth);
                        if ( nextIncrementX - drawX == ceilTileWidth ) width++;
                    }

                    if ( ceilTileHeight != floorTileHeight ) {
                        var nextIncrementY = Math.round((y + 1) * tileHeight);
                        if ( nextIncrementY - drawY == ceilTileHeight ) height++;
                    }

                    this.minimapCtx.fillRect(drawX, drawY, width, height);
                }
            }
        },

        /**
         * @param  {Number} x - X, in screen coordinates
         * @param  {Number} y - Y, in screen coordinates
         * @return {Boolean} - true if the specified point is in the minimap
         * boundaries.
         */
        pointInMinimap: function(x, y) {
            return game.util.pointInRect(x, y, this.x, this.y, this.width, this.height);
        },

        /**
         * Centers the minimap on the specified coordinates.
         * @param  {Number} x - X, in screen coordinates
         * @param  {Number} y - Y, in screen coordinates
         */
        centerMinimapOn: function(x, y) {
            // Convert to minimap coordinates
            x -= this.x;
            y -= this.y;

            // Convert to world coordinates
            var worldX = (x / this.width) * game.currentMap.widthInPixels;
            var worldY = (y / this.height) * game.currentMap.heightInPixels;

            // Scroll to the world coordinates
            game.Camera.panInstantlyTo(worldX, worldY, true);
        },

        /**
         * Handles what happens when a drag event starts over the minimap.
         * @param  {Object} event - the drag event
         */
        handleDragStart: function(event) {

            // Simply set the starting position.
            this.dragStartPos = {
                origX: event.gesture.center.pageX - this.x,
                origY: event.gesture.center.pageY - this.y
            };
        },

        /**
         * Handles what happens when you continuously drag over the minimap.
         *
         * For this to be triggered, a drag must be started over the minimap, so
         * if you start dragging on another canvas or a DOM element and move the
         * mouse over the minimap, this will not be triggered.
         * @param  {Object} event - the drag event
         */
        handleDragEvent: function(event) {
            // Shorthand
            var deltaX = event.gesture.deltaX;
            var deltaY = event.gesture.deltaY;

            // Get the original drag positions (which are already in minimap
            // coordinates).
            var origX = this.dragStartPos.origX;
            var origY = this.dragStartPos.origY;

            // Convert to world coordinates
            var finalX = Math.max(0, (origX + deltaX)) / this.width * game.currentMap.widthInPixels;
            var finalY = Math.max(0, (origY + deltaY)) / this.height * game.currentMap.heightInPixels;

            // Scroll to those coordinates
            game.Camera.panInstantlyTo(finalX, finalY, true);
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
            if ( !this.visible ) return;

            ctx.save();

            // Draw the minimap data, which acts as our background
            ctx.drawImage(this.minimapCanvas, this.x, this.y);

            // Draw the VIEW rectangle
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x + this.viewX, this.y + this.viewY, this.viewW, this.viewH);

            // Draw a foreground rectangle around the whole minimap
            ctx.strokeStyle = '#aaaaaa';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.restore();
        }
    };
}());
