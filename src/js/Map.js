( function() {
    /**
     * Arguments would eventually be passed to this class, but for now, we only
     * have one map, so it'll go here. Note that you should call
     * game.Camera.computeScrollBoundaries(); when you load a map for real.
     */
    window.game.Map = function Map(arrayOfOnesAndZeroes) {
        var mapTilesIndices = [];
        for (var i = 0; i < arrayOfOnesAndZeroes.length; i++) {
            mapTilesIndices.push((arrayOfOnesAndZeroes[i] == 0) ? 5 : 88);
        };


        /**
         * The tiles representing this map.
         * @type {Array:Tile}
         */
        this.mapTiles = [];
        for (var i = 0; i < mapTilesIndices.length; i++) {
            var index = mapTilesIndices[i];
            this.mapTiles.push(new game.Tile(index));
        };

        /**
         * Array of booleans representing whether there's fog over a tile.
         * @type {Array:Boolean}
         */
        this.fog = [];
        for (var i = 0; i < this.mapTiles.length; i++) {
            this.fog.push(false);
        };

        // this.numCols = 25;
        this.numCols = 15;
        this.numRows = this.mapTiles.length / this.numCols;

        // Clear some fog around the spawners. These coordinates are hard-coded
        // for now.
        this.setFog(1,3,3,false);
        this.setFog(1,9,3,false);
        this.setFog(1,15,3,false);

        // This puts a single generator on the middle of the path. Leaving this
        // here for testing purposes
        // var generatorCoords = [[21,9]];

        // Coordinates of generators        
        var generatorCoords = [[8,3], [13,3], [9,9], [15,9], [18,9], [8,15], [14,15]];

        // Make generators at each spot
        for (var i = 0; i < generatorCoords.length; i++) {
            var x = generatorCoords[i][0];
            var y = generatorCoords[i][1];
            var generator = new game.Generator(x, y);
            game.GeneratorManager.addGenerator(generator);
        };
    };

    /**
     * Draws this map.
     * @param  {Object} ctx The canvas context
     * @param {Boolean} drawingFogLayer If true, then the map will be drawn
     * wherever there is fog. If false, the map will be drawn EXCEPT where there
     * is fog. This is for performance, otherwise we'd be drawing the map twice
     * despite that it won't show the first time since it's under fog.
     * @return {null}
     */
    window.game.Map.prototype.draw = function(ctx, drawingFogLayer) {
        var index;
        var graphic;
        var tile;
        ctx.fillStyle = 'rgba(0,0,0,1)';
        for (var y = 0; y < this.numRows; y++) {
            for (var x = 0; x < this.numCols; x++) {
                index = y * this.numCols + x;
                tile = this.mapTiles[index];
                graphic = tile.graphicIndex;
                
                if ( drawingFogLayer ) {
                    if ( this.fog[index] ) {

                        // Draw black in the background for now since there's no
                        // background beneath our map to begin with. TODO: we
                        // should be able to remove this eventually and not see
                        // units show up behind castles.
                        ctx.fillRect(0, 0, tileSize, tileSize);
                        envSheet.drawSprite(ctx, graphic, 0,0);
                    }
                } else {
                    // If there's no fog here and we're not drawing the fog
                    // layer, then we just draw the map normally.
                    if ( !this.fog[index] ) {
                        envSheet.drawSprite(ctx, graphic, 0,0);
                    }
                }

                ctx.translate(tileSize, 0);
            }
            ctx.translate(-tileSize * this.numCols, tileSize);
        }
    };

    /**
     * Draws the map, then draws a slightly opaque black layer. Both of these
     * things are done ONLY where there is fog.
     *
     * I suggest commenting this function out completely if you want to see
     * what's really happening with our map-drawing logic.
     * @param  {Object} ctx - the canvas context
     * @return {null}
     */
    window.game.Map.prototype.drawFog = function(ctx) {
        // Draw the map on top of anything that was previously drawn (e.g.
        // characters, items).
        ctx.save();
        this.draw(ctx, true);
        ctx.restore();

        // Draw just the fog itself now
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        for (var y = 0; y < this.numRows; y++) {
            for (var x = 0; x < this.numCols; x++) {
                if ( this.fog[y * this.numCols + x] ) {
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
        ctx.restore();
    };

    /**
     * Sets or clears fog in an area.
     * @param {Number} x      - x coordinate in tiles
     * @param {Number} y      - y coordinate in tiles
     * @param {Number} radius - distance from (x,y) to set/clear fog
     * @param {Boolean} foggy  - if true, this will MAKE fog of war. If false,
     * it will clear it.
     * @param {Boolean} drawCircular - if true, this will draw a diamond/circle
     * shape, if false, it will draw a square
     */
    window.game.Map.prototype.setFog = function(x, y, radius, foggy, drawCircular) {
        var index;
        for (var i = x - radius; i < x + radius + 1; i++) {
            for (var j = y - radius; j < y + radius + 1; j++) {

                // Ignore anything that's out of bounds
                if ( i < 0 || j < 0 || i >= this.numCols || j >= this.numRows ) continue;

                // Check Manhattan distance
                if ( drawCircular && Math.abs(x - i) + Math.abs(y - j) > radius ) continue;

                index = (i % this.numCols) + j * this.numCols;
                this.fog[index] = foggy;
            };
        };
    };

    /**
     * Tells whether or not the tiles passed in point to a spawner point
     * @param  {Number}  tileX Tile X coordinate
     * @param  {Number}  tileY Tile Y coordinate
     * @return {Boolean}        Returns true if the point is a spawning point,
     *                                  otherwise returns false
     */
    window.game.Map.prototype.isSpawnerPoint = function(tileX, tileY) {
        var index = tileY * this.numCols + tileX;
        return this.mapTiles[index].isSpawnerPoint;
    };

}());