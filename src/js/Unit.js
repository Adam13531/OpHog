( function() {

    /**
     * Unit types. For now, these double as representing graphic indices too in
     * some cases.
     * @type {Number}
     */
    window.game.UnitType = {
        ARCHER: 0,
        WARRIOR: 1,
        WIZARD: 2,

        // This is here just so that we have some indicator that it's NOT an
        // archer/warrior/wizard
        DEBUG: 3,

        twoByOneUnit: 496,
        oneByTwoUnit: 497,
        twoByTwoUnit: 498
    };

    /**
     * See displayLifeBarForPlayer.
     * @type {Object}
     */
    window.game.DisplayLifeBarFor = {
        PLAYER:1,
        ENEMY:2,
        PLAYER_AND_ENEMY:3
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
     * Creates a unit (player OR enemy).
     * @param {UnitType}  unitType For now, this is the graphic index, or one of
     * the special values above.
     * @param {Boolean} isPlayer True if this is a player unit.
     * @param {Object} enemyData - the enemy data used to populate this unit.
     * This can be undefined.
     */
    window.game.Unit = function Unit(unitType, isPlayer, enemyData) {
        this.unitType = unitType;
        this.widthInTiles = 1;
        this.heightInTiles = 1;

        this.id = window.game.unitID++;
        this.hasBeenPlaced = false;

        /**
         * StatusEffects affecting this unit.
         * @type {Array:StatusEffect}
         */
        this.statusEffects = [];

        this.level = 1;
        this.experience = 0;
        this.maxLife = 100;
        this.atk = 30;
        this.def = 0;

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
        this.graphicIndexes = new Array();

        if (unitType == game.UnitType.twoByOneUnit) {
            this.width = tileSize * 2;
            this.graphicIndexes.push(240);
            this.graphicIndexes.push(241);
            this.widthInTiles = 2;
        } else if (unitType == game.UnitType.oneByTwoUnit) {
            this.height = tileSize * 2;
            this.graphicIndexes.push(421);
            this.graphicIndexes.push(437);
            this.heightInTiles = 2;
        } else if (unitType == game.UnitType.twoByTwoUnit) {
            this.width = tileSize * 2;
            this.height = tileSize * 2;
            this.graphicIndexes.push(302);
            this.graphicIndexes.push(303);
            this.graphicIndexes.push(318);
            this.graphicIndexes.push(319);
            this.widthInTiles = 2;
            this.heightInTiles = 2;
        } else {
            // For 1x1 units, make them look like what you spawned.
            var graphicIndex;

            switch( this.unitType ) {
                case game.PlaceableUnitType.ARCHER:
                    graphicIndex = 0;
                    break;
                case game.PlaceableUnitType.WARRIOR:
                    graphicIndex = 1;
                    break;
                case game.PlaceableUnitType.WIZARD:
                    graphicIndex = 2;
                    break;
                default:
                    graphicIndex = Math.floor(Math.random()*220);
                    break;
            }

            this.graphicIndexes.push(graphicIndex);
        }

        // If enemyData was passed in, then we basically ignore a lot of the
        // properties that were set earlier and set "correct" ones here.
        if ( enemyData !== undefined && enemyData != null ) {
            this.unitType = enemyData.id;
            this.widthInTiles = enemyData.width;
            this.heightInTiles = enemyData.height;
            this.graphicIndexes = enemyData.graphicIndexes;

            this.level = enemyData.level;
            this.maxLife = enemyData.finalLife;
            this.atk = enemyData.finalAtk;
            this.def = enemyData.finalDef;

            this.chanceToDropItem = enemyData.chanceToDropItem;
            this.itemsDropped = enemyData.itemsDropped;
        }

        this.restoreLife();

        this.width = tileSize * this.widthInTiles;
        this.height = tileSize * this.heightInTiles;

        this.areaInTiles = this.widthInTiles * this.heightInTiles;
        this.isPlayer = isPlayer;

        // As soon as this is true, the unit will be removed from the map. For
        // enemy units, this means they're removed from the game. For player
        // units, this means they will be "unplaced" (see unplaceUnit).
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

        /**
         * A reference to one of the current map's paths.
         * @type {Array:Tile}
         */
        this.whichPathToTake = null;

        /**
         * This represents which Tile we're on in the path.
         * @type {Number}
         */
        this.indexInPath = 0;
    };

    /**
     * Places a unit at the given tile locations
     * @param  {number} tileX tile as an X coordinate
     * @param  {number} tileY tile as a Y coordinate
     * @return {null}       
     */
    window.game.Unit.prototype.placeUnit = function(tileX, tileY) {
        var centerXPx = tileX * tileSize + tileSize / 2;
        var centerYPx = tileY * tileSize + tileSize / 2;
        this.setCenterX(centerXPx);
        this.setCenterY(centerYPx);
        this.restoreLife();
        this.movingToPreBattlePosition = false;
        this.hasBeenPlaced = true;

        // Make sure to remove our current path so that we find a new one
        this.whichPathToTake = null;
        this.acquireNewDestination();

        // Purge status effects
        this.statusEffects = [];

        if ( this.isPlayer ) {
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
        // now to create invalid enemies (i.e. those without enemyData passed
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
     * @return {null}
     */
    window.game.Unit.prototype.unplaceUnit = function() {
        if ( !this.isPlayer ) {
            console.log('Error: unplaceUnit was called on an enemy unit. ' +
                'Ignoring. ID: ' + this.id);
            return;
        }

        // Status effects are also purged when you place a unit, so it wouldn't
        // make sense for them to exist while the unit isn't placed (e.g. if we
        // ever show stats in the unit placement UI or something, we wouldn't
        // want buffs to be taken into account if they won't exist once the unit
        // is placed).
        this.statusEffects = [];
        this.hasBeenPlaced = false;
        this.removeFromMap = false;
        game.UnitPlacementUI.updateUnit(this);
    };

    /**
     * @return {Boolean} true if this unit can join a battle, which requires
     * that the unit has been placed and isn't already in a battle
     */
    window.game.Unit.prototype.canJoinABattle = function() {
        return this.hasBeenPlaced && !this.isInBattle();
    }

    /**
     * If a unit doesn't have a path, this will find one for the unit. If a unit
     * DOES have a path, then this will set its current destination to the next
     * tile in that path.
     * @return {null}
     */
    window.game.Unit.prototype.acquireNewDestination = function() {
        // All pathfinding is based on centers to account for non- 1x1 units
        var centerTileX = this.getCenterTileX();
        var centerTileY = this.getCenterTileY();

        if ( this.whichPathToTake == null ) {

            var pathAndIndex = currentMap.getPathStartingWith(centerTileX, centerTileY, this.isPlayer);
            if ( pathAndIndex == null ) {
                // Here's how I think this happened before, which might give
                // insight into how this could happen again if you see this: a
                // unit was moving diagonally, and in the process of moving to
                // the next tile, the coordinates that are used to say which
                // tiles it is on happened to line up with a non-walkable tile.
                console.log('Error: couldn\'t generate a path for unit #' + 
                    this.id + ' at coordinates (' + centerTileX + ', ' + 
                    centerTileY + ')');
            }
            this.whichPathToTake = pathAndIndex.path;
            this.indexInPath = pathAndIndex.indexInPath;
        }

        if ( this.indexInPath == this.whichPathToTake.length - 1) {
            // You're done with the path. For now, we'll make the units still
            // move off of the map so that they'll get destroyed, but
            // eventually, we'll remove this debug logic.
            this.destX += this.isPlayer ? tileSize : -tileSize;
        } else {
            this.indexInPath++;
            var nextTile = this.whichPathToTake[this.indexInPath];

            this.destX = nextTile.getPixelCenterX();
            this.destY = nextTile.getPixelCenterY();
        }
    }

    /**
     * Updates this unit, moving it, making it execute its battle turn, etc.
     * @param  {Number} delta - time in ms since this function was last called
     * @return {null}
     */
    window.game.Unit.prototype.update = function(delta) {
        // We only update if the unit was placed
        if ( !this.hasBeenPlaced ) return;

        var deltaAsSec = delta / 1000;
        // var speed = Math.random()*120 + 500;
        var speed = 60;
        var change = speed * deltaAsSec;
        var centerX = this.getCenterX();
        var centerY = this.getCenterY();
        if (!this.isInBattle()) {
            if ( this.movingToPreBattlePosition ) {
                var desiredX = this.preBattleX;
                var desiredY = this.preBattleY;

                var newCoords = game.util.chaseCoordinates(this.x, this.y, desiredX, desiredY, change, true);
                this.x = newCoords.x;
                this.y = newCoords.y;

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
                if ( this.isPlayer ) {
                    var centerTileX = this.getCenterTileX();
                    var centerTileY = this.getCenterTileY();
                    // game.GeneratorManager.removeGeneratorsAtLocation(centerTileX, centerTileY);
                     
                    game.CollectibleManager.collectAtLocation(this, centerTileX, centerTileY);
                }
            }

            // This is the number of pixels a unit has to move off the map
            // before it's considered to be out of bounds. This is PURELY for
            // debugging. Units will eventually never be able to move off of the
            // map (because they will attack the castle when they get to the
            // boundary), but for now, it happens a lot and there's no way to
            // use or kill the unit.
            var outOfBounds = 20 * tileSize;
            if ( this.x < -outOfBounds || this.x > currentMap.numCols * tileSize + outOfBounds ) {
                this.removeFromMap = true;
            }

        } else {
            this.updateBattle(delta);
        }

        // Clear some fog every loop, even if we're in battle.
        if ( this.isPlayer ) {
            currentMap.setFog(this.getTileX(), this.getTileY(), 3, false, true);
        }

        this.updateStatusEffects(delta);
    };

    /**
     * Updates any status effects, removing the ones that are finished.
     * @param  {Number} delta - time in ms since this function was last called
     * @return {null}
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
     * @return {null}
     */
    window.game.Unit.prototype.takeBattleTurn = function() {
        // Short hand
        var battle = this.battleData.battle;


        // Revive
        if ( (this.id % 15) == 0 ) {
            // There needs to be a dead unit for this to work.
            var flags = game.RandomUnitFlags.DEAD;
            if ( this.isPlayer ) {
                flags |= game.RandomUnitFlags.PLAYER_UNIT;
            } else {
                flags |= game.RandomUnitFlags.ENEMY_UNIT;
            }

            var targetUnit = battle.getRandomUnit(flags);
            if ( targetUnit != null ) {
                var newProjectile = new game.Projectile(this.getCenterX(), this.getCenterY(),1,this,targetUnit);
                battle.addProjectile(newProjectile);
                return;
            }
        }

        // Summon
        if ( !this.isPlayer && (this.id % 16) == 0 ) {
            // Create it at the previous tile in this unit's path, that way it's
            // guaranteed to be walkable, because originalX and originalY may
            // not be walkable if the unit was traveling diagonally.
            var previousTile = this.whichPathToTake[this.indexInPath];
            if ( this.indexInPath > 0 ) {
                previousTile = this.whichPathToTake[this.indexInPath - 1];
            }

            var newUnit = new game.Unit(game.UnitType.DEBUG,this.isPlayer);
            newUnit.placeUnit(previousTile.x, previousTile.y);

            // Make the unit look like a dragon whelp
            newUnit.graphicIndexes = [224 + Math.floor(Math.random() * 5)];
            game.UnitManager.addUnit(newUnit);

            // Force the unit to join this battle. We pass coordinates so that
            // the unit can go back to the walkable tile that we assigned
            // earlier, otherwise it would go to the summoner's origin, which
            // may be further in the path than "previousTile".
            battle.summonedUnit(this, newUnit, previousTile.x * tileSize, previousTile.y * tileSize);

            return;
        }

        // First, acquire a living target of the opposite team
        var flags = game.RandomUnitFlags.ALIVE;
        if ( this.isPlayer ) {
            flags |= game.RandomUnitFlags.ENEMY_UNIT;
        } else {
            flags |= game.RandomUnitFlags.PLAYER_UNIT;
        }

        var targetUnit = battle.getRandomUnit(flags);

        var newProjectile = new game.Projectile(this.getCenterX(), this.getCenterY(),0,this,targetUnit);
        battle.addProjectile(newProjectile);
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

            // Apply the damage
            targetUnit.modifyLife(-damage, true, false);
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
     * @return {null}
     */
    window.game.Unit.prototype.modifyLife = function(amount, spawnTextEffect, letLifeGoAboveMax) {
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
            var fontColor = amount >= 0 ? '#0f0' : '#f00';
            var textObj = new game.TextObj(this.getCenterX(), this.y, lifeChangeString, false, fontColor);
            game.TextManager.addTextObj(textObj);
        }

        // Check to see if we killed the unit
        if ( !this.isLiving() ) {
            // Wipe out any status effects so that we don't do something stupid
            // like regen ourselves back to life
            this.statusEffects = [];
            if ( this.battleData != null ) {
                this.battleData.battle.unitDied(this);
            } else {
                this.removeFromMap = true;
            }
        }
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

    window.game.Unit.prototype.getTileX = function() {
        return Math.floor(this.x / tileSize);
    };

    window.game.Unit.prototype.getTileY = function() {
        return Math.floor(this.y / tileSize);
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
     * @return {null}
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
     * @return {null}
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
     * @return {null}
     */
    window.game.Unit.prototype.drawLifeBar = function(ctx) {
        ctx.save();
        var alpha = .75;

        // Properties of the life bar rectangle
        var w = this.width;
        var h = 10;
        var x = this.x;
        var y = this.y + this.height - h;

        var percentLife = Math.min(1, Math.max(0, this.life / this.getMaxLife()));

        // Draw a rectangle as the background
        ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
        ctx.fillRect(x,y,w,h);

        // Draw a rectangle to show how much life you have
        ctx.fillStyle = 'rgba(200, 0, 0, ' + alpha + ')';
        ctx.fillRect(x,y,w * percentLife, h);

        // Draw a border
        ctx.strokeStyle = 'rgba(255, 0, 0, ' + alpha + ')';
        ctx.strokeRect(x,y,w, h);

        // Draw the percentage
        ctx.font = '12px Futura, Helvetica, sans-serif';
        var text = '' + Math.ceil(percentLife * 100) + '%';
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
        // If you pressed a key
        if ( game.keyPressedToDisplayLifeBars ) return true;

        // If you're displaying life bars for players and this is a player unit
        if ( (game.displayLifeBarForPlayer & game.DisplayLifeBarFor.PLAYER) && this.isPlayer ) return true;

        // If you're displaying life bars for enemies and this is an enemy unit
        if ( (game.displayLifeBarForPlayer & game.DisplayLifeBarFor.ENEMY) && !this.isPlayer ) return true;

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
            objSheet.drawSprite(ctx, 19, this.getCenterX() - tileSize / 2, this.getCenterY() - tileSize / 2, !this.isPlayer);              
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
                    if ( !this.isPlayer && this.widthInTiles == 2 ) {
                        // Swap 0 and 1
                        if ( index == 0 ) indexToUse = 1;
                        if ( index == 1 ) indexToUse = 0;

                        // Swap 2 and 3
                        if ( index == 2 ) indexToUse = 3;
                        if ( index == 3 ) indexToUse = 2;
                    }

                    charSheet.drawSprite(ctx, this.graphicIndexes[indexToUse], this.x + i * tileSize, this.y + j * tileSize, !this.isPlayer);

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
        
    };

}());
