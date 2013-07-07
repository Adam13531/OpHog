( function() {

    /**
     * See displayLifeBarForPlayer.
     * @type {Object}
     */
    window.game.DisplayLifeBarFor = {
        PLAYER:1,
        ENEMY:2,
        PLAYER_AND_ENEMY:3
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

        // If we ever use this, make sure that mercenaries can't be placed in
        // the overworld. Right now (Sat 07/06/2013 - 12:58 AM), there's no
        // restriction on completing quests in the overworld, so just check game
        // state before placing a mercenary.
        // MERCENARY: 32
    };

    /**
     * These are the movement AIs. Each individual AI is commented.
     */
    window.game.MovementAI = {
        // Units with this AI will follow a path from start to finish.
        FOLLOW_PATH: 'follow path',

        // Units with this AI will be leashed to a certain point. They are given
        // leashTileX and leashTileY. These units can walk on unwalkable tiles.
        LEASH_TO_TILE: 'leash to tile',

        // Wander around the walkable tiles that aren't covered in fog. Units
        // can move in any direction as long as tiles
        // are walkable. Backtracking is allowed.
        // 
        // This is intended for the overworld for now.
        WANDER_UNFOGGY_WALKABLE: 'wander unfoggy walkable',

        // Moves to a specific tile, only following walkable tiles that aren't
        // foggy. Units can move in any direction as long as tiles are walkable.
        // Backtracking is allowed.
        // 
        // This is intended for the overworld for now.
        MOVE_TO_SPECIFIC_TILE: 'move to specific point'
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

        this.widthInTiles = unitData.width;
        this.heightInTiles = unitData.height;
        this.name = unitData.name;

        this.maxLife = unitData.finalLife;
        this.atk = unitData.finalAtk;
        this.def = unitData.finalDef;

        this.chanceToDropItem = unitData.chanceToDropItem;
        this.itemsDropped = unitData.itemsDropped;

        this.restoreLife();

        this.width = tileSize * this.widthInTiles;
        this.height = tileSize * this.heightInTiles;

        this.areaInTiles = this.widthInTiles * this.heightInTiles;

        this.playerFlags = playerFlags;

        if (!this.areValidPlayerFlags(this.playerFlags)) {
            console.log('Fatal error: Player flags for unit with ID ' + 
                this.id + ' are invalid. Flags: ' + this.playerFlags);
        }

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
         * This is only used by NPCs to indicate whether they've already given
         * out their quest.
         * @type {Boolean}
         */
        this.gaveOutQuest = false;

        // Populate this.mods
        this.equipmentChanged();
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
     * Places a unit at the given tile locations
     * @param  {number} tileX tile as an X coordinate
     * @param  {number} tileY tile as a Y coordinate
     * @param  {game.MovementAI} movementAI - a movement AI to apply, or null if
     * you don't want to change whatever the current one is.
     */
    window.game.Unit.prototype.placeUnit = function(tileX, tileY, movementAI) {
        if ( movementAI != null ) {
            this.movementAI = movementAI;
        }

        var centerXPx = tileX * tileSize + tileSize / 2;
        var centerYPx = tileY * tileSize + tileSize / 2;
        this.setCenterX(centerXPx);
        this.setCenterY(centerYPx);
        this.restoreLife();
        this.movingToPreBattlePosition = false;
        this.hasBeenPlaced = true;
        this.previousTile = null;
        this.destX = null;
        this.destY = null;

        // Remove battle data just in case. There was a bug where you would join
        // a battle, win the map, then place this unit again, and it would think
        // it's still in the battle.
        this.battleData = null;

        this.acquireNewDestination();

        // Purge status effects
        this.removeStatusEffects();

        if ( this.isPlayer() ) {
            game.QuestManager.placedAUnit(this.unitType);
        }
    };

    /**
     * Potentially produces loot. This is according to the unit's loot table.
     * This should only ever be called on enemy units.
     *
     * For now, each unit can only produce at most one type of item, but that
     * item's quantity can be greater than one.
     * @return {Array:Item} - any items produced
     */
    window.game.Unit.prototype.produceLoot = function() {
        // This can happen right now because there are at least two ways right
        // now to create invalid enemies (i.e. those without unitData passed
        // in): summoning, and pressing the number keys on the keyboard.
        if ( this.itemsDropped === undefined ) {
            // console.log('Warning: produceLoot was called on a unit that doesn\'t have "itemsDropped": ' + this.);
            return [];
        }

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

        game.UnitPlacementUI.updateUnit(this);
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
        } else {
            console.log('Unreconized movement AI: ' + this.movementAI);
        }
    }

    /**
     * Sets the movement AI MOVE_TO_SPECIFIC_TILE and immediately start moving
     * toward the tile you specify.
     * @param  {Tile} tile - a tile to move to
     */
    window.game.Unit.prototype.moveToSpecificTile = function(tile) {
        this.movementAI = game.MovementAI.MOVE_TO_SPECIFIC_TILE;
        this.specificTile = tile;

        // Make them immediately stop with their current destination
        this.acquireNewDestination();
    };
    
    /**
     * This is for the MOVE_TO_SPECIFIC_TILE movement AI. It will move toward
     * this.specificTile.
     */
    window.game.Unit.prototype.acquireNewDestinationMoveSpecificTile = function() {
        var startTile = this.getCenterTile();

        var path = currentMap.findPathWithoutFog(startTile, this.specificTile);

        // This is possible if you somehow uncovered fog far away and it's not
        // connected.
        // 
        // At this point though, you'll already be in the wrong game
        // state, so we need to revert it.
        if ( path == null ) {
            this.movementAI = game.MovementAI.WANDER_UNFOGGY_WALKABLE;
            game.GameStateManager.enterOverworldState();
            return;
        }

        var destTile;
        if ( path.length == 1 ) {
            destTile = path[0];
        } else {
            destTile = path[1];
        }

        this.destX = destTile.x * tileSize + tileSize / 2;
        this.destY = destTile.y * tileSize + tileSize / 2;
    };

    /**
     * This is for the WANDER_UNFOGGY_WALKABLE movement AI. See the comment for
     * WANDER_UNFOGGY_WALKABLE.
     */
    window.game.Unit.prototype.acquireNewDestinationWanderWalkable = function() {
        var currentTile = this.getCenterTile();

        var possibleTiles = currentMap.getWalkableUnfoggyNeighbors(currentTile);

        // Randomly pick one as our destination
        var destTile = game.util.randomArrayElement(possibleTiles);

        this.destX = destTile.x * tileSize + tileSize / 2;
        this.destY = destTile.y * tileSize + tileSize / 2;
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

        this.destX = tileX * tileSize + tileSize / 2;
        this.destY = tileY * tileSize + tileSize / 2;
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

            this.destX += this.isPlayer() ? tileSize : -tileSize;
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
    }

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
            speed = 300;
        }
        var change = speed * deltaAsSec;

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
            var outOfBounds = 4 * tileSize;
            if ( this.x < -outOfBounds || this.x > currentMap.numCols * tileSize + outOfBounds ) {
                this.removeUnitFromMap();
            }

        } else {
            this.updateBattle(delta);
        }

        // Clear some fog every loop, even if we're in battle.
        if ( this.isPlayer() && game.GameStateManager.isNormalGameplay() ) {
            currentMap.setFog(this.getCenterTileX(), this.getCenterTileY(), 3, false, true);
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
     * Adds a status effect to this unit.
     * @param {StatusEffect} statusEffect - the effect to add
     */
    window.game.Unit.prototype.addStatusEffect = function(statusEffect) {
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
                currentMap.revealFogAroundUnit(this);
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
     * Attack, cast a spell, etc.
     */
    window.game.Unit.prototype.takeBattleTurn = function() {
        // Short hand
        var battle = this.battleData.battle;

        // Revive
        if ( (this.id % 15) == 0 && !this.isBoss() ) {

            // There needs to be a dead unit for this to work.
            var flags = game.RandomUnitFlags.DEAD;
            if ( this.isPlayer() ) {
                flags |= game.RandomUnitFlags.PLAYER_UNIT;
            } else {
                flags |= game.RandomUnitFlags.ENEMY_UNIT;
            }

            var targetUnit = battle.getRandomUnitMatchingFlags(flags);
            if ( targetUnit != null ) {
                var newProjectile = new game.Projectile(this.getCenterX(), this.getCenterY(),1,this,targetUnit);
                battle.addProjectile(newProjectile);
                return;
            }
        }

        // Summon
        if ( !this.isPlayer() && !this.isBoss() && (this.id % 16) == 0 ) {
            var newUnit = new game.Unit(game.UnitType.TREE.id,game.PlayerFlags.SUMMON | game.PlayerFlags.ENEMY,1);
            newUnit.placeUnit(this.getCenterTileX(), this.getCenterTileY(),this.movementAI);
            game.UnitManager.addUnit(newUnit);

            // Force the unit to join this battle. We pass coordinates so that
            // the unit can go back to the summoner's original position when the
            // battle ends.
            battle.summonedUnit(this, newUnit);

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

        // If we didn't modify the attack, then we attack normally.
        if ( !modifiedAttack ) {
            // First, acquire a living target of the opposite team
            var flags = game.RandomUnitFlags.ALIVE;
            if ( this.isPlayer() ) {
                flags |= game.RandomUnitFlags.ENEMY_UNIT;
            } else {
                flags |= game.RandomUnitFlags.PLAYER_UNIT;
            }

            var targetUnit = battle.getRandomUnitMatchingFlags(flags);

            var newProjectile = new game.Projectile(this.getCenterX(), this.getCenterY(),0,this,targetUnit);
            battle.addProjectile(newProjectile);
        }

    };

    /**
     * Call this function any time this unit's equipment changes. It will set up
     * this.mods.
     * @return {undefined}
     */
    window.game.Unit.prototype.equipmentChanged = function() {
        this.mods = [];

        // Go through each equipped items and add its mods to this unit's mods.
        var equippedItems = this.getClassEquippedItems();
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
     * Gets the items that are equipped to this class. This does not work for
     * enemies because it looks in your inventory.
     * @return {Array:Item} - the items that are equipped to this class.
     */
    window.game.Unit.prototype.getClassEquippedItems = function() {
        if ( !this.isPlayer() ) {
            return [];
        }

        var slotType = null;
        var classSlots;
        var equippedItems = [];

        switch ( this.unitType ) {
            case game.PlaceableUnitType.ARCHER:
                slotType = game.SlotTypes.ARCH;
                break;
            case game.PlaceableUnitType.WARRIOR:
                slotType = game.SlotTypes.WAR;
                break;
            case game.PlaceableUnitType.WIZARD:
                slotType = game.SlotTypes.WIZ;
                break;
            default:
                slotType = null;
                break;
        }

        if ( slotType != null ) {
            classSlots = game.Inventory.getAllSlotsOfType(slotType);

            for (var i = 0; i < classSlots.length; i++) {
                if ( !classSlots[i].isEmpty() ) {
                    equippedItems.push(classSlots[i].item);
                }
            };
        }

        return equippedItems;
    };

    window.game.Unit.prototype.projectileCallback = function(projectile) {
        // Short hand
        var battle = this.battleData.battle;
        var targetUnit = projectile.target;

        if ( projectile.type == 0 ) {

            var myAtk = this.getAtk();
            var targetDef = targetUnit.getDef();

            // Compute damage very simply
            var bonusDamage = Math.floor(Math.random() * myAtk * .5);

            var damage = myAtk + bonusDamage - targetDef;
            damage = Math.max(0, damage);

            // Run target's mods to possibly reduce the damage toward that
            // specific target.
            for (var i = 0; i < targetUnit.mods.length; i++) {
                damage = targetUnit.mods[i].beforeReceiveDamage(this, targetUnit, damage);
            };

            // Apply the damage
            var actualDamage = -targetUnit.modifyLife(-damage, true, false);

            for (var i = 0; i < this.mods.length; i++) {
                this.mods[i].onDamageDealt(this, targetUnit, actualDamage);
            };

            for (var i = 0; i < targetUnit.mods.length; i++) {
                targetUnit.mods[i].onDamageReceived(this, targetUnit, actualDamage);
            };
        } else {
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
                        game.Inventory.addItem(itemsDroppedByThisUnit[i]);
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
        if ( tX >= 0 && tX <= currentMap.numCols - 1 && tY >= 0 && tY <= currentMap.numRows - 1 ) {
            return currentMap.getTile(tX, tY);
        } else {
            return null;
        }
    };

    window.game.Unit.prototype.getCenterTileX = function() {
        return Math.floor(this.getCenterX() / tileSize);
    };

    window.game.Unit.prototype.getCenterTileY = function() {
        return Math.floor(this.getCenterY() / tileSize);
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
        return this.x < -tileSize || this.x > 25 * tileSize;
    };

    /**
     * @return {Boolean} true if this unit is at its destination
     */
    window.game.Unit.prototype.isAtDestination = function() {
        return this.getCenterX() == this.destX && this.getCenterY() == this.destY;
    };

    /**
     * Go through each StatusEffect that is affecting this unit and sum the
     * amount to add/subtract for a given stat.
     * @param  {String} statType - the stat you're interested in
     * @return {Number}          total bonus/drain on that stat
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
        var atkBonus = this.getEffectStatModifiers('atk');
        return this.atk + atkBonus;
    };
    /**
     * Returns def stat with any status effects and items taken into account.
     */
    window.game.Unit.prototype.getDef = function() {
        var defBonus = this.getEffectStatModifiers('def');
        return this.def + defBonus;
    };
    /**
     * Returns max life stat with any status effects and items taken into
     * account.
     */
    window.game.Unit.prototype.getMaxLife = function() {
        var maxLifeBonus = this.getEffectStatModifiers('maxLife');
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
    };    

    /**
     * Draws this unit's life bar.
     * @param  {Object} ctx - the canvas context
     */
    window.game.Unit.prototype.drawLifeBar = function(ctx) {
        ctx.save();

        // Properties of the life bar rectangle
        var w = this.width;
        var h = 10;
        var x = this.x;
        var y = this.y + this.height - h;

        var percentLife = Math.min(1, Math.max(0, this.life / this.getMaxLife()));

        // Draw a rectangle as the background
        ctx.fillStyle = 'rgba(0, 0, 0, .75)';
        ctx.fillRect(x,y,w,h);

        // Draw a rectangle to show how much life you have
        ctx.fillStyle = 'rgba(200, 0, 0, .75)';
        ctx.fillRect(x,y,w * percentLife, h);

        // Draw a border
        ctx.strokeStyle = 'rgba(255, 0, 0, .75)';
        ctx.strokeRect(x,y,w, h);

        // Draw the percentage
        ctx.font = '12px Futura, Helvetica, sans-serif';
        var text = game.util.formatPercentString(percentLife, 0) + '%';
        var width = ctx.measureText(text).width;

        ctx.textBaseline = 'top';
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x + w / 2 - width / 2, y - 2);

        ctx.restore();
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
        if (game.InventoryUI.isUnitAUseTarget(this)) return true;

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
            objSheet.drawSprite(ctx, 19, this.getCenterX() - tileSize / 2, this.getCenterY() - tileSize / 2, !this.isPlayer());              
        } else {

            // Draw all status effects
            for (var i = 0; i < this.statusEffects.length; i++) {
                var effect = this.statusEffects[i];
                effect.draw(ctx);
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

                    charSheet.drawSprite(ctx, this.graphicIndexes[indexToUse], this.x + i * tileSize, this.y + j * tileSize, !this.isPlayer());

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
        if ( game.InventoryUI.isUnitAUseTarget(this) ) {

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

        // Draws a symbol above an NPC if it didn't give out a quest yet
        if ( this.playerFlags & game.PlayerFlags.NEUTRAL &&
             !this.gaveOutQuest) {
            var x = this.getCenterX();
            var y = this.y;

            // Size will be in the range [-3,3]. This will make the '!' grow and
            // shrink.
            var size = Math.ceil(Math.sin(game.alphaBlink * 4) * 3);
            game.TextManager.drawTextImmediate(ctx, '!', x, y, {fontSize:23 + size, color:'#ff0', baseline:'bottom'});
        }

    };

}());
