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

    // There's only one battle manager, so we'll define everything in a single
    // object.
    window.game.BattleManager = {
        battles: new Array(),

        debugDrawBattleBackground: function(ctx) {
            for (var i = this.battles.length - 1; i >= 0; i--) {
                var battle = this.battles[i];
                battle.debugDrawBattleBackground(ctx);
            }

        },

        draw: function(ctx) {
            for (var i = 0; i < this.battles.length; i++) {
                this.battles[i].draw(ctx);
            };
        },

        /**
         * Removes all battles.
         * @return {undefined}
         */
        removeAllBattles: function() {
            for (var i = 0; i < this.battles.length; i++) {
                this.battles[i].aboutToRemoveBattle();
            };
            this.battles = [];
        },

        update: function(delta) {
            // Remove dead battles first
            for (var i = 0; i < this.battles.length; i++) {
                var battle = this.battles[i];
                if ( battle.isDead() ) {

                    // If we're playing the minigame, then there should only be
                    // one battle, so winning or losing that will end the
                    // minigame.
                    if ( game.GameStateManager.isMinigameGameplay() ) {
                        if ( battle.playerWon() ) {
                            game.GameStateManager.enterMinigameWinState();
                            game.MinigameUI.wonMinigame();
                        } else {
                            game.GameStateManager.enterMinigameLoseState();
                        }
                    }
                    
                    // Don't remove battles at the end of a minigame
                    if ( !game.GameStateManager.inMinigameWinState() &&
                         !game.GameStateManager.inMinigameLoseState() ) {
                        battle.aboutToRemoveBattle();
                        this.battles.splice(i, 1);
                        i--;
                    }
                }
            };

            // Combine any battles that collide
            // Do so until there are no more colliding battles.
            while (this.combineBattles()){};

            // Update individual battles
            for (var i = 0; i < this.battles.length; i++) {
                this.battles[i].update(delta);
            };

        },

        /**
         * Combines any combinable battles. Battles are combinable when they
         * collide (see Battle.collide()).
         *
         * This is a function so that removing battles out of the list doesn't
         * cause any weird errors (we immediately return after combining)
         * 
         * @return {boolean} true if any battles were combined.
         */
        combineBattles: function() {
            var battleI;
            var battleJ;
            for (var i = this.battles.length - 1; i >= 0; i--) {
                battleI = this.battles[i];
                for (var j = this.battles.length - 1; j >= 0; j--) {
                    if ( i == j ) continue;

                    battleJ = this.battles[j];
                    if ( battleI.collidesWith(battleJ) ) {
                        // Absorb the smaller battle
                        if ( battleJ.units.length < battleI.units.length ) {
                            battleI.combineWith(battleJ);
                            this.battles.splice(j, 1); // no need for j++ after this since we return (and even if we DID j++, we'd need to change the 'for' loop end condition)
                        } else {
                            battleJ.combineWith(battleI);
                            this.battles.splice(i, 1); // see above splice comment (no need for i++)
                        }
                        return true;
                    }
                }
            }

            return false;
        },

        /**
         * This will add all placed units to a new battle at the specified
         * point. This is used by the minigame so that units don't need to walk
         * to any specific point before they'll get in a battle.
         * @param  {Number} centerX - X position in world coordinates
         * @param  {Number} centerY - Y position in world coordinates
         */
        makeBattleForPlacedUnits: function(centerX, centerY) {
            var gameUnits = game.UnitManager.gameUnits;
            var newBattle = new game.Battle(centerX, centerY);
            for (var i = 0; i < gameUnits.length; i++) {
                newBattle.addUnit(gameUnits[i]);
            };
            this.battles.push(newBattle);
        },

        checkForBattles: function(allUnits) {
            // Split units up into player and enemy units
            var playerUnits = new Array();
            var enemyUnits = new Array();
            var unit = null;
            for (var i = allUnits.length - 1; i >= 0; i--) {
                unit = allUnits[i];
                if ( unit.isPlayer() ) {
                    playerUnits.push(unit);
                } else if ( unit.isEnemy() ) {
                    enemyUnits.push(unit);
                }
                
                if ( unit.canJoinABattle() ) {
                    // Add the unit to any nearby existing battles
                    for (var j = this.battles.length - 1; j >= 0; j--) {
                        if (this.battles[j].addUnitIfCloseEnough(unit)) {
                            // The unit is now in battle, so no need to check more
                            break;
                        }
                    };
                }

            };

            // Now see if any of those units are close to each other
            var player = null;
            var enemy = null;
            var playerCenterX = null;
            var playerCenterY = null;
            var enemyCenterX = null;
            var enemyCenterY = null;
            for (var i = playerUnits.length - 1; i >= 0; i--) {
                player = playerUnits[i];

                if ( !player.canJoinABattle() ) {
                    continue;
                }

                // Only compute this once
                playerCenterX = player.getCenterX();
                playerCenterY = player.getCenterY();

                for (var j = enemyUnits.length - 1; j >= 0; j--) {
                    enemy = enemyUnits[j];
                    if ( !enemy.canJoinABattle() ) {
                        continue;
                    }

                    // Battles between two 1x1 foes will be about three tiles
                    // wide, so we start battles when they're approximately
                    // where they are after the battle was started.
                    var battleStartDistance = game.TILESIZE * 4;
                    if ( enemy.isBoss() ) {
                        battleStartDistance *= 2;
                    }

                    enemyCenterX = enemy.getCenterX();
                    enemyCenterY = enemy.getCenterY();

                    var dist = window.game.util.distance(playerCenterX, playerCenterY, enemyCenterX, enemyCenterY);

                    if (dist <= battleStartDistance) {
                        // Start a battle
                        var centerX = Math.floor((playerCenterX + enemyCenterX) / 2.0);
                        var centerY = Math.floor((playerCenterY + enemyCenterY) / 2.0);
                        var newBattle = new game.Battle(centerX, centerY);
                        newBattle.addUnit(player);
                        newBattle.addUnit(enemy);
                        this.battles.push(newBattle);
                        break;
                    }
                };
            };
        }
    };
}()); 