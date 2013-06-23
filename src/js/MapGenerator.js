( function() {
    
    // There's only one map generator, so we'll define everything in a single
    // object.
    window.game.MapGenerator = {
    	puzzlePieces: [],

        mapArray: [],

        columns: [],

        columnLength: 0,
        rowLength: 0,

        mapWidth: 0,
        mapHeight: 0,
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
         * @param  {Array} tiles           tiles that make up the puzzle piece
         * @param  {game.PuzzlePieceType} puzzlePieceType indicates the type of puzzle piece
         */
        addPuzzlePiece: function(tiles, puzzlePieceType) {
            this.puzzlePieces.push(new game.PuzzlePiece(tiles, puzzlePieceType));
        },

        /**
         * Prints the column at the column index
         * @param {Number} columnIndex The column index
         */
        printColumn: function(columnIndex) {
            for (var i = columnIndex; i < columnIndex + this.columnLength; i++) {
                this.columns[i].print();
            };
        },

        /**
         * Gets the puzzle piece that is next to, above, or below the one that's
         * passed in.
         *
         * @param  {game.DirectionFlags} direction   Direction to look in
         * @param  {Number} fromThisPieceIndex Index of the puzzle piece
         * @return {game.PuzzlePiece}               Puzzle piece
         */
        getPuzzlePiece: function(direction, fromThisPieceIndex) {
            var y = fromThisPieceIndex % this.columnLength;
            var x = Math.floor(fromThisPieceIndex / this.columnLength);
            switch(direction) {
                case game.DirectionFlags.LEFT:
                    if ( x == 0 ) return null;
                    return this.columns[fromThisPieceIndex - this.columnLength];
                case game.DirectionFlags.UP :
                    if ( y == 0 ) return null;
                    return this.columns[fromThisPieceIndex - 1];
                case game.DirectionFlags.RIGHT :
                    if ( x == this.rowLength - 1 ) return null;
                    return this.columns[fromThisPieceIndex + this.columnLength];
                case game.DirectionFlags.DOWN :
                    if ( y == this.columnLength - 1 ) return null;
                    return this.columns[fromThisPieceIndex + 1];
            }
        },

        /**
         * Prints the generated map
         */
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

        /**
         * Gets all the possible puzzle pieces that will fit at the puzzle piece
         * index that's passed in.
         * @param  {Number} index Index in the map array
         * @return {List}       List of possible puzzle pieces
         */
        getPossiblePuzzlePieces: function(index) {
            var possiblePuzzlePiecesList = [];
            var flags = 0;
            var columnIndex = Math.floor(index / this.columnLength);
            var previousPuzzlePiece;
            var row = index % this.columnLength;
            if (columnIndex == 0) {
                flags = game.PuzzlePieceType.LEFT;
            } else if (columnIndex == this.rowLength - 1) {
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

                if ( 
                    ((puzzlePiece.canFitTogether(upPiece) & game.DirectionFlags.DOWN) == 0) ||
                    ((puzzlePiece.canFitTogether(rightPiece) & game.DirectionFlags.LEFT) == 0) ||
                    ((puzzlePiece.canFitTogether(leftPiece) & game.DirectionFlags.RIGHT) == 0) ||
                    ((puzzlePiece.canFitTogether(downPiece) & game.DirectionFlags.UP) == 0)
                    ) continue;

                if ( (row == 0 && puzzlePiece.hasTopOpening) ||
                    (row == this.columnLength - 1 && puzzlePiece.hasBottomOpening ) ) {
                    continue;
                }

                if ( flags == game.PuzzlePieceType.MIDDLE && !leftPiece.hasRightOpening && puzzlePiece.hasLeftOpening ) {
                    continue;
                }

                possiblePuzzlePiecesList.push(this.puzzlePieces[i]);
            };

            if ( possiblePuzzlePiecesList.length == 0 ) {
                if ( upPiece != null ) upPiece.print('Up piece');
                if ( rightPiece != null ) rightPiece.print('Right piece');
                if ( leftPiece != null ) leftPiece.print('Left piece');
                if ( downPiece != null ) downPiece.print('Down piece');

                console.log('Fatal error: couldn\'t place piece at index: ' + index + ' flags: ' + flags + ' row: ' + row + ' columnLength: ' + this.columnLength);
                if ( row == 0 && flags == game.PuzzlePieceType.MIDDLE ) console.log('This piece can\'t have top openings.');
                if ( row == this.columnLength - 1 && flags == game.PuzzlePieceType.MIDDLE ) console.log('This piece can\'t have bottom openings.');
            }

            return possiblePuzzlePiecesList;
        },

        /**
         * Generates a column of the map
         * @param  {Number} columnIndex Column index
         */
        generateColumn: function(columnIndex) {
            var validColumn = false
            while (validColumn == false) {

                // Last column doesn't need right openings and just
                // needs to connect to the previous column
                if (columnIndex == this.rowLength - 1) {
                    validColumn = true;
                }

                for ( var i = 0; i < this.columnLength; i++ ) {
                    var puzzlePiece;
                    var possiblePuzzlePiecesList = [];
     
                    possiblePuzzlePiecesList = this.getPossiblePuzzlePieces(columnIndex * this.columnLength + i);
                    puzzlePiece = possiblePuzzlePiecesList[Math.floor(Math.random()*possiblePuzzlePiecesList.length)];

                    if (puzzlePiece.hasRightOpening) {
                        validColumn = true;
                    }
                    this.columns.push(puzzlePiece);
                }

                if (validColumn == false) {
                    this.columns.splice(columnIndex, this.columnLength);
                }
            }
        },

        /**
         * Generates a random map
         * @param  {Number} width      width of the map to be generated
         * @param  {Number} height     Height of the map to be generated
         * @param  {Number} difficulty Difficulty of the map. The higher the
         *                             difficulty, the harder the map
         * @return {game.Map}            New auto-generated map
         */
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
            this.columnLength = this.mapHeight / game.PUZZLE_PIECE_SIZE;
            this.rowLength = this.mapWidth / game.PUZZLE_PIECE_SIZE;

            // Generate a map array with all zeroes
            var sizeInTiles = width * height;
            // var mapArray = [];
            this.mapArray = [];
            this.previousColumn = [];
            this.leftColumn = [];
            this.middleColumn = [];
            this.rightColumn = [];
            for (var i = 0; i < sizeInTiles; i++) {
                this.mapArray.push(0);
            };

            // Generate the columns
            // var numIterations = width / game.PUZZLE_PIECE_SIZE;
            // for (var i = 0; i < this.rowLength; i++) {
            for (var i = 0; i < this.rowLength; i++) {
                this.generateColumn(i);
            };

            var x = 0;
            var y = 0;
            for (var i = 0; i < this.columns.length; i++) {
                this.columns[i].applyToMapArray(this.mapArray, this.mapWidth, x, y);
                y += game.PUZZLE_PIECE_SIZE;
                if ( y == this.mapHeight ) {
                    y = 0;
                    x += game.PUZZLE_PIECE_SIZE;
                }
            };

            return (new game.Map(this.mapArray, width));
    	}
    };

}());