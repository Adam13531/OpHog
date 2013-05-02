( function() {

    window.game.FitFlags = {
        UP: 1,   // 0001
        RIGHT:2, // 0010
        DOWN:4,  // 0100
        LEFT:8   // 1000
    };

    window.game.PUZZLE_PIECE_SIZE = 5; // Length of a side

    window.game.PuzzlePiece = function PuzzlePiece() {
        this.tiles = [
            0,0,0,0,0,
            0,0,1,1,1,
            1,1,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
        ];

        this.generateEdges();
    };

    window.game.PuzzlePiece.prototype.generateEdges = function() {
        this.leftEdgeOpenings = [];  // [0,0,1,0,0]
        this.rightEdgeOpenings = []; // [0 1 0 0 0]
        this.topEdgeOpenings = [];   // [0,0,0,0,0]
        this.bottomEdgeOpenings = [];// [0,0,0,0,0]

        for (var i = 0; i < PUZZLE_PIECE_SIZE; i++) {
            this.leftEdgeOpenings.push(this.tiles[i * PUZZLE_PIECE_SIZE] == 1);
        };

        // etc. for the other edges
    };

    window.game.PuzzlePiece.prototype.canFitTogether = function(otherPuzzlePiece) {
        var fitFlags = 0;

        // Check the right side of this piece with the left side of the other
        var canFitRight = true;
        for (var i = 0; i < this.leftEdgeOpenings.length; i++) {
            if ( this.leftEdgeOpenings[i] != otherPuzzlePiece.rightEdgeOpenings[i] ) {
                canFitRight = false;
                break;
            }
        };
        // etc. for the other edges

        if ( canFitRight ) fitFlags | = RIGHT;
        if ( canFitLeft ) fitFlags | = LEFT;
        // etc. for the other edges

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