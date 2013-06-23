( function() {
    
    // There's only one map generator, so we'll define everything in a single
    // object.
    window.game.MapGenerator = {
        /**
         * This is the set of all possible puzzle pieces.
         * @type {Array:PuzzlePiece}
         */
    	puzzlePieces: [],

        /**
         * The tiles that form this map. These are indexed as
         *
         * 1 2
         * 3 4
         * 5 6
         * 
         * @type {Array:Tile}
         */
        mapArray: [],

        /**
         * The columns of puzzle pieces that form this map. These are indexed as
         * follows:
         *
         * 1 4
         * 2 5
         * 3 6
         * 
         * @type {Array:PuzzlePiece}
         */
        columns: [],

        /**
         * Width of this map in terms of puzzle pieces.
         * @type {Number}
         */
        heightInPuzzlePieces: 0,
        widthInPuzzlePieces: 0,

        /**
         * Width of the map in terms of tiles.
         * @type {Number}
         */
        widthInTiles: 0,
        heightInTiles: 0,

        mapDifficulty: 0,

        /**
         * Initialization function. Creates the puzzle pieces
         */
    	init: function() {

            this.addPuzzlePiece([0,0,0,0,0,
                                 0,0,0,0,0,
                                 0,0,0,0,0,
                                 0,0,0,0,0,
                                 0,0,0,0,0,], game.PuzzlePieceType.LEFT | 
                                              game.PuzzlePieceType.MIDDLE | 
                                              game.PuzzlePieceType.RIGHT);

            this.addPuzzlePiece([0,0,0,0,0,
                                 0,0,0,0,0,
                                 0,0,1,1,1,
                                 0,0,0,0,0,
                                 0,0,0,0,0,], game.PuzzlePieceType.LEFT);

            this.addPuzzlePiece([0,0,0,0,0,
                                 0,0,0,0,0,
                                 1,1,1,1,1,
                                 0,0,0,0,0,
                                 0,0,0,0,0,], game.PuzzlePieceType.MIDDLE);

            this.addPuzzlePiece([0,0,0,0,0,
                                 0,0,0,0,0,
                                 1,1,0,1,1,
                                 0,1,0,1,0,
                                 0,1,1,1,0,], game.PuzzlePieceType.MIDDLE);

            this.addPuzzlePiece([0,0,1,0,0,
                                 0,0,1,0,0,
                                 0,0,1,1,1,
                                 0,0,0,0,0,
                                 0,0,0,0,0,], game.PuzzlePieceType.MIDDLE);

            this.addPuzzlePiece([0,0,1,0,0,
                                 0,0,1,0,0,
                                 1,1,1,1,1,
                                 0,0,0,0,0,
                                 0,0,0,0,0,], game.PuzzlePieceType.MIDDLE);

            this.addPuzzlePiece([0,1,1,1,0,
                                 0,1,0,1,0,
                                 0,1,0,1,1,
                                 0,1,1,0,0,
                                 0,0,1,0,0,], game.PuzzlePieceType.MIDDLE);

            this.addPuzzlePiece([0,1,1,1,0,
                                 0,1,0,1,0,
                                 1,1,0,1,1,
                                 0,0,0,0,0,
                                 0,0,0,0,0,], game.PuzzlePieceType.MIDDLE);

            this.addPuzzlePiece([0,1,1,1,0,
                                 0,1,0,1,0,
                                 0,1,1,1,1,
                                 0,0,1,1,0,
                                 0,0,0,0,0,], game.PuzzlePieceType.MIDDLE);

            this.addPuzzlePiece([0,0,0,0,0,
                                 0,0,0,0,0,
                                 1,1,1,0,0,
                                 0,0,0,0,0,
                                 0,0,0,0,0,], game.PuzzlePieceType.RIGHT);
    	},

        /**
         * Adds a puzzle piece to the list of puzzle pieces
         * @param  {Array:Tile} tiles        tiles that make up the puzzle piece
         * @param  {game.PuzzlePieceType} puzzlePieceType indicates the type of puzzle piece
         */
        addPuzzlePiece: function(tiles, puzzlePieceType) {
            this.puzzlePieces.push(new game.PuzzlePiece(tiles, puzzlePieceType));
        },

        /**
         * Prints all puzzle pieces comprising the column at the column index
         * @param {Number} columnIndex The column index, from 0 to heightInPuzzlePieces.
         */
        printColumn: function(columnIndex) {
            for (var i = columnIndex; i < columnIndex + this.heightInPuzzlePieces; i++) {
                this.columns[i].print();
            };
        },

        /**
         * Gets the puzzle piece that is next to, above, or below the one that's
         * passed in.
         * @param  {game.DirectionFlags} direction   Direction to look in
         * @param  {Number} fromThisPieceIndex Index of the puzzle piece
         * @return {game.PuzzlePiece}               Puzzle piece, or null if no
         * such puzzle piece existed (e.g. you're at the top row and you request
         * the piece above)
         */
        getPuzzlePiece: function(direction, fromThisPieceIndex) {
            var x = Math.floor(fromThisPieceIndex / this.heightInPuzzlePieces);
            var y = fromThisPieceIndex % this.heightInPuzzlePieces;
            switch(direction) {
                case game.DirectionFlags.LEFT:
                    if ( x == 0 ) return null;
                    return this.columns[fromThisPieceIndex - this.heightInPuzzlePieces];
                case game.DirectionFlags.UP :
                    if ( y == 0 ) return null;
                    return this.columns[fromThisPieceIndex - 1];
                case game.DirectionFlags.RIGHT :
                    if ( x == this.widthInPuzzlePieces - 1 ) return null;
                    return this.columns[fromThisPieceIndex + this.heightInPuzzlePieces];
                case game.DirectionFlags.DOWN :
                    if ( y == this.heightInPuzzlePieces - 1 ) return null;
                    return this.columns[fromThisPieceIndex + 1];
            }
        },

        /**
         * Prints the generated map
         */
        printMap: function() {
            for (var i = 0; i < this.heightInTiles; i ++ ) {
                rowStr = '';
                for ( var j = 0; j < this.widthInTiles; j ++ ) {
                    if ( j > 0 ) rowStr += ' ';
                    rowStr += this.mapArray[i * this.widthInTiles + j];
                }
                console.log(rowStr);
            }
        },

        /**
         * Gets all the possible puzzle pieces that will fit at the index that's
         * passed in.
         * @param  {Number} index Index in the map array in tiles.
         * @return {List}       List of possible puzzle pieces
         */
        getPossiblePuzzlePieces: function(index) {
            var possiblePuzzlePiecesList = [];
            var flags = 0;
            var columnIndex = Math.floor(index / this.heightInPuzzlePieces);
            var row = index % this.heightInPuzzlePieces;

            if (columnIndex == 0) {
                flags = game.PuzzlePieceType.LEFT;
            } else if (columnIndex == this.widthInPuzzlePieces - 1) {
                flags = game.PuzzlePieceType.RIGHT;
            } else {
                flags = game.PuzzlePieceType.MIDDLE;
            }

            // These may be null.
            var upPiece = this.getPuzzlePiece(game.DirectionFlags.UP, index);
            var rightPiece = this.getPuzzlePiece(game.DirectionFlags.RIGHT, index);
            var leftPiece = this.getPuzzlePiece(game.DirectionFlags.LEFT, index);
            var downPiece = this.getPuzzlePiece(game.DirectionFlags.DOWN, index);

            for (var i = 0; i < this.puzzlePieces.length; i++) {
                var puzzlePiece = this.puzzlePieces[i];
                if (!(puzzlePiece.pieceType & flags)) continue;

                // If the puzzle piece doesn't fit, continue
                if ( 
                    ((puzzlePiece.canFitTogether(upPiece) & game.DirectionFlags.DOWN) == 0) ||
                    ((puzzlePiece.canFitTogether(rightPiece) & game.DirectionFlags.LEFT) == 0) ||
                    ((puzzlePiece.canFitTogether(leftPiece) & game.DirectionFlags.RIGHT) == 0) ||
                    ((puzzlePiece.canFitTogether(downPiece) & game.DirectionFlags.UP) == 0)
                    ) continue;

                // If we're at the top or bottom and our puzzle piece needs to
                // connect to something above or below it (respectively),
                // continue
                if ( (row == 0 && puzzlePiece.hasTopOpening) ||
                    (row == this.heightInPuzzlePieces - 1 && puzzlePiece.hasBottomOpening ) ) {
                    continue;
                }

                // If we're in the middle, we can't connect to a blank piece on
                // the left if we have a left opening.
                if ( flags == game.PuzzlePieceType.MIDDLE && !leftPiece.hasRightOpening && puzzlePiece.hasLeftOpening ) {
                    continue;
                }

                possiblePuzzlePiecesList.push(this.puzzlePieces[i]);
            };

            // Sanity check for future puzzle piece engineers: if we didn't find
            // any pieces, then we should print useful information.
            if ( possiblePuzzlePiecesList.length == 0 ) {
                if ( upPiece != null ) upPiece.print('Up piece');
                if ( rightPiece != null ) rightPiece.print('Right piece');
                if ( leftPiece != null ) leftPiece.print('Left piece');
                if ( downPiece != null ) downPiece.print('Down piece');

                console.log('Fatal error: couldn\'t place piece at index: ' + index + ' flags: ' + flags + ' row: ' + row + ' heightInPuzzlePieces: ' + this.heightInPuzzlePieces);
                if ( row == 0 && flags == game.PuzzlePieceType.MIDDLE ) console.log('This piece can\'t have top openings.');
                if ( row == this.heightInPuzzlePieces - 1 && flags == game.PuzzlePieceType.MIDDLE ) console.log('This piece can\'t have bottom openings.');
            }

            return possiblePuzzlePiecesList;
        },

        /**
         * Generates a column of the map
         * @param  {Number} columnIndex Column index (from 0 to
         * heightInPuzzlePieces)
         */
        generateColumn: function(columnIndex) {
            var validColumn = false;
            while (!validColumn) {

                // Last column doesn't need right openings and just needs to
                // connect to the previous column, so it's always valid.
                if (columnIndex == this.widthInPuzzlePieces - 1) {
                    validColumn = true;
                }

                for ( var i = 0; i < this.heightInPuzzlePieces; i++ ) {
                    var puzzlePiece;
                    var possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(columnIndex * this.heightInPuzzlePieces + i);
                    puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];

                    if (puzzlePiece.hasRightOpening) {
                        validColumn = true;
                    }
                    this.columns.push(puzzlePiece);
                }

                if (!validColumn) {
                    this.columns.splice(columnIndex, this.heightInPuzzlePieces);
                }
            }
        },

        /**
         * Generates a random map
         * @param  {Number} width      width of the map to be generated in tiles
         * @param  {Number} height     height of the map to be generated in tiles
         * @param  {Number} difficulty Difficulty of the map. The higher the
         *                             difficulty, the harder the map
         * @return {game.Map}          New auto-generated map, or null if there was an error.
         */
    	generateRandomMap: function(width, height, difficulty) {
            if (difficulty < 1 || difficulty > 4) {
                game.util.debugDisplayText('Fatal map generation error: difficulty out of bounds.', 'difficulty');
                return null;
            }

            // Make sure we can use whole puzzle pieces
            if (width * height % game.PUZZLE_PIECE_SIZE != 0) {
                game.util.debugDisplayText('Fatal map generation error: map size is not a multiple of puzzle piece size', 'map size');
                console.log('Map width: ' + width + ' height: ' + height);
                return null;
            }

            // Makes sure the map is at least as big as three puzzle pieces so
            // that the algorithm doesn't fail.
            if (width < 3 * game.PUZZLE_PIECE_SIZE) {
                game.util.debugDisplayText('Fatal map generation error: width isn\'t big enough.', 'map width');
                console.log('Map width: ' + width);
                return null;
            }

            this.mapDifficulty = difficulty;
            this.widthInTiles = width;
            this.heightInTiles = height;
            this.heightInPuzzlePieces = this.heightInTiles / game.PUZZLE_PIECE_SIZE;
            this.widthInPuzzlePieces = this.widthInTiles / game.PUZZLE_PIECE_SIZE;

            var sizeInTiles = this.widthInTiles * this.heightInTiles;
            this.mapArray = [];

            // Generate a map array with all zeroes
            for (var i = 0; i < sizeInTiles; i++) {
                this.mapArray.push(0);
            };

            // Generate the columns
            for (var i = 0; i < this.widthInPuzzlePieces; i++) {
                this.generateColumn(i);
            };

            // Go through the columns we generated (in puzzle pieces) and form
            // tiles out of them.
            var x = 0;
            var y = 0;
            for (var i = 0; i < this.columns.length; i++) {
                this.columns[i].applyToMapArray(this.mapArray, this.widthInTiles, x, y);
                y += game.PUZZLE_PIECE_SIZE;
                if ( y == this.heightInTiles ) {
                    y = 0;
                    x += game.PUZZLE_PIECE_SIZE;
                }
            };

            var map = new game.Map(this.mapArray, width);

            // We don't need these any longer, so free the memory.
            delete this.columns;
            delete this.mapArray;
            
            return map;
    	}
    };

}());