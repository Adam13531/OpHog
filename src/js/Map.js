( function() {

    /**
     * Makes a new map. This will also call this.initialize(), because the
     * constructor itself only sets up very basic things.
     * @param {Array:Number} arrayOfOnesAndZeroes - an array whose length must
     * be a multiple of 'width'. A 0 represents a nonwalkable tile, a 1
     * represents a walkable tile.
     * @param {Number} width                - width of this map
     */
    window.game.Map = function Map(arrayOfOnesAndZeroes, width) {

        // Go through arrayOfOnesAndZeroes, and remove any blank rows at the
        // start.
        // 
        // Need to save 'numRows' here because otherwise the value would change
        // as we iterated
        var numRows = arrayOfOnesAndZeroes.length / width;
        var found = false;
        for (var i = 0; i < numRows; i++) {
            for (var j = 0; j < width; j++) {
                if ( arrayOfOnesAndZeroes[j] == 1 ) {
                    found = true;
                    break;
                }
            };    
            if ( found ) break;

            // Remove that row
            arrayOfOnesAndZeroes.splice(0, width);
        };

        // For now, since we're only passing in ones and zeroes, we need to save
        // this variable here so that the GameDataManager can save this array.
        this.arrayOfOnesAndZeroes = arrayOfOnesAndZeroes;

        // Convert the array of 0s and 1s to map tiles
        var mapTilesIndices = [];
        for (var i = 0; i < arrayOfOnesAndZeroes.length; i++) {
            mapTilesIndices.push((arrayOfOnesAndZeroes[i] == 0) ? 5 : 88);
        };

        this.numCols = width;
        this.numRows = mapTilesIndices.length / this.numCols;

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
            this.fog.push(false);
        };

        this.widthInPixels = this.numCols * tileSize;
        this.heightInPixels = this.numRows * tileSize;

        this.initialize();
    };

    /**
     * After setting up this.mapTiles, call this function. Without calling this,
     * various parts of the map will be broken.
     * @return {undefined}
     */
    window.game.Map.prototype.initialize = function() {
        // The endpoints need to be calculated so that we can figure out the
        // tile lists.
        this.figureOutEndpoints();

        // This is what essentially computes "paths"
        this.buildTileList(true);
        this.buildTileList(false);

        this.convertAllLeftEndpointsToSpawners();

        this.clearFogAroundSpawners();

        // Now that we have spawn points, we can place the generators.
        this.placeGenerators();
    };
    
    /**
     * Clears an area of fog around each spawner.
     * @return {undefined}
     */
    window.game.Map.prototype.clearFogAroundSpawners = function() {
        var spawners = this.getAllSpawnerTiles();
        for (var i = 0; i < spawners.length; i++) {
            this.setFog(spawners[i].x, spawners[i].y, 3, false);
        };
    };

    /**
     * This adds a boss unit to the map. This cannot be done in the constructor
     * because placing the boss depends on a fully constructed map.
     * @return {undefined}
     */
    window.game.Map.prototype.addBossUnit = function() {
        // Make a lv. 20 tree
        var bossUnit = new game.Unit(game.UnitType.TREE.id,false,20);
        bossUnit.movementAI = game.MovementAI.BOSS;
        bossUnit.convertToBoss();

        // Pick an x and y coordinate that will work on any map.
        var x = this.numCols - 3;
        var y = Math.floor(this.numRows / 2);

        bossUnit.placeUnit(x, y);
        game.UnitManager.addUnit(bossUnit);
    };

    /**
     * This simply goes through each left-endpoint and makes them all spawners.
     * @return {undefined}
     */
    window.game.Map.prototype.convertAllLeftEndpointsToSpawners = function() {
        for (var i = 0; i < this.mapTiles.length; i++) {
            if ( this.mapTiles[i].isLeftEndpoint ) { 
                this.mapTiles[i].convertToSpawner();
            }
        };
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

        // This is a debug value and will eventually be based on the map number
        // or something. Actually, a lot of this code will change.
        var highestEnemyID = 4;

        // Make generators at each spot that we determined above
        for (var i = 0; i < generatorCoords.length; i++) {
            var x = generatorCoords[i][0];
            var y = generatorCoords[i][1];

            // Figure out which enemies can be spawned from this generator.
            var possibleEnemies = [];
            
            // Go through each ID and potentially make a PossibleEnemy.
            for (var enemyID = 0; enemyID < highestEnemyID; enemyID++) {
                var r = game.util.randomInteger(0, 2);

                // If we randomly generated 0 OR if we didn't add any possible
                // enemies yet, then we will add this type.
                if ( r == 0 || (enemyID == highestEnemyID - 1 && possibleEnemies.length == 0) ) {
                    // Enemies with higher IDs will appear more frequently (this
                    // is just debug logic).
                    var relativeWeight = enemyID + 1;

                    // These level ranges are arbitrary
                    var minLevel = 1;
                    var maxLevel = 5;
                    var possibleEnemy = new game.PossibleEnemy(enemyID, relativeWeight, minLevel, maxLevel);
                    possibleEnemies.push(possibleEnemy);
                }
            };

            var generator = new game.Generator(x, y, possibleEnemies);
            game.GeneratorManager.addGenerator(generator);
        };
    };

    /**
      * Each walkable tile will have an even chance of being chosen.
      * 
      * @return {Tile} a random, walkable tile
     */
    window.game.Map.prototype.getRandomWalkableTile = function() {
        return game.util.randomArrayElement(this.getAllWalkableTiles());
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
     * Returns true if the tile passed in is an endpoint. An endpoint is either
     * the very beginning or very end of a path.
     *
     * Right-endpoints cannot have right-neighbors, i.e. a left-to-right path
     * must ALWAYS end with a positive X movement (in clearer terms: "a path
     * can't end by with a vertical section"). The reason we can't allow this is
     * simple: imagine a '+'-shaped map. The top and bottom points are
     * left-endpoints (which is fine), but they would also be right-endpoints if
     * we allowed right-endpoints to have right-neighbors! That could lead to
     * paths that end before the enemy's castle.
     * @param  {Tile} tile                - the tile to test
     * @param  {Boolean} testForLeftEndpoint - if true, this will return test to
     * see if the tile passed in is a left-endpoint. If false, it'll check if
     * it's a right-endpoint.
     * @return {Boolean}
     */
    window.game.Map.prototype.isTileAnEndpoint = function(tile, testForLeftEndpoint) {
        var leftNeighbors = this.getAdjacentTiles(tile, false);
        var rightNeighbors = this.getAdjacentTiles(tile, true);

        // Right-endpoints cannot have right-neighbors. See the function
        // comments.
        if ( !testForLeftEndpoint ) {
            return rightNeighbors.length == 0;
        }

        // If there are no left-neighbors, then yes, this is an endpoint.
        if ( leftNeighbors.length == 0 ) {
            return true;
        }

        // Otherwise, it can have at most one left neighbor, and that neighbor
        // must be vertical.
        if ( leftNeighbors.length > 1 ) {
            return false;
        }

        // Otherwise, it must have right-neighbors, and all of them must also be
        // a left-neighbor.
        if ( rightNeighbors.length == 0 ) {
            return false;
        }

        for (var i = 0; i < rightNeighbors.length; i++) {
            var found = false;
            for (var j = 0; j < leftNeighbors.length; j++) {
                if ( rightNeighbors[i] === leftNeighbors[j] ) {
                    found = true;
                    break;
                }
                if ( !found ) {
                    return false;
                }
            };
        };

        return true;
    };

    /**
     * This function will set isRightEndpoint and isLeftEndpoint in each tile.
     * @return {undefined}
     */
    window.game.Map.prototype.figureOutEndpoints = function() {
        var foundRightEndpoint = false;
        var foundLeftEndpoint = false;
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];

            // We only consider walkable tiles
            if ( !tile.isWalkable ) continue;

            if ( this.isTileAnEndpoint(tile, false) ) {
                tile.isRightEndpoint = true;
                foundRightEndpoint = true;
            }
            
            if ( this.isTileAnEndpoint(tile, true) ) {
                if ( tile.isRightEndpoint ) {
                    game.util.debugDisplayText('Fatal error: a tile is both ' +
                        'a left and right endpoint. Index: ' + tile.tileIndex + 
                        'two endpoints');
                }
                tile.isLeftEndpoint = true;
                foundLeftEndpoint = true;
            }
        }

        if ( !foundRightEndpoint ) {
            game.util.debugDisplayText('Fatal error: no right-endpoints found.', 
                'no right endpoints');
        }

        if ( !foundLeftEndpoint ) {
            game.util.debugDisplayText('Fatal error: no left-endpoints found.', 
                'no left endpoints');
        }
    };

    /**
     * This function will build leftList or rightList depending on the argument
     * that you pass in.
     *
     * IMPORTANT NOTE: this entire function has comments and variable names like
     * "startNeighbors" and "endNeighbors" instead of "left" and "right". When
     * buildingLeftList==true, "start" refers to the left and "end" refers to
     * the right.
     *
     * See Tile.js for comments on what leftList and rightList represent.
     * @param  {Boolean} buildingLeftList - if true, build leftList, otherwise
     * rightList
     * @return {undefined}
     */
    window.game.Map.prototype.buildTileList = function(buildingLeftList) {
        // Form the very basic left/rightList. This will be pruned repeatedly in
        // this function.
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];
            var listToUse = buildingLeftList ? tile.leftList : tile.rightList;

            if ( !tile.isWalkable ) {
                continue;
            }

            var startNeighbors = this.getAdjacentTiles(tile, !buildingLeftList);
            var endNeighbors = this.getAdjacentTiles(tile, buildingLeftList);

            // startKeys and endKeys will simply refer to the neighbors UNLESS
            // this is a left or right endpoint, in which case it also refers to
            // itself.
            var startKeys = startNeighbors;
            var endKeys = endNeighbors;

            var tileIsEndEndpoint = buildingLeftList ? tile.isRightEndpoint : tile.isLeftEndpoint;

            // If the tile is an "end" endpoint, then we push the tile itself to
            // its end-keys. If we didn't, right-endpoints would not have any
            // endKeys because they don't have any right-neighbors.
            if ( tileIsEndEndpoint ) {
                endKeys.push(tile);
            } else {
                // If it's not an "end" endpoint, then we push the tile itself
                // to the start-keys in case the unit is ever placed directly on
                // this tile without coming from another tile.
                //
                // For example:
                // 0 1 2
                // 3   4
                // 5 6 7 8 9
                // 
                // 0 only has one left neighbor, 3, so all paths would go right
                // unless you also add 0 as a left neighbor.
                startKeys.push(tile);
            }

            // If there's only one endKey, then we HAVE to go to that tile from
            // our startKeys. However, if there are 2 or more, then we go
            // through each neighbor and figure out: can I reach ANY endpoint
            // from that neighbor without backtracking? If no, then that
            // neighbor should be removed from endKeys.
            if ( endKeys.length >= 2 ) {
                for (var j = 0; j < endKeys.length; j++) {
                    if ( !this.combinedAlgoExistsPathFromHereToAnyEndpoint(endKeys[j], tile, buildingLeftList, false) ) {
                        endKeys.splice(j, 1);
                        j--;
                    }
                };
            }

            // Regardless of what we did, set the keys now.
            for (var j = 0; j < startKeys.length; j++) {
                // Make a copy of the array by slicing so that we don't modify
                // all start-neighbors when we delete keys in the pruning phase.
                listToUse[startKeys[j].tileIndex] = endKeys.slice(0);
            };
        };

        // Prune out any entries in the left/rightList that don't need to exist.
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];
            var listToUse = buildingLeftList ? tile.leftList : tile.rightList;

            for ( var tileIndex in listToUse ) {
                // startNeighbor just represents any tile that you could've come
                // from to get to this tile.
                var startNeighbor = this.mapTiles[tileIndex];

                // endNeighbors represents the tiles you can go to from this
                // tile when you came from startNeighbor
                var endNeighbors = listToUse[tileIndex];

                // If startNeighbor is in endNeighbors, remove it. A tile is
                // both a left and right neighbor when it's vertically adjacent,
                // and it doesn't make sense to go from A to B back to A again.
                var removedstartNeighbor = this.removeTileFromArray(startNeighbor, endNeighbors);

                // If we did just remove the startNeighbor, then we should remove
                // any tiles that are *cardinally* adjacent to startNeighbor too,
                // because of this scenario:
                //
                // 0
                // 1 2
                // 
                // Suppose we're looking at 0, and 1 is our startNeighbor in
                // this case. 1 is also a right-neighbor of 0, so we remove it
                // in the code above. However, 0 still thinks it can go to 2
                // when it comes from 1, which is unnecessary because 1 could've
                // gone directly to 2.
                //
                // It turns out that the only neighbor we could remove in such a
                // case is the end-neighbor since we're talking about vertical
                // paths here.
                if ( removedstartNeighbor ) {
                    // If we're building the left list, then check the tile to
                    // the right.
                    if ( buildingLeftList ) {
                        if ( startNeighbor.x < this.numCols && this.mapTiles[startNeighbor.tileIndex + 1].isWalkable ) {
                            this.removeTileFromArray(this.mapTiles[startNeighbor.tileIndex + 1], endNeighbors);
                        }
                    } else {
                        // Otherwise, check the tile to the left.
                        if ( startNeighbor.x > 0 && this.mapTiles[startNeighbor.tileIndex - 1].isWalkable ) {
                            this.removeTileFromArray(this.mapTiles[startNeighbor.tileIndex - 1], endNeighbors);
                        }
                    }
                }

                // Any time you go to a diagonal when you could've gone to a
                // cardinal, remove the diagonal entirely.
                var pruned = this.pruneDiagonalIfCardinalExist(tile, endNeighbors);

                // Suppose you are considering 1 and you prune 12 as a right
                // neighbor. Then you need to remove '1' from '12's leftList
                // because 1 is a left neighbor of 12,
                if ( pruned.length != endNeighbors.length ) {

                    // find what we pruned
                    var theseWereRemoved = [];
                    for (var j = 0; j < endNeighbors.length; j++) {
                        var rnToCheck = endNeighbors[j];
                        var found = false;
                        for (var k = 0; k < pruned.length; k++) {
                            if ( pruned[k].tileIndex == rnToCheck.tileIndex ) {
                                found = true;
                                break;
                            }
                        };
                        if ( !found ) {
                            theseWereRemoved.push(rnToCheck);
                        }
                    };
                }

                // Of the remaining, make sure that there's still a path from
                // there to the end. There's a very specific case where this can
                // happen. Picture the following:
                // 
                // 0 1 2
                // 3   4
                // 5 6 7 8 9
                // 
                // At first, when we try to form leftList originally, we figure
                // out that 7 can go to 4 via this path: 0 3 5 6 7 4 8 9.
                // However, we spliced out the "7 4 8" sequence because "7 8"
                // should be preferred, so now, 7 shouldn't be able to go to 4.
                for (var j = 0; j < pruned.length; j++) {
                    if ( !this.combinedAlgoExistsPathFromHereToAnyEndpoint(pruned[j], tile, buildingLeftList, true) ) {
                        pruned.splice(j, 1);
                        j--;
                    }
                };

                if ( pruned.length == 0 ) {
                    delete listToUse[tileIndex];
                } else {
                    if ( buildingLeftList ) { 
                        tile.leftList[tileIndex] = pruned;
                    } else {
                        tile.rightList[tileIndex] = pruned;
                    }
                }
            }
        };

        // Go through one more time and remove any paths that don't connect. This is in this case:
        // 111.ABC
        // ..1.D..
        // ..111..
        // ...1...
        // ...1...
        // ...1111
        // 
        // When considering tile D coming from tile A and
        // buildingLeftList==true, there IS a path to the end: A D B C. Why does
        // B show up in D's leftList? Simply because A shows up in mapTiles
        // before D does, so at that point in the 'for' loop, D'd neighbors
        // wouldn't have been pruned. However, at this point, they HAVE been
        // pruned, so now we're working with up-to-date information.
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];
            var listToUse = buildingLeftList ? tile.leftList : tile.rightList;

            for ( var tileIndex in listToUse ) {

                // endNeighbors represents the tiles you can go to from this
                // tile when you came from startNeighbor
                var endNeighbors = listToUse[tileIndex];

                for (var j = 0; j < endNeighbors.length; j++) {
                    if ( !this.combinedAlgoExistsPathFromHereToAnyEndpoint(endNeighbors[j], tile, buildingLeftList, true) ) {
                        endNeighbors.splice(j, 1);
                        j--;
                    }
                };
            };
        };

        // Finally, remove any entries in the left/rightList that don't connect.
        // I don't think this step is entirely necessary; I don't know what
        // would happen if it were completely commented out.
        //
        // For example, if we have this when buildingLeftList==true:
        // 0
        // 1 2
        // 
        // 2 has a leftList containing 0, but it shouldn't because there is no
        // path from 0 to 2, which we know because 0 doesn't have '2' in ITS
        // leftList's rightNeighbors.
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];
            var listToUse = buildingLeftList ? tile.leftList : tile.rightList;

            // Go through each startNeighbor in listToUse...
            for ( var tileIndex in listToUse ) {

                var startNeighbor = this.mapTiles[Number(tileIndex)];

                // Don't remove references to onesself or you'll totally screw
                // up when units spawn on the tile.
                if ( startNeighbor.tileIndex == tile.tileIndex ) continue;

                var found = false;

                // Go through the entire left/rightList of startNeighbor and see
                // if tile.tileIndex appears as any endNeighbor.
                var neighborListToUse = buildingLeftList ? startNeighbor.leftList : startNeighbor.rightList;
                
                for ( var neighborTileIndex in neighborListToUse ) {
                    var endNeighbors = neighborListToUse[neighborTileIndex];
                    for (var j = 0; j < endNeighbors.length; j++) {
                        if ( endNeighbors[j].tileIndex == tile.tileIndex ) {
                            found = true;
                            break;
                        }
                    };
                    if ( found ) break;
                }
                if ( !found ) {
                    // console.log('Removing ' + startNeighbor.tileIndex + ' from ' + tile.tileIndex);
                    delete listToUse[startNeighbor.tileIndex];
                }
            }
        };

    };

    /**
     * If 'array' contains the Tile, this function will remove it.
     *
     * We don't just use array.indexOf(tile) to find it because the Tile objects
     * may not be the same, so we compare tileIndex.
     * @param  {Tile} tile  - the tile to remove
     * @param  {Array:Tile} array - an array of Tiles
     * @return {Boolean} - true if we removed the tile
     */
    window.game.Map.prototype.removeTileFromArray = function(tile, array) {
        for (var i = 0; i < array.length; i++) {
            if ( array[i].tileIndex == tile.tileIndex ) {
                array.splice(i,1); // no need for i-- since we're returning
                return true;
            }
        };
        return false;
    };

    /**
     * Figures out if there's any path leading from fromTile->startTile->any
     * endpoint.
     * @param  {Tile} startTile              - the tile to start at
     * @param  {Tile} fromTile               - the tile you came from to get to
     * startTile
     * @param  {Boolean} formingLeftToRightPath - if true, then you're aiming
     * for right-endpoints, otherwise left-endpoints.
     * @param  {Boolean} useLeftRightList       - if true, this will use
     * left/rightList to find neighbors to traverse. Otherwise, it will simply
     * call getAdjacentTiles.
     * @return {Boolean}                        - true if any path exists from
     * the given tiles to any left/right endpoint.
     */
    window.game.Map.prototype.combinedAlgoExistsPathFromHereToAnyEndpoint = function(startTile, fromTile, formingLeftToRightPath, useLeftRightList) {
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
         * Every time we see a fork, we push to this list so that there's a
         * snapshot of the state.
         *
         * startTile - the fork to take (it is not the origin of the fork,
         * rather it is one of the origin's neighbors)
         * seen - an array of Tiles that have already been seen. It's very
         * important that we start with our original two tiles seen.
         * path - an array of Tiles that form the path leading up to the fork
         * @type {Array}
         */
        var forkList = [ {startTile:startTile, seen:[startTile, fromTile], path:[]}];

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

                // If we're at an endpoint then we're done.
                if ( (formingLeftToRightPath && next.isRightEndpoint) || (!formingLeftToRightPath && next.isLeftEndpoint) ) {
                    return true;
                }

                var neighbors;
                if ( useLeftRightList ) {
                    var cameFrom = fromTile;

                    if ( path.length > 1 ) {
                        cameFrom = path[path.length - 2];
                    }

                    if ( formingLeftToRightPath )  {
                        neighbors = next.leftList[cameFrom.tileIndex];
                    } else {
                        neighbors = next.rightList[cameFrom.tileIndex];
                    }

                    // This won't lead us to a path, but we can't just return here
                    if ( neighbors === undefined ) {
                        break;
                    }
                } else {
                    neighbors = this.getAdjacentTiles(next, formingLeftToRightPath);
                }

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
        
        return false;
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

            // Keep the center one
            if ( nx == tx && ny == ty ) keepThese.push(n);
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

        if ( tileY < this.numRows - 1 ) {
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

        // Set up greenFillstyle, which we'll use to draw a highlight if a tile
        // is a use target.
        var blink = Math.sin(game.alphaBlink * 4);
        var alpha = blink * .1 + .3;
        var greenFillStyle = 'rgba(0, 255, 0, ' + alpha + ')';

        // Keep track of the regular fill style too so that we don't have to
        // save/restore the entire canvas context when this is all we're
        // changing.
        var regularFillStyle = 'rgba(0,0,0,1)';
        ctx.fillStyle = regularFillStyle;
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
                            if ( game.InventoryUI.isTileAUseTarget(x,y) ) {
                                ctx.fillStyle = greenFillStyle;
                                ctx.fillRect(0,0,tileSize,tileSize);
                                ctx.fillStyle = regularFillStyle;
                            }
                        }
                    } else {
                        // If there's no fog here and we're not drawing the fog
                        // layer, then we just draw the map normally.
                        if ( !this.fog[index] ) {
                            envSheet.drawSprite(ctx, graphic, 0,0);
                            if ( game.InventoryUI.isTileAUseTarget(x,y) ) {
                                ctx.fillStyle = greenFillStyle;
                                ctx.fillRect(0,0,tileSize,tileSize);
                                ctx.fillStyle = regularFillStyle;
                            }
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
     * This clears all of the fog on the map.
     * @return {undefined}
     */
    window.game.Map.prototype.clearAllFog = function() {
        for (var i = 0; i < this.fog.length; i++) {
            this.fog[i] = false;
        };
    };

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

        // Cap the radius at a reasonable maximum.
        radius = Math.min(radius, Math.max(this.numCols, this.numRows) * 2);

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
     * Returns true if a spawn point can be created here.
     * @param  {Number} tileX                       - coordinate of new spawner
     * @param  {Number} tileY                       - coordniate of new spawner
     * @param  {Number} maxDistanceToAnotherSpawner - the new spawner must be
     * within this many tiles of any other spawner in order to be placed
     * @return {Boolean}                             - true if it was created
     */
    window.game.Map.prototype.isValidTileToCreateSpawner = function(tileX, tileY, maxDistanceToAnotherSpawner) {
        var tileIndex = (tileX % this.numCols) + tileY * this.numCols;
        var tile = this.mapTiles[tileIndex];

        // Can't already be a spawner
        if ( tile.isSpawnerPoint ) {
            return false;
        }

        // Must be walkable
        if ( !tile.isWalkable ) {
            return false;
        }

        // Can't be covered in fog
        if ( this.fog[tileIndex] ) {
            return false;
        }

        // Must be close to an existing spawner (otherwise you could just put it
        // really close to the boss).
        // 
        // TODO: the way this would ideally work is this: you can only use this
        // item when the target tile exists within X tiles ALONG A PATH from a
        // spawn point. That way you can't make "jumps" across unconnected
        // paths.
        var allSpawners = this.getAllSpawnerTiles();
        var closeEnough = false;
        for (var i = 0; i < allSpawners.length; i++) {
            if ( game.util.distance(allSpawners[i].x, allSpawners[i].y, tileX, tileY) <= maxDistanceToAnotherSpawner ) {
                closeEnough = true;
                break;
            }
        };

        if ( !closeEnough ) {
            return false;
        }

        return true;
    };

    /**
     * Attempts to create a new spawn location. For additional comments, see
     * isValidTileToCreateSpawner.
     */
    window.game.Map.prototype.attemptToCreateSpawner = function(tileX, tileY, maxDistanceToAnotherSpawner) {
        var valid = this.isValidTileToCreateSpawner(tileX, tileY, maxDistanceToAnotherSpawner);
        if ( valid ) {
            // Recreate the tile to be a spawn point.
            var tileIndex = (tileX % this.numCols) + tileY * this.numCols;
            this.mapTiles[tileIndex].convertToSpawner();
        }

        return valid;
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
