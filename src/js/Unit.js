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

    /**
     * See displayLifeBarForPlayer.
     * @type {Object}
     */
    window.game.DisplayLifeBarFor = {
        PLAYER:1,
        ENEMY:2,
        PLAYER_AND_ENEMY:3,
        CASTLE:4
    };

    /**
     * Flags for showing what kind of unit this is
     * @type {Object}
     */
    window.game.PlayerFlags = {
        PLAYER: 1,
        ENEMY: 2,
        NEUTRAL: 4,
        BOSS: 8,
        SUMMON: 16,
    };

    // This represents a 2x1 unit. 496 was chosen because it's the first index
    // that doesn't correspond to a valid sprite.

    // Assign IDs for now to make debugging easier.
    window.game.unitID = 0;

    // This should always reflect the size of the widest unit. It's used by the
    // battle system's repositioning logic.
    window.game.LARGEST_UNIT_WIDTH = 2;

    // This is just a number that goes up about 1/FPS every game loop. It's used
    // to blink the green highlights on units when they're a possible target.
    window.game.alphaBlink = 0;

    /**
     * When you press the display-life-bar key, this will be set to true. It is
     * set to false when you let go of the key.
     * @type {Boolean}
     */
    window.game.keyPressedToDisplayLifeBars = false;

    /**
     * This is some combination of the DisplayLifeBarFor flags. When non-zero,
     * life bars will always be displayed for player units, enemy units, or
     * both.
     * @type {game.DisplayLifeBarFor}
     */
    window.game.displayLifeBarForPlayer = 0;

    /**
     * If true, this will draw life bars when a unit is in battle.
     * @type {Boolean}
     */
    window.game.displayLifeBarsInBattle = false;

    /**
     * Creates a unit.
     * @param {Number}  unitType - an ID from game.UnitType, e.g.
     * game.UnitType.ORC.id.
     * @param {game.PlayerFlags} playerFlags - Tell what kind of unit this is
     * @param {Number} level - the level at which to start this unit.
     */
    window.game.Unit = function Unit(unitType, playerFlags, level) {
        var unitData = game.GetUnitDataFromID(unitType, level);

        this.unitType = unitType;

        this.id = window.game.unitID++;
        this.hasBeenPlaced = false;

        // This will be set when we place the unit. It is the last tile that we
        // were on, or, if there is no such last tile, it refers to the current
        // tile.
        this.previousTile = null;

        // Give the unit a standard movement AI.
        this.movementAI = game.MovementAI.FOLLOW_PATH;

        /**
         * The number of milliseconds that this unit has been on the map for. We
         * use this for animation (check out the draw code).
         * @type {Number}
         */
        this.animationTimer = 0;

        /**
         * StatusEffects affecting this unit.
         * @type {Array:StatusEffect}
         */
        this.removeStatusEffects();

        this.level = level;
        this.experience = 0;

        // Note: there is only a base life stat; status and items only apply to
        // maxLife. Damage and healing are what apply to life, not [de]buffs.
        // 
        // We set it to 0 here simply so that when we call restoreLife, it isn't
        // equal to 'undefined'.
        this.life = 0;

        // You have a graphic index for each tile that you take up.
        // 'graphicIndexes' represents all of the tiles, from left to right, top
        // to bottom, to use when drawing a unit.
        //
        // For example,
        // A 2x2 monster may have indexes [0,5,19,24], which means to
        // draw them like this:
        // 0  5
        // 19 24
        // For an enemy, it would draw them horizontally flipped.
        this.graphicIndexes = unitData.graphicIndexes;

        // The number of the graphic to draw for the shadow.
        this.shadowGraphic = unitData.shadowGraphic;

        this.widthInTiles = unitData.width;
        this.heightInTiles = unitData.height;
        this.name = unitData.name;

        this.playerFlags = playerFlags;

        if (!this.areValidPlayerFlags(this.playerFlags)) {
            console.log('Fatal error: Player flags for unit with ID ' + 
                this.id + ' are invalid. Flags: ' + this.playerFlags);
        }

        this.maxLife = unitData.finalLife;
        this.atk = unitData.finalAtk;
        this.def = unitData.finalDef;

        // Multiply enemy stats by the map's stat multiplier.
        if ( this.isEnemy() ) {
            var statMultiplier = game.currentMap.nodeOfMap.statMultiplier;
            this.maxLife = Math.floor(this.maxLife * statMultiplier);
            this.atk = Math.floor(this.atk * statMultiplier);
            this.def = Math.floor(this.def * statMultiplier);
        }

        this.chanceToDropItem = 0;
        this.itemsDropped = [];

        if ( game.currentMap.nodeOfMap != null ) {
            this.chanceToDropItem = unitData.chanceToDropItem * game.currentMap.nodeOfMap.itemDropChanceMultiplier;
            if ( unitData.itemsDropped !== undefined ) {
                this.itemsDropped = game.util.shallowCopyArray(unitData.itemsDropped);
            }
        }

        // Go through the items that this unit can drop and remove any whose
        // level is higher than this unit's level.
        for (var i = 0; i < this.itemsDropped.length; i++) {
            var itemID = this.itemsDropped[i].itemID;
            var item = game.GetItemDataFromID(itemID);
            if ( item.itemLevel > this.level ) {
                this.itemsDropped.splice(i, 1);
                i--;
                continue;
            }
        };

        this.unitDefinedAbilities = unitData.abilities;
        // Set a default ability for now
        this.currentAbility = this.unitDefinedAbilities[0];
        this.abilityAI = unitData.abilityAI;

        this.restoreLife();

        this.width = game.TILESIZE * this.widthInTiles;
        this.height = game.TILESIZE * this.heightInTiles;

        this.areaInTiles = this.widthInTiles * this.heightInTiles;

        // The number of existing units that this player has summoned. They may
        // be alive or dead, but once they're removed from the game, this number
        // will be decremented.
        this.summonedUnitCount = 0;

        // As soon as this is true, the unit will be removed from the map. For
        // enemy units, this means they're removed from the game. For placeable
        // player units, this means they will be "unplaced" (see unplaceUnit).
        this.removeFromMap = false;

        // This is an object with a lot of different things in it.
        this.battleData = null;

        // If this is true, then the unit's current goal is to move back to
        // where he was before starting a battle.
        this.movingToPreBattlePosition = false;

        // These are meaningless unless movingToPreBattlePosition is true, then
        // they represent (in world coordinates) where to move.
        this.preBattleX = null;
        this.preBattleY = null;

        // The destination along the path, in pixels. This will be the center of
        // some tile; we use the center so that we can account for non-1x1
        // units.
        this.destX = null;
        this.destY = null;

        // These point to the mods on the items. They are not copies.
        /**
         * These mods point to mods on whatever items this class is using (they
         * are not copies of the mods that appear on the item). They are stored
         * so that they don't need to be computed every time there's a mod event
         * (e.g. onDamageDealt).
         * @type {Array:ItemMod}
         */
        this.mods = [];

        /**
         * Includes all the abilities from the unit's unit data and from items.
         * @type {Array}
         */
        this.allAbilities = [];

        /**
         * A dictionary whose keys are game.AbilityType and whose values are
         * numbers representing the combined relative weights of abilities of
         * those types.
         *
         * It exists to make picking abilities in battles easier. If an ability
         * of type X fails to find a target, then ALL abilities of that type
         * will fail, so this allows us to stop considering all abilities of
         * that type at once.
         * @type {Object}
         */
        this.usableAbilityTypes = {};
    };

    /**
     * Finds out if the unit is a player unit
     * @return {Boolean} True if the unit is a player unit. Otherwise returns false
     */
    window.game.Unit.prototype.isPlayer = function() {
        return (this.playerFlags & game.PlayerFlags.PLAYER) != 0;
    };

    /**
     * Finds out if the unit is an enemy unit
     * @return {Boolean} True if the unit is an enemy unit. Otherwise returns false 
     */
    window.game.Unit.prototype.isEnemy = function() {
        return (this.playerFlags & game.PlayerFlags.ENEMY) != 0;
    };

    /**
     * Finds out if the unit is a neutral unit
     * @return {Boolean} True if the unit is a neutral unit. Otherwise returns false
     */
    window.game.Unit.prototype.isNeutral = function() {
        return (this.playerFlags & game.PlayerFlags.NEUTRAL) != 0;
    };

    /**
     * Finds out if the unit is a boss unit
     * @return {Boolean} True if the unit is a boss unit. Otherwise return false
     */
    window.game.Unit.prototype.isBoss = function() {
        return (this.playerFlags & game.PlayerFlags.BOSS) != 0;
    };

    /**
     * Finds out if the unit is a summoned unit
     * @return {Boolean} True if the unit is a summoned unit. Otherwise returns false
     */
    window.game.Unit.prototype.isSummon = function() {
        return (this.playerFlags & game.PlayerFlags.SUMMON) != 0;
    };

    /**
     * Checks to see if the player flags are valid
     * @param  {game.PlayerFlags} playerFlags - Player flags to Check
     * @return {boolean}          True if the flags are valid. Otherwise, 
     * returns false
     */
    window.game.Unit.prototype.areValidPlayerFlags = function(playerFlags) {
        var isPlayer = (playerFlags & game.PlayerFlags.PLAYER) != 0;
        var isNeutral = (playerFlags & game.PlayerFlags.NEUTRAL) != 0;
        var isEnemy = (playerFlags & game.PlayerFlags.ENEMY) != 0;
        var isBoss = (playerFlags & game.PlayerFlags.BOSS) != 0;

        // Player flags MUST contain at least player or enemy or neutral
        if ( !isPlayer && !isEnemy && !isNeutral ) {
            console.log('playerFlags were specified that are neither player, neutral, or enemy: ' + playerFlags);
            return false;
        }

        // Can't be any combination of player/enemy/neutral
        if ( (isPlayer && isEnemy) || (isPlayer && isNeutral) || (isNeutral && isEnemy) ) {
            console.log('playerFlags were specified that are a combination of ' +
                'player, enemy, and neutral (not necessarily all of them though): ' + playerFlags);
            return false;
        }

        if (isBoss && (isPlayer || isNeutral)) {
            return false;
        }

        return true;
    };

    /**
     * This will turn this enemy into a boss.
     * @return {undefined}
     */
    window.game.Unit.prototype.convertToBoss = function() {
        this.playerFlags |= game.PlayerFlags.BOSS;
        this.movementAI = game.MovementAI.LEASH_TO_TILE;
    };

    /**
     * Places a unit at the given pixel locations
     * @param  {Number} xInPixels - x coordinate
     * @param  {Number} yInPixels - y coordinate
     * @param  {game.MovementAI} movementAI - a movement AI to apply, or null if
     * you don't want to change whatever the current one is.
     */
    window.game.Unit.prototype.placeUnitAtPixelCoords = function(xInPixels, yInPixels, movementAI) {
        if ( movementAI != null ) {
            this.movementAI = movementAI;
        }

        this.setCenterX(xInPixels);
        this.setCenterY(yInPixels);
        this.movingToPreBattlePosition = false;
        this.hasBeenPlaced = true;
        this.previousTile = null;
        this.destX = null;
        this.destY = null;
        this.animationTimer = 0;

        this.cacheEquipmentStats();

        // Now that we have the equipment stats, we can restore our life.
        this.life = 0;
        this.restoreLife();

        // Make an exact copy of all the abilities in the unit. We don't want to
        // modify the original list.
        this.allAbilities = game.AbilityManager.copyAbilitiesList(this.unitDefinedAbilities);

        this.grantClassAbilitiesBasedOnLevel();

        // Remove battle data just in case. There was a bug where you would join
        // a battle, win the map, then place this unit again, and it would think
        // it's still in the battle.
        this.battleData = null;

        this.acquireNewDestination();

        // Purge status effects
        this.removeStatusEffects();

        // Populate this.mods
        this.populateMods();

        this.populateAbilitiesBasedOnItems();

        this.finalizeAbilities();
    };

    /**
     * Modifies the relative weight of the specified ability (if the ability
     * exists in this unit).
     * @param  {Number} abilityID         - the ID of the ability
     * @param  {Number} newRelativeWeight - the relative weight to assign
     */
    window.game.Unit.prototype.modifyAbilityRelativeWeight = function(abilityID, newRelativeWeight) {
        var abilityIndex = this.hasAbility(abilityID);
        if ( abilityIndex == -1 ) return;
        this.allAbilities[abilityIndex].relativeWeight = newRelativeWeight;
    };

    /**
     * See comments in AbilityManager. This only exists to make code more
     * readable.
     */
    window.game.Unit.prototype.hasAbility = function(abilityID) {
        return game.AbilityManager.hasAbility(abilityID, this.allAbilities);
    };

    /**
     * Every time this unit is placed or levels up, this is called. I did it
     * this way so that saved games don't need to store/restore the abilities;
     * it would be less straightforward.
     */
    window.game.Unit.prototype.grantClassAbilitiesBasedOnLevel = function() {
        if ( !this.isPlayer() ) return;

        var grantedAbilities = false;

        if ( this.unitType == game.PlaceableUnitType.ARCHER ) {

            if ( this.level >= game.ARCHER_SKILL_1_REQUIRED_LVL && 
                    this.hasAbility(game.Ability.SUMMON_WOLF.id) == -1 ) {
                this.allAbilities.push({id: game.Ability.SUMMON_WOLF.id});

                grantedAbilities = true;
            }

            if ( this.level >= game.ARCHER_SKILL_2_REQUIRED_LVL && 
                    this.hasAbility(game.Ability.SUMMON_RAVEN.id) == -1 ) {
                this.allAbilities.push({id: game.Ability.SUMMON_RAVEN.id});
                this.modifyAbilityRelativeWeight(game.Ability.SUMMON_WOLF.id, game.DEFAULT_ABILITY_RELATIVE_WEIGHT / 2);

                grantedAbilities = true;
            }

            if ( this.level >= game.ARCHER_SKILL_3_REQUIRED_LVL && 
                    this.hasAbility(game.Ability.SUMMON_DRAGON.id) == -1 ) {
                this.allAbilities.push({id: game.Ability.SUMMON_DRAGON.id});

                this.modifyAbilityRelativeWeight(game.Ability.SUMMON_WOLF.id, game.DEFAULT_ABILITY_RELATIVE_WEIGHT / 4);
                this.modifyAbilityRelativeWeight(game.Ability.SUMMON_RAVEN.id, game.DEFAULT_ABILITY_RELATIVE_WEIGHT / 2);

                grantedAbilities = true;
            }
        } else if ( this.unitType == game.PlaceableUnitType.WIZARD ) {

            if ( this.level >= game.WIZARD_SKILL_1_REQUIRED_LVL && 
                    this.hasAbility(game.Ability.HEAL.id) == -1 ) {
                this.allAbilities.push({id: game.Ability.HEAL.id});

                grantedAbilities = true;
            }

            if ( this.level >= game.WIZARD_SKILL_2_REQUIRED_LVL && 
                    this.hasAbility(game.Ability.BUFF_STATS.id) == -1 ) {
                this.allAbilities.push({id: game.Ability.BUFF_STATS.id});

                grantedAbilities = true;
            }

            if ( this.level >= game.WIZARD_SKILL_3_REQUIRED_LVL && 
                    this.hasAbility(game.Ability.REVIVE.id) == -1 ) {
                this.allAbilities.push({id: game.Ability.REVIVE.id});

                grantedAbilities = true;
            }
        } else if ( this.unitType == game.PlaceableUnitType.WARRIOR ) {

            if ( this.level >= game.WARRIOR_SKILL_1_REQUIRED_LVL && 
                    this.hasAbility(game.Ability.QUICK_ATTACK.id) == -1 ) {
                this.allAbilities.push({id: game.Ability.QUICK_ATTACK.id});

                grantedAbilities = true;
            }

            if ( this.level >= game.WARRIOR_SKILL_2_REQUIRED_LVL &&
                    this.hasAbility(game.Ability.BUFF_DEFENSE.id) == -1 ) {
                this.allAbilities.push({id: game.Ability.BUFF_DEFENSE.id, relativeWeight:500});

                this.modifyAbilityRelativeWeight(game.Ability.QUICK_ATTACK.id, game.DEFAULT_ABILITY_RELATIVE_WEIGHT * 2);

                grantedAbilities = true;
            }
        }

        if ( grantedAbilities ) {
            this.finalizeAbilities();
        }
    };

    /**
     * Wrapper function for placeUnitAtPixelCoords. This function lets you
     * specify tile coordinates.
     */
    window.game.Unit.prototype.placeUnit = function(tileX, tileY, movementAI) {
        var centerXPx = tileX * game.TILESIZE + game.TILESIZE / 2;
        var centerYPx = tileY * game.TILESIZE + game.TILESIZE / 2;
        this.placeUnitAtPixelCoords(centerXPx, centerYPx, movementAI);
    };

    /**
     * Puts stats from class-equipped items into the unit so that the unit won't
     * be affected by changes to your equipment.
     */
    window.game.Unit.prototype.cacheEquipmentStats = function() {
        this.equipmentAtkBonus = this.getItemStatModifiers('atk');
        this.equipmentDefBonus = this.getItemStatModifiers('def');
        this.equipmentLifeBonus = this.getItemStatModifiers('maxLife');
    };

    /**
     * Potentially produces loot. This is according to the unit's loot table.
     * This should only ever be called on enemy units.
     *
     * For now, each unit can only produce at most one type of item, but that
     * item's quantity can be greater than one.
     * @return {Array:Item} - any items produced (empty array if none are
     * produced)
     */
    window.game.Unit.prototype.produceLoot = function() {
        // If this unit can't drop loot, return immediately.
        if ( this.itemsDropped.length == 0 ) return [];

        var dropRoll = Math.random();
        var droppedItems = [];

        // Use '<=' so that when chanceToDrop is 1, you always get an item
        if ( dropRoll <= this.chanceToDropItem ) {
            var lootTableEntry = game.util.randomFromWeights(this.itemsDropped);

            // This is just a sanity check.
            if ( lootTableEntry != null ) {
                var newItem = new game.Item(lootTableEntry.itemID);
                droppedItems.push(newItem);
            }
        }

        return droppedItems;
    };

    /**
     * Every unit needs to be placed, but player units should be "unplaced"
     * (i.e. removed) when they're done. I didn't name this 'removeUnit' because
     * enemy units are technically removed too.
     *
     * This function will light the unit up again in the unit placement UI.
     *
     * Don't call this function when a unit is in battle.
     */
    window.game.Unit.prototype.unplaceUnit = function() {
        if ( !this.isPlayer() ) {
            console.log('Error: unplaceUnit was called on an enemy unit. ' +
                'Ignoring. ID: ' + this.id);
            return;
        }

        // Status effects are also purged when you place a unit, so it wouldn't
        // make sense for them to exist while the unit isn't placed (e.g. if we
        // ever show stats in the unit placement UI or something, we wouldn't
        // want buffs to be taken into account if they won't exist once the unit
        // is placed).
        this.removeStatusEffects();
        this.hasBeenPlaced = false;
        this.removeFromMap = false;
    };

    /**
     * Removes all status effects.
     */
    window.game.Unit.prototype.removeStatusEffects = function() {
        this.statusEffects = [];
    };

    /**
     * @return {Boolean} true if this unit can join a battle
     */
    window.game.Unit.prototype.canJoinABattle = function() {
        // Neutral units can't join battles
        if ((this.playerFlags & game.PlayerFlags.NEUTRAL) != 0) {
            return false;
        }

        // The unit can't have been placed and can't already be in a battle.
        return this.hasBeenPlaced && !this.isInBattle();
    };

    /**
     * There were too many bugs around simply setting removeFromMap equal to
     * true, because units wouldn't actually be removed until the UnitManager
     * updated again. Thus, I made this function so that we could also set
     * hasBeenPlaced to false when this is done.
     */
    window.game.Unit.prototype.removeUnitFromMap = function() {
        this.removeFromMap = true;
        this.hasBeenPlaced = false;
    };

    /**
     * Acquires a new destination based on the movement AI that the unit has.
     * @return {undefined}
     */
    window.game.Unit.prototype.acquireNewDestination = function() {
        if ( this.movementAI == game.MovementAI.FOLLOW_PATH ) {
            this.acquireNewDestinationFollowPath();
        } else if ( this.movementAI == game.MovementAI.LEASH_TO_TILE ) {
            this.acquireNewDestinationBoss();
        } else if ( this.movementAI == game.MovementAI.WANDER_UNFOGGY_WALKABLE ) {
            this.acquireNewDestinationWanderWalkable();
        } else if ( this.movementAI == game.MovementAI.MOVE_TO_SPECIFIC_TILE ) {
            this.acquireNewDestinationMoveSpecificTile();
        } else if ( this.movementAI == game.MovementAI.NONE ) {
            // do nothing (this is only here so an error doesn't print)
        } else {
            console.log('Unreconized movement AI: ' + this.movementAI);
        }
    }

    /**
     * Sets the movement AI MOVE_TO_SPECIFIC_TILE and immediately start moving
     * toward the tile you specify.
     *
     * WARNING: THE UNIT IS GIVEN A PATH WHEN THIS IS CALLED, AND THAT PATH
     * DOESN'T CHANGE! The path doesn't involve fog, but you may reveal a
     * shorter path along the way by clearing some fog, but too bad, it won't be
     * recomputed.
     * @param  {Tile} tile - a tile to move to
     */
    window.game.Unit.prototype.moveToSpecificTile = function(tile) {
        this.movementAI = game.MovementAI.MOVE_TO_SPECIFIC_TILE;

        var startTile = this.getCenterTile();
        this.path = game.currentMap.findPathWithoutFog(startTile, tile);

        if ( this.path == null ) {
            // Given the current scenarios where this movement AI is used, this
            // represents a programming error, so we'll print something, but
            // we'll fail gracefully.
            console.log('Could not find a path from ' + startTile.x + ' ' + startTile.y + ' to ' + tile.x + ' ' + tile.y);
            this.movementAI = game.MovementAI.NONE;
            delete this.path;
            return;
        }

        // Cut out the start tile since we're on that
        if ( this.path.length > 1 ) {
            this.path.splice(0, 1);
        }

        // Make them immediately stop with their current destination
        this.acquireNewDestination();
    };
    
    /**
     * This is for the MOVE_TO_SPECIFIC_TILE movement AI.
     */
    window.game.Unit.prototype.acquireNewDestinationMoveSpecificTile = function() {
        var nextTile = this.path[0];

        this.destX = nextTile.x * game.TILESIZE + game.TILESIZE / 2;
        this.destY = nextTile.y * game.TILESIZE + game.TILESIZE / 2;

        this.path.splice(0, 1);

        if ( this.path.length == 0 ) {
            delete this.path;
            this.movementAI = game.MovementAI.NONE;
        }
    };

    /**
     * This is for the WANDER_UNFOGGY_WALKABLE movement AI. See the comment for
     * WANDER_UNFOGGY_WALKABLE.
     */
    window.game.Unit.prototype.acquireNewDestinationWanderWalkable = function() {
        // If they have already had at least one destination, then we will
        // randomly return from this function so that units with this AI don't
        // all move in sync with one another.
        if ( this.destX != null ) {
            // Base the randomness on the unit's ID so that they all have
            // different "speeds".
            var upperBound = ((this.id % 3) + 1) * 8;
            if (game.util.randomInteger(0,upperBound) != 1 ) return;
        }
        var currentTile = this.getCenterTile();

        var possibleTiles = game.currentMap.getWalkableUnfoggyNeighbors(currentTile);

        // Randomly pick one as our destination
        var destTile = game.util.randomArrayElement(possibleTiles);

        this.destX = destTile.x * game.TILESIZE + game.TILESIZE / 2;
        this.destY = destTile.y * game.TILESIZE + game.TILESIZE / 2;
    };

    /**
     * acquireNewDestination for the BOSS AI. It moves around the general
     * vicinity while staying leashed to the starting tile.
     */
    window.game.Unit.prototype.acquireNewDestinationBoss = function() {
        if ( this.leashTileX === undefined ) {
            this.leashTileX = this.getCenterTileX();
            this.leashTileY = this.getCenterTileY();
        }

        if ( this.leashRadius === undefined) {
            this.leashRadius = 2;
        }

        // Get a random tile within RADIUS of the leash tile.
        var tileX = this.leashTileX - this.leashRadius + game.util.randomInteger(0, this.leashRadius * 2 + 1);
        var tileY = this.leashTileY - this.leashRadius + game.util.randomInteger(0, this.leashRadius * 2 + 1);

        this.destX = tileX * game.TILESIZE + game.TILESIZE / 2;
        this.destY = tileY * game.TILESIZE + game.TILESIZE / 2;
    };

    /**
     * Navigates to a random valid neighbor, which is based on the tile's
     * leftList or rightList.
     */
    window.game.Unit.prototype.acquireNewDestinationFollowPath = function() {
        // All pathfinding is based on centers to account for non-1x1 units
        var centerTileX = this.getCenterTileX();
        var centerTileY = this.getCenterTileY();
        var tile = this.getCenterTile();

        var listToUse;
        var isTileALeftEndpoint;
        var isTileARightEndpoint

        if ( tile != null ) {
            listToUse = this.isPlayer() ? tile.leftList : tile.rightList;
            isTileALeftEndpoint = this.isPlayer() ? tile.isLeftEndpoint : tile.isRightEndpoint;
            isTileARightEndpoint = this.isPlayer() ? tile.isRightEndpoint : tile.isLeftEndpoint;
        }

        // If we're at or past the end of a path, or if we're off the map, then
        // just keep moving off the map.
        if ( tile == null || !tile.isWalkable() || isTileARightEndpoint ) {
            // These may not be set yet if we placed a unit right at the end of
            // the path.
            if ( this.destX == null || this.destY == null ) {
                this.destX = this.getCenterX();
                this.destY = this.getCenterY();
            }

            this.destX += this.isPlayer() ? game.TILESIZE : -game.TILESIZE;
            return;
        }

        // In order to find the next tile, we need to know our previous tile. If
        // we just placed this unit, then there is no previousTile, but we can
        // just set it to tile because its left/right-list contains itself.
        if ( this.previousTile == null ) {
                this.previousTile = tile;
        }

        // Randomly choose a valid neighbor
        var validRightNeighbors = listToUse[this.previousTile.tileIndex];
        var nextTile = game.util.randomArrayElement(validRightNeighbors);
        if ( nextTile == null ) debugger;

        this.destX = nextTile.getPixelCenterX();
        this.destY = nextTile.getPixelCenterY();

        this.previousTile = tile;
    };

    /**
     * Updates this unit, moving it, making it execute its battle turn, etc.
     * @param  {Number} delta - time in ms since this function was last called
     */
    window.game.Unit.prototype.update = function(delta) {
        // We only update if the unit was placed
        if ( !this.hasBeenPlaced ) return;

        var deltaAsSec = delta / 1000;
        // var speed = Math.random()*120 + 500;
        var speed = 60;
        if ( game.GameStateManager.isMovingToNormalMap() ) {
            // Increase the speed based on how long we've been transitioning,
            // that way the user doesn't have to wait forever.
            speed = Math.min(1800, 300 + game.GameStateManager.timeSpentInCurrentState);
        }
        var change = speed * deltaAsSec;

        this.animationTimer += delta;

        // All movement should be based on center coordinates so that two
        // differently sized units can have the same destination values and not
        // end up going to different places.
        var centerX = this.getCenterX();
        var centerY = this.getCenterY();
        if (!this.isInBattle()) {
            if ( this.movingToPreBattlePosition ) {
                var desiredX = this.preBattleX;
                var desiredY = this.preBattleY;

                var newCoords = game.util.chaseCoordinates(centerX, centerY, desiredX, desiredY, change, true);
                this.setCenterX(newCoords.x);
                this.setCenterY(newCoords.y);

                if ( newCoords.atDestination ) {
                    this.movingToPreBattlePosition = false;
                }
            } else {
                var desiredX = this.destX;
                var desiredY = this.destY;

                var newCoords = game.util.chaseCoordinates(centerX, centerY, desiredX, desiredY, change, true);

                this.setCenterX(newCoords.x);
                this.setCenterY(newCoords.y);

                if ( newCoords.atDestination ) {
                    this.acquireNewDestination();
                }

                // Remove generators that the player steps on. Collect things
                // too.
                if ( this.isPlayer() ) {
                    var centerTileX = this.getCenterTileX();
                    var centerTileY = this.getCenterTileY();
                    game.GeneratorManager.removeGeneratorsAtLocation(centerTileX, centerTileY);

                    game.CollectibleManager.collectAtLocation(this, centerTileX, centerTileY);
                } else if ( this.isEnemy() && !this.isBoss() && this.getCenterTile().isCastle() ) { 
                    this.removeUnitFromMap();
                    game.Player.modifyCastleLife(-1);
                }
            }

            // This is the number of pixels a unit has to move off the map
            // before it's considered to be out of bounds. This is PURELY for
            // debugging. Units will eventually never be able to move off of the
            // map (because they will attack the castle when they get to the
            // boundary), but for now, it happens a lot and there's no way to
            // use or kill the unit.
            var outOfBounds = 4 * game.TILESIZE;
            if ( this.x < -outOfBounds || this.x > game.currentMap.numCols * game.TILESIZE + outOfBounds ) {
                this.removeUnitFromMap();
            }

        } else {
            this.updateBattle(delta);
        }

        // Clear some fog every loop, even if we're in battle.
        if ( this.isPlayer() && game.GameStateManager.isNormalGameplay() ) {
            game.currentMap.setFog(this.getCenterTileX(), this.getCenterTileY(), 3, false, true);
        }

        this.updateStatusEffects(delta);
    };

    /**
     * Updates any status effects, removing the ones that are finished.
     * @param  {Number} delta - time in ms since this function was last called
     */
    window.game.Unit.prototype.updateStatusEffects = function(delta) {
        for (var i = 0; i < this.statusEffects.length; i++) {
            var effect = this.statusEffects[i];
            effect.update(delta);

            if ( !effect.isLiving() ) {
                this.statusEffects.splice(i, 1);
                i--;
                continue;
            }
        };
    };

    /**
     * Adds a status effect to this unit. For a description of the arguments,
     * see StatusEffect's constructor.
     */
    window.game.Unit.prototype.addStatusEffect = function(type, options) {
        var statusEffect = new game.StatusEffect(this, type, options);
        this.statusEffects.push(statusEffect);
    };

    window.game.Unit.prototype.updateBattle = function(delta) {
        // Check to see if the battle already ended. This is possible if another
        // unit called updateBattle on the same game loop as this unit and
        // caused the battle to end.
        if ( this.battleData.battle.isDead() ) {
            return;
        }

        var deltaAsSec = delta / 1000;

        // Double the speed in a battle so that rearranging doesn't end up
        // destroying your team (units don't lower their cooldown while moving)
        var speed = 60 * 2;
        var change = speed * deltaAsSec;
        var desiredX = this.battleData.desiredX;
        var desiredY = this.battleData.desiredY;

        var newCoords = game.util.chaseCoordinates(this.x, this.y, desiredX, desiredY, change, true);
        this.x = newCoords.x;
        this.y = newCoords.y;

        // You only count down when you're at your destination and you're alive.
        // 
        // Hard-coding that this unit gets closer to its cooldown at 100 units
        // per second.
        if ( newCoords.atDestination && this.isLiving() ) {

            // When enemies are at their destinations, we clear fog around that
            // enemy so that the player can see what's going on in a battle.
            if ( !this.isPlayer() ) {
                game.currentMap.revealFogAroundUnit(this);
            }

            var cooldownDifference = 100 * deltaAsSec;
            this.battleData.cooldown -= cooldownDifference;
            if ( this.battleData.cooldown <= 0 ) {
                // Also hard-coding the reset time to 200 units. Do this before
                // taking the turn in case the turn modifies the cooldown
                // somehow.
                this.battleData.cooldown = 200;

                this.takeBattleTurn();
            }
        }

    };

    /**
     * Adds/updates/removes abilities as indicated by items.
     */
    window.game.Unit.prototype.populateAbilitiesBasedOnItems = function() {
        // First, go through the abilities that are added by items.
        var equippedItems = game.Player.inventory.getClassEquippedItems(this.unitType);
        for (var i = 0; i < equippedItems.length; i++) {
            var equippedItem = equippedItems[i];

            if ( equippedItem.addsAbilities !== undefined ) {
                for (var j = 0; j < equippedItem.addsAbilities.length; j++) {
                    var itemAbility = equippedItem.addsAbilities[j];
                    var abilityIndex = this.hasAbility(itemAbility.id);

                    if ( abilityIndex != -1 ) {
                        // The ability exists, so update it.
                        game.util.copyProps(itemAbility, this.allAbilities[abilityIndex]);
                    } else {
                        // It doesn't exist, so add it.
                        var copiedAbility = game.AbilityManager.copyAbility(itemAbility);
                        this.allAbilities.push(copiedAbility);
                    }
                };
            }
        }; 

        // Now go through each item and remove any abilities that it tells you
        // to.
        for (var i = 0; i < equippedItems.length; i++) {
            var equippedItem = equippedItems[i];
            if ( equippedItem.removesAbilities !== undefined ) {
                for (var j = 0; j < equippedItem.removesAbilities.length; j++) {
                    var removeAbilityID = equippedItem.removesAbilities[j];

                    var abilityIndex = this.hasAbility(removeAbilityID);

                    if ( abilityIndex != -1 ) {
                        this.allAbilities.splice(abilityIndex, 1);
                    }
                }
            }
        }
    };

    /**
     * Makes sure that this unit at least has an ATTACK ability, fills out any
     * missing ability data, and sets the usable ability types that this unit
     * has.
     */
    window.game.Unit.prototype.finalizeAbilities = function() {
        // If we removed all of the abilities, then give them their attack back.
        if ( this.allAbilities.length == 0 ) {
            this.allAbilities.push( {id:game.Ability.ATTACK.id} );
        }

        // Make sure that all ability attributes are filled in. It's possible
        // that an ability from an item replaced an ability and didn't define
        // all the attributes, so this will ensure they get filled in.
        game.AbilityManager.setDefaultAbilityAttrIfUndefined(this.allAbilities);

        // At this point, all the abilities should be set. Let's now loop
        // through all of them and add up all the relative weights for each
        // ability type.
        this.usableAbilityTypes = {};
        for (var i = 0; i < this.allAbilities.length; i++) {
            var ability = this.allAbilities[i];

            if ( this.usableAbilityTypes[ability.type] === undefined ) {
                this.usableAbilityTypes[ability.type] = 0;
            } 

            // Now that it exists, add to the sum.
            this.usableAbilityTypes[ability.type] += ability.relativeWeight;
        };
    };

    /**
     * Randomly finds an ability. The abilityTypeToStartWith parameter is
     * optional, and if it is supplied, then the list is searched for that type
     * of ability first. When an ability is chosen that won't work, no more
     * abilities of that type are tried, and this function keeps searching for
     * an ability that will work. Once it does, this unit's ability is set and a
     * target unit is returned.
     * 
     * @param {game.AbilityType} abilityTypeToStartWith - Optional argument. If
     * provided, the list will be searched for this type of ability first
     * @return {game.Unit} target unit
     */
    window.game.Unit.prototype.setAbilityAndGetTarget = function(abilityTypeToStartWith) {
        var battle = this.battleData.battle;
        var targetUnit = null;
        var ability = null;
        var startingPair = null;

        // Turn the dictionary into an array of objects with relative weights so
        // that it can be used by randomFromWeights.
        var abilityTypesList = [];
        for ( key in this.usableAbilityTypes ) {
            var pair = {type: key, relativeWeight: this.usableAbilityTypes[key]};
            if ( key === abilityTypeToStartWith ) {
                startingPair = pair;
            }
            abilityTypesList.push(pair);
        }
        
        // We can only try for as many ability types as we have.
        var numTries = abilityTypesList.length;
        while ( numTries > 0 ) {
            // If we already have a starting type, go with that. Otherwise,
            // randomly choose a type.
            var abilityTypeAndRelativeWeight = (startingPair === null) ? game.util.randomFromWeights(abilityTypesList) : startingPair;

            // Set the startingPair to null so that we don't keep picking it.
            startingPair = null;

            var abilityType = abilityTypeAndRelativeWeight.type;
            var abilititesOfSameType = game.AbilityManager.getAbilitiesOfType(abilityType, this.allAbilities);
            
            ability = game.util.randomFromWeights(abilititesOfSameType);
            targetUnit = battle.getRandomUnitMatchingFlags(this, ability.allowedTargets);

            // Player units can only have one summon out at a time.
            if ( ability.type == game.AbilityType.SUMMON && this.isPlayer() && this.summonedUnitCount > 0 ) {
                targetUnit = null;
            }

            if ( targetUnit != null ) {
                this.currentAbility = ability;
                return targetUnit;
            }

            // Set the relative weight to 0 so that this can't be chosen again.
            abilityTypeAndRelativeWeight.relativeWeight = 0;
            numTries--;
        };

        // If there is a battle, there should always be a target, so this code 
        // shouldn't be reached
        console.log('ERROR: There is no target for this unit type: ' + this.unitType);
        return null;
    };

    /**
     * Summons a unit into the current battle.
     */
    window.game.Unit.prototype.summonUnitViaCurrentAbility = function() {
        var battle = this.battleData.battle;
        var flags = game.PlayerFlags.ENEMY;
        if ( this.isPlayer() ) {
            flags = game.PlayerFlags.PLAYER;
        }
        flags |= game.PlayerFlags.SUMMON;
        var summonedUnitID = this.currentAbility.summonedUnitID;

        // Determine the level of the summoned unit
        var summonedUnitLevel = this.currentAbility.summonedUnitLevel;
        if ( summonedUnitLevel == game.SUMMON_AT_LEVEL_OF_SUMMONER ) {
            summonedUnitLevel = this.level;
        } else if ( summonedUnitLevel == game.SUMMON_AT_HALF_LEVEL_OF_SUMMONER ) {
            summonedUnitLevel = Math.ceil(this.level / 2.0);
        }

        var newUnit = new game.Unit(summonedUnitID, flags, summonedUnitLevel);
        newUnit.summoner = this;
        this.summonedUnitCount++;

        newUnit.placeUnitAtPixelCoords(this.getCenterX(), this.getCenterY(),this.movementAI);
        game.UnitManager.addUnit(newUnit);

        // Force the unit to join this battle. We pass coordinates so that
        // the unit can go back to the summoner's original position when the
        // battle ends.
        battle.summonedUnit(this, newUnit);
    };

    /**
     * Attack, cast a spell, etc.
     */
    window.game.Unit.prototype.takeBattleTurn = function() {
        // Short hand
        var battle = this.battleData.battle;
        var targetUnit = null;
        this.currentAbility = null;
        switch ( this.abilityAI ) {
            case game.AbilityAI.RANDOM:
                targetUnit = this.setAbilityAndGetTarget();
                break;

            case game.AbilityAI.USE_REVIVE_IF_POSSIBLE:
                targetUnit = this.setAbilityAndGetTarget(game.AbilityType.REVIVE);
                break;

            case game.AbilityAI.USE_HEAL_IF_POSSIBLE:
                targetUnit = this.setAbilityAndGetTarget(game.AbilityType.HEAL);
                break;

            case game.AbilityAI.USE_ABILITY_0_WHENEVER_POSSIBLE:
            default:
                targetUnit = battle.getRandomUnitMatchingFlags(this, this.allAbilities[0].allowedTargets);
                if ( targetUnit == null ) {
                    game.AbilityManager.removeAbilitiesOfType(this.allAbilities[0].abilityType, this.allAbilities);

                    // Fall back to randomly choosing an ability
                    targetUnit = this.setAbilityAndGetTarget();
                }
                break;
        }

        this.battleData.cooldown /= this.currentAbility.divideCooldownBy;

        // Handle the case for summoning. After a unit is summoned, this code
        // returns in order to not create a projectile.
        if ( this.currentAbility.type == game.AbilityType.SUMMON ) {
            this.summonUnitViaCurrentAbility();
            return;
        }

        // There's only a single attack modifier allowed, and we'll check for
        // that here.
        var modifiedAttack = false;
        for (var i = 0; i < this.mods.length; i++) {
            if ( this.mods[i].onBattleTurn(this) ) {
                modifiedAttack = true;
                break;
            }
        };

        if ( !modifiedAttack ) {
            var newProjectile = new game.Projectile(this.getCenterX(), this.getCenterY(),this.currentAbility,this,targetUnit);
            battle.addProjectile(newProjectile);
        }
    };

    /**
     * Sets up 'this.mods'.
     */
    window.game.Unit.prototype.populateMods = function() {
        this.mods = [];

        // Go through each equipped items and add its mods to this unit's mods.
        var equippedItems = game.Player.inventory.getClassEquippedItems(this.unitType);
        for (var i = 0; i < equippedItems.length; i++) {
            var equippedItem = equippedItems[i];
            for (var j = 0; j < equippedItem.mods.length; j++) {
                this.mods.push(equippedItem.mods[j]);
            };
        }; 
    };

    /**
     * @return {Boolean} true if this unit's type is any of the types in
     * game.PlaceableUnitType.
     */
    window.game.Unit.prototype.isPlaceableUnit = function() {
        var type = this.unitType;
        return (type == game.PlaceableUnitType.ARCHER || type == game.PlaceableUnitType.WARRIOR || type == game.PlaceableUnitType.WIZARD);
    };

    /**
     * Utility function to compute damage based on a damage formula
     * @param {game.DamageFormula} damageFormula - Damage formula used for computing damage
     * @param {game.Unit} user - Unit that's doing the damage
     * @param {game.Unit} target - Unit that's receiving the damage
     * @return {Number} - Damage to be done
     */
    window.game.ComputeDamageFormula = function(damageFormula, user, target) {
        var userAtk = user.getAtk();
        var userLife = user.life;
        var userMaxLife = user.getMaxLife();
        var targetDef = target.getDef();
        switch (damageFormula) {
            case game.DamageFormula.ATK_MINUS_DEF:
                // Prevent healing an enemy with an attack
                if ( targetDef > userAtk ) return 0;

                var damage = userAtk - targetDef;

                // Add or subtract up to 12% damage for some variance.
                var bonusDamage = Math.floor(Math.random() * damage * .12);
                if ( game.util.randomInteger(0,2) == 1 ) bonusDamage *= -1;

                damage += bonusDamage;
                damage = Math.max(0, damage);

                return damage;
            case game.DamageFormula.USE_ATK_VALUE:
                return userAtk;
            case game.DamageFormula.GET_HALF_OF_MISSING_LIFE:
                // Prevent hurting your own unit with a heal when he's above max
                // life.
                if ( userLife >= userMaxLife ) return 0;

                // Minimally heal for one, otherwise you might be at 99/100 and
                // get healed for 0 (i.e. this formula could never heal you to
                // full).
                return Math.min(1, (userMaxLife - userLife) / 2);
        }
    };

    window.game.Unit.prototype.projectileCallback = function(projectile) {
        // Short hand
        var battle = this.battleData.battle;
        var targetUnit = projectile.target;

        var damage = game.ComputeDamageFormula(this.currentAbility.damageFormula, this, targetUnit);
        var actionOnHit = projectile.associatedAbility.actionOnHit;

        switch ( actionOnHit ) {
            case game.ActionOnHit.DO_DAMAGE:
                // Run target's mods to possibly reduce the damage toward that
                // specific target.
                for (var i = 0; i < targetUnit.mods.length; i++) {
                    damage = targetUnit.mods[i].beforeReceiveDamage(this, targetUnit, damage);
                };

                // Player warriors above a certain level can crit.
                if ( this.isPlayer() && this.unitType == game.PlaceableUnitType.WARRIOR && this.level >= game.WARRIOR_SKILL_3_REQUIRED_LVL ) {
                    if ( game.util.percentChance(game.WARRIOR_CRIT_CHANCE) ) {
                        damage = Math.ceil(damage * game.WARRIOR_CRIT_DAMAGE_MULT);
                    }
                }

                // Apply the damage
                var actualDamage = -targetUnit.modifyLife(-damage, true, false);

                for (var i = 0; i < this.mods.length; i++) {
                    this.mods[i].onDamageDealt(this, targetUnit, actualDamage);
                };

                for (var i = 0; i < targetUnit.mods.length; i++) {
                    targetUnit.mods[i].onDamageReceived(this, targetUnit, actualDamage);
                };
                break;

            case game.ActionOnHit.HEAL:
                targetUnit.modifyLife(damage, true, false);
                break;

            case game.ActionOnHit.BUFF_STATS:
                targetUnit.addStatusEffect(game.EffectType.STAT_BOOST);
                break;

            case game.ActionOnHit.BUFF_DEFENSE:
                var options = {
                    defModifier: targetUnit.level
                };
                targetUnit.addStatusEffect(game.EffectType.DEFENSE_BOOST, options);
                break;

            case game.ActionOnHit.REVIVE:
                // If the target is already alive, then we don't do anything here.
                // This is better than just killing the projectile as soon as the
                // target is alive so that you can account for a case where two
                // units shoot a slot-moving revive spell at the same dead guy. The
                // first one might hit, then the unit might die again, and that's
                // when you'd want the second spell to be around still.
                if( targetUnit.isLiving() ) {
                    return;
                }
                targetUnit.restoreLife();
                break;
            default:
                console.log('ERROR: ActionOnHit: \'' + actionOnHit + '\' has not been implemented.');
                break;
        }
    };

    /**
     * Modifies this unit's life.
     * @param  {Number} amount          - amount to modify. Positive is healing,
     * negative is damage.
     * @param  {Boolean} spawnTextEffect - if true, this will spawn a text
     * effect at the unit showing what happened.
     * @param {Boolean} letLifeGoAboveMax - if true, your life can go higher
     * than your maximum. If false, your life will not be added to beyond the
     * maximum, but it won't be capped at your max if it was already that way
     * when this function was called. For example, if a unit has 105% life
     * already and you call this function with 'false' and try to add 10 more
     * life, you'll still be at 105% (no change).
     * @return {Number} - the amount that changed. If you were dealing damage,
     * then this can not be higher than the life this unit had to begin with
     * (e.g. dealing 100 damage to a unit with 40 life will return 40). The
     * return value is positive if you healed life.
     */
    window.game.Unit.prototype.modifyLife = function(amount, spawnTextEffect, letLifeGoAboveMax) {
        // Can't bring units back from the dead with this function.
        if ( !this.isLiving() ) {
            return;
        }
        var oldLife = this.life;

        // Modify life
        var maxLife = this.getMaxLife();

        // Special-case the heal logic
        if ( amount > 0 ) {
            var atMaxAlready = this.life >= maxLife;

            // If we aren't at maximum or if we're allowed to heal past maximum,
            // then we can add life now.
            if ( !atMaxAlready || letLifeGoAboveMax ) {
                this.life += amount;

                var atMaxNow = this.life >= maxLife;

                // If you were already at the maximum to begin with, then we
                // don't ever want to cap your life since that could end up
                // doing damage to you. We only want to cap it if this specific
                // healing pushed us beyond the maximum.
                if ( !atMaxAlready && atMaxNow && !letLifeGoAboveMax ) {
                    this.life = Math.min(this.life, maxLife);
                }
            }

        } else {
            this.life += amount;
        }

        // Spawn a text effect if specified
        if ( spawnTextEffect ) {
            var lifeChangeString = "" + Math.round(amount);
            var fontColor;
            if ( amount < 0 ) {
                fontColor = '#f00';
            } else if ( amount == 0 ) {
                fontColor = '#666';
            } else {
                fontColor = '#0f0';
            }
            var textObj = new game.TextObj(this.getCenterX(), this.y, lifeChangeString, false, fontColor, true);
            game.TextManager.addTextObj(textObj);
        }

        // Check to see if we killed the unit
        if ( !this.isLiving() ) {
            // Wipe out any status effects so that we don't do something stupid
            // like regen ourselves back to life
            this.removeStatusEffects();
            if ( this.battleData != null ) {
                this.battleData.battle.unitDied(this);
            } else {
                this.removeUnitFromMap();

                // If an enemy unit is killed outside of battle, they should
                // still give items/coins.
                if ( !this.isPlayer() ) {
                    // Grant loot
                    var itemsDroppedByThisUnit = this.produceLoot();
                    for (var i = 0; i < itemsDroppedByThisUnit.length; i++) {
                        game.Player.inventory.addItem(itemsDroppedByThisUnit[i]);
                    };

                    // Grant coins
                    var coinsGranted = this.getCoinsGranted();
                    game.Player.modifyCoins(coinsGranted);

                    var coinString = '+' + coinsGranted + ' coin' + (coinsGranted != 1 ? 's' : '');
                    var textObj = new game.TextObj(this.x, this.y, coinString, true, '#0f0', true);
                    game.TextManager.addTextObj(textObj);
                }
            }
        }

        var amountChanged = this.life - oldLife;
        amountChanged = Math.max(-oldLife, amountChanged);
        return amountChanged;
    };

    /**
     * @return {Number} - the number of coins this unit should grant when it's
     * killed.
     */
    window.game.Unit.prototype.getCoinsGranted = function() {
        return this.level * 5;
    };

    /**
     * Returns true if this unit is alive.
     */
    window.game.Unit.prototype.isLiving = function() {
        return this.life > 0;
    };

    window.game.Unit.prototype.getCenterX = function() {
        return this.x + this.width / 2;
    };

    window.game.Unit.prototype.getCenterY = function() {
        return this.y + this.height / 2;
    };

    window.game.Unit.prototype.getCenterTile = function() {
        var tY = this.getCenterTileY();
        var tX = this.getCenterTileX();
        if ( tX >= 0 && tX <= game.currentMap.numCols - 1 && tY >= 0 && tY <= game.currentMap.numRows - 1 ) {
            return game.currentMap.getTile(tX, tY);
        } else {
            return null;
        }
    };

    window.game.Unit.prototype.getCenterTileX = function() {
        return Math.floor(this.getCenterX() / game.TILESIZE);
    };

    window.game.Unit.prototype.getCenterTileY = function() {
        return Math.floor(this.getCenterY() / game.TILESIZE);
    };

    window.game.Unit.prototype.setCenterX = function(pixelX) {
        this.x = pixelX - this.width / 2;
    };

    window.game.Unit.prototype.setCenterY = function(pixelY) {
        this.y = pixelY - this.height / 2;
    };

    window.game.Unit.prototype.isInBattle = function() {
        return this.battleData != null;
    };

    window.game.Unit.prototype.isOffScreen = function() {
        return this.x < -game.TILESIZE || this.x > 25 * game.TILESIZE;
    };

    /**
     * @return {Boolean} true if this unit is at its destination
     */
    window.game.Unit.prototype.isAtDestination = function() {
        return this.getCenterX() == this.destX && this.getCenterY() == this.destY;
    };

    /**
     * See getEffectStatModifiers.
     * @param {Boolean} pullFromUnit - if true, this will use the cached values.
     */
    window.game.Unit.prototype.getItemStatModifiers = function(statType, pullFromUnit) {
        var modifier = 0;
        if ( pullFromUnit === true ) {
            if ( statType == 'atk' ) modifier += this.equipmentAtkBonus;
            else if ( statType == 'def' ) modifier += this.equipmentDefBonus;
            else if ( statType == 'maxLife' ) modifier += this.equipmentLifeBonus;
        } else {
            var equippedItems = game.Player.inventory.getClassEquippedItems(this.unitType);
            for (var i = 0; i < equippedItems.length; i++) {
                var equippedItem = equippedItems[i];
                if ( statType == 'atk' ) modifier += equippedItem.atk;
                else if ( statType == 'def' ) modifier += equippedItem.def;
                else if ( statType == 'maxLife' ) modifier += equippedItem.life;
            }
        }

        return modifier;
    };

    /**
     * Thin wrapper around getItemStatModifiers and getEffectStatModifiers. See
     * those functions for comments.
     */
    window.game.Unit.prototype.getStatModifiers = function(statType) {
        return this.getEffectStatModifiers(statType) + this.getItemStatModifiers(statType, true);
    };

    /**
     * Go through each StatusEffect that is affecting this unit and sum the
     * amount to add/subtract for a given stat.
     * @param  {String} statType - the stat you're interested in (see code below
     * for possible values)
     * @return {Number}          total bonus/drain on that stat (positive ==
     * bonus)
     */
    window.game.Unit.prototype.getEffectStatModifiers = function(statType) {
        var modifier = 0;

        for (var i = 0; i < this.statusEffects.length; i++) {
            var effect = this.statusEffects[i];
            if ( statType == 'atk' ) modifier += effect.atkModifier;
            else if ( statType == 'def' ) modifier += effect.defModifier;
            else if ( statType == 'maxLife' ) modifier += effect.maxLifeModifier;
        }

        return modifier;
    };

    /**
     * Returns atk stat with any status effects and items taken into account.
     */
    window.game.Unit.prototype.getAtk = function() {
        var atkBonus = this.getStatModifiers('atk');
        return this.atk + atkBonus;
    };
    /**
     * Returns def stat with any status effects and items taken into account.
     */
    window.game.Unit.prototype.getDef = function() {
        var defBonus = this.getStatModifiers('def');
        return this.def + defBonus;
    };
    /**
     * Returns max life stat with any status effects and items taken into
     * account.
     */
    window.game.Unit.prototype.getMaxLife = function() {
        var maxLifeBonus = this.getStatModifiers('maxLife');
        return this.maxLife + maxLifeBonus;
    };
    /**
     * Restores life to full (maxLife will have buffs taken into account).
     *
     * If you were already beyond your maximum, then this won't bring your life
     * down.
     */
    window.game.Unit.prototype.restoreLife = function() {
        this.life = Math.max(this.life, this.getMaxLife());
    };

    /**
     * Grants this unit experience, leveling it up if necessary.
     * @param  {Number} experience - the amount of experience to gain
     */
    window.game.Unit.prototype.gainExperience = function(experience) {
        this.experience += experience;

        // Use a 'while' loop in case they can gain more than one level
        while (this.experience >= 100) {
            this.experience -= 100;
            this.levelUp();
        }
    };

    /**
     * Levels this unit up, increasing stats.
     */
    window.game.Unit.prototype.levelUp = function() {
        this.level++;
        this.atk += 5;
        this.def += 1;
        this.maxLife += 10;
        this.restoreLife();

        this.grantClassAbilitiesBasedOnLevel();
    };    

    /**
     * Draws this unit's life bar.
     * @param  {Object} ctx - the canvas context
     */
    window.game.Unit.prototype.drawLifeBar = function(ctx) {
        // Properties of the life bar rectangle
        var w = this.width;
        var h = 7;
        var x = this.x;
        var y = this.y + this.height - h;
        var percentLife = Math.min(1, Math.max(0, this.life / this.getMaxLife()));

        game.graphicsUtil.drawBar(ctx, x,y,w,h, percentLife, {barR:200, borderR:255});
    };

    /**
     * @return {Boolean} true if a life bar should be displayed for this unit
     */
    window.game.Unit.prototype.shouldDisplayLifeBar = function() {
        // Bosses always have their lifebars displayed
        if ( this.isBoss() ) return true;

        // Neutral units shouldn't display life bars
        if ( this.isNeutral() ) return false;

        // If we're looking at the overworld then there's no need to show them.
        if ( game.GameStateManager.inOverworldMap() || game.GameStateManager.isMovingToNormalMap() ) return false;

        // If you pressed a key
        if ( game.keyPressedToDisplayLifeBars ) return true;

        // If you're displaying life bars for players and this is a player unit
        if ( (game.displayLifeBarForPlayer & game.DisplayLifeBarFor.PLAYER) && this.isPlayer() ) return true;

        // If you're displaying life bars for enemies and this is an enemy unit
        if ( (game.displayLifeBarForPlayer & game.DisplayLifeBarFor.ENEMY) && !this.isPlayer() ) return true;

        // If you're displaying life bars while in battle
        if ( game.displayLifeBarsInBattle && this.isInBattle() ) return true;

        // If you're using an item and this unit is a target
        if (game.playerInventoryUI.isUnitAUseTarget(this)) return true;

        // At the end of the minigame, all lifebars should show since it's
        // interesting to see how much you lost/won by and performance matters
        // less.
        if ( game.GameStateManager.inMinigameWinState() || game.GameStateManager.inMinigameLoseState() ) return true;

        return false;
    }

    window.game.Unit.prototype.draw = function(ctx) {
        // Don't draw any units that haven't been placed
        if ( !this.hasBeenPlaced ) return;

        // Don't draw if the camera can't even see this. We supply a padding
        // because status effects can be drawn outside the unit's rect.
        if (!game.Camera.canSeeUnit(this, game.STATUS_EFFECT_PADDING)) return;

        // Dead units always look like a 1x1 tombstone for now.
        if ( this.isInBattle() && !this.isLiving() ) {
            // Draw the tombstone at the center so that it doesn't look awkward
            // for big units.
            // 
            // Also, now that it says "RIP", we never hflip it.
            envSheet.drawSprite(ctx, game.Graphic.RIP_TOMBSTONE, this.getCenterX() - game.TILESIZE / 2, this.getCenterY() - game.TILESIZE / 2, false);              
        } else {

            // Draw all status effects
            for (var i = 0; i < this.statusEffects.length; i++) {
                var effect = this.statusEffects[i];
                effect.draw(ctx);
            }

            // All of the graphics in 'charSheet' are arranged like this:
            // CHAR_A_FRAME_1    CHAR_B_FRAME_1    CHAR_C_FRAME_1
            // CHAR_A_FRAME_2    CHAR_B_FRAME_2    CHAR_C_FRAME_2
            // CHAR_D_FRAME_1    CHAR_E_FRAME_1    CHAR_F_FRAME_1
            // CHAR_D_FRAME_2    CHAR_E_FRAME_2    CHAR_F_FRAME_2
            // 
            // So to get the second frame of any unit, we can simply add the
            // number of sprites in a row on 'charSheet'.
            // 
            // We switch frames in this fashion twice a second (hence the 1000
            // and 500 numbers... 1000 is number of milliseconds, and there are
            // two frames per second).
            var graphicIndexAnimationOffset = 0;
            if ( (this.animationTimer % 1000) >= 500 ) {
                graphicIndexAnimationOffset = charSheet.getNumSpritesPerRow();
            }

            // Draw the shadow.
            if ( game.graphicsUtil.isHighGraphicsMode() ) {
                charSheet.drawSprite(ctx, this.shadowGraphic, this.x, this.y, this.isPlayer());
            }

            // The index in this.graphicIndexes to draw.
            var index = 0;
            for (var j = 0; j < this.heightInTiles; j++) {
                for (var i = 0; i < this.widthInTiles; i++) {
                    // The following code is to flip enemies horizontally. This
                    // only accounts for sizes up to 2x2. Anything bigger and
                    // I'll have to stop hard-coding it.
                    var indexToUse = index;
                    if ( !this.isPlayer() && this.widthInTiles == 2 ) {
                        // Swap 0 and 1
                        if ( index == 0 ) indexToUse = 1;
                        if ( index == 1 ) indexToUse = 0;

                        // Swap 2 and 3
                        if ( index == 2 ) indexToUse = 3;
                        if ( index == 3 ) indexToUse = 2;
                    }

                    charSheet.drawSprite(ctx, this.graphicIndexes[indexToUse] + graphicIndexAnimationOffset, this.x + i * game.TILESIZE, this.y + j * game.TILESIZE, !this.isPlayer());

                    index++;
                };
            };

            // Draw the life bar
            if ( this.shouldDisplayLifeBar() ) {
                this.drawLifeBar(ctx);
            }
        }

        // Draw a green highlight box over the unit if we're in use mode and
        // this unit is a target
        if ( game.playerInventoryUI.isUnitAUseTarget(this) ) {

            // Save the canvas context because we modify the fillStyle
            ctx.save();

            // Blink is always between [-1,1] thanks to sin, so alpha is in the
            // range [.2,.4]. This reduces the subtlety of the green highlight.
            var blink = Math.sin(game.alphaBlink * 4);
            var alpha = blink * .1 + .3;
            ctx.fillStyle = 'rgba(0, 255, 0, ' + alpha + ')';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }

    };

}());
