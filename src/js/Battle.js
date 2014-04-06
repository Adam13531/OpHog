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
     * This is used to indicate who won the battle. It's pretty straightforward.
     *
     * If both teams die, it counts as a win for the player.
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

        // This is set to true when the boss joins, and it stays true even if
        // the boss dies.
        this.containsBoss = false;

        // There are two "join circles" - one centered on the player's units,
        // and one around the enemies. A unit touching *either* of these circles
        // will join the battle.
        //
        // If either of these circles touches either of another battle's
        // circles, then the battles will be combined.
        //
        // These will get modified nearly immediately by layout(), so changing
        // them here will have no effect as long as this battle updates before
        // checkForBattles is called.
        //
        // Coordinate units are in pixels.
        this.playerCenterX = centerX;
        this.playerCenterY = centerY;
        this.playerJoinRadius = game.TILESIZE * 1.5;

        this.enemyCenterX = centerX;
        this.enemyCenterY = centerY;
        this.enemyJoinRadius = game.TILESIZE * 1.5;

        // When we add a unit, we set this to true. We don't reposition units
        // immediately because it's "costly" for large battles (shouldn't be too
        // intense on CPU, but there's no need to keep recomputing it if too
        // many units join a battle in a single game loop).
        this.unitLayoutInvalid = false;

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
            window.game.util.distance(this.centerX, this.centerY, battle.centerX, battle.centerY) < game.TILESIZE * 2 || 

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
        // Check against both the player and enemy circles
        var distToPlayerCircle = window.game.util.distance(this.playerCenterX, this.playerCenterY, unit.getCenterX(), unit.getCenterY());
        var distToEnemyCircle = window.game.util.distance(this.enemyCenterX, this.enemyCenterY, unit.getCenterX(), unit.getCenterY());

        if (distToPlayerCircle <= this.playerJoinRadius || distToEnemyCircle <= this.enemyJoinRadius) {
            this.addUnit(unit);
            return true;
        }

        // Neither collided, so we don't add this unit.
        return false;
    };

    /**
     * Gets a random unit from either the player's team or the enemy's team.
     * @param {game.Unit} attacker - the user of an ability where you need
     * targets
     * @param {RandomUnitFlags} flags A bitwise-or'd set of flags representing
     * the units you're interested in choosing from.
     * @return {Array:Unit} All units matching the flags (or an empty array if
     * there are none).
     */
    window.game.Battle.prototype.getUnitsMatchingFlags = function(attacker, flags) {
        var unitsToChooseFrom = new Array();
        var isPlayerUnit = attacker.isPlayer();

        // Easy case: targeting SELF, just return the unit passed in.
        if ( flags & game.RandomUnitFlags.SELF ) {
            unitsToChooseFrom.push(attacker);
            return unitsToChooseFrom;
        }

        if ( flags & game.RandomUnitFlags.ALLY ) {
            if ( isPlayerUnit ) {
                unitsToChooseFrom = unitsToChooseFrom.concat(this.playerUnits);
            } else {
                unitsToChooseFrom = unitsToChooseFrom.concat(this.enemyUnits);
            }
        }

        if ( flags & game.RandomUnitFlags.FOE ) {
            if ( isPlayerUnit ) {
                unitsToChooseFrom = unitsToChooseFrom.concat(this.enemyUnits);
            } else {
                unitsToChooseFrom = unitsToChooseFrom.concat(this.playerUnits);
            }
        }

        var allowLivingUnits = ((flags & game.RandomUnitFlags.ALIVE) != 0);
        var allowDeadUnits = ((flags & game.RandomUnitFlags.DEAD) != 0);
        var unitMustBeMissingLife = ((flags & game.RandomUnitFlags.IS_MISSING_LIFE) != 0);

        // Cut the units down to only living or dead as requested.
        for (var i = 0; i < unitsToChooseFrom.length; i++) {
            var unit = unitsToChooseFrom[i];
            var isAlive = unit.isLiving();
            if ( (!allowLivingUnits && isAlive) || (!allowDeadUnits && !isAlive) || (unitMustBeMissingLife && unit.life >= unit.getMaxLife()) ) {
                unitsToChooseFrom.splice(i, 1);
                i--;
            }
        };

        return unitsToChooseFrom;
    };

    /**
     * Gets a random unit that matches the flags passed in. See
     * getUnitsMatchingFlags.
     *
     * Note: this can also return null if there is no such unit (e.g. no
     * living enemies).
     */
    window.game.Battle.prototype.getRandomUnitMatchingFlags = function(attacker, flags) {
        var unitsToChooseFrom = this.getUnitsMatchingFlags(attacker, flags);

        return game.util.randomArrayElement(unitsToChooseFrom);
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
     * @param  {Unit} deadUnit The unit that just died.
     */
    window.game.Battle.prototype.unitDied = function(deadUnit) {
        var numLivingUnits = this.getNumLivingUnits(deadUnit.isPlayer());

        if ( numLivingUnits == 0 ) {
            // The battle is over
            this.battleWinner = deadUnit.isPlayer() ? game.BattleWinner.ENEMY : game.BattleWinner.PLAYER;
        }

        // If the enemy units are dead, then we count it as a win for the player
        // even if the player's units are dead. This way, you'll still get items
        // from the battle.
        if ( this.getNumLivingUnits(false) == 0 ) {
            this.battleWinner = game.BattleWinner.PLAYER;
        }

        var losingTeam = this.getLosingTeam();

        // Remove all status effects from the losing team so that they don't get
        // revived somehow.
        if ( losingTeam != null ) {
            for (var i = 0; i < losingTeam.length; i++) {
                losingTeam[i].removeStatusEffects();
            };
        }
    };

    /**
     * Returns true if the battle is dead. A battle is dead when at least one
     * team is entirely dead.
     */
    window.game.Battle.prototype.isDead = function() {
        return this.battleWinner != game.BattleWinner.NONE;
    };

    /**
     * @return {Boolean} true if the player won this battle. False if it isn't
     * over or if the enemy won.
     */
    window.game.Battle.prototype.playerWon = function() {
        return this.battleWinner == game.BattleWinner.PLAYER;
    };

    /**
     * Generates experience for this battle for the player.
     *
     * Here are some general scenarios we want to cover:
     *
     * YOUR TEAM               ENEMY TEAM                 EXP GIVEN
     * 5000                    1,1,1,1,1                      1
     * 5000,1                  100                          0,100 <-- it all goes to the level 1
     * 5000,1                  100                     1,0 if your lv. 1 dies (i.e. the lv. 1 is dead so it needs to go to the lv. 5000)
     * 100,100                 1                       1,0 or 0,1 (doesn't matter)
     * 
     * The algorithm works something like this:
     *
     * 1. Create buckets like "tiny exp", "little exp", "normal exp", "lots of
     * exp", "tons of exp". The lowest bucket is always only 1 exp, and the
     * highest is always 100 exp.
     *
     * 2. Make each bucket correspond to some percentage of the enemy's level.
     * E.g. the above 5 buckets could be [50%, 75%, 100%, 125%, 150%]. This
     * means that if you're level 100 and you're fighting a level 125 enemy, you
     * would get "lots of exp". If the enemy is only level 55, you'd get "tiny
     * exp" because that's closer to the 50% bucket.
     *
     * 3. Bucketize your units by considering each living player unit and each
     * enemy unit.
     *
     * 4. Only consider the highest bucket. That way, if you have a lv. 1 and a
     * lv. 500 vs. a lv. 250, that would correspond to "tons of exp" and "tiny
     * exp" respectively for your units. There's no reason the lv. 500 should
     * even get a point though, so we give it all to the lv. 1.
     *
     * 5. Give experience based on how many enemies there were.
     *
     * Special accommodations are made for low level units since percentages 
     * don't work too well at low levels.
     */
    window.game.Battle.prototype.generateExperience = function() {
        var logging = false;

        // Get all valid player units (living, not summons)
        var validPlayerUnits = [];
        for (var i = 0; i < this.playerUnits.length; i++) {
            var unit = this.playerUnits[i];

            // Ignore dead units
            if ( unit.isLiving() && !unit.isSummon() ) {
                validPlayerUnits.push(unit);
            };

        };

        /**
         * The bucketized units. The higher the index into this array, the more
         * experience you'll get.
         * @type {Array:(Array:Unit)}
         */
        var buckets = [];

        /**
         * The percent of the enemy's level that you would need to be in order
         * to be placed in the corresponding bucket.
         *
         * The percents should always go up since rewards go up as you go
         * further in the array.
         * @type {Array:Number}
         */
        var percentLevel = [];

        /**
         * The number of buckets. Most of this algorithm should work smoothly as
         * long as this number is at least 3.
         * @type {Number}
         */
        var numBuckets = 5;

        /**
         * The reward amount at each bucket level. The first element is always
         * 1, and the last is always 100.
         * @type {Array:Number}
         */
        var rewardLevel = [];

        var percentIncrement = 1 / (numBuckets - 1);

        // Initialize each array
        for (var i = 0; i < numBuckets; i++) {
            buckets.push([]);
            percentLevel.push(.5 + i * percentIncrement);
            rewardLevel.push(0);
        };

        // Each award will be cut in half at each bucket:
        // [100,50,25,13,7,4,2,1,1,1,1,...]
        var rewardAmount = 100;
        rewardLevel[rewardLevel.length - 1] = 100;
        for (var i = rewardLevel.length - 1; i >= 0; i--) {
            rewardLevel[i] = rewardAmount;
            rewardAmount = Math.ceil(rewardAmount / 2);
        };

        // Ensure that the last reward level is 1.
        rewardLevel[0] = 1;

        if ( logging ) {
            console.log('----------------------------');
            console.log('Enemy levels:');
            for (var i = 0; i < this.enemyUnits.length; i++) {
                console.log('\t' + this.enemyUnits[i].level);
            };
        }

        // Figure out the highest player level of the living units.
        var highestPlayerLevel = 0;
        for (var i = 0; i < validPlayerUnits.length; i++) {
            var playerUnit = validPlayerUnits[i];

            highestPlayerLevel = Math.max(playerUnit.level, highestPlayerLevel);
        };

        // If the highest level is relatively low, then we shift the percent
        // levels so that you don't end up getting 100 exp. when you're lv. 1
        // and fight a single lv. 2.
        if ( highestPlayerLevel < 5 ) {
            var percentIncrement = 5 / (numBuckets - 1);
            for (var i = 0; i < numBuckets; i++) {
                percentLevel[i] = .1 + i * percentIncrement;
            };

            // The lowest bucket always gives 1 exp., but by setting the level
            // difference to -1000%, it eliminates the chance of you getting to
            // the lowest bucket because an enemy's level would need to be
            // closer to -10 (or lower) than the next increment.
            percentLevel[0] = -10;
        } else if ( highestPlayerLevel < 10 ) {
            var percentIncrement = 1.5 / (numBuckets - 1);
            for (var i = 0; i < numBuckets; i++) {
                percentLevel[i] = .3 + i * percentIncrement;
            };
        }

        // Figure out which bucket we're going to retain (see algorithm in the
        // function-level comments - we only retain a single bucket).
        var highestBucketWithUnits = 0;
        for (var i = 0; i < validPlayerUnits.length; i++) {
            var playerUnit = validPlayerUnits[i];
            var playerLevel = playerUnit.level;

            // Keep track of the highest enemyBucketNumber that we find so that
            // we can later add this unit to that bucket. This means we'll get
            // experience as though we only fought the highest level enemies
            // from the group.
            var highestBucketIndexForThisUnit = 0;
            for (var j = 0; j < this.enemyUnits.length; j++) {
                var enemyUnit = this.enemyUnits[j];
                var enemyLevel = enemyUnit.level;

                var percent = enemyLevel / playerLevel;

                // Figure out the bucket number for this enemy.
                var enemyBucketNumber = 0;

                if ( percent <= percentLevel[0] ) {
                    enemyBucketNumber = 0;
                } else if ( percent >= percentLevel[numBuckets - 1] ) {
                    enemyBucketNumber = numBuckets - 1;
                } else {
                    // We're one of the middle buckets, so figure out which
                    // percent we're closest to. For example, if the splits are
                    // [50%,100%,150%,200%], then 111% would put us in bucket 1,
                    // not bucket 2.
                    var smallestDifference = 999999;
                    for (var k = 0; k < percentLevel.length; k++) {
                        var difference = Math.abs(percentLevel[k] - percent);

                        if ( difference < smallestDifference ) {
                            smallestDifference = difference;
                            enemyBucketNumber = k;
                        }
                    };
                }

                // Take the higher bucket number now.
                highestBucketIndexForThisUnit = Math.max(highestBucketIndexForThisUnit, enemyBucketNumber);
            };

            // Add the unit to the highest bucket we found
            buckets[highestBucketIndexForThisUnit].push(playerUnit);
            highestBucketWithUnits = Math.max(highestBucketIndexForThisUnit, highestBucketWithUnits);
        }

        if ( logging ) {
            for (var i = 0; i < buckets.length; i++) {
                var bucket = buckets[i];
                console.log('Bucket #' + i + ' contains ' + bucket.length + ' unit(s):');
                for (var j = 0; j < bucket.length; j++) {
                    console.log('\t' + bucket[j].level);
                };
            };
        }

        // Only give experience to the highest bucket that has units.
        var rewardBucket = buckets[highestBucketWithUnits];

        // Figure out the average player level in the reward bucket.
        var averagePlayerLevel;
        var sumPlayerLevel = 0;
        for (var i = 0; i < rewardBucket.length; i++) {
            sumPlayerLevel += rewardBucket[i].level;
        };

        averagePlayerLevel = sumPlayerLevel / rewardBucket.length;

        // We take the average of this percent level and the one below it to
        // accommodate what will happen if you're not strictly above the current
        // percent level. For example, if you're level 84 and you fought a level
        // 54, then the percent would be 64%. If the splits were
        // [50%,75%,100%,125%,150%], then you should be in bucket 1. The
        // percentAllowed will be 62.5% so that the level 54 is counted for more
        // than 1 exp.
        var lowerPercentLevel = percentLevel[Math.max(0, highestBucketWithUnits-1)];
        var percentAllowed = (lowerPercentLevel + percentLevel[highestBucketWithUnits]) / 2;

        // Figure out which enemy level that percentage corresponds to.
        var lowestEnemyLevelAllowed = averagePlayerLevel * percentAllowed;

        // Figure out how many enemies are above the lowest allowed level.
        var numEnemiesInRange = 0;
        for (var i = 0; i < this.enemyUnits.length; i++) {
            var enemyUnit = this.enemyUnits[i];
            var enemyLevel = enemyUnit.level;
            if ( enemyLevel >= lowestEnemyLevelAllowed ) {
                numEnemiesInRange++;
            }
        };

        // You can't get more than one level per unit.
        var maxExperience = 100 * rewardBucket.length;

        // Calculate the total experience.
        var totalExperience = 0;

        if ( highestBucketWithUnits == 0 ) {
            totalExperience = 1;
        } else if ( highestBucketWithUnits == numBuckets - 1) {
            totalExperience = maxExperience;
        } else {
            totalExperience = numEnemiesInRange * rewardLevel[highestBucketWithUnits];

            // Fudge it a bit so that you aren't always getting the same amount
            // of experience.
            var extraExp = Math.random() / 9 * totalExperience;
            totalExperience += Math.floor(extraExp);
        }

        // Make sure you're not above the maximum.
        totalExperience = Math.min(totalExperience, maxExperience);

        // Spawn a text object where the enemies used to be
        var expString = '+' + totalExperience + ' exp';
        var textObj = new game.TextObj(this.enemyCenterX, this.enemyCenterY, expString, true, '#0f0', true);
        game.TextManager.addTextObj(textObj);

        if ( logging ) {
            console.log('Your units gained ' + totalExperience + ' total:');
        }

        // Sort the reward bucket ascending so that the lower levels get
        // experience first.
        rewardBucket.sort(function(unit1, unit2) {
            return unit1.level - unit2.level;
        });

        // Finally, give the experience out.
        var expPerUnit = Math.ceil(totalExperience / rewardBucket.length);
        for (var i = 0; i < rewardBucket.length; i++) {
            var unit = rewardBucket[i];
            var expForThisUnit = Math.min(totalExperience, expPerUnit);
            totalExperience -= expForThisUnit;

            if ( logging ) {
                console.log('\tLv.' + unit.level + ' unit gained ' + expForThisUnit + ' exp');
            }

            // This will also level up the unit if appropriate
            unit.gainExperience(expForThisUnit);
        };
    };

    /**
     * Each enemy unit has a chance of dropping loot according to its loot
     * table.
     *
     * We keep track here of what was dropped by all of the different units so
     * that we can combine any stackable items. This way, the loot UI doesn't
     * show something like "Obtained 3 gems. Obtained 3 gems. Obtained 3 gems."
     * It will instead say "Obtained 9 gems.", even if 9 is greater than the
     * maximum stack size.
     *
     * This function also generates coins.
     * @return {undefined}
     */
    window.game.Battle.prototype.generateLoot = function() {
        /**
         * This array represents items that will be added to the inventory at
         * the end of this function. Any item that can be combined will be
         * combined into an item in this array.
         * @type {Array:Item}
         */
        var allDroppedItems = [];

        // For now, all enemies will always drop coins.
        var coinsGranted = 0;

        // Go through each unit and see if it will drop loot
        for (var i = 0; i < this.enemyUnits.length; i++) {
            coinsGranted += this.enemyUnits[i].getCoinsGranted();
            var itemsDroppedByThisUnit = this.enemyUnits[i].produceLoot();

            // Go through each item dropped by that unit and see if it's in
            // allDroppedItems. If it is and it can be combined, then combine
            // them.
            for (var j = 0; j < itemsDroppedByThisUnit.length; j++) {
                var combined = false;
                var itemJ = itemsDroppedByThisUnit[j];

                // Only check usable/stackable items.
                if ( itemJ.usable && itemJ.stackable ) {
                    for (var k = 0; k < allDroppedItems.length; k++) {
                        var itemK = allDroppedItems[k];
                        if ( itemJ.itemID == itemK.itemID ) {
                            itemK.quantity += itemJ.quantity;
                            combined = true;
                            break;
                        }
                    };
                }

                if ( !combined ) {
                    allDroppedItems.push(itemJ);
                }
            };
        };

        game.Player.modifyCoins(coinsGranted);

        var coinString = '+' + coinsGranted + ' coin' + (coinsGranted != 1 ? 's' : '');
        var textObj = new game.TextObj(this.enemyCenterX, this.enemyCenterY + 35, coinString, true, '#0f0', true);
        game.TextManager.addTextObj(textObj);

        // Add all of the items we just obtained.
        for (var i = 0; i < allDroppedItems.length; i++) {
            game.Player.inventory.addItem(allDroppedItems[i]);
        };
    };

    /**
     * @return {Array:Unit} the losing team's units, or null if the battle isn't
     * over.
     */
    window.game.Battle.prototype.getLosingTeam = function() {
        if ( this.battleWinner == game.BattleWinner.PLAYER ) {
            return this.enemyUnits;
        } else if ( this.battleWinner == game.BattleWinner.ENEMY ) {
            return this.playerUnits;
        }

        // The battle isn't over yet.
        return null;
    }
    
    /**
     * This is called by the BattleManager RIGHT before the battle is removed
     * from existence. It will remove units from battle and guide them to their
     * original positions.
     *
     * In the case that you won/lost the map, the battle winner may be NONE here
     * because the battle didn't get a chance to finish. That's fine.
     */
    window.game.Battle.prototype.aboutToRemoveBattle = function() {
        var battleData;
        var unit;

        // There isn't necessarily a losing team if the battle winner is NONE.
        // See the function-level comments.
        var losingTeam = this.getLosingTeam();

        if ( this.battleWinner == game.BattleWinner.PLAYER && 
             !(game.GameStateManager.isMinigameGameplay() || 
               game.GameStateManager.inOverworldMap()) ) {
            // Generate experience and items
            this.generateExperience();
            this.generateLoot();
        }

        for (var i = 0; i < this.units.length; i++) {
            unit = this.units[i];
            battleData = unit.battleData;

            // Remove any dead units from the map.
            if (!unit.isLiving()) {
                unit.removeUnitFromMap();
            }

            // Remove the entire losing team from the map. You may think we just
            // did this above by removing all of the dead units, but there's a
            // very rare bug that I've never actually hit (and will fix where I
            // can, but maybe that's not everywhere). Imagine this situation:
            // 
            // 1. Player vs. ENEMY A and ENEMY B
            // 2. Enemy A dies.
            // 3. Player shoots a projectile (call it Projectile 0 since it comes first) at enemy B.
            // 4. Enemy B casts revive on A. Revive is a projectile (call it Projectile 1), so it takes time to hit.
            // 5. Projectile 0 kils B. This causes the battle to be assigned a winner since both enemies are dead.
            // 6. Projectile 1 still gets to update and revives A.
            // 
            // Now, the battle is over, but the losing team still has someone living.
            if ( losingTeam != null ) {
                for (var j = 0; j < losingTeam.length; j++) {
                    losingTeam[j].removeUnitFromMap();
                };
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

        // At the time of writing this, I know this code is going to have to
        // change, but it's not worth implementing now.
        // 
        // Right now, bosses have a movement AI that lets them walk on non-
        // walkable tiles, and all summoned units follow a path right now. The
        // problem is when a boss summons a unit - the summoned unit may be
        // nowhere near a path, and the boss doesn't even have a valid
        // previousTile.
        if ( summoner.movementAI != game.MovementAI.FOLLOW_PATH ) {
            game.util.debugDisplayText('A unit was summoned and may not have a valid path.', 'unit summoned wrong');
        }

        // These point to the center of the summoner
        summonedUnit.battleData.originalX = summoner.battleData.originalX;
        summonedUnit.battleData.originalY = summoner.battleData.originalY;

        // This code would only work for units with a certain movement AI. This
        // code is needed because the unit is placed at a certain spot and tries
        // to find a new destination immediately. Then, we override its pre-
        // battle coordinates here, so once it's done moving to the original
        // spot, it will use the very-old destX and destY
        summonedUnit.destX = summoner.destX;
        summonedUnit.destY = summoner.destY;

        // Make sure the summoned unit comes from the same tile
        summonedUnit.previousTile = summoner.previousTile;
    },

    /**
     * Adds a unit to the battle. The unit being added may already be in a
     * battle (that would happen in the case where another battle was too close
     * to this one and was combined).
     * @param {Unit} unit Player or enemy unit.
     */
    window.game.Battle.prototype.addUnit = function(unit) {
        this.units.push(unit);

        if ( unit.isPlayer() ) {
            this.playerUnits.push(unit);
        } else {
            this.enemyUnits.push(unit);

            if ( unit.isBoss() ) {
                this.containsBoss = true;
            }
        }

        var numPlayers = this.playerUnits.length;
        var numEnemies = this.enemyUnits.length;

        // Figure out the order in which this player entered the battle
        var absoluteOrder = this.units.length - 1;
        var teamOrder = numEnemies - 1;
        if (unit.isPlayer()) {
            teamOrder = numPlayers - 1;
        }

        // The original coordinates should always point to the center of the
        // unit so that they're independent of the size of the unit (the centers
        // of units are what align approximately with the center of tiles).
        var originalX = unit.getCenterX();
        var originalY = unit.getCenterY();

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

            // These are the X and Y world coordinates that the unit should
            // return to if he's alive when the battle ends. The tile that these
            // correspond to is not guaranteed to be walkable if the unit was
            // moving diagonally.
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

        this.unitLayoutInvalid = true;
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
    window.game.Battle.prototype.layoutUnits = function(isPlayer) {
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
        var stagingAreaCenterY = this.centerY - (height / 2 * game.TILESIZE);

        // Base the battle-join radius on the size of the perfect square.
        var radius = (height) * game.TILESIZE;

        // If the minimum radius is too low, then you end up with lots of 1v1s.
        radius = Math.max(2 * game.TILESIZE, radius);

        if ( isPlayer ) {
            stagingAreaCenterX = this.centerX - (width * game.TILESIZE);
            this.playerCenterX = this.centerX - (height / 2) * game.TILESIZE;
            this.playerCenterY = this.centerY;
            this.playerJoinRadius = radius;
        } else {
            stagingAreaCenterX = this.centerX + 1 * game.TILESIZE;
            this.enemyCenterX = this.centerX + (height / 2) * game.TILESIZE + game.TILESIZE;
            this.enemyCenterY = this.centerY;
            this.enemyJoinRadius = radius;
        }

        // The battle with the boss should be expanded to make it easier for
        // units to join.
        if ( this.containsBoss ) {
            this.playerJoinRadius *= 1.25;
            this.enemyJoinRadius *= 1.5;
            this.enemyJoinRadius = Math.max(game.TILESIZE * 5, this.enemyJoinRadius);
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
                if ( attemptY + unitHeight > height ) {
                    attemptY = 0;
                    wrappedThisColumnAlready = true;
                }
            };

            var desiredX = attemptX * game.TILESIZE + stagingAreaCenterX;
            var desiredY = attemptY * game.TILESIZE + stagingAreaCenterY;

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
            this.debugPlayerW = width * game.TILESIZE;
            this.debugPlayerH = height * game.TILESIZE;
        }
    };

    window.game.Battle.prototype.debugDrawBattleBackground = function(ctx) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.debugPlayerX, this.debugPlayerY, this.debugPlayerW, this.debugPlayerH);
        var width = this.debugPlayerW / game.TILESIZE;
        var height = this.debugPlayerH / game.TILESIZE;
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                ctx.strokeRect(this.debugPlayerX + i * game.TILESIZE, this.debugPlayerY + j * game.TILESIZE, game.TILESIZE, game.TILESIZE);
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


        if ( this.unitLayoutInvalid ) {
            this.unitLayoutInvalid = false;
            this.layoutUnits(true);
            this.layoutUnits(false);
        }

        // Update projectiles
        for (var i = 0; i < this.projectiles.length; i++) {
            if ( !this.projectiles[i].isLiving() ) {
                this.projectiles.splice(i, 1);
                i--;
                continue;
            }

            this.projectiles[i].update(delta);

            // If that projectile won the battle, then we can stop here. We
            // especially wouldn't want a projectile in this 'for' loop to un-
            // win the battle by reviving someone.
            if ( this.isDead() ) {
                break;
            }
        };
    };

    window.game.Battle.prototype.draw = function(ctx) {
        for (var i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].draw(ctx);
        };
    };

}());