( function() {

    window.game.FitFlags = {
        UP: 1,   // 0001
        RIGHT:2, // 0010
        DOWN:4,  // 0100
        LEFT:8   // 1000
    };

    window.game.PUZZLE_PIECE_SIZE = 5; // Length of a side

    window.game.PuzzlePiece = function PuzzlePiece(tiles) {
        this.tiles = tiles;
        this.leftEdgeOpenings = [];  // [0,0,1,0,0]
        this.rightEdgeOpenings = []; // [0 1 0 0 0]
        this.topEdgeOpenings = [];   // [0,0,0,0,0]
        this.bottomEdgeOpenings = [];// [0,0,0,0,0]

        this.generateEdges();
    };

    window.game.PuzzlePiece.prototype.generateEdges = function() {

        for (var i = 0; i < game.PUZZLE_PIECE_SIZE; i++) {
            this.leftEdgeOpenings.push(this.tiles[i * game.PUZZLE_PIECE_SIZE] == 1);
            this.rightEdgeOpenings.push(this.tiles[i * game.PUZZLE_PIECE_SIZE + (game.PUZZLE_PIECE_SIZE - 1)] == 1);
            this.topEdgeOpenings.push(this.tiles[i] == 1);
            this.bottomEdgeOpenings.push(this.tiles[i + (game.PUZZLE_PIECE_SIZE * (game.PUZZLE_PIECE_SIZE-1))] == 1);
        };
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

    window.game.PuzzlePiece.prototype.canFitTogether = function(otherPuzzlePiece) {
        var fitFlags = 0;

        // Check the right side of this piece with the left side of the other
        var canFitRight = true;
        var canFitLeft = true;
        var canFitTop = true;
        var canFitBottom = true;
        for (var i = 0; i < this.leftEdgeOpenings.length; i++) {
            if ( this.leftEdgeOpenings[i] != otherPuzzlePiece.rightEdgeOpenings[i] ) {
                canFitRight = false;
                // break;
            }

            if ( this.rightEdgeOpenings[i] != otherPuzzlePiece.leftEdgeOpenings[i] ) {
                canFitLeft = false;
                // break;
            }

            if ( this.topEdgeOpenings[i] != otherPuzzlePiece.bottomEdgeOpenings[i] ) {
                canFitBottom = false;
                // break;
            }

            if ( this.bottomEdgeOpenings[i] != otherPuzzlePiece.topEdgeOpenings[i] ) {
                canFitTop = false;
                // break;
            }
        }

        if ( canFitRight ) fitFlags |= RIGHT;
        if ( canFitLeft ) fitFlags |= LEFT;
        if ( canFitBottom ) fitFlags |= BOTTOM;
        if ( canFitTop ) fitFlags |= TOP;
        console.log("TEST");

        // TODO: Testing
        if ( fitFlags & RIGHT ) {
            console.log("RIGHT");
        }
        if ( fitFlags & TOP ) {
            console.log("TOP");
        }
        if ( fitFlags & LEFT ) {
            console.log("LEFT");
        }
        if ( fitFlags & BOTTOM ) {
            console.log("BOTTOM");
        }

        return fitFlags;
    };

}());