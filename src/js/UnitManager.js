( function() {

    // There's only one unit manager.
    // This manages both players and enemies.
    window.game.UnitManager = {

        /**
         * Game units (players and enemies).
         * @type {Array:Unit}
         */
        gameUnits: new Array(),

        /**
         * Draw the units.
         * @param  {Object} ctx The canvas context.
         */
        draw: function(ctx) {
            for (var i = 0; i < this.gameUnits.length; i++) {
                this.gameUnits[i].draw(ctx);
            };
        },

        /**
         * Adds a unit to the game.
         * @param {Unit} unit The unit to add.
         */
        addUnit: function(unit) {
            this.gameUnits.push(unit);
        },

        /**
         * Gets all units that intersect with the point x,y.
         *
         * Bug/todo: make this work with non-1x1 units.
         * @param  {Number} x - world coordinate
         * @param  {Number} y - world coordinate
         * @return {Array:Unit}   Array of units that intersects with the point
         */
        getUnitsAtPoint: function(x, y) {
            var collidingUnits = [];

            for (var i = 0; i < this.gameUnits.length; i++) {
                var unit = this.gameUnits[i];
                if ( game.util.pointInRect(x, y, unit.x, unit.y, unit.width, unit.height) ) {
                    collidingUnits.push(unit);
                }
            };

            return collidingUnits;
        },

        /**
         * Gets a unit based on its ID.
         * @param  {Number} unitID - the unit's ID
         * @return {Unit}        - the unit with that ID
         */
        getUnitByID: function(unitID) {
            for (var i = 0; i < this.gameUnits.length; i++) {
                if ( this.gameUnits[i].id == unitID ) return this.gameUnits[i];
            };

            return null;
        },

        /**
         * This is used by the GameStateManager.
         * @return {Boolean} true if all placed units are at their destinations.
         */
        areAllUnitsAtTheirDestinations: function() {
            for (var i = 0; i < this.gameUnits.length; i++) {
                if ( this.gameUnits[i].hasBeenPlaced && !this.gameUnits[i].isAtDestination() ) {
                    return false;
                }
            };
            return true;
        },

        /**
         * Updates the units, removing when necessary.
         *
         * This also checks for battles and if the NPC needs to give a quest.
         * @param  {Number} delta The amount of ms elapsed since this was last
         *                        called.
         */
        update: function(delta) {
            var npcUnits = [];
            var placedPlayerUnits = [];

            for (var i = 0; i < this.gameUnits.length; i++) {
                var unit = this.gameUnits[i];

                // Remove units that died in battle
                if (unit.removeFromMap) {

                    // Only "unplace" the player's placeable units. Remove
                    // any other types from the game.
                    if ( unit.isPlayer() && unit.isPlaceableUnit() ) {
                        unit.unplaceUnit();
                    } else {
                        this.gameUnits.splice(i, 1);
                        i--;
                    }

                    if ( unit.isBoss() ) {
                        game.GameStateManager.enterWinState();
                    }
                    
                    continue;
                }

                if (unit.isNeutral()) {
                    npcUnits.push(unit);
                }

                // Only grab player units that have been placed
                if (unit.isPlayer() &&
                    unit.hasBeenPlaced) {
                    placedPlayerUnits.push(unit);
                }

                unit.update(delta);
            };

            game.BattleManager.checkForBattles(this.gameUnits);

            this.checkForGettingQuests(npcUnits, placedPlayerUnits);
        },

        /**
         * Returns the graphic indexes for a unit costume.
         * @param  {game.PlaceableUnitType} unitType - the unit whose costume
         * you want to get
         * @param  {Number} costumeNumber - the costume number to get. This
         * ranges from 0 to game.MAX_UNITS_PER_CLASS. 0 is the standard costume.
         * 1 is the first alternate one, etc. You can also specify -1, in which
         * case it will return the index corresponding to the next unpurchased
         * unit of that class.
         * @return {Array:Number)} - the graphic indexes of the unit costume.
         */
        getUnitCostume: function(unitType, costumeNumber) {
            var extraCostumesArray = null;

            if ( unitType == game.PlaceableUnitType.ARCHER ) {
                extraCostumesArray = game.EXTRA_ARCHER_COSTUMES;
            } else if ( unitType == game.PlaceableUnitType.WARRIOR ) {
                extraCostumesArray = game.EXTRA_WARRIOR_COSTUMES;
            } else {
                extraCostumesArray = game.EXTRA_WIZARD_COSTUMES;
            }

            // Special case
            if ( costumeNumber == -1 ) {
                var numUnits = game.UnitManager.getNumOfPlayerUnits(unitType);
                costumeNumber = numUnits;
            }

            return extraCostumesArray[costumeNumber];
        },

        /**
         * Checks to see if the NPCs need to give out quests to the player. This
         * happens when the NPC hasn't given out a quest yet and if a player's
         * unit is close enough to the NPC.
         * @param  {Array:Unit} npcUnits - list of the NPCs
         * @param  {Array:Unit} placedPlayerUnits - list of the player's units
         * that have already been placed
         */
        checkForGettingQuests: function(npcUnits, placedPlayerUnits) {
            for (var i = 0; i < npcUnits.length; i++) {
                var npcUnit = npcUnits[i];

                if ( npcUnit.gaveOutQuest ) continue;

                for (var j = 0; j < placedPlayerUnits.length; j++) {
                    var playerUnit = placedPlayerUnits[j];

                    // Player units cannot be in battles
                    if ( playerUnit.isInBattle() ) continue;

                    var distance = window.game.util.distance(playerUnit.getCenterX(), 
                                                             playerUnit.getCenterY(),
                                                             npcUnit.getCenterX(),
                                                             npcUnit.getCenterY());

                    // Check to see if they're close enough to each other
                    // for the NPC to give out a quest. If they are, give
                    // out a new quest.
                    if (distance < (game.TILESIZE * 1.5) &&
                        game.QuestManager.canAcceptQuests()) {
                        game.QuestManager.addNewQuest();
                        npcUnit.gaveOutQuest = true;
                        break;
                    }
                };
            };
        },

        /**
         * Calls placeUnit on every unplaced player unit.
         * @param  {Number} tileX - tile X to place at
         * @param  {Number} tileY - tile Y to place at
         * @param  {game.MovementAI} movementAI - a movement AI to apply, or null if
         * you don't want to change whatever the current one is.
         */
        placeAllPlayerUnits: function(tileX, tileY, movementAI) {
            for (var i = 0; i < this.gameUnits.length; i++) {
                var unit = this.gameUnits[i];
                if ( unit.isPlayer() && !unit.hasBeenPlaced ) {
                    unit.placeUnit(tileX, tileY, movementAI);
                    game.UnitPlacementUI.updateUnit(unit);
                }
            };
        },

        /**
         * Makes all of your units move to a specific tile. This is used when
         * transitioning from the overworld to a normal map.
         * @param  {Tile} tile - the tile to move to
         */
        makeAllPlayerUnitsMoveToTile: function(tile) {
            for (var i = 0; i < game.UnitManager.gameUnits.length; i++) {
                var unit = game.UnitManager.gameUnits[i];
                if ( unit.isPlayer() && unit.hasBeenPlaced ) {
                    unit.moveToSpecificTile(tile);
                }
            };
        },

        /**
         * Marks all units so that they will be removed from the map.
         */
        removeAllUnitsFromMap: function() {
            for (var i = 0; i < this.gameUnits.length; i++) {
                this.gameUnits[i].removeUnitFromMap();
            };

            // Call update immediately so that the non-placeable units won't
            // even have references to them anymore.
            this.update(0);
        },

        /**
         * Gets the number of units that belong to a player and are of the type
         * that was passed in.
         * @param  {Number} unitType - an ID from game.UnitType, e.g.
         * game.UnitType.ORC.id.
         * @return {Number} The number of units that belong to the player that
         *                   are of the type unitType
         */
        getNumOfPlayerUnits: function(unitType) {
            return this.getUnits(unitType).length;
        },

        /**
         * Gets the units that belong to a player and are of the type that was
         * passed in.
         * @param  {Number} unitType - an ID from game.UnitType, e.g.
         * game.UnitType.ORC.id.
         * @return {Array:Unit}          List of units that belong to the player
         *                               that are of type unitType.
         */
        getUnits: function(unitType) {
            var units = new Array();
            for (var i = 0; i < this.gameUnits.length; i++) {
                if (this.gameUnits[i].unitType == unitType && 
                    this.gameUnits[i].isPlayer()) {
                    units.push(this.gameUnits[i]);
                };
            };
            return units;
        },

        /**
         * Gets all the unplaced units of the specified type.
         * @param  {Number} unitType - an ID from game.UnitType, e.g.
         * game.UnitType.ORC.id.
         * @return {Array:Unit} - all of the unplaced units of the specified
         * type
         */
        getUnplacedUnits: function(unitType) {
            var units = this.getUnits(unitType);
            for (var i = 0; i < units.length; i++) {
                if ( units[i].hasBeenPlaced ) {
                    units.splice(i, 1);
                    i--;
                }
            };

            return units;
        },
    };
}()); 