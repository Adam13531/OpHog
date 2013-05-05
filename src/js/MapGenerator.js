( function() {
    
    // There's only one map generator, so we'll define everything in a single
    // object.
    window.game.MapGenerator = {
    	puzzlePieces: [],

    	init: function() {
    		// Piece 0
        	this.puzzlePieces.push(this.createBlankPuzzlePiece());
        	// Piece 1
        	this.puzzlePieces.push(this.createBlankPuzzlePiece());
        	// Piece 2
        	this.puzzlePieces.push(this.createBlankPuzzlePiece());
        	// Piece 3
        	var piece3Tiles = [
        	0,0,0,0,0,
            0,0,0,0,0,
            0,0,1,1,1,
            0,0,0,0,0,
            0,0,0,0,0,
        	];
        	this.puzzlePieces.push(new game.PuzzlePiece(piece3Tiles));
        	// Piece 4
        	var piece4Tiles = [
        	0,0,0,0,0,
            0,0,0,0,0,
            1,1,1,1,1,
            0,0,0,0,0,
            0,0,0,0,0,
        	];
        	this.puzzlePieces.push(new game.PuzzlePiece(piece4Tiles));
        	// Piece 5
        	var piece5Tiles = [
        	0,0,0,0,0,
            0,0,0,0,0,
            1,1,1,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
        	];
        	this.puzzlePieces.push(new game.PuzzlePiece(piece5Tiles));
			// Piece 6
        	this.puzzlePieces.push(this.createBlankPuzzlePiece());
        	// Piece 7
        	this.puzzlePieces.push(this.createBlankPuzzlePiece());
        	// Piece 8
        	this.puzzlePieces.push(this.createBlankPuzzlePiece());
    	},

    	createBlankPuzzlePiece: function() {
    		
    		var tiles = [
    		0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
    		]; 

    		var puzzlePiece = new game.PuzzlePiece(tiles);
    		return (puzzlePiece);
    	},

        getPuzzlePiece: function(index) {
            return this.puzzlePieces[index];
        },

        // applyPuzzlePiece: function(mapArray, puzzlePiece, width, x, y) {
        //     // this would obviously be defined elsewhere
        //     // var PUZZLEPIECESIZE = 3;
        //     // var tiles = [
        //     // 1, 2 ,3,
        //     // 0, 4 ,0,
        //     // 0 ,5 ,0];

        //     // Go through each tile in the puzzle piece...
        //     for (var i = 0; i < puzzlePiece.tiles.length; i++) {

        //         // Figure out "row" and "column", which are offsets from the beginning of the puzzle piece
        //         var row = Math.floor(i / game.PUZZLE_PIECE_SIZE);
        //         var column = i % game.PUZZLE_PIECE_SIZE;

        //         // Apply our offsets to the passed-in coordinates
        //         var index2 = (y + row) * width + x + column;
        //         mapArray[index2] = puzzlePiece.tiles[i];
        //     }
        // },

        // TODO: for debugging
        printMap: function(mapArray, width, height) {
            // Print the map
            for (var i = 0; i < height; i ++ ) {
                rowStr = '';
                for ( var j = 0; j < width; j ++ ) {
                    if ( j > 0 ) rowStr += ' ';
                    rowStr += mapArray[i * width + j];
                }
                console.log(rowStr);
            }
        },

    	// TODO: Make sure it is random
    	generateRandomMap: function(width, height, difficulty) {
            // if (size < 9) return 0;
            if (difficulty < 1 || difficulty > 4) return 0;

            // Generate a map array with all zeroes
            var sizeInTiles = width * height;
            var mapArray = [];
            for (var i = 0; i < sizeInTiles; i++) {
            mapArray.push(0);
            };

            var puzzlePieceConfiguration =  [
            this.puzzlePieces[0],this.puzzlePieces[1],this.puzzlePieces[2],
            this.puzzlePieces[3],this.puzzlePieces[4],this.puzzlePieces[5],
            this.puzzlePieces[6],this.puzzlePieces[7],this.puzzlePieces[8]
            ];

            var x = 0;
            var y = 0;
            for ( var i = 0; i < puzzlePieceConfiguration.length; i ++ ) {
                var puzzlePiece = puzzlePieceConfiguration[i];
                // this.applyPuzzlePiece(mapArray, puzzlePiece, width, x, y);
                puzzlePiece.applyToMapArray(mapArray, width, x, y);
                x += game.PUZZLE_PIECE_SIZE;
                if ( x == width ) {
                    x = 0;
                    y += game.PUZZLE_PIECE_SIZE;
                }
            }

            this.printMap(mapArray, width, height);
            return (new game.Map(mapArray));

              // Use this later when the maps get generated randomly
            // caller = function() {
            //     var fitFlags = piece1.canFitTogether(piece2);
            //     if ( fitFlags & RIGHT ) {
                    
            //     }
            //     if ( fitFlags & TOP ) {
                    
            //     }
            //     if ( fitFlags & LEFT ) {
                    
            //     }


            // }
    	}
    };

}());