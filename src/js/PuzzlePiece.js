( function() {

    window.game.DirectionFlags = {
        UP: 1,    // 0001
        RIGHT: 2, // 0010
        DOWN: 4,  // 0100
        LEFT: 8   // 1000
    };

    window.game.PuzzlePieceType = {
        LEFT: 1,
        MIDDLE: 2,
        RIGHT: 4
    }

    window.game.PUZZLE_PIECE_SIZE = 5; // Length of a side

    window.game.PuzzlePiece = function PuzzlePiece(tiles, pieceType) {
        this.tiles = tiles;
        this.pieceType = pieceType;
        this.leftEdgeOpenings = [];
        this.rightEdgeOpenings = [];
        this.topEdgeOpenings = [];
        this.bottomEdgeOpenings = [];
        this.isBlank = true;

        this.hasLeftOpening = false;
        this.hasRightOpening = false;
        this.hasTopOpening = false;
        this.hasBottomOpening = false;

        this.generateEdges();
    };

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
     * @return {undefined}
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

    window.game.PuzzlePiece.prototype.applyToMapArray = function(mapArray, width, x, y) {
        // Go through each tile in the puzzle piece...
        for (var i = 0; i < this.tiles.length; i++) {

            // Figure out "row" and "column", which are offsets from the beginning of the puzzle piece
            var row = Math.floor(i / game.PUZZLE_PIECE_SIZE);
            var column = i % game.PUZZLE_PIECE_SIZE;

            // Apply our offsets to the passed-in coordinates
            var index2 = (y + row) * width + x + column;
            mapArray[index2] = this.tiles[i];
        }
    };
    /**
    *  A    B
    * 010  000  
    * 011  110
    * 000  010
    *
    * A.canFitTogether(B) would return FitFlags.LEFT | FitFlags.BOTTOM
    * @param  {[type]} otherPuzzlePiece [description]
    * @return {[type]}                  [description]
    */
    window.game.PuzzlePiece.prototype.canFitTogether = function(otherPuzzlePiece) {
        if ( otherPuzzlePiece == null ||
             otherPuzzlePiece === undefined) return game.DirectionFlags.RIGHT | game.DirectionFlags.LEFT | game.DirectionFlags.UP | game.DirectionFlags.DOWN;

        var DirectionFlags = 0;

        // Check the right side of this piece with the left side of the other
        var canFitRight = true;
        var canFitLeft = true;
        var canFitTop = true;
        var canFitBottom = true;
        for (var i = 0; i < game.PUZZLE_PIECE_SIZE; i++) {
            console.log('test');
            if (this.leftEdgeOpenings[i] != otherPuzzlePiece.rightEdgeOpenings[i] ) {
                canFitRight = false;
            }

            if (this.rightEdgeOpenings[i] != otherPuzzlePiece.leftEdgeOpenings[i] ) {
                canFitLeft = false;
            }

            if ( //this.topEdgeOpenings[i] == 1 &&
                 this.topEdgeOpenings[i] != otherPuzzlePiece.bottomEdgeOpenings[i] ) {
                canFitBottom = false;
            }

            if ( //this.bottomEdgeOpenings[i] == 1 &&
                 this.bottomEdgeOpenings[i] != otherPuzzlePiece.topEdgeOpenings[i] ) {
                canFitTop = false;
            }
        }

        if ( canFitRight ) DirectionFlags |= game.DirectionFlags.RIGHT;
        if ( canFitLeft ) DirectionFlags |= game.DirectionFlags.LEFT;
        if ( canFitBottom ) DirectionFlags |= game.DirectionFlags.DOWN;
        if ( canFitTop ) DirectionFlags |= game.DirectionFlags.UP;

        return DirectionFlags;
    };

}());