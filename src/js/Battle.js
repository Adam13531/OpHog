( function() {

    /**
     * When obtaining a random unit, you pass a combination of these flags.
     *
     * For example, if you only want living player units, pass
     * RandomUnitFlags.PLAYER_UNIT | RandomUnitFlags.ALIVE.
     */
    window.game.RandomUnitFlags = {
        PLAYER_UNIT: 1,
        ENEMY_UNIT: 2,
        ALIVE: 4,
        DEAD: 8
    };

    /**
     * This is used to indicate who won the battle. It's pretty straightforward.
     * @type {Number}
     */
    window.game.BattleWinner = {
        NONE: 0,
        PLAYER: 1,
        ENEMY: 2
    };

    window.game.Battle = function Battle(centerX, centerY) {
        // This contains all units battling here.
        this.units = new Array();

        // Keep track of playerUnits and enemies individually too
        this.playerUnits = new Array();
        this.enemyUnits = new Array();

        this.projectiles = new Array();

        // This marks the center of the battle (in pixels).
        this.centerX = centerX;
        this.centerY = centerY;

        // There are two "join circles" - one centered on the player's units,
        // and one around the enemies. A unit touching *either* of these circles
        // will join the battle.
        //
        // If either of these circles touches either of another battle's
        // circles, then the battles will be combined.
        //
        //
        // Coordinate units are in pixels.
        this.playerCenterX = centerX;
        this.playerCenterY = centerY;
        this.playerJoinRadius = tileSize * 1.5;

        this.enemyCenterX = centerX;
        this.enemyCenterY = centerY;
        this.enemyJoinRadius = tileSize * 1.5;

        // When we add a unit, we set this to true. We don't reposition units
        // immediately because it's "costly" for large battles (shouldn't be too
        // intense on CPU, but there's no need to keep recomputing it if too
        // many units join a battle in a single game loop).
        this.needsToBeRepositioned = false;

        // When this isn't NONE, the battle is over.
        this.battleWinner = game.BattleWinner.NONE;

        // These are used for drawing the battle grid. They are otherwise
        // unnecessary.
        this.debugPlayerX = 0;
        this.debugPlayerY = 0;
        this.debugPlayerW = 0;
        this.debugPlayerH = 0;
    };

    window.game.Battle.prototype.collidesWith = function(battle) {
        // Two battles collide if their player or enemy circle collides with the
        // player or enemy circle of the other or if the centers of the battles
        // themselves are really close.
        
        // Player circle of this battle
        var px1 = this.playerCenterX;
        var py1 = this.playerCenterY;
        var pr1 = this.playerJoinRadius;

        // Enemy circle of this battle
        var ex1 = this.enemyCenterX;
        var ey1 = this.enemyCenterY;
        var er1 = this.enemyJoinRadius;

        // Player circle of other battle
        var px2 = battle.playerCenterX;
        var py2 = battle.playerCenterY;
        var pr2 = battle.playerJoinRadius;

        // Enemy circle of other battle
        var ex2 = battle.enemyCenterX;
        var ey2 = battle.enemyCenterY;
        var er2 = battle.enemyJoinRadius;

        // The "false ||" is just being used as a line-continuation operator.
        return false || 
            // The centers of the battles are really close
            window.game.util.distance(this.centerX, this.centerY, battle.centerX, battle.centerY) < tileSize * 2 || 

            // This player circle with other player circle
            window.game.util.circlesCollide(px1, py1, pr1, px2, py2, pr2) ||

            // This player circle with other enemy circle
            window.game.util.circlesCollide(px1, py1, pr1, ex2, ey2, er2) ||

            // This enemy circle with other player circle
            window.game.util.circlesCollide(ex1, ey1, er1, px2, py2, pr2) ||

            // This enemy circle with other enemy circle
            window.game.util.circlesCollide(ex1, ey1, er1, ex2, ey2, er2);
    };

    /**
     * Combines this battle with the battle passed in.
     *
     * This is done when battles are too close to each other. It wouldn't
     * make sense to have overlapping battles.
     * @param  {Battle} battleToAbsorb The battle to be absorbed into this battle.
     *                                 It should be deleted after this function is called.
     * @return {null}
     */
    window.game.Battle.prototype.combineWith = function(battleToAbsorb) {
        for (var i = 0; i < battleToAbsorb.units.length; i++) {
            var unitToAbsorb = battleToAbsorb.units[i];
            this.addUnit(unitToAbsorb);
        };
    };

    window.game.Battle.prototype.addProjectile = function(projectile) {
        this.projectiles.push(projectile);
    };

    /**
     * Adds a unit to this battle if the unit is close enough.
     * @param {Unit} unit The unit to potentially add to the battle.
     */
    window.game.Battle.prototype.addUnitIfCloseEnough = function(unit) {
        // Check against the player circle
        var distToPlayerCircle = window.game.util.distance(this.playerCenterX, this.playerCenterY, unit.getCenterX(), unit.getCenterY());

        if (distToPlayerCircle <= this.playerJoinRadius) {
            this.addUnit(unit);
            return true;
        }

        // Check against the enemy circle
        var distToEnemyCircle = window.game.util.distance(this.enemyCenterX, this.enemyCenterY, unit.getCenterX(), unit.getCenterY());

        if (distToEnemyCircle <= this.enemyJoinRadius) {
            this.addUnit(unit);
            return true;
        }

        // Neither collided, so we don't add this unit.
        return false;
    };

    /**
     * Gets a random unit from either the player's team or the enemy's team.
     * @param {RandomUnitFlags} flags A bitwise-or'd set of flags representing
     *                                the units you're interested in choosing from.
     * @return {Unit}              A random unit matching the flags.
     *                               WARNING: THIS CAN ALSO RETURN NULL IF THERE
     *                               IS NO SUCH UNIT (e.g. no living enemies).
     */
    window.game.Battle.prototype.getRandomUnit = function(flags) {
        var unitsToChooseFrom = new Array();

        if (flags & game.RandomUnitFlags.PLAYER_UNIT) {
            unitsToChooseFrom = unitsToChooseFrom.concat(this.playerUnits);
        }

        if (flags & game.RandomUnitFlags.ENEMY_UNIT) {
            unitsToChooseFrom = unitsToChooseFrom.concat(this.enemyUnits);
        }

        var allowLivingUnits = ((flags & game.RandomUnitFlags.ALIVE) != 0);
        var allowDeadUnits = ((flags & game.RandomUnitFlags.DEAD) != 0);

        // Cut the units down to only living or dead as requested.
        for (var i = 0; i < unitsToChooseFrom.length; i++) {
            var isAlive = unitsToChooseFrom[i].isLiving();
            if ( (!allowLivingUnits && isAlive) || (!allowDeadUnits && !isAlive) ) {
                unitsToChooseFrom.splice(i, 1);
                i--;
            }
        };

        return window.game.util.randomArrayElement(unitsToChooseFrom);
    };

    /**
     * Get the number of living units on a team.
     * @param  {Boolean} isPlayerTeam True if you want living units from the
     *                                player's team.
     * @return {Number}               Number of living units.
     */
    window.game.Battle.prototype.getNumLivingUnits = function(isPlayerTeam) {
        var units = isPlayerTeam ? this.playerUnits : this.enemyUnits;

        var count = 0;
        for (var i = units.length - 1; i >= 0; i--) {
            if ( units[i].isLiving() ) {
                count++;
            }
        };

        return count;
    };

    /**
     * This function should be called when a unit dies in battle. It checks
     * to see if the battle is over.
     *
     * This function doesn't account for what would happen if units from both
     * teams died in a single turn (picture a self-destruct kind of move).
     * 
     * @param  {Unit} deadUnit The unit that just died.
     * @return {null}
     */
    window.game.Battle.prototype.unitDied = function(deadUnit) {
        var numLivingUnits = this.getNumLivingUnits(deadUnit.isPlayer);

        if ( numLivingUnits == 0 ) {
            // The battle is over
            this.battleWinner = deadUnit.isPlayer ? game.BattleWinner.ENEMY : game.BattleWinner.PLAYER;
        }

    };

    /**
     * Returns true if the battle is dead. A battle is dead when one team is
     * entirely dead.
     */
    window.game.Battle.prototype.isDead = function() {
        return this.battleWinner != game.BattleWinner.NONE;
    };

    /**
     * This is called by the BattleManager RIGHT before the battle is removed
     * from existence. It will remove units from battle and guide them to their
     * original positions.
     */
    window.game.Battle.prototype.aboutToRemoveBattle = function() {
        var battleData;
        var unit;

        // If the player won, then we should add experience.
        if ( this.battleWinner == game.BattleWinner.PLAYER ) {
            // Hard-code this for now
            var experienceGranted = 50;
            var expString = "+" + experienceGranted + " exp";

            // Spawn a text object where the enemies used to be
            var textObj = new game.TextObj(this.enemyCenterX, this.enemyCenterY, expString, true);
            game.TextManager.addTextObj(textObj);

            // Give the experience to all living player units
            for (var i = 0; i < this.units.length; i++) {
                var unit = this.units[i];

                // Ignore enemy and dead units
                if ( !unit.isPlayer || !unit.isLiving() ) continue;

                // This will also level up the unit if appropriate
                unit.gainExperience(experienceGranted);

                // Update the unit placement UI
                game.UnitPlacementUI.updateUnit(unit);
            };

            // Give them a random item for every battle won.
            game.Inventory.addItem(new game.Item(Math.floor(Math.random() * 7)));
        }

        for (var i = 0; i < this.units.length; i++) {
            unit = this.units[i];
            battleData = unit.battleData;

            // If the unit dies in battle, it dies in real life
            if (!unit.isLiving()) {
                unit.removeFromMap = true;
            }

            // Restore their original positions
            unit.movingToPreBattlePosition = true;
            unit.preBattleX = battleData.originalX;
            unit.preBattleY = battleData.originalY;

            // Remove it from battle
            unit.battleData = null;
        };

        // Wipe out the projectiles now that their targets will be removed
        this.projectiles = [];
    };

    /**
     * When you summon a unit in battle, you should call this function. It will
     * add the summoned unit to battle immediately (that way it's guaranteed to
     * be part of the same battle as the summoner), and it'll make sure that the
     * summoned unit has appropriate coordinates to go back to when the battle
     * is over.
     * @param  {Unit} summoner     - the unit doing the summoning
     * @param  {Unit} summonedUnit - the unit being summoned
     * @return {null}
     */
    window.game.Battle.prototype.summonedUnit = function(summoner, summonedUnit) {
        this.addUnit(summonedUnit);

        summonedUnit.battleData.originalX = summoner.battleData.originalX;
        summonedUnit.battleData.originalY = summoner.battleData.originalY;
    },

    /**
     * Adds a unit to the battle.
     * @param {Unit} unit Player or enemy unit.
     */
    window.game.Battle.prototype.addUnit = function(unit) {
        this.units.push(unit);

        if ( unit.isPlayer ) {
            this.playerUnits.push(unit);
        } else {
            this.enemyUnits.push(unit);
        }

        var numPlayers = this.playerUnits.length;
        var numEnemies = this.enemyUnits.length;

        // Figure out the order in which this player entered the battle
        var absoluteOrder = this.units.length - 1;
        var teamOrder = numEnemies - 1;
        if (unit.isPlayer) {
            teamOrder = numPlayers - 1;
        }

        var originalX = unit.x;
        var originalY = unit.y;

        // If the unit was already in a battle, then we need to pull some data
        // from battleData. This takes place in this function so that everything
        // is in a single place; I could've done this in combineWith.
        if ( unit.isInBattle() ) {
            originalX = unit.battleData.originalX;
            originalY = unit.battleData.originalY;
        }

        // Not all of this data will be relevant, but I'm leaving it in for now.
        // When this becomes production code, it should be removed until we
        // figure out that it's needed.
        unit.battleData = {
            // Associate that unit to this battle
            battle: this,

            // Cooldown until this unit is ready to attack
            cooldown: 100,

            // The X and Y coordinates where this unit wants to move to.
            // These will be set when the unit is repositioned.
            desiredX: unit.x,
            desiredY: unit.y,

            // The order in which they joined their team
            teamOrder: teamOrder,

            // The order in which they joined the whole battle
            absoluteOrder: absoluteOrder,

            // These are the X and Y coordinates that the unit should return to
            // if he's alive when the battle ends. These coordinates should
            // always refer to a path so that the unit knows where to move when
            // it's done with battle.
            originalX: originalX,
            originalY: originalY
        };

        // If the unit was already moving back to their original position from a
        // previous battle, then we shouldn't lose what that old position was.
        if ( unit.movingToPreBattlePosition ) {
            unit.movingToPreBattlePosition = false;
            unit.battleData.originalX = unit.preBattleX;
            unit.battleData.originalY = unit.preBattleY;
        }

        this.needsToBeRepositioned = true;
    };

    /**
     * We position units based on 2-dimensional coordinates. However, the array
     * of booleans that keeps track of which tiles are filled is 1-dimensional.
     * This function converts from 2D coords to 1D.
     * 
     * For example, if you're placing a 2x2 unit at position (1,1) in a 3x3
     * staging area, you would call this with (1,1,2,2,3):
     *   x: 0  1  2
     *y:  
     * 0   [0][1][2]
     * 1   [3][4][5]
     * 2   [6][7][8]
     *
     * The coordinates it would take up are [4,5,7,8], which is what is
     * returned.
     * 
     * @param  {number} x          x-coordinate of the unit
     * @param  {number} y          y-coordinate of the unit
     * @param  {number} w          width of the unit
     * @param  {number} h          height of the unit
     * @param  {number} arrayWidth width of the staging area
     * @return {Array}            Array of coordinates in 1D space.
     */
    window.game.Battle.prototype.translateCoordinatesToArray = function(x, y, w, h, arrayWidth) {
        var translatedCoordinates = new Array();

        for (var j = 0; j < h; j++) {
            for (var i = 0; i < w; i++) {
                translatedCoordinates.push((y+j) * arrayWidth + x + i);
            };
        };

        return translatedCoordinates;
    };

    /**
     * Semantically, this function is used to see if a unit will fit in the
     * staging area given its 1D coordinates.
     * @param  {Array} translatedCoordinates coordinates in 1D space
     * @param  {Array} stagingArea           array of booleans representing
     *                                       which spaces are filled.
     * @return {boolean}                     true if the unit will fit.
     */
    window.game.Battle.prototype.willFit = function(translatedCoordinates, stagingArea) {
        for (var i = 0; i < translatedCoordinates.length; i++) {
            if ( stagingArea[translatedCoordinates[i]] ) {
                return false;
            }
        };
        
        return true;
    };

    /**
     * This repositions all of the units in a battle by following this
     * algorithm (note: the algorithm is from the player's point of view, so
     * the units are all facing right in this algorithm):
     *
     * 1. Calculate the total area needed by the player's units.
     * 2. Round that number up to the nearest perfect square to get the best
     *     vertical alignment with the other team.
     * 3. Add some more valid columns onto the left side for overflow for
     *     when our algorithm can't optimally place a unit.
     * 4. Go through each unit in order of descending area:
     *     a. Place it as far to the right as possible while attempting to
     *         center it vertically.
     *     b. If it won't fit, nudge it down.
     *     c. If it's been nudged down all the way, wrap it around to the top.
     *     d. If it's wrapped all the way back to its starting Y coord,
     *         push it to the left and repeat from step 'b'.
     *
     * @param {boolean} isPlayer Pass true to reposition the player's units,
     *                           false to reposition the enemy's.
     * @return {null}
     */
    window.game.Battle.prototype.repositionUnits = function(isPlayer) {
        var unitsToPosition;

        // The difference in X when you can't fit in the column
        var deltaX;
        if ( isPlayer ) {
            unitsToPosition = this.playerUnits;
            deltaX = -1;
        } else {
            unitsToPosition = this.enemyUnits;
            deltaX = 1;
        }

        // Calculate the total area needed in tiles
        var areaNeeded = 0;
        for (var i = unitsToPosition.length - 1; i >= 0; i--) {
            areaNeeded += unitsToPosition[i].areaInTiles;
        };

        // The height of the staging area
        var height;

        // Round up to the nearest perfect square
        for (height = 1; ; height++) {
            var square = height * height;
            if (areaNeeded <= square) {
                areaNeeded = square;
                break;
            }
        };

        // Add a few columns on the left side. Dynamically changing this value
        // won't be easy/cheap, so make sure this is big enough now. We do this
        // because we may need to nudge units to the left even though there are
        // still open tiles. This happens when a unit's shape prevents it from
        // fitting in those open tiles (e.g. a 2x1 unit can't fit in two non-
        // adjacent open tiles).
        //
        // Making this number too small will cause weird positioning in battle
        // since the staging area won't have enough indices.
        //
        // Making this number too big will avoid any problems with positioning,
        // but it will consume more memory.
        //
        // I haven't mathematically proven it, but I think (largest_width * 2)
        // is good enough.
        var width = height + (game.LARGEST_UNIT_WIDTH * 2);

        // Recompute the area
        areaNeeded = width * height;

        // Set up the staging area to be totally empty
        var stagingArea = new Array();
        for (var i = 0; i < areaNeeded; i++) {
            stagingArea.push(false);
        };

        // Sort units by area (biggest will be at the beginning)
        unitsToPosition.sort(function(unit1, unit2) {

            // If they're exactly the same size, then we sort based on order so
            // that they'll get the same locations more or less.
            if ( unit1.widthInTiles == unit2.widthInTiles && unit1.heightInTiles == unit2.heightInTiles ) {
                // Sort increasing, not decreasing, because new units get a
                // higher number.
                return unit1.battleData.absoluteOrder - unit2.battleData.absoluteOrder;
            }

            // 1x2 and 2x1 units will be sorted so that 2x1 come first.
            if ( unit2.areaInTiles == unit1.areaInTiles ) {
                return unit2.widthInTiles - unit1.widthInTiles;
            }

            return unit2.areaInTiles - unit1.areaInTiles;
        });

        var stagingAreaCenterX;
        var stagingAreaCenterY = this.centerY - (height / 2 * tileSize);

        // Base the battle-join radius on the size of the perfect square.
        var radius = (height / 2) * tileSize;

        if ( isPlayer ) {
            stagingAreaCenterX = this.centerX - (width * tileSize);
            this.playerCenterX = this.centerX - (height / 2) * tileSize;
            this.playerCenterY = this.centerY;
            this.playerJoinRadius = radius;
        } else {
            stagingAreaCenterX = this.centerX + 1 * tileSize;
            this.enemyCenterX = this.centerX + (height / 2) * tileSize + tileSize;
            this.enemyCenterY = this.centerY;
            this.enemyJoinRadius = radius;
        }

        // Go through in order of largest units and place that unit as far to
        // the right as possible while attempting to center it vertically
        for (var i = 0; i < unitsToPosition.length; i++) {
            var unit = unitsToPosition[i];
            var unitWidth = unit.widthInTiles;
            var unitHeight = unit.heightInTiles;

            // Start vertically in the middle. We keep track of our first
            // attempted Y coordinate so that we know when we've wrapped around
            // back to that coordinate.
            var firstAttemptY = Math.floor(height / 2);

            // If the height is even, then we subtract one. This is so that a
            // 2x2 unit can fit properly in a 2x2 grid.
            if ( firstAttemptY == height / 2 ) {
                firstAttemptY--;
            }
            var attemptY = firstAttemptY;

            var attemptX;
            if ( isPlayer ) {
                attemptX = width - unitWidth;
            } else {
                attemptX = 0;
            }
            var wrappedThisColumnAlready = false;

            // Start as far right as possible
            while (true) {
                var translatedCoordinates = this.translateCoordinatesToArray(attemptX, attemptY, unitWidth, unitHeight, width);
                if ( this.willFit(translatedCoordinates, stagingArea) ) {
                    for (var markCoord = 0; markCoord < translatedCoordinates.length; markCoord++) {
                        stagingArea[translatedCoordinates[markCoord]] = true;
                    }
                    break;
                }

                // Nudge down
                attemptY += 1;

                // We've looped all the way around, so nudge to the left.
                if ( attemptY >= firstAttemptY && wrappedThisColumnAlready ) {
                    attemptX += deltaX;
                    wrappedThisColumnAlready = 0;
                    attemptY = firstAttemptY;
                    continue;
                }

                // Check to see if we have to wrap back to the top
                if ( attemptY + unitHeight > height )
                {
                    attemptY = 0;
                    wrappedThisColumnAlready = true;
                }
            };

            var desiredX = attemptX * tileSize + stagingAreaCenterX;
            var desiredY = attemptY * tileSize + stagingAreaCenterY;

            // desiredBattleTile coordinates are based on the staging rect
            // that's set up. (0,0) is the upper-left-most tile in a battle, but
            // that doesn't mean you're at world coordinates (0,0).
            unit.battleData.desiredBattleTileX = attemptX;
            unit.battleData.desiredBattleTileY = attemptY;
            unit.battleData.desiredX = desiredX;
            unit.battleData.desiredY = desiredY;
        };

        if ( isPlayer ) {
            this.debugPlayerX = stagingAreaCenterX;
            this.debugPlayerY = stagingAreaCenterY;
            this.debugPlayerW = width * tileSize;
            this.debugPlayerH = height * tileSize;
        }
    };

    window.game.Battle.prototype.debugDrawBattleBackground = function(ctx) {
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(this.debugPlayerX, this.debugPlayerY, this.debugPlayerW, this.debugPlayerH);
        var width = this.debugPlayerW / tileSize;
        var height = this.debugPlayerH / tileSize;
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                ctx.strokeRect(this.debugPlayerX + i * tileSize, this.debugPlayerY + j * tileSize, tileSize, tileSize);
            };
        };


        ctx.beginPath();
        ctx.arc(this.playerCenterX, this.playerCenterY, this.playerJoinRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#00ff00';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.enemyCenterX, this.enemyCenterY, this.enemyJoinRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();

    };

    window.game.Battle.prototype.update = function(delta) {
        var deltaAsSec = delta / 1000;
        var speed = Math.random()*120 + 100;
        var change = speed * deltaAsSec;


        if ( this.needsToBeRepositioned ) {
            this.needsToBeRepositioned = false;
            this.repositionUnits(true);
            this.repositionUnits(false);
        }

        // Update projectiles
        for (var i = 0; i < this.projectiles.length; i++) {
            if ( !this.projectiles[i].isLiving() ) {
                this.projectiles.splice(i, 1);
                i--;
                continue;
            }

            this.projectiles[i].update(delta);
        };
    };

    window.game.Battle.prototype.draw = function(ctx) {
        for (var i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].draw(ctx);
        };
    };

}());