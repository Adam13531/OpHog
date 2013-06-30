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
                if ( x >= unit.x && x <= unit.x + unit.width && 
                    y >= unit.y && y <= unit.y + unit.height ) {
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
         * Updates the units, removing when necessary.
         *
         * This also checks for battles.
         * @param  {Number} delta The amount of ms elapsed since this was last
         *                        called.
         */
        update: function(delta) {
            for (var i = 0; i < this.gameUnits.length; i++) {
                var unit = this.gameUnits[i];
                // Remove units that died in battle
                if (unit.removeFromMap) {
                    if ( unit.isPlayer() ) {
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

                unit.update(delta);
            };

            game.BattleManager.checkForBattles(this.gameUnits);
        },

        /**
         * Calls placeUnit on every unplaced player unit. This is used by the
         * minigame.
         * @param  {Number} tileX - tile X to place at
         * @param  {Number} tileY - tile Y to place at
         */
        placeAllPlayerUnits: function(tileX, tileY) {
            for (var i = 0; i < this.gameUnits.length; i++) {
                var unit = this.gameUnits[i];
                if ( unit.isPlayer() && !unit.hasBeenPlaced ) {
                    unit.placeUnit(tileX, tileY);
                }
            };
        },

        /**
         * Marks all units so that they will be removed from the map.
         * @return {undefined}
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