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

        update: function(delta) {
            // Remove dead battles first
            for (var i = 0; i < this.battles.length; i++) {
                if ( this.battles[i].isDead() ) {
                    this.battles[i].aboutToRemoveBattle();
                    this.battles.splice(i, 1);
                    i--;
                }
            };

            // Combine any battles that collide
            // Do so until there are no more colliding battles.
            while (this.combineBattles()){};

            // Update individual battles
            for (var i = this.battles.length - 1; i >= 0; i--) {
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

        checkForBattles: function(allUnits) {
            // Split units up into player and enemy units
            var playerUnits = new Array();
            var enemyUnits = new Array();
            var unit = null;
            for (var i = allUnits.length - 1; i >= 0; i--) {
                unit = allUnits[i];
                if ( unit.isPlayer ) {
                    playerUnits.push(unit);
                } else {
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

                    enemyCenterX = enemy.getCenterX();
                    enemyCenterY = enemy.getCenterY();

                    var dist = window.game.util.distance(playerCenterX, playerCenterY, enemyCenterX, enemyCenterY);

                    // Battles between two 1x1 foes will be about three tiles
                    // wide, so we start battles when they're approximately
                    // where they are after the battle was started.
                    if (dist <= tileSize * 4) {
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