( function() {


    /**
     * Arguments would eventually be passed to this class, but for now, we only
     * have one map, so it'll go here. Note that you should call
     * game.Camera.computeScrollBoundaries(); when you load a map for real.
     */
    window.game.Map = function Map() {

        this.numCols = 25;

        // This is a hard-coded map to use for testing. It is a set of graphic
        // indices that we use when constructing each tile.
        var mapTilesIndices = new Array(
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,67,88,88,88,88,88,88,88,88,88,88,88,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,67,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,93,
            5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,
            93,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,67,88,88,88,88,88,88,88,88,88,88,88,88,88,88,88,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,
            93,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,93,
            5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 ,5 
            );

        /**
         * The tiles representing this map.
         * @type {Array:Tile}
         */
        this.mapTiles = [];
        for (var i = 0; i < mapTilesIndices.length; i++) {
            var index = mapTilesIndices[i];
            this.mapTiles.push(new game.Tile(index, i, i % this.numCols, Math.floor(i/this.numCols)));
        };

        /**
         * Array of booleans representing whether there's fog over a tile.
         * @type {Array:Boolean}
         */
        this.fog = [];
        for (var i = 0; i < this.mapTiles.length; i++) {
            this.fog.push(true);
        };

        this.numRows = this.mapTiles.length / this.numCols;
        this.widthInPixels = this.numCols * tileSize;
        this.heightInPixels = this.numRows * tileSize;

        // Clear some fog around the spawners. These coordinates are hard-coded
        // for now.
        this.setFog(1,3,3,false);
        this.setFog(1,9,3,false);
        this.setFog(1,15,3,false);

        this.computePaths();

        // Now that we have paths, place some generators.
        this.placeGenerators();
    };

    /**
     * Places generators randomly on the map.
     * @return {undefined}
     */
    window.game.Map.prototype.placeGenerators = function() {
        // Coordinates of generators
        var generatorCoords = [];
        var spawnerTiles = this.getAllSpawnerTiles();
        var minimumDistanceFromSpawn = 7;
        var numberOfGeneratorsToPlace = 7;
        var possibleGeneratorTiles;

        // Start with all walkable tiles as candidates for possible generator
        // tiles.
        possibleGeneratorTiles = this.getAllWalkableTiles();

        // Remove any tile that is within a certain number of tiles from any
        // spawner so that enemies aren't generated too close to the spawn
        for (var i = 0; i < possibleGeneratorTiles.length; i++) {
            var tile = possibleGeneratorTiles[i];
            for (var j = 0; j < spawnerTiles.length; j++) {
                var spawnTile = spawnerTiles[j];
                if ( game.util.distance(tile.x, tile.y, spawnTile.x, spawnTile.y) < minimumDistanceFromSpawn ) {
                    possibleGeneratorTiles.splice(i, 1);
                    i--;
                    break;
                }
            };
        };

        // Figure out the coordinates for each generator now.
        for (var i = 0; i < numberOfGeneratorsToPlace; i++) {
            // If there are no more possible tiles, then we're forced to stop
            // here.
            if ( possibleGeneratorTiles.length == 0 ) {
                console.log('Warning: this map tried to place ' + numberOfGeneratorsToPlace + 
                    ' generator(s), but there was only enough room for ' + generatorCoords.length);
                break;
            }

            var indexOfGeneratorTile = Math.floor(Math.random() * possibleGeneratorTiles.length);
            var generatorTile = possibleGeneratorTiles[indexOfGeneratorTile];
            generatorCoords.push([generatorTile.x, generatorTile.y]);

            // Now that we placed a generator at this tile, we remove it from
            // the possible coordinates for future generators so that we don't
            // stack generators.
            possibleGeneratorTiles.splice(indexOfGeneratorTile, 1);
        };

        // Figure out which enemies can be spawned from this generator.
        var possibleEnemies = [];

        // This is a debug value and will eventually be based on the map number
        // or something. Actually, a lot of this code will change.
        var highestEnemyID = 4;

        // Go through each ID and potentially make a PossibleEnemy.
        for (var enemyID = 0; enemyID < highestEnemyID; enemyID++) {
            var r = game.util.randomInteger(0, 2);

            // If we randomly generated 0 OR if we didn't add any possible
            // enemies yet, then we will add this type.
            if ( r == 0 || (enemyID == highestEnemyID - 1 && possibleEnemies.length == 0) ) {
                // Enemies with higher IDs will appear more frequently (this is
                // just debug logic).
                var relativeWeight = enemyID + 1;

                // These level ranges are arbitrary
                var minLevel = 1;
                var maxLevel = 5;
                var possibleEnemy = new game.PossibleEnemy(enemyID, relativeWeight, minLevel, maxLevel);
                possibleEnemies.push(possibleEnemy);
            }
        };

        // Make generators at each spot that we determined above
        for (var i = 0; i < generatorCoords.length; i++) {
            var x = generatorCoords[i][0];
            var y = generatorCoords[i][1];

            var generator = new game.Generator(x, y, possibleEnemies);
            game.GeneratorManager.addGenerator(generator);
        };
    };

    /**
     * Given a tile, this will return a random path that contains that tile.
     * There is an equal chance of picking any path from the possible paths.
     *
     * Something minor to keep in mind: because you can pass in an arbitrary
     * tile, if you were to calculate the paths from that arbitrary tile to all
     * of the endpoints, you MAY find paths that aren't in this.paths. Those
     * paths can't be chosen because they aren't in this.paths.Picture this
     * path:
     *
     * 111111
     *   2
     *   1111
     *   
     * If you call this function and pass in tile '2' and facingRight==true, it
     * will ALWAYS go down, because there is no left-to-right path that goes
     * from 2 upward, despite that it would be a possible path if '2' were an
     * endpoint on the path.
     * 
     * @param  {Number} tileX - coordinate in tiles
     * @param  {Number} tileY - coordinate in tiles
     * @param  {Boolean} facingRight - if true, this will find a left-to-right
     * path
     * @return {Object with path (Array:Tile) and indexInPath (Number)}
     */
    window.game.Map.prototype.getPathStartingWith = function(tileX, tileY, facingRight) {
        var possiblePaths = [];
        var path = null;
        var firstPathIndex = 0;
        var halfNumPaths = this.paths.length / 2;
        var lastPathIndex = halfNumPaths;

        if ( !facingRight ) {
            firstPathIndex += halfNumPaths;
            lastPathIndex += halfNumPaths;
        }

        for (var i = firstPathIndex; i < lastPathIndex; i++) {
            path = this.paths[i];
            for (var j = 0; j < path.length; j++) {
                if ( path[j].x == tileX && path[j].y == tileY ) {
                    possiblePaths.push({path:path, indexInPath:j});
                }
            };
        };

        return game.util.randomArrayElement(possiblePaths);
    };

    /**
      * @param {Boolean} useEvenDistribution - if true, each walkable tile will
      * have an even chance of being chosen. If false, each walkable tile gets a
      * number of chances equal to the number of paths that it's in. For example,
      * if your map's paths is simply an 'X', then the tile at which the two
      * beams of the 'X' cross will be chosen slightly more often than the
      * others.
      * @return {Tile} a random, walkable tile
     */
    window.game.Map.prototype.getRandomWalkableTile = function(useEvenDistribution) {
        if ( useEvenDistribution ) {
            return game.util.randomArrayElement(this.getAllWalkableTiles());
        } else {
            var randomPath = game.util.randomArrayElement(this.paths);
            return game.util.randomArrayElement(randomPath);
        }
    };

    /**
     * @return {Array:Tile} - an array of all of the walkable tiles on this map
     */
    window.game.Map.prototype.getAllWalkableTiles = function() {
        var walkableTiles = [];
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];
            if ( tile.isWalkable ) walkableTiles.push(tile);
        };

        return walkableTiles;
    };

    /**
     * @return {Array:Tile} - an array of all of the spawner tiles on this map
     */
    window.game.Map.prototype.getAllSpawnerTiles = function() {
        var spawnerTiles = [];
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];
            if ( tile.isSpawnerPoint ) spawnerTiles.push(tile);
        };

        return spawnerTiles;
    };
    
    /**
     * Compute the set of paths that we want to use. This will return optimized,
     * non-duplicated, non-zero paths both from right-to-left and left-to-right.
     */
    window.game.Map.prototype.computePaths = function() {
        /**
         * Array of paths for this map. All left-to-right paths go in the first
         * half. Right-to-left paths take up the second half and are simply
         * mirrors of the LTR paths.
         * @type {Array:(Array:Tile)}
         */
        this.paths = []

        // First, figure out all right endpoints. A right endpoint is a walkable
        // tile without any adjacent up/upright/right/downright/down neighbors
        var rightEndpoints = [];
        var leftEndpoints = [];
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];

            // We only consider walkable tiles
            if ( !tile.isWalkable ) continue;

            var rightNeighbors = this.getAdjacentTiles(tile, true);
            if ( rightNeighbors.length == 0 ) {
                rightEndpoints.push(tile);
            }
            
            var leftNeighbors = this.getAdjacentTiles(tile, false);
            if ( leftNeighbors.length == 0 ) {
                leftEndpoints.push(tile);
            }
        }

        // Go through each left endpoint and find all paths from that to each right endpoint.
        for (var i = 0; i < leftEndpoints.length; i++) {
            var tile = leftEndpoints[i];
            if ( !tile.isWalkable ) continue;

            for (var j = 0; j < rightEndpoints.length; j++) {
                var rightEndpoint = rightEndpoints[j];
                var paths = this.getPathsFrom(tile, rightEndpoint);

                // Add the newly found paths to this.paths
                game.util.pushAllToArray(this.paths, paths);
            };
        };

        // Now reverse all of the paths so that we get the right-to-left paths
        var reversedPaths = [];
        for (var i = 0; i < this.paths.length; i++) {
            var reversedPath = game.util.copyAndReverseArray(this.paths[i]);
            reversedPaths.push(reversedPath);
        };

        for (var i = 0; i < reversedPaths.length; i++) {
            this.paths.push(reversedPaths[i]);
        };

        if ( this.paths.length == 0 ) {
            console.log('Fatal error - no paths generated.');
        }

        this.ensureAllWalkableTilesAreInAPath();

    };

    /**
     * If there's a walkable tile on the map, then there had better be at least
     * one path that includes that tile, otherwise, anything that spawns there
     * might be unreachable.
     * @return {null}
     */
    window.game.Map.prototype.ensureAllWalkableTilesAreInAPath = function() {
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];
            if ( !tile.isWalkable ) continue;

            if ( !this.tileInAnyPath(tile) ) {
                console.log('WARNING: the tile at (' + tile.x + ', ' + tile.y + 
                    ') doesn\'t appear in any path. This should probably just be removed from the map entirely.');
                game.util.debugDisplayText('Check console log - tile found without a path.');
            }
        };
    };

    /**
     * Returns true if any path in this map contains the tile passed in.
     * @param  {Tile} tile - the tile to check for
     * @return {Boolean}      true if a path contains that tile
     */
    window.game.Map.prototype.tileInAnyPath = function(tile) {
        for (var j = 0; j < this.paths.length; j++) {
            var path = this.paths[j];
            for (var k = 0; k < path.length; k++) {
                if ( path[k].tileIndex == tile.tileIndex ) {
                    return true;
                }
            };
        };
        return false;
    };

    /**
     * This is just a debug function that prints paths like this:
     * Path #0: (1, 3) (2, 3) (3, 3)
     * Path #1: (1, 3) (2, 3) (3, 2)
     * @param  {Boolean} onlyPrintLeftToRightPaths - if true, this will only
     * print paths that go left-to-right.
     * @return {null}
     */
    window.game.Map.prototype.printPaths = function(onlyPrintLeftToRightPaths) {
        var lastPathToPrint = this.paths.length;
        if ( onlyPrintLeftToRightPaths ) lastPathToPrint /= 2;
        for (var i = 0; i < lastPathToPrint; i++) {
            var path = this.paths[i];
            var pString = '';
            for (var j = 0; j < path.length; j++) {
                if ( j > 0 ) pString += ' ';
                // pString += path[j].tileIndex;
                pString += '(' + path[j].x + ', ' + path[j].y + ')';
            };
            console.log('Path #' + i + ': ' + pString);
        };
    };

    /**
     * If 'array' contains the Tile, this function will remove it.
     *
     * We don't just use array.indexOf(tile) to find it because the Tile objects
     * may not be the same, so we compare tileIndex.
     * @param  {Tile} tile  - the tile to remove
     * @param  {Array:Tile} array - an array of Tiles
     * @return {null}
     */
    window.game.Map.prototype.removeTileFromArray = function(tile, array) {
        for (var i = 0; i < array.length; i++) {
            if ( array[i].tileIndex == tile.tileIndex ) {
                array.splice(i,1); // no need for i-- since we're breaking
                break;
            }
        };
        return;
    };

    /**
     * Gets left-to-right paths between startTile and endTile. We only calculate
     * LTR paths because RTL paths are simply the reverse of those (this is
     * possible because we don't have any one-way tiles), so this allows us to
     * compute half the number of paths we actually need. Paths cannot involve
     * backtracking.
     *
     * We start by getting every single possible path, then we prune the list of
     * paths to only the set of paths that "make sense". See optimizePaths for
     * that logic. We also remove duplicate paths so that one path doesn't have
     * a higher chance to be taken than any other path. Note that this pruning
     * is substantial - our test map has 197 paths that are eventually pruned to
     * five.
     *
     * The algorithm is actually pretty simple even though it took me several
     * hours to come to it:
     * 1. Start at startTile.
     * 2. Get the neighbors of the current tile. If there's only one, then 
     *    advance to that as the new "current" tile. If there is more than one,
     *    then we're at a fork. Capture a snapshot of the current state and add
     *    this snapshot to a list of things yet to be explored. The state 
     *    consists of the path thus far and a list of tiles that have been seen
     *    already.
     * 3. When the current tile is endTile, we've found a path.
     * 4. Keep pulling our fork snapshots off the list until we've explored
     *    absolutely everything.
     *    
     * This algorithm is needed because it is not possible for units to figure 
     * out where to go based on the tile they're on; they need to look ahead to
     * make sure they don't have to backtrack.
     *
     * Also, I'm 99% certain (but I haven't mathematically proven) that it's
     * not possible to REPRODUCE the state when you backtrack, so an algorithm
     * like "DFS with backtracking" won't work. This is why we take snapshots
     * instead, that way we don't have to reproduce it.
     * 
     * @param  {Tile} startTile - the tile to start at
     * @param  {Tile} endTile   - the tile to end at
     * @return {Array:(Array:Tile)}           a list of valid paths
     */
    window.game.Map.prototype.getPathsFrom = function(startTile, endTile) {
        /**
         * The paths that we'll return.
         * @type {Array:(Array:Tile)}
         */
        var paths = [];

        /**
         * Despite being a 'stack', this never actually contains more than one
         * item, because every time we get to a fork, we push to forkList.
         * @type {Array:Tile}
         */
        var stack = [];

        /**
         * A list of Tiles that have been seen already.
         * @type {Array:Tile}
         */
        var seen = [];

        /**
         * Every time we see a fork, we push to this list. It contains the state
         * mentioned in the function-level comments:
         *
         * startTile - the fork to take (it is not the origin of the fork,
         * rather it is one of the origin's neighbors)
         * seen - an array of Tiles that have already been seen
         * path - an array of Tiles that form the path leading up to the fork
         * @type {Array}
         */
        var forkList = [ {startTile:startTile, seen:[startTile], path:[]}];

        /**
         * The current path that we're building.
         * @type {Array:Tile}
         */
        var path = [];

        /**
         * The next Tile to look at.
         * @type {Tile}
         */
        var next = null;

        while ( forkList.length > 0 ) {
            var fork = forkList.pop();
            var forkStartTile = fork.startTile;
            var forkSeen = fork.seen;
            var forkPath = fork.path;

            // Revert the state to what it looked like when we forked
            stack = [forkStartTile];
            seen = forkSeen.slice(0); // copy the array
            path = forkPath.slice(0); // copy the array

            while ( stack.length > 0 ) {
                next = stack.pop();
                path.push(next);

                if ( next.tileIndex == endTile.tileIndex ) {
                    // We found a valid path!
                    var pathCopy = path.slice(0);
                    paths.push(pathCopy);
                    break;
                }

                var neighbors = this.getAdjacentTiles(next, true);

                if ( neighbors.length == 1 ) {
                    stack.push(neighbors[0]);
                } else {
                    for (var i = 0; i < neighbors.length; i++) {
                        var n = neighbors[i];
                        if ( seen.indexOf(n) != -1 ) continue;

                        // The neighbor will only be considered 'seen' for the
                        // fork snapshot, which is why we pop it right after
                        // this. If we didn't, then we would prevent ourselves
                        // from checking certain paths.
                        seen.push(n);
                        forkList.push({startTile:n, seen:seen.slice(0), path:path.slice(0)});
                        seen.pop();
                    }
                }
            }
        }

        // I highly suggest you read the comment for optimizePaths
        this.optimizePaths(paths);

        // Remove duplicate paths
        this.removeDuplicatePaths(paths);
        
        return paths;
    };

    /**
     * Returns true if two paths contain all of the same tiles in the same order
     * @param  {Array:Tile} path1 - one path to compare
     * @param  {Array:Tile} path2 - the other path to compare
     * @return {Boolean}       true if they're equal
     */
    window.game.Map.prototype.arePathsEqual = function(path1, path2) {
        // They can only be equal if their lengths are equal
        if ( path1.length != path2.length ) return false;

        // Compare each tile now
        for (var i = 0; i < path1.length; i++) {
            if ( path1[i].tileIndex != path2[i].tileIndex ) {
                return false;
            }
        };
        return true;
    };

    /**
     * Given a set of paths, this will remove all duplicates from. The removal
     * is done by brute force, which is O(n²) in this case.
     * @param  {Array:(Array:Tile)} paths - an array of paths
     * @return {null}
     */
    window.game.Map.prototype.removeDuplicatePaths = function(paths) {
        // Compare every path to every other path
        for (var i = 0; i < paths.length; i++) {
            for (var j = 0; j < paths.length; j++) {
                if ( i == j ) continue;
                if ( this.arePathsEqual(paths[i], paths[j]) ) {
                    paths.splice(j,1);
                    j--;
                }
            };
        };
    }

    /**
     * This removes any path that violates any of the rules listed in this
     * function (each rule is clearly commented in the function).
     *
     * Paths can be safely removed rather than "fixing" them because
     * computePaths will have generated EVERY possible path, so the "fixed" path
     * will also exist in "paths", but it won't violate any rules.
     * @param  {Array:(Array:Tile)} paths - a set of paths
     * @return {null}
     */
    window.game.Map.prototype.optimizePaths = function(paths) {
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];

            //
            // RULE: paths cannot be empty
            //
            if ( path.length == 0 ) {
                console.log('A 0-length path was found in this map. This should be impossible. Removing it for now.');
                paths.splice(i,1);
                i--;
                continue;
            }

            if ( path.length < 3 ) continue;
            for (var j = 0; j < path.length - 2; j++) {
                var tile1 = path[j];
                var tile2 = path[j+1];
                var tile3 = path[j+2];
                var tile2TouchesTile4 = true;
                var tile3IsEndPoint = (j+2 == path.length - 1);
                if ( j+3 < path.length ) {
                    var neighbors2 = this.getAdjacentTiles(tile2, true);
                    var tile4 = path[j+3];
                    tile2TouchesTile4 = (neighbors2.indexOf(tile4) != -1);
                }

                //
                // RULE: if tile3 is a cardinal neighbor of tile1, then there
                // was no point in having tile2. To illustrate this, see below.
                // There are four tiles that you visit in the order shown so
                // that the movement is (down+right, up, right):
                // 
                //     0 2 3
                //       1
                //       
                // Instead, we want this: 0 1 2
                //
                var neighbors1 = this.getAdjacentTiles(tile1, true);
                if ( neighbors1.indexOf(tile3) != -1 ) {

                    if ( this.areTilesCardinal(tile1, tile3) ) {
                        paths.splice(i,1);
                        i--;
                        break;
                    }
                }
            };
        };

        //
        // RULE: any time there is a path that goes start-->diagonal-->diagonal
        // that COULD be done as start-->cardinal-->cardinal should be removed.
        // 
        // For example, consider the below paths ('-' is a walkable tile that
        // does not appear in the path):
        //   1 
        // 0 - 2     0 - 2
        //             1
        //             
        // Both of the above paths should look like this: 0 1 2
        // 
        // Those are the only two cases where start-->diagonal-->diagonal can
        // even exist since there is no moving backwards.
        //
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            if ( path.length < 3 ) continue;
            for (var j = 0; j < path.length - 2; j++) {
                var tile1 = path[j];
                var tile2 = path[j+1];
                var tile3 = path[j+2];
                var potentialMiddleTile = this.mapTiles[tile1.tileIndex + 1];
                if ( tile2.x == tile1.x + 1 && tile2.y != tile1.y && tile3.y == tile1.y && tile3.x == tile1.x + 2 && potentialMiddleTile.isWalkable ) {
                    paths.splice(i,1);
                    i--;
                    break;
                }
            };
        };

        //
        // RULE: no cutting corners. Any time you have a diagonal neighbor and
        // you could've gone through a cardinal neighbor to get there, remove
        // the path entirely.  For example, imagine the path below ('-' is a
        // walkable tile that does not appear in the path):
        // 
        // 0
        // - 1
        // 
        // The above should look like this:
        // 
        // 0
        // 1 2
        // 
        // This rule is in place so that the '-' tile above can actually be
        // navigated to.
        // 
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            if ( path.length < 2 ) continue;
            for (var j = 0; j < path.length - 1; j++) {
                var tile1 = path[j];
                var tile2 = path[j+1];
                var neighbors1 = this.getAdjacentTiles(tile1, true);
                neighbors1 = this.pruneDiagonalIfCardinalExist(tile1, neighbors1);
                if ( neighbors1.indexOf(tile2) == -1 ) {
                    paths.splice(i,1);
                    i--;
                    break;
                }
            };
        };
    };

    /**
     * Returns true if the tiles are diagonally touching, e.g. any of these:
     *  0 2
     *   4
     *  6 8
     * 
     * @param  {Tile} tile1 - one tile to compare
     * @param  {Tile} tile2 - the other tile to compare
     * @return {Boolean}       true if diagonally touching
     */
    window.game.Map.prototype.areTilesDiagonal = function(tile1, tile2) {
        var index1 = tile1.tileIndex;
        var index2 = tile2.tileIndex;
        var c = this.numCols;

        return (index1 == index2 - c - 1) || (index1 == index2 - c + 1) ||
             (index2 == index1 - c - 1) || (index2 == index1 - c + 1);
    };
    
    /**
     * Returns true if the tilse are cardinally touching, e.g. any of these:
     *   1 
     *  345
     *   7 
     * 
     * @param  {Tile} tile1 - one tile to compare
     * @param  {Tile} tile2 - the other tile to compare
     * @return {Boolean}       true if cardinally touching
     */
    window.game.Map.prototype.areTilesCardinal = function(tile1, tile2) {
        var index1 = tile1.tileIndex;
        var index2 = tile2.tileIndex;
        var c = this.numCols;

        return (index1 == index2 - c) || (index1 == index2 + c) ||
             (index1 == index2 - 1) || (index1 == index2 + 1);
    };

    /**
     * Given a tile and its neighbors, this will remove any neighbor that is
     * diagonal to the tile assuming there is a cardinal that touches both the
     * tile and the diagonal.
     *
     * The best way to illustrate this is below. Suppose you represent tiles
     * this way:
     *   0 1 2
     *   3 4 5
     *   6 7 8
     *
     * '4' is represented by 'tile', and the other numbers may exist in
     * 'neighbors'. The logic is this:
     * 
     * '0' will be removed if '1' or '3' exists
     * '2' will be removed if '1' or '5' exists
     * '6' will be removed if '3' or '7' exists
     * '8' will be removed if '5' or '7' exists
     *
     * So if we pass in:
     *   0 1
     *   3 4
     *   6   8
     *
     * '0' and '6' will be removed because they have adjacent cardinals.
     *
     * @param  {Tile} tile      - the tile whose neighbors you're passing in
     * @param  {Array:Tile} neighbors - the neighbors to prune
     * @return {Array:Tile}           - a list with diagonals pruned
     */
    window.game.Map.prototype.pruneDiagonalIfCardinalExist = function(tile, neighbors) {
        // tileX and Y below
        var tx = tile.x;
        var ty = tile.y;

        /**
         * This is the list of neighbors to keep. We may not end up pruning
         * anything.
         * @type {Array:Tile}
         */
        var keepThese = [];

        // These are all Tile objects:
        // leftup    up   upright
        // left     tile  right
        // downleft down  rightdown
        // 
        // They will be null if they don't exist in 'neighbors'.
        var up = null;
        var upright = null;
        var right = null;
        var rightdown = null;
        var down = null;
        var downleft = null;
        var left = null;
        var leftup = null;

        // Go through each neighbor and set the above if such a neighbor exists
        for (var i = 0; i < neighbors.length; i++) {
            var n = neighbors[i];
            var nx = n.x; // neighbor x
            var ny = n.y; // neighbor y
            if ( nx == tx ) {
                if ( ny == ty - 1 ) up = n;
                if ( ny == ty + 1 ) down = n;
            }
            if ( ny == ty ) {
                if ( nx == tx - 1 ) left = n;
                if ( nx == tx + 1 ) right = n;
            }
            if ( nx == tx - 1 && ny == ty - 1 ) leftup = n;
            if ( nx == tx + 1 && ny == ty - 1 ) upright = n;
            if ( nx == tx + 1 && ny == ty + 1 ) rightdown = n;
            if ( nx == tx - 1 && ny == ty + 1 ) downleft = n;

        };

        // Always keep all of the cardinals; we only prune diagonals
        if ( up ) keepThese.push(up);
        if ( right ) keepThese.push(right);
        if ( down ) keepThese.push(down);
        if ( left ) keepThese.push(left);

        // Keep only diagonals whose corresponding cardinals do not exist
        if ( leftup && !left && !up ) keepThese.push(leftup);
        if ( upright && !up && !right ) keepThese.push(upright);
        if ( rightdown && !right && !down ) keepThese.push(rightdown);
        if ( downleft && !down && !left ) keepThese.push(downleft);

        return keepThese;
    };

    /**
     * Gets either the right or left walkable neighbors of the tile passed in.
     * @param  {Tile} tile        - the tile whose neighbors you want to find
     * @param  {Boolean} facingRight - if true, this will return the right
     * neighbors
     * @return {Array:Tile}             - an array of neighbors. If there are no
     * neighbors, the return value is an array of length 0, not null
     */
    window.game.Map.prototype.getAdjacentTiles = function(tile, facingRight) {
        var tileX = tile.x;
        var tileY = tile.y;
        var tileIndex = tile.tileIndex;

        /**
         * The indices of each neighbor. They may be invalid, in which case
         * they'll be rejected at the end instead of being turned into Tiles.
         * @type {Array:Number}
         */
        var indices = []; // the indices of each tile that we choose

        /**
         * The return value of this function. These are the adjacent tiles.
         * @type {Array:Tile}
         */
        var tiles = [];

        // If we're out of bounds, then we return immediately
        if ( tileX < 0 || tileX >= this.numCols || tileY < 0 || tileY >= this.numRows ) {
            return tiles;
        }

        // Imagine a 3x3 grid like the one below where 'tile' is in the center.
        // The left neighbors of '4' are [0,1,3,6,7], and the right neighbors
        // are [1,2,5,7,8].
        //
        // 0 1 2
        // 3 4 5
        // 6 7 8
        if ( !facingRight && tileX > 0) {
            // 0
            indices.push(tileIndex - this.numCols - 1);
            // 3
            indices.push(tileIndex - 1);
            // 6
            indices.push(tileIndex + this.numCols - 1);
        }

        if ( tileY > 0 ) {
            // 1
            indices.push(tileIndex - this.numCols);
        }

        if ( tileY < this.numRows - 1) {
            // 7
            indices.push(tileIndex + this.numCols);
        }

        if ( facingRight && tileX < this.numCols - 1) {
            // 2
            indices.push(tileIndex - this.numCols + 1);
            // 5
            indices.push(tileIndex + 1);
            // 8
            indices.push(tileIndex + this.numCols + 1);
        }

        // Go through each of the indices now and convert the valid ones into
        // tiles. Valid tiles are walkable, in-bounds tiles.
        for (var i = 0; i < indices.length; i++) {
            var index = indices[i];
            if ( index >= 0 && index < this.mapTiles.length ) {
                var neighbor = this.mapTiles[index];
                if ( !neighbor.isWalkable ) continue;

                tiles.push(neighbor);
            }
        };

        return tiles;
    };

    /**
     * Draws this map.
     * @param  {Object} ctx The canvas context
     * @param {Boolean} drawingFogLayer If true, then the map will be drawn
     * wherever there is fog. If false, the map will be drawn EXCEPT where there
     * is fog. This is for performance, otherwise we'd be drawing the map twice
     * despite that it won't show the first time since it's under fog.
     * @return {null}
     */
    window.game.Map.prototype.draw = function(ctx, drawingFogLayer) {
        var index;
        var graphic;
        var tile;
        ctx.fillStyle = 'rgba(0,0,0,1)';
        for (var y = 0; y < this.numRows; y++) {
            for (var x = 0; x < this.numCols; x++) {
                index = y * this.numCols + x;
                tile = this.mapTiles[index];

                // Only draw tiles that the map can see
                if ( game.Camera.canSeeTile(tile) ) {

                    graphic = tile.graphicIndex;
                    
                    if ( drawingFogLayer ) {
                        if ( this.fog[index] ) {

                            // Draw black in the background for now since
                            // there's no background beneath our map to begin
                            // with. TODO: we should be able to remove this
                            // eventually and not see units show up behind
                            // castles.
                            ctx.fillRect(0, 0, tileSize, tileSize);
                            envSheet.drawSprite(ctx, graphic, 0,0);
                        }
                    } else {
                        // If there's no fog here and we're not drawing the fog
                        // layer, then we just draw the map normally.
                        if ( !this.fog[index] ) {
                            envSheet.drawSprite(ctx, graphic, 0,0);
                        }
                    }
                }

                ctx.translate(tileSize, 0);
            }
            ctx.translate(-tileSize * this.numCols, tileSize);
        }
    };

    /**
     * Draws the map, then draws a slightly opaque black layer. Both of these
     * things are done ONLY where there is fog.
     *
     * I suggest commenting this function out completely if you want to see
     * what's really happening with our map-drawing logic.
     * @param  {Object} ctx - the canvas context
     * @return {null}
     */
    window.game.Map.prototype.drawFog = function(ctx) {
        // Draw the map on top of anything that was previously drawn (e.g.
        // characters, items).
        ctx.save();
        this.draw(ctx, true);
        ctx.restore();

        // Draw just the fog itself now
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        for (var y = 0; y < this.numRows; y++) {
            for (var x = 0; x < this.numCols; x++) {
                if ( this.fog[y * this.numCols + x] ) {
                    // Only draw fog if the camera can see it
                    if ( game.Camera.canSeeTileCoordinates(x, y) ) {
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                }
            }
        }
        ctx.restore();
    };

    /**
     * Debug function to draw a path, that way you don't have to read a string
     * representation or wait for units to take the path.
     * @param  {Object} ctx - canvas context
     * @return {null}
     */
    window.game.Map.prototype.drawPaths = function(ctx) {
        ctx.save();

        // Inject these variables into the class when you call this function,
        // that way they don't need to exist for non-debug code.
        // 
        // 'cooldown' is how long to wait before switching which path we draw
        // 'drawPathNumber' is which path we're drawing
        if ( undefined === this.cooldown ) this.cooldown = 16;
        if ( undefined === this.drawPathNumber ) this.drawPathNumber = 0;

        if ( this.cooldown-- == 0 )  { 
            this.cooldown = 25
            this.drawPathNumber++;
            // "/2" is so we only draw the paths from left to right
            if ( this.drawPathNumber == this.paths.length / 2) {
                this.drawPathNumber = 0;
            }
            game.util.debugDisplayText(this.drawPathNumber + ' / ' + (this.paths.length/2 - 1));
        }

        var blink = Math.sin(game.alphaBlink * 4);
        var alpha = blink * .1 + .3;
        var drawPath = this.paths[this.drawPathNumber];
        if ( drawPath != null ) {
            for (var i = 0; i < drawPath.length; i++) {
                var tile = drawPath[i];

                // Alternate between RGB so that you can tell what order the
                // path is in.
                var mod = i % 3;
                if ( mod == 0 ) {
                    ctx.fillStyle = 'rgba(255, 0, 0, ' + alpha + ')';
                } else if ( mod == 1 ) {
                    ctx.fillStyle = 'rgba(0, 255, 0, ' + alpha + ')';
                } else {
                    ctx.fillStyle = 'rgba(0, 0, 255, ' + alpha + ')';
                }
                ctx.fillRect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
            };
        }
        ctx.restore();
    }

    /**
     * Sets or clears fog in an area.
     * @param {Number} x      - x coordinate in tiles
     * @param {Number} y      - y coordinate in tiles
     * @param {Number} radius - distance from (x,y) to set/clear fog
     * @param {Boolean} foggy  - if true, this will MAKE fog of war. If false,
     * it will clear it.
     * @param {Boolean} drawCircular - if true, this will draw a diamond/circle
     * shape, if false, it will draw a square
     */
    window.game.Map.prototype.setFog = function(x, y, radius, foggy, drawCircular) {
        var index;
        for (var i = x - radius; i < x + radius + 1; i++) {
            for (var j = y - radius; j < y + radius + 1; j++) {

                // Ignore anything that's out of bounds
                if ( i < 0 || j < 0 || i >= this.numCols || j >= this.numRows ) continue;

                // Check Manhattan distance
                if ( drawCircular && Math.abs(x - i) + Math.abs(y - j) > radius ) continue;

                index = (i % this.numCols) + j * this.numCols;
                this.fog[index] = foggy;
            };
        };
    };

    /**
     * Tells whether or not the tiles passed in point to a spawner point
     * @param  {Number}  tileX Tile X coordinate
     * @param  {Number}  tileY Tile Y coordinate
     * @return {Boolean}        Returns true if the point is a spawning point,
     *                                  otherwise returns false
     */
    window.game.Map.prototype.isSpawnerPoint = function(tileX, tileY) {
        var index = tileY * this.numCols + tileX;
        return this.mapTiles[index].isSpawnerPoint;
    };

}());
