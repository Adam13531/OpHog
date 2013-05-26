( function() {
    
    // There's only one map generator, so we'll define everything in a single
    // object.
    window.game.MapGenerator = {
    	puzzlePieces: [],

        puzzlePieceConfiguration: [],

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
            // var piece6Tiles = [
            // 0,0,0,0,0,
            // 0,0,0,0,0,
            // 1,1,1,0,1,
            // 0,0,1,0,1,
            // 0,0,1,1,1,
            // ];
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

        getPossiblePuzzlePieces: function(puzzlePiece, flagsWanted, puzzlePieceType) {
            var possiblePuzzlePiecesList = [];

            var leftFlagNeeded = false;
            var rightFlagNeeded = false;
            var topFlagNeeded = false;
            var bottomFlagNeeded = false;

            if (flagsWanted & game.FitFlags.LEFT) {
                leftFlagNeeded = true;
            }
            if (flagsWanted & game.FitFlags.RIGHT) {
                rightFlagNeeded = true;
            }
            if (flagsWanted & game.FitFlags.TOP) {
                topFlagNeeded = true;
            }
            if (flagsWanted & game.FitFlags.BOTTOM) {
                bottomFlagNeeded = true;
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
                    if (!(flags & game.FitFlags.TOP)) {
                        continue;
                    }
                }
                if (bottomFlagNeeded) {
                    if (!(flags & game.FitFlags.BOTTOM)) {
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
            // var choices = [0, 3, 6];
            var choices = [0, 3];
            var x = 0;
            var y = 0;
            var isGood = false;
            var numIterations = this.mapHeight / game.PUZZLE_PIECE_SIZE;

            for ( var i = 0; i < numIterations; i++ ) {
                var puzzlePiece = this.puzzlePieceConfiguration[choices[Math.floor(Math.random()*choices.length)]];
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

        // TODO: Move random code out of each if/else
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

                if (this.previousColumn[i].isBlank == true) {
                    if (i > 0) {
                        // The piece above and the piece to the left are both blank
                        if (this.middleColumn[index-1].isBlank) {
                            puzzlePiece = this.createBlankPuzzlePiece();
                            console.log('1');
                        }
                        // The piece above is not blank but doesn't have a bottom opening
                        else if (this.middleColumn[index-1].hasBottomOpening == false){
                            puzzlePiece = this.createBlankPuzzlePiece();
                            console.log('2');
                            // var neededFlags;
                            // neededFlags |= game.FitFlags.LEFT;
                            // possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.previousColumn[i], neededFlags, game.PuzzlePieceType.MIDDLE);
                            // puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                        }
                        // The piece above has a bottom opening
                        else {//(this.middleColumn[i-1].hasBottomOpening == true) {
                            var tempList = [];
                            tempList = this.getPossiblePuzzlePieces(this.middleColumn[index-1], game.FitFlags.TOP, game.PuzzlePieceType.MIDDLE);
                            for (var j = 0; j < tempList.length; j++) {
                                // Makes sure there won't be a dead end created if the piece has left openings
                                if (!tempList[j].hasLeftOpening) {
                                    possiblePuzzlePiecesList.push(tempList[j]);
                                }

                                // Makes sure there won't be a dead end created by getting rid of pieces with top openings
                                // if (!tempList[j].hasTopOpening &&
                                //     i != numIterations - 1) {
                                //     possiblePuzzlePiecesList.push(tempList[j]);
                                // }
                                // // If on the last iteration, get rid of any pieces with a bottom and top openings
                                // if (i == numIterations - 1 &&
                                //     !tempList[j].hasTopOpening &&
                                //     !tempList[j].hasBottomOpening) {
                                //     possiblePuzzlePiecesList.push(tempList[j]);
                                // }
                            }
                            // System.arraycopy(tempList, 0, possiblePuzzlePiecesList, 0, tempList.length);

                            puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                            console.log('3');
                        }
                    }
                    else {
                        puzzlePiece = this.createBlankPuzzlePiece();
                        console.log('4');
                    }
                }
                else {
                    if (i > 0) {
                        // 6
                        // if (this.middleColumn[i-1].isBlank == false) {
                        //     var neededFlags;
                        //     neededFlags |= game.FitFlags.TOP;
                        //     neededFlags |= game.FitFlags.LEFT;
                        //     possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.previousColumn[i], neededFlags, game.PuzzlePieceType.MIDDLE);
                        //     puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                        // }
                        // The piece above is NOT blank and doesn't have a bottom opening
                        // and the piece to the left is NOT blank
                        if (this.middleColumn[index-1].isBlank == false &&
                            this.middleColumn[index-1].hasBottomOpening == false) {
                            var tempList = [];
                            tempList = this.getPossiblePuzzlePieces(this.previousColumn[i], game.FitFlags.LEFT, game.PuzzlePieceType.MIDDLE);
                            for (var j = 0; j < tempList.length; j++) {
                                // Makes sure there won't be a dead end created by getting rid of pieces with top openings
                                // if (!tempList[j].hasTopOpening) {
                                //     possiblePuzzlePiecesList.push(tempList[j]);
                                // }

                                // Makes sure there won't be a dead end created by getting rid of pieces with top openings
                                if (!tempList[j].hasTopOpening &&
                                    i != numIterations - 1) {
                                    possiblePuzzlePiecesList.push(tempList[j]);
                                }
                                // If on the last iteration, get rid of any pieces with a bottom and top openings
                                if (i == numIterations - 1 &&
                                    !tempList[j].hasTopOpening &&
                                    !tempList[j].hasBottomOpening) {
                                    possiblePuzzlePiecesList.push(tempList[j]);
                                }
                            }
                            puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                            console.log('5');
                        }
                        // The piece above is NOT blank but does have a bottom opening
                        // and the piece to the left is NOT blank
                        else if (this.middleColumn[index-1].isBlank == false && 
                                 this.middleColumn[index-1].hasBottomOpening == true) {
                            // possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.previousColumn[i], game.FitFlags.LEFT, game.PuzzlePieceType.MIDDLE);
                            for (var j = 0; j < this.puzzlePieces.length; j++) {
                                if (this.puzzlePieces[j].hasTopOpening &&
                                    this.puzzlePieces[j].hasLeftOpening) {
                                    possiblePuzzlePiecesList.push(this.puzzlePieces[j]);
                                }
                            }
                            puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                            console.log('6');
                        }


                        // else if (this.middleColumn[index-1].hasBottomOpening &&
                        //          this.previousColumn[i].hasRightOpening == false) {
                        //     puzzlePiece = this.createBlankPuzzlePiece();
                        // }
                        // 7
                        // The one above is blank and the one to the left isn't
                        else {
                            var tempList = [];
                            tempList = this.getPossiblePuzzlePieces(this.previousColumn[i], game.FitFlags.LEFT, game.PuzzlePieceType.MIDDLE);
                           for (var j = 0; j < tempList.length; j++) {

                                if (!tempList[j].hasTopOpening) {
                                    possiblePuzzlePiecesList.push(tempList[j]);
                                }
                                // Makes sure there won't be a dead end created by getting rid of pieces with top openings
                                // if (!tempList[j].hasTopOpening &&
                                //     i != numIterations - 1) {
                                //     possiblePuzzlePiecesList.push(tempList[j]);
                                // }
                                // // If on the last iteration, get rid of any pieces with a bottom and top openings
                                // if (i == numIterations - 1 &&
                                //     !tempList[j].hasTopOpening &&
                                //     !tempList[j].hasBottomOpening) {
                                //     possiblePuzzlePiecesList.push(tempList[j]);
                                // }
                            }
                            puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                            console.log('7');
                        }
                    }
                    // Nothing is above, so only check for left
                    else {
                        var tempList = [];
                        tempList = this.getPossiblePuzzlePieces(this.previousColumn[i], game.FitFlags.LEFT, game.PuzzlePieceType.MIDDLE);
                        for (var j = 0; j < tempList.length; j++) {
                            if (!tempList[j].hasTopOpening) {
                                possiblePuzzlePiecesList.push(tempList[j]);
                            }

                            // Makes sure there won't be a dead end created by getting rid of pieces with top openings
                            // if (!tempList[j].hasTopOpening &&
                            //     i != numIterations - 1) {
                            //     possiblePuzzlePiecesList.push(tempList[j]);
                            //     }
                            // // If on the last iteration, get rid of any pieces with a bottom and top openings
                            // if (i == numIterations - 1 &&
                            //     !tempList[j].hasTopOpening &&
                            //     !tempList[j].hasBottomOpening) {
                            //     possiblePuzzlePiecesList.push(tempList[j]);
                            // }
                        }

                        puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                        console.log('8');
                    }
                }

                this.middleColumn.push(puzzlePiece);
                puzzlePiece.applyToMapArray(this.mapArray, this.mapWidth, x, y);
                y += game.PUZZLE_PIECE_SIZE;
                if ( y == this.mapHeight ) {
                    y = 0;
                }
                index++;
                this.printMap();
                console.log('--------------------------------------------------------------------');
            }
        },

        generateRightColumn: function(startingX) {
            var x = startingX;
            var y = 0;
            var numIterations = this.mapHeight / game.PUZZLE_PIECE_SIZE;
            for ( var i = 0; i < numIterations; i++ ) {
                var puzzlePiece;
                var possiblePuzzlePiecesList = [];

                if (this.middleColumn[i].isBlank) {
                    // if (i > 0) {
                    //     if (this.rightColumn[i-1].isBlank) {
                    //         puzzlePiece = this.createBlankPuzzlePiece();
                    //     }
                    //     else if (this.rightColumn[i-1].hasBottomOpening == false){
                    //         var neededFlags;
                    //         neededFlags |= game.FitFlags.LEFT;
                    //         possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.middleColumn[i], neededFlags, game.PuzzlePieceType.RIGHT);
                    //         puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    //     }
                    //     else {
                    //         var neededFlags;
                    //         neededFlags |= game.FitFlags.TOP;
                    //         possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.middleColumn[i], neededFlags, game.PuzzlePieceType.RIGHT);
                    //         puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    //     }
                    // }
                    // else {
                        puzzlePiece = this.createBlankPuzzlePiece();
                    // }
                }
                else {
                    // if (i > 0) {
                    //     // 6
                    //     if (this.rightColumn[i-1].isBlank == false) {
                    //         var neededFlags;
                    //         neededFlags |= game.FitFlags.TOP;
                    //         neededFlags |= game.FitFlags.LEFT;
                    //         possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.middleColumn[i], neededFlags, game.PuzzlePieceType.RIGHT);
                    //         puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    //     }
                    //     // 7
                    //     else {
                            var neededFlags;
                            neededFlags |= game.FitFlags.LEFT;
                            possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.middleColumn[i], neededFlags, game.PuzzlePieceType.RIGHT);
                            puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    //     }
                    // }
                    // TODO: 5
                    // else {
                    //     var neededFlags;
                    //     neededFlags |= game.FitFlags.LEFT;
                    //     possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(this.middleColumn[i], neededFlags, game.PuzzlePieceType.RIGHT);
                    //     puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];
                    // }
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
            this.printMap();
            console.log('--------------------------------------------------------------------');

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
                startingX += game.PUZZLE_PIECE_SIZE;
            }

            // this.generateRightColumn(startingX);

            return (new game.Map(this.mapArray, width));
    	}
    };

}());