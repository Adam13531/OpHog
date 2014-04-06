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
     * Constructor.
     * @param {Array:Number} tiles     tiles that make up the puzzle piece. 1
     * means walkable, 0 means not walkable.
     * @param {game.PuzzlePieceType} pieceType Type of puzzle piece
     */
    window.game.PuzzlePiece = function PuzzlePiece(tiles, pieceType) {
        this.tiles = tiles;
        this.pieceType = pieceType;

        /**
         * These arrays describe where the openings are in a piece. For example,
         * if you have this piece:
         *
         * 100
         * 000
         * 100
         *
         * Its leftEdgeOpenings would be [1,0,1] because that's the left edge.
         * @type {Array:Boolean}
         */
        this.leftEdgeOpenings = [];
        this.rightEdgeOpenings = [];
        this.topEdgeOpenings = [];
        this.bottomEdgeOpenings = [];
        this.isBlank = true;

        this.hasLeftOpening = false;
        this.hasRightOpening = false;
        this.hasTopOpening = false;
        this.hasBottomOpening = false;

        // This is the relative weight with which this piece will be chosen. It
        // will always be set by the MapGenerator, so it's pointless to set it
        // here other than to have a place to comment it (plus it's bad coding
        // practice to inject properties into a class after its creation).
        this.relativeWeight = null;

        this.generateEdges();
    };

    /**
     * Gets the number of openings for a given side or sides.
     *
     * E.g.
     * 010
     * 001
     * 001
     *
     * This has 1 UP opening, 2 RIGHT, and 1 DOWN, so if you requested
     * RIGHT|DOWN, you'd get 3 (it counts the bottom-right corner twice).
     * @param  {game.DirectionFlags} directionFlags - bitwise-or'd flags
     * representing which side(s) you want the openings for
     * @return {Number}                - a sum of the numbers of openings on the
     * sides you requested.
     */
    window.game.PuzzlePiece.prototype.getNumOpenings = function(directionFlags) {
        var numOpenings = 0;
        if ( directionFlags & game.DirectionFlags.RIGHT ) numOpenings += game.util.sumArrayValues(this.rightEdgeOpenings);
        if ( directionFlags & game.DirectionFlags.UP ) numOpenings += game.util.sumArrayValues(this.topEdgeOpenings);
        if ( directionFlags & game.DirectionFlags.DOWN ) numOpenings += game.util.sumArrayValues(this.bottomEdgeOpenings);
        if ( directionFlags & game.DirectionFlags.LEFT ) numOpenings += game.util.sumArrayValues(this.leftEdgeOpenings);
        return numOpenings;
    };

    /**
     * Generates all the edges of the puzzle piece. This function needs to be
     * called in order for the puzzle piece to be considered initialized.
     */
    window.game.PuzzlePiece.prototype.generateEdges = function() {

        for (var i = 0; i < game.PUZZLE_PIECE_SIZE; i++) {
            this.leftEdgeOpenings.push(this.tiles[i * game.PUZZLE_PIECE_SIZE] == 1);
            this.rightEdgeOpenings.push(this.tiles[i * game.PUZZLE_PIECE_SIZE + (game.PUZZLE_PIECE_SIZE - 1)] == 1);
            this.topEdgeOpenings.push(this.tiles[i] == 1);
            this.bottomEdgeOpenings.push(this.tiles[i + (game.PUZZLE_PIECE_SIZE * (game.PUZZLE_PIECE_SIZE-1))] == 1);

            if (this.leftEdgeOpenings[i] == 1 ||
                this.rightEdgeOpenings[i] == 1 ||
                this.topEdgeOpenings[i] == 1 ||
                this.bottomEdgeOpenings[i] == 1) {
                this.isBlank = false;
            }

            if (this.leftEdgeOpenings[i] == 1) {
                this.hasLeftOpening = true;
            }

            if (this.rightEdgeOpenings[i] == 1) {
                this.hasRightOpening = true;
            }

            if (this.topEdgeOpenings[i] == 1) {
                this.hasTopOpening = true;
            }

            if (this.bottomEdgeOpenings[i] == 1) {
                this.hasBottomOpening = true;
            }
        };
    };

    /**
     * Prints the puzzle piece to the console.
     * @param  {String} optionalLabel - if specified, this will simply be
     * printed to the console.
     */
    window.game.PuzzlePiece.prototype.print = function(optionalLabel) {
        if ( optionalLabel !== undefined ) {
            console.log(optionalLabel);
        }

        for (var i = 0; i < game.PUZZLE_PIECE_SIZE; i++) {
            var str = '';
            for (var j = 0; j < game.PUZZLE_PIECE_SIZE; j++) {
                str += this.tiles[i * game.PUZZLE_PIECE_SIZE + j];
            };
            console.log(str);
        };
        console.log('');
    };

    /**
     * Puts the puzzle piece into the array the way in which it actually looks
     * like a puzzle piece. For example, Let's say you have a blank map of size
     * 10 x 10 and a puzzle piece of size 5. The blank map will be 2 x 2 in
     * terms of puzzle pieces. It looks like this:
     *
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     * ---------+---------
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     *
     * Here is how the puzzle piece looks:
     *
     * 0 0 1 1 1
     * 0 0 0 0 0 
     * 0 0 1 1 1
     * 0 0 0 0 0
     * 0 0 1 1 1
     *
     * If you call this with x==5 and y==0, the map array will look like this:
     *
     * 0 0 0 0 0|0 0 1 1 1
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 1 1 1
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 1 1 1
     * ---------+---------
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0
     * 0 0 0 0 0|0 0 0 0 0 
     * 
     * @param  {Array:Number} mapArray Map array that will be modified
     * @param  {Number} width    width of the map in tiles
     * @param  {Number} x        Starting x position in tiles of where to add the puzzle piece
     * @param  {Number} y        Starting y position in tiles of where to add the puzzle piece
     */
    window.game.PuzzlePiece.prototype.applyToMapArray = function(mapArray, width, x, y) {
        // Go through each tile in the puzzle piece...
        for (var i = 0; i < this.tiles.length; i++) {

            // Figure out "row" and "column", which are offsets from the
            // beginning of the puzzle piece
            var row = Math.floor(i / game.PUZZLE_PIECE_SIZE);
            var column = i % game.PUZZLE_PIECE_SIZE;

            // Apply our offsets to the passed-in coordinates
            var index2 = (y + row) * width + x + column;
            mapArray[index2] = this.tiles[i];
        }
    };

    /**
     * Figures out if this puzzle piece fits together with the one that is 
     * passed in.
     *
     * Example:
     *  A    B
     * 010  000  
     * 011  110
     * 000  010
     * 
     * A.canFitTogether(B) would return FitFlags.LEFT | FitFlags.BOTTOM
     * @param  {game.PuzzlePiece} otherPuzzlePiece Puzzle piece to be compared to
     * @return {game.DirectionFlags}               Directional flags of how the
     * other piece will fit with this one. This is a bitwise-or'd value from
     * those flags.
    */
    window.game.PuzzlePiece.prototype.canFitTogether = function(otherPuzzlePiece) {
        if ( otherPuzzlePiece == null ||
             otherPuzzlePiece === undefined) return game.DirectionFlags.RIGHT | game.DirectionFlags.LEFT | game.DirectionFlags.UP | game.DirectionFlags.DOWN;

        var directionFlags = 0;

        var canFitRight = true;
        var canFitLeft = true;
        var canFitTop = true;
        var canFitBottom = true;
        for (var i = 0; i < game.PUZZLE_PIECE_SIZE; i++) {
            if ( this.leftEdgeOpenings[i] != otherPuzzlePiece.rightEdgeOpenings[i] ) {
                canFitRight = false;
            }

            if ( this.rightEdgeOpenings[i] != otherPuzzlePiece.leftEdgeOpenings[i] ) {
                canFitLeft = false;
            }

            if ( this.topEdgeOpenings[i] != otherPuzzlePiece.bottomEdgeOpenings[i] ) {
                canFitBottom = false;
            }

            if ( this.bottomEdgeOpenings[i] != otherPuzzlePiece.topEdgeOpenings[i] ) {
                canFitTop = false;
            }
        }

        if ( canFitRight ) directionFlags |= game.DirectionFlags.RIGHT;
        if ( canFitLeft ) directionFlags |= game.DirectionFlags.LEFT;
        if ( canFitBottom ) directionFlags |= game.DirectionFlags.DOWN;
        if ( canFitTop ) directionFlags |= game.DirectionFlags.UP;

        return directionFlags;
    };

}());