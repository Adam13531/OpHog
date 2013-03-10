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
         * Holds the number of archers that the player owns
         * @type {Number}
         */
        numArchers: 0,

        /**
         * Holds the number of wizards that the player owns
         * @type {Number}
         */
        numWizards: 0,

        /**
         * Holds the number of warriors that the player owns
         * @type {Number}
         */
        numWarriors: 0,

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
         * Updates the units, removing when necessary.
         *
         * This also checks for battles.
         * @param  {Number} delta The amount of ms elapsed since this was last
         *                        called.
         */
        update: function(delta) {
            for (var i = 0; i < this.gameUnits.length; i++) {
                // Remove units that died in battle
                if (this.gameUnits[i].removeFromGame) {
                    this.gameUnits.splice(i, 1);
                    i--;
                    continue;
                }

                this.gameUnits[i].update(delta);
            };

            game.BattleManager.checkForBattles(this.gameUnits);
        },

        /**
         * Gets the number of units that belong to a player and are of the type
         * that was passed in.
         * @param  {Unit} unitType 
         * @return {Integer} The number of units that belong to the player that
         *                   are of the type unitType
         */
        getNumOfPlayerUnits: function(unitType) {
            var numOfUnits = 0;
            for (var i = 0; i < this.gameUnits.length; i++) {
                if (this.gameUnits[i].getUnitType() == unitType && 
                    this.gameUnits[i].isPlayerUnit()) {
                    numOfUnits++;
                }
            };
            return numOfUnits;
        },
    };
}()); 