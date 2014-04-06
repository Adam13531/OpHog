/*
 * OpHog - https://github.com/Adam13531/OpHog
 * Copyright (C) 2014  Adam Damiano
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
( function() {

    window.game.currentMap = null;

    /**
     * Makes a new map. This will also call this.initialize(), because the
     * constructor itself only sets up very basic things.
     * @param {Array:Tile}  tiles - the tiles that make up this map
     * @param {Array:Number}  doodadIndices - the graphic indices for doodads,
     * or undefined if there is no doodad at that location.
     * @param {Number} tilesetID - the ID of the tileset to use
     * @param {Number} width - width of this map
     * @param {Object} nodeOfMap - an object from
     * game.OverworldMapData.overworldMapNodes
     * @param {Boolean} isOverworldMap - true if this is the overworld map.
     * @param {Array:Number} pathLayer - only used by the overworld map. The
     * overworld map doesn't have a single nonwalkable tile, so it needs to know
     * specifically which tiles to draw on another layer so that gray doesn't
     * appear beneath it.
     * @param {Array:Number} extraLayer - only used by the overworld map. This
     * contains shadows, ridges, etc. that make the world look better but aren't
     * really necessary. 
     */
    window.game.Map = function Map(tiles, doodadIndices, tilesetID, width, nodeOfMap, isOverworldMap, pathLayer, extraLayer) {
        this.numCols = width;
        this.numRows = tiles.length / this.numCols;
        this.isOverworldMap = isOverworldMap;
        this.nodeOfMap = nodeOfMap;

        this.tileset = game.TilesetManager.getTilesetByID(tilesetID);

        this.mapTiles = tiles;
        this.doodadIndices = doodadIndices;
        this.pathLayer = pathLayer;
        this.extraLayer = extraLayer;

        /**
         * Array of booleans representing whether there's fog over a tile.
         * @type {Array:Boolean}
         */
        this.fog = [];
        for (var i = 0; i < this.mapTiles.length; i++) {
            this.fog.push(true);
        };

        this.widthInPixels = this.numCols * game.TILESIZE;
        this.heightInPixels = this.numRows * game.TILESIZE;

        this.areaInTiles = this.numCols * this.numRows;

        this.initialize();
    };

    /**
     * Sets your coin total to the amount that you start with on this map.
     */
    window.game.Map.prototype.setStartingCoins = function() {
        game.Player.setCoins(this.nodeOfMap.startingCoins);
    };

    /**
     * This calls the correct initialize function to initialize the map.
     */
    window.game.Map.prototype.initialize = function() {
        if ( this.isOverworldMap ) {
            this.initializeOverworldMap();
        } else {
            this.initializeNormalMap();
        }
    };

    /**
     * This initializes a normal map so that pathing, generators, the boss, etc.
     * are set up.
     *
     * After setting up this.mapTiles, call this function. Without calling this,
     * various parts of the map will be broken.
     */
    window.game.Map.prototype.initializeNormalMap = function() {
        // This is required before being able to add the boss unit so that we
        // can multiply its stats correctly. We never construct a normal map and
        // then NOT make it the current map, so this is safe.
        game.currentMap = this;

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

        this.addBossUnit();

        this.setStartingCoins();
    };

    /**
     * Initializes the overworld map.
     */
    window.game.Map.prototype.initializeOverworldMap = function() {
        // This represents the tile on the overworld that led to the last normal
        // map you played. It should be fetched with getTileOfLastMap so that it
        // can be populated when it's null. We can't just populate it here
        // because at this point, everything on the map is still foggy.
        this.tileOfLastMap = null;

        // These coordinates are the position where the camera was looking when
        // you switched away from the overworld map.
        this.lastCameraX = null;
        this.lastCameraY = null;

        // Similarly, this is the last zoom level.
        this.lastCameraZoom = null;
    };

    /**
     * Sets the last camera coordinates, which is only used for the overworld
     * map. This is the last position where the camera was looking.
     * @param  {Number} centerX - the center camera X in world coordinates
     * @param  {Number} centerY - the center camera Y in world coordinates
     * @param  {Number} zoomLevel - the camera's zoom level (1 == no special zoom).
     */
    window.game.Map.prototype.setLastCameraProperties = function(centerX, centerY, zoomLevel) {
        this.lastCameraX = centerX;
        this.lastCameraY = centerY;
        this.lastCameraZoom = zoomLevel;
    };

    /**
     * This is only valid for the overworld. It will tell you the tile at which
     * you played your last normal map.
     * @return {Tile} - the last tile where you played a normal map
     */
    window.game.Map.prototype.getTileOfLastMap = function() {
        // If it wasn't set, then find a random spawner and set it now.
        if ( this.tileOfLastMap == null ) {
            var visibleSpawners = this.getAllTiles(game.TileFlags.SPAWNER | game.TileFlags.UNFOGGY);
            this.tileOfLastMap = game.util.randomArrayElement(visibleSpawners);
            this.setLastCameraProperties(this.tileOfLastMap.x * game.TILESIZE, this.tileOfLastMap.y * game.TILESIZE, game.Camera.getCurrentZoom());
        }

        return this.tileOfLastMap;
    };

    /**
     * Clears an area of fog around each spawner.
     */
    window.game.Map.prototype.clearFogAroundSpawners = function() {
        var spawners = this.getAllTiles(game.TileFlags.SPAWNER);
        for (var i = 0; i < spawners.length; i++) {
            this.setFog(spawners[i].x, spawners[i].y, 3, false);
        };
    };

    /**
     * This adds a boss unit to the map. This cannot be done in the constructor
     * because placing the boss depends on a fully constructed map.
     */
    window.game.Map.prototype.addBossUnit = function() {
        var id = this.nodeOfMap.boss.id;
        var level = this.nodeOfMap.boss.level;
        var bossUnit = new game.Unit(id,game.PlayerFlags.BOSS | game.PlayerFlags.ENEMY,level);
        bossUnit.movementAI = game.MovementAI.LEASH_TO_TILE;
        bossUnit.convertToBoss();

        // Pick an x and y coordinate that will work on any map.
        var x = this.numCols - 3;
        var y = Math.floor(this.numRows / 2);

        bossUnit.placeUnit(x, y, game.MovementAI.BOSS);
        game.UnitManager.addUnit(bossUnit);
    };

    /**
     * Gets a random list of tiles that are at least a certain distance away
     * from the spawn.
     * @param  {Number} minimumDistanceFromSpawn - minimum distance from spawner
     * (1 represents that it's minimally one tile away from all spawners)
     * @param  {Number} numberOfTiles - number of random tiles that you want
     * @return {Array:Tile} - the random 
     */
    window.game.Map.prototype.getRandomPlaceableTiles = function(minimumDistanceFromSpawn, numberOfTiles) {
        var randomTiles = [];
        var spawnerTiles = this.getAllTiles(game.TileFlags.SPAWNER);
        var possibleTiles;

        // Start with all walkable tiles as candidates for possible tiles.
        possibleTiles = this.getAllTiles(game.TileFlags.WALKABLE);

        // Remove any tile that is within the specified number of tiles from a
        // spawner.
        for (var i = 0; i < possibleTiles.length; i++) {
            var tile = possibleTiles[i];
            for (var j = 0; j < spawnerTiles.length; j++) {
                var spawnTile = spawnerTiles[j];
                if ( game.util.distance(tile.x, tile.y, spawnTile.x, spawnTile.y) < minimumDistanceFromSpawn ) {
                    possibleTiles.splice(i, 1);
                    i--;
                    break;
                }
            };
        };

        // Pull random tiles from possibleTiles now.
        for (var i = 0; i < numberOfTiles; i++) {
            // If there are no more possible tiles, then we're forced to stop
            // here.
            if ( possibleTiles.length == 0 ) {
                break;
            }

            var indexOfRandomTile = Math.floor(Math.random() * possibleTiles.length);
            var randomTile = possibleTiles[indexOfRandomTile];
            randomTiles.push(randomTile);

            // Now that we've picked this tile, we can no longer pick it again,
            // so remove it from possibleTiles.
            possibleTiles.splice(indexOfRandomTile, 1);
        };

        return randomTiles;
    };

    /**
     * This simply goes through each left-endpoint and makes them all spawners.
     */
    window.game.Map.prototype.convertAllLeftEndpointsToSpawners = function() {
        for (var i = 0; i < this.mapTiles.length; i++) {
            if ( this.mapTiles[i].isLeftEndpoint ) { 
                this.mapTiles[i].convertToSpawner();

                // Put castles to the left of each spawn point and delete any
                // doodads over it.
                this.mapTiles[i-1].convertToCastle();
                delete this.doodadIndices[i-1];
            }
        };
    };

    /**
     * Reveals fog around a unit. This is based on the unit's size.
     * @param  {Unit} unit - the unit to reveal
     */
    window.game.Map.prototype.revealFogAroundUnit = function(unit) {
        var tile = unit.getCenterTile();
        if ( tile == null ) return;

        // Take the larger of the two dimensions.
        var radius = Math.max(unit.widthInTiles, unit.heightInTiles);
        this.setFog(tile.x, tile.y, radius, false, true);
    };

    /**
     * Places generators randomly on the map.
     */
    window.game.Map.prototype.placeGenerators = function() {
        var numGenerators = 0;

        // Tiles where generators will go
        var generatorTiles;

        // The following variables are just short-hand.
        var nodeOfMap = this.nodeOfMap;
        var chancePerWalkableTile = nodeOfMap.generators.chancePerWalkableTile;
        var generatorPlacement = nodeOfMap.generators.placement;
        var spread = nodeOfMap.generators.spread;
        var enemies = nodeOfMap.enemies;
        var movementAIs = nodeOfMap.generators.movementAIs;
        var maxEnemiesToSpawn = nodeOfMap.generators.maxEnemiesToSpawn;

        if ( chancePerWalkableTile !== undefined ) {
            var numWalkableTiles = this.getAllTiles(game.TileFlags.WALKABLE).length;
            numGenerators = Math.round(numWalkableTiles * chancePerWalkableTile);
        }

        // There has to be at least one generator...
        numGenerators = Math.max(numGenerators, 1);

        if ( generatorPlacement == game.GeneratorPlacement.RANDOM ) {
            generatorTiles = this.getRandomPlaceableTiles(nodeOfMap.generators.minDistanceFromSpawn, numGenerators);
        }

        // Make generators at each spot that we determined above
        for (var i = 0; i < generatorTiles.length; i++) {
            var generatorTile = generatorTiles[i];

            // Figure out which enemies can be spawned from this generator.
            var possibleEnemies = [];

            // Randomly choose enemies from the given types
            if ( spread == game.GeneratorEnemySpread.ALL ) {
                for (var j = 0; j < enemies.length; j++) {
                    var enemy = enemies[j]; 

                    var enemyID = enemy.id;           
                    var relativeWeight = enemy.relativeWeight;
                    var minLevel = enemy.minLevel;
                    var maxLevel = enemy.maxLevel;
                    var possibleEnemy = new game.PossibleEnemy(enemyID, relativeWeight, minLevel, maxLevel);
                    possibleEnemies.push(possibleEnemy);
                };
            }
            
            var generator = new game.Generator(generatorTile.x, generatorTile.y, possibleEnemies, movementAIs, maxEnemiesToSpawn);
            game.GeneratorManager.addGenerator(generator);
        };
    };

    /**
      * Each walkable tile will have an even chance of being chosen.
      * 
      * @return {Tile} a random, walkable tile
     */
    window.game.Map.prototype.getRandomWalkableTile = function() {
        return game.util.randomArrayElement(this.getAllTiles(game.TileFlags.WALKABLE));
    };

    /**
     * Gets all the tiles of a certain type
     * @param  {game.TileFlags} tileFlags Type of tiles on this map that are wanted
     * @return {Array:Tile}           List containing only tiles that were wanted
     */
    window.game.Map.prototype.getAllTiles = function(tileFlags) {
        var mustBeFoggy = (tileFlags & game.TileFlags.FOGGY) != 0;
        var mustBeUnfoggy = (tileFlags & game.TileFlags.UNFOGGY) != 0;
        if ( mustBeFoggy && mustBeUnfoggy ) {
            console.log('Invalid tile flags: ' + tileFlags + ' (you specified FOGGY and UNFOGGY)');
        }

        // Get rid of the FOGGY and UNFOGGY flags so that we can do a direct
        // comparison below.
        tileFlags &= ~(game.TileFlags.FOGGY | game.TileFlags.UNFOGGY);

        var tiles = [];
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];
            if ( (tile.tileFlags & tileFlags) == tileFlags) {
                // The flags match, but is it the right fog level?
                if ( (mustBeFoggy && !this.fog[tile.tileIndex]) ||
                    (mustBeUnfoggy && this.fog[tile.tileIndex]) ) {
                    continue;
                }

                tiles.push(tile);
            }
        };
        return tiles;
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
        var leftNeighbors = this.getAdjacentTiles(tile, game.DirectionFlags.LEFT);
        var rightNeighbors = this.getAdjacentTiles(tile, game.DirectionFlags.RIGHT);

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
     */
    window.game.Map.prototype.figureOutEndpoints = function() {
        var foundRightEndpoint = false;
        var foundLeftEndpoint = false;
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];

            // We only consider walkable tiles
            if ( !tile.isWalkable() ) continue;

            if ( this.isTileAnEndpoint(tile, false) ) {
                tile.isRightEndpoint = true;
                foundRightEndpoint = true;
            }
            
            if ( this.isTileAnEndpoint(tile, true) ) {
                if ( tile.isRightEndpoint ) {
                    game.util.debugDisplayText('Fatal error: a tile is both ' +
                        'a left and right endpoint. Index: ' + tile.tileIndex,
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
     */
    window.game.Map.prototype.buildTileList = function(buildingLeftList) {
        // Form the very basic left/rightList. This will be pruned repeatedly in
        // this function.
        for (var i = 0; i < this.mapTiles.length; i++) {
            var tile = this.mapTiles[i];
            var listToUse = buildingLeftList ? tile.leftList : tile.rightList;

            if ( !tile.isWalkable() ) {
                continue;
            }

            var startDirection = buildingLeftList ? game.DirectionFlags.LEFT : game.DirectionFlags.RIGHT;
            var endDirection = buildingLeftList ? game.DirectionFlags.RIGHT : game.DirectionFlags.LEFT;

            var startNeighbors = this.getAdjacentTiles(tile, startDirection);
            var endNeighbors = this.getAdjacentTiles(tile, endDirection);

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
                        if ( startNeighbor.x < this.numCols && this.mapTiles[startNeighbor.tileIndex + 1].isWalkable() ) {
                            this.removeTileFromArray(this.mapTiles[startNeighbor.tileIndex + 1], endNeighbors);
                        }
                    } else {
                        // Otherwise, check the tile to the left.
                        if ( startNeighbor.x > 0 && this.mapTiles[startNeighbor.tileIndex - 1].isWalkable() ) {
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

                        if ( !this.arrayContainsTile(pruned, rnToCheck) ) {
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
                if ( startNeighbor.equals(tile) ) continue;

                var found = false;

                // Go through the entire left/rightList of startNeighbor and see
                // if tile.tileIndex appears as any endNeighbor.
                var neighborListToUse = buildingLeftList ? startNeighbor.leftList : startNeighbor.rightList;
                
                for ( var neighborTileIndex in neighborListToUse ) {
                    var endNeighbors = neighborListToUse[neighborTileIndex];
                    found = this.arrayContainsTile(endNeighbors, tile);

                    // It only needs to appear in a single neighbor's list for
                    // us to keep it.
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
            if ( array[i].equals(tile) ) {
                array.splice(i,1); // no need for i-- since we're returning
                return true;
            }
        };
        return false;
    };

    /**
     * @param  {Array:Tile} array - any array of tiles
     * @param  {Tile} tile  - a tile to search for
     * @return {Boolean}       - true if 'array' contains 'tile'
     */
    window.game.Map.prototype.arrayContainsTile = function(array, tile) {
        for (var i = 0; i < array.length; i++) {
            if ( tile.equals(array[i]) ) return true;
        };
        return false;
    };

    /**
     * Given tile '4' shown below (which is 'centerTile' to this function), this
     * will return all of the other numbers if they are both walkable and
     * unfoggy. It will prune diagonals if a cardinal neighbor exists (see the
     * comment for pruneDiagonalIfCardinalExist).
     *
     * 0 1 2
     * 3 4 5
     * 6 7 8
     * 
     * @param  {Tile} centerTile - tile number '4' above
     * @return {Array:Tile}            - walkable, unfoggy neighbors
     */
    window.game.Map.prototype.getWalkableUnfoggyNeighbors = function(centerTile) {
        // Get walkable neighbors
        var possibleTiles = this.getAdjacentTiles(centerTile, game.DirectionFlags.LEFT | game.DirectionFlags.RIGHT);

        // Prune diagonals if we can take adjacent tiles
        possibleTiles = this.pruneDiagonalIfCardinalExist(centerTile, possibleTiles);

        // Remove foggy tiles
        for (var i = 0; i < possibleTiles.length; i++) {
            var tile = possibleTiles[i];
            if ( this.isFoggy(tile.x, tile.y) ) {
                possibleTiles.splice(i,1);
                i--;
            }
        };

        return possibleTiles;
    };

    /**
     * A simple implementation of the A* algorithm. I looked at pseudocode on
     * Wikipedia for it.
     *
     * It finds a path that does NOT involve any foggy tiles.
     * @param  {Tile} startTile - the starting tile
     * @param  {Tile} endTile   - the end tile
     * @return {Array:Tile} - the path from start to end. This path will include
     * both startTile and endTile (unless they're the same, in which case that
     * tile will only appear once). Returns null if no path is found.
     */
    window.game.Map.prototype.findPathWithoutFog = function(startTile, endTile) {
        /**
         * Tiles you've visited. This is the "closedset" on Wikipedia.
         * @type {Array:Tile}
         */
        var visited = [];

        /**
         * Tiles you have yet to visit. This is the "openset" on Wikipedia.
         * @type {Array}
         */
        var toVisit = [];

        /**
         * A dictionary whose keys and values are both numbers representing tile
         * indices. Each key/value pair represents a destination/source tile
         * pair.
         * @type {Object}
         */
        var cameFrom = {};

        /**
         * The keys are numbers representing tile indices. The values are the
         * costs ("scores") from startTile ALONG the best-known path.
         * @type {Object}
         */
        var gScore = {};

        /**
         * Same as gScore, but the values represent the estimated cost from
         * start-->current_tile-->goal.
         * @type {Object}
         */
        var fScore = {};

        // The heuristic function should never overestimate. Thus, we take
        // straight-line distance since that's the best-possible case.
        var heuristic = function(tile1, tile2) {
            return game.util.distance(tile1.x, tile1.y, tile2.x, tile2.y);
        }

        /**
         * This function will get the tile with the lowest possible 'f' score,
         * which is the tile that we estimate will have the shortest path
         * (that's why this is a best-first search).
         * @param  {Array:Tile} array [description]
         * @return {[type]}       [description]
         */
        var getLowestF = function(array) {
            var lowestTile = array[0];
            for (var i = 1; i < array.length; i++) {
                var tile = array[i];
                if ( fScore[tile.tileIndex] < fScore[lowestTile.tileIndex] ) {
                    lowestTile = tile;
                }
            };

            return lowestTile;
        }

        // Start with only the start tile visited
        toVisit.push(startTile);

        // The cost to get to the start tile is 0 obviously
        gScore[startTile.tileIndex] = 0;

        // The estimated cost from the start is simply the heuristic.
        fScore[startTile.tileIndex] = gScore[startTile.tileIndex] + heuristic(startTile, endTile);

        while ( toVisit.length != 0 ) {
            // Get the tile we think is closest to the goal.
            var current = getLowestF(toVisit);

            // If we're at the goal, reconstruct the path
            if ( current.equals(endTile) ) {
                var path = this.reconstructPath(cameFrom, endTile.tileIndex);

                // Make sure it contains the end tile
                if ( path[path.length - 1] != endTile.tileIndex ) {
                    path.push(endTile.tileIndex);
                }

                // Convert the path from tile indices to tiles
                for (var i = 0; i < path.length; i++) {
                    path[i] = this.mapTiles[path[i]];
                };
                return path;
            }

            this.removeTileFromArray(current, toVisit);
            visited.push(current);

            // Only consider walkable, unfoggy neighbors
            var neighbors = this.getWalkableUnfoggyNeighbors(current);
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];

                // 1 is always the distance between 'current' and 'neighbor'
                var tentativeGScore = gScore[current.tileIndex] + 1;

                var gScoreNeighbor = gScore[neighbor.tileIndex];

                // If we don't already have a gScore for our neighbor, set it to
                // "infinite".
                if ( gScoreNeighbor === undefined ) gScoreNeighbor = 999999;

                if ( this.arrayContainsTile(visited, neighbor) && tentativeGScore >= gScoreNeighbor) {
                    continue;
                }

                if ( !this.arrayContainsTile(toVisit, neighbor) && tentativeGScore < gScoreNeighbor ) {
                    cameFrom[neighbor.tileIndex] = current.tileIndex;
                    gScore[neighbor.tileIndex] = tentativeGScore;
                    fScore[neighbor.tileIndex] = tentativeGScore + heuristic(neighbor, endTile);
                    if ( !this.arrayContainsTile(toVisit, neighbor) ) {
                        toVisit.push(neighbor);
                    }
                }
            };
        }

        // There is no path if we got here
        return null;
    };

    /**
     * This will reconstruct an A* path. This code was modeled on the Wikipedia
     * pseudo-code for A*.
     * @param  {Object} cameFrom    - the map from the pathfinding function (see
     * the comment there)
     * @param  {Number} currentNode - the current node. This function is
     * recursive, so it starts as endTile but changes as we continue to call it.
     * @return {Array:Number}             - an array of tile indices
     * representing start --> end. It does not always contain the end tile.
     */
    window.game.Map.prototype.reconstructPath = function(cameFrom, currentNode) {
        if ( cameFrom[currentNode] === undefined ) {
            // Make sure to return the current node as an array, that way this
            // function ONLY returns arrays and we don't have to check the types
            // of the return values
            return [currentNode];
        }

        var path = this.reconstructPath(cameFrom, cameFrom[currentNode]);
        path.push(currentNode);
        return path;
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
                    var directionFlags = formingLeftToRightPath ? game.DirectionFlags.RIGHT : game.DirectionFlags.LEFT;
                    neighbors = this.getAdjacentTiles(next, directionFlags);
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
     * @param  {game.DirectionFlags} directionFlags - some non-zero combination
     * of LEFT and RIGHT indicating which neighbors should be returned
     * @return {Array:Tile}             - an array of neighbors. If there are no
     * neighbors, the return value is an array of length 0, not null
     */
    window.game.Map.prototype.getAdjacentTiles = function(tile, directionFlags) {
        var tileX = tile.x;
        var tileY = tile.y;
        var tileIndex = tile.tileIndex;
        var getRightNeighbors = (directionFlags & game.DirectionFlags.RIGHT) != 0;
        var getLeftNeighbors = (directionFlags & game.DirectionFlags.LEFT) != 0;

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
        if ( getLeftNeighbors && tileX > 0) {
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

        if ( getRightNeighbors && tileX < this.numCols - 1) {
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
                if ( !neighbor.isWalkable() ) continue;

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
        var doodadGraphic;
        var tile;

        // Set up greenFillstyle, which we'll use to draw a highlight if a tile
        // is a use target.
        var blink = Math.sin(game.alphaBlink * 4);
        var alpha = blink * .1 + .3;
        var greenFillStyle = 'rgba(0, 255, 0, ' + alpha + ')';

        // These tiles will be animated by pulling the sprite at the next row in
        // the tilesheet, so you can't animate BLUE_WATER_2 by simply adding it
        // to this array. If we ever end up animating more than just water
        // tiles, we should come up with a better framework than the ~5 lines of
        // code that are handling it now.
        var animatedIndices = [game.Graphic.BLUE_WATER_1, game.Graphic.RED_WATER_1];

        // Keep track of the regular fill style too so that we don't have to
        // save/restore the entire canvas context when this is all we're
        // changing.
        var regularFillStyle = 'rgba(0,0,0,1)';
        ctx.fillStyle = regularFillStyle;

        // Keep track of where we draw instead of simply using ctx.translate,
        // which is a slow function.
        var drawX = 0;
        var drawY = 0;

        var advanceDrawX = function() {
            drawX += game.TILESIZE;
        };

        for (var y = 0; y < this.numRows; y++) {
            for (var x = 0; x < this.numCols; x++) {
                index = y * this.numCols + x;
                tile = this.mapTiles[index];

                // Only draw tiles that the map can see.
                if ( !game.Camera.canSeeTile(tile) ) {
                    advanceDrawX();
                    continue;
                }

                graphic = tile.graphicIndex;
                doodadGraphic = this.doodadIndices[index];

                // Draw the second frame of animated tiles every other second.
                // We're exploiting alphaBlink here, which is really just the
                // amount of time that's passed since we started playing.
                if ( (Math.floor(game.alphaBlink) % 2) == 0 ) {
                    if ( $.inArray(graphic, animatedIndices) != -1 ) graphic += envSheet.getNumSpritesPerRow();
                    if ( $.inArray(doodadGraphic, animatedIndices) != -1 ) doodadGraphic += envSheet.getNumSpritesPerRow();
                }

                if ( drawingFogLayer == this.fog[index] ) {
                    // Walkable tiles don't always cover the whole area, so we
                    // need to draw the unwalkable tile beneath it. The
                    // overworld uses 'pathLayer' to accomplish the same thing.
                    if ( !this.isOverworldMap && tile.isWalkable() ) {
                        envSheet.drawSprite(ctx, tile.tileset.nonwalkableTileGraphic, drawX,drawY);
                    }

                    // Draw the tile
                    envSheet.drawSprite(ctx, graphic, drawX,drawY);

                    // For the overworld, draw the 'extra' layer
                    if ( this.isOverworldMap && this.extraLayer[index] !== undefined ) {
                        envSheet.drawSprite(ctx, this.extraLayer[index], drawX, drawY);
                    }

                    // For the overworld, draw the path
                    if ( this.isOverworldMap && this.pathLayer[index] !== undefined ) {
                        envSheet.drawSprite(ctx, this.pathLayer[index], drawX, drawY);
                    }

                    // Draw castles
                    if ( tile.isCastle() ) {
                        envSheet.drawSprite(ctx, game.Graphic.GENERATOR, drawX,drawY);
                    }

                    // Draw spawners. On the overworld, they're actually
                    // represented by doodads since the graphics vary based on
                    // difficulty.
                    if ( !this.isOverworldMap && tile.isSpawnerPoint() ) {
                        envSheet.drawSprite(ctx, game.Graphic.SPAWNER, drawX,drawY);
                    }

                    // Draw the doodad
                    if ( doodadGraphic != null ) {
                        envSheet.drawSprite(ctx, doodadGraphic, drawX,drawY);
                    }

                    // If you're in USE mode, highlight valid target tiles.
                    if ( game.playerInventoryUI.isTileAUseTarget(x,y) ) {
                        ctx.fillStyle = greenFillStyle;
                        ctx.fillRect(drawX,drawY,game.TILESIZE,game.TILESIZE);
                        ctx.fillStyle = regularFillStyle;
                    }
                }

                advanceDrawX();
            }
            drawX -= game.TILESIZE * this.numCols;
            drawY += game.TILESIZE;
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

        var width = 1;
        for (var y = 0; y < this.numRows; y++) {
            for (var x = 0; x < this.numCols; x += width) {
                width = 1;

                // Only draw if this tile is foggy and the camera can see it.
                if ( !this.fog[y * this.numCols + x] || !game.Camera.canSeeTileCoordinates(x, y) ) continue;

                // 'fillRect' is relatively costly, so we will draw as much fog
                // as we can at a time without doing anything too
                // computationally expensive to achieve this optimization.
                for (var xx = x + 1; xx < this.numCols; xx++ ) {
                    if ( !this.fog[y * this.numCols + xx] ) {
                        break;
                    }

                    width++;
                }

                ctx.fillRect(x * game.TILESIZE, y * game.TILESIZE, game.TILESIZE * width, game.TILESIZE);
            }
        }
        ctx.restore();
    };

    /**
     * Draws text for each node in the overworld map.
     * @param  {Object} ctx - the canvas context
     */
    window.game.Map.prototype.drawOverworldDescriptions = function(ctx) {
        if ( !this.isOverworldMap || !game.keyPressedToDisplayLifeBars ) return;

        for (var i = 0; i < game.OverworldMapData.overworldMapNodes.length; i++) {
            var node = game.OverworldMapData.overworldMapNodes[i];

            // Don't draw if it's foggy
            if ( this.isFoggy(node.x, node.y) ) continue;

            var x = node.x * game.TILESIZE + game.TILESIZE / 2;
            var y = node.y * game.TILESIZE;
            var difficultyText = 'Difficulty: ' + node.difficulty;

            game.TextManager.drawTextImmediate(ctx, node.description, x, y);
            game.TextManager.drawTextImmediate(ctx, difficultyText, x, y + game.DEFAULT_FONT_SIZE);
        };
    };

    /**
     * This clears all of the fog on the map.
     */
    window.game.Map.prototype.clearAllFog = function() {
        for (var i = 0; i < this.fog.length; i++) {
            this.fog[i] = false;
        };
    };

    /**
     * Returns true if this tile contains a statue. Statues are stored in the
     * doodad layer, so that's where this checks.
     */
    window.game.Map.prototype.tileContainsStatue = function(tileX, tileY) {
        var index = tileY * this.numCols + tileX;
        var statues = [game.Graphic.WIZARD_STATUE,game.Graphic.ARCHER_STATUE,game.Graphic.WARRIOR_STATUE];
        var doodad = this.doodadIndices[index];

        return statues.indexOf(doodad) != -1;
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
        if ( tile.isSpawnerPoint() ) {
            return false;
        }

        // Must be walkable
        if ( !tile.isWalkable() ) {
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
        var allSpawners = this.getAllTiles(game.TileFlags.SPAWNER);
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
        return this.mapTiles[index].isSpawnerPoint();
    };

    /**
     * @param  {Number}  tileX - tile X coordinate
     * @param  {Number}  tileY - tile Y coordinate
     * @return {Boolean}  true if the tile is foggy.
     */
    window.game.Map.prototype.isFoggy = function(tileX, tileY) {
        var index = tileY * this.numCols + tileX;
        return this.fog[index];
    };

    /**
     * Gets the tile at the specified tile coordinates.
     */
    window.game.Map.prototype.getTile = function(tileX, tileY) {
        return this.mapTiles[tileY * this.numCols + tileX];
    };

    /**
     * Draws a grid at puzzle piece boundaries. This is only used for debugging.
     * It's also incorrect sometimes due to how we slice out blank portions of
     * the map. This function only accounts for the TOP of the map being sliced,
     * not the MIDDLE.
     */
    window.game.Map.prototype.debugDrawPuzzlePieceBoundaries = function(ctx) {
        ctx.save();
        game.Camera.scaleAndTranslate(ctx);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;

        var ppSize = game.PUZZLE_PIECE_SIZE;
        var tSize = game.TILESIZE;

        // Currently (11/29/13), we cut off the tops and bottoms of maps if
        // there's a lot of blank space, which means we need to offset the grid
        // that we draw by how much we cut off the top. For now, we know how
        // much we got off the top based on how far the first spawner is from
        // the top of the map.
        var allSpawners = game.currentMap.getAllTiles(game.TileFlags.SPAWNER);
        var firstSpawner = allSpawners[0];

        // '2' because the spawner shoudl be in the center of the tile.
        var offsetFromTop = firstSpawner.y - 2;

        for (var i = 0; i < this.numRows / ppSize; i++) {
            var tileIndex = i * ppSize + offsetFromTop;
            var y = tileIndex * tSize;
            game.graphicsUtil.drawLine(ctx, 0, y, this.widthInPixels, y);
        };

        for (var i = 0; i < this.numCols / ppSize; i++) {
            var x = i * ppSize * tSize;
            game.graphicsUtil.drawLine(ctx,x, offsetFromTop * tSize, x, this.heightInPixels);
        };
        
        // Draw a line on the bottom of the map to complete the grid.
        var y = this.heightInPixels - ctx.lineWidth/2;
        game.graphicsUtil.drawLine(ctx, 0, y, this.widthInPixels, y);
        ctx.restore();
    };

}());
