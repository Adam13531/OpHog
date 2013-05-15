( function() {
    
    // There's only one map generator, so we'll define everything in a single
    // object.
    window.game.MapGenerator = {
    	puzzlePieces: [],

        puzzlePieceConfiguration: [],

        mapArray: [],

        leftColumn: [],

        middleColumn: [],

        rightColumn: [],

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

            this.puzzlePieceConfiguration =  [
            this.puzzlePieces[0],this.puzzlePieces[1],this.puzzlePieces[2],
            this.puzzlePieces[3],this.puzzlePieces[4],this.puzzlePieces[5],
            this.puzzlePieces[6],this.puzzlePieces[7],this.puzzlePieces[8]
            ];
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

        generateLeftColumn: function(height) {
            var choices = [0, 3, 6];
            var x = 0;
            var y = 0;
            var isGood = false;

            for ( var i = 0; i < choices.length; i++ ) {
                var puzzlePiece = this.puzzlePieceConfiguration[choices[Math.floor(Math.random()*choices.length)]];
                if (!puzzlePiece.isBlank) {
                    isGood = true;
                }
                this.leftColumn.push(puzzlePiece);
                puzzlePiece.applyToMapArray(this.mapArray, height, x, y);
                y += game.PUZZLE_PIECE_SIZE;
                if ( y == height ) {
                    y = 0;
                }
            }

            return isGood;
        },

        generateMiddleColumns: function(height) {
            var choices = [1, 4, 7];
            var x = 5;
            var y = 0;

            // Need to get a list of the possible puzzle pieces.
            // This will be based on the one in the column before it and the one directly above it.
            // ALL connections need to have an end.
            // Therefore, the pieces need to check the piece above it
            // and the piece to the left. If those have any exits, then
            // they need to be closed. That is how we will find the valid piece.
            for ( var i = 0; i < choices.length; i++ ) {
                var foundPiece = false;
                var puzzlePiece;
                var flags;
                while (foundPiece == false) {
                    puzzlePiece = this.puzzlePieceConfiguration[choices[Math.floor(Math.random()*choices.length)]];
                    flags = this.leftColumn[i].canFitTogether(puzzlePiece);
                    if (this.leftColumn[i].isBlank &&
                        puzzlePiece.isBlank) {
                        foundPiece = true;
                    }
                    else if (flags & game.FitFlags.LEFT) {
                        foundPiece = true;
                    }
                }
                this.middleColumn.push(puzzlePiece);
                puzzlePiece.applyToMapArray(this.mapArray, height, x, y);
                y += game.PUZZLE_PIECE_SIZE;
                if ( y == height ) {
                    y = 0;
                }
            }
        },

        generateRightColumn: function(height) {
            var choices = [2, 5, 8];
            var x = 10;
            var y = 0;
            for ( var i = 0; i < choices.length; i++ ) {
                var foundPiece = false;
                var puzzlePiece;
                var flags;
                while (foundPiece == false) {
                    puzzlePiece = this.puzzlePieceConfiguration[choices[Math.floor(Math.random()*choices.length)]];
                    flags = this.middleColumn[i].canFitTogether(puzzlePiece);
                    if (this.middleColumn[i].isBlank &&
                        puzzlePiece.isBlank) {
                        foundPiece = true;
                    }
                    else if (flags & game.FitFlags.LEFT) {
                        foundPiece = true;
                    }
                }
                this.leftColumn.push(puzzlePiece);
                puzzlePiece.applyToMapArray(this.mapArray, height, x, y);
                y += game.PUZZLE_PIECE_SIZE;
                if ( y == height ) {
                    y = 0;
                }
            }
        },

    	// TODO: Make sure it is random
    	generateRandomMap: function(width, height, difficulty) {
            // if (size < 9) return 0;
            if (difficulty < 1 || difficulty > 4) return 0;

            // Generate a map array with all zeroes
            var sizeInTiles = width * height;
            // var mapArray = [];
            for (var i = 0; i < sizeInTiles; i++) {
                this.mapArray.push(0);
            };

            // Make sure the left column isn't blank
            var goodLeftColumn = false;
            while (goodLeftColumn == false) {
                if (this.generateLeftColumn(height) == true) {
                    goodLeftColumn = true;
                } 
                else {
                    this.leftColumn.length = 0;
                }
            }
            this.generateMiddleColumns(height);
            this.generateRightColumn(height);

            this.printMap(this.mapArray, width, height);
            return (new game.Map(this.mapArray));
    	}
    };

}());