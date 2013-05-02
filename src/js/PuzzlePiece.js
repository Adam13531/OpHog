( function() {

    window.game.FitFlags = {
        UP: 1,   // 0001
        RIGHT:2, // 0010
        DOWN:4,  // 0100
        LEFT:8   // 1000
    };

    window.game.PUZZLE_PIECE_SIZE = 5; // Length of a side

    window.game.PuzzlePiece = function PuzzlePiece(tiles) {
        // TODO: Should be taken in as an argument or something
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


    // THIS DOES NOT BELONG IN HERE. THIS IS HOW THE CALLER USES THE "canFitTogether" FUNCTION
    // caller = function() {
    //     var fitFlags = piece1.canFitTogether(piece2);
    //     if ( fitFlags & RIGHT ) {
            
    //     }
    //     if ( fitFlags & TOP ) {
            
    //     }
    //     if ( fitFlags & LEFT ) {
            
    //     }


    // }


}());