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
/**
 * Note: for some reason, I had kept this file relatively up-to-date even though
 * we'd deprecated the UI a long time ago. I've finally gotten rid of all of the
 * dead code, so although this is called UnitPlacementUI.js, it's not all
 * relevant code to placing units.
 */
( function() {
    
	/**
     * Defines the types of units that can be placed. These are used to
     * distinguish between the other unit types because these are the only types
     * that can actually be placed by a player.
     * @type {Number}
	 */
	window.game.PlaceableUnitType = {
		ARCHER: game.UnitType.PLAYER_ARCHER.id,
		WARRIOR: game.UnitType.PLAYER_WARRIOR.id,
		WIZARD: game.UnitType.PLAYER_WIZARD.id
	};

    /**
     * The return value of placeUnit.
     * @type {Object}
     */
    window.game.PlaceUnitStatus = {
        CANNOT_SPAWN_UNITS: 'cannot spawn units',
        UNIT_ALREADY_PLACED: 'unit already placed',
        NOT_ENOUGH_MONEY: 'not enough money',
        SUCCESSFULLY_PLACED: 'successfully placed'
    };

	/**
	 * The amount each slot costs. The first slot is index 0, second is 1, etc.
	 * @type {Number}
	 */
	window.game.UNIT_PLACEMENT_SLOT_COSTS = [30,40,50,60,70];

    // There's only one unit placement UI, so we'll define everything in a single
    // object.
    window.game.UnitPlacementUI = {

    	/**
    	 * X position in tiles of the spawn point where units will be placed
    	 * @type {Number}
    	 */
    	spawnPointX: 0,

    	/**
    	 * Y position in tiles of the spawn point where units will be placed
    	 * @type {Number}
    	 */
    	spawnPointY: 0,

        /**
         * The alpha value to use when highlighting a spawner.
         * @type {Number}
         */
        highlightAlpha: .4,

        /**
         * The direction in which the alpha is changing. This is only positive
         * or negative 1.
         * @type {Number}
         */
        highlightAlphaChange: 1,
		
        /**
         * Computes the cost to buy a slot for the specified unit type. This is
         * passed in so that other callers can use the function too.
         * @param {game.PlaceableUnitType} unitType - the unit type you want to
         * know the cost of.
         * @return {Number}           Amount that the new slot will cost
         */
        costToPurchaseSlot: function(unitType) {
            var numUnitsOwned = game.UnitManager.getNumOfPlayerUnits(unitType);
            return game.UNIT_PLACEMENT_SLOT_COSTS[numUnitsOwned];
        },

        /**
         * @return {Boolean} - true if you're allowed to even open the unit
         * placement UI (it's based on the game state that you're in).
         */
        canSpawnUnits: function() {
            return game.GameStateManager.isNormalGameplay();
        },

        /**
         * @return {Boolean} true if you've purchased at least one unit.
         */
        purchasedAtLeastOneUnit: function() {
            return game.UnitManager.getNumOfPlayerUnits(game.PlaceableUnitType.ARCHER) > 0 ||
                game.UnitManager.getNumOfPlayerUnits(game.PlaceableUnitType.WARRIOR) > 0 || 
                game.UnitManager.getNumOfPlayerUnits(game.PlaceableUnitType.WIZARD) > 0;
        },

        /**
         * Sets the spawn location to the first visible spawner in the map. That
         * way, you don't have to click a spawner when the map begins if you
         * want to start spawning units right away.
         */
        initializeSpawnPoint: function() {
            var visibleSpawners = game.currentMap.getAllTiles(game.TileFlags.SPAWNER | game.TileFlags.UNFOGGY);

            // This should never happen.
            if ( visibleSpawners.length == 0 ) {
                game.util.debugDisplayText('No visible spawners found.', 'no vis spawners');
                return;
            }
            
            var firstSpawner = visibleSpawners[0];
            this.spawnPointX = firstSpawner.x;
            this.spawnPointY = firstSpawner.y;
        },

        /**
         * Selects the "next" spawner from your current one, which should be the
         * logical next spawner in terms of left-to-right, top-to-bottom order.
         * @param  {Boolean} selectNext - if true, this will go to the
         * "next" one, not the previous one.
         */
        selectSpawner: function(selectNext) {
            // Get all visible spawners. The way this function works internally
            // is to iterate through all of the map tiles from
            // [0...mapTiles.length], so this will be in the order we want
            // already. We can't just cache this list of tiles because the
            // UNFOGGY property could change, although for spawners it probably
            // never will.
            var visibleSpawners = game.currentMap.getAllTiles(game.TileFlags.SPAWNER | game.TileFlags.UNFOGGY);

            // This should never happen.
            if ( visibleSpawners.length == 0 ) {
                game.util.debugDisplayText('No visible spawners found.', 'no vis spawners');
                return;
            }

            // This is the index of the spawner that we will select.
            var index = null;

            // Figure out which one we currently have selected.
            for (var i = 0; i < visibleSpawners.length; i++) {
                if ( visibleSpawners[i].x == this.spawnPointX && visibleSpawners[i].y == this.spawnPointY ) {
                    if ( selectNext ) {
                        index = i + 1;
                    } else {
                        index = i - 1;
                    }

                    break;
                }
            };

            // This should also never happen. This means we iterated through all
            // of the spawners without finding the one that was currently
            // selected.
            //
            // Note: this actually can currently happen on the overworld because
            // you don't have a selected spawner there, so we'll just return
            // here.
            if ( index == null ) {
                return;
            }

            // Wrap around the boundaries of the array
            if ( index < 0 ) index = visibleSpawners.length - 1;
            else if ( index > visibleSpawners.length - 1 ) index = 0;

            // Select and pan to the next spawner
            var nextSpawner = visibleSpawners[index];
            this.spawnPointX = nextSpawner.x;
            this.spawnPointY = nextSpawner.y;

            game.Camera.panInstantlyTo(this.spawnPointX * game.TILESIZE, this.spawnPointY * game.TILESIZE, true);
        },

        /**
         * Calculates the cost to place the specified unit
         * @param  {Unit} unit - Unit that can be placed
         * @return {Number}    Cost to place the unit 
         */
        costToPlaceUnit: function(unit) {
            return game.UNIT_PLACEMENT_COST;
        },

        /**
         * Places a unit, if possible. This costs money.
         * @param  {Unit} unit - the unit to place
         * @return {game.PlaceUnitStatus} - the error or success code.
         */
        placeUnit: function(unit) {
            var cost = this.costToPlaceUnit(unit);
            if (!this.canSpawnUnits()) {
                return game.PlaceUnitStatus.CANNOT_SPAWN_UNITS;
            }

            if ( unit.hasBeenPlaced ) {
                return game.PlaceUnitStatus.UNIT_ALREADY_PLACED;
            }

            if ( !game.Player.hasThisMuchMoney(cost) ) {
                return game.PlaceUnitStatus.NOT_ENOUGH_MONEY;
            }

            unit.placeUnit(this.spawnPointX, this.spawnPointY, game.MovementAI.FOLLOW_PATH);
            game.Player.modifyCoins(-cost);

            return game.PlaceUnitStatus.SUCCESSFULLY_PLACED;
        },

        /**
         * Buys a new unit slot. unitType is passed in so that this code can be
         * used elsewhere to buy a unit regardless of what the unit placement UI
         * is currently showing.
         * @param  {game.PlaceableUnitType} unitType - the unit type to buy
         * @return {Boolean} - True if the unit was bought
         */
        buyNewUnit: function(unitType) {
            // Make sure the player can afford it
            var cost = this.costToPurchaseSlot(unitType);
            if (!game.Player.hasThisManyDiamonds(cost)) {
                return false;
            }

            // Make sure the player doesn't already have the max number of units
            var numUnits = game.UnitManager.getNumOfPlayerUnits(unitType);
            if ( numUnits == game.MAX_UNITS_PER_CLASS ) {
                // The only way the code should be able to get here is via a
                // debug function like debugAddUnits, but it doesn't hurt to
                // have this check.
                return false;
            }

            game.Player.modifyDiamonds(-cost);

            // Create the new unit
            var newUnit = new game.Unit(unitType, game.PlayerFlags.PLAYER, 1);

            // Give it an alternate costume if it isn't the first unit
            if ( numUnits >= 1 && numUnits <= game.MAX_UNITS_PER_CLASS - 1 ) {
                newUnit.graphicIndexes = game.UnitManager.getUnitCostume(unitType, -1);
            }

            game.UnitManager.addUnit(newUnit);

            // If you're looking at the overworld, add that unit to the
            // overworld now.
            if ( game.GameStateManager.inStateToPlaceUnitsOnOverworld() ) {
                var tileOfLastMap = game.currentMap.getTileOfLastMap();
                game.UnitManager.placeAllPlayerUnits(tileOfLastMap.x, tileOfLastMap.y, game.MovementAI.WANDER_UNFOGGY_WALKABLE);
            }

            // Now that you've bought a unit, perhaps you can buy an item.
            game.ShopUI.updateBuyButton();

            return true;
        },

        /**
         * Sets the spawn point tiles
         * @param {Number} tileX Tile X
         * @param {Number} tileY Tile Y
         */
        setSpawnPoint: function(tileX, tileY) {
        	this.spawnPointX = tileX;
        	this.spawnPointY = tileY;
        },

        /**
         * Draws a highlight around the currently selected spawn point so that
         * you know where your units will come out.
         * @param  {Object} ctx - the canvas context
         */
        highlightCurrentSpawnPoint: function(ctx) {
            if ( !game.GameStateManager.isNormalGameplay() ) {
                return;
            }

            ctx.save();

            var worldX = this.spawnPointX * game.TILESIZE;
            var worldY = this.spawnPointY * game.TILESIZE;

            var padding = game.STATUS_EFFECT_PADDING;

            // The lowest alpha to use
            var lowerBound = 0;

            // The highest alpha to use
            var upperBound = .7;

            // The speed at which to cycle through the alphas
            var speed = .0125;
            this.highlightAlpha += this.highlightAlphaChange * speed;

            // Cap at the bounds
            if ( this.highlightAlpha >= upperBound ) {
                this.highlightAlpha = upperBound - .00001;
                this.highlightAlphaChange *= -1;
            } else if ( this.highlightAlpha <= lowerBound ) {
                this.highlightAlpha = lowerBound + .00001;
                this.highlightAlphaChange *= -1;
            }

            var blink = game.alphaBlink * 53;
            var blink2 = game.alphaBlink * 29;
            var r = Math.floor(blink % 255);
            var g = Math.floor(blink2 % 255);

            // After 128, cycle back down so that it doesn't go from 0 to 255
            // back to 0 (it would be an abrupt change to black sometimes). This
            // makes it smoother. We can later multiply these values by 2 if we
            // want since they won't be higher than 128, but the darker colors
            // seem to work better.
            if ( r > 128 ) r = 255 - r;
            if ( g > 128 ) g = 255 - g;
            ctx.lineWidth = padding * 2;
            ctx.strokeStyle = 'rgba(' + r + ', ' + g + ',0, ' + this.highlightAlpha + ')';
            ctx.strokeRect(worldX - padding, worldY - padding, game.TILESIZE + padding * 2, game.TILESIZE + padding * 2);
            ctx.restore();
        },

    };
}()); 