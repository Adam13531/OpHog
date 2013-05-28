( function() {
    
    // There's only one map generator, so we'll define everything in a single
    // object.
    window.game.MapGenerator = {
    	puzzlePieces: [],

        mapArray: [],

        previousColumn: [],

        leftColumn: [],

        middleColumn: [],

        rightColumn: [],

        mapWidth: 0,
        mapHeight: 0,
        mapDifficulty: 0,

        // puzzle pieces can only have ONE opening per side!
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
        	this.puzzlePieces.push(new game.PuzzlePiece(piece3Tiles, game.PuzzlePieceType.LEFT));
        	// Piece 4
        	var piece4Tiles = [
        	0,0,0,0,0,
            0,0,0,0,0,
            1,1,1,1,1,
            0,0,0,0,0,
            0,0,0,0,0,
        	];
        	this.puzzlePieces.push(new game.PuzzlePiece(piece4Tiles, game.PuzzlePieceType.MIDDLE));
        	// Piece 5
        	var piece5Tiles = [
        	0,0,0,0,0,
            0,0,0,0,0,
            1,1,1,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
        	];
        	this.puzzlePieces.push(new game.PuzzlePiece(piece5Tiles, game.PuzzlePieceType.RIGHT));
			// Piece 6
            var piece6Tiles = [
            0,0,0,0,0,
            0,0,0,0,0,
            1,1,0,1,1,
            0,1,1,1,0,
            0,0,1,0,0,
            ];
        	this.puzzlePieces.push(new game.PuzzlePiece(piece6Tiles, game.PuzzlePieceType.MIDDLE));
        	// Piece 7
            var piece7Tiles = [
            0,0,1,0,0,
            0,0,1,0,0,
            0,0,1,1,1,
            0,0,0,0,0,
            0,0,0,0,0,
            ];
        	this.puzzlePieces.push(new game.PuzzlePiece(piece7Tiles, game.PuzzlePieceType.MIDDLE));
        	// Piece 8
        	var piece8Tiles = [
            0,0,1,0,0,
            0,0,1,0,0,
            1,1,1,1,1,
            0,0,0,0,0,
            0,0,0,0,0,
            ];
            this.puzzlePieces.push(new game.PuzzlePiece(piece8Tiles, game.PuzzlePieceType.MIDDLE));
    	},

    	createBlankPuzzlePiece: function() {
    		
    		var tiles = [
    		0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
            0,0,0,0,0,
    		]; 

    		var puzzlePiece = new game.PuzzlePiece(tiles, game.PuzzlePieceType.LEFT | 
                                                          game.PuzzlePieceType.MIDDLE | 
                                                          game.PuzzlePieceType.RIGHT);
    		return (puzzlePiece);
    	},

        getPuzzlePiece: function(index) {
            return this.puzzlePieces[index];
        },

        // TODO: for debugging
        printMap: function() {
            // Print the map
            for (var i = 0; i < this.mapHeight; i ++ ) {
                rowStr = '';
                for ( var j = 0; j < this.mapWidth; j ++ ) {
                    if ( j > 0 ) rowStr += ' ';
                    rowStr += this.mapArray[i * this.mapWidth + j];
                }
                console.log(rowStr);
            }
        },

        getPossiblePuzzlePieces: function(puzzlePiece, flagsWanted, openingsNotWanted, puzzlePieceType) {
            var possiblePuzzlePiecesList = [];

            var leftFlagNeeded = false;
            var rightFlagNeeded = false;
            var topFlagNeeded = false;
            var bottomFlagNeeded = false;

            var leftOpeningNotWanted = false;
            var rightOpeningNotWanted = false;
            var topOpeningNotWanted = false;
            var bottomOpeningNotWanted = false;

            if (flagsWanted & game.FitFlags.LEFT) {
                leftFlagNeeded = true;
            }
            if (flagsWanted & game.FitFlags.RIGHT) {
                rightFlagNeeded = true;
            }
            if (flagsWanted & game.FitFlags.UP) {
                topFlagNeeded = true;
            }
            if (flagsWanted & game.FitFlags.DOWN) {
                bottomFlagNeeded = true;
            }

            if (openingsNotWanted & game.FitFlags.LEFT) {
                leftOpeningNotWanted = true;
            }
            if (openingsNotWanted & game.FitFlags.RIGHT) {
                rightOpeningNotWanted = true;
            }
            if (openingsNotWanted & game.FitFlags.UP) {
                topOpeningNotWanted = true;
            }
            if (openingsNotWanted & game.FitFlags.DOWN) {
                bottomOpeningNotWanted = true;
            }

            for (var i = 0; i < this.puzzlePieces.length; i++) {
                var flags = puzzlePiece.canFitTogether(this.puzzlePieces[i]);

                if (leftFlagNeeded) {
                    if (!(flags & game.FitFlags.LEFT)) {
                        continue;
                    }
                }
                if (rightFlagNeeded) {
                    if (!(flags & game.FitFlags.RIGHT)) {
                        continue;
                    }
                }
                if (topFlagNeeded) {
                    if (!(flags & game.FitFlags.UP)) {
                        continue;
                    }
                }
                if (bottomFlagNeeded) {
                    if (!(flags & game.FitFlags.DOWN)) {
                        continue;
                    }
                }

                if (leftOpeningNotWanted) {
                    if (this.puzzlePieces[i].hasLeftOpening) {
                        continue;
                    }
                }
                if (rightOpeningNotWanted) {
                    if (this.puzzlePieces[i].hasRightOpening) {
                        continue;
                    }
                }
                if (topOpeningNotWanted) {
                    if (this.puzzlePieces[i].hasTopOpening) {
                        continue;
                    }
                }
                if (bottomOpeningNotWanted) {
                    if (this.puzzlePieces[i].hasBottomOpening) {
                        continue;
                    }
                }

                if (this.puzzlePieces[i].pieceType & puzzlePieceType &&
                    this.puzzlePieces[i].isBlank == false) {
                    possiblePuzzlePiecesList.push(this.puzzlePieces[i]);
                }
            }
            return possiblePuzzlePiecesList;
        },

        generateLeftColumn: function() {
            var x = 0;
            var y = 0;
            var isGood = false;
            var numIterations = this.mapHeight / game.PUZZLE_PIECE_SIZE;
            var possiblePuzzlePiecesList = [];

            for (var i = 0; i < this.puzzlePieces.length; i++) {
                if (this.puzzlePieces[i].pieceType & game.PuzzlePieceType.LEFT) {
                    possiblePuzzlePiecesList.push(this.puzzlePieces[i]);
                }
            }

            for (var i = 0; i < numIterations; i++) {
                puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];

                // If at least one piece isn't blank, then we have a valid starting column.
                if (!puzzlePiece.isBlank) {
                    isGood = true;
                }
                this.leftColumn.push(puzzlePiece);
                puzzlePiece.applyToMapArray(this.mapArray, this.mapWidth, x, y);
                
                y += game.PUZZLE_PIECE_SIZE;
                if ( y == this.mapHeight ) {
                    y = 0;
                }
            }

            return isGood;
        },

        generateMiddleColumns: function(startingX) {
            var x = startingX;
            var y = 0;
            var index = x - game.PUZZLE_PIECE_SIZE; // index for the middleColumn array
            var numIterations = this.mapHeight / game.PUZZLE_PIECE_SIZE;

            // Need to get a list of the possible puzzle pieces.
            // This will be based on the one in the column before it and the one directly above it.
            // ALL connections need to have an end.
            // Therefore, the pieces need to check the piece above it
            // and the piece to the left. If those have any exits, then
            // they need to be closed. That is how we will find the valid piece.
            for ( var i = 0; i < numIterations; i++ ) {
                var puzzlePiece;
                var possiblePuzzlePiecesList = [];
                var notWantedFlags = 0; // Used to make sure no dead ends will be created

                // Makes sure there are no dead ends being created at the bottom of the column
                if (i == numIterations - 1) {
                    notWantedFlags |= game.FitFlags.DOWN;
                }

                if (this.previousColumn[i].isBlank == true) {
                    // The left piece is blank and the top one has a bottom opening
                    if (i > 0 &&
                        this.middleColumn[index-1].hasBottomOpening) {

                        notWantedFlags |= game.FitFlags.LEFT;
                        possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.middleColumn[index-1], game.FitFlags.UP, notWantedFlags, game.PuzzlePieceType.MIDDLE);
                        puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    }
                    // All other cases need a blank puzzle piece
                    else {
                        puzzlePiece = this.createBlankPuzzlePiece();
                    }
                }
                else {
                    if (i > 0 &&
                        this.middleColumn[index-1].isBlank == false && 
                        this.middleColumn[index-1].hasBottomOpening == true) {

                        for (var j = 0; j < this.puzzlePieces.length; j++) {
                            if (this.puzzlePieces[j].hasTopOpening &&
                                this.puzzlePieces[j].hasLeftOpening) {
                                possiblePuzzlePiecesList.push(this.puzzlePieces[j]);
                            }
                        }
                        puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    }
                    // No path is coming from above, so only check to the left
                    else {
                        notWantedFlags |= game.FitFlags.UP;
                        possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.previousColumn[i], game.FitFlags.LEFT, notWantedFlags, game.PuzzlePieceType.MIDDLE);
                        puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    }
                }

                this.middleColumn.push(puzzlePiece);
                puzzlePiece.applyToMapArray(this.mapArray, this.mapWidth, x, y);
                y += game.PUZZLE_PIECE_SIZE;
                if ( y == this.mapHeight ) {
                    y = 0;
                }
                index++;
            }
        },

        generateRightColumn: function(startingX) {
            var x = startingX;
            var y = 0;
            var numIterations = this.mapHeight / game.PUZZLE_PIECE_SIZE;


            for ( var i = 0; i < numIterations; i++ ) {
                var puzzlePiece;
                var possiblePuzzlePiecesList = [];
                var notWantedFlags = 0; // Used to make sure no dead ends will be created

                // Makes sure there are no dead ends being created at the bottom of the column
                if (i == numIterations - 1) {
                    notWantedFlags |= game.FitFlags.DOWN;
                }

                if (this.previousColumn[i].isBlank == true) {
                    // The left piece is blank and the top one has a bottom opening
                    if (i > 0 &&
                        this.rightColumn[i-1].hasBottomOpening) {

                        notWantedFlags |= game.FitFlags.LEFT;
                        possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.rightColumn[i-1], game.FitFlags.UP, notWantedFlags, game.PuzzlePieceType.RIGHT);
                        puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    }
                    // All other cases need a blank puzzle piece
                    else {
                        puzzlePiece = this.createBlankPuzzlePiece();
                    }
                }
                else {
                    if (i > 0 &&
                        this.rightColumn[i-1].isBlank == false && 
                        this.rightColumn[i-1].hasBottomOpening == true) {

                        for (var j = 0; j < this.puzzlePieces.length; j++) {
                            if (this.puzzlePieces[j].hasTopOpening &&
                                this.puzzlePieces[j].hasLeftOpening) {
                                possiblePuzzlePiecesList.push(this.puzzlePieces[j]);
                            }
                        }
                        puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    }
                    // No path is coming from above, so only check to the left
                    else {
                        notWantedFlags |= game.FitFlags.UP;
                        possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.previousColumn[i], game.FitFlags.LEFT, notWantedFlags, game.PuzzlePieceType.RIGHT);
                        puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    }
                }

                this.rightColumn.push(puzzlePiece);
                puzzlePiece.applyToMapArray(this.mapArray, this.mapWidth, x, y);
                y += game.PUZZLE_PIECE_SIZE;
                if ( y == this.mapHeight ) {
                    y = 0;
                }
            }
        },

    	generateRandomMap: function(width, height, difficulty) {
            if (difficulty < 1 || difficulty > 4) return 0;
            // Make sure we can use whole puzzle pieces
            if (width * height % game.PUZZLE_PIECE_SIZE != 0) return 0;

            // Makes sure the map is at least as big as one puzzle piece
            // if (width < game.PUZZLE_PIECE_SIZE) return 0;
            if (width < 3 * game.PUZZLE_PIECE_SIZE) return 0;
            // TODO: Always need at least three puzzle pieces to make up the width

            this.mapDifficulty = difficulty;
            this.mapWidth = width;
            this.mapHeight = height;

            // Generate a map array with all zeroes
            var sizeInTiles = width * height;
            // var mapArray = [];
            for (var i = 0; i < sizeInTiles; i++) {
                this.mapArray.push(0);
            };

            // Make sure the left column isn't blank
            var goodLeftColumn = false;
            while (goodLeftColumn == false) {
                if (this.generateLeftColumn() == true) {
                    goodLeftColumn = true;
                } 
                else {
                    this.leftColumn.length = 0;
                }
            }

            // if (width >= 2 * game.PUZZLE_PIECE_SIZE) {            
            // This is the starting x position for the first column
            // in the "middle" section. Column in this case is a single
            // value and not a puzzle piece column
            var startingX = game.PUZZLE_PIECE_SIZE;
            var numIterations = (width / game.PUZZLE_PIECE_SIZE) - 2;
            for (var i = 0; i < numIterations; i++) {
                if (i == 0) {
                    this.previousColumn.length = 0;
                    for (var j = 0; j < this.leftColumn.length; j++) {
                       this.previousColumn.push(this.leftColumn[j]);
                    }
                }
                else {
                    this.previousColumn.length = 0;
                    for (var j = 0; j < this.mapHeight / game.PUZZLE_PIECE_SIZE; j++) {
                        this.previousColumn.push(this.middleColumn[(i-1)*game.PUZZLE_PIECE_SIZE+j]);
                    }
                }
                this.generateMiddleColumns(startingX);

                // The loop is about to end, so prepare the previous column for the right column
                if (i == numIterations - 1) {
                    this.previousColumn.length = 0;
                    for (var j = 0; j < this.mapHeight / game.PUZZLE_PIECE_SIZE; j++) {
                        this.previousColumn.push(this.middleColumn[i*game.PUZZLE_PIECE_SIZE+j]);
                    }
                }

                startingX += game.PUZZLE_PIECE_SIZE;
            }

            this.generateRightColumn(startingX);

            return (new game.Map(this.mapArray, width));
    	}
    };

}());