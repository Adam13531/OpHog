( function() {
    
    // There's only one map generator, so we'll define everything in a single
    // object.
    window.game.MapGenerator = {
    	puzzlePieces: [],

    	generatePuzzlePieces: function() {
    		// Piece 0
        	puzzlePieces.push(this.createBlankPuzzlePiece);
        	// Piece 1
        	puzzlePieces.push(this.createBlankPuzzlePiece);
        	// Piece 2
        	puzzlePieces.push(this.createBlankPuzzlePiece);
        	// Piece 3
        	var piece3Tiles = [
        	0,0,0,0,0,
            0,0,0,0,0,
            0,0,1,1,1,
            0,0,0,0,0,
            0,0,0,0,0,
        	];
        	puzzlePieces.push(new game.PuzzlePiece(piece3Tiles));
        	// Piece 4
        	var piece4Tiles = [
        	0,0,0,0,0,
            0,0,0,0,0,
            1,1,1,1,1,
            0,0,0,0,0,
            0,0,0,0,0,
        	];
        	puzzlePieces.push(new game.PuzzlePiece(piece4Tiles));
        	// Piece 5
        	var piece5Tiles = [
        	0,0,0,0,0,
            0,0,0,0,0,
            1,1,1,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
        	];
        	puzzlePieces.push(new game.PuzzlePiece(piece5Tiles));
			// Piece 6
        	puzzlePieces.push(this.createBlankPuzzlePiece);
        	// Piece 7
        	puzzlePieces.push(this.createBlankPuzzlePiece);
        	// Piece 8
        	puzzlePieces.push(this.createBlankPuzzlePiece);
    	},

    	createBlankPuzzlePiece: function() {
    		
    		var tiles = [
    		0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
    		]; 

    		var puzzePiece = new game.PuzzlePiece(tiles);
    		return (puzzlePiece);
    	},

    	// TODO: Make sure it is random
    	generateMap: function() {

    	}
    };

}());